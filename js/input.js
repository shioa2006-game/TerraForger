// 入力処理
function keyPressed() {
  // オーバーレイが開いている間はESCとEキー、オーバーレイ固有の操作のみ許可
  if (isOverlayOpen()) {
    handleOverlayKeyDown();
    handleInteractKeyDown();
    handleWorkbenchNavigation();
    return;
  }
  handleMovementKeyDown();
  handleEquipmentKeyDown();
  handleResetKeyDown();
  handleOverlayKeyDown();
  handleInteractKeyDown();
}

function keyReleased() {
  handleMovementKeyUp();
}

// 作業机UIの矢印キー操作を処理する
function handleWorkbenchNavigation() {
  if (!uiElements.workbenchOverlay || uiElements.workbenchOverlay.classList.contains("hidden")) {
    return;
  }
  if (keyCode === UP_ARROW) {
    navigateRecipe(-1);
  } else if (keyCode === DOWN_ARROW) {
    navigateRecipe(1);
  }
}

// 移動キーの押下を処理する
function handleMovementKeyDown() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) {
    GameState.playerState.keyState.left = true;
  }
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) {
    GameState.playerState.keyState.right = true;
  }
  if (key === "w" || key === "W" || key === " " || keyCode === UP_ARROW) {
    GameState.playerState.keyState.up = true;
  }
  if (key === "s" || key === "S" || keyCode === DOWN_ARROW) {
    GameState.playerState.keyState.down = true;
  }
}

// 移動キーの解放を処理する
function handleMovementKeyUp() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) {
    GameState.playerState.keyState.left = false;
  }
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) {
    GameState.playerState.keyState.right = false;
  }
  if (key === "w" || key === "W" || key === " " || keyCode === UP_ARROW) {
    GameState.playerState.keyState.up = false;
  }
  if (key === "s" || key === "S" || keyCode === DOWN_ARROW) {
    GameState.playerState.keyState.down = false;
  }
}

// 装備スロットの選択キーを処理する
function handleEquipmentKeyDown() {
  const keyIndex = parseInt(key, 10) - 1;
  if (!Number.isNaN(keyIndex) && keyIndex >= 0 && keyIndex < EQUIPMENT_SLOT_COUNT) {
    GameState.playerState.selectedEquipIndex = keyIndex;
  }
}

// Rキーでワールドを再生成する
function handleResetKeyDown() {
  if (key === "r" || key === "R") {
    resetWorldState();
  }
}

// すべてのオーバーレイを閉じる
function handleOverlayKeyDown() {
  if (keyCode === ESCAPE) {
    closeAllOverlays();
  }
}

// インタラクトキーを処理する
function handleInteractKeyDown() {
  if (key === "e" || key === "E") {
    tryToggleInteract();
  }
}

// 再生成時の初期化をまとめる
function resetWorldState() {
  noiseSeed(Date.now());
  initWorld();
  initPlayer();
  initInventory();
  initBackground();
  GameState.effects.particles = [];
}

function mousePressed() {
  if (isOverlayOpen()) {
    return;
  }

  const target = getTargetTileFromMouse();
  if (!target) {
    return;
  }
  if (!isTileWithinReach(target.col, target.row)) {
    return;
  }

  if (mouseButton === LEFT) {
    handleLeftClick(target.col, target.row);
  } else if (mouseButton === RIGHT) {
    handleRightClick(target.col, target.row);
  }
}

// マウス位置からワールド座標のタイルを取得する
function getTargetTileFromMouse() {
  const target = screenToWorld(mouseX, mouseY);
  const col = floor(target.x / GameState.worldState.tileSize);
  const row = floor(target.y / GameState.worldState.tileSize);
  if (!isInsideWorld(col, row)) {
    return null;
  }
  return { col, row };
}

// タイルがリーチ範囲内か判定する
function isTileWithinReach(col, row) {
  const distance = dist(
    GameState.playerState.entity.x,
    GameState.playerState.entity.y,
    col * GameState.worldState.tileSize + GameState.worldState.tileSize * REACH_DISTANCE_SCALE,
    row * GameState.worldState.tileSize + GameState.worldState.tileSize * REACH_DISTANCE_SCALE
  );
  return distance <= GameState.playerState.reachRange * GameState.worldState.tileSize;
}

// 左クリック処理をまとめる
function handleLeftClick(col, row) {
  if (tryInteractWithPlaceable()) {
    return true;
  }
  if (tryCraftAtWorkbench()) {
    return true;
  }
  return tryBreakBlock(col, row);
}

// 右クリック処理をまとめる
function handleRightClick(col, row) {
  if (tryRetrievePlaceableWithHammer(col, row)) {
    return true;
  }
  return tryPlaceSelectedItem(col, row);
}

// ブロック破壊の判定と実行を行う
function tryBreakBlock(col, row) {
  if (GameState.worldState.world[col][row] === BlockType.AIR) {
    return false;
  }
  const blockType = GameState.worldState.world[col][row];
  const toolType = getSelectedToolType();
  if (!toolType || !isBlockBreakableWithTool(blockType, toolType)) {
    return false;
  }
  if (!isToolTargetAdjacent(col, row)) {
    return false;
  }
  GameState.worldState.world[col][row] = BlockType.AIR;
  createBlockParticles(col, row, blockType);
  const blockDef = BlockDefs[blockType];
  if (blockDef && blockDef.dropItemId) {
    createDropItem(blockDef.dropItemId, col, row);
  }
  return true;
}

// 装備中アイテムの設置処理を行う
function tryPlaceSelectedItem(col, row) {
  if (GameState.worldState.world[col][row] !== BlockType.AIR) {
    return false;
  }
  const selectedItem = getSelectedEquipment();
  if (!selectedItem || (selectedItem.kind !== ItemKind.BLOCK && selectedItem.kind !== ItemKind.PLACEABLE)) {
    return false;
  }
  const itemDef = getItemDef(selectedItem.itemId);
  const count = getItemCount(selectedItem.itemId);
  if (!itemDef || count <= 0) {
    return false;
  }
  if (selectedItem.kind === ItemKind.PLACEABLE) {
    const placeableBlock = itemDef.placeableBlock;
    if (!placeableBlock) {
      return false;
    }
    if (tryPlacePlaceable(placeableBlock, col, row)) {
      addItemCount(selectedItem.itemId, -1);
      return true;
    }
    return false;
  }

  const placeBlock = itemDef.placeBlock;
  if (!placeBlock) {
    return false;
  }
  if (isPlayerInside(col, row)) {
    return false;
  }
  if (!isPlaceableOccupied(col, row)) {
    GameState.worldState.world[col][row] = placeBlock;
    addItemCount(selectedItem.itemId, -1);
    return true;
  }
  return false;
}

function mouseWheel(event) {
  // オーバーレイが開いている間は装備欄のホイール選択を無効化
  if (isOverlayOpen()) {
    return false;
  }
  if (event.delta > 0) {
    GameState.playerState.selectedEquipIndex = (GameState.playerState.selectedEquipIndex + 1) % EQUIPMENT_SLOT_COUNT;
  } else {
    GameState.playerState.selectedEquipIndex =
      (GameState.playerState.selectedEquipIndex - 1 + EQUIPMENT_SLOT_COUNT) % EQUIPMENT_SLOT_COUNT;
  }
  return false;
}
