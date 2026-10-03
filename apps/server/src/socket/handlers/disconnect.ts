import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const DISCONNECT_GRACE_MS = 30_000;

export function handleDisconnect(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore
): void {
  const roomCode = (socket as any).roomCode as string | undefined;

  // Use stored roomCode OR fall back to searching all rooms
  const found = roomCode
    ? { code: roomCode, playerId: store.getPlayerIdBySocket(roomCode, socket.id) ?? '' }
    : store.findRoomBySocket(socket.id) ?? { code: '', playerId: '' };

  if (!found.code || !found.playerId) return;

  const { code, playerId } = found;

  store.unregisterSocket(code, socket.id);
  store.updatePlayerStatus(code, playerId, 'disconnected');

  io.to(code).emit('player_left', { playerId });

  // Grace period — if they reconnect within window, restore session
  store.scheduleDisconnect(code, playerId, DISCONNECT_GRACE_MS, () => {
    const sr = store.getRoom(code);
    if (!sr) return;

    store.removePlayer(code, playerId);
    io.to(code).emit('room_state', { room: sr.room });

    // Clean up empty rooms
    if (sr.room.players.length === 0) {
      store.deleteRoom(code);
    }
  });

  console.log(`⚡ ${playerId} disconnected from ${code}, grace period started (${DISCONNECT_GRACE_MS / 1000}s)`);
}
