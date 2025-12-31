// ドラッグ&ドロップの共通処理

function setupEquipmentSlotDragAndDrop(slot, index) {
  slot.setAttribute("draggable", "true");

  slot.addEventListener("dragstart", (event) => {
    if (!GameState.inventoryState.equipmentSlots[index]) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", `equipment:${index}`);
  });

  slot.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    if (!data) {
      return;
    }
    const parts = data.split(":");
    if (parts.length !== 2) {
      return;
    }
    const sourceType = parts[0];
    const sourceIndex = parseInt(parts[1], 10);
    if (Number.isNaN(sourceIndex)) {
      return;
    }

    let item = null;
    if (sourceType === "inventory") {
      item = GameState.inventoryState.inventorySlots[sourceIndex];
    } else if (sourceType === "equipment") {
      item = GameState.inventoryState.equipmentSlots[sourceIndex];
    }
    if (!item) {
      return;
    }

    const currentEquip = GameState.inventoryState.equipmentSlots[index];
    GameState.inventoryState.equipmentSlots[index] = item;

    if (sourceType === "inventory") {
      GameState.inventoryState.inventorySlots[sourceIndex] = currentEquip || null;
    } else {
      GameState.inventoryState.equipmentSlots[sourceIndex] = currentEquip || null;
    }

    updateSidebarUI();
  });
}

function setupInventorySlotDragAndDrop(slot, index) {
  slot.setAttribute("draggable", "true");

  slot.addEventListener("dragstart", (event) => {
    if (!GameState.inventoryState.inventorySlots[index]) {
      event.preventDefault();
      return;
    }
    event.dataTransfer.setData("text/plain", `inventory:${index}`);
  });

  slot.addEventListener("dragover", (event) => {
    event.preventDefault();
  });

  slot.addEventListener("drop", (event) => {
    event.preventDefault();
    const data = event.dataTransfer.getData("text/plain");
    if (!data) {
      return;
    }
    const parts = data.split(":");
    if (parts.length !== 2) {
      return;
    }
    const sourceType = parts[0];
    const sourceIndex = parseInt(parts[1], 10);
    if (Number.isNaN(sourceIndex)) {
      return;
    }

    let item = null;
    if (sourceType === "inventory") {
      item = GameState.inventoryState.inventorySlots[sourceIndex];
    } else if (sourceType === "equipment") {
      item = GameState.inventoryState.equipmentSlots[sourceIndex];
    } else if (sourceType === "chest") {
      const chest = getActiveChest();
      if (!chest) {
        return;
      }
      item = chest.storage[sourceIndex];
    }
    if (!item) {
      return;
    }

    if (sourceType === "chest") {
      const chest = getActiveChest();
      if (!chest) {
        return;
      }
      if (moveChestItemToInventory(chest, sourceIndex, index)) {
        updateSidebarUI();
        renderChestSlots(chest);
      }
      return;
    }

    const currentItem = GameState.inventoryState.inventorySlots[index];
    GameState.inventoryState.inventorySlots[index] = item;

    if (sourceType === "inventory") {
      GameState.inventoryState.inventorySlots[sourceIndex] = currentItem || null;
    } else {
      if (currentItem) {
        GameState.inventoryState.equipmentSlots[sourceIndex] = currentItem;
      } else {
        GameState.inventoryState.equipmentSlots[sourceIndex] = null;
      }
    }

    updateSidebarUI();
  });
}
