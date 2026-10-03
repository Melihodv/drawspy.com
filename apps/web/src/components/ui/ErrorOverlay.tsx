'use client';

import { motion } from 'framer-motion';
import { AlertTriangle } from 'lucide-react';

const ERROR_MESSAGES: Record<string, string> = {
  ROOM_NOT_FOUND: 'Bu oda mevcut değil veya kapatılmış.',
  ROOM_FULL: 'Bu oda dolu. Yeni bir oda oluşturmayı deneyin!',
  GAME_ALREADY_STARTED: 'Oyun zaten başladı. İzleyici olarak katılabilirsiniz.',
  INVALID_SESSION: 'Oturum süreniz doldu. Lütfen tekrar katılın.',
  NOT_HOST: 'Yalnızca oda kurucusu bu işlemi yapabilir.',
  NOT_YOUR_TURN: 'Sıranızın gelmesini bekleyin!',
  KICKED: 'Odadan çıkarıldınız.',
  RATE_LIMITED: 'Çok hızlı istek gönderiyorsunuz!',
  CONNECTION_LOST: 'Bağlantı koptu. Yeniden bağlanmaya çalışılıyor...',
};

interface ErrorOverlayProps {
  error: { code: string; message: string };
  onClose: () => void;
}

export function ErrorOverlay({ error, onClose }: ErrorOverlayProps) {
  const friendlyMessage = ERROR_MESSAGES[error.code] ?? error.message;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center px-4 font-sans"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0F1C2E] border border-rose-500/40 rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl"
      >
        <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h3 className="font-extrabold text-xl text-white mb-2">{error.code.replace(/_/g, ' ')}</h3>
        <p className="text-slate-400 text-xs font-semibold mb-6">{friendlyMessage}</p>
        <button
          onClick={onClose}
          className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black rounded-2xl shadow-lg transition-all"
        >
          Ana Sayfaya Dön
        </button>
      </motion.div>
    </motion.div>
  );
}
