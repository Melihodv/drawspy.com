"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleDrawEvents = void 0;
const shared_1 = require("@drawspy/shared");
// Active stroke buffers per socket
const activeStrokes = new Map();
exports.handleDrawEvents = {
    begin(io, socket, store, data) {
        const roomCode = socket.roomCode;
        if (!roomCode)
            return;
        const sr = store.getRoom(roomCode);
        if (!sr?.gameState.round)
            return;
        if (sr.gameState.phase !== 'DRAWING')
            return;
        const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
        if (!playerId)
            return;
        if (sr.gameState.round.currentTurnPlayerId !== playerId) {
            socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn.' });
            return;
        }
        // Validate tool and color
        const validTools = ['pen', 'eraser'];
        if (!validTools.includes(data.tool))
            return;
        if (!shared_1.COLOR_PALETTE.includes(data.color) && data.tool !== 'eraser')
            return;
        if (!shared_1.BRUSH_SIZES.includes(data.size))
            return;
        const stroke = {
            strokeId: data.strokeId,
            playerId,
            tool: data.tool,
            color: data.color,
            size: data.size,
            points: [],
        };
        activeStrokes.set(socket.id, stroke);
    },
    points(_io, socket, store, data) {
        const roomCode = socket.roomCode;
        if (!roomCode)
            return;
        const sr = store.getRoom(roomCode);
        if (!sr?.gameState.round)
            return;
        if (sr.gameState.phase !== 'DRAWING')
            return;
        const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
        if (sr.gameState.round.currentTurnPlayerId !== playerId)
            return;
        const stroke = activeStrokes.get(socket.id);
        if (!stroke || stroke.strokeId !== data.strokeId)
            return;
        // Validate coordinates
        const validPoints = data.points.filter((p) => p.x >= 0 && p.x <= shared_1.CANVAS_WIDTH && p.y >= 0 && p.y <= shared_1.CANVAS_HEIGHT);
        stroke.points.push(...validPoints);
        // Broadcast to everyone in room (including sender for confirmation)
        const partialStroke = { ...stroke, points: validPoints };
        socket.to(roomCode).emit('draw_update', { stroke: partialStroke });
    },
    end(io, socket, store, data) {
        const roomCode = socket.roomCode;
        if (!roomCode)
            return;
        const stroke = activeStrokes.get(socket.id);
        if (!stroke || stroke.strokeId !== data.strokeId)
            return;
        store.addStroke(roomCode, stroke);
        activeStrokes.delete(socket.id);
    },
    undo(io, socket, store) {
        const roomCode = socket.roomCode;
        if (!roomCode)
            return;
        const sr = store.getRoom(roomCode);
        if (!sr?.gameState.round)
            return;
        if (sr.gameState.phase !== 'DRAWING')
            return;
        const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
        if (sr.gameState.round.currentTurnPlayerId !== playerId)
            return;
        const removed = store.removeLastStroke(roomCode, playerId);
        if (removed) {
            io.to(roomCode).emit('draw_undo_applied', {
                playerId,
                strokeId: removed.strokeId,
            });
        }
    },
};
//# sourceMappingURL=drawing.js.map