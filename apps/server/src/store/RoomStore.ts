import type {
  Room,
  Player,
  RoomSettings,
  GameState,
  Round,
  Stroke,
  Vote,
  RoundSummary,
} from '@drawspy/shared';
import { DEFAULT_SETTINGS } from '@drawspy/shared';
import {
  generateRoomCode,
  generateId,
  assignRoles,
  calculateSpyCount,
  tallyVotes,
  calculateScores,
  secureshuffle,
  checkSpyGuess,
} from '@drawspy/game-engine';
import { pickWord } from '@drawspy/words';

// ─── Internal Server Room (contains secret data never sent to clients) ────────
export interface ServerRoom {
  room: Room;
  gameState: GameState;
  secretWord: string | null;
  spyIds: string[];
  recentWordIds: string[];
  turnTimer: NodeJS.Timeout | null;
  roundHistory: RoundSummary[];
  votePhaseTimer: NodeJS.Timeout | null;
  connectedSockets: Map<string, string>; // socketId → playerId
  disconnectTimers: Map<string, NodeJS.Timeout>; // playerId → timer
  pendingVotes: Vote[]; // collected votes for current round
}

export class RoomStore {
  private rooms = new Map<string, ServerRoom>();

  // ─── Room Lifecycle ─────────────────────────────────────────────────────────

  createRoom(host: Player, settings?: Partial<RoomSettings>): ServerRoom {
    const code = this.generateUniqueCode();
    const mergedSettings: RoomSettings = { ...DEFAULT_SETTINGS, ...settings };

    const room: Room = {
      id: generateId(),
      code,
      name: `${host.nickname}'s Room`,
      hostId: host.id,
      players: [host],
      settings: mergedSettings,
      status: 'waiting',
      createdAt: Date.now(),
    };

    const gameState: GameState = {
      gameId: generateId(),
      roomCode: code,
      phase: 'ROOM_WAITING',
      round: null,
      players: [host],
      scores: { [host.id]: 0 },
      roundHistory: [],
    };

    const serverRoom: ServerRoom = {
      room,
      gameState,
      secretWord: null,
      spyIds: [],
      recentWordIds: [],
      turnTimer: null,
      roundHistory: [],
      votePhaseTimer: null,
      connectedSockets: new Map(),
      disconnectTimers: new Map(),
      pendingVotes: [],
    };

    this.rooms.set(code, serverRoom);
    // Cleanup after 30 min if never started and players left
    this.scheduleCleanup(code, 30 * 60 * 1000);
    return serverRoom;
  }

  getRoom(code: string): ServerRoom | undefined {
    return this.rooms.get(code);
  }

  findPublicWaitingRoom(): ServerRoom | undefined {
    let bestCandidate: ServerRoom | undefined = undefined;

    for (const sr of this.rooms.values()) {
      if (
        !sr.room.settings.isPrivate &&
        sr.gameState.phase === 'ROOM_WAITING' &&
        sr.room.status === 'waiting' &&
        sr.room.players.length < sr.room.settings.maxPlayers
      ) {
        if (!bestCandidate || sr.room.players.length > bestCandidate.room.players.length) {
          bestCandidate = sr;
        }
      }
    }

    return bestCandidate;
  }

  deleteRoom(code: string): void {
    const sr = this.rooms.get(code);
    if (sr) {
      if (sr.turnTimer) clearTimeout(sr.turnTimer);
      if (sr.votePhaseTimer) clearTimeout(sr.votePhaseTimer);
      sr.disconnectTimers.forEach((t) => clearTimeout(t));
    }
    this.rooms.delete(code);
  }

  // ─── Player Management ──────────────────────────────────────────────────────

  addPlayer(code: string, player: Player): boolean {
    const sr = this.rooms.get(code);
    if (!sr) return false;

    // Allow joining only in waiting state for new players
    if (sr.room.status !== 'waiting') return false;
    if (sr.room.players.length >= sr.room.settings.maxPlayers) return false;

    sr.room.players.push(player);
    sr.gameState.players.push(player);
    sr.gameState.scores[player.id] = 0;
    return true;
  }

