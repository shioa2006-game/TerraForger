// 入力補助ロジック

// インタラクト入力を切り替える
function tryToggleInteract() {
  if (isOverlayOpen()) {
    closeAllOverlays();
    return true;
  }
  return tryInteractWithPlaceable();
}

// プレイヤーが触れている設置物とインタラクトする
function tryInteractWithPlaceable() {
  const placeable = findInteractablePlaceable();
  if (!placeable) {
    return false;
  }
  if (placeable.blockType === BlockType.CHEST) {
    openChestUI(placeable);
    return true;
  }
  if (placeable.blockType === BlockType.WORKBENCH) {
    const toolType = getSelectedToolType();
    if (toolType === ToolType.HAMMER) {
      openWorkbenchUI(placeable);
      return true;
    }
    return false;
  }
  return false;
}

// プレイヤーが接触している設置物を探す
function findInteractablePlaceable() {
  const foreground = findInteractableForegroundPlaceable();
  if (foreground) {
    return foreground;
  }
  return findInteractableWoodWall();
}

// プレイヤーが接触している前景設置物を探す
function findInteractableForegroundPlaceable() {
  for (let i = 0; i < GameState.worldObjects.placeables.length; i += 1) {
    const placeable = GameState.worldObjects.placeables[i];
    if (isPlayerTouchingPlaceable(placeable)) {
      return placeable;
    }
  }
  return null;
}

// プレイヤーが接触している木の壁を探す
function findInteractableWoodWall() {
  for (let i = 0; i < GameState.worldObjects.backgroundPlaceables.length; i += 1) {
    const placeable = GameState.worldObjects.backgroundPlaceables[i];
    if (isPlayerTouchingPlaceable(placeable)) {
      return placeable;
    }
  }
  return null;
}

// プレイヤーが設置物に接触しているか判定する
function isPlayerTouchingPlaceable(placeable) {
  const tiles = getPlaceableTiles(placeable);
  for (let i = 0; i < tiles.length; i += 1) {
    if (isPlayerTouchingTile(tiles[i].col, tiles[i].row)) {
      return true;
    }
  }
  return false;
}

// 設置物がリーチ範囲内か判定する
function isPlaceableWithinReach(placeable) {
  const tiles = getPlaceableTiles(placeable);
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i];
    const centerX = tile.col * GameState.worldState.tileSize + GameState.worldState.tileSize * REACH_DISTANCE_SCALE;
    const centerY = tile.row * GameState.worldState.tileSize + GameState.worldState.tileSize * REACH_DISTANCE_SCALE;
    const distance = dist(GameState.playerState.entity.x, GameState.playerState.entity.y, centerX, centerY);
    if (distance <= GameState.playerState.reachRange * GameState.worldState.tileSize) {
      return true;
    }
  }
  return false;
}

// 指定タイルにプレイヤーが接触しているか判定する
function isPlayerTouchingTile(col, row) {
  const tileLeft = col * GameState.worldState.tileSize;
  const tileTop = row * GameState.worldState.tileSize;
  const tileRight = tileLeft + GameState.worldState.tileSize;
  const tileBottom = tileTop + GameState.worldState.tileSize;
  const halfW = GameState.playerState.entity.w * 0.5;
  const halfH = GameState.playerState.entity.h * 0.5;
  const playerLeft = GameState.playerState.entity.x - halfW;
  const playerRight = GameState.playerState.entity.x + halfW;
  const playerTop = GameState.playerState.entity.y - halfH;
  const playerBottom = GameState.playerState.entity.y + halfH;

  return (
    playerLeft < tileRight &&
    playerRight > tileLeft &&
    playerTop < tileBottom &&
    playerBottom > tileTop
  );
}

