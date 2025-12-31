// 収納箱UI関連
// 収納箱オーバーレイを作成する
function createChestOverlay(root) {
  const overlay = document.createElement("div");
  overlay.className = "overlay hidden";
  overlay.addEventListener("click", (event) => {
    if (event.target === overlay) {
      closeChestUI();
    }
  });

  const panel = document.createElement("div");
  panel.className = "overlay-panel";

  const title = document.createElement("h3");
  title.className = "overlay-title";
  title.textContent = "収納箱";

  const grid = document.createElement("div");
  grid.className = "chest-grid";
  uiElements.chestSlots = [];
  for (let i = 0; i < CHEST_SLOT_COUNT; i += 1) {
    const slot = document.createElement("div");
    slot.className = "slot";

    const icon = document.createElement("div");
    icon.className = "slot-icon";

    const count = document.createElement("span");
    count.className = "slot-count";

    slot.appendChild(icon);
    slot.appendChild(count);
    grid.appendChild(slot);
    uiElements.chestSlots.push({ slot, icon, count, index: i });

    slot.setAttribute("draggable", "true");
    slot.addEventListener("dragstart", (event) => {
      const chest = getActiveChest();
      if (!chest || !chest.storage[i]) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", `chest:${i}`);
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
      const chest = getActiveChest();
      if (!chest) {
        return;
      }
      if (sourceType === "inventory") {
        if (moveInventoryItemToChest(sourceIndex, i)) {
          updateSidebarUI();
          renderChestSlots(chest);
        }
      } else if (sourceType === "chest") {
        if (moveChestItemWithinChest(chest, sourceIndex, i)) {
          renderChestSlots(chest);
        }
      }
    });
  }

  panel.appendChild(title);
  panel.appendChild(grid);
  overlay.appendChild(panel);
  root.appendChild(overlay);
  return overlay;
}

// 収納箱UIを開く
function openChestUI(placeable) {
  if (!uiElements.chestOverlay) {
    return;
  }
  GameState.overlayState.activePlaceable = placeable;
  renderChestSlots(placeable);
  uiElements.chestOverlay.classList.remove("hidden");
}

// 収納箱UIを閉じる
function closeChestUI() {
  if (!uiElements.chestOverlay) {
    return;
  }
  uiElements.chestOverlay.classList.add("hidden");
  GameState.overlayState.activePlaceable = null;
}

// 収納箱のスロット表示を更新する
function renderChestSlots(placeable) {
  const slots = uiElements.chestSlots;
  const storage = placeable.storage || [];
  for (let i = 0; i < slots.length; i += 1) {
    const entry = slots[i];
    const item = storage[i] || null;
    entry.icon.style.background = "transparent";
    entry.icon.style.backgroundImage = "";
    entry.icon.style.width = "36px";
    entry.icon.style.height = "36px";
    entry.count.textContent = "";
    if (!item) {
      entry.icon.style.opacity = UI_ICON_EMPTY_OPACITY;
      continue;
    }
    entry.icon.style.opacity = UI_ICON_FULL_OPACITY;
    if (isStackableItem(item)) {
      setItemSlotIcon(entry.icon, item.itemId);
      entry.count.textContent = String(getChestItemCount(placeable, item.itemId));
    } else if (item.kind === ItemKind.TOOL) {
      setToolSlotIcon(entry.icon, item.tool);
      entry.count.textContent = UI_TOOL_COUNT_TEXT;
    }
  }
}

// 右HUDの所持アイテムと同じサイズを収納箱に反映する
function syncChestSlotMetrics() {
  if (!uiElements.chestOverlay || uiElements.inventorySlots.length === 0) {
    return;
  }
  const slot = uiElements.inventorySlots[0].slot;
  const rect = slot.getBoundingClientRect();
  const gridStyle = getComputedStyle(uiElements.inventoryGrid);
  const gap = gridStyle.columnGap || gridStyle.gap || "8px";
  uiElements.chestOverlay.style.setProperty("--inventory-slot-width", `${rect.width}px`);
  uiElements.chestOverlay.style.setProperty("--inventory-slot-height", `${rect.height}px`);
  uiElements.chestOverlay.style.setProperty("--inventory-slot-gap", gap);
}

