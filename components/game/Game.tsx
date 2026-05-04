'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useGameEngine } from '@/hooks/useGameEngine';
import { useBGM } from '@/hooks/useBGM';
import { getMapData } from '@/data/allMaps';
import GameMap from './GameMap';
import SpritesLayer from './Sprites';
import DialogBox from './DialogBox';
import StatusScreen from './StatusScreen';
import MobileControls from './MobileControls';
import { TILE_SIZE, VIEWPORT_W, VIEWPORT_H } from '@/data/mapData';

const VIEWPORT_PX_W = TILE_SIZE * VIEWPORT_W;
const VIEWPORT_PX_H = TILE_SIZE * VIEWPORT_H;

const KEY_MAP: Record<string, string> = {
  ArrowUp:    'up',
  ArrowDown:  'down',
  ArrowLeft:  'left',
  ArrowRight: 'right',
  w: 'up', a: 'left', s: 'down', d: 'right',
  ' ': 'interact',
  Enter: 'interact',
  Escape: 'close',
  z: 'interact',
  x: 'close',
  Tab: 'status',
};

export default function Game() {
  const { state, movePlayer, interact, advDialog, openScreen, closeScreen, fadeState } = useGameEngine();
  const { isPlaying, toggle: toggleBGM } = useBGM();
  const containerRef = useRef<HTMLDivElement>(null);
  const keysHeld = useRef<Set<string>>(new Set());
  const moveInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const [gameScale, setGameScale] = useState(1);

  const mapData = getMapData(state.mapId);
  const mapOffsetX = Math.floor((VIEWPORT_W - Math.min(VIEWPORT_W, mapData.width))  / 2) * TILE_SIZE;
  const mapOffsetY = Math.floor((VIEWPORT_H - Math.min(VIEWPORT_H, mapData.height)) / 2) * TILE_SIZE;

  // Scale game to fit screen width on mobile
  useEffect(() => {
    function updateScale() {
      setGameScale(window.innerWidth < 768 ? Math.min(1, window.innerWidth / VIEWPORT_PX_W) : 1);
    }
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      const mapped = KEY_MAP[e.key];
      if (!mapped) return;
      e.preventDefault();

      if (mapped === 'interact') { interact(); return; }
      if (mapped === 'close') {
        if (state.dialog.active) { advDialog(); return; }
        closeScreen();
        return;
      }
      if (mapped === 'status') {
        if (!state.dialog.active) openScreen('status');
        return;
      }
      if (['up', 'down', 'left', 'right'].includes(mapped)) {
        if (!keysHeld.current.has(e.key)) {
          keysHeld.current.add(e.key);
          movePlayer(mapped as 'up' | 'down' | 'left' | 'right');
        }
      }
    }

    function handleKeyUp(e: KeyboardEvent) {
      keysHeld.current.delete(e.key);
    }

    window.addEventListener('keydown', handleKey);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKey);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [state.dialog.active, state.screen, interact, advDialog, closeScreen, movePlayer, openScreen]);

  useEffect(() => {
    if (moveInterval.current) clearInterval(moveInterval.current);

    moveInterval.current = setInterval(() => {
      const held = keysHeld.current;
      if (held.has('ArrowUp'))    { movePlayer('up'); return; }
      if (held.has('ArrowDown'))  { movePlayer('down'); return; }
      if (held.has('ArrowLeft'))  { movePlayer('left'); return; }
      if (held.has('ArrowRight')) { movePlayer('right'); return; }
      if (held.has('w')) { movePlayer('up'); return; }
      if (held.has('a')) { movePlayer('left'); return; }
      if (held.has('s')) { movePlayer('down'); return; }
      if (held.has('d')) { movePlayer('right'); return; }
    }, 150);

    return () => {
      if (moveInterval.current) clearInterval(moveInterval.current);
    };
  }, [movePlayer]);

  const scaledW = Math.round(VIEWPORT_PX_W * gameScale);
  const scaledH = Math.round(VIEWPORT_PX_H * gameScale);

  return (
    <div className="flex flex-col items-center justify-center bg-black w-full" style={{ minHeight: '100dvh' }}>
      <div className="font-pixel text-yellow-300 text-xs mb-1 tracking-widest">
        ～ NOBBY&apos;S PORTFOLIO ～
      </div>

      {/* Outer wrapper: provides correct layout footprint for scaled content */}
      <div style={{ width: scaledW, height: scaledH, overflow: 'hidden', flexShrink: 0 }}>
        <div
          ref={containerRef}
          className="relative overflow-hidden border-4 border-white shadow-2xl shadow-blue-900/50"
          style={{
            width: VIEWPORT_PX_W,
            height: VIEWPORT_PX_H,
            transform: `scale(${gameScale})`,
            transformOrigin: 'top left',
          }}
          tabIndex={0}
        >
          <button
            className="absolute top-1 right-1 z-40 font-pixel text-[10px] px-2 py-0.5 border bg-black/60 transition-colors"
            style={isPlaying
              ? { borderColor: '#facc15', color: '#facc15' }
              : { borderColor: '#6b7280', color: '#6b7280' }}
            onClick={toggleBGM}
          >
            {isPlaying ? '♪ ON' : '♪ OFF'}
          </button>

          <GameMap
            cameraPos={state.cameraPos}
            mapData={mapData}
            dialogProgress={state.dialogProgress}
            mapOffsetX={mapOffsetX}
            mapOffsetY={mapOffsetY}
          />

          <SpritesLayer
            playerPos={state.playerPos}
            playerDir={state.playerDir}
            cameraPos={state.cameraPos}
            moveCount={state.moveCount}
            npcs={mapData.npcs}
            mapOffsetX={mapOffsetX}
            mapOffsetY={mapOffsetY}
          />

          <div
            className="absolute inset-0 z-50 bg-black pointer-events-none"
            style={{
              opacity: fadeState === 'out' ? 1 : 0,
              transition: fadeState === 'none' ? 'none' : 'opacity 0.3s ease-in-out',
            }}
          />

          <DialogBox dialog={state.dialog} onAdvance={interact} />

          <StatusScreen screen={state.screen} onClose={closeScreen} items={state.items} />
        </div>
      </div>

      <MobileControls
        onMove={movePlayer}
        onInteract={interact}
        onStatus={() => openScreen('status')}
      />

      <div className="font-pixel text-blue-400 text-[9px] mt-2 text-center leading-relaxed hidden md:block">
        矢印 / WASD: 移動　　Space / Enter: 調べる・決定　　Tab: ステータス　　Esc: 閉じる　　♪: BGM
      </div>
    </div>
  );
}
