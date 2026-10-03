import type { Player, RoomSettings } from '@drawspy/shared';

/**
 * Calculate how many spies for given player count.
 */
export function calculateSpyCount(
  playerCount: number,
  setting: RoomSettings['spyCount']
): number {
  if (setting !== 'auto') return setting;
  if (playerCount <= 6) return 1;
  if (playerCount <= 10) return 2;
  return 3;
}

/**
 * Cryptographically secure Fisher-Yates shuffle.
 */
export function secureshuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Assign spy/normal roles. Returns map of playerId → role.
 * Never call this client-side.
 */
export function assignRoles(
  players: Player[],
  spyCount: number
): Map<string, 'spy' | 'normal'> {
  const shuffled = secureshuffle(players.map((p) => p.id));
  const roles = new Map<string, 'spy' | 'normal'>();
  shuffled.forEach((id, i) => {
    roles.set(id, i < spyCount ? 'spy' : 'normal');
  });
  return roles;
}

/**
 * Generate a random 6-char uppercase room code.
 */
export function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('');
}

/**
 * Normalize text for word comparison (spy guess matching).
 */
export function normalizeWord(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Check if spy's guess matches the secret word.
 */
export function checkSpyGuess(guess: string, secretWord: string): boolean {
  return normalizeWord(guess) === normalizeWord(secretWord);
}

/**
 * Calculate score deltas for a round.
 */
export function calculateScores(params: {
  players: Player[];
  spyId: string;
  spyCaught: boolean;
  spyGuessedCorrectly: boolean;
  votes: Array<{ voterId: string; targetId: string }>;
}): Record<string, number> {
  const { players, spyId, spyCaught, spyGuessedCorrectly, votes } = params;
  const deltas: Record<string, number> = {};
  players.forEach((p) => (deltas[p.id] = 0));

  if (!spyCaught) {
    // Spy survived
    deltas[spyId] = (deltas[spyId] ?? 0) + 200;
  } else if (spyGuessedCorrectly) {
    // Spy was caught but guessed the word
    deltas[spyId] = (deltas[spyId] ?? 0) + 150;
  }

  if (spyCaught && !spyGuessedCorrectly) {
    // Normal players who voted for spy get points
    votes.forEach(({ voterId, targetId }) => {
      if (targetId === spyId && voterId !== spyId) {
        deltas[voterId] = (deltas[voterId] ?? 0) + 100;
      }
    });
  }

  return deltas;
}

/**
 * Determine vote result — who got most votes, tie detection.
 */
export function tallyVotes(votes: Array<{ voterId: string; targetId: string }>): {
  mostVotedId: string | null;
  isTie: boolean;
  tiedPlayerIds: string[];
  voteCounts: Record<string, number>;
} {
  const counts: Record<string, number> = {};
  votes.forEach(({ targetId }) => {
    counts[targetId] = (counts[targetId] ?? 0) + 1;
  });

  if (Object.keys(counts).length === 0) {
    return { mostVotedId: null, isTie: false, tiedPlayerIds: [], voteCounts: counts };
  }

  const maxVotes = Math.max(...Object.values(counts));
  const topPlayers = Object.entries(counts)
    .filter(([, c]) => c === maxVotes)
    .map(([id]) => id);

  if (topPlayers.length > 1) {
    return { mostVotedId: null, isTie: true, tiedPlayerIds: topPlayers, voteCounts: counts };
  }

  return { mostVotedId: topPlayers[0], isTie: false, tiedPlayerIds: [], voteCounts: counts };
}

/**
 * Generate a random UUID (for stroke IDs, session tokens, etc.)
 */
export function generateId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}
