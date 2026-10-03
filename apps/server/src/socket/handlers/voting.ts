import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, Vote } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
import { finalizeVotes } from './startGame.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function handleVoting(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore,
  data: { targetId: string }
): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;

  const sr = store.getRoom(roomCode);
  if (!sr) return;
  if (sr.gameState.phase !== 'VOTING') return;

  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (!playerId) return;

  // Can't vote for yourself
  if (data.targetId === playerId) {
    socket.emit('error', { code: 'INVALID_VOTE', message: "You can't vote for yourself." });
    return;
  }

  // Target must be in room
  const target = sr.room.players.find((p) => p.id === data.targetId);
  if (!target) {
    socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'Player not found.' });
    return;
  }

  // Use store's vote management (handles de-dupe & change)
  const existingVotes = store.getPendingVotes(roomCode);
  const existingIdx = existingVotes.findIndex((v) => v.voterId === playerId);
  const vote: Vote = { voterId: playerId, targetId: data.targetId, submittedAt: Date.now() };

  if (existingIdx >= 0) {
    // Update existing vote (allowed to change before timer ends)
    existingVotes[existingIdx] = vote;
  } else {
    store.addVote(roomCode, vote);
  }

  const updatedVotes = store.getPendingVotes(roomCode);
  const eligibleVoters = sr.room.players.filter((p) => p.status === 'connected').length;

  // Broadcast vote progress (count only, not who voted for whom)
  io.to(roomCode).emit('vote_progress', {
    votedCount: updatedVotes.length,
    totalCount: eligibleVoters,
  });

  // Auto-finalize if everyone voted
  if (updatedVotes.length >= eligibleVoters) {
    store.clearPhaseTimer(roomCode);
    finalizeVotes(io, store, roomCode);
  }
}
