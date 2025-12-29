// UI関連
const uiElements = {
  coordText: null,
  reachText: null,
  equipmentSlots: [],
  inventoryGrid: null,
  inventorySlots: [],
  chestOverlay: null,
  chestSlots: [],
  workbenchOverlay: null,
};
const ITEM_ICON_SIZE = 36;
const ITEM_ICON_GAP = 6;
const DROP_ICON_GAP = 6;
const CHEST_COLUMNS = 10;
const CHEST_ROWS = 6;
const CHEST_SLOT_COUNT = CHEST_COLUMNS * CHEST_ROWS;

function initInventory() {
  GameState.inventory = {};
  // 収納箱と作業机を初期所持アイテムに追加
  GameState.inventory[ItemId.CHEST] = 1;
  GameState.inventory[ItemId.WORKBENCH] = 1;

  GameState.inventorySlots = new Array(30).fill(null);
  // 収納箱と作業机のスロットを追加
  GameState.inventorySlots[0] = { kind: ItemKind.PLACEABLE, itemId: ItemId.CHEST };
  GameState.inventorySlots[1] = { kind: ItemKind.PLACEABLE, itemId: ItemId.WORKBENCH };

  GameState.equipmentSlots = [
    { kind: ItemKind.TOOL, tool: ToolType.PICKAXE },
    { kind: ItemKind.TOOL, tool: ToolType.AXE },
    { kind: ItemKind.TOOL, tool: ToolType.HAMMER },
    { kind: ItemKind.TOOL, tool: ToolType.SWORD },
    null,
  ];
}

// 右カラムのUIを初期化する
function initUI() {
  uiElements.coordText = document.getElementById("coordText");
  uiElements.reachText = document.getElementById("reachText");
  uiElements.inventoryGrid = document.getElementById("inventoryGrid");
  uiElements.equipmentSlots = [];
  uiElements.inventorySlots = [];

  initEquipmentSlots();
  initInventoryGrid();
  initOverlayUI();
}

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
    slot.setAttribute("draggable", "true");

    slot.addEventListener("dragstart", (event) => {
      if (!GameState.equipmentSlots[index]) {
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
        item = GameState.inventorySlots[sourceIndex];
      } else if (sourceType === "equipment") {
        item = GameState.equipmentSlots[sourceIndex];
      }
      if (!item) {
        return;
      }

      const currentEquip = GameState.equipmentSlots[index];
      GameState.equipmentSlots[index] = item;

      if (sourceType === "inventory") {
        GameState.inventorySlots[sourceIndex] = currentEquip || null;
      } else {
        GameState.equipmentSlots[sourceIndex] = currentEquip || null;
      }

      updateSidebarUI();
    });

    slot.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      const item = GameState.equipmentSlots[index];
      if (!item) {
        return;
      }
      const emptyIndex = findEmptyInventoryIndex();
      if (emptyIndex === -1) {
        return;
      }
      GameState.inventorySlots[emptyIndex] = item;
      GameState.equipmentSlots[index] = null;
      updateSidebarUI();
    });

    const icon = slot.querySelector(".slot-icon");
    const count = slot.querySelector(".slot-count");
    uiElements.equipmentSlots.push({ slot, icon, count });
  });
}

function initInventoryGrid() {
  if (!uiElements.inventoryGrid) {
    return;
  }
  uiElements.inventoryGrid.innerHTML = "";

  for (let i = 0; i < 30; i += 1) {
    const slot = document.createElement("div");
    slot.className = "slot";
    slot.dataset.index = String(i);

    const icon = document.createElement("div");
    icon.className = "slot-icon";

    const count = document.createElement("span");
    count.className = "slot-count";

    slot.appendChild(icon);
    slot.appendChild(count);

    slot.addEventListener("dragstart", (event) => {
      if (!GameState.inventorySlots[i]) {
        event.preventDefault();
        return;
      }
      event.dataTransfer.setData("text/plain", `inventory:${i}`);
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
        item = GameState.inventorySlots[sourceIndex];
      } else if (sourceType === "equipment") {
        item = GameState.equipmentSlots[sourceIndex];
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
        if (moveChestItemToInventory(chest, sourceIndex, i)) {
          updateSidebarUI();
          renderChestSlots(chest);
        }
        return;
      }

      const currentItem = GameState.inventorySlots[i];
      GameState.inventorySlots[i] = item;

      if (sourceType === "inventory") {
        GameState.inventorySlots[sourceIndex] = currentItem || null;
      } else {
        if (currentItem) {
          GameState.equipmentSlots[sourceIndex] = currentItem;
        } else {
          GameState.equipmentSlots[sourceIndex] = null;
        }
      }

      updateSidebarUI();
    });

    uiElements.inventoryGrid.appendChild(slot);
    uiElements.inventorySlots.push({ slot, icon, count, index: i });
  }
}

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

