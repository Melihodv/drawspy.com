"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChat = handleChat;
const MAX_MSG_LENGTH = 150;
const RATE_LIMIT_MS = 500;
const lastMessageTime = new Map();
function handleChat(io, socket, store, data) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const sr = store.getRoom(roomCode);
    if (!sr?.room.settings.chatEnabled)
        return;
    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (!playerId)
        return;
    // Rate limit
    const now = Date.now();
    const last = lastMessageTime.get(socket.id) ?? 0;
    if (now - last < RATE_LIMIT_MS)
        return;
    lastMessageTime.set(socket.id, now);
    // Sanitize — strip HTML, limit length
    const text = data.text
        .replace(/[<>]/g, '')
        .trim()
        .slice(0, MAX_MSG_LENGTH);
    if (!text)
        return;
    const player = sr.room.players.find((p) => p.id === playerId);
    if (!player)
        return;
    io.to(roomCode).emit('chat_message', {
        playerId,
        nickname: player.nickname,
        text,
        timestamp: now,
    });
}
//# sourceMappingURL=chat.js.map