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

// 敵の定義（ステータス）
const EnemyDefs = {
  [EnemyType.SLIME]: {
    maxHp: 60,
    attack: 15,
    speed: PLAYER_SPEED * 0.5,
    dropItemId: ItemId.OIL,
    dropCount: 1,
    ai: "chase",
  },
  [EnemyType.RABBIT]: {
    maxHp: 30,
    attack: 0,
    speed: PLAYER_SPEED * 0.8,
    dropItemId: ItemId.RAW_MEAT,
    dropCount: 1,
    ai: "flee",
  },
};

// 敵のサイズ
const ENEMY_SIZE = 36;
const ENEMY_SPRITE_PADDING = 6;
const ENEMY_ANIM_SPEED = 0.1;
const ENEMY_GRAVITY = 0.32;
const ENEMY_DETECTION_RANGE = 8 * 36;

// 敵の状態
const EnemyState = {
  ALIVE: "alive",
  DEAD: "dead",
};

// 敵を初期化する（地表にスライム1体、ウサギ1体を配置）
function initEnemies() {
  GameState.enemies = [];

  // プレイヤーのスポーン位置より少し右に配置
  const rabbitCol = PLAYER_SPAWN_COL + 10;
  const slimeCol = PLAYER_SPAWN_COL + 20;

  // ウサギを地表に配置
  const rabbitSpawnRow = findSurfaceRow(rabbitCol);
  if (rabbitSpawnRow > 0) {
    GameState.enemies.push(createEnemy(EnemyType.RABBIT, rabbitCol, rabbitSpawnRow - 1));
  }

  // スライムを地表に配置
  const slimeSpawnRow = findSurfaceRow(slimeCol);
  if (slimeSpawnRow > 0) {
    GameState.enemies.push(createEnemy(EnemyType.SLIME, slimeCol, slimeSpawnRow - 1));
  }
}

