'use client';

import React, { useEffect, useRef } from 'react';
import type { Position, ComputedMapData } from '@/types/game';
import { TILE_SIZE, VIEWPORT_W, VIEWPORT_H } from '@/data/mapData';

interface GameMapProps {
  cameraPos: Position;
  mapData: ComputedMapData;
  dialogProgress: Record<string, number>;
  mapOffsetX: number;
  mapOffsetY: number;
}

export default function GameMap({ cameraPos, mapData, dialogProgress, mapOffsetX, mapOffsetY }: GameMapProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<Record<string, HTMLImageElement>>({});

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    function drawAt(imagePath: string, col: number, row: number) {
      const img = imagesRef.current[imagePath];
      if (img) ctx!.drawImage(img, mapOffsetX + col * TILE_SIZE, mapOffsetY + row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
    }

    const colsInView = Math.min(VIEWPORT_W, mapData.width);
    const rowsInView = Math.min(VIEWPORT_H, mapData.height);

    function draw() {
      ctx!.fillStyle = '#000000';
      ctx!.fillRect(0, 0, canvas!.width, canvas!.height);

      // Pass 1: terrain or NPC/object background
      for (let row = 0; row < rowsInView; row++) {
        for (let col = 0; col < colsInView; col++) {
          const char = mapData.tiles[cameraPos.y + row]?.[cameraPos.x + col] ?? '';
          const bgPath = mapData.tileBg[char];
          if (bgPath) {
            drawAt(bgPath, col, row);
          } else {
            const terrainPath = mapData.terrainImages[char];
            if (terrainPath) drawAt(terrainPath, col, row);
          }
        }
      }

      // Pass 2: object/terrain foreground (state-aware for multi-image objects)
      for (let row = 0; row < rowsInView; row++) {
        for (let col = 0; col < colsInView; col++) {
          const char = mapData.tiles[cameraPos.y + row]?.[cameraPos.x + col] ?? '';
          const obj = mapData.objects.find(o => o.prefix === char);
          let fgPath: string | undefined;
          if (obj?.images && obj.images.length > 0) {
            const key = `${mapData.mapId}:${char}`;
            const idx = Math.min(dialogProgress[key] ?? 0, obj.images.length - 1);
            fgPath = obj.images[idx];
          } else {
            fgPath = mapData.tileFg[char];
          }
          if (fgPath) drawAt(fgPath, col, row);
        }
      }
    }

    const missing = mapData.allImagePaths.filter(p => !imagesRef.current[p]);
    if (missing.length === 0) {
      draw();
      return;
    }

    let loaded = 0;
    missing.forEach(src => {
      const img = new Image();
      img.src = src;
      img.onload = () => {
        imagesRef.current[src] = img;
        loaded++;
        if (loaded === missing.length) draw();
      };
      img.onerror = () => {
        loaded++;
        if (loaded === missing.length) draw();
      };
    });
  }, [cameraPos, mapData, dialogProgress, mapOffsetX, mapOffsetY]);

  return (
    <canvas
      ref={canvasRef}
      width={VIEWPORT_W * TILE_SIZE}
      height={VIEWPORT_H * TILE_SIZE}
      style={{ display: 'block', imageRendering: 'pixelated' }}
    />
  );
}
