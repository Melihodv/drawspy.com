import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Player } from '@drawspy/shared';
import { generateId } from '@drawspy/game-engine';
import type { RoomStore } from '../../store/RoomStore.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const RECONNECT_GRACE_MS = 30_000; // 30s to reconnect

export async function handleJoinRoom(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore,
  data: { roomCode: string; nickname: string; avatarId: number; sessionToken: string }
): Promise<void> {
  const { roomCode, nickname, avatarId, sessionToken } = data;
  const code = roomCode.toUpperCase().trim();

  const sr = store.getRoom(code);
  if (!sr) {
    socket.emit('error', { code: 'ROOM_NOT_FOUND', message: 'Room not found.' });
    return;
  }

  // ─── Reconnect existing player ─────────────────────────────────────────────
  const existing = store.getPlayerBySession(code, sessionToken);
  if (existing) {
    store.cancelDisconnect(code, existing.id);
    store.updatePlayerStatus(code, existing.id, 'connected');
    store.registerSocket(code, socket.id, existing.id);
    (socket as any).roomCode = code;
    await socket.join(code);

    const gameState = store.getGameState(code);
    const myRole = store.getSpyIds(code).includes(existing.id) ? 'spy' as const : 'normal' as const;
    const myWord = myRole === 'normal' ? store.getSecretWord(code) : null;

    // Send full state to reconnecting player
    socket.emit('room_state', { room: sr.room });
    socket.emit('reconnect_state', {
      gameState: gameState!,
      myRole,
      myWord,
    });
    io.to(code).emit('player_reconnected', { playerId: existing.id });
    return;
  }

  // ─── Game in progress — no new joins ──────────────────────────────────────
  if (sr.room.status === 'playing') {
    socket.emit('error', { code: 'GAME_ALREADY_STARTED', message: 'Game already in progress.' });
    return;
  }

  if (sr.room.status === 'finished') {
    socket.emit('error', { code: 'GAME_ALREADY_STARTED', message: 'This game has ended.' });
    return;
  }

  // ─── Room full ─────────────────────────────────────────────────────────────
  if (sr.room.players.length >= sr.room.settings.maxPlayers) {
    socket.emit('error', { code: 'ROOM_FULL', message: 'Room is full.' });
    return;
  }

  // ─── Validate nickname ─────────────────────────────────────────────────────
  const cleanNick = nickname.trim().slice(0, 20);
  if (cleanNick.length < 1) {
    socket.emit('error', { code: 'INVALID_NICKNAME', message: 'Nickname required.' });
    return;
  }

  // ─── Check for host joining via REST+socket combo ─────────────────────────
  // The host created the room via REST and has a valid playerId+sessionToken stored client-side.
  // They won't match existing session (handled above), so they arrive here as "new" player.
  // We must check if this session belongs to the host player created in REST.
  const hostPlayer = sr.room.players.find((p) => p.isHost);
  if (hostPlayer && hostPlayer.sessionToken === sessionToken) {
    // Host is reconnecting via socket (already in room from REST)
    store.cancelDisconnect(code, hostPlayer.id);
    store.updatePlayerStatus(code, hostPlayer.id, 'connected');
    store.registerSocket(code, socket.id, hostPlayer.id);
    (socket as any).roomCode = code;
    await socket.join(code);
    socket.emit('room_state', { room: sr.room });
    return;
  }

  // ─── New player ────────────────────────────────────────────────────────────
  const newPlayer: Player = {
    id: generateId(),
    nickname: cleanNick,
    avatarId: Math.max(0, Math.min(25, avatarId)),
    sessionToken,
    score: 0,
    status: 'connected',
    isHost: false,
    joinedAt: Date.now(),
  };

  const added = store.addPlayer(code, newPlayer);
  if (!added) {
    socket.emit('error', { code: 'ROOM_FULL', message: 'Room is full.' });
    return;
  }

  store.registerSocket(code, socket.id, newPlayer.id);
  (socket as any).roomCode = code;
  await socket.join(code);

  // Tell the new player the full room state first
  socket.emit('room_state', { room: sr.room });
  // Then tell everyone about the new player
  io.to(code).emit('player_joined', { player: newPlayer });
}
