'use client';

import React, { useEffect, useState } from 'react';

interface Props {
  onStart: () => void;
}

const STAR_COUNT = 80;

function generateStars() {
  return Array.from({ length: STAR_COUNT }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() < 0.3 ? 2 : 1,
    delay: Math.random() * 3,
    duration: 2 + Math.random() * 2,
  }));
}

type Phase = 'logo' | 'ready' | 'fading';

export default function OpeningScreen({ onStart }: Props) {
  const [phase, setPhase]           = useState<Phase>('logo');
  const [logoVisible, setLogoVisible] = useState(false);
  const [stars, setStars]            = useState<ReturnType<typeof generateStars>>([]);

  useEffect(() => {
    setStars(generateStars());
    const t1 = setTimeout(() => setLogoVisible(true), 400);
    const t2 = setTimeout(() => setPhase('ready'), 2200);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  function handleStart() {
    if (phase !== 'ready') return;
    setPhase('fading');
    setTimeout(onStart, 700);
  }

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleStart();
      }
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <div
      className="fixed inset-0 bg-black flex flex-col items-center justify-center font-pixel select-none"
      onClick={handleStart}
    >
      {/* Stars */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {stars.map(s => (
          <div
            key={s.id}
            className="absolute rounded-full bg-white"
            style={{
              left: `${s.x}%`,
              top: `${s.y}%`,
              width: s.size,
              height: s.size,
              animation: `twinkle ${s.duration}s ${s.delay}s ease-in-out infinite`,
            }}
          />
        ))}
      </div>

      {/* Logo block */}
      <div
        className="flex flex-col items-center gap-4 transition-opacity duration-1000"
        style={{ opacity: logoVisible ? 1 : 0 }}
      >
        {/* EN title */}
        <div className="text-yellow-300 text-lg md:text-2xl tracking-[0.3em] text-center">
          NOBBY&apos;S
        </div>
        <div className="text-white text-3xl md:text-5xl tracking-[0.2em] text-center drop-shadow-[0_0_12px_rgba(255,255,255,0.4)]">
          ADVENTURE
        </div>

        {/* Divider */}
        <div className="w-48 md:w-72 h-px bg-blue-500 opacity-60 my-2" />

        {/* JP subtitle */}
        <div className="text-blue-300 text-[10px] md:text-xs tracking-widest text-center">
          ～ システムエンジニアの冒険 ～
        </div>
      </div>

      {/* Press Enter */}
      <div
        className="absolute bottom-1/4 text-white text-[10px] md:text-xs tracking-widest transition-opacity duration-500"
        style={{ opacity: phase === 'ready' ? 1 : 0 }}
      >
        <span className="animate-[blink_1.2s_step-end_infinite]">
          PRESS ENTER KEY
        </span>
      </div>

      {/* Copyright */}
      <div className="absolute bottom-6 text-gray-600 text-[8px] md:text-[10px] tracking-widest">
        © 2026 NOBBY
      </div>

      {/* Fade overlay */}
      <div
        className="absolute inset-0 bg-black pointer-events-none transition-opacity duration-700"
        style={{ opacity: phase === 'fading' ? 1 : 0 }}
      />
    </div>
  );
}
