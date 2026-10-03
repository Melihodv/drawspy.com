"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDisconnect = handleDisconnect;
const DISCONNECT_GRACE_MS = 30_000;
function handleDisconnect(io, socket, store) {
    const roomCode = socket.roomCode;
    // Use stored roomCode OR fall back to searching all rooms
    const found = roomCode
        ? { code: roomCode, playerId: store.getPlayerIdBySocket(roomCode, socket.id) ?? '' }
        : store.findRoomBySocket(socket.id) ?? { code: '', playerId: '' };
    if (!found.code || !found.playerId)
        return;
    const { code, playerId } = found;
    store.unregisterSocket(code, socket.id);
    store.updatePlayerStatus(code, playerId, 'disconnected');
    io.to(code).emit('player_left', { playerId });
    // Grace period — if they reconnect within window, restore session
    store.scheduleDisconnect(code, playerId, DISCONNECT_GRACE_MS, () => {
        const sr = store.getRoom(code);
        if (!sr)
            return;
        store.removePlayer(code, playerId);
        io.to(code).emit('room_state', { room: sr.room });
        // Clean up empty rooms
        if (sr.room.players.length === 0) {
            store.deleteRoom(code);
        }
    });
    console.log(`⚡ ${playerId} disconnected from ${code}, grace period started (${DISCONNECT_GRACE_MS / 1000}s)`);
}
//# sourceMappingURL=disconnect.js.map