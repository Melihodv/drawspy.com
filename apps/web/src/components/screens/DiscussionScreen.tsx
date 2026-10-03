'use client';

import { motion } from 'framer-motion';
import { MessageSquare, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Avatar } from '@/components/ui/Avatar';

export function DiscussionScreen() {
  const store = useGameStore();
  const players = store.room?.players ?? [];

  return (
    <div className="min-h-screen bg-[#060D18] flex flex-col items-center justify-center px-4 text-center font-sans text-slate-100">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200 }}
        className="max-w-md w-full"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-cyan-500/20 border-2 border-cyan-400/40 flex items-center justify-center text-cyan-400 shadow-2xl shadow-cyan-500/20">
          <MessageSquare className="w-10 h-10" />
        </div>

        <h2 className="font-black text-4xl text-white mb-2 tracking-wide">TARTIŞMA ZAMANI!</h2>
        <p className="text-slate-400 text-sm mb-6">
          Kim çizimin ne olduğunu bilmiyor gibi görünüyor?
        </p>

        {store.phaseEndsAt && (
          <div className="mb-6">
            <CountdownTimer endsAt={store.phaseEndsAt} warningAt={5} large />
          </div>
        )}

        <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 shadow-xl">
          <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center justify-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-400" /> Odadaki Oyuncular
          </p>
          <div className="flex flex-wrap gap-2.5 justify-center">
            {players.map((p) => (
              <div key={p.id} className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-2xl px-3 py-2">
                <Avatar id={p.avatarId} size="sm" />
                <span className="text-white text-xs font-bold">{p.nickname}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-slate-500 text-xs font-semibold mt-6">
          Oylama birazdan başlayacak...
        </p>
      </motion.div>

      {/* Chat overlay */}
      <div className="fixed bottom-0 left-0 right-0 bg-slate-900/90 border-t border-slate-800 p-4 backdrop-blur-md">
        <div className="max-w-lg mx-auto space-y-1.5 max-h-28 overflow-y-auto text-left">
          {store.chatMessages.slice(-5).map((msg, i) => (
            <div key={i} className="text-xs">
              <span className="text-cyan-400 font-bold">{msg.nickname}: </span>
              <span className="text-slate-300">{msg.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
