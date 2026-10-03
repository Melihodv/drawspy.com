import type { Player, RoomSettings } from '@drawspy/shared';
/**
 * Calculate how many spies for given player count.
 */
export declare function calculateSpyCount(playerCount: number, setting: RoomSettings['spyCount']): number;
/**
 * Cryptographically secure Fisher-Yates shuffle.
 */
export declare function secureshuffle<T>(arr: T[]): T[];
/**
 * Assign spy/normal roles. Returns map of playerId → role.
 * Never call this client-side.
 */
export declare function assignRoles(players: Player[], spyCount: number): Map<string, 'spy' | 'normal'>;
/**
 * Generate a random 6-char uppercase room code.
 */
export declare function generateRoomCode(): string;
/**
 * Normalize text for word comparison (spy guess matching).
 */
export declare function normalizeWord(text: string): string;
/**
 * Check if spy's guess matches the secret word.
 */
export declare function checkSpyGuess(guess: string, secretWord: string): boolean;
/**
 * Calculate score deltas for a round.
 */
export declare function calculateScores(params: {
    players: Player[];
    spyId: string;
    spyCaught: boolean;
    spyGuessedCorrectly: boolean;
    votes: Array<{
        voterId: string;
        targetId: string;
    }>;
}): Record<string, number>;
/**
 * Determine vote result — who got most votes, tie detection.
 */
export declare function tallyVotes(votes: Array<{
    voterId: string;
    targetId: string;
}>): {
    mostVotedId: string | null;
    isTie: boolean;
    tiedPlayerIds: string[];
    voteCounts: Record<string, number>;
};
/**
 * Generate a random UUID (for stroke IDs, session tokens, etc.)
 */
export declare function generateId(): string;
//# sourceMappingURL=index.d.ts.map