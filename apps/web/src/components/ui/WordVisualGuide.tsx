'use client';

import React from 'react';
import {
  Car,
  Home,
  Sun,
  Cat,
  Dog,
  Plane,
  Apple,
  Pizza,
  Fish,
  Phone,
  Bike,
  Clock,
  Glasses,
  Key,
  Flower2,
  IceCream2,
  Cake,
  Shirt,
  Umbrella,
  Guitar,
  Rocket,
  Star,
  Camera,
  Moon,
  Cloud,
  Smile,
  Trees,
  Footprints,
  Tv,
  Crown,
  Sword,
  Shield,
  GraduationCap,
  Briefcase,
  Utensils,
  Lightbulb,
  Headphones,
  Bell,
  Palette,
  Eye,
  Scissors,
  Bookmark,
  Gem,
  Compass,
  Zap,
} from 'lucide-react';

interface WordVisualGuideProps {
  word: string;
  category?: string;
  className?: string;
}

export function WordVisualGuide({ word, category, className = 'w-12 h-12' }: WordVisualGuideProps) {
  const w = word.toLowerCase().trim();

  // Map word names to specific vector icons
  if (w.includes('araba') || w.includes('car')) return <Car className={`${className} text-cyan-400`} />;
  if (w.includes('ev') || w.includes('house') || w.includes('kale')) return <Home className={`${className} text-amber-400`} />;
  if (w.includes('güneş') || w.includes('sun')) return <Sun className={`${className} text-amber-300 animate-spin-slow`} />;
  if (w.includes('kedi') || w.includes('cat')) return <Cat className={`${className} text-orange-400`} />;
  if (w.includes('köpek') || w.includes('dog')) return <Dog className={`${className} text-yellow-500`} />;
  if (w.includes('uçak') || w.includes('plane') || w.includes('helikopter')) return <Plane className={`${className} text-sky-400`} />;
  if (w.includes('elma') || w.includes('apple')) return <Apple className={`${className} text-rose-500`} />;
  if (w.includes('pizza')) return <Pizza className={`${className} text-amber-500`} />;
  if (w.includes('balık') || w.includes('fish') || w.includes('köpekbalığı')) return <Fish className={`${className} text-cyan-300`} />;
  if (w.includes('telefon') || w.includes('phone')) return <Phone className={`${className} text-emerald-400`} />;
  if (w.includes('bisiklet') || w.includes('bicycle') || w.includes('bike')) return <Bike className={`${className} text-emerald-300`} />;
  if (w.includes('saat') || w.includes('clock')) return <Clock className={`${className} text-cyan-400`} />;
  if (w.includes('gözlük') || w.includes('glasses')) return <Glasses className={`${className} text-indigo-400`} />;
  if (w.includes('anahtar') || w.includes('key')) return <Key className={`${className} text-amber-400`} />;
  if (w.includes('çiçek') || w.includes('flower')) return <Flower2 className={`${className} text-pink-400`} />;
  if (w.includes('dondurma') || w.includes('ice cream')) return <IceCream2 className={`${className} text-pink-300`} />;
  if (w.includes('pasta') || w.includes('cake')) return <Cake className={`${className} text-purple-400`} />;
  if (w.includes('şapka') || w.includes('hat')) return <Shirt className={`${className} text-indigo-300`} />;
  if (w.includes('şemsiye') || w.includes('umbrella')) return <Umbrella className={`${className} text-blue-400`} />;
  if (w.includes('gitar') || w.includes('guitar')) return <Guitar className={`${className} text-amber-500`} />;
  if (w.includes('roket') || w.includes('rocket') || w.includes('uzay')) return <Rocket className={`${className} text-rose-400`} />;
  if (w.includes('yıldız') || w.includes('star')) return <Star className={`${className} text-amber-300 fill-amber-300/30`} />;
  if (w.includes('kamera') || w.includes('camera')) return <Camera className={`${className} text-slate-300`} />;
  if (w.includes('ay') || w.includes('moon')) return <Moon className={`${className} text-slate-200`} />;
  if (w.includes('bulut') || w.includes('cloud')) return <Cloud className={`${className} text-sky-200`} />;
  if (w.includes('ağaç') || w.includes('tree') || w.includes('orman')) return <Trees className={`${className} text-emerald-500`} />;
  if (w.includes('televizyon') || w.includes('tv')) return <Tv className={`${className} text-cyan-500`} />;
  if (w.includes('taç') || w.includes('crown')) return <Crown className={`${className} text-amber-400`} />;
  if (w.includes('kılıç') || w.includes('sword')) return <Sword className={`${className} text-slate-300`} />;
  if (w.includes('kalkan') || w.includes('shield')) return <Shield className={`${className} text-cyan-400`} />;
  if (w.includes('doktor') || w.includes('öğretmen') || w.includes('okul')) return <GraduationCap className={`${className} text-blue-400`} />;
  if (w.includes('polis') || w.includes('çiftçi')) return <Briefcase className={`${className} text-indigo-400`} />;
  if (w.includes('hamburger') || w.includes('burger') || w.includes('sandviç')) return <Utensils className={`${className} text-amber-500`} />;
  if (w.includes('lamba') || w.includes('ampul')) return <Lightbulb className={`${className} text-amber-300`} />;
  if (w.includes('kulaklık') || w.includes('müzik')) return <Headphones className={`${className} text-purple-400`} />;
  if (w.includes('elmas') || w.includes('yüzük')) return <Gem className={`${className} text-cyan-300`} />;
  if (w.includes('pusula') || w.includes('harita')) return <Compass className={`${className} text-emerald-400`} />;
  if (w.includes('şekil') || w.includes('şimşek')) return <Zap className={`${className} text-amber-400`} />;

  // Category fallback graphics
  const cat = (category || '').toLowerCase();
  if (cat === 'animals' || cat === 'hayvanlar') return <Cat className={`${className} text-amber-400`} />;
  if (cat === 'food' || cat === 'yemek') return <Utensils className={`${className} text-rose-400`} />;
  if (cat === 'objects' || cat === 'eşyalar') return <Palette className={`${className} text-cyan-400`} />;
  if (cat === 'nature' || cat === 'doğa') return <Trees className={`${className} text-emerald-400`} />;
  if (cat === 'jobs' || cat === 'meslekler') return <Briefcase className={`${className} text-purple-400`} />;
  if (cat === 'sports' || cat === 'spor') return <Footprints className={`${className} text-sky-400`} />;

  // Default fallback
  return <Palette className={`${className} text-cyan-400`} />;
}
