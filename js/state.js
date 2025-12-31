// 共通の定数と状態をまとめる
const GameState = {
  tileSize: 36,
  worldCols: 200,
  worldRows: 60,
  world: [],
  player: null,
  cameraPos: { x: 0, y: 0 },
  keyState: { left: false, right: false, up: false },
  reachRange: 2,
  selectedEquipIndex: 0,
  equipmentSlots: [],
  inventorySlots: [],
  inventory: {},
  drops: [],
  particles: [],
  backgroundStars: [],
  clouds: [],
  placeables: [],
  backgroundPlaceables: [],
  activePlaceable: null,
  timeOfDay: 0,
  playerSprite: null,
  itemSprite: null,
  dropSprite: null,
  placeableSprite: null,
  pickaxeSwing: 0,
  pickaxeSwingDir: 1,
};

// アイテム種別
const ItemKind = {
  BLOCK: "block",
  TOOL: "tool",
  PLACEABLE: "placeable",
};

// アイテムID
const ItemId = {
  DIRT: "dirt",
  GRASS: "grass",
  STONE: "stone",
  WOOD: "wood",
  BRANCH: "branch",
  COAL: "coal",
  IRON: "iron",
  SAND: "sand",
  WOOD_WALL: "woodWall",
  WOOD_DOOR: "woodDoor",
  LADDER: "ladder",
  CHEST: "chest",
  WORKBENCH: "workbench",
};

// ツール種別
const ToolType = {
  PICKAXE: "pickaxe",
  AXE: "axe",
  HAMMER: "hammer",
  SWORD: "sword",
};

// ブロック種別の定義
const BlockType = {
  AIR: 0,
  DIRT: 1,
  GRASS: 2,
  STONE: 3,
  WOOD: 4,
  LEAVES: 5,
  COAL: 6,
  IRON: 7,
  SAND: 8,
  CHEST: 9,
  WORKBENCH: 10,
  WOOD_WALL: 11,
  WOOD_DOOR: 12,
  LADDER: 13,
};

// ブロックの色定義
const BlockColors = {
  [BlockType.AIR]: null,
  [BlockType.DIRT]: { main: "#8B5A2B", dark: "#6B4423", light: "#A0694F" },
  [BlockType.GRASS]: { main: "#4A7C23", dark: "#3A6118", light: "#5C9A2D", top: "#5DBE2D" },
  [BlockType.STONE]: { main: "#808080", dark: "#606060", light: "#A0A0A0" },
  [BlockType.WOOD]: { main: "#B5651D", dark: "#8B4513", light: "#CD853F" },
  [BlockType.LEAVES]: { main: "#228B22", dark: "#186A18", light: "#32CD32" },
  [BlockType.COAL]: { main: "#505050", dark: "#303030", light: "#6A6A6A", ore: "#1A1A1A" },
  [BlockType.IRON]: { main: "#808080", dark: "#606060", light: "#A0A0A0", ore: "#D4A574" },
  [BlockType.SAND]: { main: "#F4D03F", dark: "#D4AC0D", light: "#F7DC6F" },
};

// ブロック名（UI表示用に将来利用）
const BlockNames = {
  [BlockType.DIRT]: "土",
  [BlockType.GRASS]: "草",
  [BlockType.STONE]: "石",
  [BlockType.WOOD]: "木",
  [BlockType.LEAVES]: "枝",
  [BlockType.SAND]: "砂",
  [BlockType.CHEST]: "収納箱",
  [BlockType.WORKBENCH]: "作業机",
  [BlockType.WOOD_WALL]: "木の壁",
  [BlockType.WOOD_DOOR]: "木の扉",
  [BlockType.LADDER]: "梯子",
};

// ブロックのドロップ定義
const BlockDefs = {
  [BlockType.DIRT]: { dropItemId: ItemId.DIRT },
  [BlockType.GRASS]: { dropItemId: ItemId.GRASS },
  [BlockType.STONE]: { dropItemId: ItemId.STONE },
  [BlockType.WOOD]: { dropItemId: ItemId.WOOD },
  [BlockType.LEAVES]: { dropItemId: ItemId.BRANCH },
  [BlockType.COAL]: { dropItemId: ItemId.COAL },
  [BlockType.IRON]: { dropItemId: ItemId.IRON },
  [BlockType.SAND]: { dropItemId: ItemId.SAND },
};

