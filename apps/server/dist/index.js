"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomStore = exports.io = void 0;
require("dotenv/config");
const http_1 = __importDefault(require("http"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const socket_io_1 = require("socket.io");
const rooms_js_1 = require("./routes/rooms.js");
const index_js_1 = require("./socket/index.js");
const RoomStore_js_1 = require("./store/RoomStore.js");
const PORT = Number(process.env.PORT ?? 3001);
const CLIENT_URL = process.env.CLIENT_URL ?? 'http://localhost:3000';
const NODE_ENV = process.env.NODE_ENV ?? 'development';
const ALLOWED_ORIGINS = [
    CLIENT_URL,
    'http://localhost:3000',
    'https://drawspy.com',
    'https://www.drawspy.com',
    'https://drawspy-com.vercel.app',
];
const isAllowedOrigin = (origin) => {
    if (!origin)
        return true;
    if (ALLOWED_ORIGINS.includes(origin))
        return true;
    if (origin.endsWith('.vercel.app'))
        return true;
    return false;
};
const app = (0, express_1.default)();
app.set('trust proxy', 1); // Trust first proxy (Nginx / Cloudflare) so real client IPs are used
const httpServer = http_1.default.createServer(app);
// ─── Security Headers ─────────────────────────────────────────────────────────
app.use((0, helmet_1.default)({
    contentSecurityPolicy: false, // Allow WebSocket connections
}));
// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (isAllowedOrigin(origin)) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
}));
app.use(express_1.default.json({ limit: '10kb' }));
// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5000, // Allow up to 5000 requests per minute to easily support 1,000+ live streamer viewers
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests, please slow down.' },
});
app.use('/api', apiLimiter);
// ─── Health ───────────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
    res.json({
        ok: true,
        uptime: Math.round(process.uptime()),
        env: NODE_ENV,
        rooms: exports.roomStore?.getRoomCount() ?? 0,
        players: exports.roomStore?.getPlayerCount() ?? 0,
        memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        timestamp: new Date().toISOString(),
    });
});
// ─── REST API ─────────────────────────────────────────────────────────────────
app.use('/api', rooms_js_1.roomRouter);
// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
    res.status(404).json({ error: 'Not found' });
});
// ─── Socket.IO ────────────────────────────────────────────────────────────────
exports.io = new socket_io_1.Server(httpServer, {
    cors: {
        origin: (origin, callback) => {
            if (isAllowedOrigin(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error('Not allowed by CORS'));
            }
        },
        credentials: true,
    },
    transports: ['websocket', 'polling'],
    pingTimeout: 20000,
    pingInterval: 10000,
    perMessageDeflate: false, // Disable WebSocket compression to save CPU on 1000+ connections
    maxHttpBufferSize: 1e6, // 1MB payload limit
});
// ─── Room Store ───────────────────────────────────────────────────────────────
exports.roomStore = new RoomStore_js_1.RoomStore();
// ─── Socket Handlers ──────────────────────────────────────────────────────────
(0, index_js_1.registerSocketHandlers)(exports.io, exports.roomStore);
// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, () => {
    console.log(`🚀 DrawSpy server running on port ${PORT} [${NODE_ENV}]`);
    console.log(`   Accepting connections from: ${ALLOWED_ORIGINS.join(', ')}`);
});
// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal) {
    console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
    exports.io.close(() => {
        console.log('   Socket.IO closed.');
        httpServer.close(() => {
            console.log('   HTTP server closed. Bye!');
            process.exit(0);
        });
    });
    // Force exit after 10s
    setTimeout(() => {
        console.error('   Forced shutdown after timeout.');
        process.exit(1);
    }, 10_000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('uncaughtException', (err) => {
    console.error('💥 Uncaught Exception:', err);
    process.exit(1);
});
process.on('unhandledRejection', (reason) => {
    console.error('💥 Unhandled Rejection:', reason);
});
//# sourceMappingURL=index.js.map