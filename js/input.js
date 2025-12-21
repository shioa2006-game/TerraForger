// 入力処理
function keyPressed() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) {
    GameState.keyState.left = true;
  }
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) {
    GameState.keyState.right = true;
  }
  if (key === "w" || key === "W" || key === " " || keyCode === UP_ARROW) {
    GameState.keyState.up = true;
  }
  if (key >= "1" && key <= "5") {
    const index = parseInt(key, 10) - 1;
    if (index >= 0 && index < 5) {
      GameState.selectedEquipIndex = index;
    }
  }
  if (key === "r" || key === "R") {
    noiseSeed(Date.now());
    initWorld();
    initPlayer();
    initInventory();
    initBackground();
    GameState.particles = [];
  }
}

function keyReleased() {
  if (key === "a" || key === "A" || keyCode === LEFT_ARROW) {
    GameState.keyState.left = false;
  }
  if (key === "d" || key === "D" || keyCode === RIGHT_ARROW) {
    GameState.keyState.right = false;
  }
  if (key === "w" || key === "W" || key === " " || keyCode === UP_ARROW) {
    GameState.keyState.up = false;
  }
}

function mousePressed() {
  const target = screenToWorld(mouseX, mouseY);
  const col = floor(target.x / GameState.tileSize);
  const row = floor(target.y / GameState.tileSize);

  if (!isInsideWorld(col, row)) {
    return;
  }

  const distance = dist(
    GameState.player.x,
    GameState.player.y,
    col * GameState.tileSize + GameState.tileSize * 0.5,
    row * GameState.tileSize + GameState.tileSize * 0.5
  );
  if (distance > GameState.reachRange * GameState.tileSize) {
    return;
  }

  if (mouseButton === LEFT) {
    if (GameState.world[col][row] !== BlockType.AIR) {
      const blockType = GameState.world[col][row];
      GameState.world[col][row] = BlockType.AIR;
      createBlockParticles(col, row, blockType);
      if (PlaceableBlocks.includes(blockType)) {
        GameState.inventory[blockType] = (GameState.inventory[blockType] || 0) + 1;
      }
    }
  } else if (mouseButton === RIGHT) {
    if (GameState.world[col][row] === BlockType.AIR && !isPlayerInside(col, row)) {
      const selectedItem = getSelectedEquipment();
      if (selectedItem && selectedItem.kind === ItemKind.BLOCK) {
        const blockType = selectedItem.blockType;
        if (GameState.inventory[blockType] > 0) {
          GameState.world[col][row] = blockType;
          GameState.inventory[blockType] -= 1;
        }
      }
    }
  }
}

function mouseWheel(event) {
  if (event.delta > 0) {
    GameState.selectedEquipIndex = (GameState.selectedEquipIndex + 1) % 5;
  } else {
    GameState.selectedEquipIndex = (GameState.selectedEquipIndex - 1 + 5) % 5;
  }
  return false;
}

function isPlayerInside(col, row) {
  const blockX = col * GameState.tileSize;
  const blockY = row * GameState.tileSize;
  const halfW = GameState.player.w * 0.5;
  const halfH = GameState.player.h * 0.5;

  return !(
    GameState.player.x + halfW <= blockX ||
    GameState.player.x - halfW >= blockX + GameState.tileSize ||
    GameState.player.y + halfH <= blockY ||
    GameState.player.y - halfH >= blockY + GameState.tileSize
  );
}
