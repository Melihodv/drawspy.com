'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Sparkles, XCircle, CheckCircle2, Target } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { getSocket } from '@/hooks/useSocket';
import { CountdownTimer } from '@/components/ui/CountdownTimer';

export function SpyGuessScreen() {
  const store = useGameStore();
  const socket = getSocket();
  const myId = store.myPlayerId;
  const isSpy = store.voteResult?.spyId === myId;
  const [guess, setGuess] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const guessResult = store.spyGuessResult;

  function submitGuess() {
    if (!guess.trim() || submitted) return;
    socket.emit('submit_spy_guess', { guess: guess.trim() });
    setSubmitted(true);
  }

  if (guessResult) {
    return (
      <div className="min-h-screen bg-[#060D18] flex items-center justify-center px-4 font-sans text-slate-100">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-center max-w-md w-full"
        >
          {guessResult.correct ? (
            <div className="bg-[#0F1C2E] border border-amber-500/40 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-amber-500/20 border-2 border-amber-400/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20">
                <Sparkles className="w-10 h-10" />
              </div>
              <h2 className="font-black text-4xl text-amber-400 mb-3 tracking-wide">DOĞRU TAHMİN!</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-4">
                Gizli Ajan kelimeyi doğru tahmin etti: <span className="text-amber-400 font-extrabold text-base">"{guessResult.secretWord}"</span>!
              </p>
              <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-3 text-amber-300 text-xs font-bold">
                Ajan turu çaldı! +150 Puan
              </div>
            </div>
          ) : (
            <div className="bg-[#0F1C2E] border border-rose-500/40 rounded-3xl p-8 shadow-2xl">
              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
                <XCircle className="w-10 h-10" />
              </div>
              <h2 className="font-black text-4xl text-rose-400 mb-3 tracking-wide">YANLIŞ TAHMİN!</h2>
              <p className="text-slate-300 text-sm leading-relaxed mb-2">
                Gizli kelime: <span className="text-amber-400 font-extrabold text-base">"{guessResult.secretWord}"</span>
              </p>
              <p className="text-slate-400 text-xs font-semibold">Ajanın Tahmini: "{guessResult.guess}"</p>
            </div>
          )}
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060D18] flex items-center justify-center px-4 font-sans text-slate-100">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-sm w-full"
      >
        <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20">
          <ShieldAlert className="w-10 h-10" />
        </div>

        {isSpy ? (
          <>
            <h2 className="font-black text-3xl text-rose-400 mb-2 tracking-wide">YAKALANDIN!</h2>
            <p className="text-slate-300 text-sm mb-6">
              Son bir şansın var. Gizli kelime neydi?
            </p>

            {store.phaseEndsAt && (
              <div className="mb-6">
                <CountdownTimer endsAt={store.phaseEndsAt} warningAt={5} large />
              </div>
            )}

            <div className="bg-[#0F1C2E] border border-slate-800 rounded-3xl p-6 shadow-xl space-y-4">
              <input
                type="text"
                value={guess}
                onChange={(e) => setGuess(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && submitGuess()}
                placeholder="Tahmininizi yazın..."
                maxLength={50}
                disabled={submitted}
                className="w-full bg-slate-900 border-2 border-slate-700 focus:border-rose-400 rounded-2xl px-4 py-3.5 text-lg font-extrabold text-white text-center outline-none"
                autoFocus
              />
              <button
                onClick={submitGuess}
                disabled={!guess.trim() || submitted}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all hover:scale-[1.02] disabled:opacity-40 flex items-center justify-center gap-2 uppercase tracking-wide text-sm"
              >
                <Target className="w-4 h-4" />
                <span>{submitted ? 'Gönderildi...' : 'Tahmini Gönder'}</span>
              </button>
            </div>
          </>
        ) : (
          <>
            <h2 className="font-black text-3xl text-white mb-2 tracking-wide">AJANIN SON ŞANSI</h2>
            <p className="text-slate-400 text-sm mb-6">Gizli ajan gizli kelimeyi tahmin etmeye çalışıyor...</p>

            {store.phaseEndsAt && (
              <CountdownTimer endsAt={store.phaseEndsAt} warningAt={3} large />
            )}

            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="mt-6 text-slate-500 text-xs font-semibold"
            >
              Tahmin bekleniyor...
            </motion.div>
          </>
        )}
      </motion.div>
    </div>
  );
}
