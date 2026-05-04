export type Direction = 'up' | 'down' | 'left' | 'right';

export interface Position {
  x: number;
  y: number;
}

export interface TerrainTile {
  prefix: string;
  imagePath: string;
  walkable: boolean;
  backgroundImage?: string;
  targetMap?: string;
  targetPos?: Position;
}

export interface NPCData {
  prefix: string;
  backgroundImage?: string;
  imagePath: string;
  pos: Position;
  name: string;
  dialogs: string[][];
}

export interface ItemData {
  id: string;
  name: string;
  imagePath?: string;
  description?: string;
  details?: string[];
}

export interface MapObjectData {
  prefix: string;
  backgroundImage?: string;
  imagePath?: string;
  images?: string[];
  name: string;
  dialogs: string[][];
  targetMap?: string;
  targetPos?: Position;
  item?: ItemData;
}

export interface ComputedMapData {
  mapId: string;
  width: number;
  height: number;
  tiles: string[];
  startPos: Position;
  terrainTiles: Record<string, TerrainTile>;
  terrainImages: Record<string, string>;
  walkableSet: Set<string>;
  npcs: NPCData[];
  objects: MapObjectData[];
  tileBg: Record<string, string>;
  tileFg: Record<string, string>;
  allImagePaths: string[];
}

export interface DialogState {
  active: boolean;
  lines: string[];
  lineIdx: number;
  charIdx: number;
  speakerName?: string;
  sourceId?: string;
}

export type ScreenMode = 'game' | 'status';

export interface GameState {
  mapId: string;
  pendingMap: { mapId: string; pos: Position } | null;
  playerPos: Position;
  items: ItemData[];
  playerDir: Direction;
  cameraPos: Position;
  dialog: DialogState;
  screen: ScreenMode;
  moveCount: number;
  inputLocked: boolean;
  dialogProgress: Record<string, number>;
}

export type GameAction =
  | { type: 'MOVE'; dir: Direction }
  | { type: 'INTERACT' }
  | { type: 'ADVANCE_DIALOG' }
  | { type: 'DIALOG_TICK' }
  | { type: 'OPEN_SCREEN'; screen: ScreenMode }
  | { type: 'CLOSE_SCREEN' }
  | { type: 'START_DIALOG'; lines: string[]; speakerName?: string }
  | { type: 'CHANGE_MAP'; mapId: string; pos: Position }
  | { type: 'APPLY_MAP_CHANGE' };
