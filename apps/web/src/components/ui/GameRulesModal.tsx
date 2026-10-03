'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info, ShieldAlert, Pencil, Users } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/utils/i18n';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameRulesModal({ isOpen, onClose }: GameRulesModalProps) {
  const store = useGameStore();
  const t = useTranslation(store.language);
  const [timeLeft, setTimeLeft] = useState(5);

  useEffect(() => {
    if (!isOpen) return;
    setTimeLeft(5);
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const room = store.room;
  const settings = room?.settings;
  const categoryName = settings?.category ?? t('random');
  const drawTimeSec = settings?.drawingTimeSec ?? 12;
  const langLabel = store.language.toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          className="relative w-full max-w-md bg-[#0F1C2E] border-2 border-slate-800 rounded-3xl shadow-2xl p-6 pt-8 text-slate-100 select-none overflow-hidden"
        >
          {/* Top Banner Ribbon */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-cyan-500 via-sky-600 to-indigo-600 px-8 py-2 rounded-b-2xl border-x-2 border-b-2 border-slate-800 shadow-lg">
            <span className="font-black text-white text-base tracking-wider uppercase flex items-center gap-1.5">
              <Info className="w-4 h-4 text-amber-300 stroke-[3]" />
              {t('rulesHeader')}
            </span>
          </div>

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 transition-all hover:scale-105"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Game Settings Specs Pill */}
          <div className="mt-4 mb-6 bg-slate-900/90 border border-slate-800 rounded-2xl p-3.5 grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('themeLabel')}</span>
              <span className="text-cyan-400 font-black truncate block capitalize">{categoryName}</span>
            </div>
            <div className="border-x border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-bold">{t('drawTime')}</span>
              <span className="text-amber-400 font-black block">{drawTimeSec}s</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase font-bold">Dil</span>
              <span className="text-indigo-400 font-black block">{langLabel}</span>
            </div>
          </div>

          {/* Large Prohibited Graphic */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-28 h-28 rounded-full bg-slate-900 border-4 border-rose-500/40 flex items-center justify-center shadow-xl shadow-rose-500/10">
              <div className="text-rose-400 font-black text-2xl tracking-tighter flex flex-col items-center justify-center leading-none">
                <span>A & 7</span>
                <span className="text-xl">#</span>
              </div>
              
              {/* Red Prohibited Circle Slash */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="44" stroke="#EF4444" strokeWidth="8" fill="none" />
                <line x1="18" y1="18" x2="82" y2="82" stroke="#EF4444" strokeWidth="8" strokeLinecap="round" />
              </svg>
            </div>
          </div>

          {/* Warning Text */}
          <div className="text-center space-y-1.5 mb-6">
            <h4 className="font-extrabold text-white text-lg md:text-xl leading-snug">
              {t('noLettersRule')}
            </h4>
            <p className="text-xs font-semibold text-slate-300">
              {t('noLettersRuleDesc')}
            </p>
          </div>

          {/* Confirm Button with Auto-Close Countdown */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-cyan-500 via-sky-500 to-indigo-500 hover:from-cyan-400 hover:to-indigo-400 text-slate-950 font-black text-sm tracking-wide rounded-2xl shadow-lg transition-all hover:scale-[1.02] flex items-center justify-center gap-2 uppercase"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{t('confirmRules')} ({timeLeft}s)</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
