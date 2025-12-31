// 背景演出
function initBackground() {
  GameState.environment.backgroundStars = [];
  GameState.environment.clouds = [];
  for (let i = 0; i < STAR_COUNT; i += 1) {
    GameState.environment.backgroundStars.push({
      x: random(GameState.worldState.worldCols * GameState.worldState.tileSize),
      y: random(GameState.worldState.worldRows * GameState.worldState.tileSize * 0.4),
      size: random(STAR_SIZE_MIN, STAR_SIZE_MAX),
      twinkle: random(TWO_PI),
    });
  }

  for (let i = 0; i < CLOUD_COUNT; i += 1) {
    GameState.environment.clouds.push({
      x: random(GameState.worldState.worldCols * GameState.worldState.tileSize),
      y: random(CLOUD_Y_MIN, CLOUD_Y_MAX),
      width: random(CLOUD_WIDTH_MIN, CLOUD_WIDTH_MAX),
      speed: random(CLOUD_SPEED_MIN, CLOUD_SPEED_MAX),
    });
  }
}

// 昼夜サイクルの背景を描く
function drawBackground() {
  const skyLimitY = SKY_LIMIT_ROW * GameState.worldState.tileSize;
  const skyLimitScreenY = skyLimitY - GameState.camera.pos.y;
  const dayProgress = sin(GameState.environment.timeOfDay * TWO_PI) * 0.5 + 0.5;
  const skyTop = lerpColor(color(12, 12, 40), color(140, 210, 235), dayProgress);
  const skyBottom = lerpColor(color(30, 24, 60), color(255, 210, 170), dayProgress);

  const skyEnd = constrain(skyLimitScreenY, 0, height);
  for (let y = 0; y < skyEnd; y += 1) {
    const t = map(y, 0, max(skyEnd, 1), 0, 1);
    stroke(lerpColor(skyTop, skyBottom, t));
    line(0, y, width, y);
  }

  drawCaveBackground(skyEnd);
  drawStars(dayProgress, skyEnd);
  drawSunAndMoon(dayProgress, skyEnd);
  drawClouds(dayProgress, skyEnd);
}

// 地下の暗い壁を描く
function drawCaveBackground(startY) {
  const caveTop = color(28, 30, 40);
  const caveBottom = color(15, 16, 24);
  for (let y = max(startY, 0); y < height; y += 1) {
    const t = map(y, startY, height, 0, 1);
    stroke(lerpColor(caveTop, caveBottom, t));
    line(0, y, width, y);
  }
}

// 夜に星を描く
function drawStars(dayProgress, skyLimitY) {
  if (dayProgress > DAY_PROGRESS_NIGHT_LIMIT) {
    return;
  }
  const starAlpha = map(dayProgress, 0, DAY_PROGRESS_NIGHT_LIMIT, 255, 0);
  noStroke();
  fill(255, 255, 255, starAlpha);
  for (let i = 0; i < GameState.environment.backgroundStars.length; i += 1) {
    const star = GameState.environment.backgroundStars[i];
    const twinkle = sin(frameCount * STAR_TWINKLE_SPEED + star.twinkle) * STAR_TWINKLE_SCALE + STAR_TWINKLE_BASE;
    const screenX = star.x - GameState.camera.pos.x * STAR_PARALLAX;
    const screenY = star.y - GameState.camera.pos.y * STAR_PARALLAX;
    if (
      screenX > -STAR_BOUNDS_MARGIN &&
      screenX < width + STAR_BOUNDS_MARGIN &&
      screenY > -STAR_BOUNDS_MARGIN &&
      screenY < min(height, skyLimitY)
    ) {
      rect(screenX, screenY, star.size * twinkle, star.size * twinkle);
    }
  }
}

// 太陽と月を描く
function drawSunAndMoon(dayProgress, skyLimitY) {
  const orbitY = map(dayProgress, 0, 1, skyLimitY + SUN_ORBIT_MARGIN, -SUN_ORBIT_MARGIN);
  const orbitX = width * SUN_ORBIT_X;

  if (dayProgress > SUN_DAY_START) {
    noStroke();
    fill(255, 220, 120);
    ellipse(orbitX, orbitY, SUN_SIZE, SUN_SIZE);
    fill(255, 220, 120, 120);
    ellipse(orbitX, orbitY, SUN_GLOW_SIZE, SUN_GLOW_SIZE);
  } else {
    noStroke();
    fill(230, 230, 250);
    ellipse(orbitX, skyLimitY - orbitY, MOON_SIZE, MOON_SIZE);
  }
}

// 雲を描いて流す
function drawClouds(dayProgress, skyLimitY) {
  const cloudAlpha = CLOUD_ALPHA_BASE + dayProgress * CLOUD_ALPHA_SCALE;
  noStroke();
  fill(255, 255, 255, cloudAlpha);

  for (let i = 0; i < GameState.environment.clouds.length; i += 1) {
    const cloud = GameState.environment.clouds[i];
    cloud.x += cloud.speed;
    if (cloud.x > GameState.worldState.worldCols * GameState.worldState.tileSize + cloud.width) {
      cloud.x = -cloud.width;
    }
    const screenX = cloud.x - GameState.camera.pos.x * CLOUD_PARALLAX_X;
    const screenY = cloud.y - GameState.camera.pos.y * CLOUD_PARALLAX_Y;
    if (screenX > -cloud.width && screenX < width + cloud.width && screenY < skyLimitY) {
      ellipse(screenX, screenY, cloud.width, cloud.width * 0.4);
      ellipse(screenX - cloud.width * 0.25, screenY + 10, cloud.width * 0.6, cloud.width * 0.3);
      ellipse(screenX + cloud.width * 0.3, screenY + 5, cloud.width * 0.5, cloud.width * 0.25);
    }
  }
}