// 設置物の定義
const PlaceableDefs = {
  [BlockType.CHEST]: {
    itemId: ItemId.CHEST,
    layer: "foreground",
    size: { w: 1, h: 1 },
    origin: { x: 0, y: 0 },
    sprites: [{ dx: 0, dy: 0, index: 4 }],
    iconSprites: [{ dx: 0, dy: 0, index: 4 }],
    iconScale: 1,
  },
  [BlockType.WORKBENCH]: {
    itemId: ItemId.WORKBENCH,
    layer: "foreground",
    size: { w: 1, h: 1 },
    origin: { x: 0, y: 0 },
    sprites: [{ dx: 0, dy: 0, index: 5 }],
    iconSprites: [{ dx: 0, dy: 0, index: 5 }],
    iconScale: 1,
  },
  [BlockType.WOOD_WALL]: {
    itemId: ItemId.WOOD_WALL,
    layer: "background",
    size: { w: 1, h: 1 },
    origin: { x: 0, y: 0 },
    sprites: [{ dx: 0, dy: 0, index: 0 }],
    iconSprites: [{ dx: 0, dy: 0, index: 0 }],
    iconScale: 1,
  },
  [BlockType.WOOD_DOOR]: {
    itemId: ItemId.WOOD_DOOR,
    layer: "foreground",
    size: { w: 1, h: 2 },
    origin: { x: 0, y: 1 },
    sprites: [
      { dx: 0, dy: -1, index: 1 },
      { dx: 0, dy: 0, index: 2 },
    ],
    iconSprites: [
      { dx: 0, dy: 0, index: 1 },
      { dx: 0, dy: 1, index: 2 },
    ],
    iconScale: 0.5,
  },
  [BlockType.LADDER]: {
    itemId: ItemId.LADDER,
    layer: "foreground",
    size: { w: 1, h: 1 },
    origin: { x: 0, y: 0 },
    sprites: [{ dx: 0, dy: 0, index: 3 }],
    iconSprites: [{ dx: 0, dy: 0, index: 3 }],
    iconScale: 1,
  },
};

// アイテムの定義
const ItemDefs = {
  [ItemId.DIRT]: { kind: ItemKind.BLOCK, iconIndex: 0, placeBlock: BlockType.DIRT },
  [ItemId.GRASS]: { kind: ItemKind.BLOCK, iconIndex: 1, placeBlock: BlockType.GRASS },
  [ItemId.STONE]: { kind: ItemKind.BLOCK, iconIndex: 2, placeBlock: BlockType.STONE },
  [ItemId.WOOD]: { kind: ItemKind.BLOCK, iconIndex: 3, placeBlock: BlockType.WOOD },
  [ItemId.BRANCH]: { kind: ItemKind.BLOCK, iconIndex: 4, placeBlock: BlockType.LEAVES },
  [ItemId.COAL]: { kind: ItemKind.BLOCK, iconIndex: 5, placeBlock: BlockType.COAL },
  [ItemId.IRON]: { kind: ItemKind.BLOCK, iconIndex: 6, placeBlock: BlockType.IRON },
  [ItemId.SAND]: { kind: ItemKind.BLOCK, iconIndex: 7, placeBlock: BlockType.SAND },
  [ItemId.CHEST]: { kind: ItemKind.PLACEABLE, iconIndex: 4, placeableBlock: BlockType.CHEST },
  [ItemId.WORKBENCH]: { kind: ItemKind.PLACEABLE, iconIndex: 5, placeableBlock: BlockType.WORKBENCH },
  [ItemId.WOOD_WALL]: { kind: ItemKind.PLACEABLE, iconIndex: 0, placeableBlock: BlockType.WOOD_WALL },
  [ItemId.WOOD_DOOR]: { kind: ItemKind.PLACEABLE, iconIndex: 1, placeableBlock: BlockType.WOOD_DOOR },
  [ItemId.LADDER]: { kind: ItemKind.PLACEABLE, iconIndex: 3, placeableBlock: BlockType.LADDER },
};

// 設置物の定義を取得する
function getPlaceableDef(blockType) {
  return PlaceableDefs[blockType] || null;
}

// オブジェクト扱いの設置物かどうか判定する
function isPlaceableObject(blockType) {
  return Boolean(getPlaceableDef(blockType));
}

// アイテム定義を取得する
function getItemDef(itemId) {
  return ItemDefs[itemId] || null;
}

// スタック可能アイテムか判定する
function isStackableItem(item) {
  return item && (item.kind === ItemKind.BLOCK || item.kind === ItemKind.PLACEABLE);
}

// 所持数を取得する
function getItemCount(itemId) {
  return GameState.inventory[itemId] || 0;
}

// 所持数を加算する
function addItemCount(itemId, amount) {
  const next = (GameState.inventory[itemId] || 0) + amount;
  GameState.inventory[itemId] = max(0, next);
}

function getSelectedEquipment() {
  return GameState.equipmentSlots[GameState.selectedEquipIndex] || null;
}
