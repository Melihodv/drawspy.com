'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getSocket } from '@/hooks/useSocket';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Avatar } from '@/components/ui/Avatar';

export function VotingScreen() {
  const store = useGameStore();
  const socket = getSocket();
  const myId = store.myPlayerId;
  const players = store.room?.players ?? [];
  const myVote = store.myVote;
  const progress = store.voteProgress;

  function vote(targetId: string) {
    if (targetId === myId) return;
    store.setMyVote(targetId);
    socket.emit('submit_vote', { targetId });
  }

  return (
    <div className="min-h-screen bg-[#060D18] flex flex-col items-center justify-center px-4 font-sans text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
            <ShieldAlert className="w-10 h-10" />
          </div>
          <h2 className="font-black text-4xl text-white mb-2 tracking-wide">OYLAMA ZAMANI!</h2>
          <p className="text-slate-400 text-sm">Sence Gizli Ajan Kim?</p>

          {store.phaseEndsAt && (
            <div className="mt-4">
              <CountdownTimer endsAt={store.phaseEndsAt} warningAt={5} large />
            </div>
          )}

          {progress && (
            <p className="text-slate-500 text-xs font-bold mt-3">
              {progress.votedCount} / {progress.totalCount} Oy Kullanıldı
            </p>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {players.map((player, i) => {
            const isMe = player.id === myId;
            const isVoted = myVote === player.id;

            return (
              <motion.button
                key={player.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => !isMe && vote(player.id)}
                disabled={isMe}
                className={`bg-[#0F1C2E] border rounded-3xl p-5 text-center transition-all flex flex-col items-center ${
                  isMe
                    ? 'opacity-40 cursor-not-allowed border-slate-800'
                    : isVoted
                    ? 'border-2 border-cyan-400 bg-cyan-500/10 scale-105 shadow-xl shadow-cyan-500/20'
                    : 'border-slate-800 hover:border-slate-600 hover:scale-102 cursor-pointer'
                }`}
              >
                <div className="mb-3">
                  <Avatar id={player.avatarId} size="xl" />
                </div>
                <p className="font-bold text-white text-sm">{player.nickname}</p>
                {isMe && <p className="text-slate-500 text-xs font-semibold mt-1">(Sen)</p>}
                {isVoted && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="mt-2.5 bg-cyan-400 text-slate-950 text-[11px] font-black rounded-full px-3 py-1 flex items-center gap-1 uppercase tracking-wider shadow-md"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>SENİN OYUN</span>
                  </motion.div>
                )}
              </motion.button>
            );
          })}
        </div>

        {myVote && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-slate-400 text-xs font-semibold mt-6"
          >
            Oyunuz gönderildi. Süre bitene kadar oyunuzu değiştirebilirsiniz.
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