  removePlayer(code: string, playerId: string): void {
    const sr = this.rooms.get(code);
    if (!sr) return;
    sr.room.players = sr.room.players.filter((p) => p.id !== playerId);
    sr.gameState.players = sr.gameState.players.filter((p) => p.id !== playerId);

    // Host migration
    if (sr.room.hostId === playerId && sr.room.players.length > 0) {
      const next = [...sr.room.players].sort((a, b) => a.joinedAt - b.joinedAt)[0];
      sr.room.hostId = next.id;
      next.isHost = true;
    }
  }

  updatePlayerStatus(code: string, playerId: string, status: Player['status']): void {
    const sr = this.rooms.get(code);
    if (!sr) return;
    const p = sr.room.players.find((x) => x.id === playerId);
    if (p) p.status = status;
    const gp = sr.gameState.players.find((x) => x.id === playerId);
    if (gp) gp.status = status;
  }

  getPlayerBySession(code: string, sessionToken: string): Player | undefined {
    return this.rooms.get(code)?.room.players.find((p) => p.sessionToken === sessionToken);
  }

  registerSocket(code: string, socketId: string, playerId: string): void {
    this.rooms.get(code)?.connectedSockets.set(socketId, playerId);
  }

  unregisterSocket(code: string, socketId: string): string | undefined {
    const sr = this.rooms.get(code);
    if (!sr) return undefined;
    const playerId = sr.connectedSockets.get(socketId);
    sr.connectedSockets.delete(socketId);
    return playerId;
  }

  getPlayerIdBySocket(code: string, socketId: string): string | undefined {
    return this.rooms.get(code)?.connectedSockets.get(socketId);
  }

  /** Find which room a socket belongs to (searches all rooms) */
  findRoomBySocket(socketId: string): { code: string; playerId: string } | undefined {
    for (const [code, sr] of this.rooms) {
      const playerId = sr.connectedSockets.get(socketId);
      if (playerId) return { code, playerId };
    }
    return undefined;
  }

  scheduleDisconnect(
    code: string,
    playerId: string,
    delayMs: number,
    callback: () => void
  ): void {
    const sr = this.rooms.get(code);
    if (!sr) return;
    const existing = sr.disconnectTimers.get(playerId);
    if (existing) clearTimeout(existing);
    const t = setTimeout(callback, delayMs);
    sr.disconnectTimers.set(playerId, t);
  }

  cancelDisconnect(code: string, playerId: string): void {
    const sr = this.rooms.get(code);
    if (!sr) return;
    const t = sr.disconnectTimers.get(playerId);
    if (t) {
      clearTimeout(t);
      sr.disconnectTimers.delete(playerId);
    }
  }

  // ─── Votes ───────────────────────────────────────────────────────────────────

  addVote(code: string, vote: Vote): boolean {
    const sr = this.rooms.get(code);
    if (!sr) return false;
    // Prevent double-voting
    const alreadyVoted = sr.pendingVotes.some((v) => v.voterId === vote.voterId);
    if (alreadyVoted) return false;
    sr.pendingVotes.push(vote);
    return true;
  }

  getPendingVotes(code: string): Vote[] {
    return this.rooms.get(code)?.pendingVotes ?? [];
  }

  clearPendingVotes(code: string): void {
    const sr = this.rooms.get(code);
    if (sr) sr.pendingVotes = [];
  }

  getVoterCount(code: string): number {
    return this.rooms.get(code)?.pendingVotes.length ?? 0;
  }

  // ─── Game Flow ──────────────────────────────────────────────────────────────

