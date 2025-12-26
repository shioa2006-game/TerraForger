// 入力処理
function keyPressed() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) {
    GameState.keyState.left = true;
  }
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) {
    GameState.keyState.right = true;
  }
  if (key === "w" || key === "W" || key === " " || keyCode === UP_ARROW) {
    GameState.keyState.up = true;
  }
  if (key >= "1" && key <= "5") {
    const index = parseInt(key, 10) - 1;
    if (index >= 0 && index < 5) {
      GameState.selectedEquipIndex = index;
    }
  }
  if (key === "r" || key === "R") {
    noiseSeed(Date.now());
    initWorld();
    initPlayer();
    initInventory();
    initBackground();
    GameState.particles = [];
  }
  if (keyCode === ESCAPE) {
    closeAllOverlays();
  }
  if (key === "e" || key === "E") {
    tryToggleInteract();
  }
}

function keyReleased() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) {
    GameState.keyState.left = false;
  }
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) {
    GameState.keyState.right = false;
  }
  if (key === "w" || key === "W" || key === " " || keyCode === UP_ARROW) {
    GameState.keyState.up = false;
  }
}

function mousePressed() {
  if (isOverlayOpen()) {
    return;
  }

  const target = screenToWorld(mouseX, mouseY);
  const col = floor(target.x / GameState.tileSize);
  const row = floor(target.y / GameState.tileSize);

  if (!isInsideWorld(col, row)) {
    return;
  }

  const distance = dist(
    GameState.player.x,
    GameState.player.y,
    col * GameState.tileSize + GameState.tileSize * 0.5,
    row * GameState.tileSize + GameState.tileSize * 0.5
  );
  if (distance > GameState.reachRange * GameState.tileSize) {
    return;
  }

  if (mouseButton === LEFT) {
    if (tryInteractWithPlaceable()) {
      return;
    }
    if (tryCraftAtWorkbench()) {
      return;
    }
    if (GameState.world[col][row] !== BlockType.AIR) {
      const blockType = GameState.world[col][row];
      const toolType = getSelectedToolType();
      if (!toolType || !isBlockBreakableWithTool(blockType, toolType)) {
        return;
      }
      if (!isToolTargetAdjacent(col, row)) {
        return;
      }
      GameState.world[col][row] = BlockType.AIR;
      createBlockParticles(col, row, blockType);
      if (PlaceableBlocks.includes(blockType)) {
        GameState.inventory[blockType] = (GameState.inventory[blockType] || 0) + 1;

        // インベントリスロットにブロックがなければ追加
        const hasSlot = GameState.inventorySlots.some(
          slot => slot && slot.kind === ItemKind.BLOCK && slot.blockType === blockType
        );
        if (!hasSlot) {
          const emptyIndex = GameState.inventorySlots.findIndex(slot => slot === null);
          if (emptyIndex !== -1) {
            GameState.inventorySlots[emptyIndex] = { kind: ItemKind.BLOCK, blockType: blockType };
          }
        }
      }
    }
  } else if (mouseButton === RIGHT) {
    if (tryRetrievePlaceableWithHammer()) {
      return;
    }
    if (GameState.world[col][row] === BlockType.AIR && !isPlayerInside(col, row)) {
      const selectedItem = getSelectedEquipment();
      if (selectedItem && selectedItem.kind === ItemKind.BLOCK) {
        const blockType = selectedItem.blockType;
        if (isPlaceableObject(blockType)) {
          if (!isPlaceableOccupied(col, row) && GameState.inventory[blockType] > 0) {
            addPlaceable(blockType, col, row);
            GameState.inventory[blockType] -= 1;
          }
        } else if (!isPlaceableOccupied(col, row) && GameState.inventory[blockType] > 0) {
          GameState.world[col][row] = blockType;
          GameState.inventory[blockType] -= 1;
        }
      }
    }
  }
}

