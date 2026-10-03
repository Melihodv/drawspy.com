"use strict";
// ─── Player & Room ───────────────────────────────────────────────────────────
Object.defineProperty(exports, "__esModule", { value: true });
exports.COLOR_PALETTE = exports.BRUSH_SIZES = exports.CANVAS_HEIGHT = exports.CANVAS_WIDTH = exports.DEFAULT_SETTINGS = exports.ERROR_CODES = exports.SCORE = void 0;
// ─── Score Constants ──────────────────────────────────────────────────────────
exports.SCORE = {
    NORMAL_CORRECT_VOTE: 100,
    SPY_SURVIVES: 200,
    SPY_GUESS_CORRECT: 150,
};
// ─── Error Codes ──────────────────────────────────────────────────────────────
exports.ERROR_CODES = {
    ROOM_NOT_FOUND: 'ROOM_NOT_FOUND',
    ROOM_FULL: 'ROOM_FULL',
    GAME_ALREADY_STARTED: 'GAME_ALREADY_STARTED',
    INVALID_SESSION: 'INVALID_SESSION',
    NOT_HOST: 'NOT_HOST',
    NOT_YOUR_TURN: 'NOT_YOUR_TURN',
    PLAYER_NOT_FOUND: 'PLAYER_NOT_FOUND',
    INVALID_VOTE: 'INVALID_VOTE',
    CONNECTION_LOST: 'CONNECTION_LOST',
    RATE_LIMITED: 'RATE_LIMITED',
    INVALID_NICKNAME: 'INVALID_NICKNAME',
    ALREADY_VOTED: 'ALREADY_VOTED',
};
// ─── Default Settings ─────────────────────────────────────────────────────────
exports.DEFAULT_SETTINGS = {
    language: 'en',
    maxPlayers: 8,
    spyCount: 'auto',
    roundCount: 5,
    drawingTimeSec: 12,
    votingTimeSec: 20,
    discussionTimeSec: 20,
    difficulty: 'easy+medium',
    category: 'random',
    categoryHintEnabled: true,
    chatEnabled: true,
    spectatorsAllowed: false,
    isPrivate: true,
};
exports.CANVAS_WIDTH = 1000;
exports.CANVAS_HEIGHT = 700;
exports.BRUSH_SIZES = [4, 10, 22];
exports.COLOR_PALETTE = [
    '#000000', '#FFFFFF', '#EF4444', '#F97316',
    '#EAB308', '#22C55E', '#3B82F6', '#8B5CF6',
    '#EC4899', '#92400E', '#6B7280', '#67E8F9',
    '#FDE68A', '#BBF7D0', '#BFDBFE', '#F5D0FE',
];
//# sourceMappingURL=index.js.map