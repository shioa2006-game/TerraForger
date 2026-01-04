// インベントリ初期化
function initInventory() {
  initInventoryData();
  initInventorySlots();
  initEquipmentSlotsData();
}

// 所持数データを初期化する
function initInventoryData() {
  GameState.inventoryState.inventory = {};
  // 収納箱と作業机を初期所持アイテムに追加
  GameState.inventoryState.inventory[ItemId.CHEST] = INITIAL_CHEST_COUNT;
  GameState.inventoryState.inventory[ItemId.WORKBENCH] = INITIAL_WORKBENCH_COUNT;
  GameState.inventoryState.inventory[ItemId.WOOD_WALL] = INITIAL_WOOD_WALL_COUNT;
  GameState.inventoryState.inventory[ItemId.WOOD_DOOR] = INITIAL_WOOD_DOOR_COUNT;
  GameState.inventoryState.inventory[ItemId.LADDER] = INITIAL_LADDER_COUNT;
  GameState.inventoryState.inventory[ItemId.RAW_MEAT] = INITIAL_RAW_MEAT_COUNT;
  GameState.inventoryState.inventory[ItemId.OIL] = INITIAL_OIL_COUNT;
}

// 所持スロットを初期化する
function initInventorySlots() {
  GameState.inventoryState.inventorySlots = new Array(INVENTORY_SLOT_COUNT).fill(null);
  // 収納箱と作業机のスロットを追加
  GameState.inventoryState.inventorySlots[INITIAL_CHEST_SLOT_INDEX] = { kind: ItemKind.PLACEABLE, itemId: ItemId.CHEST };
  GameState.inventoryState.inventorySlots[INITIAL_WORKBENCH_SLOT_INDEX] = {
    kind: ItemKind.PLACEABLE,
    itemId: ItemId.WORKBENCH,
  };
  GameState.inventoryState.inventorySlots[INITIAL_WOOD_WALL_SLOT_INDEX] = {
    kind: ItemKind.PLACEABLE,
    itemId: ItemId.WOOD_WALL,
  };
  GameState.inventoryState.inventorySlots[INITIAL_WOOD_DOOR_SLOT_INDEX] = {
    kind: ItemKind.PLACEABLE,
    itemId: ItemId.WOOD_DOOR,
  };
  GameState.inventoryState.inventorySlots[INITIAL_LADDER_SLOT_INDEX] = { kind: ItemKind.PLACEABLE, itemId: ItemId.LADDER };
  GameState.inventoryState.inventorySlots[INITIAL_RAW_MEAT_SLOT_INDEX] = {
    kind: ItemKind.MATERIAL,
    itemId: ItemId.RAW_MEAT,
  };
  GameState.inventoryState.inventorySlots[INITIAL_OIL_SLOT_INDEX] = {
    kind: ItemKind.MATERIAL,
    itemId: ItemId.OIL,
  };
}

// 装備スロットの初期データを設定する
function initEquipmentSlotsData() {
  GameState.inventoryState.equipmentSlots = [
    { kind: ItemKind.TOOL, tool: ToolType.PICKAXE },
    { kind: ItemKind.TOOL, tool: ToolType.AXE },
    { kind: ItemKind.TOOL, tool: ToolType.HAMMER },
    { kind: ItemKind.TOOL, tool: ToolType.SWORD },
    null,
  ];
}
