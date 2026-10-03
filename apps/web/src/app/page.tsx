'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';
import {
  Pencil,
  Play,
  User,
  Globe,
  Sparkles,
  MessageSquare,
  Shuffle,
  Palette,
  Crown,
  X,
  Lock
} from 'lucide-react';

import { useGameStore } from '@/store/gameStore';
import { Avatar, AVATAR_PRESETS } from '@/components/ui/Avatar';
import { LANGUAGES, useTranslation, type LanguageCode } from '@/utils/i18n';
import { TRFlag, GBFlag, DEFlag, ESFlag, FRFlag, ARFlag } from '@/components/ui/FlagIcons';
import { RoomKeyIcon, MagicPencilIcon, ImpostorDetectorIcon } from '@/components/ui/GameStepIcons';
import { isProfane } from '@/utils/profanityFilter';

const RANDOM_NAMES = [
  'SecretAgent', 'DoodleKing', 'NinjaArtist', 'PencilWizard', 'CyberSpy',
  'CanvasGhost', 'MasterMind', 'SketchMaster', 'DetectiveX', 'VividPainter'
];

const FLAG_COMPONENTS: Record<LanguageCode, React.FC<{ className?: string }>> = {
  tr: TRFlag,
  en: GBFlag,
  de: DEFlag,
  es: ESFlag,
  fr: FRFlag,
  ar: ARFlag,
};

