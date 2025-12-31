// メイン処理
function preload() {
  GameState.playerSprite = loadImage("assets/player.png");
  GameState.itemSprite = loadImage("assets/items.png");
  GameState.dropSprite = loadImage("assets/drops.png");
  GameState.placeableSprite = loadImage("assets/placeables.png");
}

function setup() {
  const canvas = createCanvas(960, 540);
  canvas.parent("game");
  canvas.elt.oncontextmenu = () => false;
  pixelDensity(1);
  noSmooth();

  initWorld();
  initPlayer();
  initInventory();
  initUI();
  initBackground();
}

function draw() {
  GameState.timeOfDay = (GameState.timeOfDay + 0.00012) % 1;
  drawBackground();
  updatePlayer();
  updateParticles();
  updateDrops();
  updatePickaxeSwing();
  updateCamera();

  push();
  translate(-GameState.cameraPos.x, -GameState.cameraPos.y);
  drawWoodWalls();
  drawPlaceables();
  drawWorld();
  drawDrops();
  drawPlayer();
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
    const speed = 2.4;
    const limit = 30;
    GameState.pickaxeSwing += speed * GameState.pickaxeSwingDir;
    if (GameState.pickaxeSwing > limit) {
      GameState.pickaxeSwing = limit;
      GameState.pickaxeSwingDir = -1;
    } else if (GameState.pickaxeSwing < -limit) {
      GameState.pickaxeSwing = -limit;
      GameState.pickaxeSwingDir = 1;
    }
  } else {
    GameState.pickaxeSwing = 0;
    GameState.pickaxeSwingDir = 1;
  }
}

function updateCamera() {
  GameState.cameraPos.x = constrain(
    GameState.player.x - width * 0.5,
    0,
    GameState.worldCols * GameState.tileSize - width
  );
  GameState.cameraPos.y = constrain(
    GameState.player.y - height * 0.5,
    0,
    GameState.worldRows * GameState.tileSize - height
  );
}

function screenToWorld(screenX, screenY) {
  return {
    x: screenX + GameState.cameraPos.x,
    y: screenY + GameState.cameraPos.y,
  };
}

// ドロップアイテムの更新
function updateDrops() {
  const gravity = 0.28;
  const maxFall = 6;
  const dropSize = GameState.tileSize * 0.6;

  for (let i = GameState.drops.length - 1; i >= 0; i -= 1) {
    const drop = GameState.drops[i];
    drop.vy = min(drop.vy + gravity, maxFall);
    drop.x += drop.vx;
    drop.y += drop.vy;
    drop.vx *= 0.92;
    if (abs(drop.vx) < 0.02) {
      drop.vx = 0;
    }

    const col = floor(drop.x / GameState.tileSize);
    const row = floor((drop.y + dropSize * 0.5) / GameState.tileSize);
    if (isSolid(col, row)) {
      drop.y = row * GameState.tileSize - dropSize * 0.5;
      drop.vy = 0;
    }

    if (isDropTouchingPlayer(drop, dropSize)) {
      if (tryPickupDrop(drop.itemId)) {
        GameState.drops.splice(i, 1);
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
  const playerLeft = GameState.player.x - GameState.player.w * 0.5;
  const playerRight = GameState.player.x + GameState.player.w * 0.5;
  const playerTop = GameState.player.y - GameState.player.h * 0.5;
  const playerBottom = GameState.player.y + GameState.player.h * 0.5;

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