function mouseWheel(event) {
  if (event.delta > 0) {
    GameState.selectedEquipIndex = (GameState.selectedEquipIndex + 1) % 5;
  } else {
    GameState.selectedEquipIndex = (GameState.selectedEquipIndex - 1 + 5) % 5;
  }
  return false;
}

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
  for (let i = 0; i < GameState.placeables.length; i += 1) {
    const placeable = GameState.placeables[i];
    if (isPlayerTouchingTile(placeable.col, placeable.row)) {
      return placeable;
    }
  }
  return null;
}

// 指定タイルにプレイヤーが接触しているか判定する
function isPlayerTouchingTile(col, row) {
  const tileLeft = col * GameState.tileSize;
  const tileTop = row * GameState.tileSize;
  const tileRight = tileLeft + GameState.tileSize;
  const tileBottom = tileTop + GameState.tileSize;
  const halfW = GameState.player.w * 0.5;
  const halfH = GameState.player.h * 0.5;
  const playerLeft = GameState.player.x - halfW;
  const playerRight = GameState.player.x + halfW;
  const playerTop = GameState.player.y - halfH;
  const playerBottom = GameState.player.y + halfH;

  return (
    playerLeft < tileRight &&
    playerRight > tileLeft &&
    playerTop < tileBottom &&
    playerBottom > tileTop
  );
}

function isPlayerInside(col, row) {
  const blockX = col * GameState.tileSize;
  const blockY = row * GameState.tileSize;
  const halfW = GameState.player.w * 0.5;
  const halfH = GameState.player.h * 0.5;

  return !(
    GameState.player.x + halfW <= blockX ||
    GameState.player.x - halfW >= blockX + GameState.tileSize ||
    GameState.player.y + halfH <= blockY ||
    GameState.player.y - halfH >= blockY + GameState.tileSize
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
      blockType === BlockType.IRON ||
      blockType === BlockType.GOLD ||
      blockType === BlockType.DIAMOND ||
      blockType === BlockType.BRICK
    );
  }
  if (toolType === ToolType.AXE) {
    return blockType === BlockType.WOOD || blockType === BlockType.LEAVES;
  }
  return false;
}

// ツールの影響範囲が隣接か確認する
function isToolTargetAdjacent(col, row) {
  const playerCol = floor(GameState.player.x / GameState.tileSize);
  const playerRow = floor(GameState.player.y / GameState.tileSize);
  const dir = GameState.player.dir >= 0 ? 1 : -1;
  const targetCols = [
    playerCol,
    playerCol + dir,
    playerCol + dir,
    playerCol + dir,
    playerCol,
  ];
  const targetRows = [
    playerRow - 1,
    playerRow - 1,
    playerRow,
    playerRow + 1,
    playerRow + 1,
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
function tryRetrievePlaceableWithHammer() {
  const toolType = getSelectedToolType();
  if (toolType !== ToolType.HAMMER) {
    return false;
  }
  const placeable = findInteractablePlaceable();
  if (!placeable) {
    return false;
  }
  if (placeable.blockType === BlockType.CHEST && !isChestEmpty(placeable)) {
    return false;
  }
  if (!ensureInventorySlotForBlock(placeable.blockType)) {
    return false;
  }
  const removed = removePlaceableAt(placeable.col, placeable.row);
  if (!removed) {
    return false;
  }
  GameState.inventory[removed.blockType] = (GameState.inventory[removed.blockType] || 0) + 1;
  updateSidebarUI();
  return true;
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

// 装備欄でブロック種別のスロットを探す
function findEquipmentSlotByBlock(blockType) {
  for (let i = 0; i < GameState.equipmentSlots.length; i += 1) {
    const item = GameState.equipmentSlots[i];
    if (item && item.kind === ItemKind.BLOCK && item.blockType === blockType) {
      return i;
    }
  }
  return -1;
}

// ブロックスロットを所持アイテム内に確保する
function ensureInventorySlotForBlock(blockType) {
  if (findInventorySlotByBlock(blockType) !== -1) {
    return true;
  }
  if (findEquipmentSlotByBlock(blockType) !== -1) {
    return true;
  }
  const emptyIndex = findEmptyInventoryIndex();
  if (emptyIndex === -1) {
    return false;
  }
  GameState.inventorySlots[emptyIndex] = { kind: ItemKind.BLOCK, blockType };
  return true;
}
