import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export declare function handleDisconnect(io: GameServer, socket: GameSocket, store: RoomStore): void;
export {};
//# sourceMappingURL=disconnect.d.ts.map