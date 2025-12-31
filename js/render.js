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
  const startCol = max(0, floor(GameState.camera.pos.x / GameState.worldState.tileSize) - RENDER_VIEW_MARGIN);
  const endCol = min(
    GameState.worldState.worldCols - 1,
    floor((GameState.camera.pos.x + width) / GameState.worldState.tileSize) + RENDER_VIEW_MARGIN
  );
  const startRow = max(0, floor(GameState.camera.pos.y / GameState.worldState.tileSize) - RENDER_VIEW_MARGIN);
  const endRow = min(
    GameState.worldState.worldRows - 1,
    floor((GameState.camera.pos.y + height) / GameState.worldState.tileSize) + RENDER_VIEW_MARGIN
  );

  for (let col = startCol; col <= endCol; col += 1) {
    for (let row = startRow; row <= endRow; row += 1) {
      const block = GameState.worldState.world[col][row];
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

  for (let i = 0; i < GameState.worldObjects.backgroundPlaceables.length; i += 1) {
    const placeable = GameState.worldObjects.backgroundPlaceables[i];
    drawPlaceable(placeable);
  }
}

// 設置物を描画する
function drawPlaceables() {
  if (!GameState.placeableSprite) {
    return;
  }

  for (let i = 0; i < GameState.worldObjects.placeables.length; i += 1) {
    const placeable = GameState.worldObjects.placeables[i];
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
    const x = drawCol * GameState.worldState.tileSize;
    const y = drawRow * GameState.worldState.tileSize;
    const srcX = sprite.index * stride;
    imageMode(CORNER);
    image(
      GameState.placeableSprite,
      x,
      y,
      GameState.worldState.tileSize,
      GameState.worldState.tileSize,
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

  for (let i = 0; i < GameState.effects.drops.length; i += 1) {
    const drop = GameState.effects.drops[i];
    const itemDef = getItemDef(drop.itemId);
    if (!itemDef) {
      continue;
    }
    const drawLeft = drop.x - GameState.worldState.tileSize * 0.5;
    const drawTop = drop.y - GameState.worldState.tileSize * 0.5;
    const srcX = itemDef.iconIndex * (DROP_FRAME_SIZE + DROP_SPRITE_GAP);
    imageMode(CORNER);
    image(
      GameState.dropSprite,
      drawLeft,
      drawTop,
      GameState.worldState.tileSize,
      GameState.worldState.tileSize,
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

  const x = col * GameState.worldState.tileSize;
  const y = row * GameState.worldState.tileSize;

  noStroke();
  fill(colors.main);
  rect(x, y, GameState.worldState.tileSize, GameState.worldState.tileSize);

  fill(colors.light);
  rect(x, y, GameState.worldState.tileSize, BLOCK_LIGHT_EDGE);
  rect(x, y, BLOCK_LIGHT_EDGE, GameState.worldState.tileSize);

  fill(colors.dark);
  rect(x, y + GameState.worldState.tileSize - BLOCK_LIGHT_EDGE, GameState.worldState.tileSize, BLOCK_LIGHT_EDGE);
  rect(x + GameState.worldState.tileSize - BLOCK_LIGHT_EDGE, y, BLOCK_LIGHT_EDGE, GameState.worldState.tileSize);

  if (blockType === BlockType.GRASS && colors.top) {
    fill(colors.top);
    rect(x, y, GameState.worldState.tileSize, BLOCK_TOP_EDGE);
  }

  if (colors.ore) {
    fill(colors.ore);
    const seed = col * ORE_SEED_MULTIPLIER + row;
    rect(
      x + (seed % ORE_OFFSET_A) + ORE_OFFSET_B,
      y + ((seed * ORE_OFFSET_C) % ORE_OFFSET_A) + ORE_OFFSET_B,
      ORE_SIZE_LARGE,
      ORE_SIZE_LARGE
    );
    rect(
      x + ((seed * 2) % ORE_OFFSET_D) + ORE_OFFSET_E,
      y + ((seed * ORE_OFFSET_F) % ORE_OFFSET_D) + ORE_OFFSET_G,
      ORE_SIZE_MEDIUM,
      ORE_SIZE_MEDIUM
    );
  }
}

function drawPlayer() {
  if (!GameState.playerSprite) {
    return;
  }

  const sprite = GameState.playerSprite;
  const dir = GameState.playerState.entity.dir >= 0 ? PLAYER_DIR_RIGHT : PLAYER_DIR_LEFT;
  const headIndex = PLAYER_HEAD_INDEX;
  const bodyIndex = getBodyFrameIndex();
  const headSx = headIndex * (PLAYER_FRAME_SIZE + PLAYER_SPRITE_GAP);
  const bodySx = bodyIndex * (PLAYER_FRAME_SIZE + PLAYER_SPRITE_GAP);
  const headSy = PLAYER_SHEET_ROW * PLAYER_FRAME_SIZE;
  const bodySy = PLAYER_SHEET_ROW * PLAYER_FRAME_SIZE;

  const drawLeft = GameState.playerState.entity.x - PLAYER_FRAME_SIZE * 0.5;
  const visualHeight = PLAYER_HEAD_HEIGHT + PLAYER_BODY_HEIGHT;
  const drawTop = GameState.playerState.entity.y + GameState.playerState.entity.h * 0.5 - visualHeight;

  imageMode(CORNER);
  push();
  if (dir === PLAYER_DIR_LEFT) {
    translate(GameState.playerState.entity.x * PLAYER_FLIP_TRANSLATE_MULTIPLIER, 0);
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
  if (abs(GameState.playerState.entity.vx) > PLAYER_WALK_SPEED_THRESHOLD) {
    return 1 + (floor(frameCount / PLAYER_BODY_FRAME_INTERVAL) % PLAYER_BODY_FRAMES);
  }
  return PLAYER_IDLE_FRAME;
}

// プレイヤーの上に装備を重ねる
function drawToolOverlay(playerDrawLeft, playerDrawTop, dir) {
  const selectedItem = getSelectedEquipment();
  if (!GameState.itemSprite || !selectedItem || selectedItem.kind !== ItemKind.TOOL) {
    return;
  }

  const toolIndex = getToolSpriteIndex(selectedItem.tool);
  const anchorX = playerDrawLeft + TOOL_ANCHOR_X;
  const anchorY = playerDrawTop + TOOL_ANCHOR_Y;
  const srcX = toolIndex * (ITEM_FRAME_SIZE + ITEM_SPRITE_GAP);
  const srcY = 0;

  push();
  translate(anchorX, anchorY);
  const baseAngle = TOOL_BASE_ANGLE;
  const swing = radians(GameState.playerState.pickaxeSwing);
  if (dir === PLAYER_DIR_LEFT) {
    scale(-1, 1);
  }
  rotate(baseAngle + swing);
  imageMode(CORNER);
  image(
    GameState.itemSprite,
    TOOL_DRAW_OFFSET_X,
    TOOL_DRAW_OFFSET_Y,
    ITEM_FRAME_SIZE,
    ITEM_FRAME_SIZE,
    srcX,
    srcY,
    ITEM_FRAME_SIZE,
    ITEM_FRAME_SIZE
  );
  pop();
}

function drawBlockCursor() {
  const target = screenToWorld(mouseX, mouseY);
  const col = floor(target.x / GameState.worldState.tileSize);
  const row = floor(target.y / GameState.worldState.tileSize);

  if (!isInsideWorld(col, row)) {
    return;
  }

  const distance = dist(
    GameState.playerState.entity.x,
    GameState.playerState.entity.y,
    col * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5,
    row * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5
  );
  if (distance > GameState.playerState.reachRange * GameState.worldState.tileSize) {
    return;
  }

  noFill();
  const pulse = sin(frameCount * CURSOR_PULSE_SPEED) * CURSOR_PULSE_SCALE + CURSOR_PULSE_BASE;
  stroke(230, 200, 90, pulse);
  strokeWeight(CURSOR_STROKE_WEIGHT);
  rect(col * GameState.worldState.tileSize, row * GameState.worldState.tileSize, GameState.worldState.tileSize, GameState.worldState.tileSize);
  strokeWeight(CURSOR_STROKE_WEIGHT_DEFAULT);
}