function drawHud() {
  updateSidebarUI();
}

// 右カラムのUIを更新する
function updateSidebarUI() {
  if (!uiElements.coordText || !uiElements.reachText) {
    return;
  }

  const playerCol = floor(GameState.player.x / GameState.tileSize);
  const playerRow = floor(GameState.player.y / GameState.tileSize);
  uiElements.coordText.textContent = "座標: " + playerCol + ", " + playerRow;
  uiElements.reachText.textContent = "リーチ範囲: " + GameState.reachRange + " ブロック";

  updateEquipmentSlots();
  updateInventorySlots();
}

function updateEquipmentSlots() {
  for (let i = 0; i < uiElements.equipmentSlots.length; i += 1) {
    const entry = uiElements.equipmentSlots[i];
    const item = GameState.equipmentSlots[i];
    const selected = i === GameState.selectedEquipIndex;

    entry.slot.classList.toggle("selected", selected);
    entry.count.textContent = "";

    if (!item) {
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.opacity = "0.35";
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    // 所持数が0のアイテムはスロットから削除
    if (isStackableItem(item) && getItemCount(item.itemId) <= 0) {
      GameState.equipmentSlots[i] = null;
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.opacity = "0.35";
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    entry.slot.setAttribute("draggable", "true");

    if (isStackableItem(item)) {
      setItemSlotIcon(entry.icon, item.itemId);
      entry.icon.style.opacity = "1";
      entry.count.textContent = String(getItemCount(item.itemId));
    } else if (item.kind === ItemKind.TOOL) {
      const toolIndex = getToolSpriteIndex(item.tool);
      entry.icon.style.backgroundImage = "url('assets/items.png')";
      entry.icon.style.backgroundPosition = `-${toolIndex * (ITEM_ICON_SIZE + ITEM_ICON_GAP)}px 0px`;
      entry.icon.style.backgroundColor = "transparent";
      entry.icon.style.opacity = "1";
    }
  }
}

function updateInventorySlots() {
  for (let i = 0; i < uiElements.inventorySlots.length; i += 1) {
    const entry = uiElements.inventorySlots[i];
    const item = GameState.inventorySlots[i];

    if (!item) {
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.opacity = "0.35";
      entry.count.textContent = "";
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    // 所持数が0のアイテムはスロットから削除
    if (isStackableItem(item) && getItemCount(item.itemId) <= 0) {
      GameState.inventorySlots[i] = null;
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.opacity = "0.35";
      entry.count.textContent = "";
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    entry.slot.setAttribute("draggable", "true");
    if (isStackableItem(item)) {
      setItemSlotIcon(entry.icon, item.itemId);
      entry.icon.style.opacity = "1";
      entry.count.textContent = String(getItemCount(item.itemId));
    } else if (item.kind === ItemKind.TOOL) {
      const toolIndex = getToolSpriteIndex(item.tool);
      entry.icon.style.backgroundImage = "url('assets/items.png')";
      entry.icon.style.backgroundPosition = `-${toolIndex * (ITEM_ICON_SIZE + ITEM_ICON_GAP)}px 0px`;
      entry.icon.style.backgroundColor = "transparent";
      entry.icon.style.opacity = "1";
      entry.count.textContent = "1";
    }
  }
}

function findEmptyInventoryIndex() {
  for (let i = 0; i < GameState.inventorySlots.length; i += 1) {
    if (!GameState.inventorySlots[i]) {
      return i;
    }
  }
  return -1;
}

function getToolSpriteIndex(toolType) {
  if (toolType === ToolType.PICKAXE) {
    return 0;
  }
  if (toolType === ToolType.AXE) {
    return 1;
  }
  if (toolType === ToolType.HAMMER) {
    return 2;
  }
  return 3;
}

// 収納箱UIを開く
function openChestUI(placeable) {
  if (!uiElements.chestOverlay) {
    return;
  }
  GameState.activePlaceable = placeable;
  renderChestSlots(placeable);
  uiElements.chestOverlay.classList.remove("hidden");
}

// 収納箱UIを閉じる
function closeChestUI() {
  if (!uiElements.chestOverlay) {
    return;
  }
  uiElements.chestOverlay.classList.add("hidden");
  GameState.activePlaceable = null;
}

// 作業机UIを開く
function openWorkbenchUI(placeable) {
  if (!uiElements.workbenchOverlay) {
    return;
  }
  GameState.activePlaceable = placeable;
  uiElements.workbenchOverlay.classList.remove("hidden");
}

// 作業机UIを閉じる
function closeWorkbenchUI() {
  if (!uiElements.workbenchOverlay) {
    return;
  }
  uiElements.workbenchOverlay.classList.add("hidden");
  GameState.activePlaceable = null;
}

// すべてのオーバーレイを閉じる
function closeAllOverlays() {
  closeChestUI();
  closeWorkbenchUI();
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
    entry.count.textContent = "";
    if (!item) {
      entry.icon.style.opacity = "0.35";
      continue;
    }
    entry.icon.style.opacity = "1";
    if (isStackableItem(item)) {
      setItemSlotIcon(entry.icon, item.itemId);
      entry.count.textContent = String(getChestItemCount(placeable, item.itemId));
    } else if (item.kind === ItemKind.TOOL) {
      const toolIndex = getToolSpriteIndex(item.tool);
      entry.icon.style.backgroundImage = "url('assets/items.png')";
      entry.icon.style.backgroundPosition = `-${toolIndex * (ITEM_ICON_SIZE + ITEM_ICON_GAP)}px 0px`;
      entry.icon.style.backgroundColor = "transparent";
      entry.count.textContent = "1";
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

// いずれかのオーバーレイが開いているか確認する
function isOverlayOpen() {
  const chestOpen = uiElements.chestOverlay && !uiElements.chestOverlay.classList.contains("hidden");
  const workbenchOpen = uiElements.workbenchOverlay && !uiElements.workbenchOverlay.classList.contains("hidden");
  return chestOpen || workbenchOpen;
}

// 現在開いている収納箱を取得する
function getActiveChest() {
  if (GameState.activePlaceable && GameState.activePlaceable.blockType === BlockType.CHEST) {
    return GameState.activePlaceable;
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

// 所持アイテム内でアイテムIDのスロットを探す
function findInventorySlotByItem(itemId) {
  for (let i = 0; i < GameState.inventorySlots.length; i += 1) {
    const item = GameState.inventorySlots[i];
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
  const sourceItem = GameState.inventorySlots[sourceIndex];
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
    GameState.inventorySlots[sourceIndex] = null;
    return true;
  }

  if (targetItem) {
    return false;
  }
  chest.storage[targetIndex] = sourceItem;
  GameState.inventorySlots[sourceIndex] = null;
  return true;
}

// 収納箱から所持アイテムへ移動する
function moveChestItemToInventory(chest, sourceIndex, targetIndex) {
  const sourceItem = chest.storage[sourceIndex];
  if (!sourceItem) {
    return false;
  }
  const targetItem = GameState.inventorySlots[targetIndex];

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
      GameState.inventorySlots[targetIndex] = { kind: sourceItem.kind, itemId: sourceItem.itemId };
    }
    addItemCount(sourceItem.itemId, count);
    chest.storage[sourceIndex] = null;
    setChestItemCount(chest, sourceItem.itemId, 0);
    return true;
  }

  if (targetItem) {
    return false;
  }
  GameState.inventorySlots[targetIndex] = sourceItem;
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

// 初期所持数を調整する
function getInitialItemCount(itemId) {
  if (itemId === ItemId.CHEST || itemId === ItemId.WORKBENCH) {
    return 5;
  }
  return 30;
}

// アイテム用のアイコン表示を統一する
function setItemSlotIcon(icon, itemId) {
  const itemDef = getItemDef(itemId);
  if (!itemDef) {
    icon.style.background = "transparent";
    icon.style.backgroundImage = "";
    icon.style.backgroundColor = "transparent";
    return;
  }

  if (itemDef.kind === ItemKind.PLACEABLE) {
    const placeableIndex = itemDef.iconIndex;
    icon.style.backgroundImage = "url('assets/placeables.png')";
    icon.style.backgroundPosition = `-${placeableIndex * (ITEM_ICON_SIZE + ITEM_ICON_GAP)}px 0px`;
    icon.style.backgroundColor = "transparent";
    return;
  }

  if (itemDef.kind === ItemKind.BLOCK) {
    const srcX = itemDef.iconIndex * (ITEM_ICON_SIZE + DROP_ICON_GAP);
    icon.style.backgroundImage = "url('assets/drops.png')";
    icon.style.backgroundPosition = `-${srcX}px 0px`;
    icon.style.backgroundColor = "transparent";
    return;
  }

  icon.style.background = "transparent";
  icon.style.backgroundImage = "";
  icon.style.backgroundColor = "transparent";
}
