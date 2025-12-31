// パーティクル処理
function updateParticles() {
  for (let i = GameState.effects.particles.length - 1; i >= 0; i -= 1) {
    const p = GameState.effects.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += PARTICLE_GRAVITY;
    p.life -= 1;
    if (p.life <= 0) {
      GameState.effects.particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  noStroke();
  for (let i = 0; i < GameState.effects.particles.length; i += 1) {
    const p = GameState.effects.particles[i];
    const alpha = map(p.life, 0, p.maxLife, 0, 255);
    fill(p.r, p.g, p.b, alpha);
    rect(p.x, p.y, p.size, p.size);
  }
}

function createBlockParticles(col, row, blockType) {
  const colors = BlockColors[blockType];
  if (!colors) {
    return;
  }
  const base = color(colors.main);
  for (let i = 0; i < PARTICLE_COUNT; i += 1) {
    GameState.effects.particles.push({
      x: col * GameState.worldState.tileSize + random(GameState.worldState.tileSize),
      y: row * GameState.worldState.tileSize + random(GameState.worldState.tileSize),
      vx: random(PARTICLE_VX_MIN, PARTICLE_VX_MAX),
      vy: random(PARTICLE_VY_MIN, PARTICLE_VY_MAX),
      size: random(PARTICLE_SIZE_MIN, PARTICLE_SIZE_MAX),
      r: red(base),
      g: green(base),
      b: blue(base),
      life: PARTICLE_LIFE,
      maxLife: PARTICLE_LIFE,
    });
  }
}
