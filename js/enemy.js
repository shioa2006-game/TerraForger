// 敵エンティティ関連

// 敵の種別
const EnemyType = {
  RABBIT: "rabbit",
  SLIME: "slime",
};

// 敵のスプライトインデックス
const EnemySpriteIndex = {
  [EnemyType.RABBIT]: [0, 1],
  [EnemyType.SLIME]: [2, 3],
};

// 敵のサイズ
const ENEMY_SIZE = 36;
const ENEMY_SPRITE_PADDING = 6;

// 敵を初期化する（地表にスライム1体、ウサギ1体を配置）
function initEnemies() {
  GameState.enemies = [];

  // プレイヤーのスポーン位置より少し右に配置
  const rabbitCol = PLAYER_SPAWN_COL + 10;
  const slimeCol = PLAYER_SPAWN_COL + 20;

  // ウサギを地表に配置
  const rabbitSpawnRow = findSurfaceRow(rabbitCol);
  if (rabbitSpawnRow > 0) {
    GameState.enemies.push({
      type: EnemyType.RABBIT,
      x: rabbitCol * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5,
      y: (rabbitSpawnRow - 1) * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5,
      w: ENEMY_SIZE,
      h: ENEMY_SIZE,
      animFrame: 0,
      animTimer: 0,
      dir: 1,
    });
  }

  // スライムを地表に配置
  const slimeSpawnRow = findSurfaceRow(slimeCol);
  if (slimeSpawnRow > 0) {
    GameState.enemies.push({
      type: EnemyType.SLIME,
      x: slimeCol * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5,
      y: (slimeSpawnRow - 1) * GameState.worldState.tileSize + GameState.worldState.tileSize * 0.5,
      w: ENEMY_SIZE,
      h: ENEMY_SIZE,
      animFrame: 0,
      animTimer: 0,
      dir: -1,
    });
  }
}

// 指定列の地表行を見つける
function findSurfaceRow(col) {
  for (let row = 0; row < GameState.worldState.worldRows; row += 1) {
    if (isSolid(col, row)) {
      return row;
    }
  }
  return -1;
}

// 敵を描画する
function drawEnemies() {
  const tileSize = GameState.worldState.tileSize;
  const stride = tileSize + ENEMY_SPRITE_PADDING;

  for (const enemy of GameState.enemies) {
    const spriteIndices = EnemySpriteIndex[enemy.type];
    const spriteIndex = spriteIndices[enemy.animFrame];
    const srcX = spriteIndex * stride;

    push();
    translate(enemy.x, enemy.y);

    // 向きに応じて反転
    if (enemy.dir < 0) {
      scale(-1, 1);
    }

    imageMode(CENTER);
    image(
      GameState.enemySprite,
      0,
      0,
      tileSize,
      tileSize,
      srcX,
      0,
      tileSize,
      tileSize
    );
    pop();
  }
}
