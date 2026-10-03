'use client';

import React from 'react';

export interface AvatarProps {
  id: number;
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showBorder?: boolean;
}

export interface AvatarPreset {
  id: number;
  key: string;
  name: string;
  type: string;
  accent: string;
  bgGrad: string;
}

export const AVATAR_PRESETS: AvatarPreset[] = [
  // ─── GLOBAL AGENT MASCOTS (0 - 11) ──────────────────────────────────────
  { id: 0, key: 'avatar_0', name: 'Shadow Detective', type: 'shadow_detective', accent: '#0EA5E9', bgGrad: 'from-slate-800 to-slate-950' },
  { id: 1, key: 'avatar_1', name: 'Stealth Operative', type: 'stealth_op', accent: '#10B981', bgGrad: 'from-emerald-900 to-slate-950' },
  { id: 2, key: 'avatar_2', name: 'Master Artist', type: 'master_artist', accent: '#EC4899', bgGrad: 'from-rose-900 to-slate-950' },
  { id: 3, key: 'avatar_3', name: 'Viper Agent', type: 'viper_agent', accent: '#F97316', bgGrad: 'from-amber-900 to-slate-950' },
  { id: 4, key: 'avatar_4', name: 'Phantom Spy', type: 'phantom_spy', accent: '#8B5CF6', bgGrad: 'from-purple-950 to-slate-950' },
  { id: 5, key: 'avatar_5', name: 'Cyber Impostor', type: 'cyber_impostor', accent: '#06B6D4', bgGrad: 'from-cyan-950 to-slate-950' },
  { id: 6, key: 'avatar_6', name: 'Golden Crown', type: 'golden_crown', accent: '#F59E0B', bgGrad: 'from-amber-900 to-slate-950' },
  { id: 7, key: 'avatar_7', name: 'Ghost Operative', type: 'ghost_op', accent: '#64748B', bgGrad: 'from-slate-700 to-slate-950' },
  { id: 8, key: 'avatar_8', name: 'Cyber Ninja', type: 'cyber_ninja', accent: '#F43F5E', bgGrad: 'from-rose-950 to-slate-950' },
  { id: 9, key: 'avatar_9', name: 'Tactical Recon', type: 'tactical_recon', accent: '#3B82F6', bgGrad: 'from-blue-950 to-slate-950' },
  { id: 10, key: 'avatar_10', name: 'Noir Investigator', type: 'noir_investigator', accent: '#CBD5E1', bgGrad: 'from-zinc-800 to-slate-950' },
  { id: 11, key: 'avatar_11', name: 'Vivid Agent', type: 'vivid_agent', accent: '#D946EF', bgGrad: 'from-fuchsia-950 to-slate-950' },

  // ─── HUMOROUS CULTURAL CHARACTERS (12 - 21) ──────────────────────────────
  { id: 12, key: 'avatar_12', name: 'Erdal Dayı', type: 'erdal_dayi', accent: '#B45309', bgGrad: 'from-amber-900 to-slate-950' },
  { id: 13, key: 'avatar_13', name: 'Komşu Necla', type: 'komsu_necla', accent: '#F43F5E', bgGrad: 'from-pink-900 to-slate-950' },
  { id: 14, key: 'avatar_14', name: 'Tombalacı Mehmet', type: 'tombalaci_mehmet', accent: '#10B981', bgGrad: 'from-emerald-950 to-slate-950' },
  { id: 15, key: 'avatar_15', name: 'Taksi Nuri', type: 'taksi_nuri', accent: '#EAB308', bgGrad: 'from-yellow-950 to-slate-950' },
  { id: 16, key: 'avatar_16', name: 'Bakkal Hüseyin', type: 'bakkal_huseyin', accent: '#2563EB', bgGrad: 'from-blue-950 to-slate-950' },
  { id: 17, key: 'avatar_17', name: 'Çaycı Remzi', type: 'cayci_remzi', accent: '#EA580C', bgGrad: 'from-orange-950 to-slate-950' },
  { id: 18, key: 'avatar_18', name: 'Görüntülü Teyze', type: 'goruntulu_teyze', accent: '#EC4899', bgGrad: 'from-rose-950 to-slate-950' },
  { id: 19, key: 'avatar_19', name: 'Dönerci Usta', type: 'donerci_usta', accent: '#EF4444', bgGrad: 'from-red-950 to-slate-950' },
  { id: 20, key: 'avatar_20', name: 'Sosyete Melis', type: 'sosyete_melis', accent: '#A855F7', bgGrad: 'from-purple-900 to-slate-950' },
  { id: 21, key: 'avatar_21', name: 'Fırıncı Rıza', type: 'firinci_riza', accent: '#D97706', bgGrad: 'from-amber-950 to-slate-950' },
];

