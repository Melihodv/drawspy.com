import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { Server } from 'socket.io';
import type { ClientToServerEvents, ServerToClientEvents } from '@drawspy/shared';
import { roomRouter } from './routes/rooms.js';
import { registerSocketHandlers } from './socket/index.js';
import { RoomStore } from './store/RoomStore.js';

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

const isAllowedOrigin = (origin: string | undefined): boolean => {
  if (!origin) return true;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (origin.endsWith('.vercel.app')) return true;
  return false;
};

const app = express();
app.set('trust proxy', 1); // Trust first proxy (Nginx / Cloudflare) so real client IPs are used

const httpServer = http.createServer(app);

// ─── Security Headers ─────────────────────────────────────────────────────────
app.use(helmet({
  contentSecurityPolicy: false, // Allow WebSocket connections
}));

// ─── CORS ─────────────────────────────────────────────────────────────────────
app.use(cors({
  origin: (origin, callback) => {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(express.json({ limit: '10kb' }));

// ─── Rate Limiting ────────────────────────────────────────────────────────────
const apiLimiter = rateLimit({
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
    rooms: roomStore?.getRoomCount() ?? 0,
    players: roomStore?.getPlayerCount() ?? 0,
    memoryUsageMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
    timestamp: new Date().toISOString(),
  });
});

// ─── REST API ─────────────────────────────────────────────────────────────────
app.use('/api', roomRouter);

// ─── 404 ─────────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Not found' });
});

// ─── Socket.IO ────────────────────────────────────────────────────────────────
export const io = new Server<ClientToServerEvents, ServerToClientEvents>(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
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
export const roomStore = new RoomStore();

// ─── Socket Handlers ──────────────────────────────────────────────────────────
registerSocketHandlers(io, roomStore);

// ─── Start ────────────────────────────────────────────────────────────────────
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 DrawSpy server running on port ${PORT} [${NODE_ENV}]`);
  console.log(`   Accepting connections from: ${ALLOWED_ORIGINS.join(', ')}`);
});

// ─── Graceful Shutdown ────────────────────────────────────────────────────────
function shutdown(signal: string) {
  console.log(`\n⚠️  ${signal} received. Shutting down gracefully...`);
  io.close(() => {
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
