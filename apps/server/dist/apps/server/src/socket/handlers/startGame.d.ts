import type { Server, Socket } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import type { RoomStore } from '../../store/RoomStore.js';
type GameServer = Server<ClientToServerEvents, ServerToClientEvents>;
type GameSocket = Socket<ClientToServerEvents, ServerToClientEvents>;
export declare function handleStartGame(io: GameServer, socket: GameSocket, store: RoomStore): void;
export declare function startRound(io: GameServer, _socket: GameSocket | null, store: RoomStore, roomCode: string, assignments: Map<string, 'spy' | 'normal'>): void;
export declare function beginDrawingTurn(io: GameServer, store: RoomStore, roomCode: string): void;
export declare function endCurrentTurn(io: GameServer, store: RoomStore, roomCode: string): void;
export declare function startVoting(io: GameServer, store: RoomStore, roomCode: string): void;
export declare function finalizeVotes(io: GameServer, store: RoomStore, roomCode: string): void;
export declare function finalizeRound(io: GameServer, store: RoomStore, roomCode: string, params: {
    votes: any[];
    spyCaught: boolean;
    spyGuessedCorrectly: boolean;
}): void;
export {};
//# sourceMappingURL=startGame.d.ts.map