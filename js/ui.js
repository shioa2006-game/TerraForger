// UI初期化の入口（状態参照 → 各UI生成 → オーバーレイ生成の順）
function initUI() {
  uiElements.coordText = document.getElementById("coordText");
  uiElements.reachText = document.getElementById("reachText");
  uiElements.inventoryGrid = document.getElementById("inventoryGrid");
  uiElements.equipmentSlots = [];
  uiElements.inventorySlots = [];

  initEquipmentSlots();
  initInventoryGrid();
  initOverlayUI();
  initLeftSidebar();
}