// 現在開いている収納箱を取得する
function getActiveChest() {
  if (GameState.overlayState.activePlaceable && GameState.overlayState.activePlaceable.blockType === BlockType.CHEST) {
    return GameState.overlayState.activePlaceable;
  }
  return null;
}

// 収納箱内のアイテム数を取得する
function getChestItemCount(placeable, itemId) {
  if (!placeable.storageCounts) {
    return 0;
  }
  return placeable.storageCounts[itemId] || 0;
}

// 収納箱内のアイテム数を設定する
function setChestItemCount(placeable, itemId, count) {
  if (!placeable.storageCounts) {
    placeable.storageCounts = {};
  }
  if (count <= 0) {
    delete placeable.storageCounts[itemId];
  } else {
    placeable.storageCounts[itemId] = count;
  }
}

// 収納箱内でアイテムIDのスロットを探す
function findChestSlotByItem(placeable, itemId) {
  const storage = placeable.storage || [];
  for (let i = 0; i < storage.length; i += 1) {
    const item = storage[i];
    if (item && isStackableItem(item) && item.itemId === itemId) {
      return i;
    }
  }
  return -1;
}

// 所持アイテムから収納箱へ移動する
function moveInventoryItemToChest(sourceIndex, targetIndex) {
  const chest = getActiveChest();
  if (!chest) {
    return false;
  }
  const sourceItem = GameState.inventoryState.inventorySlots[sourceIndex];
  if (!sourceItem) {
    return false;
  }
  const targetItem = chest.storage[targetIndex];

  if (isStackableItem(sourceItem)) {
    const count = getItemCount(sourceItem.itemId);
    if (count <= 0) {
      return false;
    }
    const existingIndex = findChestSlotByItem(chest, sourceItem.itemId);
    if (existingIndex !== -1 && existingIndex !== targetIndex) {
      return false;
    }
    if (targetItem && (!isStackableItem(targetItem) || targetItem.itemId !== sourceItem.itemId)) {
      return false;
    }
    chest.storage[targetIndex] = { kind: sourceItem.kind, itemId: sourceItem.itemId };
    const current = getChestItemCount(chest, sourceItem.itemId);
    setChestItemCount(chest, sourceItem.itemId, current + count);
    addItemCount(sourceItem.itemId, -count);
    GameState.inventoryState.inventorySlots[sourceIndex] = null;
    return true;
  }

  if (targetItem) {
    return false;
  }
  chest.storage[targetIndex] = sourceItem;
  GameState.inventoryState.inventorySlots[sourceIndex] = null;
  return true;
}

// 収納箱から所持アイテムへ移動する
function moveChestItemToInventory(chest, sourceIndex, targetIndex) {
  const sourceItem = chest.storage[sourceIndex];
  if (!sourceItem) {
    return false;
  }
  const targetItem = GameState.inventoryState.inventorySlots[targetIndex];

  if (isStackableItem(sourceItem)) {
    const count = getChestItemCount(chest, sourceItem.itemId);
    if (count <= 0) {
      return false;
    }
    const existingIndex = findInventorySlotByItem(sourceItem.itemId);
    if (existingIndex !== -1 && existingIndex !== targetIndex) {
      return false;
    }
    if (targetItem && (!isStackableItem(targetItem) || targetItem.itemId !== sourceItem.itemId)) {
      return false;
    }
    if (!targetItem) {
      GameState.inventoryState.inventorySlots[targetIndex] = { kind: sourceItem.kind, itemId: sourceItem.itemId };
    }
    addItemCount(sourceItem.itemId, count);
    chest.storage[sourceIndex] = null;
    setChestItemCount(chest, sourceItem.itemId, 0);
    return true;
  }

  if (targetItem) {
    return false;
  }
  GameState.inventoryState.inventorySlots[targetIndex] = sourceItem;
  chest.storage[sourceIndex] = null;
  return true;
}

// 収納箱内でスロットを移動する
function moveChestItemWithinChest(chest, sourceIndex, targetIndex) {
  if (sourceIndex === targetIndex) {
    return false;
  }
  const sourceItem = chest.storage[sourceIndex];
  if (!sourceItem) {
    return false;
  }
  const targetItem = chest.storage[targetIndex];
  chest.storage[targetIndex] = sourceItem;
  chest.storage[sourceIndex] = targetItem || null;
  return true;
}
