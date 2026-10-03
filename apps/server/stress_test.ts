import { io as SocketClient, type Socket } from 'socket.io-client';

const SERVER_URL = process.env.SERVER_URL ?? 'http://localhost:3001';
const CONCURRENT_CLIENTS = Number(process.argv.find((arg) => arg.startsWith('--clients='))?.split('=')[1] ?? 100);
const RAMP_UP_MS = Number(process.argv.find((arg) => arg.startsWith('--rampup='))?.split('=')[1] ?? 3000);

console.log(`\n🔥 ========================================================`);
console.log(`🔥 DRAWSPY LOAD TESTER - STREAMER BURST SIMULATION`);
console.log(`🔥 Target Server : ${SERVER_URL}`);
console.log(`🔥 Total Clients : ${CONCURRENT_CLIENTS} bots`);
console.log(`🔥 Ramp-up Time  : ${RAMP_UP_MS} ms`);
console.log(`🔥 ========================================================\n`);

interface ClientStats {
  httpLatencyMs: number;
  socketConnectMs: number;
  joinedRoom: boolean;
  errorCode: string | null;
}

const stats: ClientStats[] = [];
let activeSockets: Socket[] = [];

async function simulateClient(index: number): Promise<void> {
  const nickname = `BotPlayer_${index + 1}`;
  const avatarId = index % 22;
  const startHttp = Date.now();

  try {
    // 1. REST Public Matchmaking
    const res = await fetch(`${SERVER_URL}/api/matchmake`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname, avatarId }),
    });

    const httpLatencyMs = Date.now() - startHttp;
    if (!res.ok) {
      stats.push({ httpLatencyMs, socketConnectMs: 0, joinedRoom: false, errorCode: `HTTP_${res.status}` });
      return;
    }

    const data = (await res.json()) as { roomCode: string; sessionToken: string; playerId: string };
    const startSocket = Date.now();

    // 2. WebSocket Connection
    const socket = SocketClient(SERVER_URL, {
      transports: ['websocket'],
      forceNew: true,
      reconnection: false,
    });

    activeSockets.push(socket);

    await new Promise<void>((resolve) => {
      const timeout = setTimeout(() => {
        stats.push({ httpLatencyMs, socketConnectMs: Date.now() - startSocket, joinedRoom: false, errorCode: 'SOCKET_TIMEOUT' });
        socket.disconnect();
        resolve();
      }, 10000);

      socket.on('connect', () => {
        const socketConnectMs = Date.now() - startSocket;

        socket.on('room_state', () => {
          clearTimeout(timeout);
          stats.push({ httpLatencyMs, socketConnectMs, joinedRoom: true, errorCode: null });

          // Random heartbeat chat
          if (index % 5 === 0) {
            socket.emit('send_chat', { text: `Hello from bot ${index + 1}!` });
          }

          resolve();
        });

        socket.on('error', (err) => {
          clearTimeout(timeout);
          stats.push({ httpLatencyMs, socketConnectMs, joinedRoom: false, errorCode: err.code || 'JOIN_ERROR' });
          socket.disconnect();
          resolve();
        });

        socket.emit('join_room', {
          roomCode: data.roomCode,
          nickname,
          avatarId,
          sessionToken: data.sessionToken,
        });
      });

      socket.on('connect_error', (err) => {
        clearTimeout(timeout);
        stats.push({ httpLatencyMs, socketConnectMs: Date.now() - startSocket, joinedRoom: false, errorCode: 'CONNECT_ERROR' });
        resolve();
      });
    });
  } catch (err: any) {
    stats.push({ httpLatencyMs: Date.now() - startHttp, socketConnectMs: 0, joinedRoom: false, errorCode: err.message || 'FETCH_ERROR' });
  }
}

async function run() {
  const startTime = Date.now();
  const delayBetweenClients = RAMP_UP_MS / CONCURRENT_CLIENTS;

  console.log(`⏳ Spawning ${CONCURRENT_CLIENTS} bots over ${RAMP_UP_MS}ms (${Math.round(delayBetweenClients)}ms interval)...`);

  const promises: Promise<void>[] = [];
  for (let i = 0; i < CONCURRENT_CLIENTS; i++) {
    promises.push(simulateClient(i));
    if (delayBetweenClients > 0) {
      await new Promise((r) => setTimeout(r, delayBetweenClients));
    }
  }

  await Promise.all(promises);
  const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(2);

  // Analyze metrics
  const successful = stats.filter((s) => s.joinedRoom).length;
  const failed = stats.filter((s) => !s.joinedRoom).length;

  const httpLatencies = stats.map((s) => s.httpLatencyMs).sort((a, b) => a - b);
  const socketLatencies = stats.filter((s) => s.joinedRoom).map((s) => s.socketConnectMs).sort((a, b) => a - b);

  const p50Http = httpLatencies[Math.floor(httpLatencies.length * 0.5)] ?? 0;
  const p95Http = httpLatencies[Math.floor(httpLatencies.length * 0.95)] ?? 0;
  const p99Http = httpLatencies[Math.floor(httpLatencies.length * 0.99)] ?? 0;

  const p50Socket = socketLatencies[Math.floor(socketLatencies.length * 0.5)] ?? 0;
  const p95Socket = socketLatencies[Math.floor(socketLatencies.length * 0.95)] ?? 0;

  // Fetch Server Health
  let healthInfo = 'N/A';
  try {
    const res = await fetch(`${SERVER_URL}/health`);
    healthInfo = await res.text();
  } catch {}

  console.log(`\n📊 ================= TEST RESULTS =================`);
  console.log(`⏱️  Total Duration     : ${totalTimeSec} s`);
  console.log(`✅ Joined Rooms        : ${successful} / ${CONCURRENT_CLIENTS} (${Math.round((successful / CONCURRENT_CLIENTS) * 100)}%)`);
  console.log(`❌ Failed Connections  : ${failed}`);
  if (failed > 0) {
    const errorCounts: Record<string, number> = {};
    stats.filter((s) => !s.joinedRoom).forEach((s) => {
      const code = s.errorCode || 'UNKNOWN';
      errorCounts[code] = (errorCounts[code] || 0) + 1;
    });
    console.log(`⚠️  Error Breakdown    :`, JSON.stringify(errorCounts));
  }
  console.log(`🌐 HTTP Latency (p50)  : ${p50Http} ms`);
  console.log(`🌐 HTTP Latency (p95)  : ${p95Http} ms`);
  console.log(`🌐 HTTP Latency (p99)  : ${p99Http} ms`);
  console.log(`🔌 Socket Connect(p50) : ${p50Socket} ms`);
  console.log(`🔌 Socket Connect(p95) : ${p95Socket} ms`);
  console.log(`🏥 Server Health Stats : ${healthInfo}`);
  console.log(`====================================================\n`);

  // Teardown
  console.log(`🧹 Cleaning up ${activeSockets.length} socket connections...`);
  activeSockets.forEach((s) => s.disconnect());
  console.log(`✨ Load test finished.\n`);
  process.exit(0);
}

run();
