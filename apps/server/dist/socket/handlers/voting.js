"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleVoting = handleVoting;
const startGame_js_1 = require("./startGame.js");
function handleVoting(io, socket, store, data) {
    const roomCode = socket.roomCode;
    if (!roomCode)
        return;
    const sr = store.getRoom(roomCode);
    if (!sr)
        return;
    if (sr.gameState.phase !== 'VOTING')
        return;
    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (!playerId)
        return;
    // Can't vote for yourself
    if (data.targetId === playerId) {
        socket.emit('error', { code: 'INVALID_VOTE', message: "You can't vote for yourself." });
        return;
    }
    // Target must be in room
    const target = sr.room.players.find((p) => p.id === data.targetId);
    if (!target) {
        socket.emit('error', { code: 'PLAYER_NOT_FOUND', message: 'Player not found.' });
        return;
    }
    // Use store's vote management (handles de-dupe & change)
    const existingVotes = store.getPendingVotes(roomCode);
    const existingIdx = existingVotes.findIndex((v) => v.voterId === playerId);
    const vote = { voterId: playerId, targetId: data.targetId, submittedAt: Date.now() };
    if (existingIdx >= 0) {
        // Update existing vote (allowed to change before timer ends)
        existingVotes[existingIdx] = vote;
    }
    else {
        store.addVote(roomCode, vote);
    }
    const updatedVotes = store.getPendingVotes(roomCode);
    const eligibleVoters = sr.room.players.filter((p) => p.status === 'connected').length;
    // Broadcast vote progress (count only, not who voted for whom)
    io.to(roomCode).emit('vote_progress', {
        votedCount: updatedVotes.length,
        totalCount: eligibleVoters,
    });
    // Auto-finalize if everyone voted
    if (updatedVotes.length >= eligibleVoters) {
        store.clearPhaseTimer(roomCode);
        (0, startGame_js_1.finalizeVotes)(io, store, roomCode);
    }
}
//# sourceMappingURL=voting.js.map