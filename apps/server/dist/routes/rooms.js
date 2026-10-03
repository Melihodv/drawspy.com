"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const game_engine_1 = require("@drawspy/game-engine");
const index_js_1 = require("../index.js");
exports.roomRouter = (0, express_1.Router)();
const CreateRoomSchema = zod_1.z.object({
    nickname: zod_1.z.string().min(1).max(20),
    avatarId: zod_1.z.number().int().min(0).max(25),
    settings: zod_1.z.record(zod_1.z.unknown()).optional(),
});
// POST /api/rooms — create a room
exports.roomRouter.post('/rooms', (req, res) => {
    const parsed = CreateRoomSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const { nickname, avatarId, settings } = parsed.data;
    const sessionToken = (0, game_engine_1.generateId)();
    const host = {
        id: (0, game_engine_1.generateId)(),
        nickname: nickname.trim(),
        avatarId,
        sessionToken,
        score: 0,
        status: 'connected',
        isHost: true,
        joinedAt: Date.now(),
    };
    const sr = index_js_1.roomStore.createRoom(host, settings);
    const response = {
        roomCode: sr.room.code,
        sessionToken,
        playerId: host.id,
    };
    return res.status(201).json(response);
});
const MatchmakeSchema = zod_1.z.object({
    nickname: zod_1.z.string().min(1).max(20),
    avatarId: zod_1.z.number().int().min(0).max(25),
});
// POST /api/matchmake — Quick Play public matchmaking
exports.roomRouter.post('/matchmake', (req, res) => {
    const parsed = MatchmakeSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ error: 'Invalid request' });
    }
    const { nickname, avatarId } = parsed.data;
    const sessionToken = (0, game_engine_1.generateId)();
    let sr = index_js_1.roomStore.findPublicWaitingRoom();
    if (sr) {
        const player = {
            id: (0, game_engine_1.generateId)(),
            nickname: nickname.trim(),
            avatarId,
            sessionToken,
            score: 0,
            status: 'connected',
            isHost: false,
            joinedAt: Date.now(),
        };
        sr.room.players.push(player);
        sr.gameState.players.push(player);
        sr.gameState.scores[player.id] = 0;
        return res.status(200).json({
            roomCode: sr.room.code,
            sessionToken,
            playerId: player.id,
            isHost: false,
        });
    }
    else {
        const host = {
            id: (0, game_engine_1.generateId)(),
            nickname: nickname.trim(),
            avatarId,
            sessionToken,
            score: 0,
            status: 'connected',
            isHost: true,
            joinedAt: Date.now(),
        };
        sr = index_js_1.roomStore.createRoom(host, { isPrivate: false });
        return res.status(201).json({
            roomCode: sr.room.code,
            sessionToken,
            playerId: host.id,
            isHost: true,
        });
    }
});
// GET /api/rooms/:code — room metadata
exports.roomRouter.get('/rooms/:code', (req, res) => {
    const sr = index_js_1.roomStore.getRoom(req.params.code.toUpperCase());
    if (!sr)
        return res.status(404).json({ error: 'Room not found' });
    return res.json({
        code: sr.room.code,
        name: sr.room.name,
        playerCount: sr.room.players.length,
        maxPlayers: sr.room.settings.maxPlayers,
        status: sr.room.status,
        isPrivate: sr.room.settings.isPrivate,
    });
});
// GET /api/categories — available word categories
exports.roomRouter.get('/categories', (_req, res) => {
    res.json({
        categories: [
            'animals', 'food', 'objects', 'places', 'jobs',
            'sports', 'nature', 'technology', 'entertainment',
        ],
    });
});
//# sourceMappingURL=rooms.js.map