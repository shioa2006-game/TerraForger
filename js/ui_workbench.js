// 作業机UI関連

// 作業机オーバーレイを作成する
function createWorkbenchOverlay(root) {
  const overlay = document.createElement("div");
  overlay.className = "overlay hidden";
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeWorkbenchUI();
    }
  });

  const panel = document.createElement("div");
  panel.className = "overlay-panel";

  const title = document.createElement("h3");
  title.className = "overlay-title";
  title.textContent = "作業机";

  const note = document.createElement("p");
  note.className = "overlay-note";
  note.textContent = "クラフトは準備中です。";

  panel.appendChild(title);
  panel.appendChild(note);
  overlay.appendChild(panel);
  root.appendChild(overlay);
  return overlay;
}

// 作業机UIを開く
function openWorkbenchUI(placeable) {
  if (!uiElements.workbenchOverlay) {
    return;
  }
  GameState.overlayState.activePlaceable = placeable;
  uiElements.workbenchOverlay.classList.remove("hidden");
}

// 作業机UIを閉じる
function closeWorkbenchUI() {
  if (!uiElements.workbenchOverlay) {
    return;
  }
  uiElements.workbenchOverlay.classList.add("hidden");
  GameState.overlayState.activePlaceable = null;
}
