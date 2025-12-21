// パーティクル処理
function updateParticles() {
  for (let i = GameState.particles.length - 1; i >= 0; i -= 1) {
    const p = GameState.particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life -= 1;
    if (p.life <= 0) {
      GameState.particles.splice(i, 1);
    }
  }
}

function drawParticles() {
  noStroke();
  for (let i = 0; i < GameState.particles.length; i += 1) {
    const p = GameState.particles[i];
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
  for (let i = 0; i < 8; i += 1) {
    GameState.particles.push({
      x: col * GameState.tileSize + random(GameState.tileSize),
      y: row * GameState.tileSize + random(GameState.tileSize),
      vx: random(-1.8, 1.8),
      vy: random(-3.2, -1.2),
      size: random(3, 6),
      r: red(base),
      g: green(base),
      b: blue(base),
      life: 28,
      maxLife: 28,
    });
  }
}
