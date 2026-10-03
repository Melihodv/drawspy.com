import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export declare function handleChat(io: GameServer, socket: GameSocket, store: RoomStore, data: {
    text: string;
}): void;
export {};
//# sourceMappingURL=chat.d.ts.map