// 敵エンティティを生成する
function createEnemy(type, col, row) {
  const def = EnemyDefs[type];
  const tileSize = GameState.worldState.tileSize;
  return {
    type: type,
    x: col * tileSize + tileSize * 0.5,
    y: row * tileSize + tileSize * 0.5,
    vx: 0,
    vy: 0,
    w: ENEMY_SIZE,
    h: ENEMY_SIZE,
    hp: def.maxHp,
    maxHp: def.maxHp,
    state: EnemyState.ALIVE,
    animFrame: 0,
    animTimer: 0,
    dir: 1,
  };
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

// 敵を更新する
function updateEnemies() {
  const tileSize = GameState.worldState.tileSize;
  const playerX = GameState.playerState.entity.x;
  const playerY = GameState.playerState.entity.y;

  for (let i = GameState.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = GameState.enemies[i];

    // 死亡状態の敵はスキップ（ドロップ処理済み）
    if (enemy.state === EnemyState.DEAD) {
      continue;
    }

    const def = EnemyDefs[enemy.type];
    const dx = playerX - enemy.x;
    const dy = playerY - enemy.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // AI処理
    if (dist < ENEMY_DETECTION_RANGE) {
      if (def.ai === "chase") {
        // 追尾AI（スライム）
        if (dx > 0) {
          enemy.vx = def.speed;
          enemy.dir = 1;
        } else if (dx < 0) {
          enemy.vx = -def.speed;
          enemy.dir = -1;
        }
      } else if (def.ai === "flee") {
        // 逃走AI（ウサギ）
        if (dx > 0) {
          enemy.vx = -def.speed;
          enemy.dir = -1;
        } else if (dx < 0) {
          enemy.vx = def.speed;
          enemy.dir = 1;
        }
      }
    } else {
      // 検知範囲外では停止
      enemy.vx = 0;
    }

    // 重力適用
    enemy.vy += ENEMY_GRAVITY;

    // 移動と衝突判定
    moveEnemyHorizontal(enemy);
    moveEnemyVertical(enemy);

    // アニメーション更新
    enemy.animTimer += ENEMY_ANIM_SPEED;
    if (enemy.animTimer >= 1) {
      enemy.animTimer = 0;
      enemy.animFrame = (enemy.animFrame + 1) % 2;
    }
  }

  // 死亡した敵を配列から削除
  GameState.enemies = GameState.enemies.filter((e) => e.state !== EnemyState.DEAD);
}

// 敵の水平移動
function moveEnemyHorizontal(enemy) {
  if (enemy.vx === 0) {
    return;
  }

  const tileSize = GameState.worldState.tileSize;
  let nextX = enemy.x + enemy.vx;
  const halfW = enemy.w * 0.5;
  const leftCol = floor((nextX - halfW) / tileSize);
  const rightCol = floor((nextX + halfW) / tileSize);
  const topRow = floor((enemy.y - enemy.h * 0.5) / tileSize);
  const bottomRow = floor((enemy.y + enemy.h * 0.5 - 1) / tileSize);

  if (enemy.vx > 0) {
    for (let row = topRow; row <= bottomRow; row += 1) {
      if (isSolid(rightCol, row)) {
        nextX = rightCol * tileSize - halfW;
        enemy.vx = 0;
        break;
      }
    }
  } else {
    for (let row = topRow; row <= bottomRow; row += 1) {
      if (isSolid(leftCol, row)) {
        nextX = (leftCol + 1) * tileSize + halfW;
        enemy.vx = 0;
        break;
      }
    }
  }

  enemy.x = nextX;
}

// 敵の垂直移動
function moveEnemyVertical(enemy) {
  const tileSize = GameState.worldState.tileSize;
  let nextY = enemy.y + enemy.vy;
  const halfH = enemy.h * 0.5;
  const leftCol = floor((enemy.x - enemy.w * 0.5) / tileSize);
  const rightCol = floor((enemy.x + enemy.w * 0.5 - 1) / tileSize);
  const topRow = floor((nextY - halfH) / tileSize);
  const bottomRow = floor((nextY + halfH) / tileSize);

  if (enemy.vy > 0) {
    for (let col = leftCol; col <= rightCol; col += 1) {
      if (isSolid(col, bottomRow)) {
        nextY = bottomRow * tileSize - halfH;
        enemy.vy = 0;
        break;
      }
    }
  } else if (enemy.vy < 0) {
    for (let col = leftCol; col <= rightCol; col += 1) {
      if (isSolid(col, topRow)) {
        nextY = (topRow + 1) * tileSize + halfH;
        enemy.vy = 0;
        break;
      }
    }
  }

  enemy.y = nextY;
}

// 敵にダメージを与える
function damageEnemy(enemy, damage) {
  if (enemy.state !== EnemyState.ALIVE) {
    return;
  }

  enemy.hp -= damage;

  if (enemy.hp <= 0) {
    enemy.hp = 0;
    enemy.state = EnemyState.DEAD;
    spawnEnemyDrop(enemy);
  }
}

// 敵がドロップを落とす
function spawnEnemyDrop(enemy) {
  const def = EnemyDefs[enemy.type];
  if (!def.dropItemId) {
    return;
  }

  for (let i = 0; i < def.dropCount; i += 1) {
    GameState.effects.drops.push({
      itemId: def.dropItemId,
      x: enemy.x,
      y: enemy.y,
      vx: random(DROP_SPAWN_VX_MIN, DROP_SPAWN_VX_MAX),
      vy: random(DROP_SPAWN_VY_MIN, DROP_SPAWN_VY_MAX),
    });
  }
}

// 敵を描画する
function drawEnemies() {
  const tileSize = GameState.worldState.tileSize;
  const stride = tileSize + ENEMY_SPRITE_PADDING;

  for (const enemy of GameState.enemies) {
    if (enemy.state !== EnemyState.ALIVE) {
      continue;
    }

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

    // HPバー表示（ダメージを受けている場合）
    if (enemy.hp < enemy.maxHp) {
      drawEnemyHpBar(enemy);
    }

    pop();
  }
}

// 敵のHPバーを描画
function drawEnemyHpBar(enemy) {
  const barWidth = 30;
  const barHeight = 4;
  const barY = -enemy.h * 0.5 - 8;
  const hpRatio = enemy.hp / enemy.maxHp;

  // 向きに関わらず正しく表示するため、dirで再反転
  push();
  if (enemy.dir < 0) {
    scale(-1, 1);
  }

  // 背景（黒）
  noStroke();
  fill(0, 0, 0, 180);
  rectMode(CENTER);
  rect(0, barY, barWidth + 2, barHeight + 2);

  // HPバー（赤→緑）
  const barColor = lerpColor(color(255, 0, 0), color(0, 255, 0), hpRatio);
  fill(barColor);
  rectMode(CORNER);
  rect(-barWidth * 0.5, barY - barHeight * 0.5, barWidth * hpRatio, barHeight);

  pop();
}
