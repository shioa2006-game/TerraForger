// 描画関連
const PLAYER_FRAME_SIZE = 36;
const PLAYER_HEAD_HEIGHT = 36;
const PLAYER_BODY_HEIGHT = 36;
const PLAYER_SHEET_ROW = 0;
const PLAYER_SPRITE_GAP = 6;
const PLAYER_BODY_FRAMES = 2;
const PLAYER_BODY_FRAME_INTERVAL = 10;
const ITEM_FRAME_SIZE = 36;
const ITEM_SPRITE_GAP = 6;
const DROP_FRAME_SIZE = 36;
const DROP_SPRITE_GAP = 6;
const PLACEABLE_FRAME_SIZE = 36;
const PLACEABLE_SPRITE_GAP = 6;
function drawWorld() {
  const startCol = max(0, floor(GameState.cameraPos.x / GameState.tileSize) - 1);
  const endCol = min(GameState.worldCols - 1, floor((GameState.cameraPos.x + width) / GameState.tileSize) + 1);
  const startRow = max(0, floor(GameState.cameraPos.y / GameState.tileSize) - 1);
  const endRow = min(GameState.worldRows - 1, floor((GameState.cameraPos.y + height) / GameState.tileSize) + 1);

  for (let col = startCol; col <= endCol; col += 1) {
    for (let row = startRow; row <= endRow; row += 1) {
      const block = GameState.world[col][row];
      if (block === BlockType.AIR) {
        continue;
      }
      drawBlock(col, row, block);
    }
  }
}

// 木の壁を背景として描画する
function drawWoodWalls() {
  if (!GameState.placeableSprite) {
    return;
  }

  for (let i = 0; i < GameState.backgroundPlaceables.length; i += 1) {
    const placeable = GameState.backgroundPlaceables[i];
    drawPlaceable(placeable);
  }
}

// 設置物を描画する
function drawPlaceables() {
  if (!GameState.placeableSprite) {
    return;
  }

  for (let i = 0; i < GameState.placeables.length; i += 1) {
    const placeable = GameState.placeables[i];
    drawPlaceable(placeable);
  }
}

// 設置物を描画する
function drawPlaceable(placeable) {
  const def = getPlaceableDef(placeable.blockType);
  if (!def || !GameState.placeableSprite) {
    return;
  }
  const stride = PLACEABLE_FRAME_SIZE + PLACEABLE_SPRITE_GAP;
  for (let i = 0; i < def.sprites.length; i += 1) {
    const sprite = def.sprites[i];
    const drawCol = placeable.col + sprite.dx;
    const drawRow = placeable.row + sprite.dy;
    const x = drawCol * GameState.tileSize;
    const y = drawRow * GameState.tileSize;
    const srcX = sprite.index * stride;
    imageMode(CORNER);
    image(
      GameState.placeableSprite,
      x,
      y,
      GameState.tileSize,
      GameState.tileSize,
      srcX,
      0,
      PLACEABLE_FRAME_SIZE,
      PLACEABLE_FRAME_SIZE
    );
  }
}

// ドロップアイテムを描画する
function drawDrops() {
  if (!GameState.dropSprite) {
    return;
  }

  for (let i = 0; i < GameState.drops.length; i += 1) {
    const drop = GameState.drops[i];
    const itemDef = getItemDef(drop.itemId);
    if (!itemDef) {
      continue;
    }
    const drawLeft = drop.x - GameState.tileSize * 0.5;
    const drawTop = drop.y - GameState.tileSize * 0.5;
    const srcX = itemDef.iconIndex * (DROP_FRAME_SIZE + DROP_SPRITE_GAP);
    imageMode(CORNER);
    image(
      GameState.dropSprite,
      drawLeft,
      drawTop,
      GameState.tileSize,
      GameState.tileSize,
      srcX,
      0,
      DROP_FRAME_SIZE,
      DROP_FRAME_SIZE
    );
  }
}

// ブロック描画は色と陰影で立体感を出す
function drawBlock(col, row, blockType) {
  const colors = BlockColors[blockType];
  if (!colors) {
    return;
  }

  const x = col * GameState.tileSize;
  const y = row * GameState.tileSize;

  noStroke();
  fill(colors.main);
  rect(x, y, GameState.tileSize, GameState.tileSize);

  fill(colors.light);
  rect(x, y, GameState.tileSize, 2);
  rect(x, y, 2, GameState.tileSize);

  fill(colors.dark);
  rect(x, y + GameState.tileSize - 2, GameState.tileSize, 2);
  rect(x + GameState.tileSize - 2, y, 2, GameState.tileSize);

  if (blockType === BlockType.GRASS && colors.top) {
    fill(colors.top);
    rect(x, y, GameState.tileSize, 4);
  }

  if (colors.ore) {
    fill(colors.ore);
    const seed = col * 1000 + row;
    rect(x + (seed % 7) + 2, y + ((seed * 3) % 7) + 2, 4, 4);
    rect(x + ((seed * 2) % 8) + 4, y + ((seed * 5) % 8) + 6, 3, 3);
  }
}

