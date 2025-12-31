// オーバーレイUI関連

// 収納箱と作業机のオーバーレイUIを初期化する
function initOverlayUI() {
  const gameRoot = document.getElementById("game");
  if (!gameRoot) {
    return;
  }

  uiElements.chestOverlay = createChestOverlay(gameRoot);
  uiElements.workbenchOverlay = createWorkbenchOverlay(gameRoot);
  syncChestSlotMetrics();
}

// すべてのオーバーレイを閉じる
function closeAllOverlays() {
  closeChestUI();
  closeWorkbenchUI();
}

// いずれかのオーバーレイが開いているか確認する
function isOverlayOpen() {
  const chestOpen = uiElements.chestOverlay && !uiElements.chestOverlay.classList.contains("hidden");
  const workbenchOpen = uiElements.workbenchOverlay && !uiElements.workbenchOverlay.classList.contains("hidden");
  return chestOpen || workbenchOpen;
}
