'use client';

import { motion } from 'framer-motion';
import { Trophy, Target, ShieldAlert, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Avatar } from '@/components/ui/Avatar';

export function RoundResultScreen() {
  const store = useGameStore();
  const summary = store.roundSummary;
  const players = store.room?.players ?? [];
  const scores = store.room?.players.reduce<Record<string, number>>((acc, p) => {
    acc[p.id] = p.score;
    return acc;
  }, {}) ?? {};

  if (!summary) return null;

  const sortedPlayers = [...players].sort((a, b) => (scores[b.id] ?? 0) - (scores[a.id] ?? 0));
  const spyPlayer = players.find((p) => p.id === summary.spyId);

  return (
    <div className="min-h-screen bg-[#060D18] flex items-center justify-center px-4 font-sans text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg"
      >
        <div className="text-center mb-6">
          <h2 className="font-black text-4xl text-white mb-2 tracking-wide">
            Tur {summary.roundNumber} Sonucu
          </h2>
          <p className="text-slate-400 text-sm">
            Gizli Kelime: <span className="text-amber-400 font-extrabold text-base">"{summary.secretWord}"</span>
          </p>
        </div>

        {/* Outcome banner */}
        <div className={`rounded-2xl p-4 mb-6 text-center border font-bold text-sm ${
          summary.spyGuessedCorrectly
            ? 'bg-purple-500/20 border-purple-500/40 text-purple-300'
            : summary.spyCaught
            ? 'bg-amber-500/10 border-amber-500/30 text-amber-300'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
        }`}>
          {summary.spyGuessedCorrectly && (
            <p className="flex items-center justify-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>{spyPlayer?.nickname} kelimeyi bildi! Ajan turu çaldı!</span>
            </p>
          )}
          {summary.spyCaught && !summary.spyGuessedCorrectly && (
            <p className="flex items-center justify-center gap-2">
              <Target className="w-4 h-4 text-amber-400" />
              <span>{spyPlayer?.nickname} Ajandı ve yakalandı!</span>
            </p>
          )}
          {!summary.spyCaught && (
            <p className="flex items-center justify-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <span>{spyPlayer?.nickname} herkesi kandırdı! +200 Puan!</span>
            </p>
          )}
        </div>

        {/* Scoreboard */}
        <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 className="font-black text-white mb-4 text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" /> Puan Tablosu
          </h3>
          <div className="space-y-3">
            {sortedPlayers.map((player, i) => {
              const delta = summary.scoreDeltas[player.id] ?? 0;
              return (
                <motion.div
                  key={player.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center gap-3"
                >
                  <span className="text-sm font-black text-slate-500 w-5">{i + 1}</span>
                  <Avatar id={player.avatarId} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white text-sm truncate">{player.nickname}</span>
                      <div className="flex items-center gap-2">
                        {delta > 0 && (
                          <motion.span
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 + i * 0.07 }}
                            className="text-emerald-400 text-xs font-bold"
                          >
                            +{delta}
                          </motion.span>
                        )}
                        <span className="font-extrabold text-amber-400 text-sm">{scores[player.id] ?? 0}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-slate-900 rounded-full mt-1.5 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, ((scores[player.id] ?? 0) / Math.max(1, ...Object.values(scores))) * 100)}%` }}
                        transition={{ delay: 0.3 + i * 0.07, duration: 0.6 }}
                        className="h-full bg-cyan-400 rounded-full"
                      />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        <p className="text-center text-slate-500 text-xs font-semibold mt-6 animate-pulse">
          Sonraki tur birazdan başlıyor...
        </p>
      </motion.div>
    </div>
  );
}
