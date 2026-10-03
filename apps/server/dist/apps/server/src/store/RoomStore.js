"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoomStore = void 0;
const shared_1 = require("@drawspy/shared");
const game_engine_1 = require("@drawspy/game-engine");
const words_1 = require("@drawspy/words");
class RoomStore {
    rooms = new Map();
    // ─── Room Lifecycle ─────────────────────────────────────────────────────────
    createRoom(host, settings) {
        const code = this.generateUniqueCode();
        const mergedSettings = { ...shared_1.DEFAULT_SETTINGS, ...settings };
        const room = {
            id: (0, game_engine_1.generateId)(),
            code,
            name: `${host.nickname}'s Room`,
            hostId: host.id,
            players: [host],
            settings: mergedSettings,
            status: 'waiting',
            createdAt: Date.now(),
        };
        const gameState = {
            gameId: (0, game_engine_1.generateId)(),
            roomCode: code,
            phase: 'ROOM_WAITING',
            round: null,
            players: [host],
            scores: { [host.id]: 0 },
            roundHistory: [],
        };
        const serverRoom = {
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
    getRoom(code) {
        return this.rooms.get(code);
    }
    findPublicWaitingRoom() {
        let bestCandidate = undefined;
        for (const sr of this.rooms.values()) {
            if (!sr.room.settings.isPrivate &&
                sr.gameState.phase === 'ROOM_WAITING' &&
                sr.room.status === 'waiting' &&
                sr.room.players.length < sr.room.settings.maxPlayers) {
                if (!bestCandidate || sr.room.players.length > bestCandidate.room.players.length) {
                    bestCandidate = sr;
                }
            }
        }
        return bestCandidate;
    }
    deleteRoom(code) {
        const sr = this.rooms.get(code);
        if (sr) {
            if (sr.turnTimer)
                clearTimeout(sr.turnTimer);
            if (sr.votePhaseTimer)
                clearTimeout(sr.votePhaseTimer);
            sr.disconnectTimers.forEach((t) => clearTimeout(t));
        }
        this.rooms.delete(code);
    }
    // ─── Player Management ──────────────────────────────────────────────────────
    addPlayer(code, player) {
        const sr = this.rooms.get(code);
        if (!sr)
            return false;
        // Allow joining only in waiting state for new players
        if (sr.room.status !== 'waiting')
            return false;
        if (sr.room.players.length >= sr.room.settings.maxPlayers)
            return false;
        sr.room.players.push(player);
        sr.gameState.players.push(player);
        sr.gameState.scores[player.id] = 0;
        return true;
    }
    removePlayer(code, playerId) {
        const sr = this.rooms.get(code);
        if (!sr)
            return;
        sr.room.players = sr.room.players.filter((p) => p.id !== playerId);
        sr.gameState.players = sr.gameState.players.filter((p) => p.id !== playerId);
        // Host migration
        if (sr.room.hostId === playerId && sr.room.players.length > 0) {
            const next = [...sr.room.players].sort((a, b) => a.joinedAt - b.joinedAt)[0];
            sr.room.hostId = next.id;
            next.isHost = true;
        }
    }
    updatePlayerStatus(code, playerId, status) {
        const sr = this.rooms.get(code);
        if (!sr)
            return;
        const p = sr.room.players.find((x) => x.id === playerId);
        if (p)
            p.status = status;
        const gp = sr.gameState.players.find((x) => x.id === playerId);
        if (gp)
            gp.status = status;
    }
    getPlayerBySession(code, sessionToken) {
        return this.rooms.get(code)?.room.players.find((p) => p.sessionToken === sessionToken);
    }
    registerSocket(code, socketId, playerId) {
        this.rooms.get(code)?.connectedSockets.set(socketId, playerId);
    }
    unregisterSocket(code, socketId) {
        const sr = this.rooms.get(code);
        if (!sr)
            return undefined;
        const playerId = sr.connectedSockets.get(socketId);
        sr.connectedSockets.delete(socketId);
        return playerId;
    }
    getPlayerIdBySocket(code, socketId) {
        return this.rooms.get(code)?.connectedSockets.get(socketId);
    }
    /** Find which room a socket belongs to (searches all rooms) */
    findRoomBySocket(socketId) {
        for (const [code, sr] of this.rooms) {
            const playerId = sr.connectedSockets.get(socketId);
            if (playerId)
                return { code, playerId };
        }
        return undefined;
    }
    scheduleDisconnect(code, playerId, delayMs, callback) {
        const sr = this.rooms.get(code);
        if (!sr)
            return;
        const existing = sr.disconnectTimers.get(playerId);
        if (existing)
            clearTimeout(existing);
        const t = setTimeout(callback, delayMs);
        sr.disconnectTimers.set(playerId, t);
    }
    cancelDisconnect(code, playerId) {
        const sr = this.rooms.get(code);
        if (!sr)
            return;
        const t = sr.disconnectTimers.get(playerId);
        if (t) {
            clearTimeout(t);
            sr.disconnectTimers.delete(playerId);
        }
    }
    // ─── Votes ───────────────────────────────────────────────────────────────────
    addVote(code, vote) {
        const sr = this.rooms.get(code);
        if (!sr)
            return false;
        // Prevent double-voting
        const alreadyVoted = sr.pendingVotes.some((v) => v.voterId === vote.voterId);
        if (alreadyVoted)
            return false;
        sr.pendingVotes.push(vote);
        return true;
    }
    getPendingVotes(code) {
        return this.rooms.get(code)?.pendingVotes ?? [];
    }
    clearPendingVotes(code) {
        const sr = this.rooms.get(code);
        if (sr)
            sr.pendingVotes = [];
    }
    getVoterCount(code) {
        return this.rooms.get(code)?.pendingVotes.length ?? 0;
    }
    // ─── Game Flow ──────────────────────────────────────────────────────────────
    startGame(code) {
        const sr = this.rooms.get(code);
        if (!sr)
            return null;
        const players = sr.room.players.filter((p) => p.status === 'connected');
        // Allow 1-player games in dev mode for testing
        const MIN_PLAYERS = process.env.NODE_ENV === 'development' ? 1 : 3;
        if (players.length < MIN_PLAYERS)
            return null;
        sr.room.status = 'playing';
        sr.gameState.gameId = (0, game_engine_1.generateId)();
        sr.roundHistory = [];
        // Reset scores
        players.forEach((p) => (sr.gameState.scores[p.id] = 0));
        return this.startNextRound(code);
    }
    startNextRound(code) {
        const sr = this.rooms.get(code);
        if (!sr)
            return null;
        this.clearPendingVotes(code);
        const settings = sr.room.settings;
        const players = sr.room.players.filter((p) => p.status !== 'disconnected');
        const spyCount = (0, game_engine_1.calculateSpyCount)(players.length, settings.spyCount);
        const assignments = (0, game_engine_1.assignRoles)(players, spyCount);
        const spyIds = [...assignments.entries()].filter(([, r]) => r === 'spy').map(([id]) => id);
        const word = (0, words_1.pickWord)({
            language: settings.language,
            category: settings.category,
            difficulty: settings.difficulty,
            recentWordIds: sr.recentWordIds,
        });
        if (!word)
            return null;
        sr.recentWordIds.push(word.id);
        if (sr.recentWordIds.length > 20)
            sr.recentWordIds.shift();
        sr.secretWord = word.word;
        sr.spyIds = spyIds;
        const turnOrder = (0, game_engine_1.secureshuffle)(players.map((p) => p.id));
        const prevRound = sr.gameState.round;
        const roundNumber = prevRound ? prevRound.roundNumber + 1 : 1;
        const round = {
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
    advanceTurn(code) {
        const sr = this.rooms.get(code);
        if (!sr?.gameState.round)
            return { nextPlayerId: null, isLastTurn: true };
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
    addStroke(code, stroke) {
        const sr = this.rooms.get(code);
        if (sr?.gameState.round) {
            // Upsert: replace if exists, else push
            const idx = sr.gameState.round.strokes.findIndex((s) => s.strokeId === stroke.strokeId);
            if (idx >= 0) {
                sr.gameState.round.strokes[idx] = stroke;
            }
            else {
                sr.gameState.round.strokes.push(stroke);
            }
        }
    }
    removeLastStroke(code, playerId) {
        const sr = this.rooms.get(code);
        if (!sr?.gameState.round)
            return undefined;
        const strokes = sr.gameState.round.strokes;
        const idx = [...strokes].reverse().findIndex((s) => s.playerId === playerId);
        if (idx === -1)
            return undefined;
        const realIdx = strokes.length - 1 - idx;
        const [removed] = strokes.splice(realIdx, 1);
        return removed;
    }
    processVotes(code, votes) {
        const sr = this.rooms.get(code);
        if (!sr?.gameState.round)
            return null;
        const spyId = sr.gameState.round.spyId;
        const result = (0, game_engine_1.tallyVotes)(votes);
        const spyCaught = result.mostVotedId === spyId;
        return { result, spyId, spyCaught };
    }
    processSpyGuess(code, guess) {
        const sr = this.rooms.get(code);
        if (!sr?.secretWord)
            return null;
        return {
            correct: (0, game_engine_1.checkSpyGuess)(guess, sr.secretWord),
            secretWord: sr.secretWord,
        };
    }
    finalizeRound(code, params) {
        const sr = this.rooms.get(code);
        if (!sr?.gameState.round || !sr.secretWord)
            return null;
        const { votes, spyCaught, spyGuessedCorrectly } = params;
        const round = sr.gameState.round;
        const players = sr.room.players;
        const deltas = (0, game_engine_1.calculateScores)({
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
        const summary = {
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
    isGameOver(code) {
        const sr = this.rooms.get(code);
        if (!sr?.gameState.round)
            return false;
        const { roundNumber, totalRounds } = sr.gameState.round;
        return roundNumber >= totalRounds;
    }
    getWinnerId(code) {
        const sr = this.rooms.get(code);
        if (!sr)
            return null;
        const scores = sr.gameState.scores;
        return Object.entries(scores).sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;
    }
    getScores(code) {
        return this.rooms.get(code)?.gameState.scores ?? {};
    }
    getSecretWord(code) {
        return this.rooms.get(code)?.secretWord ?? null;
    }
    getSpyIds(code) {
        return this.rooms.get(code)?.spyIds ?? [];
    }
    getGameState(code) {
        return this.rooms.get(code)?.gameState;
    }
    setPhase(code, phase) {
        const sr = this.rooms.get(code);
        if (!sr)
            return;
        sr.gameState.phase = phase;
        if (sr.gameState.round)
            sr.gameState.round.phase = phase;
    }
    setPhaseTimer(code, timer) {
        const sr = this.rooms.get(code);
        if (sr)
            sr.turnTimer = timer;
    }
    clearPhaseTimer(code) {
        const sr = this.rooms.get(code);
        if (sr?.turnTimer) {
            clearTimeout(sr.turnTimer);
            sr.turnTimer = null;
        }
    }
    getRoomCount() {
        return this.rooms.size;
    }
    getPlayerCount() {
        let total = 0;
        for (const sr of this.rooms.values()) {
            total += sr.room.players.filter((p) => p.status === 'connected').length;
        }
        return total;
    }
    // ─── Private Helpers ────────────────────────────────────────────────────────
    generateUniqueCode() {
        let code;
        do {
            code = (0, game_engine_1.generateRoomCode)();
        } while (this.rooms.has(code));
        return code;
    }
    scheduleCleanup(code, delayMs) {
        setTimeout(() => {
            const sr = this.rooms.get(code);
            if (sr && sr.room.status === 'waiting' && sr.room.players.length === 0) {
                this.deleteRoom(code);
            }
        }, delayMs);
    }
}
exports.RoomStore = RoomStore;
//# sourceMappingURL=RoomStore.js.map