  startGame(code: string): { spyAssignments: Map<string, 'spy' | 'normal'>; word: string } | null {
    const sr = this.rooms.get(code);
    if (!sr) return null;

    const players = sr.room.players.filter((p) => p.status === 'connected');

  // Allow 1-player games in dev mode for testing
  const MIN_PLAYERS = process.env.NODE_ENV === 'development' ? 1 : 3;
  if (players.length < MIN_PLAYERS) return null;

    sr.room.status = 'playing';
    sr.gameState.gameId = generateId();
    sr.roundHistory = [];

    // Reset scores
    players.forEach((p) => (sr.gameState.scores[p.id] = 0));

    return this.startNextRound(code);
  }

  startNextRound(code: string): { spyAssignments: Map<string, 'spy' | 'normal'>; word: string } | null {
    const sr = this.rooms.get(code);
    if (!sr) return null;

    this.clearPendingVotes(code);

    const settings = sr.room.settings;
    const players = sr.room.players.filter((p) => p.status !== 'disconnected');
    const spyCount = calculateSpyCount(players.length, settings.spyCount);
    const assignments = assignRoles(players, spyCount);
    const spyIds = [...assignments.entries()].filter(([, r]) => r === 'spy').map(([id]) => id);

    const word = pickWord({
      language: settings.language,
      category: settings.category,
      difficulty: settings.difficulty,
      recentWordIds: sr.recentWordIds,
    });

    if (!word) return null;

    sr.recentWordIds.push(word.id);
    if (sr.recentWordIds.length > 20) sr.recentWordIds.shift();

    sr.secretWord = word.word;
    sr.spyIds = spyIds;

    const turnOrder = secureshuffle(players.map((p) => p.id));
    const prevRound = sr.gameState.round;
    const roundNumber = prevRound ? prevRound.roundNumber + 1 : 1;

    const round: Round = {
      roundNumber,
      totalRounds: settings.roundCount,
      spyId: spyIds[0], // primary spy
      category: word.category,
      categoryHint: settings.categoryHintEnabled ? word.category : null,
      turnOrder,
      currentTurnIndex: 0,
      currentTurnPlayerId: turnOrder[0],
      strokes: [],
      phase: 'ROLE_REVEAL',
      phaseEndsAt: Date.now() + 5000, // 5s for role reveal
    };

    sr.gameState.round = round;
    sr.gameState.phase = 'ROLE_REVEAL';

    return { spyAssignments: assignments, word: word.word };
  }

  advanceTurn(code: string): { nextPlayerId: string | null; isLastTurn: boolean } {
    const sr = this.rooms.get(code);
    if (!sr?.gameState.round) return { nextPlayerId: null, isLastTurn: true };

    const round = sr.gameState.round;
    const nextIndex = round.currentTurnIndex + 1;

    if (nextIndex >= round.turnOrder.length) {
      round.phase = 'DISCUSSION';
      return { nextPlayerId: null, isLastTurn: true };
    }

    round.currentTurnIndex = nextIndex;
    round.currentTurnPlayerId = round.turnOrder[nextIndex];
    round.phase = 'DRAWING';
    return { nextPlayerId: round.currentTurnPlayerId, isLastTurn: false };
  }

  addStroke(code: string, stroke: Stroke): void {
    const sr = this.rooms.get(code);
    if (sr?.gameState.round) {
      // Upsert: replace if exists, else push
      const idx = sr.gameState.round.strokes.findIndex((s) => s.strokeId === stroke.strokeId);
      if (idx >= 0) {
        sr.gameState.round.strokes[idx] = stroke;
      } else {
        sr.gameState.round.strokes.push(stroke);
      }
    }
  }

  removeLastStroke(code: string, playerId: string): Stroke | undefined {
    const sr = this.rooms.get(code);
    if (!sr?.gameState.round) return undefined;
    const strokes = sr.gameState.round.strokes;
    const idx = [...strokes].reverse().findIndex((s) => s.playerId === playerId);
    if (idx === -1) return undefined;
    const realIdx = strokes.length - 1 - idx;
    const [removed] = strokes.splice(realIdx, 1);
    return removed;
  }

