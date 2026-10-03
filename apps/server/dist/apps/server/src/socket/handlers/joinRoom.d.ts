import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export declare function handleJoinRoom(io: GameServer, socket: GameSocket, store: RoomStore, data: {
    roomCode: string;
    nickname: string;
    avatarId: number;
    sessionToken: string;
}): Promise<void>;
export {};
//# sourceMappingURL=joinRoom.d.ts.map