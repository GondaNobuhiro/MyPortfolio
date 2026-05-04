'use client';

import { useReducer, useEffect, useCallback, useState } from 'react';
import type { GameState, GameAction, Direction, Position, ScreenMode, ItemData } from '@/types/game';
import { VIEWPORT_W, VIEWPORT_H } from '@/data/mapData';
import { getMapData } from '@/data/allMaps';

export type FadeState = 'none' | 'out' | 'in';

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function calcCamera(p: Position, mapWidth: number, mapHeight: number): Position {
  return {
    x: clamp(p.x - Math.floor(VIEWPORT_W / 2), 0, mapWidth - VIEWPORT_W),
    y: clamp(p.y - Math.floor(VIEWPORT_H / 2), 0, mapHeight - VIEWPORT_H),
  };
}

function dirOffset(dir: Direction): Position {
  if (dir === 'up')    return { x: 0,  y: -1 };
  if (dir === 'down')  return { x: 0,  y:  1 };
  if (dir === 'left')  return { x: -1, y:  0 };
  return                      { x: 1,  y:  0 };
}

function getTileAt(tiles: string[], x: number, y: number, width: number, height: number): string {
  if (x < 0 || x >= width || y < 0 || y >= height) return '';
  return tiles[y]?.[x] ?? '';
}

const map1 = getMapData('map1');

const INITIAL: GameState = {
  mapId: 'map1',
  pendingMap: null,
  playerPos: map1.startPos,
  playerDir: 'down',
  cameraPos: calcCamera(map1.startPos, map1.width, map1.height),
  dialog: { active: false, lines: [], lineIdx: 0, charIdx: 0 },
  screen: 'game',
  moveCount: 0,
  inputLocked: false,
  dialogProgress: {},
  items: [],
};

function reducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {

    case 'MOVE': {
      if (state.dialog.active || state.screen !== 'game' || state.pendingMap !== null) return state;
      const mapData = getMapData(state.mapId);
      const off = dirOffset(action.dir);
      const next = { x: state.playerPos.x + off.x, y: state.playerPos.y + off.y };

      const outOfBounds = next.x < 0 || next.x >= mapData.width || next.y < 0 || next.y >= mapData.height;
      if (outOfBounds) {
        return {
          ...state,
          playerDir: action.dir,
          moveCount: state.moveCount + 1,
          dialog: { active: true, lines: ['この先はまだ解放されていないようだ。。。'], lineIdx: 0, charIdx: 0 },
        };
      }

      const tile = getTileAt(mapData.tiles, next.x, next.y, mapData.width, mapData.height);
      const blocked = !mapData.walkableSet.has(tile);

      if (blocked) {
        return { ...state, playerDir: action.dir, moveCount: state.moveCount + 1 };
      }

      // Queue map transition (fade effect driven by useEffect in hook)
      const terrain = mapData.terrainTiles[tile];
      if (terrain?.targetMap && terrain?.targetPos) {
        return {
          ...state,
          playerDir: action.dir,
          moveCount: state.moveCount + 1,
          pendingMap: { mapId: terrain.targetMap, pos: terrain.targetPos },
        };
      }

      return {
        ...state,
        playerDir: action.dir,
        playerPos: next,
        cameraPos: calcCamera(next, mapData.width, mapData.height),
        moveCount: state.moveCount + 1,
      };
    }

    case 'INTERACT': {
      if (state.screen !== 'game' || state.pendingMap !== null) return state;

      if (state.dialog.active) {
        return reducer(state, { type: 'ADVANCE_DIALOG' });
      }

      const mapData = getMapData(state.mapId);
      const { playerPos, playerDir } = state;
      const off = dirOffset(playerDir);
      const tx = playerPos.x + off.x;
      const ty = playerPos.y + off.y;
      const facingTile = getTileAt(mapData.tiles, tx, ty, mapData.width, mapData.height);

      const npc = mapData.npcs.find(n => n.prefix === facingTile);
      if (npc) {
        const key = `${state.mapId}:${npc.prefix}`;
        const idx = (state.dialogProgress[key] ?? 0) % npc.dialogs.length;
        return {
          ...state,
          dialog: { active: true, lines: npc.dialogs[idx], lineIdx: 0, charIdx: 0, speakerName: npc.name, sourceId: key },
        };
      }

      const obj = mapData.objects.find(o => o.prefix === facingTile);
      if (obj) {
        if (obj.targetMap && obj.targetPos) {
          return { ...state, pendingMap: { mapId: obj.targetMap, pos: obj.targetPos } };
        }
        const key = `${state.mapId}:${obj.prefix}`;
        const idx = Math.min(state.dialogProgress[key] ?? 0, obj.dialogs.length - 1);
        return {
          ...state,
          dialog: { active: true, lines: obj.dialogs[idx], lineIdx: 0, charIdx: 0, speakerName: obj.name, sourceId: key },
        };
      }

      return state;
    }

    case 'APPLY_MAP_CHANGE': {
      if (!state.pendingMap) return state;
      const target = getMapData(state.pendingMap.mapId);
      return {
        ...state,
        mapId: state.pendingMap.mapId,
        playerPos: state.pendingMap.pos,
        cameraPos: calcCamera(state.pendingMap.pos, target.width, target.height),
        pendingMap: null,
        dialog: { active: false, lines: [], lineIdx: 0, charIdx: 0 },
      };
    }

    case 'ADVANCE_DIALOG': {
      const { dialog } = state;
      if (!dialog.active) return state;
      const currentLine = dialog.lines[dialog.lineIdx] ?? '';
      if (dialog.charIdx < currentLine.length) {
        return { ...state, dialog: { ...dialog, charIdx: currentLine.length } };
      }
      if (dialog.lineIdx + 1 >= dialog.lines.length) {
        const nextProgress = dialog.sourceId
          ? { ...state.dialogProgress, [dialog.sourceId]: (state.dialogProgress[dialog.sourceId] ?? 0) + 1 }
          : state.dialogProgress;

        // Give item on first completion of an object dialog
        let newItems: ItemData[] = state.items;
        if (dialog.sourceId && (state.dialogProgress[dialog.sourceId] ?? 0) === 0) {
          const colonIdx = dialog.sourceId.indexOf(':');
          const srcMapId = dialog.sourceId.slice(0, colonIdx);
          const srcPrefix = dialog.sourceId.slice(colonIdx + 1);
          const srcMapData = getMapData(srcMapId);
          const srcObj = srcMapData.objects.find(o => o.prefix === srcPrefix);
          if (srcObj?.item && !state.items.some(i => i.id === srcObj.item!.id)) {
            newItems = [...state.items, srcObj.item];
          }
        }

        return {
          ...state,
          dialog: { active: false, lines: [], lineIdx: 0, charIdx: 0 },
          dialogProgress: nextProgress,
          items: newItems,
        };
      }
      return { ...state, dialog: { ...dialog, lineIdx: dialog.lineIdx + 1, charIdx: 0 } };
    }

    case 'DIALOG_TICK': {
      const { dialog } = state;
      if (!dialog.active) return state;
      const line = dialog.lines[dialog.lineIdx] ?? '';
      if (dialog.charIdx >= line.length) return state;
      return { ...state, dialog: { ...dialog, charIdx: dialog.charIdx + 1 } };
    }

    case 'OPEN_SCREEN': {
      if (state.dialog.active) return state;
      return { ...state, screen: action.screen };
    }

    case 'CLOSE_SCREEN': {
      return { ...state, screen: 'game' };
    }

    case 'START_DIALOG': {
      return {
        ...state,
        dialog: { active: true, lines: action.lines, lineIdx: 0, charIdx: 0, speakerName: action.speakerName },
      };
    }

    case 'CHANGE_MAP': {
      return { ...state, pendingMap: { mapId: action.mapId, pos: action.pos } };
    }

    default:
      return state;
  }
}

const FADE_DURATION = 300; // ms

export function useGameEngine() {
  const [state, dispatch] = useReducer(reducer, INITIAL);
  const [fadeState, setFadeState] = useState<FadeState>('none');

  // Typewriter tick
  useEffect(() => {
    if (!state.dialog.active) return;
    const { dialog } = state;
    const line = dialog.lines[dialog.lineIdx] ?? '';
    if (dialog.charIdx >= line.length) return;
    const id = setTimeout(() => dispatch({ type: 'DIALOG_TICK' }), 45);
    return () => clearTimeout(id);
  }, [state.dialog.active, state.dialog.lineIdx, state.dialog.charIdx]);

  // Fade effect on map transition
  useEffect(() => {
    if (!state.pendingMap) return;
    setFadeState('out');
    const t1 = setTimeout(() => {
      dispatch({ type: 'APPLY_MAP_CHANGE' });
      setFadeState('in');
    }, FADE_DURATION);
    const t2 = setTimeout(() => {
      setFadeState('none');
    }, FADE_DURATION * 2);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [state.pendingMap]);

  const movePlayer  = useCallback((dir: Direction) => dispatch({ type: 'MOVE', dir }), []);
  const interact    = useCallback(() => dispatch({ type: 'INTERACT' }), []);
  const advDialog   = useCallback(() => dispatch({ type: 'ADVANCE_DIALOG' }), []);
  const openScreen  = useCallback((s: ScreenMode) => dispatch({ type: 'OPEN_SCREEN', screen: s }), []);
  const closeScreen = useCallback(() => dispatch({ type: 'CLOSE_SCREEN' }), []);

  return { state, movePlayer, interact, advDialog, openScreen, closeScreen, fadeState };
}
