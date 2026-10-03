'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '@/hooks/useSocket';
import { useGameStore } from '@/store/gameStore';
import { LobbyScreen } from '@/components/screens/LobbyScreen';
import { RoleRevealScreen } from '@/components/screens/RoleRevealScreen';
import { DrawingScreen } from '@/components/screens/DrawingScreen';
import { DiscussionScreen } from '@/components/screens/DiscussionScreen';
import { VotingScreen } from '@/components/screens/VotingScreen';
import { VoteResultScreen } from '@/components/screens/VoteResultScreen';
import { SpyGuessScreen } from '@/components/screens/SpyGuessScreen';
import { RoundResultScreen } from '@/components/screens/RoundResultScreen';
import { GameResultScreen } from '@/components/screens/GameResultScreen';
import { ErrorOverlay } from '@/components/ui/ErrorOverlay';
import { motion, AnimatePresence } from 'framer-motion';

export default function RoomPage() {
  const params = useParams();
  const router = useRouter();
  const code = (params?.code as string)?.toUpperCase();
  const socket = useSocket();
  const store = useGameStore();
  const [joining, setJoining] = useState(true);
  const [needNickname, setNeedNickname] = useState(false);
  const [nickname, setNickname] = useState('');
  const [avatarId, setAvatarId] = useState(0);

  useEffect(() => {
    if (!code || !socket) return;

    const savedNickname = localStorage.getItem('ds_nickname');
    const savedAvatar = Number(localStorage.getItem('ds_avatar') ?? '0');
    const savedSession = localStorage.getItem('ds_session');

    const nick = savedNickname?.trim() || '';
    const avatar = savedAvatar;

    setNickname(nick);
    setAvatarId(avatar);

    if (!nick) {
      setNeedNickname(true);
      setJoining(false);
      return;
    }

    // Use whichever session we have: store (just created room via REST) or localStorage
    const sessionToken = store.sessionToken || savedSession || uuidv4();
    localStorage.setItem('ds_session', sessionToken);
    store.setSessionToken(sessionToken);

    const doJoin = () => {
      socket.emit('join_room', {
        roomCode: code,
        nickname: nick,
        avatarId: avatar,
        sessionToken,
      });
      setJoining(false);
    };

    if (socket.connected) {
      doJoin();
    } else {
      socket.once('connect', doJoin);
    }
  }, [code, socket]); // eslint-disable-line react-hooks/exhaustive-deps

  function joinWithNickname() {
    if (!nickname.trim()) return;
    localStorage.setItem('ds_nickname', nickname.trim());
    localStorage.setItem('ds_avatar', String(avatarId));
    const sessionToken = uuidv4();
    localStorage.setItem('ds_session', sessionToken);
    store.setSessionToken(sessionToken);
    setNeedNickname(false);
    setJoining(true);

    const doJoin = () => {
      socket.emit('join_room', {
        roomCode: code,
        nickname: nickname.trim(),
        avatarId,
        sessionToken,
      });
      setJoining(false);
    };

    if (socket.connected) doJoin();
    else socket.once('connect', doJoin);
  }

  // ─── Nickname prompt (for direct link visitors) ───────────────────────────
  if (needNickname) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center px-4">
        <div className="card-spy rounded-3xl p-8 max-w-sm w-full text-center">
          <div className="text-5xl mb-4">🎮</div>
          <h2 className="font-display font-bold text-2xl text-white mb-1">Join Room</h2>
          <p className="text-white/50 text-sm mb-6">
            Code: <span className="text-[#FFD60A] font-mono font-bold tracking-widest">{code}</span>
          </p>
          <input
            type="text"
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && joinWithNickname()}
            placeholder="Your nickname..."
            maxLength={20}
            className="input-spy w-full rounded-xl px-4 py-3 text-lg font-display mb-4 text-center"
            autoFocus
          />
          <button onClick={joinWithNickname} className="btn-spy w-full py-4 rounded-xl text-lg">
            Join Game 🚀
          </button>
        </div>
      </div>
    );
  }

  if (joining) {
    return (
      <div className="min-h-screen bg-[#0D1B2A] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#FFD60A]/30 border-t-[#FFD60A] rounded-full animate-spin mx-auto mb-4" />
          <p className="text-white/60 font-body">Connecting to room {code}…</p>
        </div>
      </div>
    );
  }

  const phase = store.phase;

  return (
    <div className="min-h-screen bg-[#0D1B2A]">
      <AnimatePresence mode="wait">
        {store.error && (
          <ErrorOverlay
            error={store.error}
            onClose={() => { store.setError(null); router.push('/'); }}
          />
        )}

        {phase === 'ROOM_WAITING' && (
          <motion.div key="lobby" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LobbyScreen roomCode={code} />
          </motion.div>
        )}

        {(phase === 'ROUND_STARTING' || phase === 'ROLE_REVEAL') && (
          <motion.div key="role" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}>
            <RoleRevealScreen />
          </motion.div>
        )}

        {phase === 'DRAWING' && (
          <motion.div key="drawing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DrawingScreen roomCode={code} />
          </motion.div>
        )}

        {phase === 'DISCUSSION' && (
          <motion.div key="discussion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <DiscussionScreen />
          </motion.div>
        )}

        {phase === 'VOTING' && (
          <motion.div key="voting" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VotingScreen />
          </motion.div>
        )}

        {phase === 'VOTE_RESULTS' && (
          <motion.div key="voteresult" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <VoteResultScreen />
          </motion.div>
        )}

        {phase === 'SPY_GUESS' && (
          <motion.div key="spyguess" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <SpyGuessScreen />
          </motion.div>
        )}

        {phase === 'ROUND_RESULTS' && (
          <motion.div key="roundresult" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <RoundResultScreen />
          </motion.div>
        )}

        {phase === 'GAME_RESULTS' && (
          <motion.div key="gameresult" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <GameResultScreen />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
