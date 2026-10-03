'use client';

import React from 'react';

export function TRFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`rounded-sm inline-block shrink-0 ${className}`} viewBox="0 0 1200 800">
      <rect width="1200" height="800" fill="#E30A17" />
      <circle cx="425" cy="400" r="200" fill="#FFFFFF" />
      <circle cx="475" cy="400" r="160" fill="#E30A17" />
      <polygon
        fill="#FFFFFF"
        points="583.333,400 735.632,449.49 641.503,320.51 641.503,479.49 735.632,350.51"
      />
    </svg>
  );
}

export function GBFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`rounded-sm inline-block shrink-0 ${className}`} viewBox="0 0 60 30">
      <clipPath id="s">
        <path d="M0,0 v30 h60 v-30 z" />
      </clipPath>
      <clipPath id="t">
        <path d="M30,15 m-60,0 h120 v30 h-120 z M30,15 m0,-30 v60 h30 v-60 z" />
      </clipPath>
      <g clipPath="url(#s)">
        <path d="M0,0 l60,30 M0,30 l60,-30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 l60,30 M0,30 l60,-30" stroke="#cf142b" strokeWidth="2" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#cf142b" strokeWidth="6" />
      </g>
    </svg>
  );
}

export function DEFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`rounded-sm inline-block shrink-0 ${className}`} viewBox="0 0 5 3">
      <rect width="5" height="3" fill="#000" />
      <rect width="5" height="2" y="1" fill="#D00" />
      <rect width="5" height="1" y="2" fill="#FFCE00" />
    </svg>
  );
}

export function ESFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`rounded-sm inline-block shrink-0 ${className}`} viewBox="0 0 750 500">
      <rect width="750" height="500" fill="#c60b1e" />
      <rect width="750" height="250" y="125" fill="#ffc400" />
    </svg>
  );
}

export function FRFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`rounded-sm inline-block shrink-0 ${className}`} viewBox="0 0 3 2">
      <rect width="1" height="2" fill="#002395" />
      <rect width="1" height="2" x="1" fill="#FFFFFF" />
      <rect width="1" height="2" x="2" fill="#ED2939" />
    </svg>
  );
}

export function ARFlag({ className = 'w-5 h-3.5' }: { className?: string }) {
  return (
    <svg className={`rounded-sm inline-block shrink-0 ${className}`} viewBox="0 0 6 3">
      <rect width="6" height="1" fill="#007A3D" />
      <rect width="6" height="1" y="1" fill="#FFFFFF" />
      <rect width="6" height="1" y="2" fill="#000000" />
      <rect width="1.5" height="3" fill="#CE1126" />
    </svg>
  );
}

