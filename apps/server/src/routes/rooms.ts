import { Router, type Request, type Response, type IRouter } from 'express';
import { z } from 'zod';
import { generateId } from '@drawspy/game-engine';
import type { Player, CreateRoomResponse } from '@drawspy/shared';
import { DEFAULT_SETTINGS } from '@drawspy/shared';
import { roomStore } from '../index.js';

export const roomRouter: IRouter = Router();

const CreateRoomSchema = z.object({
  nickname: z.string().min(1).max(20),
  avatarId: z.number().int().min(0).max(25),
  settings: z.record(z.unknown()).optional(),
});

// POST /api/rooms — create a room
roomRouter.post('/rooms', (req, res) => {
  const parsed = CreateRoomSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { nickname, avatarId, settings } = parsed.data;
  const sessionToken = generateId();

  const host: Player = {
    id: generateId(),
    nickname: nickname.trim(),
    avatarId,
    sessionToken,
    score: 0,
    status: 'connected',
    isHost: true,
    joinedAt: Date.now(),
  };

  const sr = roomStore.createRoom(host, settings as any);

  const response: CreateRoomResponse & { sessionToken: string } = {
    roomCode: sr.room.code,
    sessionToken,
    playerId: host.id,
  };

  return res.status(201).json(response);
});

const MatchmakeSchema = z.object({
  nickname: z.string().min(1).max(20),
  avatarId: z.number().int().min(0).max(25),
});

// POST /api/matchmake — Quick Play public matchmaking
roomRouter.post('/matchmake', (req, res) => {
  const parsed = MatchmakeSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Invalid request' });
  }

  const { nickname, avatarId } = parsed.data;
  const sessionToken = generateId();

  let sr = roomStore.findPublicWaitingRoom();

  if (sr) {
    const player: Player = {
      id: generateId(),
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
  } else {
    const host: Player = {
      id: generateId(),
      nickname: nickname.trim(),
      avatarId,
      sessionToken,
      score: 0,
      status: 'connected',
      isHost: true,
      joinedAt: Date.now(),
    };

    sr = roomStore.createRoom(host, { isPrivate: false });

    return res.status(201).json({
      roomCode: sr.room.code,
      sessionToken,
      playerId: host.id,
      isHost: true,
    });
  }
});

// GET /api/rooms/:code — room metadata
roomRouter.get('/rooms/:code', (req, res) => {
  const sr = roomStore.getRoom(req.params.code.toUpperCase());
  if (!sr) return res.status(404).json({ error: 'Room not found' });

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
roomRouter.get('/categories', (_req, res) => {
  res.json({
    categories: [
      'animals', 'food', 'objects', 'places', 'jobs',
      'sports', 'nature', 'technology', 'entertainment',
    ],
  });
});
