'use client';

import { motion } from 'framer-motion';
import { ShieldAlert, Pencil, Sparkles } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { WordVisualGuide } from '@/components/ui/WordVisualGuide';
import { useTranslation } from '@/utils/i18n';

export function RoleRevealScreen() {
  const store = useGameStore();
  const t = useTranslation(store.language);
  const isSpy = store.myRole === 'spy';
  const word = store.myWord;
  const categoryHint = store.myCategoryHint;

  return (
    <div className="min-h-screen bg-[#060D18] flex items-center justify-center px-4 font-sans text-slate-100">

      {/* Background pulse glow */}
      <div
        className={`absolute inset-0 opacity-10 ${isSpy ? 'bg-rose-500' : 'bg-cyan-500'}`}
        style={{ filter: 'blur(120px)' }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 20 }}
        className="relative z-10 text-center max-w-md w-full"
      >
        {isSpy ? (
          <>
            {/* SPY Icon Reveal */}
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-400 shadow-2xl shadow-rose-500/20"
            >
              <ShieldAlert className="w-12 h-12" />
            </motion.div>

            <div className="bg-[#0F1C2E] border border-rose-500/40 rounded-3xl p-8 shadow-2xl">
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="font-black text-3xl text-rose-400 mb-3 tracking-wide uppercase"
              >
                {t('spyRoleTitle')}
              </motion.h2>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-slate-300 text-sm leading-relaxed mb-6"
              >
                {t('spyRoleDesc')}
              </motion.p>

              {categoryHint && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
                >
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1">{t('categoryHintLabel')}</p>
                  <p className="font-black text-cyan-400 text-xl capitalize">{categoryHint}</p>
                </motion.div>
              )}

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-rose-400/80 text-xs mt-6 font-semibold"
              >
                {t('spyWarning')}
              </motion.p>
            </div>
          </>
        ) : (
          <>
            {/* NORMAL Player Reveal */}
            <motion.div
              animate={{ rotate: [0, -5, 5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
              className="w-24 h-24 mx-auto mb-6 rounded-3xl bg-amber-500/20 border-2 border-amber-500/40 flex items-center justify-center text-amber-400 shadow-2xl shadow-amber-500/20"
            >
              <Pencil className="w-12 h-12" />
            </motion.div>

            <div className="bg-[#0F1C2E] border border-amber-500/40 rounded-3xl p-8 shadow-2xl">
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-slate-400 text-xs font-bold tracking-widest uppercase mb-2"
              >
                {t('normalSecretWord')}
              </motion.p>

              {word && (
                <div className="flex flex-col items-center justify-center my-3 bg-slate-900/80 p-4 rounded-2xl border border-amber-500/30">
                  <p className="text-[10px] text-amber-400 font-extrabold uppercase tracking-widest mb-2">{t('drawingObjectGraphic')}</p>
                  <WordVisualGuide word={word} category={store.room?.settings.category} className="w-16 h-16" />
                </div>
              )}

              <motion.h2
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 300 }}
                className="font-black text-4xl text-amber-400 mb-6 uppercase tracking-wider"
              >
                {word}
              </motion.h2>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4"
              >
                <p className="text-slate-300 text-xs leading-relaxed font-medium">
                  {t('normalRoleDesc')}
                </p>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="text-slate-500 text-xs mt-4 font-semibold"
              >
                {t('categoryLabel')} <span className="text-slate-300 capitalize">{store.room?.settings.category ?? t('random')}</span>
              </motion.p>
            </div>
          </>
        )}

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="text-slate-500 text-xs font-semibold mt-6 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
          {t('drawingStarting')}
        </motion.p>
      </motion.div>
    </div>
  );
}
