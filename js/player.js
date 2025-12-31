// プレイヤー関連
function initPlayer() {
  const spawnCol = PLAYER_SPAWN_COL;
  let spawnRow = 0;
  for (let row = 0; row < GameState.worldState.worldRows; row += 1) {
    if (isSolid(spawnCol, row)) {
      spawnRow = row - 1;
      break;
    }
  }

  GameState.playerState.entity = {
    x: spawnCol * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5,
    y: spawnRow * GameState.worldState.tileSize,
    w: PLAYER_WIDTH,
    h: PLAYER_HEIGHT,
    vx: 0,
    vy: 0,
    onGround: false,
    dir: 1,
  };
}

function updatePlayer() {
  if (GameState.playerState.keyState.left) {
    GameState.playerState.entity.vx = -PLAYER_SPEED;
    GameState.playerState.entity.dir = -1;
  } else if (GameState.playerState.keyState.right) {
    GameState.playerState.entity.vx = PLAYER_SPEED;
    GameState.playerState.entity.dir = 1;
  } else {
    GameState.playerState.entity.vx *= PLAYER_FRICTION;
    if (abs(GameState.playerState.entity.vx) < PLAYER_STOP_THRESHOLD) {
      GameState.playerState.entity.vx = 0;
    }
  }

  if (GameState.playerState.keyState.up && GameState.playerState.entity.onGround) {
    GameState.playerState.entity.vy = -PLAYER_JUMP_POWER;
    GameState.playerState.entity.onGround = false;
  }

  GameState.playerState.entity.vy += PLAYER_GRAVITY;
  moveHorizontal();
  moveVertical();
}

function moveHorizontal() {
  if (GameState.playerState.entity.vx === 0) {
    return;
  }

  let nextX = GameState.playerState.entity.x + GameState.playerState.entity.vx;
  const halfW = GameState.playerState.entity.w * 0.5;
  const leftCol = floor((nextX - halfW) / GameState.worldState.tileSize);
  const rightCol = floor((nextX + halfW) / GameState.worldState.tileSize);
  const topRow = floor((GameState.playerState.entity.y - GameState.playerState.entity.h * 0.5) / GameState.worldState.tileSize);
  const bottomRow = floor((GameState.playerState.entity.y + GameState.playerState.entity.h * 0.5 - 1) / GameState.worldState.tileSize);

  if (GameState.playerState.entity.vx > 0) {
    for (let row = topRow; row <= bottomRow; row += 1) {
      if (isSolid(rightCol, row)) {
        nextX = rightCol * GameState.worldState.tileSize - halfW;
        GameState.playerState.entity.vx = 0;
        break;
      }
    }
  } else {
    for (let row = topRow; row <= bottomRow; row += 1) {
      if (isSolid(leftCol, row)) {
        nextX = (leftCol + 1) * GameState.worldState.tileSize + halfW;
        GameState.playerState.entity.vx = 0;
        break;
      }
    }
  }

  GameState.playerState.entity.x = nextX;
}

function moveVertical() {
  GameState.playerState.entity.onGround = false;
  let nextY = GameState.playerState.entity.y + GameState.playerState.entity.vy;
  const halfH = GameState.playerState.entity.h * 0.5;
  const leftCol = floor((GameState.playerState.entity.x - GameState.playerState.entity.w * 0.5) / GameState.worldState.tileSize);
  const rightCol = floor((GameState.playerState.entity.x + GameState.playerState.entity.w * 0.5 - 1) / GameState.worldState.tileSize);
  const topRow = floor((nextY - halfH) / GameState.worldState.tileSize);
  const bottomRow = floor((nextY + halfH) / GameState.worldState.tileSize);

  if (GameState.playerState.entity.vy > 0) {
    for (let col = leftCol; col <= rightCol; col += 1) {
      if (isSolid(col, bottomRow)) {
        nextY = bottomRow * GameState.worldState.tileSize - halfH;
        GameState.playerState.entity.vy = 0;
        GameState.playerState.entity.onGround = true;
        break;
      }
    }
  } else if (GameState.playerState.entity.vy < 0) {
    for (let col = leftCol; col <= rightCol; col += 1) {
      if (isSolid(col, topRow)) {
        nextY = (topRow + 1) * GameState.worldState.tileSize + halfH;
        GameState.playerState.entity.vy = 0;
        break;
      }
    }
  }

  GameState.playerState.entity.y = nextY;
}
