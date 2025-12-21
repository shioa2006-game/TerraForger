// メイン処理
function preload() {
  GameState.playerSprite = loadImage("assets/player.png");
  GameState.itemSprite = loadImage("assets/items.png");
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
  updatePickaxeSwing();
  updateCamera();

  push();
  translate(-GameState.cameraPos.x, -GameState.cameraPos.y);
  drawWorld();
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