  processVotes(code: string, votes: Vote[]): {
    result: ReturnType<typeof tallyVotes>;
    spyId: string;
    spyCaught: boolean;
  } | null {
    const sr = this.rooms.get(code);
    if (!sr?.gameState.round) return null;

    const spyId = sr.gameState.round.spyId;
    const result = tallyVotes(votes);
    const spyCaught = result.mostVotedId === spyId;

    return { result, spyId, spyCaught };
  }

  processSpyGuess(code: string, guess: string): { correct: boolean; secretWord: string } | null {
    const sr = this.rooms.get(code);
    if (!sr?.secretWord) return null;
    return {
      correct: checkSpyGuess(guess, sr.secretWord),
      secretWord: sr.secretWord,
    };
  }

  finalizeRound(code: string, params: {
    votes: Vote[];
    spyCaught: boolean;
    spyGuessedCorrectly: boolean;
  }): RoundSummary | null {
    const sr = this.rooms.get(code);
    if (!sr?.gameState.round || !sr.secretWord) return null;

    const { votes, spyCaught, spyGuessedCorrectly } = params;
    const round = sr.gameState.round;
    const players = sr.room.players;

    const deltas = calculateScores({
      players,
      spyId: round.spyId,
      spyCaught,
      spyGuessedCorrectly,
      votes,
    });

    // Apply score deltas
    Object.entries(deltas).forEach(([id, delta]) => {
      sr.gameState.scores[id] = (sr.gameState.scores[id] ?? 0) + delta;
    });

    const summary: RoundSummary = {
      roundNumber: round.roundNumber,
      spyId: round.spyId,
      secretWord: sr.secretWord,
      spyCaught,
      spyGuessedCorrectly,
      votes,
      scoreDeltas: deltas,
    };

    sr.roundHistory.push(summary);
    sr.gameState.roundHistory = [...sr.roundHistory];
    return summary;
  }

  isGameOver(code: string): boolean {
    const sr = this.rooms.get(code);
    if (!sr?.gameState.round) return false;
    const { roundNumber, totalRounds } = sr.gameState.round;
    return roundNumber >= totalRounds;
  }

  getWinnerId(code: string): string | null {
    const sr = this.rooms.get(code);
    if (!sr) return null;
    const scores = sr.gameState.scores;
    return Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
  }

  getScores(code: string): Record<string, number> {
    return this.rooms.get(code)?.gameState.scores ?? {};
  }

  getSecretWord(code: string): string | null {
    return this.rooms.get(code)?.secretWord ?? null;
  }

  getSpyIds(code: string): string[] {
    return this.rooms.get(code)?.spyIds ?? [];
  }

  getGameState(code: string): GameState | undefined {
    return this.rooms.get(code)?.gameState;
  }

  setPhase(code: string, phase: GameState['phase']): void {
    const sr = this.rooms.get(code);
    if (!sr) return;
    sr.gameState.phase = phase;
    if (sr.gameState.round) sr.gameState.round.phase = phase;
  }

  setPhaseTimer(code: string, timer: NodeJS.Timeout): void {
    const sr = this.rooms.get(code);
    if (sr) sr.turnTimer = timer;
  }

  clearPhaseTimer(code: string): void {
    const sr = this.rooms.get(code);
    if (sr?.turnTimer) {
      clearTimeout(sr.turnTimer);
      sr.turnTimer = null;
    }
  }

  getRoomCount(): number {
    return this.rooms.size;
  }

  getPlayerCount(): number {
    let total = 0;
    for (const sr of this.rooms.values()) {
      total += sr.room.players.filter((p) => p.status === 'connected').length;
    }
    return total;
  }

  // ─── Private Helpers ────────────────────────────────────────────────────────

  private generateUniqueCode(): string {
    let code: string;
    do {
      code = generateRoomCode();
    } while (this.rooms.has(code));
    return code;
  }

  private scheduleCleanup(code: string, delayMs: number): void {
    setTimeout(() => {
      const sr = this.rooms.get(code);
      if (sr && sr.room.status === 'waiting' && sr.room.players.length === 0) {
        this.deleteRoom(code);
      }
    }, delayMs);
  }
}
