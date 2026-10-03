'use client';

import { motion } from 'framer-motion';
import { Trophy, Crown, RotateCcw, Share2, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getSocket } from '@/hooks/useSocket';
import { Avatar } from '@/components/ui/Avatar';

export function GameResultScreen() {
  const store = useGameStore();
  const socket = getSocket();
  const finalScores = store.finalScores ?? {};
  const winnerId = store.winnerId;
  const players = store.room?.players ?? [];
  const myId = store.myPlayerId;
  const isHost = store.room?.hostId === myId;

  const sortedPlayers = [...players].sort(
    (a, b) => (finalScores[b.id] ?? 0) - (finalScores[a.id] ?? 0)
  );

  const winner = players.find((p) => p.id === winnerId);

  function playAgain() {
    socket.emit('request_restart');
    store.resetGame();
  }

  function share() {
    const text = `DrawSpy Oyun Sonucu!\n\n${sortedPlayers
      .map((p, i) => `#${i + 1} ${p.nickname}: ${finalScores[p.id] ?? 0} Puan`)
      .join('\n')}\n\nSen de katıl: drawspy.com`;

    if (navigator.share) {
      navigator.share({ title: 'DrawSpy Sonuçları', text });
    } else {
      navigator.clipboard.writeText(text);
      alert('Sonuçlar panoya kopyalandı!');
    }
  }

  return (
    <div className="min-h-screen bg-[#060D18] flex items-center justify-center px-4 py-12 font-sans text-slate-100">
      <div className="w-full max-w-lg">

        {/* Winner announcement */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="text-center mb-8"
        >
          <div className="w-24 h-24 mx-auto mb-4 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
            <Trophy className="w-12 h-12" />
          </div>
          <h2 className="font-black text-5xl text-amber-400 mb-2 tracking-wide">OYUN BİTTİ!</h2>
          {winner && (
            <p className="text-slate-300 font-bold text-lg flex items-center justify-center gap-2">
              <Crown className="w-5 h-5 text-amber-400" />
              <span>Kazanan: <span className="text-white font-black">{winner.nickname}</span></span>
            </p>
          )}
        </motion.div>

        {/* Leaderboard */}
        <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 mb-6 shadow-xl">
          <h3 className="font-black text-white mb-5 text-lg text-center flex items-center justify-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" /> Genel Sıralama
          </h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, i) => {
              const score = finalScores[player.id] ?? 0;
              const isWinner = player.id === winnerId;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.1 }}
                  className={`flex items-center gap-3.5 rounded-2xl p-4 border ${
                    isWinner
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-lg shadow-amber-500/10'
                      : 'bg-slate-900/60 border-slate-800'
                  }`}
                >
                  <span className={`text-base font-black w-6 text-center ${i === 0 ? 'text-amber-400' : 'text-slate-500'}`}>
                    #{i + 1}
                  </span>
                  <Avatar id={player.avatarId} size="md" />
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm truncate ${isWinner ? 'text-amber-400' : 'text-white'}`}>
                      {player.nickname}
                      {player.id === myId && <span className="text-cyan-400 text-xs ml-1.5">(Sen)</span>}
                    </p>
                  </div>
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className={`font-black text-xl ${isWinner ? 'text-amber-400' : 'text-white'}`}
                  >
                    {score} <span className="text-xs font-semibold text-slate-500">Puan</span>
                  </motion.span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Stats */}
        {store.roundHistory.length > 0 && (
          <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-5 mb-6 shadow-xl">
            <h3 className="font-bold text-slate-400 mb-3 text-xs uppercase tracking-wider">Oyun İstatistikleri</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-amber-400">
                  {store.roundHistory.filter((r) => r.spyCaught).length}
                </p>
                <p className="text-slate-400 font-semibold text-[11px] mt-0.5">Yakalanan Ajan</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-purple-400">
                  {store.roundHistory.filter((r) => !r.spyCaught).length}
                </p>
                <p className="text-slate-400 font-semibold text-[11px] mt-0.5">Kaçan Ajan</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-cyan-400">
                  {store.roundHistory.filter((r) => r.spyGuessedCorrectly).length}
                </p>
                <p className="text-slate-400 font-semibold text-[11px] mt-0.5">Doğru Tahmin</p>
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-center">
                <p className="text-2xl font-black text-white">
                  {store.roundHistory.length}
                </p>
                <p className="text-slate-400 font-semibold text-[11px] mt-0.5">Oynanan Tur</p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          {isHost && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              onClick={playAgain}
              className="w-full py-4 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Yeniden Oyna</span>
            </motion.button>
          )}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9 }}
            onClick={share}
            className="w-full py-4 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-2xl border border-slate-700 transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
          >
            <Share2 className="w-4 h-4 text-cyan-400" />
            <span>Sonucu Paylaş</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
