import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents, DrawTool, StrokePoint } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export declare const handleDrawEvents: {
    begin(io: GameServer, socket: GameSocket, store: RoomStore, data: {
        strokeId: string;
        tool: DrawTool;
        color: string;
        size: number;
    }): void;
    points(_io: GameServer, socket: GameSocket, store: RoomStore, data: {
        strokeId: string;
        points: StrokePoint[];
    }): void;
    end(io: GameServer, socket: GameSocket, store: RoomStore, data: {
        strokeId: string;
    }): void;
    undo(io: GameServer, socket: GameSocket, store: RoomStore): void;
};
export {};
//# sourceMappingURL=drawing.d.ts.map