function drawPlayer() {
  if (!GameState.playerSprite) {
    return;
  }

  const sprite = GameState.playerSprite;
  const dir = GameState.player.dir >= 0 ? "right" : "left";
  const headIndex = 0;
  const bodyIndex = getBodyFrameIndex();
  const headSx = headIndex * (PLAYER_FRAME_SIZE + PLAYER_SPRITE_GAP);
  const bodySx = bodyIndex * (PLAYER_FRAME_SIZE + PLAYER_SPRITE_GAP);
  const headSy = PLAYER_SHEET_ROW * PLAYER_FRAME_SIZE;
  const bodySy = PLAYER_SHEET_ROW * PLAYER_FRAME_SIZE;

  const drawLeft = GameState.player.x - PLAYER_FRAME_SIZE * 0.5;
  const visualHeight = PLAYER_HEAD_HEIGHT + PLAYER_BODY_HEIGHT;
  const drawTop = GameState.player.y + GameState.player.h * 0.5 - visualHeight;

  imageMode(CORNER);
  push();
  if (dir === "left") {
    translate(GameState.player.x * 2, 0);
    scale(-1, 1);
  }
  image(
    sprite,
    drawLeft,
    drawTop,
    PLAYER_FRAME_SIZE,
    PLAYER_HEAD_HEIGHT,
    headSx,
    headSy,
    PLAYER_FRAME_SIZE,
    PLAYER_HEAD_HEIGHT
  );
  image(
    sprite,
    drawLeft,
    drawTop + PLAYER_HEAD_HEIGHT,
    PLAYER_FRAME_SIZE,
    PLAYER_BODY_HEIGHT,
    bodySx,
    bodySy,
    PLAYER_FRAME_SIZE,
    PLAYER_BODY_HEIGHT
  );
  pop();
  drawToolOverlay(drawLeft, drawTop, dir);
}

// 移動中は体フレームを交互に切り替える
function getBodyFrameIndex() {
  if (abs(GameState.player.vx) > 0.1) {
    return 1 + (floor(frameCount / PLAYER_BODY_FRAME_INTERVAL) % PLAYER_BODY_FRAMES);
  }
  return 2;
}

// プレイヤーの上に装備を重ねる
function drawToolOverlay(playerDrawLeft, playerDrawTop, dir) {
  const selectedItem = getSelectedEquipment();
  if (!GameState.itemSprite || !selectedItem || selectedItem.kind !== ItemKind.TOOL) {
    return;
  }

  const toolIndex = getToolSpriteIndex(selectedItem.tool);
  const anchorX = playerDrawLeft + 9;
  const anchorY = playerDrawTop + 54;
  const srcX = toolIndex * (ITEM_FRAME_SIZE + ITEM_SPRITE_GAP);
  const srcY = 0;

  push();
  translate(anchorX, anchorY);
  const baseAngle = PI / 4;
  const swing = radians(GameState.pickaxeSwing);
  if (dir === "left") {
    scale(-1, 1);
  }
  rotate(baseAngle + swing);
  imageMode(CORNER);
  image(
    GameState.itemSprite,
    -18,
    -36,
    ITEM_FRAME_SIZE,
    ITEM_FRAME_SIZE,
    srcX,
    srcY,
    ITEM_FRAME_SIZE,
    ITEM_FRAME_SIZE
  );
  pop();
}

function getToolSpriteIndex(toolType) {
  if (toolType === ToolType.PICKAXE) {
    return 0;
  }
  if (toolType === ToolType.AXE) {
    return 1;
  }
  if (toolType === ToolType.HAMMER) {
    return 2;
  }
  return 3;
}

function drawBlockCursor() {
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

  noFill();
  const pulse = sin(frameCount * 0.12) * 40 + 180;
  stroke(230, 200, 90, pulse);
  strokeWeight(2);
  rect(col * GameState.tileSize, row * GameState.tileSize, GameState.tileSize, GameState.tileSize);
  strokeWeight(1);
}