export function Avatar({ id, size = 'md', className = '', showBorder = false }: AvatarProps) {
  const preset = AVATAR_PRESETS[id % AVATAR_PRESETS.length];

  const sizeClasses = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-12 h-12 text-sm',
    lg: 'w-16 h-16 text-base',
    xl: 'w-24 h-24 text-lg',
    '2xl': 'w-32 h-32 text-xl',
  }[size];

  return (
    <div
      className={`relative rounded-full flex items-center justify-center shrink-0 bg-transparent ${sizeClasses} ${
        showBorder ? 'ring-2 ring-slate-200' : ''
      } ${className}`}
    >
      <svg className="w-full h-full drop-shadow-lg overflow-visible" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        
        {/* Soft Drop Shadow */}
        <ellipse cx="50" cy="86" rx="22" ry="6" fill="#0F172A" opacity="0.15" />
        
        {/* Unified Smooth Mascot Head Base */}
        <path
          d="M 26 46 C 26 24 74 24 74 46 C 74 68 68 82 50 82 C 32 82 26 68 26 46 Z"
          fill="#334155"
          stroke="#0F172A"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Base Cheek Highlights */}
        <ellipse cx="36" cy="62" rx="4" ry="2.5" fill="#38BDF8" opacity="0.25" />
        <ellipse cx="64" cy="62" rx="4" ry="2.5" fill="#38BDF8" opacity="0.25" />

        {/* ─── 0: SHADOW DETECTIVE ────────────────────────────────────────── */}
        {preset.type === 'shadow_detective' && (
          <g>
            <path d="M 24 76 L 36 60 L 50 68 L 64 60 L 76 76 Q 50 90 24 76 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
            <path d="M 50 68 L 50 84" stroke="#0EA5E9" strokeWidth="2.5" />
            <rect x="28" y="44" width="20" height="13" rx="3" fill="#0F172A" stroke="#0EA5E9" strokeWidth="2" />
            <rect x="52" y="44" width="20" height="13" rx="3" fill="#0F172A" stroke="#0EA5E9" strokeWidth="2" />
            <line x1="48" y1="49" x2="52" y2="49" stroke="#0EA5E9" strokeWidth="2" />
            <path d="M 30 46 L 42 46 L 34 53 Z" fill="#38BDF8" opacity="0.7" />
            <path d="M 54 46 L 66 46 L 58 53 Z" fill="#38BDF8" opacity="0.7" />
            <path d="M 12 38 Q 50 24 88 38 L 76 32 Q 50 18 24 32 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2" />
            <path d="M 26 33 C 26 16 74 16 74 33 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2.5" />
            <rect x="26" y="28" width="48" height="5" fill="#0EA5E9" />
          </g>
        )}

        {/* ─── 1: STEALTH OPERATIVE ───────────────────────────────────────── */}
        {preset.type === 'stealth_op' && (
          <g>
            <path d="M 26 44 Q 50 36 74 44 L 70 56 Q 50 48 30 56 Z" fill="#10B981" stroke="white" strokeWidth="1.5" />
            <circle cx="50" cy="48" r="3.5" fill="white" />
            <path d="M 24 36 L 76 36" stroke="#10B981" strokeWidth="7" strokeLinecap="round" />
            <rect x="46" y="33" width="8" height="6" fill="#0F172A" rx="1" />
          </g>
        )}

        {/* ─── 2: MASTER ARTIST ───────────────────────────────────────────── */}
        {preset.type === 'master_artist' && (
          <g>
            <circle cx="38" cy="50" r="9" stroke="#EC4899" strokeWidth="2.5" fill="#0F172A" />
            <circle cx="62" cy="50" r="9" stroke="#EC4899" strokeWidth="2.5" fill="#0F172A" />
            <line x1="47" y1="50" x2="53" y2="50" stroke="#EC4899" strokeWidth="2.5" />
            <path d="M 18 34 C 16 14 80 10 84 28 C 86 36 68 40 18 34 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="2.5" />
            <circle cx="56" cy="14" r="3.5" fill="#E11D48" />
            {/* Paintbrush on ear */}
            <path d="M 72 60 L 88 74 L 80 80 L 66 66 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2" />
            <path d="M 88 74 L 94 80 C 96 84 90 88 86 84 L 80 80 Z" fill="#EC4899" />
          </g>
        )}

        {/* ─── 3: VIPER AGENT ────────────────────────────────────────────── */}
        {preset.type === 'viper_agent' && (
          <g>
            <polygon points="26,42 74,42 66,58 34,58" fill="#F97316" stroke="white" strokeWidth="1.5" />
            <polygon points="32,44 68,44 62,50 38,50" fill="#FDE047" opacity="0.8" />
            <path d="M 30 74 L 50 64 L 70 74 L 50 82 Z" fill="#F97316" stroke="#0F172A" strokeWidth="2" />
            <polygon points="50,70 52,74 56,74 53,77 54,81 50,78 46,81 47,77 44,74 48,74" fill="#F59E0B" />
          </g>
        )}

        {/* ─── 4: PHANTOM SPY ────────────────────────────────────────────── */}
        {preset.type === 'phantom_spy' && (
          <g>
            <path d="M 20 46 Q 50 14 80 46 L 84 82 Q 50 88 16 82 Z" fill="#2E1065" stroke="#8B5CF6" strokeWidth="2.5" />
            <path d="M 28 46 Q 50 32 72 46 L 68 74 Q 50 80 32 74 Z" fill="#0F172A" />
            <ellipse cx="40" cy="52" rx="6" ry="4" fill="#A855F7" />
            <ellipse cx="60" cy="52" rx="6" ry="4" fill="#A855F7" />
            <circle cx="40" cy="52" r="2" fill="white" />
            <circle cx="60" cy="52" r="2" fill="white" />
          </g>
        )}

        {/* ─── 5: CYBER IMPOSTOR ─────────────────────────────────────────── */}
        {preset.type === 'cyber_impostor' && (
          <g>
            <path d="M 26 40 Q 50 28 74 40 L 70 56 Q 50 48 30 56 Z" fill="#06B6D4" stroke="white" strokeWidth="1.5" />
            <path d="M 32 42 L 52 38 L 46 46 Z" fill="white" opacity="0.8" />
            <rect x="16" y="44" width="8" height="16" rx="3" fill="#06B6D4" stroke="#0F172A" strokeWidth="2" />
            <rect x="76" y="44" width="8" height="16" rx="3" fill="#06B6D4" stroke="#0F172A" strokeWidth="2" />
          </g>
        )}

        {/* ─── 6: GOLDEN CROWN ───────────────────────────────────────────── */}
        {preset.type === 'golden_crown' && (
          <g>
            <path d="M 26 30 L 34 38 L 50 20 L 66 38 L 74 30 L 70 46 L 30 46 Z" fill="#F59E0B" stroke="#0F172A" strokeWidth="2.5" strokeLinejoin="round" />
            <circle cx="50" cy="18" r="3.5" fill="#EF4444" stroke="#0F172A" strokeWidth="1" />
            <circle cx="60" cy="52" r="8" stroke="#F59E0B" strokeWidth="2.5" fill="rgba(245,158,11,0.2)" />
            <line x1="66" y1="58" x2="74" y2="70" stroke="#F59E0B" strokeWidth="2.5" />
            <circle cx="40" cy="52" r="3.5" fill="#F59E0B" />
          </g>
        )}

        {/* ─── 7: GHOST OPERATIVE ────────────────────────────────────────── */}
        {preset.type === 'ghost_op' && (
          <g>
            <path d="M 28 36 Q 50 24 72 36 L 70 68 Q 50 82 30 68 Z" fill="#E2E8F0" stroke="#0F172A" strokeWidth="2.5" />
            <path d="M 34 46 L 46 50 L 36 54 Z" fill="#0F172A" />
            <path d="M 66 46 L 54 50 L 64 54 Z" fill="#0F172A" />
            <polygon points="50,62 44,70 56,70" fill="#64748B" />
          </g>
        )}

        {/* ─── 8: CYBER NINJA ────────────────────────────────────────────── */}
        {preset.type === 'cyber_ninja' && (
          <g>
            <line x1="14" y1="16" x2="34" y2="36" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
            <line x1="86" y1="16" x2="66" y2="36" stroke="#F43F5E" strokeWidth="4.5" strokeLinecap="round" />
            <path d="M 24 44 L 76 44 L 72 56 L 28 56 Z" fill="#F43F5E" stroke="white" strokeWidth="1.5" />
            <circle cx="42" cy="50" r="3" fill="white" />
            <circle cx="58" cy="50" r="3" fill="white" />
          </g>
        )}

        {/* ─── 9: TACTICAL RECON ─────────────────────────────────────────── */}
        {preset.type === 'tactical_recon' && (
          <g>
            <rect x="16" y="44" width="8" height="16" rx="3" fill="#3B82F6" stroke="#0F172A" strokeWidth="2" />
            <path d="M 20 58 Q 36 74 46 70" stroke="#3B82F6" strokeWidth="3" fill="none" strokeLinecap="round" />
            <circle cx="48" cy="70" r="3.5" fill="#3B82F6" />
            <circle cx="40" cy="48" r="7" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="60" cy="48" r="7" fill="#0F172A" stroke="#3B82F6" strokeWidth="2" />
            <circle cx="40" cy="48" r="2.5" fill="#60A5FA" />
            <circle cx="60" cy="48" r="2.5" fill="#60A5FA" />
          </g>
        )}

        {/* ─── 10: NOIR INVESTIGATOR ─────────────────────────────────────── */}
        {preset.type === 'noir_investigator' && (
          <g>
            <circle cx="38" cy="50" r="8.5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
            <circle cx="62" cy="50" r="8.5" fill="#0F172A" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="46" y1="50" x2="54" y2="50" stroke="#CBD5E1" strokeWidth="2" />
            <path d="M 12 36 Q 50 24 88 36 L 78 30 Q 50 16 22 30 Z" fill="#0F172A" />
            <path d="M 24 31 C 24 16 76 16 76 31 Z" fill="#1E293B" stroke="#0F172A" strokeWidth="2" />
          </g>
        )}

        {/* ─── 11: VIVID AGENT ───────────────────────────────────────────── */}
        {preset.type === 'vivid_agent' && (
          <g>
            <polygon points="36,44 44,50 36,56 28,50" fill="#D946EF" stroke="white" strokeWidth="1.5" />
            <polygon points="64,44 72,50 64,56 56,50" fill="#D946EF" stroke="white" strokeWidth="1.5" />
            <line x1="44" y1="50" x2="56" y2="50" stroke="#D946EF" strokeWidth="2.5" />
          </g>
        )}

        {/* ─── 12: ERDAL DAYI (Kahverengi Süet Kasket & Tonton Bıyık) ────── */}
        {preset.type === 'erdal_dayi' && (
          <g>
            {/* Kahverengi Süet Kasket Hat */}
            <path d="M 18 36 Q 50 18 82 36 L 88 42 L 12 42 Z" fill="#9A3412" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
            <path d="M 24 36 L 76 36" stroke="#7C2D12" strokeWidth="3" />
            <circle cx="50" cy="22" r="3" fill="#7C2D12" />
            {/* Altın Çerçeveli Okuma Gözlüğü */}
            <circle cx="38" cy="48" r="7" stroke="#F59E0B" strokeWidth="2" fill="rgba(245,158,11,0.15)" />
            <circle cx="62" cy="48" r="7" stroke="#F59E0B" strokeWidth="2" fill="rgba(245,158,11,0.15)" />
            <line x1="45" y1="48" x2="55" y2="48" stroke="#F59E0B" strokeWidth="2" />
            {/* Tonton Kırlaşmış Bıyık */}
            <path d="M 30 58 Q 42 52 50 58 Q 58 52 70 58 Q 50 72 30 58 Z" fill="#475569" stroke="#0F172A" strokeWidth="2.5" />
          </g>
        )}

        {/* ─── 13: KOMŞU NECLA (Geleneksel Desenli Başörtü & Altın Küpe) ── */}
        {preset.type === 'komsu_necla' && (
          <g>
            {/* Kırmızı Gül Motifli Başörtüsü */}
            <path d="M 20 40 C 20 14 80 14 80 40 L 84 76 Q 50 88 16 76 Z" fill="#F43F5E" stroke="#0F172A" strokeWidth="3" />
            <path d="M 28 44 Q 50 32 72 44 L 68 70 Q 50 76 32 70 Z" fill="#FFF1F2" stroke="#0F172A" strokeWidth="1.5" />
            {/* Çiçek Motif Benekleri */}
            <circle cx="34" cy="28" r="3" fill="#FB7185" />
            <circle cx="66" cy="28" r="3" fill="#FB7185" />
            <circle cx="50" cy="22" r="3.5" fill="#FB7185" />
            {/* Altın Halka Küpeler */}
            <circle cx="24" cy="62" r="5" fill="none" stroke="#F59E0B" strokeWidth="3" />
            <circle cx="76" cy="62" r="5" fill="none" stroke="#F59E0B" strokeWidth="3" />
            {/* Gülen Gözler & Kırmızı Ruj */}
            <path d="M 34 50 Q 40 44 44 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 56 50 Q 60 44 66 50" stroke="#0F172A" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M 42 62 Q 50 70 58 62 Z" fill="#E11D48" stroke="#0F172A" strokeWidth="1.5" />
          </g>
        )}

        {/* ─── 14: TOMBALACI MEHMET (Pala Bıyıklı & Yeşil Kehribar Tespih) ─ */}
        {preset.type === 'tombalaci_mehmet' && (
          <g>
            {/* Karizmatik Gür Pala Bıyık */}
            <path d="M 26 56 Q 50 48 74 56 Q 78 64 50 74 Q 22 64 26 56 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2" />
            {/* Elde Yeşil Kehribar Tespih Taneleri */}
            <circle cx="78" cy="66" r="3.5" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="83" cy="73" r="3.5" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
            <circle cx="87" cy="80" r="3.5" fill="#10B981" stroke="#0F172A" strokeWidth="1.5" />
            <line x1="78" y1="66" x2="87" y2="80" stroke="#F59E0B" strokeWidth="1.5" />
            {/* Çatma Kaşlar */}
            <line x1="30" y1="42" x2="44" y2="47" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
            <line x1="70" y1="42" x2="56" y2="47" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {/* ─── 15: TAKSİ NURİ (Sarı Taksici Kasketi & Aviator Damla Gözlük) ─ */}
        {preset.type === 'taksi_nuri' && (
          <g>
            {/* Sarı Taksici Kasketi */}
            <path d="M 18 36 Q 50 18 82 36 L 88 42 L 12 42 Z" fill="#EAB308" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
            <rect x="20" y="36" width="60" height="5" fill="#0F172A" />
            <text x="50" y="32" textAnchor="middle" fill="#0F172A" fontSize="7" fontWeight="900" fontFamily="sans-serif">TAKSİ</text>
            {/* Damla Aviator Güneş Gözlüğü */}
            <path d="M 28 46 C 28 44 48 44 48 53 C 48 62 28 62 28 46 Z" fill="#0F172A" stroke="#EAB308" strokeWidth="2.5" />
            <path d="M 52 46 C 52 44 72 44 72 53 C 72 62 52 62 52 46 Z" fill="#0F172A" stroke="#EAB308" strokeWidth="2.5" />
            <line x1="48" y1="48" x2="52" y2="48" stroke="#EAB308" strokeWidth="2.5" />
          </g>
        )}

        {/* ─── 16: BAKKAL HÜSEYİN (Mavi Önlük & Kulağında Veresiye Kalemi) ── */}
        {preset.type === 'bakkal_huseyin' && (
          <g>
            {/* Kulağın Arkasındaki Kırmızı Kurşun Kalem */}
            <rect x="70" y="38" width="18" height="5" rx="2" fill="#EF4444" stroke="#0F172A" strokeWidth="2" transform="rotate(-30 78 40)" />
            <polygon points="86,30 92,26 88,34" fill="#FDE047" stroke="#0F172A" strokeWidth="1" />
            {/* Mavi Bakkal Önlüğü Yakası */}
            <path d="M 28 72 L 50 62 L 72 72 L 50 84 Z" fill="#2563EB" stroke="#0F172A" strokeWidth="2.5" />
            {/* Bakkal Bıyığı */}
            <path d="M 32 58 Q 50 50 68 58 Q 50 68 32 58 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2" />
          </g>
        )}

        {/* ─── 17: ÇAYCI REMZİ (Askılı Bakır Çay Tepsisi & Çay Bardağı) ──── */}
        {preset.type === 'cayci_remzi' && (
          <g>
            {/* Bakır Çay Tepsisi */}
            <path d="M 10 72 Q 50 62 90 72 L 50 88 Z" fill="#EA580C" stroke="#0F172A" strokeWidth="2.5" />
            {/* İnce Belli Kırmızı Çay Bardağı Accent */}
            <path d="M 45 68 Q 50 72 45 78 L 55 78 Q 50 72 55 68 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="1.5" />
            <ellipse cx="50" cy="68" rx="5" ry="2" fill="#7F1D1D" />
            {/* Gür Çaycı Bıyığı */}
            <path d="M 34 56 Q 50 50 66 56 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {/* ─── 18: GÖRÜNTÜLÜ TEYZE (Işıklı Telefon Ekranı & Şaşkın Yüz) ───── */}
        {preset.type === 'goruntulu_teyze' && (
          <g>
            {/* Yakından Tutulan Pembe Akıllı Telefon Çerçevesi */}
            <rect x="18" y="22" width="64" height="60" rx="12" fill="#EC4899" opacity="0.25" stroke="#EC4899" strokeWidth="3.5" />
            <circle cx="50" cy="28" r="2" fill="#EC4899" />
            {/* Şaşıran İri Gözler */}
            <circle cx="38" cy="46" r="7.5" fill="white" stroke="#0F172A" strokeWidth="2" />
            <circle cx="62" cy="46" r="7.5" fill="white" stroke="#0F172A" strokeWidth="2" />
            <circle cx="40" cy="46" r="4" fill="#0F172A" />
            <circle cx="64" cy="46" r="4" fill="#0F172A" />
            {/* Şaşkın O-Ağız */}
            <circle cx="50" cy="64" r="6" fill="#E11D48" stroke="#0F172A" strokeWidth="2.5" />
          </g>
        )}

        {/* ─── 19: DÖNERCİ USTA (Yüksek Beyaz Aşçı Şapkalı Usta) ────────── */}
        {preset.type === 'donerci_usta' && (
          <g>
            {/* Yüksek Aşçı / Dönerci Şapkası */}
            <path d="M 28 34 C 22 10 78 10 72 34 L 76 40 L 24 40 Z" fill="white" stroke="#0F172A" strokeWidth="3" strokeLinejoin="round" />
            <line x1="36" y1="20" x2="36" y2="34" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="50" y1="16" x2="50" y2="34" stroke="#CBD5E1" strokeWidth="2" />
            <line x1="64" y1="20" x2="64" y2="34" stroke="#CBD5E1" strokeWidth="2" />
            {/* Kırmızı Usta Fuları Yakası */}
            <path d="M 32 74 L 50 64 L 68 74 L 50 84 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
            {/* Pala Bıyık */}
            <path d="M 30 58 Q 50 50 70 58 Q 50 68 30 58 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="2" />
          </g>
        )}

        {/* ─── 20: SOSYETE MELİS (Cat-Eye Güneş Gözlüğü & Rujlu Gülüş) ───── */}
        {preset.type === 'sosyete_melis' && (
          <g>
            {/* Büyük Mor Cat-Eye Güneş Gözlüğü */}
            <polygon points="24,40 48,46 44,58 22,54" fill="#A855F7" stroke="#0F172A" strokeWidth="2.5" />
            <polygon points="76,40 52,46 56,58 78,54" fill="#A855F7" stroke="#0F172A" strokeWidth="2.5" />
            <line x1="48" y1="46" x2="52" y2="46" stroke="#A855F7" strokeWidth="2.5" />
            {/* İnci Gerdanlık Accent */}
            <circle cx="38" cy="76" r="2.5" fill="white" stroke="#0F172A" strokeWidth="1" />
            <circle cx="50" cy="78" r="3" fill="white" stroke="#0F172A" strokeWidth="1" />
            <circle cx="62" cy="76" r="2.5" fill="white" stroke="#0F172A" strokeWidth="1" />
            {/* Kırmızı Rujlu Şık Gülüş */}
            <path d="M 40 62 Q 50 70 60 62 Z" fill="#EF4444" stroke="#0F172A" strokeWidth="2" />
          </g>
        )}

        {/* ─── 21: FIRINCI RIZA (Sarı Bone & Yanakları Unlu Usta) ─────────── */}
        {preset.type === 'firinci_riza' && (
          <g>
            {/* Sarı Fırıncı Bonesi */}
            <path d="M 24 36 C 22 20 78 20 76 36 L 78 40 L 22 40 Z" fill="#FDE047" stroke="#0F172A" strokeWidth="3" />
            {/* Yanaklarında Un Beyazlığı Benekleri */}
            <circle cx="34" cy="54" r="4" fill="white" opacity="0.9" />
            <circle cx="66" cy="54" r="4" fill="white" opacity="0.9" />
            {/* Tonton Bıyık */}
            <path d="M 32 58 Q 50 52 68 58 Z" fill="#0F172A" stroke="#0F172A" strokeWidth="3.5" strokeLinecap="round" />
          </g>
        )}

        {/* Default eyes for non-overlay presets */}
        {preset.id < 12 &&
          preset.type !== 'shadow_detective' &&
          preset.type !== 'master_artist' &&
          preset.type !== 'phantom_spy' &&
          preset.type !== 'golden_crown' &&
          preset.type !== 'ghost_op' &&
          preset.type !== 'cyber_ninja' &&
          preset.type !== 'tactical_recon' &&
          preset.type !== 'noir_investigator' &&
          preset.type !== 'vivid_agent' &&
          preset.type !== 'stealth_op' &&
          preset.type !== 'viper_agent' &&
          preset.type !== 'cyber_impostor' && (
            <g>
              <circle cx="38" cy="48" r="4.5" fill="#0F172A" />
              <circle cx="62" cy="48" r="4.5" fill="#0F172A" />
              <circle cx="40" cy="46" r="1.5" fill="white" />
              <circle cx="64" cy="46" r="1.5" fill="white" />
            </g>
          )}

      </svg>
    </div>
  );
}
