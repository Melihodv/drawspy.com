import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../store/RoomStore.js';
import { handleJoinRoom } from './handlers/joinRoom.js';
import { handleDrawEvents } from './handlers/drawing.js';
import { handleVoting } from './handlers/voting.js';
import { handleChat } from './handlers/chat.js';
import { handleDisconnect } from './handlers/disconnect.js';
import { handleStartGame, finalizeRound } from './handlers/startGame.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function registerSocketHandlers(io: GameServer, store: RoomStore): void {
  io.on('connection', (socket: GameSocket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    socket.on('join_room', (data) => handleJoinRoom(io, socket, store, data));
    socket.on('start_game', () => handleStartGame(io, socket, store));
    socket.on('draw_begin', (data) => handleDrawEvents.begin(io, socket, store, data));
    socket.on('draw_points', (data) => handleDrawEvents.points(io, socket, store, data));
    socket.on('draw_end', (data) => handleDrawEvents.end(io, socket, store, data));
    socket.on('draw_undo', () => handleDrawEvents.undo(io, socket, store));
    socket.on('submit_vote', (data) => handleVoting(io, socket, store, data));
    socket.on('submit_spy_guess', (data) => handleSpyGuess(io, socket, store, data));
    socket.on('send_chat', (data) => handleChat(io, socket, store, data));
    socket.on('leave_room', () => handleLeave(io, socket, store));
    socket.on('disconnect', () => handleDisconnect(io, socket, store));
    socket.on('kick_player', (data) => handleKick(io, socket, store, data));
    socket.on('update_settings', (data) => handleSettings(io, socket, store, data));
    socket.on('request_restart', () => handleRestart(io, socket, store));
  });
}

// ─── Spy Guess ───────────────────────────────────────────────────────────────
function handleSpyGuess(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore,
  data: { guess: string }
): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;

  const sr = store.getRoom(roomCode);
  if (!sr) return;
  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (!playerId) return;

  // Only spy can guess
  if (!store.getSpyIds(roomCode).includes(playerId)) return;
  if (sr.gameState.phase !== 'SPY_GUESS') return;

  store.clearPhaseTimer(roomCode);
  const result = store.processSpyGuess(roomCode, data.guess);
  if (!result) return;

  io.to(roomCode).emit('spy_guess_result', {
    guess: data.guess,
    correct: result.correct,
    secretWord: result.secretWord,
  });

  // Auto-advance to round finalize after 2s
  setTimeout(() => {
    const votes = store.getPendingVotes(roomCode);
    finalizeRound(io, store, roomCode, {
      votes,
      spyCaught: true,
      spyGuessedCorrectly: result.correct,
    });
  }, 2000);
}

// ─── Leave ────────────────────────────────────────────────────────────────────
function handleLeave(io: GameServer, socket: GameSocket, store: RoomStore): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;
  const playerId = store.unregisterSocket(roomCode, socket.id);
  if (playerId) {
    store.removePlayer(roomCode, playerId);
    socket.leave(roomCode);
    const sr = store.getRoom(roomCode);
    if (sr) {
      io.to(roomCode).emit('player_left', { playerId });
      io.to(roomCode).emit('room_state', { room: sr.room });
      if (sr.room.players.length === 0) {
        store.deleteRoom(roomCode);
      }
    }
  }
}

// ─── Kick ─────────────────────────────────────────────────────────────────────
function handleKick(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore,
  data: { targetId: string }
): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;
  const sr = store.getRoom(roomCode);
  if (!sr) return;
  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (sr.room.hostId !== playerId) return;

  io.to(roomCode).emit('player_kicked', { playerId: data.targetId });
  store.removePlayer(roomCode, data.targetId);
  io.to(roomCode).emit('room_state', { room: sr.room });
}

// ─── Settings ────────────────────────────────────────────────────────────────
function handleSettings(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore,
  data: Partial<import('@drawspy/shared').RoomSettings>
): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;
  const sr = store.getRoom(roomCode);
  if (!sr) return;
  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (sr.room.hostId !== playerId) return;

  sr.room.settings = { ...sr.room.settings, ...data };
  // Broadcast to all including sender
  io.to(roomCode).emit('settings_updated', { settings: sr.room.settings });
}

// ─── Restart ─────────────────────────────────────────────────────────────────
function handleRestart(io: GameServer, socket: GameSocket, store: RoomStore): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;
  const sr = store.getRoom(roomCode);
  if (!sr) return;
  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (sr.room.hostId !== playerId) return;

  store.clearPhaseTimer(roomCode);
  sr.room.status = 'waiting';
  sr.gameState.phase = 'ROOM_WAITING';
  sr.gameState.round = null;
  sr.roundHistory = [];
  store.clearPendingVotes(roomCode);
  Object.keys(sr.gameState.scores).forEach((id) => (sr.gameState.scores[id] = 0));

  io.to(roomCode).emit('room_state', { room: sr.room });
}
