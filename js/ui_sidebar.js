// 右カラムの描画更新

function drawHud() {
  updateSidebarUI();
}

// 右カラムのUIを更新する
function updateSidebarUI() {
  if (!uiElements.coordText || !uiElements.reachText) {
    return;
  }

  const playerCol = floor(GameState.playerState.entity.x / GameState.worldState.tileSize);
  const playerRow = floor(GameState.playerState.entity.y / GameState.worldState.tileSize);
  uiElements.coordText.textContent = "座標: " + playerCol + ", " + playerRow;
  uiElements.reachText.textContent = "リーチ範囲: " + GameState.playerState.reachRange + " ブロック";

  updateEquipmentSlots();
  updateInventorySlots();
}

function updateEquipmentSlots() {
  for (let i = 0; i < uiElements.equipmentSlots.length; i += 1) {
    const entry = uiElements.equipmentSlots[i];
    const item = GameState.inventoryState.equipmentSlots[i];
    const selected = i === GameState.playerState.selectedEquipIndex;

    entry.slot.classList.toggle("selected", selected);
    entry.count.textContent = "";

    if (!item) {
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.width = "36px";
      entry.icon.style.height = "36px";
      entry.icon.style.opacity = UI_ICON_EMPTY_OPACITY;
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    // 所持数が0のアイテムはスロットから削除
    if (isStackableItem(item) && getItemCount(item.itemId) <= 0) {
      GameState.inventoryState.equipmentSlots[i] = null;
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.opacity = UI_ICON_EMPTY_OPACITY;
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    entry.slot.setAttribute("draggable", "true");

    if (isStackableItem(item)) {
      setItemSlotIcon(entry.icon, item.itemId);
      entry.icon.style.opacity = UI_ICON_FULL_OPACITY;
      entry.count.textContent = String(getItemCount(item.itemId));
    } else if (item.kind === ItemKind.TOOL) {
      setToolSlotIcon(entry.icon, item.tool);
      entry.icon.style.opacity = UI_ICON_FULL_OPACITY;
    }
  }
}

function updateInventorySlots() {
  for (let i = 0; i < uiElements.inventorySlots.length; i += 1) {
    const entry = uiElements.inventorySlots[i];
    const item = GameState.inventoryState.inventorySlots[i];

    if (!item) {
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.width = "36px";
      entry.icon.style.height = "36px";
      entry.icon.style.opacity = UI_ICON_EMPTY_OPACITY;
      entry.count.textContent = "";
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    // 所持数が0のアイテムはスロットから削除
    if (isStackableItem(item) && getItemCount(item.itemId) <= 0) {
      GameState.inventoryState.inventorySlots[i] = null;
      entry.icon.style.background = "transparent";
      entry.icon.style.backgroundImage = "";
      entry.icon.style.opacity = UI_ICON_EMPTY_OPACITY;
      entry.count.textContent = "";
      entry.slot.setAttribute("draggable", "false");
      continue;
    }

    entry.slot.setAttribute("draggable", "true");
    if (isStackableItem(item)) {
      setItemSlotIcon(entry.icon, item.itemId);
      entry.icon.style.opacity = UI_ICON_FULL_OPACITY;
      entry.count.textContent = String(getItemCount(item.itemId));
    } else if (item.kind === ItemKind.TOOL) {
      setToolSlotIcon(entry.icon, item.tool);
      entry.icon.style.opacity = UI_ICON_FULL_OPACITY;
      entry.count.textContent = UI_TOOL_COUNT_TEXT;
    }
  }
}
