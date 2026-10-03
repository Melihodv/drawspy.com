'use client';

import { useEffect, useState } from 'react';

interface CountdownTimerProps {
  endsAt: number;
  warningAt?: number;
  large?: boolean;
}

export function CountdownTimer({ endsAt, warningAt = 5, large = false }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(Math.max(0, Math.ceil((endsAt - Date.now()) / 1000)));

  useEffect(() => {
    const interval = setInterval(() => {
      const left = Math.max(0, Math.ceil((endsAt - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) clearInterval(interval);
    }, 200);
    return () => clearInterval(interval);
  }, [endsAt]);

  const isWarning = remaining <= warningAt;

  if (large) {
    return (
      <div
        className={`font-display font-black text-6xl tabular-nums transition-colors ${
          isWarning ? 'text-red-400' : 'text-yellow-spy'
        } ${isWarning && remaining <= 3 ? 'animate-bounce' : ''}`}
      >
        {remaining}
      </div>
    );
  }

  return (
    <div
      className={`font-display font-bold text-2xl tabular-nums min-w-[2ch] text-center ${
        isWarning ? 'text-red-400 animate-pulse' : 'text-yellow-spy'
      }`}
    >
      {remaining}
    </div>
  );
}
