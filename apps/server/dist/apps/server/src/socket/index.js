"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerSocketHandlers = registerSocketHandlers;
const joinRoom_js_1 = require("./handlers/joinRoom.js");
const drawing_js_1 = require("./handlers/drawing.js");
const voting_js_1 = require("./handlers/voting.js");
const chat_js_1 = require("./handlers/chat.js");
const disconnect_js_1 = require("./handlers/disconnect.js");
const startGame_js_1 = require("./handlers/startGame.js");
function registerSocketHandlers(io, store) {
    io.on('connection', (socket) => {
        console.log(`🔌 Socket connected: ${socket.id}`);
        socket.on('join_room', (data) => (0, joinRoom_js_1.handleJoinRoom)(io, socket, store, data));
        socket.on('start_game', () => (0, startGame_js_1.handleStartGame)(io, socket, store));
        socket.on('draw_begin', (data) => drawing_js_1.handleDrawEvents.begin(io, socket, store, data));
        socket.on('draw_points', (data) => drawing_js_1.handleDrawEvents.points(io, socket, store, data));
        socket.on('draw_end', (data) => drawing_js_1.handleDrawEvents.end(io, socket, store, data));
        socket.on('draw_undo', () => drawing_js_1.handleDrawEvents.undo(io, socket, store));
        socket.on('submit_vote', (data) => (0, voting_js_1.handleVoting)(io, socket, store, data));
        socket.on('submit_spy_guess', (data) => handleSpyGuess(io, socket, store, data));
        socket.on('send_chat', (data) => (0, chat_js_1.handleChat)(io, socket, store, data));
        socket.on('leave_room', () => handleLeave(io, socket, store));
        socket.on('disconnect', () => (0, disconnect_js_1.handleDisconnect)(io, socket, store));
        socket.on('kick_player', (data) => handleKick(io, socket, store, data));
        socket.on('update_settings', (data) => handleSettings(io, socket, store, data));
        socket.on('request_restart', () => handleRestart(io, socket, store));
    });
}
// ─── Spy Guess ───────────────────────────────────────────────────────────────
function handleSpyGuess(io, socket, store, data) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const sr = store.getRoom(roomCode);
    if (!sr)
        return;
    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (!playerId)
        return;
    // Only spy can guess
    if (!store.getSpyIds(roomCode).includes(playerId))
        return;
    if (sr.gameState.phase !== 'SPY_GUESS')
        return;
    store.clearPhaseTimer(roomCode);
    const result = store.processSpyGuess(roomCode, data.guess);
    if (!result)
        return;
    io.to(roomCode).emit('spy_guess_result', {
        guess: data.guess,
        correct: result.correct,
        secretWord: result.secretWord,
    });
    // Auto-advance to round finalize after 2s
    setTimeout(() => {
        const votes = store.getPendingVotes(roomCode);
        (0, startGame_js_1.finalizeRound)(io, store, roomCode, {
            votes,
            spyCaught: true,
            spyGuessedCorrectly: result.correct,
        });
    }, 2000);
}
// ─── Leave ────────────────────────────────────────────────────────────────────
function handleLeave(io, socket, store) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const playerId = store.unregisterSocket(roomCode, socket.id);
    if (playerId) {
        store.removePlayer(roomCode, playerId);
        socket.leave(roomCode);
        const sr = store.getRoom(roomCode);
        if (sr) {
            io.to(roomCode).emit('player_left', { playerId });
            io.to(roomCode).emit('room_state', { room: sr.room });
            if (sr.room.players.length === 0) {
                store.deleteRoom(roomCode);
            }
        }
    }
}
// ─── Kick ─────────────────────────────────────────────────────────────────────
function handleKick(io, socket, store, data) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const sr = store.getRoom(roomCode);
    if (!sr)
        return;
    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (sr.room.hostId !== playerId)
        return;
    io.to(roomCode).emit('player_kicked', { playerId: data.targetId });
    store.removePlayer(roomCode, data.targetId);
    io.to(roomCode).emit('room_state', { room: sr.room });
}
// ─── Settings ────────────────────────────────────────────────────────────────
function handleSettings(io, socket, store, data) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const sr = store.getRoom(roomCode);
    if (!sr)
        return;
    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (sr.room.hostId !== playerId)
        return;
    sr.room.settings = { ...sr.room.settings, ...data };
    // Broadcast to all including sender
    io.to(roomCode).emit('settings_updated', { settings: sr.room.settings });
}
// ─── Restart ─────────────────────────────────────────────────────────────────
function handleRestart(io, socket, store) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const sr = store.getRoom(roomCode);
    if (!sr)
        return;
    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (sr.room.hostId !== playerId)
        return;
    store.clearPhaseTimer(roomCode);
    sr.room.status = 'waiting';
    sr.gameState.phase = 'ROOM_WAITING';
    sr.gameState.round = null;
    sr.roundHistory = [];
    store.clearPendingVotes(roomCode);
    Object.keys(sr.gameState.scores).forEach((id) => (sr.gameState.scores[id] = 0));
    io.to(roomCode).emit('room_state', { room: sr.room });
}
//# sourceMappingURL=index.js.map