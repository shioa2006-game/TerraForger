// メイン処理
function preload() {
  GameState.playerSprite = loadImage("assets/player.png");
  GameState.itemSprite = loadImage("assets/items.png");
  GameState.dropSprite = loadImage("assets/drops.png");
  GameState.placeableSprite = loadImage("assets/placeables.png");
  GameState.enemySprite = loadImage("assets/enemies.png");
}

function setup() {
  const canvas = createCanvas(CANVAS_WIDTH, CANVAS_HEIGHT);
  canvas.parent("game");
  canvas.elt.oncontextmenu = () => false;
  pixelDensity(1);
  noSmooth();

  initWorld();
  initPlayer();
  initEnemies();
  initInventory();
  initUI();
  initBackground();
  GameState.environment.lastTimeOfDay = GameState.environment.timeOfDay;
}

function draw() {
  const prevTime = GameState.environment.lastTimeOfDay;
  GameState.environment.timeOfDay = (GameState.environment.timeOfDay + TIME_OF_DAY_SPEED) % 1;
  if (GameState.environment.timeOfDay < prevTime) {
    processDailyGrowth();
  }
  GameState.environment.lastTimeOfDay = GameState.environment.timeOfDay;
  drawBackground();
  updatePlayer();
  updateParticles();
  updateDrops();
  updatePickaxeSwing();
  updateCamera();

  push();
  translate(-GameState.camera.pos.x, -GameState.camera.pos.y);
  drawWoodWalls();
  drawPlaceables();
  drawWorld();
  drawDrops();
  drawPlayer();
  drawEnemies();
  drawParticles();
  drawBlockCursor();
  pop();

  drawHud();
}

// 左クリック中だけツルハシを往復させる
function updatePickaxeSwing() {
  const selectedItem = getSelectedEquipment();
  const shouldSwing = selectedItem && selectedItem.kind === ItemKind.TOOL;
  if (shouldSwing && mouseIsPressed && mouseButton === LEFT) {
    GameState.playerState.pickaxeSwing += PICKAXE_SWING_SPEED * GameState.playerState.pickaxeSwingDir;
    if (GameState.playerState.pickaxeSwing > PICKAXE_SWING_LIMIT) {
      GameState.playerState.pickaxeSwing = PICKAXE_SWING_LIMIT;
      GameState.playerState.pickaxeSwingDir = -1;
    } else if (GameState.playerState.pickaxeSwing < -PICKAXE_SWING_LIMIT) {
      GameState.playerState.pickaxeSwing = -PICKAXE_SWING_LIMIT;
      GameState.playerState.pickaxeSwingDir = 1;
    }
  } else {
    GameState.playerState.pickaxeSwing = 0;
    GameState.playerState.pickaxeSwingDir = 1;
  }
}

function updateCamera() {
  GameState.camera.pos.x = constrain(
    GameState.playerState.entity.x - width * 0.5,
    0,
    GameState.worldState.worldCols * GameState.worldState.tileSize - width
  );
  GameState.camera.pos.y = constrain(
    GameState.playerState.entity.y - height * 0.5,
    0,
    GameState.worldState.worldRows * GameState.worldState.tileSize - height
  );
}

// ドロップアイテムの更新
function updateDrops() {
  const dropSize = GameState.worldState.tileSize * DROP_SIZE_SCALE;

  for (let i = GameState.effects.drops.length - 1; i >= 0; i -= 1) {
    const drop = GameState.effects.drops[i];
    drop.vy = min(drop.vy + DROP_GRAVITY, DROP_MAX_FALL);
    drop.x += drop.vx;
    drop.y += drop.vy;
    drop.vx *= DROP_FRICTION;
    if (abs(drop.vx) < DROP_STOP_THRESHOLD) {
      drop.vx = 0;
    }

    const col = floor(drop.x / GameState.worldState.tileSize);
    const row = floor((drop.y + dropSize * 0.5) / GameState.worldState.tileSize);
    if (isSolid(col, row)) {
      drop.y = row * GameState.worldState.tileSize - dropSize * 0.5;
      drop.vy = 0;
    }

    if (isDropTouchingPlayer(drop, dropSize)) {
      if (tryPickupDrop(drop.itemId)) {
        GameState.effects.drops.splice(i, 1);
      }
    }
  }
}

// ドロップとプレイヤーが接触しているか判定する
function isDropTouchingPlayer(drop, size) {
  const half = size * 0.5;
  const dropLeft = drop.x - half;
  const dropRight = drop.x + half;
  const dropTop = drop.y - half;
  const dropBottom = drop.y + half;
  const playerLeft = GameState.playerState.entity.x - GameState.playerState.entity.w * 0.5;
  const playerRight = GameState.playerState.entity.x + GameState.playerState.entity.w * 0.5;
  const playerTop = GameState.playerState.entity.y - GameState.playerState.entity.h * 0.5;
  const playerBottom = GameState.playerState.entity.y + GameState.playerState.entity.h * 0.5;

  return (
    dropLeft < playerRight &&
    dropRight > playerLeft &&
    dropTop < playerBottom &&
    dropBottom > playerTop
  );
}

// ドロップを所持品へ追加する
function tryPickupDrop(itemId) {
  if (!ensureInventorySlotForItem(itemId)) {
    return false;
  }
  addItemCount(itemId, 1);
  return true;
}
