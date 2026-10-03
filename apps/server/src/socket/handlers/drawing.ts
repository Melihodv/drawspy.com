import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, DrawTool, Stroke, StrokePoint } from '@drawspy/shared';
import { generateId } from '@drawspy/game-engine';
import { CANVAS_WIDTH, CANVAS_HEIGHT, BRUSH_SIZES, COLOR_PALETTE } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';

type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;

// Active stroke buffers per socket
const activeStrokes = new Map<string, Stroke>();

export const handleDrawEvents = {
  begin(
    io: GameServer,
    socket: GameSocket,
    store: RoomStore,
    data: { strokeId: string; tool: DrawTool; color: string; size: number }
  ): void {
    const roomCode = (socket as any).roomCode as string | undefined;
    if (!roomCode) return;

    const sr = store.getRoom(roomCode);
    if (!sr?.gameState.round) return;
    if (sr.gameState.phase !== 'DRAWING') return;

    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (!playerId) return;
    if (sr.gameState.round.currentTurnPlayerId !== playerId) {
      socket.emit('error', { code: 'NOT_YOUR_TURN', message: 'Not your turn.' });
      return;
    }

    // Validate tool and color
    const validTools: DrawTool[] = ['pen', 'eraser'];
    if (!validTools.includes(data.tool)) return;
    if (!COLOR_PALETTE.includes(data.color as any) && data.tool !== 'eraser') return;
    if (!BRUSH_SIZES.includes(data.size as any)) return;

    const stroke: Stroke = {
      strokeId: data.strokeId,
      playerId,
      tool: data.tool,
      color: data.color,
      size: data.size,
      points: [],
    };

    activeStrokes.set(socket.id, stroke);
  },

  points(
    _io: GameServer,
    socket: GameSocket,
    store: RoomStore,
    data: { strokeId: string; points: StrokePoint[] }
  ): void {
    const roomCode = (socket as any).roomCode as string | undefined;
    if (!roomCode) return;

    const sr = store.getRoom(roomCode);
    if (!sr?.gameState.round) return;
    if (sr.gameState.phase !== 'DRAWING') return;

    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (sr.gameState.round.currentTurnPlayerId !== playerId) return;

    const stroke = activeStrokes.get(socket.id);
    if (!stroke || stroke.strokeId !== data.strokeId) return;

    // Validate coordinates
    const validPoints = data.points.filter(
      (p) => p.x >= 0 && p.x <= CANVAS_WIDTH && p.y >= 0 && p.y <= CANVAS_HEIGHT
    );

    stroke.points.push(...validPoints);

    // Broadcast to everyone in room (including sender for confirmation)
    const partialStroke: Stroke = { ...stroke, points: validPoints };
    socket.to(roomCode).emit('draw_update', { stroke: partialStroke });
  },

  end(
    io: GameServer,
    socket: GameSocket,
    store: RoomStore,
    data: { strokeId: string }
  ): void {
    const roomCode = (socket as any).roomCode as string | undefined;
    if (!roomCode) return;

    const stroke = activeStrokes.get(socket.id);
    if (!stroke || stroke.strokeId !== data.strokeId) return;

    store.addStroke(roomCode, stroke);
    activeStrokes.delete(socket.id);
  },

  undo(
    io: GameServer,
    socket: GameSocket,
    store: RoomStore
  ): void {
    const roomCode = (socket as any).roomCode as string | undefined;
    if (!roomCode) return;

    const sr = store.getRoom(roomCode);
    if (!sr?.gameState.round) return;
    if (sr.gameState.phase !== 'DRAWING') return;

    const playerId = store.getPlayerIdBySocket(roomCode, socket.id);
    if (sr.gameState.round.currentTurnPlayerId !== playerId) return;

    const removed = store.removeLastStroke(roomCode, playerId);
    if (removed) {
      io.to(roomCode).emit('draw_undo_applied', {
        playerId,
        strokeId: removed.strokeId,
      });
    }
  },
};
