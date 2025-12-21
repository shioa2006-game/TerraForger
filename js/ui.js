// UI関連
const uiElements = {
  coordText: null,
  reachText: null,
  equipmentSlots: [],
  inventoryGrid: null,
  inventorySlots: [],
};
const ITEM_ICON_SIZE = 36;
const ITEM_ICON_COLUMNS = 8;

function initInventory() {
  GameState.inventory = {};
  for (let i = 0; i < PlaceableBlocks.length; i += 1) {
    const blockType = PlaceableBlocks[i];
    GameState.inventory[blockType] = 30;
  }

  GameState.inventorySlots = new Array(30).fill(null);
  for (let i = 0; i < PlaceableBlocks.length; i += 1) {
    GameState.inventorySlots[i] = { kind: ItemKind.BLOCK, blockType: PlaceableBlocks[i] };
  }

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
      }
      if (!item) {
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
    entry.slot.setAttribute("draggable", "true");

    if (item.kind === ItemKind.BLOCK) {
      const colors = BlockColors[item.blockType];
      entry.icon.style.backgroundImage = "";
      entry.icon.style.background = colors ? colors.main : "transparent";
      entry.icon.style.opacity = "1";
      entry.count.textContent = String(GameState.inventory[item.blockType] || 0);
    } else if (item.kind === ItemKind.TOOL) {
      const toolIndex = getToolSpriteIndex(item.tool);
      const sheetWidth = ITEM_ICON_SIZE * ITEM_ICON_COLUMNS;
      entry.icon.style.backgroundImage = "url('assets/items.png')";
      entry.icon.style.backgroundPosition = `-${toolIndex * ITEM_ICON_SIZE}px 0px`;
      entry.icon.style.backgroundSize = `${sheetWidth}px ${ITEM_ICON_SIZE}px`;
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

    entry.slot.setAttribute("draggable", "true");
    if (item.kind === ItemKind.BLOCK) {
      const colors = BlockColors[item.blockType];
      entry.icon.style.backgroundImage = "";
      entry.icon.style.background = colors ? colors.main : "transparent";
      entry.icon.style.opacity = "1";
      entry.count.textContent = String(GameState.inventory[item.blockType] || 0);
    } else if (item.kind === ItemKind.TOOL) {
      const toolIndex = getToolSpriteIndex(item.tool);
      const sheetWidth = ITEM_ICON_SIZE * ITEM_ICON_COLUMNS;
      entry.icon.style.backgroundImage = "url('assets/items.png')";
      entry.icon.style.backgroundPosition = `-${toolIndex * ITEM_ICON_SIZE}px 0px`;
      entry.icon.style.backgroundSize = `${sheetWidth}px ${ITEM_ICON_SIZE}px`;
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
