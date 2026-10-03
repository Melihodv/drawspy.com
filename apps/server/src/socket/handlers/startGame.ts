import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

export function handleStartGame(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore
): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;

  const sr = store.getRoom(roomCode);
  if (!sr) return;

  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (sr.room.hostId !== playerId) {
    socket.emit('error', { code: 'NOT_HOST', message: 'Only the host can start the game.' });
    return;
  }

  const minPlayers = process.env.NODE_ENV === 'development' ? 1 : 3;
  if (sr.room.players.filter((p) => p.status === 'connected').length < minPlayers) {
    socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: `Need at least ${minPlayers} player(s).` });
    return;
  }

  const result = store.startGame(roomCode);
  if (!result) {
    socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'Failed to start game.' });
    return;
  }

  io.to(roomCode).emit('game_started');
  startRound(io, socket, store, roomCode, result.spyAssignments);
}

export function startRound(
  io: GameServer,
  _socket: GameSocket | null,
  store: RoomStore,
  roomCode: string,
  assignments: Map<string, 'spy' | 'normal'>
): void {
  const sr = store.getRoom(roomCode);
  if (!sr?.gameState.round) return;

  const round = sr.gameState.round;

  io.to(roomCode).emit('round_started', {
    round: {
      roundNumber: round.roundNumber,
      totalRounds: round.totalRounds,
      turnOrder: round.turnOrder,
      category: round.category,
    },
  });

  // Send private role to each player
  sr.room.players.forEach((player) => {
    const playerRole = assignments.get(player.id) ?? 'normal';
    const word = playerRole === 'normal' ? store.getSecretWord(roomCode) : null;

    // Find socket for this player
    sr.connectedSockets.forEach((pid, sid) => {
      if (pid === player.id) {
        io.to(sid).emit('role_received', {
          role: playerRole,
          word,
          category: round.category,
          categoryHint: playerRole === 'spy' ? round.categoryHint : null,
        });
      }
    });
  });

  // Start role reveal phase — auto-start drawing after 5s
  setTimeout(() => {
    beginDrawingTurn(io, store, roomCode);
  }, 5000);
}

export function beginDrawingTurn(
  io: GameServer,
  store: RoomStore,
  roomCode: string
): void {
  const sr = store.getRoom(roomCode);
  if (!sr?.gameState.round) return;

  store.setPhase(roomCode, 'DRAWING');
  const round = sr.gameState.round;
  const settings = sr.room.settings;
  const phaseEndsAt = Date.now() + settings.drawingTimeSec * 1000;
  round.phaseEndsAt = phaseEndsAt;

  io.to(roomCode).emit('turn_started', {
    playerId: round.currentTurnPlayerId,
    turnIndex: round.currentTurnIndex,
    phaseEndsAt,
  });

  store.clearPhaseTimer(roomCode);
  const timer = setTimeout(() => {
    endCurrentTurn(io, store, roomCode);
  }, settings.drawingTimeSec * 1000);
  store.setPhaseTimer(roomCode, timer);
}

export function endCurrentTurn(
  io: GameServer,
  store: RoomStore,
  roomCode: string
): void {
  const sr = store.getRoom(roomCode);
  if (!sr?.gameState.round) return;

  const currentPlayer = sr.gameState.round.currentTurnPlayerId;
  io.to(roomCode).emit('turn_ended', { playerId: currentPlayer });

  const { nextPlayerId, isLastTurn } = store.advanceTurn(roomCode);

  if (isLastTurn) {
    startDiscussion(io, store, roomCode);
  } else if (nextPlayerId) {
    beginDrawingTurn(io, store, roomCode);
  }
}

