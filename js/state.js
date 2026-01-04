// 共通の定数と状態をまとめる
const GameState = {
  worldState: {
    tileSize: 36,
    worldCols: 200,
    worldRows: 60,
    world: [],
  },
  playerState: {
    entity: null,
    keyState: { left: false, right: false, up: false, down: false },
    reachRange: 2,
    selectedEquipIndex: 0,
    pickaxeSwing: 0,
    pickaxeSwingDir: 1,
  },
  camera: { pos: { x: 0, y: 0 } },
  inventoryState: {
    equipmentSlots: [],
    inventorySlots: [],
    inventory: {},
  },
  worldObjects: {
    placeables: [],
    backgroundPlaceables: [],
    growingTrees: [],
  },
  overlayState: {
    activePlaceable: null,
  },
  environment: {
    timeOfDay: 0,
    lastTimeOfDay: 0,
    backgroundStars: [],
    clouds: [],
  },
  effects: {
    drops: [],
    particles: [],
  },
  playerSprite: null,
  itemSprite: null,
  dropSprite: null,
  placeableSprite: null,
};

// ゲーム挙動の調整用定数
const CANVAS_WIDTH = 960;
const CANVAS_HEIGHT = 540;
const TIME_OF_DAY_SPEED = 0.00012;
const PICKAXE_SWING_SPEED = 2.4;
const PICKAXE_SWING_LIMIT = 30;
const DROP_GRAVITY = 0.28;
const DROP_MAX_FALL = 6;
const DROP_SIZE_SCALE = 0.6;
const DROP_FRICTION = 0.92;
const DROP_STOP_THRESHOLD = 0.02;
const DROP_SPAWN_VX_MIN = -0.6;
const DROP_SPAWN_VX_MAX = 0.6;
const DROP_SPAWN_VY_MIN = -2.0;
const DROP_SPAWN_VY_MAX = -0.6;
const PLAYER_SPAWN_COL = 8;
const PLAYER_WIDTH = 30;
const PLAYER_HEIGHT = 54;
const PLAYER_SPEED = 3.0;
const PLAYER_GRAVITY = 0.32;
const PLAYER_JUMP_POWER = 5.2;
const PLAYER_FRICTION = 0.8;
const PLAYER_STOP_THRESHOLD = 0.05;
const PARTICLE_GRAVITY = 0.15;
const PARTICLE_COUNT = 8;
const PARTICLE_VX_MIN = -1.8;
const PARTICLE_VX_MAX = 1.8;
const PARTICLE_VY_MIN = -3.2;
const PARTICLE_VY_MAX = -1.2;
const PARTICLE_SIZE_MIN = 3;
const PARTICLE_SIZE_MAX = 6;
const PARTICLE_LIFE = 28;
const EQUIPMENT_SLOT_COUNT = 5;
// 背景演出の調整用定数
const STAR_COUNT = 120;
const STAR_SIZE_MIN = 1;
const STAR_SIZE_MAX = 3;
const STAR_TWINKLE_SPEED = 0.05;
const STAR_TWINKLE_SCALE = 0.3;
const STAR_TWINKLE_BASE = 0.7;
const STAR_PARALLAX = 0.1;
const STAR_BOUNDS_MARGIN = 10;
const CLOUD_COUNT = 12;
const CLOUD_Y_MIN = 40;
const CLOUD_Y_MAX = 200;
const CLOUD_WIDTH_MIN = 120;
const CLOUD_WIDTH_MAX = 240;
const CLOUD_SPEED_MIN = 0.1;
const CLOUD_SPEED_MAX = 0.25;
const CLOUD_ALPHA_BASE = 50;
const CLOUD_ALPHA_SCALE = 140;
const CLOUD_PARALLAX_X = 0.3;
const CLOUD_PARALLAX_Y = 0.1;
const SKY_LIMIT_ROW = 30;
const DAY_PROGRESS_NIGHT_LIMIT = 0.55;
const SUN_DAY_START = 0.35;
const SUN_ORBIT_MARGIN = 60;
const SUN_ORBIT_X = 0.8;
const SUN_SIZE = 60;
const SUN_GLOW_SIZE = 80;
const MOON_SIZE = 42;
// ワールド生成の調整用定数
const WORLD_SEED = 8;
const SURFACE_NOISE_SCALE = 0.08;
const SURFACE_MIN_ROW = 22;
const SURFACE_MAX_ROW = 29;
const DIRT_LAYER_DEPTH = 4;
const SAND_NOISE_SCALE = 0.12;
const SAND_NOISE_Y = 5;
const SAND_THRESHOLD = 0.72;
const SAND_PATCH_DEPTH = 3;
const CAVE_NOISE_SCALE = 0.1;
const CAVE_THRESHOLD = 0.62;
const CAVE_START_OFFSET = 4;
const ORE_START_OFFSET = 6;
const COAL_DEPTH = 10;
const COAL_CHANCE = 0.03;
const IRON_DEPTH = 16;
const IRON_CHANCE = 0.02;
const TREE_BORDER = 4;
const TREE_STEP_MIN = 5;
const TREE_STEP_MAX = 10;
const TREE_SPAWN_CHANCE = 0.6;
const TREE_HEIGHT_MIN = 4;
const TREE_HEIGHT_MAX = 7;
const LEAF_RADIUS = 2;
const LEAF_DISTANCE_LIMIT = 3;
// 描画の調整用定数
const RENDER_VIEW_MARGIN = 1;
const BLOCK_LIGHT_EDGE = 2;
const BLOCK_TOP_EDGE = 4;
const ORE_SEED_MULTIPLIER = 1000;
const ORE_OFFSET_A = 7;
const ORE_OFFSET_B = 2;
const ORE_OFFSET_C = 3;
const ORE_OFFSET_D = 8;
const ORE_OFFSET_E = 4;
const ORE_OFFSET_F = 5;
const ORE_OFFSET_G = 6;
const ORE_SIZE_LARGE = 4;
const ORE_SIZE_MEDIUM = 3;
const PLAYER_DIR_RIGHT = "right";
const PLAYER_DIR_LEFT = "left";
const PLAYER_HEAD_INDEX = 0;
const PLAYER_WALK_SPEED_THRESHOLD = 0.1;
const PLAYER_IDLE_FRAME = 2;
const PLAYER_FLIP_TRANSLATE_MULTIPLIER = 2;
const TOOL_ANCHOR_X = 9;
const TOOL_ANCHOR_Y = 54;
const TOOL_BASE_ANGLE = Math.PI / 4;
const TOOL_DRAW_OFFSET_X = -18;
const TOOL_DRAW_OFFSET_Y = -36;
const CURSOR_PULSE_SPEED = 0.12;
const CURSOR_PULSE_SCALE = 40;
const CURSOR_PULSE_BASE = 180;
const CURSOR_STROKE_WEIGHT = 2;
const CURSOR_STROKE_WEIGHT_DEFAULT = 1;
// UIの調整用定数
const INVENTORY_SLOT_COUNT = 30;
const CHEST_COLUMNS = 10;
const CHEST_ROWS = 6;
const CHEST_SLOT_COUNT = CHEST_COLUMNS * CHEST_ROWS;
const CHEST_STORAGE_SIZE = 60;
const UI_ICON_EMPTY_OPACITY = 0.35;
const UI_ICON_FULL_OPACITY = 1;
const UI_TOOL_COUNT_TEXT = "1";
const INITIAL_CHEST_COUNT = 1;
const INITIAL_WORKBENCH_COUNT = 1;
const INITIAL_WOOD_WALL_COUNT = 20;
const INITIAL_WOOD_DOOR_COUNT = 1;
const INITIAL_LADDER_COUNT = 10;
const INITIAL_RAW_MEAT_COUNT = 5;
const INITIAL_OIL_COUNT = 5;
const INITIAL_CHEST_SLOT_INDEX = 0;
const INITIAL_WORKBENCH_SLOT_INDEX = 1;
const INITIAL_WOOD_WALL_SLOT_INDEX = 2;
const INITIAL_WOOD_DOOR_SLOT_INDEX = 3;
const INITIAL_LADDER_SLOT_INDEX = 4;
const INITIAL_RAW_MEAT_SLOT_INDEX = 5;
const INITIAL_OIL_SLOT_INDEX = 6;
// 入力・操作の調整用定数
const REACH_DISTANCE_SCALE = 0.5;
const TOOL_TARGET_ROW_OFFSETS = [1, 1, 0, -1, -2, -2];

