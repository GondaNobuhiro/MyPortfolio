'use client';

import React from 'react';
import type { Position, Direction, NPCData } from '@/types/game';
import { TILE_SIZE, VIEWPORT_W, VIEWPORT_H } from '@/data/mapData';

function getPlayerSrc(dir: Direction, frame: number): string {
  return `/sprites/player/${dir}_${frame % 2}.png`;
}

interface CharacterSpriteProps {
  src: string;
  screenX: number;
  screenY: number;
}

function CharacterSprite({ src, screenX, screenY }: CharacterSpriteProps) {
  return (
    <div
      className="absolute pointer-events-none select-none"
      style={{
        left: screenX,
        top: screenY,
        width: TILE_SIZE,
        height: TILE_SIZE,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'top 0.1s linear, left 0.1s linear',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt=""
        width={TILE_SIZE}
        height={TILE_SIZE}
        style={{ imageRendering: 'pixelated' }}
      />
    </div>
  );
}

interface SpritesLayerProps {
  playerPos: Position;
  playerDir: Direction;
  cameraPos: Position;
  moveCount: number;
  npcs: NPCData[];
  mapOffsetX: number;
  mapOffsetY: number;
}

export default function SpritesLayer({ playerPos, playerDir, cameraPos, moveCount, npcs, mapOffsetX, mapOffsetY }: SpritesLayerProps) {
  function toScreen(pos: Position) {
    return {
      x: mapOffsetX + (pos.x - cameraPos.x) * TILE_SIZE,
      y: mapOffsetY + (pos.y - cameraPos.y) * TILE_SIZE,
    };
  }
  function inViewport(pos: Position) {
    return (
      pos.x >= cameraPos.x && pos.x < cameraPos.x + VIEWPORT_W &&
      pos.y >= cameraPos.y && pos.y < cameraPos.y + VIEWPORT_H
    );
  }

  const playerScreen = toScreen(playerPos);

  return (
    <div className="absolute inset-0 pointer-events-none">
      {npcs.filter(npc => inViewport(npc.pos)).map(npc => {
        const s = toScreen(npc.pos);
        return (
          <CharacterSprite
            key={npc.prefix}
            src={npc.imagePath}
            screenX={s.x}
            screenY={s.y}
          />
        );
      })}
      <CharacterSprite
        src={getPlayerSrc(playerDir, moveCount)}
        screenX={playerScreen.x}
        screenY={playerScreen.y}
      />
    </div>
  );
}
