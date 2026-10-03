'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, X, Info } from 'lucide-react';
import { useGameStore } from '@/store/gameStore';
import { useTranslation } from '@/utils/i18n';

interface GameRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GameRulesModal({ isOpen, onClose }: GameRulesModalProps) {
  const store = useGameStore();
  const t = useTranslation(store.language);

  if (!isOpen) return null;

  const room = store.room;
  const settings = room?.settings;
  const categoryName = settings?.category ?? t('random');
  const drawTimeSec = settings?.drawingTimeSec ?? 60;
  const langLabel = store.language.toUpperCase();

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.85, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 15 }}
          className="relative w-full max-w-md bg-white border-4 border-slate-900 rounded-3xl shadow-[0_12px_36px_rgba(15,23,42,0.4)] p-6 pt-8 text-slate-900 select-none overflow-hidden"
        >
          {/* Top Banner Ribbon */}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-500 px-8 py-2 rounded-b-2xl border-x-4 border-b-4 border-slate-900 shadow-md">
            <span className="font-logo font-black text-white text-lg tracking-wider uppercase drop-shadow-sm flex items-center gap-1.5">
              <Info className="w-5 h-5 text-amber-300 stroke-[3]" />
              {t('rulesHeader')}
            </span>
          </div>

          {/* Close X Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 border-2 border-slate-900 text-slate-700 transition-all hover:scale-105"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>

          {/* Game Settings Specs Pill */}
          <div className="mt-4 mb-6 bg-slate-100 border-2 border-slate-900 rounded-2xl p-3 grid grid-cols-3 gap-2 text-center text-xs font-extrabold">
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-bold">{t('themeLabel')}</span>
              <span className="text-sky-600 font-black truncate block">{categoryName}</span>
            </div>
            <div className="border-x-2 border-slate-300">
              <span className="text-slate-600 block text-[10px] uppercase font-bold">{t('drawTime')}</span>
              <span className="text-indigo-600 font-black block">{drawTimeSec}s</span>
            </div>
            <div>
              <span className="text-slate-600 block text-[10px] uppercase font-bold">{t('languageLabel')}</span>
              <span className="text-rose-600 font-black block">{langLabel}</span>
            </div>
          </div>

          {/* Large Crossed Out "A & 7 #" Graphic */}
          <div className="flex flex-col items-center justify-center my-4">
            <div className="relative w-28 h-28 rounded-full bg-amber-400 border-4 border-slate-900 flex items-center justify-center shadow-lg shadow-amber-500/20">
              <div className="text-slate-900 font-black text-2xl tracking-tighter flex flex-col items-center justify-center leading-none">
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
            <h4 className="font-extrabold text-slate-900 text-lg md:text-xl leading-snug">
              {t('noLettersRule')}
            </h4>
            <p className="text-xs font-semibold text-slate-700">
              {t('noLettersRuleDesc')}
            </p>
          </div>

          {/* Confirm Button */}
          <button
            onClick={onClose}
            className="w-full py-3.5 px-6 bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500 hover:from-amber-500 hover:to-orange-600 border-3 border-slate-900 rounded-2xl shadow-[0_4px_0_#0F172A] active:translate-y-1 active:shadow-none text-slate-900 font-black text-base tracking-wide flex items-center justify-center gap-2 transition-all uppercase"
          >
            <Check className="w-5 h-5 stroke-[3]" />
            <span>{t('confirmRules')}</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