// アイテム種別
const ItemKind = {
  BLOCK: "block",
  TOOL: "tool",
  PLACEABLE: "placeable",
  MATERIAL: "material",
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
  RAW_MEAT: "rawMeat",
  OIL: "oil",
  ACORN: "acorn",
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

// ツールのスプライトインデックスを取得する
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
  ACORN: 14,
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
  [BlockType.ACORN]: "ドングリ",
};

// アイテム名（UI表示用）
const ItemNames = {
  [ItemId.DIRT]: "土",
  [ItemId.GRASS]: "草",
  [ItemId.STONE]: "石",
  [ItemId.WOOD]: "木ブロック",
  [ItemId.BRANCH]: "枝ブロック",
  [ItemId.COAL]: "石炭",
  [ItemId.IRON]: "鉄",
  [ItemId.SAND]: "砂",
  [ItemId.RAW_MEAT]: "生肉",
  [ItemId.OIL]: "油",
  [ItemId.ACORN]: "ドングリ",
  [ItemId.WOOD_WALL]: "木の壁",
  [ItemId.WOOD_DOOR]: "木の扉",
  [ItemId.LADDER]: "木の梯子",
  [ItemId.CHEST]: "収納箱",
  [ItemId.WORKBENCH]: "作業机",
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
  [BlockType.ACORN]: {
    itemId: ItemId.ACORN,
    layer: "foreground",
    size: { w: 1, h: 1 },
    origin: { x: 0, y: 0 },
    sprites: [{ dx: 0, dy: 0, index: 6 }],
    iconSprites: [{ dx: 0, dy: 0, index: 6 }],
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
  [ItemId.RAW_MEAT]: { kind: ItemKind.MATERIAL, iconIndex: 8 },
  [ItemId.OIL]: { kind: ItemKind.MATERIAL, iconIndex: 9 },
  [ItemId.ACORN]: { kind: ItemKind.PLACEABLE, iconIndex: 6, placeableBlock: BlockType.ACORN },
  [ItemId.CHEST]: { kind: ItemKind.PLACEABLE, iconIndex: 4, placeableBlock: BlockType.CHEST },
  [ItemId.WORKBENCH]: { kind: ItemKind.PLACEABLE, iconIndex: 5, placeableBlock: BlockType.WORKBENCH },
  [ItemId.WOOD_WALL]: { kind: ItemKind.PLACEABLE, iconIndex: 0, placeableBlock: BlockType.WOOD_WALL },
  [ItemId.WOOD_DOOR]: { kind: ItemKind.PLACEABLE, iconIndex: 1, placeableBlock: BlockType.WOOD_DOOR },
  [ItemId.LADDER]: { kind: ItemKind.PLACEABLE, iconIndex: 3, placeableBlock: BlockType.LADDER },
};

// クラフトレシピの定義
const CraftingRecipes = [
  {
    name: "木の壁",
    resultItemId: ItemId.WOOD_WALL,
    resultCount: 1,
    materials: [{ itemId: ItemId.WOOD, count: 1 }],
  },
  {
    name: "木の扉",
    resultItemId: ItemId.WOOD_DOOR,
    resultCount: 1,
    materials: [{ itemId: ItemId.WOOD, count: 2 }],
  },
  {
    name: "木の梯子",
    resultItemId: ItemId.LADDER,
    resultCount: 1,
    materials: [{ itemId: ItemId.BRANCH, count: 2 }],
  },
  {
    name: "収納箱",
    resultItemId: ItemId.CHEST,
    resultCount: 1,
    materials: [
      { itemId: ItemId.WOOD, count: 1 },
      { itemId: ItemId.BRANCH, count: 1 },
    ],
  },
  {
    name: "作業机",
    resultItemId: ItemId.WORKBENCH,
    resultCount: 1,
    materials: [{ itemId: ItemId.WOOD, count: 3 }],
  },
  {
    name: "ドングリ",
    resultItemId: ItemId.ACORN,
    resultCount: 1,
    materials: [{ itemId: ItemId.GRASS, count: 3 }],
  },
];

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
  return item && (item.kind === ItemKind.BLOCK || item.kind === ItemKind.PLACEABLE || item.kind === ItemKind.MATERIAL);
}

// 所持数を取得する
function getItemCount(itemId) {
  return GameState.inventoryState.inventory[itemId] || 0;
}

// 所持数を加算する
function addItemCount(itemId, amount) {
  const next = (GameState.inventoryState.inventory[itemId] || 0) + amount;
  GameState.inventoryState.inventory[itemId] = max(0, next);
}

function getSelectedEquipment() {
  return GameState.inventoryState.equipmentSlots[GameState.playerState.selectedEquipIndex] || null;
}
