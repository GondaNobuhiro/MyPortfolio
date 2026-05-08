'use client';

import { useState } from 'react';
import Game from '@/components/game/Game';
import OpeningScreen from '@/components/game/OpeningScreen';

export default function Home() {
  const [started, setStarted] = useState(false);
  return started ? <Game /> : <OpeningScreen onStart={() => setStarted(true)} />;
}
