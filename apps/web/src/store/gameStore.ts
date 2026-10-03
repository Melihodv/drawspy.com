'use client';

import { create } from 'zustand';
import type {
  Room,
  Player,
  GameState,
  GamePhase,
  Stroke,
  Vote,
  VoteResult,
  RoundSummary,
  Role,
} from '@drawspy/shared';

interface ChatMessage {
  playerId: string;
  nickname: string;
  text: string;
  timestamp: number;
}

import type { LanguageCode } from '@/utils/i18n';

interface GameStore {
  // ─── Connection & i18n
  language: LanguageCode;
  connected: boolean;
  sessionToken: string | null;
  myPlayerId: string | null;
  setLanguage: (lang: LanguageCode) => void;

  // ─── Room
  room: Room | null;
  myRole: Role | null;
  myWord: string | null;
  myCategoryHint: string | null;

  // ─── Game
  gameState: GameState | null;
  phase: GamePhase;
  phaseEndsAt: number | null;

  // ─── Drawing
  strokes: Stroke[];
  activePlayerId: string | null;

  // ─── Voting
  myVote: string | null;
  voteProgress: { votedCount: number; totalCount: number } | null;
  voteResult: VoteResult | null;

  // ─── Spy guess
  spyGuessResult: { guess: string; correct: boolean; secretWord: string } | null;

  // ─── Results
  roundSummary: RoundSummary | null;
  finalScores: Record<string, number> | null;
  winnerId: string | null;
  roundHistory: RoundSummary[];

  // ─── Chat
  chatMessages: ChatMessage[];

  // ─── Error
  error: { code: string; message: string } | null;

  // ─── Actions
  setConnected: (connected: boolean) => void;
  setSessionToken: (token: string) => void;
  setMyPlayerId: (id: string) => void;
  setRoom: (room: Room) => void;
  updatePlayer: (player: Player) => void;
  removePlayer: (playerId: string) => void;
  setMyRole: (role: Role, word: string | null, categoryHint: string | null) => void;
  setPhase: (phase: GamePhase, endsAt?: number) => void;
  setActivePlayer: (playerId: string | null) => void;
  addStroke: (stroke: Stroke) => void;
  mergeStroke: (partial: Stroke) => void;
  removeStroke: (strokeId: string) => void;
  setMyVote: (targetId: string) => void;
  setVoteProgress: (progress: { votedCount: number; totalCount: number }) => void;
  setVoteResult: (result: VoteResult) => void;
  setSpyGuessResult: (result: { guess: string; correct: boolean; secretWord: string }) => void;
  setRoundSummary: (summary: RoundSummary, scores: Record<string, number>) => void;
  setGameFinished: (scores: Record<string, number>, winnerId: string, history: RoundSummary[]) => void;
  addChatMessage: (msg: ChatMessage) => void;
  setError: (error: { code: string; message: string } | null) => void;
  resetRound: () => void;
  resetGame: () => void;
}

export const useGameStore = create<GameStore>((set, get) => ({
  language: 'tr',
  connected: false,
  sessionToken: null,
  myPlayerId: null,
  setLanguage: (lang) => set({ language: lang }),
  room: null,
  myRole: null,
  myWord: null,
  myCategoryHint: null,
  gameState: null,
  phase: 'ROOM_WAITING',
  phaseEndsAt: null,
  strokes: [],
  activePlayerId: null,
  myVote: null,
  voteProgress: null,
  voteResult: null,
  spyGuessResult: null,
  roundSummary: null,
  finalScores: null,
  winnerId: null,
  roundHistory: [],
  chatMessages: [],
  error: null,

  setConnected: (connected) => set({ connected }),
  setSessionToken: (sessionToken) => set({ sessionToken }),
  setMyPlayerId: (myPlayerId) => set({ myPlayerId }),

  setRoom: (room) => set({ room }),

  updatePlayer: (player) =>
    set((state) => ({
      room: state.room
        ? {
            ...state.room,
            players: state.room.players.some((p) => p.id === player.id)
              ? state.room.players.map((p) => (p.id === player.id ? player : p))
              : [...state.room.players, player],
          }
        : null,
    })),

  removePlayer: (playerId) =>
    set((state) => ({
      room: state.room
        ? { ...state.room, players: state.room.players.filter((p) => p.id !== playerId) }
        : null,
    })),

  setMyRole: (myRole, myWord, myCategoryHint) => set({ myRole, myWord, myCategoryHint }),

  setPhase: (phase, phaseEndsAt) => set({ phase, phaseEndsAt: phaseEndsAt ?? null }),

  setActivePlayer: (activePlayerId) => set({ activePlayerId }),

  addStroke: (stroke) =>
    set((state) => {
      // Upsert: replace if strokeId exists, otherwise append
      const idx = state.strokes.findIndex((s) => s.strokeId === stroke.strokeId);
      if (idx >= 0) {
        const next = [...state.strokes];
        next[idx] = stroke;
        return { strokes: next };
      }
      return { strokes: [...state.strokes, stroke] };
    }),

  mergeStroke: (partial) =>
    set((state) => {
      // Merge new points into existing stroke, or create a new entry
      const idx = state.strokes.findIndex((s) => s.strokeId === partial.strokeId);
      if (idx >= 0) {
        const next = [...state.strokes];
        next[idx] = {
          ...next[idx],
          points: [...next[idx].points, ...partial.points],
        };
        return { strokes: next };
      }
      // First batch for this stroke
      return { strokes: [...state.strokes, partial] };
    }),

  removeStroke: (strokeId) =>
    set((state) => ({ strokes: state.strokes.filter((s) => s.strokeId !== strokeId) })),

  setMyVote: (myVote) => set({ myVote }),

  setVoteProgress: (voteProgress) => set({ voteProgress }),

  setVoteResult: (voteResult) => set({ voteResult }),

  setSpyGuessResult: (spyGuessResult) => set({ spyGuessResult }),

  setRoundSummary: (roundSummary, scores) =>
    set((state) => ({
      roundSummary,
      room: state.room
        ? {
            ...state.room,
            players: state.room.players.map((p) => ({
              ...p,
              score: scores[p.id] ?? p.score,
            })),
          }
        : null,
    })),

  setGameFinished: (finalScores, winnerId, roundHistory) =>
    set({ finalScores, winnerId, roundHistory, phase: 'GAME_RESULTS' }),

  addChatMessage: (msg) =>
    set((state) => ({
      chatMessages: [...state.chatMessages.slice(-99), msg],
    })),

  setError: (error) => set({ error }),

  resetRound: () =>
    set({
      strokes: [],
      activePlayerId: null,
      myVote: null,
      voteProgress: null,
      voteResult: null,
      spyGuessResult: null,
      roundSummary: null,
      myRole: null,
      myWord: null,
      myCategoryHint: null,
    }),

  resetGame: () =>
    set({
      phase: 'ROOM_WAITING',
      phaseEndsAt: null,
      strokes: [],
      activePlayerId: null,
      myVote: null,
      voteProgress: null,
      voteResult: null,
      spyGuessResult: null,
      roundSummary: null,
      finalScores: null,
      winnerId: null,
      roundHistory: [],
      myRole: null,
      myWord: null,
      myCategoryHint: null,
      chatMessages: [],
      error: null,
    }),
}));
