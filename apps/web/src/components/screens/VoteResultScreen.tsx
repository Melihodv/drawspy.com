'use client';

import { motion } from 'framer-motion';
import { Target, ShieldAlert, Users, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { Avatar } from '@/components/ui/Avatar';

export function VoteResultScreen() {
  const store = useGameStore();
  const result = store.voteResult;
  const players = store.room?.players ?? [];

  if (!result) return null;

  const spyPlayer = players.find((p) => p.id === result.spyId);
  const mostVotedPlayer = result.mostVotedId ? players.find((p) => p.id === result.mostVotedId) : null;

  return (
    <div className="min-h-screen bg-[#060D18] flex items-center justify-center px-4 font-sans text-slate-100">
      <div className="text-center max-w-md w-full">

        {result.isTie ? (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-2xl">
              <Users className="w-10 h-10" />
            </div>
            <h2 className="font-black text-4xl text-white mb-2 tracking-wide">BERABERE!</h2>
            <p className="text-slate-400 text-sm mb-4">Oylar eşit çıktı:</p>
            <div className="flex gap-2 justify-center flex-wrap">
              {result.tiedPlayerIds.map((id) => {
                const p = players.find((pl) => pl.id === id);
                return p ? (
                  <div key={id} className="bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2 text-white font-bold text-xs flex items-center gap-2">
                    <Avatar id={p.avatarId} size="sm" />
                    <span>{p.nickname}</span>
                  </div>
                ) : null;
              })}
            </div>
          </motion.div>
        ) : result.spyCaught ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
              <Target className="w-10 h-10" />
            </div>
            <h2 className="font-black text-4xl text-amber-400 mb-2 tracking-wide">AJAN YAKALANDI!</h2>
            <div className="bg-[#0F1C2E] border border-rose-500/40 rounded-3xl p-6 mt-4 shadow-2xl flex flex-col items-center">
              <div className="mb-3">
                <Avatar id={spyPlayer?.avatarId ?? 0} size="xl" />
              </div>
              <p className="text-rose-400 font-black text-2xl">{spyPlayer?.nickname}</p>
              <p className="text-slate-400 text-xs font-semibold mt-1">Gizli Ajandı!</p>
            </div>
            <p className="text-slate-400 text-xs font-semibold mt-4">Kelimeyi tahmin etmesi için son bir şans veriliyor...</p>
          </motion.div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-purple-500/20 border-2 border-purple-400/40 flex items-center justify-center text-purple-400 shadow-2xl shadow-purple-500/20">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="font-black text-4xl text-purple-400 mb-2 tracking-wide">AJAN KAÇTI!</h2>
            <p className="text-slate-400 text-sm mb-4">Ajan herkesi kandırmayı başardı!</p>
            <div className="bg-[#0F1C2E] border border-purple-500/40 rounded-3xl p-6 shadow-2xl flex flex-col items-center">
              <div className="mb-3">
                <Avatar id={spyPlayer?.avatarId ?? 0} size="xl" />
              </div>
              <p className="text-purple-300 font-black text-xl">{spyPlayer?.nickname}</p>
              <p className="text-slate-400 text-xs font-bold mt-1">Gizli Ajandı — +200 Puan kazandı</p>
            </div>
            {mostVotedPlayer && mostVotedPlayer.id !== result.spyId && (
              <p className="text-slate-400 text-xs font-semibold mt-4">
                Elendi: <span className="text-white font-bold">{mostVotedPlayer.nickname}</span> (Masumdu!)
              </p>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}
