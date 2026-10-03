export type Language = 'en' | 'tr' | 'fr' | 'de' | 'es' | 'ar';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type Role = 'normal' | 'spy';
export type PlayerStatus = 'connected' | 'disconnected' | 'reconnecting';
export interface Player {
    id: string;
    nickname: string;
    avatarId: number;
    sessionToken: string;
    score: number;
    status: PlayerStatus;
    isHost: boolean;
    joinedAt: number;
}
export interface RoomSettings {
    language: Language;
    maxPlayers: number;
    spyCount: 'auto' | 1 | 2 | 3;
    roundCount: number;
    drawingTimeSec: number;
    votingTimeSec: number;
    discussionTimeSec: number;
    difficulty: Difficulty | 'easy+medium' | 'all';
    category: string | 'random';
    categoryHintEnabled: boolean;
    chatEnabled: boolean;
    spectatorsAllowed: boolean;
    isPrivate: boolean;
}
export interface Room {
    id: string;
    code: string;
    name: string;
    hostId: string;
    players: Player[];
    settings: RoomSettings;
    status: 'waiting' | 'playing' | 'finished';
    createdAt: number;
}
export type GamePhase = 'ROOM_WAITING' | 'ROUND_STARTING' | 'ROLE_REVEAL' | 'DRAWING' | 'DISCUSSION' | 'VOTING' | 'VOTE_RESULTS' | 'SPY_GUESS' | 'ROUND_RESULTS' | 'NEXT_ROUND' | 'GAME_RESULTS';
export type DrawTool = 'pen' | 'eraser';
export interface StrokePoint {
    x: number;
    y: number;
    t: number;
}
export interface Stroke {
    strokeId: string;
    playerId: string;
    tool: DrawTool;
    color: string;
    size: number;
    points: StrokePoint[];
}
export interface Word {
    id: string;
    word: string;
    category: string;
    difficulty: Difficulty;
    language: Language;
}
export interface Category {
    id: string;
    name: string;
    slug: string;
    language: Language;
}
export interface Vote {
    voterId: string;
    targetId: string;
    submittedAt: number;
}
export interface VoteResult {
    votes: Vote[];
    mostVotedId: string | null;
    isTie: boolean;
    tiedPlayerIds: string[];
    spyId: string;
    spyCaught: boolean;
}
export interface RoundPlayer {
    playerId: string;
    role: Role;
    turnOrder: number;
    vote: Vote | null;
    scoreDelta: number;
}
export interface Round {
    roundNumber: number;
    totalRounds: number;
    spyId: string;
    category: string;
    categoryHint: string | null;
    turnOrder: string[];
    currentTurnIndex: number;
    currentTurnPlayerId: string;
    strokes: Stroke[];
    phase: GamePhase;
    phaseEndsAt: number;
}
export interface GameState {
    gameId: string;
    roomCode: string;
    phase: GamePhase;
    round: Round | null;
    players: Player[];
    scores: Record<string, number>;
    roundHistory: RoundSummary[];
}
export interface RoundSummary {
    roundNumber: number;
    spyId: string;
    secretWord: string;
    spyCaught: boolean;
    spyGuessedCorrectly: boolean;
    votes: Vote[];
    scoreDeltas: Record<string, number>;
}
export declare const SCORE: {
    readonly NORMAL_CORRECT_VOTE: 100;
    readonly SPY_SURVIVES: 200;
    readonly SPY_GUESS_CORRECT: 150;
};
export interface ClientToServerEvents {
    join_room: (data: {
        roomCode: string;
        nickname: string;
        avatarId: number;
        sessionToken: string;
    }) => void;
    leave_room: () => void;
    player_ready: () => void;
    start_game: () => void;
    draw_begin: (data: {
        strokeId: string;
        tool: DrawTool;
        color: string;
        size: number;
    }) => void;
    draw_points: (data: {
        strokeId: string;
        points: StrokePoint[];
    }) => void;
    draw_end: (data: {
        strokeId: string;
    }) => void;
    draw_undo: () => void;
    send_chat: (data: {
        text: string;
    }) => void;
    submit_vote: (data: {
        targetId: string;
    }) => void;
    submit_spy_guess: (data: {
        guess: string;
    }) => void;
    request_restart: () => void;
    kick_player: (data: {
        targetId: string;
    }) => void;
    update_settings: (data: Partial<RoomSettings>) => void;
}
export interface ServerToClientEvents {
    room_state: (data: {
        room: Room;
    }) => void;
    player_joined: (data: {
        player: Player;
    }) => void;
    player_left: (data: {
        playerId: string;
    }) => void;
    player_reconnected: (data: {
        playerId: string;
    }) => void;
    host_changed: (data: {
        newHostId: string;
    }) => void;
    game_started: () => void;
    role_received: (data: {
        role: Role;
        word: string | null;
        category: string;
        categoryHint: string | null;
    }) => void;
    round_started: (data: {
        round: Pick<Round, 'roundNumber' | 'totalRounds' | 'turnOrder' | 'category'>;
    }) => void;
    turn_started: (data: {
        playerId: string;
        turnIndex: number;
        phaseEndsAt: number;
    }) => void;
    draw_update: (data: {
        stroke: Stroke;
    }) => void;
    draw_undo_applied: (data: {
        playerId: string;
        strokeId: string;
    }) => void;
    turn_ended: (data: {
        playerId: string;
        didDraw?: boolean;
    }) => void;
    discussion_started: (data: {
        phaseEndsAt: number;
    }) => void;
    voting_started: (data: {
        phaseEndsAt: number;
    }) => void;
    vote_progress: (data: {
        votedCount: number;
        totalCount: number;
    }) => void;
    vote_result: (data: VoteResult) => void;
    spy_guess_started: (data: {
        spyId: string;
        phaseEndsAt: number;
    }) => void;
    spy_guess_result: (data: {
        guess: string;
        correct: boolean;
        secretWord: string;
    }) => void;
    round_finished: (data: {
        summary: RoundSummary;
        scores: Record<string, number>;
    }) => void;
    game_finished: (data: {
        finalScores: Record<string, number>;
        winnerId: string;
        history: RoundSummary[];
    }) => void;
    chat_message: (data: {
        playerId: string;
        nickname: string;
        text: string;
        timestamp: number;
    }) => void;
    error: (data: {
        code: string;
        message: string;
    }) => void;
    reconnect_state: (data: {
        gameState: GameState;
        myRole: Role;
        myWord: string | null;
    }) => void;
    settings_updated: (data: {
        settings: RoomSettings;
    }) => void;
    player_kicked: (data: {
        playerId: string;
    }) => void;
    tie_revote: (data: {
        tiedPlayerIds: string[];
        phaseEndsAt: number;
    }) => void;
}
export declare const ERROR_CODES: {
    readonly ROOM_NOT_FOUND: "ROOM_NOT_FOUND";
    readonly ROOM_FULL: "ROOM_FULL";
    readonly GAME_ALREADY_STARTED: "GAME_ALREADY_STARTED";
    readonly INVALID_SESSION: "INVALID_SESSION";
    readonly NOT_HOST: "NOT_HOST";
    readonly NOT_YOUR_TURN: "NOT_YOUR_TURN";
    readonly PLAYER_NOT_FOUND: "PLAYER_NOT_FOUND";
    readonly INVALID_VOTE: "INVALID_VOTE";
    readonly CONNECTION_LOST: "CONNECTION_LOST";
    readonly RATE_LIMITED: "RATE_LIMITED";
    readonly INVALID_NICKNAME: "INVALID_NICKNAME";
    readonly ALREADY_VOTED: "ALREADY_VOTED";
};
export type ErrorCode = keyof typeof ERROR_CODES;
export interface CreateRoomRequest {
    nickname: string;
    avatarId: number;
    settings?: Partial<RoomSettings>;
}
export interface CreateRoomResponse {
    roomCode: string;
    sessionToken: string;
    playerId: string;
}
export interface JoinRoomResponse {
    roomCode: string;
    sessionToken: string;
    playerId: string;
    room: Room;
}
export declare const DEFAULT_SETTINGS: RoomSettings;
export declare const CANVAS_WIDTH = 1000;
export declare const CANVAS_HEIGHT = 700;
export declare const BRUSH_SIZES: readonly [4, 10, 22];
export declare const COLOR_PALETTE: readonly ["#000000", "#FFFFFF", "#EF4444", "#F97316", "#EAB308", "#22C55E", "#3B82F6", "#8B5CF6", "#EC4899", "#92400E", "#6B7280", "#67E8F9", "#FDE68A", "#BBF7D0", "#BFDBFE", "#F5D0FE"];
//# sourceMappingURL=index.d.ts.map