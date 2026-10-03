import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, CheckCircle2, Send, MessageSquare } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getSocket } from '@/hooks/useSocket';
import { CountdownTimer } from '@/components/ui/CountdownTimer';
import { Avatar } from '@/components/ui/Avatar';
import { useTranslation } from '@/utils/i18n';

export function VotingScreen() {
  const store = useGameStore();
  const t = useTranslation(store.language);
  const socket = getSocket();
  const myId = store.myPlayerId;
  const players = store.room?.players ?? [];
  const myVote = store.myVote;
  const progress = store.voteProgress;
  const [chatText, setChatText] = useState('');

  function vote(targetId: string) {
    if (targetId === myId) return;
    store.setMyVote(targetId);
    socket.emit('submit_vote', { targetId });
  }

  function sendChat() {
    if (!chatText.trim()) return;
    socket.emit('send_chat', { text: chatText.trim() });
    setChatText('');
  }

  return (
    <div className="min-h-screen bg-[#060D18] flex flex-col lg:flex-row font-sans text-slate-100">
      {/* Main Voting Panel */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-4 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
              <ShieldAlert className="w-10 h-10" />
            </div>
            <h2 className="font-black text-4xl text-white mb-2 tracking-wide uppercase">{t('voteTitle')}</h2>
            <p className="text-slate-400 text-sm">{t('whoIsSpy')}</p>

            {store.phaseEndsAt && (
              <div className="mt-4">
                <CountdownTimer endsAt={store.phaseEndsAt} warningAt={5} large />
              </div>
            )}

            {progress && (
              <p className="text-slate-500 text-xs font-bold mt-3">
                {progress.votedCount} / {progress.totalCount} {t('votesSubmitted')}
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
                  {isMe && <p className="text-slate-500 text-xs font-semibold mt-1">({t('you')})</p>}
                  {isVoted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="mt-2.5 bg-cyan-400 text-slate-950 text-[11px] font-black rounded-full px-3 py-1 flex items-center gap-1 uppercase tracking-wider shadow-md"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{t('yourVote')}</span>
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
              {t('voteHelp')}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Live Chat Panel for Discussion Phase */}
      <div className="w-full lg:w-80 bg-[#0F1C2E] border-t lg:border-t-0 lg:border-l border-slate-800 flex flex-col h-72 lg:h-auto">
        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-cyan-400" />
          <p className="text-white text-xs font-black uppercase tracking-wider">{t('liveChat')}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {store.chatMessages.length === 0 ? (
            <p className="text-slate-500 text-xs text-center py-6">{t('typeMessage')}</p>
          ) : (
            store.chatMessages.map((msg, i) => (
              <div key={i} className="text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/60">
                <span className="text-cyan-400 font-extrabold">{msg.nickname}: </span>
                <span className="text-slate-200">{msg.text}</span>
              </div>
            ))
          )}
        </div>

        <div className="p-3 border-t border-slate-800 flex gap-2">
          <input
            value={chatText}
            onChange={(e) => setChatText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendChat()}
            placeholder={t('typeMessage')}
            maxLength={150}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:border-cyan-400 outline-none"
          />
          <button
            onClick={sendChat}
            className="p-2.5 bg-gradient-to-r from-cyan-500 to-sky-500 text-slate-950 font-black rounded-xl hover:from-cyan-400 hover:to-sky-400 transition-all hover:scale-105"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