function startDiscussion(io: GameServer, store: RoomStore, roomCode: string): void {
  const sr = store.getRoom(roomCode);
  if (!sr) return;

  store.setPhase(roomCode, 'DISCUSSION');
  const phaseEndsAt = Date.now() + sr.room.settings.discussionTimeSec * 1000;

  io.to(roomCode).emit('discussion_started', { phaseEndsAt });

  const timer = setTimeout(() => {
    startVoting(io, store, roomCode);
  }, sr.room.settings.discussionTimeSec * 1000);
  store.setPhaseTimer(roomCode, timer);
}

export function startVoting(io: GameServer, store: RoomStore, roomCode: string): void {
  const sr = store.getRoom(roomCode);
  if (!sr) return;

  store.setPhase(roomCode, 'VOTING');
  store.clearPendingVotes(roomCode); // fresh slate for this vote
  const phaseEndsAt = Date.now() + sr.room.settings.votingTimeSec * 1000;

  io.to(roomCode).emit('voting_started', { phaseEndsAt });

  const timer = setTimeout(() => {
    finalizeVotes(io, store, roomCode);
  }, sr.room.settings.votingTimeSec * 1000);
  store.setPhaseTimer(roomCode, timer);
}

export function finalizeVotes(io: GameServer, store: RoomStore, roomCode: string): void {
  const sr = store.getRoom(roomCode);
  if (!sr) return;

  store.clearPhaseTimer(roomCode);
  const votes = store.getPendingVotes(roomCode);

  const processed = store.processVotes(roomCode, votes);
  if (!processed) return;

  const { result, spyId, spyCaught } = processed;

  store.setPhase(roomCode, 'VOTE_RESULTS');
  io.to(roomCode).emit('vote_result', {
    votes,
    mostVotedId: result.mostVotedId,
    isTie: result.isTie,
    tiedPlayerIds: result.tiedPlayerIds,
    spyId,
    spyCaught,
  });

  if (spyCaught) {
    // Give spy a chance to guess — after 2s delay to show vote result
    setTimeout(() => {
      store.setPhase(roomCode, 'SPY_GUESS');
      const phaseEndsAt = Date.now() + 12_000;
      io.to(roomCode).emit('spy_guess_started', { spyId, phaseEndsAt });

      const timer = setTimeout(() => {
        finalizeRound(io, store, roomCode, { votes, spyCaught: true, spyGuessedCorrectly: false });
      }, 12_000);
      store.setPhaseTimer(roomCode, timer);
    }, 2500);
  } else {
    // Auto-advance to round results after 3s
    setTimeout(() => {
      finalizeRound(io, store, roomCode, { votes, spyCaught: false, spyGuessedCorrectly: false });
    }, 3000);
  }
}

export function finalizeRound(
  io: GameServer,
  store: RoomStore,
  roomCode: string,
  params: { votes: any[]; spyCaught: boolean; spyGuessedCorrectly: boolean }
): void {
  store.clearPhaseTimer(roomCode);
  const summary = store.finalizeRound(roomCode, params);
  if (!summary) return;

  const scores = store.getScores(roomCode);
  store.setPhase(roomCode, 'ROUND_RESULTS');
  io.to(roomCode).emit('round_finished', { summary, scores });

  const isGameOver = store.isGameOver(roomCode);

  if (isGameOver) {
    // Show round results for 4s then game results
    setTimeout(() => {
      const winnerId = store.getWinnerId(roomCode) ?? '';
      const sr = store.getRoom(roomCode);
      store.setPhase(roomCode, 'GAME_RESULTS');
      io.to(roomCode).emit('game_finished', {
        finalScores: scores,
        winnerId,
        history: sr?.gameState.roundHistory ?? [],
      });
      const room = store.getRoom(roomCode);
      if (room) room.room.status = 'finished';
    }, 4000);
  } else {
    // Show round results for 4s then start next round
    setTimeout(() => {
      const sr = store.getRoom(roomCode);
      if (!sr) return;
      const result = store.startNextRound(roomCode);
      if (!result) return;
      startRound(io, null, store, roomCode, result.spyAssignments);
    }, 4000);
  }
}
