'use client';

import React, { useRef, useEffect, useCallback } from 'react';
import { Direction } from '@/types/game';

interface MobileControlsProps {
  onMove: (dir: Direction) => void;
  onInteract: () => void;
  onStatus: () => void;
}

function DPadButton({ label, onPress, className }: { label: string; onPress: () => void; className?: string }) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timerRef  = useRef<ReturnType<typeof setInterval> | null>(null);
  const handleRef = useRef(onPress);
  handleRef.current = onPress;

  const stop = useCallback(() => {
    if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; }
  }, []);

  useEffect(() => {
    const btn = buttonRef.current;
    if (!btn) return;

    function start(e: TouchEvent | MouseEvent) {
      if (e.cancelable) e.preventDefault();
      handleRef.current();
      timerRef.current = setInterval(() => handleRef.current(), 150);
    }

    // passive: false required to call preventDefault() on touchstart
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend',   stop,  { passive: true  });
    btn.addEventListener('touchcancel',stop,  { passive: true  });
    btn.addEventListener('mousedown',  start);
    btn.addEventListener('mouseup',    stop);
    btn.addEventListener('mouseleave', stop);

    return () => {
      btn.removeEventListener('touchstart',  start);
      btn.removeEventListener('touchend',    stop);
      btn.removeEventListener('touchcancel', stop);
      btn.removeEventListener('mousedown',   start);
      btn.removeEventListener('mouseup',     stop);
      btn.removeEventListener('mouseleave',  stop);
      stop();
    };
  }, [stop]);

  return (
    <button
      ref={buttonRef}
      className={`w-16 h-16 bg-gray-800 border-2 border-gray-500 text-white text-2xl flex items-center justify-center active:bg-gray-600 select-none touch-manipulation ${className ?? ''}`}
    >
      {label}
    </button>
  );
}

export default function MobileControls({ onMove, onInteract, onStatus }: MobileControlsProps) {
  return (
    <div className="flex items-center justify-between px-6 py-4 bg-black/90 md:hidden w-full">
      {/* D-Pad */}
      <div className="grid grid-cols-3 gap-1" style={{ width: 200 }}>
        <div />
        <DPadButton label="▲" onPress={() => onMove('up')} />
        <div />
        <DPadButton label="◀" onPress={() => onMove('left')} />
        <div className="w-16 h-16 bg-gray-900 border-2 border-gray-700" />
        <DPadButton label="▶" onPress={() => onMove('right')} />
        <div />
        <DPadButton label="▼" onPress={() => onMove('down')} />
        <div />
      </div>

      {/* Action buttons — onClick is sufficient with touch-manipulation (no 300ms delay) */}
      <div className="flex flex-col gap-3">
        <button
          className="w-20 h-14 bg-blue-900 border-2 border-blue-400 text-white text-sm font-pixel active:bg-blue-700 select-none touch-manipulation"
          onClick={onInteract}
        >
          決定
        </button>
        <button
          className="w-20 h-14 bg-purple-900 border-2 border-purple-400 text-white text-xs font-pixel active:bg-purple-700 select-none touch-manipulation"
          onClick={onStatus}
        >
          ステータス
        </button>
      </div>
    </div>
  );
}
