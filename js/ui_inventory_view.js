// インベントリUI生成
function initInventoryGrid() {
  if (!uiElements.inventoryGrid) {
    return;
  }
  uiElements.inventoryGrid.innerHTML = "";

  for (let i = 0; i < INVENTORY_SLOT_COUNT; i += 1) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);

    const icon = document.createElement("div");
    icon.className = "slot-icon";

    const count = document.createElement("span");
    count.className = "slot-count";

    slot.appendChild(icon);
    slot.appendChild(count);

    setupInventorySlotDragAndDrop(slot, i);

    uiElements.inventoryGrid.appendChild(slot);
    uiElements.inventorySlots.push({ slot, icon, count, index: i });
  }
}
