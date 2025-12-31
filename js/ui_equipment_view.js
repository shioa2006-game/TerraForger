// 装備UI生成
function initEquipmentSlots() {
  const equipRoot = document.getElementById("equipmentSlots");
  if (!equipRoot) {
    return;
  }

  const equipNodes = equipRoot.querySelectorAll(".slot");
  equipNodes.forEach((slot, index) => {
    if (!slot.querySelector(".slot-icon")) {
      const icon = document.createElement("div");
      icon.className = "slot-icon";
      const count = document.createElement("span");
      count.className = "slot-count";
      slot.appendChild(icon);
      slot.appendChild(count);
    }
    setupEquipmentSlotDragAndDrop(slot, index);

    slot.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const item = GameState.inventoryState.equipmentSlots[index];
      if (!item) {
        return;
      }
      const emptyIndex = findEmptyInventoryIndex();
      if (emptyIndex === -1) {
        return;
      }
      GameState.inventoryState.inventorySlots[emptyIndex] = item;
      GameState.inventoryState.equipmentSlots[index] = null;
      updateSidebarUI();
    });

    const icon = slot.querySelector(".slot-icon");
    const count = slot.querySelector(".slot-count");
    uiElements.equipmentSlots.push({ slot, icon, count });
  });
}
