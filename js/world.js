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
  GameState.worldObjects.growingTrees = [];
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
  if (blockType === BlockType.ACORN) {
    registerGrowingTree(col, row);
  }
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

// 木の成長段階の定義
const TreeGrowthStage = {
  ACORN: 0,
  SMALL: 1,
  MEDIUM: 2,
  LARGE: 3,
};

// 木の形状データ（上から下）
const TreePatterns = {
  [TreeGrowthStage.SMALL]: [
    "LLL",
    "LWL",
    ".W.",
  ],
  [TreeGrowthStage.MEDIUM]: [
    ".LLL.",
    "LLWLL",
    "LLWLL",
    "..W..",
    "..W..",
  ],
  [TreeGrowthStage.LARGE]: [
    ".LLL.",
    "LLLLL",
    "LLWLL",
    "LLWLL",
    ".LWL.",
    "..W..",
    "..W..",
    "..W..",
  ],
};

// 成長管理リストにドングリを追加する
function registerGrowingTree(col, row) {
  GameState.worldObjects.growingTrees.push({ col, row, stage: TreeGrowthStage.ACORN });
}

// 成長管理リストから指定位置の木を除外する
function removeGrowingTree(col, row) {
  const list = GameState.worldObjects.growingTrees;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    if (list[i].col === col && list[i].row === row) {
      list.splice(i, 1);
      return true;
    }
  }
  return false;
}

// 毎朝6:00に実行される成長処理
function processDailyGrowth() {
  growTreesDaily();
  growGrassDaily();
}

// 木の成長判定と更新
function growTreesDaily() {
  const list = GameState.worldObjects.growingTrees;
  for (let i = list.length - 1; i >= 0; i -= 1) {
    const tree = list[i];
    if (!isGrowingTreeValid(tree)) {
      list.splice(i, 1);
      continue;
    }
    if (!canTreeGrowToday(tree.col, tree.row)) {
      continue;
    }

    if (tree.stage === TreeGrowthStage.ACORN) {
      removeAcornPlaceable(tree.col, tree.row);
      applyTreePattern(tree.col, tree.row, TreePatterns[TreeGrowthStage.SMALL]);
      tree.stage = TreeGrowthStage.SMALL;
      continue;
    }

    if (tree.stage === TreeGrowthStage.SMALL) {
      clearTreePattern(tree.col, tree.row, TreePatterns[TreeGrowthStage.SMALL]);
      applyTreePattern(tree.col, tree.row, TreePatterns[TreeGrowthStage.MEDIUM]);
      tree.stage = TreeGrowthStage.MEDIUM;
      continue;
    }

    if (tree.stage === TreeGrowthStage.MEDIUM) {
      clearTreePattern(tree.col, tree.row, TreePatterns[TreeGrowthStage.MEDIUM]);
      applyTreePattern(tree.col, tree.row, TreePatterns[TreeGrowthStage.LARGE]);
      tree.stage = TreeGrowthStage.LARGE;
      list.splice(i, 1);
    }
  }
}

// 草の成長判定と更新
function growGrassDaily() {
  for (let col = 0; col < GameState.worldState.worldCols; col += 1) {
    const topRow = findTopSolidRow(col);
    if (topRow < 0 || topRow >= SKY_LIMIT_ROW) {
      continue;
    }
    if (GameState.worldState.world[col][topRow] !== BlockType.DIRT) {
      continue;
    }
    if (!isTopSurfaceClear(col, topRow)) {
      continue;
    }
    GameState.worldState.world[col][topRow] = BlockType.GRASS;
  }
}

// 指定列の最上位ブロックを探す
function findTopSolidRow(col) {
  for (let row = 0; row < GameState.worldState.worldRows; row += 1) {
    if (GameState.worldState.world[col][row] !== BlockType.AIR) {
      return row;
    }
  }
  return -1;
}

// 地表が空いているか確認する
function isTopSurfaceClear(col, row) {
  const aboveRow = row - 1;
  if (aboveRow < 0) {
    return true;
  }
  if (GameState.worldState.world[col][aboveRow] !== BlockType.AIR) {
    return false;
  }
  if (isPlaceableOccupied(col, aboveRow)) {
    return false;
  }
  if (isWoodWallOccupied(col, aboveRow)) {
    return false;
  }
  return true;
}

// 成長対象が存在しているか確認する
function isGrowingTreeValid(tree) {
  if (!isInsideWorld(tree.col, tree.row)) {
    return false;
  }
  if (tree.stage === TreeGrowthStage.ACORN) {
    const placeable = getForegroundPlaceableAt(tree.col, tree.row);
    return Boolean(placeable && placeable.blockType === BlockType.ACORN);
  }
  return GameState.worldState.world[tree.col][tree.row] === BlockType.WOOD;
}

// 草の上に設置されているか確認する
function canTreeGrowToday(col, row) {
  if (row >= SKY_LIMIT_ROW) {
    return false;
  }
  const belowRow = row + 1;
  if (!isInsideWorld(col, belowRow)) {
    return false;
  }
  return GameState.worldState.world[col][belowRow] === BlockType.GRASS;
}

// ドングリを取り除く
function removeAcornPlaceable(col, row) {
  const placeable = getForegroundPlaceableAt(col, row);
  if (!placeable || placeable.blockType !== BlockType.ACORN) {
    return false;
  }
  removeForegroundPlaceableAt(col, row);
  return true;
}

// 木の形状に沿ってブロックを配置する
function applyTreePattern(baseCol, baseRow, pattern) {
  const height = pattern.length;
  const width = pattern[0].length;
  const originCol = baseCol - Math.floor(width / 2);
  const originRow = baseRow - (height - 1);

  for (let y = 0; y < height; y += 1) {
    const rowStr = pattern[y];
    for (let x = 0; x < width; x += 1) {
      const cell = rowStr[x];
      if (cell === ".") {
        continue;
      }
      const col = originCol + x;
      const row = originRow + y;
      if (!isInsideWorld(col, row)) {
        continue;
      }
      if (isTreePlacementBlocked(col, row)) {
        continue;
      }
      if (cell === "W") {
        GameState.worldState.world[col][row] = BlockType.WOOD;
      } else if (cell === "L") {
        GameState.worldState.world[col][row] = BlockType.LEAVES;
      }
    }
  }
}

// 木の旧パターンだけを消去する
function clearTreePattern(baseCol, baseRow, pattern) {
  const height = pattern.length;
  const width = pattern[0].length;
  const originCol = baseCol - Math.floor(width / 2);
  const originRow = baseRow - (height - 1);

  for (let y = 0; y < height; y += 1) {
    const rowStr = pattern[y];
    for (let x = 0; x < width; x += 1) {
      const cell = rowStr[x];
      if (cell === ".") {
        continue;
      }
      const col = originCol + x;
      const row = originRow + y;
      if (!isInsideWorld(col, row)) {
        continue;
      }
      const blockType = GameState.worldState.world[col][row];
      if (blockType === BlockType.WOOD || blockType === BlockType.LEAVES) {
        GameState.worldState.world[col][row] = BlockType.AIR;
      }
    }
  }
}

// 木の生成位置が干渉するか確認する
function isTreePlacementBlocked(col, row) {
  if (GameState.worldState.world[col][row] !== BlockType.AIR) {
    return true;
  }
  if (isPlaceableOccupied(col, row)) {
    return true;
  }
  if (isWoodWallOccupied(col, row)) {
    return true;
  }
  return false;
}
