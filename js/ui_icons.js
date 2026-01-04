// アイコン表示の共通処理
const ITEM_ICON_SIZE = 36;
const ITEM_ICON_GAP = 6;
const DROP_ICON_GAP = 6;
const DROP_ICON_COLUMNS = 8;
const PLACEABLE_SHEET_WIDTH = ITEM_ICON_SIZE * 8 + ITEM_ICON_GAP * 7;

function getDropIconPosition(iconIndex) {
  const col = iconIndex % DROP_ICON_COLUMNS;
  const row = Math.floor(iconIndex / DROP_ICON_COLUMNS);
  const stride = ITEM_ICON_SIZE + DROP_ICON_GAP;
  return { x: col * stride, y: row * stride };
}

// ツール用のアイコン表示を統一する
function setToolSlotIcon(icon, toolType) {
  const toolIndex = getToolSpriteIndex(toolType);
  icon.style.width = "36px";
  icon.style.height = "36px";
  icon.style.backgroundImage = "url('assets/items.png')";
  icon.style.backgroundPosition = `-${toolIndex * (ITEM_ICON_SIZE + ITEM_ICON_GAP)}px 0px`;
  icon.style.backgroundSize = "";
  icon.style.backgroundRepeat = "no-repeat";
  icon.style.backgroundColor = "transparent";
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
  icon.style.width = "36px";
  icon.style.height = "36px";

  if (itemDef.kind === ItemKind.PLACEABLE) {
    const placeableDef = getPlaceableDef(itemDef.placeableBlock);
    if (!placeableDef) {
      icon.style.background = "transparent";
      icon.style.backgroundImage = "";
      icon.style.backgroundColor = "transparent";
      return;
    }
    applyPlaceableIcon(icon, placeableDef);
    return;
  }

  if (itemDef.kind === ItemKind.BLOCK || itemDef.kind === ItemKind.MATERIAL) {
    const pos = getDropIconPosition(itemDef.iconIndex);
    icon.style.backgroundImage = "url('assets/drops.png')";
    icon.style.backgroundPosition = `-${pos.x}px -${pos.y}px`;
    icon.style.backgroundSize = "";
    icon.style.backgroundRepeat = "no-repeat";
    icon.style.backgroundColor = "transparent";
    return;
  }

  icon.style.background = "transparent";
  icon.style.backgroundImage = "";
  icon.style.backgroundColor = "transparent";
}

// 設置物のアイコン表示を共通化する
function applyPlaceableIcon(icon, def) {
  const sprites = def.iconSprites && def.iconSprites.length > 0 ? def.iconSprites : def.sprites;
  if (!sprites || sprites.length === 0) {
    icon.style.background = "transparent";
    icon.style.backgroundImage = "";
    icon.style.backgroundColor = "transparent";
    return;
  }

  const scale = def.iconScale ?? 1;
  const stride = (ITEM_ICON_SIZE + ITEM_ICON_GAP) * scale;
  const sheetWidth = PLACEABLE_SHEET_WIDTH * scale;
  const sheetHeight = ITEM_ICON_SIZE * scale;

  let minDx = sprites[0].dx;
  let maxDx = sprites[0].dx;
  let minDy = sprites[0].dy;
  let maxDy = sprites[0].dy;
  for (let i = 1; i < sprites.length; i += 1) {
    minDx = min(minDx, sprites[i].dx);
    maxDx = max(maxDx, sprites[i].dx);
    minDy = min(minDy, sprites[i].dy);
    maxDy = max(maxDy, sprites[i].dy);
  }

  const iconWidth = (maxDx - minDx + 1) * ITEM_ICON_SIZE * scale;
  const iconHeight = (maxDy - minDy + 1) * ITEM_ICON_SIZE * scale;
  icon.style.width = `${iconWidth}px`;
  icon.style.height = `${iconHeight}px`;

  const images = [];
  const positions = [];
  const sizes = [];
  for (let i = 0; i < sprites.length; i += 1) {
    const sprite = sprites[i];
    const offsetX = (sprite.dx - minDx) * ITEM_ICON_SIZE * scale;
    const offsetY = (sprite.dy - minDy) * ITEM_ICON_SIZE * scale;
    const srcX = -sprite.index * stride + offsetX;
    images.push("url('assets/placeables.png')");
    positions.push(`${srcX}px ${offsetY}px`);
    sizes.push(`${sheetWidth}px ${sheetHeight}px`);
  }

  icon.style.backgroundImage = images.join(", ");
  icon.style.backgroundPosition = positions.join(", ");
  icon.style.backgroundSize = sizes.join(", ");
  icon.style.backgroundRepeat = sprites.map(() => "no-repeat").join(", ");
  icon.style.backgroundColor = "transparent";
}
