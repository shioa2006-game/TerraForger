// 共通の定数と状態をまとめる
const GameState = {
  tileSize: 36,
  worldCols: 200,
  worldRows: 60,
  world: [],
  player: null,
  cameraPos: { x: 0, y: 0 },
  keyState: { left: false, right: false, up: false },
  reachRange: 3,
  selectedEquipIndex: 0,
  equipmentSlots: [],
  inventorySlots: [],
  inventory: {},
  particles: [],
  backgroundStars: [],
  clouds: [],
  placeables: [],
  activePlaceable: null,
  timeOfDay: 0,
  playerSprite: null,
  itemSprite: null,
  placeableSprite: null,
  pickaxeSwing: 0,
  pickaxeSwingDir: 1,
};

// アイテム種別
const ItemKind = {
  BLOCK: "block",
  TOOL: "tool",
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
  [BlockType.LEAVES]: "葉",
  [BlockType.SAND]: "砂",
  [BlockType.CHEST]: "収納箱",
  [BlockType.WORKBENCH]: "作業机",
};

// 設置できるブロックの並び
const PlaceableBlocks = [
  BlockType.DIRT,
  BlockType.STONE,
  BlockType.WOOD,
  BlockType.SAND,
  BlockType.LEAVES,
  BlockType.CHEST,
  BlockType.WORKBENCH,
];

// 設置物スプライトの参照位置
const PlaceableSpriteIndex = {
  [BlockType.CHEST]: 4,
  [BlockType.WORKBENCH]: 5,
};

// 設置物スプライトの位置を返す（未対応は-1）
function getPlaceableSpriteIndex(blockType) {
  return PlaceableSpriteIndex[blockType] ?? -1;
}

// オブジェクト扱いの設置物かどうか判定する
function isPlaceableObject(blockType) {
  return getPlaceableSpriteIndex(blockType) >= 0;
}

function getSelectedEquipment() {
  return GameState.equipmentSlots[GameState.selectedEquipIndex] || null;
}
