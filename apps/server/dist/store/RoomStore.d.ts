import type { Room, Player, RoomSettings, GameState, Stroke, Vote, RoundSummary } from '@drawspy/shared';
import { tallyVotes } from '@drawspy/game-engine';
export interface ServerRoom {
    room: Room;
    gameState: GameState;
    secretWord: string | null;
    spyIds: string[];
    recentWordIds: string[];
    turnTimer: NodeJS.Timeout | null;
    roundHistory: RoundSummary[];
    votePhaseTimer: NodeJS.Timeout | null;
    connectedSockets: Map<string, string>;
    disconnectTimers: Map<string, NodeJS.Timeout>;
    pendingVotes: Vote[];
}
export declare class RoomStore {
    private rooms;
    createRoom(host: Player, settings?: Partial<RoomSettings>): ServerRoom;
    getRoom(code: string): ServerRoom | undefined;
    findPublicWaitingRoom(): ServerRoom | undefined;
    deleteRoom(code: string): void;
    addPlayer(code: string, player: Player): boolean;
    removePlayer(code: string, playerId: string): void;
    updatePlayerStatus(code: string, playerId: string, status: Player['status']): void;
    getPlayerBySession(code: string, sessionToken: string): Player | undefined;
    registerSocket(code: string, socketId: string, playerId: string): void;
    unregisterSocket(code: string, socketId: string): string | undefined;
    getPlayerIdBySocket(code: string, socketId: string): string | undefined;
    /** Find which room a socket belongs to (searches all rooms) */
    findRoomBySocket(socketId: string): {
        code: string;
        playerId: string;
    } | undefined;
    scheduleDisconnect(code: string, playerId: string, delayMs: number, callback: () => void): void;
    cancelDisconnect(code: string, playerId: string): void;
    addVote(code: string, vote: Vote): boolean;
    getPendingVotes(code: string): Vote[];
    clearPendingVotes(code: string): void;
    getVoterCount(code: string): number;
    startGame(code: string): {
        spyAssignments: Map<string, 'spy' | 'normal'>;
        word: string;
    } | null;
    startNextRound(code: string): {
        spyAssignments: Map<string, 'spy' | 'normal'>;
        word: string;
    } | null;
    advanceTurn(code: string): {
        nextPlayerId: string | null;
        isLastTurn: boolean;
    };
    addStroke(code: string, stroke: Stroke): void;
    removeLastStroke(code: string, playerId: string): Stroke | undefined;
    processVotes(code: string, votes: Vote[]): {
        result: ReturnType<typeof tallyVotes>;
        spyId: string;
        spyCaught: boolean;
    } | null;
    processSpyGuess(code: string, guess: string): {
        correct: boolean;
        secretWord: string;
    } | null;
    finalizeRound(code: string, params: {
        votes: Vote[];
        spyCaught: boolean;
        spyGuessedCorrectly: boolean;
    }): RoundSummary | null;
    isGameOver(code: string): boolean;
    getWinnerId(code: string): string | null;
    getScores(code: string): Record<string, number>;
    getSecretWord(code: string): string | null;
    getSpyIds(code: string): string[];
    getGameState(code: string): GameState | undefined;
    setPhase(code: string, phase: GameState['phase']): void;
    setPhaseTimer(code: string, timer: NodeJS.Timeout): void;
    clearPhaseTimer(code: string): void;
    getRoomCount(): number;
    getPlayerCount(): number;
    private generateUniqueCode;
    private scheduleCleanup;
}
//# sourceMappingURL=RoomStore.d.ts.map