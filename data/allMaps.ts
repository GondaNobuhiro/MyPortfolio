import type { NPCData, MapObjectData, TerrainTile, ComputedMapData, Position } from '@/types/game';

import map1Json    from './maps/map1/map.json';
import terrain1Json from './maps/map1/terrain.json';
import npcs1Json   from './maps/map1/npcs.json';
import objects1Json from './maps/map1/objects.json';

import map2Json    from './maps/map2/map.json';
import terrain2Json from './maps/map2/terrain.json';
import npcs2Json   from './maps/map2/npcs.json';
import objects2Json from './maps/map2/objects.json';

import map3Json    from './maps/map3/map.json';
import terrain3Json from './maps/map3/terrain.json';
import npcs3Json   from './maps/map3/npcs.json';
import objects3Json from './maps/map3/objects.json';

type RawTerrain = {
  prefix: string;
  imagePath: string;
  walkable: boolean;
  backgroundImage?: string;
  targetMap?: string;
  targetPos?: { x: number; y: number };
};

type RawMapJson = {
  width: number;
  height: number;
  tiles: string[];
  startPos: { x: number; y: number };
};

function findPrefixPos(tiles: string[], prefix: string): Position | null {
  for (let y = 0; y < tiles.length; y++) {
    const x = tiles[y].indexOf(prefix);
    if (x !== -1) return { x, y };
  }
  return null;
}

function buildMapData(
  mapId: string,
  mapJson: RawMapJson,
  terrainJson: RawTerrain[],
  npcsJson: Array<Omit<NPCData, 'pos'>>,
  objectsJson: MapObjectData[]
): ComputedMapData {
  const { tiles, width, height, startPos } = mapJson;

  const terrainTiles: Record<string, TerrainTile> = Object.fromEntries(
    terrainJson.map(t => [t.prefix, t as TerrainTile])
  );

  const terrainImages: Record<string, string> = Object.fromEntries(
    terrainJson.map(t => [t.prefix, t.imagePath])
  );

  const walkableSet = new Set<string>(
    terrainJson.filter(t => t.walkable).map(t => t.prefix)
  );

  const npcs: NPCData[] = npcsJson.flatMap(npc => {
    const pos = findPrefixPos(tiles, npc.prefix);
    return pos ? [{ ...npc, pos } as NPCData] : [];
  });

  function resolveBg(prefixOrPath: string): string {
    return terrainImages[prefixOrPath] ?? prefixOrPath;
  }

  const tileBg: Record<string, string> = Object.fromEntries([
    ...terrainJson.filter(t => t.backgroundImage).map(t => [t.prefix, resolveBg(t.backgroundImage!)]),
    ...objectsJson.filter(o => o.backgroundImage).map(o => [o.prefix, resolveBg(o.backgroundImage!)]),
    ...npcs.filter(n => n.backgroundImage).map(n => [n.prefix, resolveBg(n.backgroundImage!)]),
  ]);

  const tileFg: Record<string, string> = Object.fromEntries([
    ...terrainJson.filter(t => t.backgroundImage).map(t => [t.prefix, t.imagePath]),
    ...objectsJson.filter(o => o.imagePath).map(o => [o.prefix, o.imagePath!]),
  ]);

  const allImagePaths = [...new Set([
    ...Object.values(terrainImages),
    ...Object.values(tileBg),
    ...Object.values(tileFg),
    // Variant images for state-based objects (e.g. open/closed chest)
    ...objectsJson.flatMap(o => o.images ?? []),
  ])];

  return {
    mapId,
    width,
    height,
    tiles,
    startPos,
    terrainTiles,
    terrainImages,
    walkableSet,
    npcs,
    objects: objectsJson,
    tileBg,
    tileFg,
    allImagePaths,
  };
}

const cache: Record<string, ComputedMapData> = {};

type Builder = () => ComputedMapData;

const builders: Record<string, Builder> = {
  map1: () => buildMapData(
    'map1',
    map1Json as unknown as RawMapJson,
    terrain1Json as unknown as RawTerrain[],
    npcs1Json as unknown as Array<Omit<NPCData, 'pos'>>,
    objects1Json as unknown as MapObjectData[]
  ),
  map2: () => buildMapData(
    'map2',
    map2Json as unknown as RawMapJson,
    terrain2Json as unknown as RawTerrain[],
    npcs2Json as unknown as Array<Omit<NPCData, 'pos'>>,
    objects2Json as unknown as MapObjectData[]
  ),
  map3: () => buildMapData(
    'map3',
    map3Json as unknown as RawMapJson,
    terrain3Json as unknown as RawTerrain[],
    npcs3Json as unknown as Array<Omit<NPCData, 'pos'>>,
    objects3Json as unknown as MapObjectData[]
  ),
};

export function getMapData(mapId: string): ComputedMapData {
  if (!cache[mapId]) {
    const build = builders[mapId];
    if (!build) throw new Error(`Unknown map: ${mapId}`);
    cache[mapId] = build();
  }
  return cache[mapId];
}
