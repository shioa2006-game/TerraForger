// ワールド生成関連
function initWorld() {
  noiseSeed(WORLD_SEED);
  GameState.worldState.world = new Array(GameState.worldState.worldCols).fill(0).map(() => new Array(GameState.worldState.worldRows).fill(0));
  initPlaceables();
  GameState.effects.drops = [];

  const surfaceHeights = generateSurfaceHeights();
  buildGroundLayers(surfaceHeights);
  addSandPatches(surfaceHeights);
  carveCaves(surfaceHeights);
  scatterOres(surfaceHeights);
  plantTrees(surfaceHeights);
}

// 設置物のリストを初期化する
function initPlaceables() {
  GameState.worldObjects.placeables = [];
  GameState.worldObjects.backgroundPlaceables = [];
}

// 設置物が占有するタイルを計算する
function getPlaceableTiles(placeable) {
  const def = getPlaceableDef(placeable.blockType);
  if (!def) {
    return [];
  }
  const tiles = [];
  const originCol = placeable.col - def.origin.x;
  const originRow = placeable.row - def.origin.y;
  for (let dx = 0; dx < def.size.w; dx += 1) {
    for (let dy = 0; dy < def.size.h; dy += 1) {
      tiles.push({ col: originCol + dx, row: originRow + dy });
    }
  }
  return tiles;
}

// 指定タイルに設置物があるか確認する
function findPlaceableAt(list, col, row) {
  for (let i = 0; i < list.length; i += 1) {
    const placeable = list[i];
    const tiles = getPlaceableTiles(placeable);
    for (let t = 0; t < tiles.length; t += 1) {
      if (tiles[t].col === col && tiles[t].row === row) {
        return placeable;
      }
    }
  }
  return null;
}

// 指定タイルに前景設置物があるか確認する
function getForegroundPlaceableAt(col, row) {
  return findPlaceableAt(GameState.worldObjects.placeables, col, row);
}

// 指定タイルに木の壁があるか確認する
function getWoodWallAt(col, row) {
  return findPlaceableAt(GameState.worldObjects.backgroundPlaceables, col, row);
}

// 指定タイルが前景設置物で埋まっているか確認する
function isPlaceableOccupied(col, row) {
  return getForegroundPlaceableAt(col, row) !== null;
}

// 指定タイルが木の壁で埋まっているか確認する
function isWoodWallOccupied(col, row) {
  return getWoodWallAt(col, row) !== null;
}

// 設置物を追加する
function addPlaceable(blockType, col, row) {
  const placeable = { blockType, col, row };
  const def = getPlaceableDef(blockType);
  if (def && def.layer === "background") {
    GameState.worldObjects.backgroundPlaceables.push(placeable);
    return;
  }
  if (blockType === BlockType.CHEST) {
    // 収納箱は専用のスロットを持つ
    placeable.storage = new Array(CHEST_STORAGE_SIZE).fill(null);
    placeable.storageCounts = {};
  }
  GameState.worldObjects.placeables.push(placeable);
}

// 前景設置物を取り除く
function removeForegroundPlaceableAt(col, row) {
  for (let i = 0; i < GameState.worldObjects.placeables.length; i += 1) {
    const placeable = GameState.worldObjects.placeables[i];
    const tiles = getPlaceableTiles(placeable);
    for (let t = 0; t < tiles.length; t += 1) {
      if (tiles[t].col === col && tiles[t].row === row) {
        GameState.worldObjects.placeables.splice(i, 1);
        return placeable;
      }
    }
  }
  return null;
}

// 木の壁を取り除く
function removeWoodWallAt(col, row) {
  for (let i = 0; i < GameState.worldObjects.backgroundPlaceables.length; i += 1) {
    const placeable = GameState.worldObjects.backgroundPlaceables[i];
    const tiles = getPlaceableTiles(placeable);
    for (let t = 0; t < tiles.length; t += 1) {
      if (tiles[t].col === col && tiles[t].row === row) {
        GameState.worldObjects.backgroundPlaceables.splice(i, 1);
        return placeable;
      }
    }
  }
  return null;
}

// 地表の高さをノイズで作る
function generateSurfaceHeights() {
  const heights = [];
  for (let col = 0; col < GameState.worldState.worldCols; col += 1) {
    const height = floor(map(noise(col * SURFACE_NOISE_SCALE), 0, 1, SURFACE_MIN_ROW, SURFACE_MAX_ROW));
    heights.push(height);
  }
  return heights;
}

