import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

const MAX_MSG_LENGTH = 150;
const RATE_LIMIT_MS = 500;
const lastMessageTime = new Map<string, number>();

export function handleChat(
  io: GameServer,
  socket: GameSocket,
  store: RoomStore,
  data: { text: string }
): void {
  const roomCode = (socket as any).roomCode as string | undefined;
  if (!roomCode) return;

  const sr = store.getRoom(roomCode);
  if (!sr?.room.settings.chatEnabled) return;

  const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
  if (!playerId) return;

  // Rate limit
  const now = Date.now();
  const last = lastMessageTime.get(socket.id) ?? 0;
  if (now - last < RATE_LIMIT_MS) return;
  lastMessageTime.set(socket.id, now);

  // Sanitize — strip HTML, limit length
  const text = data.text
    .replace(/[<>]/g, '')
    .trim()
    .slice(0, MAX_MSG_LENGTH);

  if (!text) return;

  const player = sr.room.players.find((p) => p.id === playerId);
  if (!player) return;

  io.to(roomCode).emit('chat_message', {
    playerId,
    nickname: player.nickname,
    text,
    timestamp: now,
  });
}
