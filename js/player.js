// プレイヤー関連
function initPlayer() {
  const spawnCol = 8;
  let spawnRow = 0;
  for (let row = 0; row < GameState.worldRows; row += 1) {
    if (isSolid(spawnCol, row)) {
      spawnRow = row - 1;
      break;
    }
  }

  GameState.player = {
    x: spawnCol * GameState.tileSize + GameState.tileSize * 0.5,
    y: spawnRow * GameState.tileSize,
    w: 30,
    h: 54,
    vx: 0,
    vy: 0,
    onGround: false,
    dir: 1,
  };
}

function updatePlayer() {
  const speed = 3.0;
  const gravity = 0.32;
  const jumpPower = 5.2;
  const friction = 0.8;

  if (GameState.keyState.left) {
    GameState.player.vx = -speed;
    GameState.player.dir = -1;
  } else if (GameState.keyState.right) {
    GameState.player.vx = speed;
    GameState.player.dir = 1;
  } else {
    GameState.player.vx *= friction;
    if (abs(GameState.player.vx) < 0.05) {
      GameState.player.vx = 0;
    }
  }

  if (GameState.keyState.up && GameState.player.onGround) {
    GameState.player.vy = -jumpPower;
    GameState.player.onGround = false;
  }

  GameState.player.vy += gravity;
  moveHorizontal();
  moveVertical();
}

function moveHorizontal() {
  if (GameState.player.vx === 0) {
    return;
  }

  let nextX = GameState.player.x + GameState.player.vx;
  const halfW = GameState.player.w * 0.5;
  const leftCol = floor((nextX - halfW) / GameState.tileSize);
  const rightCol = floor((nextX + halfW) / GameState.tileSize);
  const topRow = floor((GameState.player.y - GameState.player.h * 0.5) / GameState.tileSize);
  const bottomRow = floor((GameState.player.y + GameState.player.h * 0.5 - 1) / GameState.tileSize);

  if (GameState.player.vx > 0) {
    for (let row = topRow; row <= bottomRow; row += 1) {
      if (isSolid(rightCol, row)) {
        nextX = rightCol * GameState.tileSize - halfW;
        GameState.player.vx = 0;
        break;
      }
    }
  } else {
    for (let row = topRow; row <= bottomRow; row += 1) {
      if (isSolid(leftCol, row)) {
        nextX = (leftCol + 1) * GameState.tileSize + halfW;
        GameState.player.vx = 0;
        break;
      }
    }
  }

  GameState.player.x = nextX;
}

function moveVertical() {
  GameState.player.onGround = false;
  let nextY = GameState.player.y + GameState.player.vy;
  const halfH = GameState.player.h * 0.5;
  const leftCol = floor((GameState.player.x - GameState.player.w * 0.5) / GameState.tileSize);
  const rightCol = floor((GameState.player.x + GameState.player.w * 0.5 - 1) / GameState.tileSize);
  const topRow = floor((nextY - halfH) / GameState.tileSize);
  const bottomRow = floor((nextY + halfH) / GameState.tileSize);

  if (GameState.player.vy > 0) {
    for (let col = leftCol; col <= rightCol; col += 1) {
      if (isSolid(col, bottomRow)) {
        nextY = bottomRow * GameState.tileSize - halfH;
        GameState.player.vy = 0;
        GameState.player.onGround = true;
        break;
      }
    }
  } else if (GameState.player.vy < 0) {
    for (let col = leftCol; col <= rightCol; col += 1) {
      if (isSolid(col, topRow)) {
        nextY = (topRow + 1) * GameState.tileSize + halfH;
        GameState.player.vy = 0;
        break;
      }
    }
  }

  GameState.player.y = nextY;
}