// 草・土・石の基本層を作る
function buildGroundLayers(surfaceHeights) {
  for (let col = 0; col < GameState.worldState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    for (let row = surface; row < GameState.worldState.worldRows; row += 1) {
      const depth = row - surface;
      if (depth === 0) {
        GameState.worldState.world[col][row] = BlockType.GRASS;
      } else if (depth < DIRT_LAYER_DEPTH) {
        GameState.worldState.world[col][row] = BlockType.DIRT;
      } else {
        GameState.worldState.world[col][row] = BlockType.STONE;
      }
    }
  }
}

// 砂地のパッチを作る
function addSandPatches(surfaceHeights) {
  for (let col = 0; col < GameState.worldState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    const noiseValue = noise(col * SAND_NOISE_SCALE, SAND_NOISE_Y);
    if (noiseValue > SAND_THRESHOLD) {
      for (let row = surface; row < surface + SAND_PATCH_DEPTH && row < GameState.worldState.worldRows; row += 1) {
        GameState.worldState.world[col][row] = BlockType.SAND;
      }
    }
  }
}

// 洞窟をノイズでくり抜く
function carveCaves(surfaceHeights) {
  const skyLimitRow = SKY_LIMIT_ROW;
  for (let col = 0; col < GameState.worldState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    for (let row = max(surface + CAVE_START_OFFSET, skyLimitRow); row < GameState.worldState.worldRows; row += 1) {
      const n = noise(col * CAVE_NOISE_SCALE, row * CAVE_NOISE_SCALE);
      if (n > CAVE_THRESHOLD) {
        GameState.worldState.world[col][row] = BlockType.AIR;
      }
    }
  }
}

// 深さに応じて鉱石を配置する
function scatterOres(surfaceHeights) {
  for (let col = 0; col < GameState.worldState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    for (let row = surface + ORE_START_OFFSET; row < GameState.worldState.worldRows; row += 1) {
      if (GameState.worldState.world[col][row] !== BlockType.STONE) {
        continue;
      }
      const depth = row - surface;
      if (depth > COAL_DEPTH && random() < COAL_CHANCE) {
        GameState.worldState.world[col][row] = BlockType.COAL;
      } else if (depth > IRON_DEPTH && random() < IRON_CHANCE) {
        GameState.worldState.world[col][row] = BlockType.IRON;
      }
    }
  }
}

// 地表に木を生やす
function plantTrees(surfaceHeights) {
  for (let col = TREE_BORDER; col < GameState.worldState.worldCols - TREE_BORDER; col += floor(random(TREE_STEP_MIN, TREE_STEP_MAX))) {
    if (random() > TREE_SPAWN_CHANCE) {
      continue;
    }
    const surface = surfaceHeights[col];
    if (GameState.worldState.world[col][surface] !== BlockType.GRASS) {
      continue;
    }
    const height = floor(random(TREE_HEIGHT_MIN, TREE_HEIGHT_MAX));
    for (let i = 1; i <= height; i += 1) {
      const row = surface - i;
      if (row >= 0) {
        GameState.worldState.world[col][row] = BlockType.WOOD;
      }
    }
    const leafTop = surface - height;
    for (let lx = col - LEAF_RADIUS; lx <= col + LEAF_RADIUS; lx += 1) {
      for (let ly = leafTop - LEAF_RADIUS; ly <= leafTop + LEAF_RADIUS; ly += 1) {
        if (!isInsideWorld(lx, ly)) {
          continue;
        }
        const distance = abs(lx - col) + abs(ly - leafTop);
        if (distance <= LEAF_DISTANCE_LIMIT && GameState.worldState.world[lx][ly] === BlockType.AIR) {
          GameState.worldState.world[lx][ly] = BlockType.LEAVES;
        }
      }
    }
  }
}

// ワールド境界の判定
function isInsideWorld(col, row) {
  return col >= 0 && col < GameState.worldState.worldCols && row >= 0 && row < GameState.worldState.worldRows;
}

// 衝突判定用の固体判定
function isSolid(col, row) {
  if (!isInsideWorld(col, row)) {
    return true;
  }
  return GameState.worldState.world[col][row] !== BlockType.AIR;
}
