import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export declare function handleVoting(io: GameServer, socket: GameSocket, store: RoomStore, data: {
    targetId: string;
}): void;
export {};
//# sourceMappingURL=voting.d.ts.map