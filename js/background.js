// 背景演出
function initBackground() {
  GameState.backgroundStars = [];
  GameState.clouds = [];
  for (let i = 0; i < 120; i += 1) {
    GameState.backgroundStars.push({
      x: random(GameState.worldCols * GameState.tileSize),
      y: random(GameState.worldRows * GameState.tileSize * 0.4),
      size: random(1, 3),
      twinkle: random(TWO_PI),
    });
  }

  for (let i = 0; i < 12; i += 1) {
    GameState.clouds.push({
      x: random(GameState.worldCols * GameState.tileSize),
      y: random(40, 200),
      width: random(120, 240),
      speed: random(0.1, 0.25),
    });
  }
}

// 昼夜サイクルの背景を描く
function drawBackground() {
  const skyLimitY = 30 * GameState.tileSize;
  const skyLimitScreenY = skyLimitY - GameState.cameraPos.y;
  const dayProgress = sin(GameState.timeOfDay * TWO_PI) * 0.5 + 0.5;
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
  if (dayProgress > 0.55) {
    return;
  }
  const starAlpha = map(dayProgress, 0, 0.55, 255, 0);
  noStroke();
  fill(255, 255, 255, starAlpha);
  for (let i = 0; i < GameState.backgroundStars.length; i += 1) {
    const star = GameState.backgroundStars[i];
    const twinkle = sin(frameCount * 0.05 + star.twinkle) * 0.3 + 0.7;
    const screenX = star.x - GameState.cameraPos.x * 0.1;
    const screenY = star.y - GameState.cameraPos.y * 0.1;
    if (screenX > -10 && screenX < width + 10 && screenY > -10 && screenY < min(height, skyLimitY)) {
      rect(screenX, screenY, star.size * twinkle, star.size * twinkle);
    }
  }
}

// 太陽と月を描く
function drawSunAndMoon(dayProgress, skyLimitY) {
  const orbitY = map(dayProgress, 0, 1, skyLimitY + 60, -60);
  const orbitX = width * 0.8;

  if (dayProgress > 0.35) {
    noStroke();
    fill(255, 220, 120);
    ellipse(orbitX, orbitY, 60, 60);
    fill(255, 220, 120, 120);
    ellipse(orbitX, orbitY, 80, 80);
  } else {
    noStroke();
    fill(230, 230, 250);
    ellipse(orbitX, skyLimitY - orbitY, 42, 42);
  }
}

// 雲を描いて流す
function drawClouds(dayProgress, skyLimitY) {
  const cloudAlpha = 50 + dayProgress * 140;
  noStroke();
  fill(255, 255, 255, cloudAlpha);

  for (let i = 0; i < GameState.clouds.length; i += 1) {
    const cloud = GameState.clouds[i];
    cloud.x += cloud.speed;
    if (cloud.x > GameState.worldCols * GameState.tileSize + cloud.width) {
      cloud.x = -cloud.width;
    }
    const screenX = cloud.x - GameState.cameraPos.x * 0.3;
    const screenY = cloud.y - GameState.cameraPos.y * 0.1;
    if (screenX > -cloud.width && screenX < width + cloud.width && screenY < skyLimitY) {
      ellipse(screenX, screenY, cloud.width, cloud.width * 0.4);
      ellipse(screenX - cloud.width * 0.25, screenY + 10, cloud.width * 0.6, cloud.width * 0.3);
      ellipse(screenX + cloud.width * 0.3, screenY + 5, cloud.width * 0.5, cloud.width * 0.25);
    }
  }
}
