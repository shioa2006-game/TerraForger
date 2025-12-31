// UI補助関数
function findEmptyInventoryIndex() {
  for (let i = 0; i < GameState.inventoryState.inventorySlots.length; i += 1) {
    if (!GameState.inventoryState.inventorySlots[i]) {
      return i;
    }
  }
  return -1;
}

// 所持アイテム内でアイテムIDのスロットを探す
function findInventorySlotByItem(itemId) {
  for (let i = 0; i < GameState.inventoryState.inventorySlots.length; i += 1) {
    const item = GameState.inventoryState.inventorySlots[i];
    if (item && isStackableItem(item) && item.itemId === itemId) {
      return i;
    }
  }
  return -1;
}
