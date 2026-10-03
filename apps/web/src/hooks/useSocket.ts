'use client';

import { useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import type { ClientToServerEvents, ServerToClientEvents, Stroke } from '@drawspy/shared';
import { useGameStore } from '@/store/gameStore';

type GameSocket = Socket<ServerToClientEvents, ClientToServerEvents>;

let socket: GameSocket | null = null;

export function getSocket(): GameSocket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001', {
      transports: ['websocket', 'polling'],
      autoConnect: false,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 10,
    });
  }
  return socket;
}

export function useSocket() {
  const store = useGameStore();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const s = getSocket();

    s.on('connect', () => {
      store.setConnected(true);
      console.log('🔌 Socket connected:', s.id);
    });

    s.on('disconnect', (reason) => {
      store.setConnected(false);
      console.log('⚡ Socket disconnected:', reason);
    });

    s.on('room_state', ({ room }) => {
      store.setRoom(room);
    });

    s.on('player_joined', ({ player }) => {
      store.updatePlayer(player);
    });

    s.on('player_left', ({ playerId }) => {
      store.removePlayer(playerId);
    });

    s.on('player_reconnected', ({ playerId }) => {
      // Update status to connected
      const room = store.room;
      if (room) {
        const player = room.players.find((p) => p.id === playerId);
        if (player) store.updatePlayer({ ...player, status: 'connected' });
      }
    });

    s.on('host_changed', ({ newHostId }) => {
      const room = store.room;
      if (room) {
        store.setRoom({
          ...room,
          hostId: newHostId,
          players: room.players.map((p) => ({ ...p, isHost: p.id === newHostId })),
        });
      }
    });

    s.on('game_started', () => {
      store.resetGame();
      store.setPhase('ROUND_STARTING');
    });

    s.on('round_started', ({ round }) => {
      store.resetRound();
      store.setPhase('ROLE_REVEAL');
    });

    s.on('role_received', ({ role, word, category, categoryHint }) => {
      store.setMyRole(role, word, categoryHint);
    });

    s.on('turn_started', ({ playerId, turnIndex, phaseEndsAt }) => {
      store.setPhase('DRAWING', phaseEndsAt);
      store.setActivePlayer(playerId);
    });

    // draw_update carries PARTIAL stroke (only new points from this batch)
    // We merge into existing stroke or create new entry
    s.on('draw_update', ({ stroke: partial }) => {
      store.mergeStroke(partial);
    });

    s.on('draw_undo_applied', ({ playerId, strokeId }) => {
      store.removeStroke(strokeId);
    });

    s.on('turn_ended', ({ playerId }) => {
      // nothing — next event (turn_started or discussion_started) will come
    });

    s.on('discussion_started', ({ phaseEndsAt }) => {
      store.setPhase('DISCUSSION', phaseEndsAt);
    });

    s.on('voting_started', ({ phaseEndsAt }) => {
      store.setPhase('VOTING', phaseEndsAt);
    });

    s.on('vote_progress', (progress) => {
      store.setVoteProgress(progress);
    });

    s.on('vote_result', (result) => {
      store.setVoteResult(result);
      store.setPhase('VOTE_RESULTS');
    });

    s.on('spy_guess_started', ({ spyId, phaseEndsAt }) => {
      store.setPhase('SPY_GUESS', phaseEndsAt);
    });

    s.on('spy_guess_result', (result) => {
      store.setSpyGuessResult(result);
    });

    s.on('round_finished', ({ summary, scores }) => {
      store.setRoundSummary(summary, scores);
      store.setPhase('ROUND_RESULTS');
    });

    s.on('game_finished', ({ finalScores, winnerId, history }) => {
      store.setGameFinished(finalScores, winnerId, history);
    });

    s.on('chat_message', (msg) => {
      store.addChatMessage(msg);
    });

    s.on('reconnect_state', ({ gameState, myRole, myWord }) => {
      // Full state restore: reset strokes then re-add from server
      store.resetRound();
      store.setMyRole(myRole, myWord, null);
      store.setPhase(gameState.phase, gameState.round?.phaseEndsAt ?? undefined);
      if (gameState.round?.currentTurnPlayerId) {
        store.setActivePlayer(gameState.round.currentTurnPlayerId);
      }
      if (gameState.round?.strokes) {
        // Restore all strokes as complete strokes
        gameState.round.strokes.forEach((stroke: Stroke) => store.addStroke(stroke));
      }
    });

    s.on('settings_updated', ({ settings }) => {
      const room = store.room;
      if (room) store.setRoom({ ...room, settings });
    });

    s.on('player_kicked', ({ playerId }) => {
      if (playerId === store.myPlayerId) {
        store.setError({ code: 'KICKED', message: 'You were kicked from the room.' });
      } else {
        store.removePlayer(playerId);
      }
    });

    s.on('error', (err) => {
      store.setError(err);
    });

    s.connect();

    return () => {
      s.removeAllListeners();
      s.disconnect();
      socket = null;
      initialized.current = false;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return getSocket();
}
