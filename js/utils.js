// 共通ユーティリティ
function screenToWorld(screenX, screenY) {
  return {
    x: screenX + GameState.camera.pos.x,
    y: screenY + GameState.camera.pos.y,
  };
}
