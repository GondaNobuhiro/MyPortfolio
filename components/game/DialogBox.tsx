'use client';

import React, { useEffect, useState } from 'react';
import { DialogState } from '@/types/game';

interface DialogBoxProps {
  dialog: DialogState;
  onAdvance: () => void;
}

export default function DialogBox({ dialog, onAdvance }: DialogBoxProps) {
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const id = setInterval(() => setBlink(b => !b), 500);
    return () => clearInterval(id);
  }, []);

  if (!dialog.active) return null;

  const currentLine = dialog.lines[dialog.lineIdx] ?? '';
  const visibleText = currentLine.slice(0, dialog.charIdx);
  const isComplete = dialog.charIdx >= currentLine.length;
  const isLast = dialog.lineIdx + 1 >= dialog.lines.length;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20" onClick={onAdvance}>
      <div
        className="m-2 p-3 border-4 border-white bg-blue-950 text-white font-pixel"
        style={{ imageRendering: 'pixelated', minHeight: 96 }}
      >
        {/* Speaker name */}
        {dialog.speakerName && (
          <div className="text-yellow-300 text-xs mb-1 border-b border-blue-700 pb-1">
            {dialog.speakerName}
          </div>
        )}

        {/* Dialog text */}
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {visibleText}
          {isComplete && (
            <span
              className="inline-block ml-1 text-white"
              style={{ opacity: blink ? 1 : 0 }}
            >
              {isLast ? '■' : '▼'}
            </span>
          )}
        </div>

        {/* Hint */}
        <div className="text-right text-xs text-blue-300 mt-1 opacity-60">
          Spaceキーで{isLast ? '閉じる' : '次へ'}
        </div>
      </div>
    </div>
  );
}