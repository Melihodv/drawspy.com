'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Crown, Copy, Check, Users, Share2, Play, Settings, X, UserPlus, Eye, EyeOff } from 'lucide-react';

import { useGameStore } from '@/store/gameStore';
import { getSocket } from '@/hooks/useSocket';
import { Avatar } from '@/components/ui/Avatar';

interface LobbyScreenProps {
  roomCode: string;
}

export function LobbyScreen({ roomCode }: LobbyScreenProps) {
  const store = useGameStore();
  const socket = getSocket();
  const [copied, setCopied] = useState(false);
  const [hideCode, setHideCode] = useState(false);

  const room = store.room;
  const myId = store.myPlayerId;
  const isHost = room?.hostId === myId;

  const roomUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/room/${roomCode}`
    : `https://drawspy.com/room/${roomCode}`;

  function copyLink() {
    navigator.clipboard.writeText(roomUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function startGame() {
    socket.emit('start_game');
  }

  function kickPlayer(playerId: string) {
    socket.emit('kick_player', { targetId: playerId });
  }

  const players = room?.players ?? [];
  const minPlayers = process.env.NODE_ENV === 'production' ? 3 : 1;
  const canStart = isHost && players.length >= minPlayers;

  return (
    <div className="min-h-screen bg-[#060D18] p-4 md:p-8 text-slate-100 font-sans">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="font-extrabold text-3xl tracking-tight">
              Draw<span className="text-cyan-400">Spy</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">Lobi · Oyuncular bekleniyor</p>
          </div>
          
          {/* Streamer Code Masking Pill */}
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 shadow-md">
            <button
              onClick={() => setHideCode(!hideCode)}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title={hideCode ? 'Kodu Göster' : 'Yayıncı Modu (Kodu Gizle)'}
            >
              {hideCode ? <EyeOff className="w-4 h-4 text-rose-400" /> : <Eye className="w-4 h-4 text-cyan-400" />}
            </button>
            <span className="text-slate-400 text-sm font-semibold">Oda Kodu:</span>
            <span className="font-mono font-black text-amber-400 text-xl tracking-widest">
              {hideCode ? '******' : roomCode}
            </span>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">

          {/* Players */}
          <div className="md:col-span-2">
            <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-black text-white text-lg flex items-center gap-2">
                  <Users className="w-5 h-5 text-cyan-400" />
                  Oyuncular <span className="text-cyan-400">{players.length}</span>
                  <span className="text-slate-500">/{room?.settings.maxPlayers ?? 8}</span>
                </h2>
                {players.length < minPlayers && (
                  <span className="text-amber-400/80 text-xs font-semibold">
                    {minPlayers - players.length} oyuncu daha gerekli
                  </span>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <AnimatePresence>
                  {players.map((player) => (
                    <motion.div
                      key={player.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-2xl px-3.5 py-3"
                    >
                      <Avatar id={player.avatarId} size="md" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-white text-sm truncate flex items-center gap-1.5">
                          <span>{player.nickname}</span>
                          {player.id === myId && <span className="text-cyan-400 text-xs">(sen)</span>}
                        </p>
                        {player.isHost && (
                          <span className="text-amber-400 text-xs font-extrabold flex items-center gap-1 mt-0.5">
                            <Crown className="w-3 h-3 fill-current" /> Kurucu
                          </span>
                        )}
                        {player.status === 'disconnected' && (
                          <span className="text-rose-400 text-xs font-semibold">Yeniden bağlanıyor...</span>
                        )}
                      </div>
                      {isHost && player.id !== myId && (
                        <button
                          onClick={() => kickPlayer(player.id)}
                          className="p-1 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Empty slots */}
                {Array.from({ length: Math.max(0, (room?.settings.maxPlayers ?? 8) - players.length) }).slice(0, 4).map((_, i) => (
                  <div key={`empty-${i}`} className="flex items-center gap-3 bg-slate-900/30 rounded-2xl px-4 py-3 border border-dashed border-slate-800">
                    <div className="w-9 h-9 rounded-full bg-slate-800 flex items-center justify-center text-slate-600">
                      <UserPlus className="w-4 h-4" />
                    </div>
                    <p className="text-slate-600 text-xs font-semibold">Bekleniyor...</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="space-y-4">

            {/* Invite card */}
            <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="font-black text-white mb-3 flex items-center gap-2">
                <Share2 className="w-4 h-4 text-cyan-400" /> Davet Et
              </h3>
              <div className="bg-slate-900 rounded-xl p-3 mb-3 border border-slate-800">
                <p className="text-slate-400 text-xs mb-1 font-semibold">Oda Bağlantısı:</p>
                <p className="text-cyan-400 text-xs font-mono truncate">{roomUrl}</p>
              </div>
              <button
                onClick={copyLink}
                className={`w-full py-3.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
                  copied
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                    : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/20'
                }`}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Kopyalandı!' : 'Bağlantıyı Kopyala'}
              </button>
            </div>

            {/* Settings preview */}
            <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 shadow-xl">
              <h3 className="font-black text-white mb-3 flex items-center gap-2">
                <Settings className="w-4 h-4 text-purple-400" /> Kurallar
              </h3>
              <div className="space-y-2.5 text-xs font-semibold text-slate-400">
                <div className="flex justify-between">
                  <span>Tur Sayısı:</span>
                  <span className="text-white font-bold">{room?.settings.roundCount ?? 5} Tur</span>
                </div>
                <div className="flex justify-between">
                  <span>Çizim Süresi:</span>
                  <span className="text-white font-bold">{room?.settings.drawingTimeSec ?? 7} Saniye</span>
                </div>
                <div className="flex justify-between">
                  <span>Kategori:</span>
                  <span className="text-white font-bold capitalize">{room?.settings.category ?? 'Rastgele'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Ajan İpucu:</span>
                  <span className="text-white font-bold">{room?.settings.categoryHintEnabled ? 'Açık' : 'Kapalı'}</span>
                </div>
              </div>
            </div>

            {/* Start button */}
            {isHost ? (
              <button
                onClick={startGame}
                disabled={!canStart}
                className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                <Play className="w-4 h-4 fill-current" />
                {canStart ? 'Oyunu Başlat' : `Başlamak İçin En Az ${minPlayers} Oyuncu Gerekli`}
              </button>
            ) : (
              <div className="bg-[#0F1C2E] border border-slate-800 rounded-2xl p-4 text-center">
                <div className="w-5 h-5 border-2 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mx-auto mb-2" />
                <p className="text-slate-400 text-xs font-semibold">Kurucunun oyunu başlatması bekleniyor...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