function isPlayerInside(col, row) {
  const blockX = col * GameState.worldState.tileSize;
  const blockY = row * GameState.worldState.tileSize;
  const halfW = GameState.playerState.entity.w * 0.5;
  const halfH = GameState.playerState.entity.h * 0.5;

  return !(
    GameState.playerState.entity.x + halfW <= blockX ||
    GameState.playerState.entity.x - halfW >= blockX + GameState.worldState.tileSize ||
    GameState.playerState.entity.y + halfH <= blockY ||
    GameState.playerState.entity.y - halfH >= blockY + GameState.worldState.tileSize
  );
}

// 選択中のツール種別を取得する
function getSelectedToolType() {
  const selectedItem = getSelectedEquipment();
  if (!selectedItem || selectedItem.kind !== ItemKind.TOOL) {
    return null;
  }
  return selectedItem.tool;
}

// ツールごとの破壊対象を判定する
function isBlockBreakableWithTool(blockType, toolType) {
  if (toolType === ToolType.PICKAXE) {
    return (
      blockType === BlockType.DIRT ||
      blockType === BlockType.GRASS ||
      blockType === BlockType.STONE ||
      blockType === BlockType.SAND ||
      blockType === BlockType.COAL ||
      blockType === BlockType.IRON
    );
  }
  if (toolType === ToolType.AXE) {
    return blockType === BlockType.WOOD || blockType === BlockType.LEAVES;
  }
  return false;
}

// ツールの影響範囲が隣接か確認する
function isToolTargetAdjacent(col, row) {
  const playerCol = floor(GameState.playerState.entity.x / GameState.worldState.tileSize);
  const playerRow = floor(GameState.playerState.entity.y / GameState.worldState.tileSize);
  const dir = GameState.playerState.entity.dir >= 0 ? 1 : -1;
  // 中心点の真上は存在しない想定なので、真上2段目と斜め上を優先する
  const targetCols = [
    playerCol,
    playerCol + dir,
    playerCol + dir,
    playerCol + dir,
    playerCol + dir,
    playerCol,
  ];
  const targetRows = [
    playerRow + TOOL_TARGET_ROW_OFFSETS[0],
    playerRow + TOOL_TARGET_ROW_OFFSETS[1],
    playerRow + TOOL_TARGET_ROW_OFFSETS[2],
    playerRow + TOOL_TARGET_ROW_OFFSETS[3],
    playerRow + TOOL_TARGET_ROW_OFFSETS[4],
    playerRow + TOOL_TARGET_ROW_OFFSETS[5],
  ];
  for (let i = 0; i < targetCols.length; i += 1) {
    if (targetCols[i] === col && targetRows[i] === row) {
      return true;
    }
  }
  return false;
}

// 作業机でクラフトを実行する（ダミー）
function tryCraftAtWorkbench() {
  const toolType = getSelectedToolType();
  if (toolType !== ToolType.HAMMER) {
    return false;
  }
  const placeable = findInteractablePlaceable();
  if (!placeable || placeable.blockType !== BlockType.WORKBENCH) {
    return false;
  }
  openWorkbenchUI(placeable);
  return true;
}

// ハンマーで設置物を回収する
function tryRetrievePlaceableWithHammer(col, row) {
  const toolType = getSelectedToolType();
  if (toolType !== ToolType.HAMMER) {
    return false;
  }
  const placeable = findPlaceableAtClick(col, row);
  if (!placeable) {
    return false;
  }
  if (!isPlaceableWithinReach(placeable)) {
    return false;
  }
  if (placeable.blockType === BlockType.CHEST && !isChestEmpty(placeable)) {
    return false;
  }
  const placeableDef = getPlaceableDef(placeable.blockType);
  if (!placeableDef) {
    return false;
  }
  if (!ensureInventorySlotForItem(placeableDef.itemId)) {
    return false;
  }
  let removed = null;
  if (placeableDef.layer === "background") {
    removed = removeWoodWallAt(placeable.col, placeable.row);
  } else {
    removed = removeForegroundPlaceableAt(placeable.col, placeable.row);
  }
  if (!removed) {
    return false;
  }
  if (removed.blockType === BlockType.ACORN) {
    removeGrowingTree(removed.col, removed.row);
  }
  addItemCount(placeableDef.itemId, 1);
  return true;
}

