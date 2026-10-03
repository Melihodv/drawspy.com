# SpySketch

> **Draw. Blend in. Don't get caught.**

A real-time multiplayer social deduction + drawing game.  
One player is the **Spy** and doesn't know the secret word.  
Can they fool everyone?

## 🎮 How to Play
1. Create or join a room
2. Everyone gets a secret word — except the Spy
3. Take turns drawing parts of a shared picture
4. Vote on who you think the Spy is
5. If caught, the Spy gets one final guess

## 🏗️ Project Structure

```
spysketch/
├── apps/
│   ├── web/        # Next.js 14 frontend
│   └── server/     # Socket.IO + Express game server
└── packages/
    ├── shared/     # Shared TypeScript types
    ├── game-engine/# Core game logic (pure TS, no framework)
    └── words/      # Word database (EN, TR, FR, DE, AR)
```

## 🚀 Quick Start

```bash
pnpm install
pnpm dev
```

- Web: http://localhost:3000
- Server: http://localhost:3001

## 🔧 Tech Stack
- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Realtime**: Socket.IO
- **Database**: PostgreSQL (Supabase)
- **Cache**: Redis (Upstash)
- **Hosting**: Vercel (web) + Railway (server)
