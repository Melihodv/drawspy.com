import 'dotenv/config';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import { RoomStore } from './store/RoomStore.js';
export declare const io: Server<ClientToServerEvents, ServerToClientEvents, import("socket.io").DefaultEventsMap, any>;
export declare const roomStore: RoomStore;
//# sourceMappingURL=index.d.ts.map