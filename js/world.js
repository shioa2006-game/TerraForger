// ワールド生成関連
function initWorld() {
  noiseSeed(8);
  GameState.world = new Array(GameState.worldCols).fill(0).map(() => new Array(GameState.worldRows).fill(0));
  initPlaceables();

  const surfaceHeights = generateSurfaceHeights();
  buildGroundLayers(surfaceHeights);
  addSandPatches(surfaceHeights);
  carveCaves(surfaceHeights);
  scatterOres(surfaceHeights);
  plantTrees(surfaceHeights);
}

// 設置物のリストを初期化する
function initPlaceables() {
  GameState.placeables = [];
}

// 指定タイルに設置物があるか確認する
function getPlaceableAt(col, row) {
  for (let i = 0; i < GameState.placeables.length; i += 1) {
    const placeable = GameState.placeables[i];
    if (placeable.col === col && placeable.row === row) {
      return placeable;
    }
  }
  return null;
}

// 指定タイルが設置物で埋まっているか確認する
function isPlaceableOccupied(col, row) {
  return getPlaceableAt(col, row) !== null;
}

// 設置物を追加する
function addPlaceable(blockType, col, row) {
  const placeable = { blockType, col, row };
  if (blockType === BlockType.CHEST) {
    // 収納箱は専用のスロットを持つ
    placeable.storage = new Array(60).fill(null);
    placeable.storageCounts = {};
  }
  GameState.placeables.push(placeable);
}

// 設置物を取り除く
function removePlaceableAt(col, row) {
  for (let i = 0; i < GameState.placeables.length; i += 1) {
    const placeable = GameState.placeables[i];
    if (placeable.col === col && placeable.row === row) {
      GameState.placeables.splice(i, 1);
      return placeable;
    }
  }
  return null;
}

// 地表の高さをノイズで作る
function generateSurfaceHeights() {
  const heights = [];
  for (let col = 0; col < GameState.worldCols; col += 1) {
    const height = floor(map(noise(col * 0.08), 0, 1, 22, 29));
    heights.push(height);
  }
  return heights;
}

// 草・土・石の基本層を作る
function buildGroundLayers(surfaceHeights) {
  for (let col = 0; col < GameState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    for (let row = surface; row < GameState.worldRows; row += 1) {
      const depth = row - surface;
      if (depth === 0) {
        GameState.world[col][row] = BlockType.GRASS;
      } else if (depth < 4) {
        GameState.world[col][row] = BlockType.DIRT;
      } else {
        GameState.world[col][row] = BlockType.STONE;
      }
    }
  }
}

// 砂地のパッチを作る
function addSandPatches(surfaceHeights) {
  for (let col = 0; col < GameState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    const noiseValue = noise(col * 0.12, 5);
    if (noiseValue > 0.72) {
      for (let row = surface; row < surface + 3 && row < GameState.worldRows; row += 1) {
        GameState.world[col][row] = BlockType.SAND;
      }
    }
  }
}

// 洞窟をノイズでくり抜く
function carveCaves(surfaceHeights) {
  const skyLimitRow = 30;
  for (let col = 0; col < GameState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    for (let row = max(surface + 4, skyLimitRow); row < GameState.worldRows; row += 1) {
      const n = noise(col * 0.1, row * 0.1);
      if (n > 0.62) {
        GameState.world[col][row] = BlockType.AIR;
      }
    }
  }
}

// 深さに応じて鉱石を配置する
function scatterOres(surfaceHeights) {
  for (let col = 0; col < GameState.worldCols; col += 1) {
    const surface = surfaceHeights[col];
    for (let row = surface + 6; row < GameState.worldRows; row += 1) {
      if (GameState.world[col][row] !== BlockType.STONE) {
        continue;
      }
      const depth = row - surface;
      if (depth > 10 && random() < 0.03) {
        GameState.world[col][row] = BlockType.COAL;
      } else if (depth > 16 && random() < 0.02) {
        GameState.world[col][row] = BlockType.IRON;
      }
    }
  }
}

// 地表に木を生やす
function plantTrees(surfaceHeights) {
  for (let col = 4; col < GameState.worldCols - 4; col += floor(random(5, 10))) {
    if (random() > 0.6) {
      continue;
    }
    const surface = surfaceHeights[col];
    if (GameState.world[col][surface] !== BlockType.GRASS) {
      continue;
    }
    const height = floor(random(4, 7));
    for (let i = 1; i <= height; i += 1) {
      const row = surface - i;
      if (row >= 0) {
        GameState.world[col][row] = BlockType.WOOD;
      }
    }
    const leafTop = surface - height;
    for (let lx = col - 2; lx <= col + 2; lx += 1) {
      for (let ly = leafTop - 2; ly <= leafTop + 2; ly += 1) {
        if (!isInsideWorld(lx, ly)) {
          continue;
        }
        const distance = abs(lx - col) + abs(ly - leafTop);
        if (distance <= 3 && GameState.world[lx][ly] === BlockType.AIR) {
          GameState.world[lx][ly] = BlockType.LEAVES;
        }
      }
    }
  }
}

// ワールド境界の判定
function isInsideWorld(col, row) {
  return col >= 0 && col < GameState.worldCols && row >= 0 && row < GameState.worldRows;
}

// 衝突判定用の固体判定
function isSolid(col, row) {
  if (!isInsideWorld(col, row)) {
    return true;
  }
  return GameState.world[col][row] !== BlockType.AIR;
}
