'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

const FREQ: Record<string, number> = {
  C3: 130.81, D3: 146.83, E3: 164.81, G3: 196.00, A3: 220.00,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00,
  A4: 440.00, B4: 493.88, C5: 523.25, D5: 587.33,
};

const BPM = 112;
const BEAT = 60 / BPM;
const LOOKAHEAD = 0.15;   // 先読みバッファ (秒)
const TICK_MS   = 60;     // スケジューラ間隔 (ms)

type Step = [string | null, number]; // [音名 | 休符, 拍数]

// メロディ (16小節 = 64拍)
const MELODY: Step[] = [
  // A section
  ['G4', 1], ['G4', 1], ['B4', 1], ['A4', 1],
  ['G4', 2], ['D4', 2],
  ['E4', 1], ['G4', 1], ['A4', 1], ['C5', 1],
  ['B4', 2], [null, 2],
  ['D5', 1], ['C5', 1], ['B4', 1], ['A4', 1],
  ['G4', 2], ['E4', 1], ['D4', 1],
  ['C4', 1], ['E4', 1], ['G4', 1], ['A4', 1],
  ['G4', 3], [null, 1],
  // B section
  ['B4', 1], ['B4', 1], ['D5', 1], ['C5', 1],
  ['B4', 2], ['G4', 2],
  ['A4', 1], ['C5', 1], ['B4', 1], ['A4', 1],
  ['G4', 2], [null, 2],
  ['F4', 1], ['A4', 1], ['G4', 1], ['F4', 1],
  ['E4', 2], ['C4', 1], ['D4', 1],
  ['E4', 1], ['G4', 1], ['A4', 1], ['G4', 1],
  ['G4', 4],
];

// ベース (16小節 = 64拍)
const BASS: Step[] = [
  ['G3', 4], ['G3', 4],
  ['C3', 4], ['C3', 4],
  ['A3', 4], ['D3', 4],
  ['G3', 4], ['G3', 4],
  ['G3', 4], ['G3', 4],
  ['E3', 4], ['E3', 4],
  ['A3', 4], ['D3', 4],
  ['G3', 4], ['G3', 4],
];

function playNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  beats: number,
  type: OscillatorType,
  gain: number,
) {
  const dur = beats * BEAT;
  const osc = ctx.createOscillator();
  const g   = ctx.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, startTime);
  g.gain.linearRampToValueAtTime(gain, startTime + 0.01);
  g.gain.setValueAtTime(gain, startTime + dur * 0.72);
  g.gain.linearRampToValueAtTime(0, startTime + dur * 0.92);
  osc.connect(g);
  g.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + dur + 0.05);
}

export function useBGM() {
  const [isPlaying, setIsPlaying] = useState(false);
  const ctxRef      = useRef<AudioContext | null>(null);
  const activeRef   = useRef(false);
  const timerRef    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mIdxRef     = useRef(0);
  const bIdxRef     = useRef(0);
  const nextMRef    = useRef(0);
  const nextBRef    = useRef(0);

  const tick = useCallback(() => {
    const ctx = ctxRef.current;
    if (!ctx || !activeRef.current) return;
    const horizon = ctx.currentTime + LOOKAHEAD;

    while (nextMRef.current < horizon) {
      const [note, beats] = MELODY[mIdxRef.current];
      if (note) playNote(ctx, FREQ[note], nextMRef.current, beats, 'square', 0.08);
      nextMRef.current += beats * BEAT;
      mIdxRef.current = (mIdxRef.current + 1) % MELODY.length;
    }

    while (nextBRef.current < horizon) {
      const [note, beats] = BASS[bIdxRef.current];
      if (note) playNote(ctx, FREQ[note], nextBRef.current, beats, 'triangle', 0.055);
      nextBRef.current += beats * BEAT;
      bIdxRef.current = (bIdxRef.current + 1) % BASS.length;
    }

    timerRef.current = setTimeout(tick, TICK_MS);
  }, []);

  const start = useCallback(() => {
    if (activeRef.current) return;
    const ctx = new AudioContext();
    ctxRef.current = ctx;
    const now = ctx.currentTime + 0.05;
    nextMRef.current = now;
    nextBRef.current = now;
    mIdxRef.current  = 0;
    bIdxRef.current  = 0;
    activeRef.current = true;
    setIsPlaying(true);
    tick();
  }, [tick]);

  const stop = useCallback(() => {
    activeRef.current = false;
    setIsPlaying(false);
    if (timerRef.current) clearTimeout(timerRef.current);
    ctxRef.current?.close();
    ctxRef.current = null;
  }, []);

  const toggle = useCallback(() => {
    if (activeRef.current) stop();
    else start();
  }, [start, stop]);

  useEffect(() => () => { stop(); }, [stop]);

  return { isPlaying, start, toggle };
}
