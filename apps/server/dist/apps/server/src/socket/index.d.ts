import type { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
export declare function registerSocketHandlers(io: GameServer, store: RoomStore): void;
export {};
//# sourceMappingURL=index.d.ts.map