'use client';

import React from 'react';

// Step 1: Secret Room Key & Door Badge Icon
export function RoomKeyIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 text-white flex items-center justify-center shadow-md shadow-sky-500/20 shrink-0">
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2 18v3c0 .6.4 1 1 1h4v-3h3v-3h2l1.4-1.4a6.5 6.5 0 1 0-4-4Z" />
        <circle cx="16.5" cy="7.5" r=".5" fill="currentColor" />
      </svg>
    </div>
  );
}

// Step 2: Magic Drawing Pencil & Palette Badge Icon
export function MagicPencilIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-400 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m18 2 4 4-14 14H4v-4L18 2z" />
        <path d="m14.5 5.5 4 4" />
        <path d="M4.5 19.5 3 21" />
      </svg>
    </div>
  );
}

// Step 3: Impostor Detector / Magnifying Eye Badge Icon
export function ImpostorDetectorIcon({ className = 'w-6 h-6' }: { className?: string }) {
  return (
    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 text-white flex items-center justify-center shadow-md shadow-purple-500/20 shrink-0">
      <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
        <circle cx="11" cy="11" r="3" fill="currentColor" />
      </svg>
    </div>
  );
}