export default function HomePage() {
  const router = useRouter();
  const store = useGameStore();
  const t = useTranslation(store.language);

  const [nickname, setNickname] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState(0);
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomModalTab, setRoomModalTab] = useState<'create' | 'join'>('create');
  const [customCategory, setCustomCategory] = useState('random');
  const [customRounds, setCustomRounds] = useState(5);
  const [customDrawTime, setCustomDrawTime] = useState(12);
  const [customMaxPlayers, setCustomMaxPlayers] = useState(6);

  const [joinCode, setJoinCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const SERVER_URL = process.env.NEXT_PUBLIC_SERVER_URL ?? 'http://localhost:3001';

  useEffect(() => {
    const savedNick = localStorage.getItem('ds_nickname');
    const savedAvatar = localStorage.getItem('ds_avatar');
    const savedLang = localStorage.getItem('ds_lang') as LanguageCode | null;

    if (savedNick) setNickname(savedNick);
    else generateRandomNick();
    if (savedAvatar) setSelectedAvatar(Number(savedAvatar));
    else setSelectedAvatar(Math.floor(Math.random() * AVATAR_PRESETS.length));
    if (savedLang) store.setLanguage(savedLang);
  }, []);

  function handleLanguageChange(code: LanguageCode) {
    store.setLanguage(code);
    localStorage.setItem('ds_lang', code);
  }

  function generateRandomNick() {
    const randomName = RANDOM_NAMES[Math.floor(Math.random() * RANDOM_NAMES.length)] + Math.floor(100 + Math.random() * 900);
    setNickname(randomName);
  }

  // ─── 1. QUICK PLAY PUBLIC MATCHMAKING ─────────────────────────────────────
  async function handleQuickPlay() {
    const nick = nickname.trim();
    if (!nick) {
      setError(t('validNicknameError'));
      return;
    }
    if (isProfane(nick)) {
      setError(t('profaneNicknameError'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      const sessionToken = uuidv4();
      const res = await fetch(`${SERVER_URL}/api/matchmake`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: nick, avatarId: selectedAvatar, sessionToken }),
      });

      if (!res.ok) throw new Error('Matchmaking failed');
      const data = await res.json();

      const token = data.sessionToken ?? sessionToken;
      store.setSessionToken(token);
      store.setMyPlayerId(data.playerId);
      localStorage.setItem('ds_session', token);
      localStorage.setItem('ds_nickname', nick);
      localStorage.setItem('ds_avatar', String(selectedAvatar));

      router.push(`/room/${data.roomCode}`);
    } catch {
      setError(t('serverConnectError'));
    } finally {
      setLoading(false);
    }
  }

  // ─── 2. CREATE PRIVATE ROOM ─────────────────────────────────────────────
  async function handleCreatePrivateRoom() {
    const nick = nickname.trim();
    if (!nick) {
      setError(t('validNicknameError'));
      return;
    }
    if (isProfane(nick)) {
      setError(t('profaneNicknameError'));
      return;
    }
    setLoading(true);
    setError('');

    try {
      const sessionToken = uuidv4();
      const res = await fetch(`${SERVER_URL}/api/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nickname: nick,
          avatarId: selectedAvatar,
          sessionToken,
          settings: {
            isPrivate: true,
            maxPlayers: customMaxPlayers,
            category: customCategory,
            roundCount: customRounds,
            drawingTimeSec: customDrawTime,
          },
        }),
      });

      if (!res.ok) throw new Error('Failed to create private room');
      const data = await res.json();

      const token = data.sessionToken ?? sessionToken;
      store.setSessionToken(token);
      store.setMyPlayerId(data.playerId);
      localStorage.setItem('ds_session', token);
      localStorage.setItem('ds_nickname', nick);
      localStorage.setItem('ds_avatar', String(selectedAvatar));

      setShowRoomModal(false);
      router.push(`/room/${data.roomCode}`);
    } catch {
      setError(t('serverConnectError'));
    } finally {
      setLoading(false);
    }
  }

  function handleJoinRoom() {
    const nick = nickname.trim();
    const code = joinCode.trim().toUpperCase();
    if (!nick) {
      setError(t('validNicknameError'));
      return;
    }
    if (isProfane(nick)) {
      setError(t('profaneNicknameError'));
      return;
    }
    if (code.length < 4) {
      setError(t('validRoomCodeError'));
      return;
    }

    const sessionToken = uuidv4();
    store.setSessionToken(sessionToken);
    localStorage.setItem('ds_nickname', nick);
    localStorage.setItem('ds_avatar', String(selectedAvatar));
    localStorage.setItem('ds_session', sessionToken);

    setShowRoomModal(false);
    router.push(`/room/${code}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col justify-between relative font-['Outfit'] select-none">
      
      {/* Subtle Dot Pattern */}
      <div
        className="absolute inset-0 opacity-[0.35] pointer-events-none z-0"
        style={{
          backgroundImage: `radial-gradient(#CBD5E1 1.5px, transparent 1.5px)`,
          backgroundSize: '24px 24px',
        }}
      />

      {/* ─── TOP HEADER BAR ──────────────────────────────────────────────────────── */}
      <header className="relative z-10 w-full max-w-5xl mx-auto px-6 py-5 flex items-center justify-between">
        {/* Left Branding */}
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-rose-500 p-0.5 shadow-md shadow-sky-500/20 flex items-center justify-center -rotate-3 hover:rotate-0 transition-transform">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center">
              <Pencil className="w-5 h-5 text-sky-500 -rotate-12 stroke-[2.5]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-3xl font-logo font-black tracking-tight select-none">
                <span className="logo-sm-draw">Draw</span><span className="logo-sm-spy">Spy</span>
              </span>
            </div>
            <p className="text-xs text-slate-500 font-semibold">{t('subtitle')}</p>
          </div>
        </div>
      </header>

      {/* ─── MAIN HERO CONTENT ────────────────────────────────────────────────── */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-4 py-3 flex flex-col items-center justify-center flex-1">
        {/* HERO LOGO & HANDWRITTEN MOTTO */}
        <motion.div
          initial={{ opacity: 0, y: -15 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 flex flex-col items-center"
        >
          {/* Handwritten Sketchy Doodle Frame Tagline Badge */}
          <motion.div 
            whileHover={{ scale: 1.02, rotate: 0 }}
            className="relative inline-flex items-center gap-2.5 px-5 py-2.5 bg-sky-50/90 rounded-2xl border-2 border-slate-900 shadow-[4px_4px_0px_0px_#0F172A] -rotate-1 mb-4 select-none cursor-default"
          >
            {/* Sketch Pencil Icon */}
            <div className="w-7 h-7 rounded-lg bg-rose-500 text-white flex items-center justify-center shadow-xs -rotate-6">
              <Pencil className="w-4 h-4 stroke-[2.5]" />
            </div>

            <span className="font-handwritten text-2xl md:text-3xl font-extrabold text-slate-900 tracking-wide">
              {t('heroTagline')}
            </span>

            {/* Sparkles accent */}
            <Sparkles className="w-5 h-5 text-amber-500 animate-pulse" />

            {/* Hand-drawn underline SVG stroke */}
            <svg
              className="absolute -bottom-1.5 left-4 w-[calc(100%-32px)] h-2.5 text-rose-500/70 pointer-events-none"
              viewBox="0 0 200 8"
              fill="none"
              preserveAspectRatio="none"
            >
              <path
                d="M 2 5 C 50 1, 150 7, 198 4"
                stroke="currentColor"
                strokeWidth="3.5"
                strokeLinecap="round"
              />
            </svg>
          </motion.div>

          {/* Distinct 3D Brand Logo */}
          <div className="relative flex items-center justify-center">
            <h1 className="text-7xl md:text-9xl font-logo font-black tracking-tight leading-none select-none flex items-center gap-0.5">
              <span className="logo-text-draw hover:scale-105 transition-transform inline-block">Draw</span>
              <span className="logo-text-spy hover:scale-105 transition-transform inline-block">Spy</span>
            </h1>
          </div>
        </motion.div>

        {/* MAIN CONTAINER */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="w-full bg-white border border-slate-200/90 rounded-3xl shadow-2xl shadow-slate-200/80 overflow-hidden relative"
        >
          {/* TOP SIGNATURE GRADIENT RIBBON */}
          <div className="w-full bg-gradient-to-r from-sky-500 via-indigo-500 to-rose-500 py-3.5 px-6 text-center font-black tracking-wider uppercase text-white text-base shadow-sm flex items-center justify-center gap-2">
            <Crown className="w-5 h-5 text-amber-300" />
            <span>{t('playHeader')}</span>
          </div>

          <div className="p-6 md:p-8 flex flex-col md:flex-row items-stretch justify-between gap-8">
            
            {/* ─── LEFT COLUMN: PROFILE & PLAY ───────────────────────────────── */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div className="w-full flex flex-col items-center mb-4">
                {/* Avatar Display */}
                <div
                  className="relative mb-3 cursor-pointer group"
                  onClick={() => setShowAvatarModal(true)}
                  title="Avatar Seç"
                >
                  <div className="p-3 rounded-full bg-slate-100/90 border-2 border-slate-200 group-hover:border-sky-500 transition-all shadow-sm">
                    <Avatar id={selectedAvatar} size="2xl" showBorder={false} />
                  </div>
                  <div className="absolute bottom-0 right-0 bg-rose-500 hover:bg-rose-600 text-white p-2 rounded-full shadow-md border-2 border-white transition-all group-hover:scale-110">
                    <Palette className="w-3.5 h-3.5" />
                  </div>
                </div>

                {/* Avatar Name Tag */}
                <div className="flex items-center gap-2 mb-4">
                  <button
                    onClick={() => setSelectedAvatar((prev) => (prev - 1 + AVATAR_PRESETS.length) % AVATAR_PRESETS.length)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    ←
                  </button>
                  <span className="text-xs font-extrabold text-slate-800 px-4 py-1.5 bg-slate-100 rounded-full border border-slate-200">
                    {t(AVATAR_PRESETS[selectedAvatar].key)}
                  </span>
                  <button
                    onClick={() => setSelectedAvatar((prev) => (prev + 1) % AVATAR_PRESETS.length)}
                    className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                  >
                    →
                  </button>
                </div>
              </div>

              {/* Form Input Controls */}
              <div className="w-full space-y-4">
                {/* Nickname Input */}
                <div>
                  <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1.5">
                    <span className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-sky-500" /> {t('nicknameLabel')}
                    </span>
                    <button
                      onClick={generateRandomNick}
                      className="text-rose-500 hover:text-rose-600 text-xs font-extrabold flex items-center gap-1 transition-colors"
                    >
                      <Shuffle className="w-3 h-3" /> {t('randomName')}
                    </button>
                  </div>
                  <input
                    type="text"
                    value={nickname}
                    onChange={(e) => {
                      setNickname(e.target.value);
                      setError('');
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && handleQuickPlay()}
                    placeholder={t('nicknamePlaceholder')}
                    maxLength={18}
                    className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl px-4 py-3 text-base font-bold text-slate-900 placeholder-slate-400 outline-none transition-all shadow-inner"
                  />
                </div>

                {/* SVG Vector Flag Language Selector */}
                <div>
                  <label className="flex items-center gap-1.5 text-xs font-bold text-slate-700 mb-1.5">
                    <Globe className="w-3.5 h-3.5 text-sky-500" /> {t('gameLanguage')}
                  </label>
                  <div className="grid grid-cols-6 gap-1.5">
                    {LANGUAGES.map((lang) => {
                      const isSelected = store.language === lang.code;
                      const FlagIcon = FLAG_COMPONENTS[lang.code];

                      return (
                        <button
                          key={lang.code}
                          onClick={() => handleLanguageChange(lang.code)}
                          className={`flex flex-col items-center justify-center p-2 rounded-xl border transition-all ${
                            isSelected
                              ? 'bg-sky-500 border-sky-500 text-white font-bold shadow-md'
                              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100 hover:border-slate-300'
                          }`}
                        >
                          <FlagIcon className="w-5 h-3.5 mb-1 shadow-xs" />
                          <span className="text-[10px] uppercase font-black">{lang.code}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Error Box */}
                {error && (
                  <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 text-xs text-rose-600 font-bold text-center">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => setShowRoomModal(true)}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-extrabold rounded-xl border border-slate-300 transition-all text-sm"
                  >
                    <Lock className="w-4 h-4 text-slate-700" />
                    <span>{t('browseRooms')}</span>
                  </button>

                  <button
                    onClick={handleQuickPlay}
                    disabled={loading}
                    className="flex items-center justify-center gap-2 py-3.5 px-4 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-black rounded-xl shadow-lg shadow-sky-500/25 transition-all hover:scale-[1.02] disabled:opacity-50 text-sm tracking-wide"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Play className="w-4 h-4 fill-current" />
                        <span>{t('quickPlay')}</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* ─── RIGHT COLUMN: CUSTOM GAME-THEMED 3-STEP GUIDE ───────────────── */}
            <div className="w-full md:w-1/2 flex flex-col justify-between">
              <div>
                <p className="text-xs font-extrabold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-rose-500" />
                  {t('howItWorksTitle')}
                </p>

                {/* 3 Custom Game-Themed Vector Steps */}
                <div className="space-y-3 mb-6">
                  {/* Step 1 */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-sky-300 transition-all">
                    <RoomKeyIcon className="w-5 h-5" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase">{t('step1Title')}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">{t('step1Desc')}</p>
                    </div>
                  </div>

                  {/* Step 2 */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-rose-300 transition-all">
                    <MagicPencilIcon className="w-5 h-5" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase">{t('step2Title')}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">{t('step2Desc')}</p>
                    </div>
                  </div>

                  {/* Step 3 */}
                  <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/90 hover:border-purple-300 transition-all">
                    <ImpostorDetectorIcon className="w-5 h-5" />
                    <div>
                      <h3 className="text-xs font-bold text-slate-900 uppercase">{t('step3Title')}</h3>
                      <p className="text-xs text-slate-600 mt-0.5 font-semibold">{t('step3Desc')}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* SOCIAL LOGIN */}
              <div className="pt-4 border-t border-slate-200">
                <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2.5 text-center">
                  {t('selectLogin')}
                </span>

                <div className="grid grid-cols-2 gap-2.5">
                  <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all">
                    <Globe className="w-4 h-4 text-sky-500" />
                    <span>GOOGLE</span>
                  </button>
                  <button className="flex items-center justify-center gap-2 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-all">
                    <MessageSquare className="w-4 h-4 text-rose-500" />
                    <span>DISCORD</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        </motion.div>
      </main>

      {/* ─── FOOTER ──────────────────────────────────────────────────────────────── */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 border-t border-slate-200 gap-2">
        <div className="font-semibold text-slate-600">
          {t('footerRights')}
        </div>

        <div className="flex flex-wrap justify-center gap-5 font-semibold text-slate-600">
          <a href="#" className="hover:text-sky-600 transition-colors">{t('terms')}</a>
          <a href="#" className="hover:text-sky-600 transition-colors">{t('privacy')}</a>
          <a href="#" className="hover:text-sky-600 transition-colors">{t('thanks')}</a>
          <a href="#" className="hover:text-sky-600 transition-colors">{t('contact')}</a>
        </div>
      </footer>

      {/* ─── AVATAR SELECTOR MODAL ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-lg shadow-2xl relative"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Palette className="w-4 h-4 text-sky-500" />
                  {t('selectAvatarTitle')}
                </h3>
                <button
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-[360px] overflow-y-auto p-1">
                {AVATAR_PRESETS.map((preset, i) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setSelectedAvatar(i);
                      setShowAvatarModal(false);
                    }}
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl border transition-all ${
                      selectedAvatar === i
                        ? 'bg-sky-50 border-sky-500 scale-105 shadow-md'
                        : 'bg-slate-50 border-slate-200 hover:border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    <Avatar id={i} size="lg" showBorder={false} />
                    <span className="text-[11px] font-bold text-slate-700 text-center leading-tight">
                      {t(preset.key)}
                    </span>
                  </button>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ─── DUAL-TAB PRIVATE ROOM MODAL ────────────────────────────────────────── */}
      <AnimatePresence>
        {showRoomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-slate-200 rounded-3xl p-6 w-full max-w-md shadow-2xl relative"
            >
              {/* Header & Close */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <Lock className="w-5 h-5 text-sky-500" />
                  <span>ÖZEL ODA SEÇENEKLERİ</span>
                </h3>
                <button
                  onClick={() => setShowRoomModal(false)}
                  className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-800 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Tab Selector */}
              <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1.5 rounded-2xl mb-5 border border-slate-200">
                <button
                  onClick={() => setRoomModalTab('create')}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                    roomModalTab === 'create'
                      ? 'bg-white text-sky-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Özel Oda Kur
                </button>
                <button
                  onClick={() => setRoomModalTab('join')}
                  className={`py-2 text-xs font-extrabold rounded-xl transition-all ${
                    roomModalTab === 'join'
                      ? 'bg-white text-sky-600 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Odaya Katıl
                </button>
              </div>

              {/* TAB 1: CREATE PRIVATE ROOM */}
              {roomModalTab === 'create' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Kategori Seçimi:
                    </label>
                    <select
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-xl px-3 py-2.5 text-xs font-bold text-slate-800 outline-none"
                    >
                      <option value="random">Rastgele Karışık</option>
                      <option value="animals">Animals / Hayvanlar</option>
                      <option value="food">Food / Yiyecekler</option>
                      <option value="objects">Objects / Nesneler</option>
                      <option value="places">Places / Mekanlar</option>
                      <option value="jobs">Jobs / Meslekler</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                      Oyuncu Sayısı (Lobi Kapasitesi):
                    </label>
                    <div className="flex gap-1.5">
                      {[4, 6, 8, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setCustomMaxPlayers(num)}
                          className={`flex-1 py-2 text-xs font-extrabold rounded-xl border transition-all ${
                            customMaxPlayers === num
                              ? 'bg-sky-500 text-white border-sky-600'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {num} Kişi {num === 6 ? '(İdeal)' : ''}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Tur Sayısı:
                      </label>
                      <div className="flex gap-1.5">
                        {[3, 5, 8, 10].map((num) => (
                          <button
                            key={num}
                            onClick={() => setCustomRounds(num)}
                            className={`flex-1 py-2 text-xs font-extrabold rounded-xl border transition-all ${
                              customRounds === num
                                ? 'bg-sky-500 text-white border-sky-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {num}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                        Çizim Süresi:
                      </label>
                      <div className="flex gap-1.5">
                        {[7, 12, 20].map((sec) => (
                          <button
                            key={sec}
                            onClick={() => setCustomDrawTime(sec)}
                            className={`flex-1 py-2 text-xs font-extrabold rounded-xl border transition-all ${
                              customDrawTime === sec
                                ? 'bg-sky-500 text-white border-sky-600'
                                : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                            }`}
                          >
                            {sec}s
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCreatePrivateRoom}
                    disabled={loading}
                    className="w-full mt-2 py-3.5 bg-gradient-to-r from-sky-500 via-indigo-600 to-rose-500 hover:opacity-95 text-white font-extrabold rounded-xl shadow-lg transition-all text-sm uppercase tracking-wide flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>ÖZEL ODA OLUŞTUR & BAŞLAT</span>
                      </>
                    )}
                  </button>
                </div>
              )}

              {/* TAB 2: JOIN PRIVATE ROOM */}
              {roomModalTab === 'join' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                      {t('enterRoomCode')}
                    </label>
                    <input
                      type="text"
                      value={joinCode}
                      onChange={(e) => {
                        setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ''));
                        setError('');
                      }}
                      onKeyDown={(e) => e.key === 'Enter' && handleJoinRoom()}
                      placeholder="ÖRN: G57Z37"
                      maxLength={8}
                      className="w-full bg-slate-50 border border-slate-300 focus:border-sky-500 rounded-2xl px-4 py-3.5 text-2xl font-bold text-slate-900 text-center tracking-[0.3em] uppercase placeholder-slate-400 outline-none"
                      autoFocus
                    />
                  </div>

                  <button
                    onClick={handleJoinRoom}
                    className="w-full py-3.5 bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-600 hover:to-indigo-700 text-white font-bold rounded-xl shadow-md transition-all text-sm uppercase tracking-wide"
                  >
                    {t('connectRoom')}
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