// クリック位置にある設置物を取得する（前景優先）
function findPlaceableAtClick(col, row) {
  const foreground = getForegroundPlaceableAt(col, row);
  if (foreground) {
    return foreground;
  }
  return getWoodWallAt(col, row);
}

// 収納箱が空かどうか確認する
function isChestEmpty(placeable) {
  if (placeable.storage) {
    for (let i = 0; i < placeable.storage.length; i += 1) {
      if (placeable.storage[i]) {
        return false;
      }
    }
  }
  if (placeable.storageCounts) {
    const keys = Object.keys(placeable.storageCounts);
    for (let i = 0; i < keys.length; i += 1) {
      if (placeable.storageCounts[keys[i]] > 0) {
        return false;
      }
    }
  }
  return true;
}

// 装備欄でアイテムIDのスロットを探す
function findEquipmentSlotByItem(itemId) {
  for (let i = 0; i < GameState.inventoryState.equipmentSlots.length; i += 1) {
    const item = GameState.inventoryState.equipmentSlots[i];
    if (item && isStackableItem(item) && item.itemId === itemId) {
      return i;
    }
  }
  return -1;
}

// アイテムスロットを所持アイテム内に確保する
function ensureInventorySlotForItem(itemId) {
  if (findInventorySlotByItem(itemId) !== -1) {
    return true;
  }
  if (findEquipmentSlotByItem(itemId) !== -1) {
    return true;
  }
  const emptyIndex = findEmptyInventoryIndex();
  if (emptyIndex === -1) {
    return false;
  }
  const itemDef = getItemDef(itemId);
  if (!itemDef) {
    return false;
  }
  GameState.inventoryState.inventorySlots[emptyIndex] = { kind: itemDef.kind, itemId };
  return true;
}

// ドロップアイテムを生成する
function createDropItem(itemId, col, row) {
  const x = col * GameState.worldState.tileSize + GameState.worldState.tileSize * REACH_DISTANCE_SCALE;
  const y = row * GameState.worldState.tileSize + GameState.worldState.tileSize * REACH_DISTANCE_SCALE;
  GameState.effects.drops.push({
    itemId,
    x,
    y,
    vx: random(DROP_SPAWN_VX_MIN, DROP_SPAWN_VX_MAX),
    vy: random(DROP_SPAWN_VY_MIN, DROP_SPAWN_VY_MAX),
  });
}

// 木の扉を設置できるか確認して設置する
function tryPlacePlaceable(blockType, col, row) {
  const def = getPlaceableDef(blockType);
  if (!def) {
    return false;
  }
  const tiles = getPlaceableTilesForPlacement(def, col, row);
  if (tiles.length === 0) {
    return false;
  }
  for (let i = 0; i < tiles.length; i += 1) {
    const tile = tiles[i];
    if (!isInsideWorld(tile.col, tile.row)) {
      return false;
    }
    if (GameState.worldState.world[tile.col][tile.row] !== BlockType.AIR) {
      return false;
    }
    if (def.layer === "foreground") {
      if (isPlaceableOccupied(tile.col, tile.row)) {
        return false;
      }
    } else if (isWoodWallOccupied(tile.col, tile.row)) {
      return false;
    }
    // 設置物はプレイヤー位置でも設置可能にする
  }
  addPlaceable(blockType, col, row);
  return true;
}

// 設置物の占有タイルを計算する
function getPlaceableTilesForPlacement(def, col, row) {
  const tiles = [];
  const originCol = col - def.origin.x;
  const originRow = row - def.origin.y;
  for (let dx = 0; dx < def.size.w; dx += 1) {
    for (let dy = 0; dy < def.size.h; dy += 1) {
      tiles.push({ col: originCol + dx, row: originRow + dy });
    }
  }
  return tiles;
}
