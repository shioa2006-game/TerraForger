// 作業机UI関連

// 作業机UIの状態
const WorkbenchState = {
  selectedRecipeIndex: 0,
  recipeElements: [],
  craftButtons: [],
  materialsDisplay: null,
};

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
  panel.className = "overlay-panel workbench-panel";

  const title = document.createElement("h3");
  title.className = "overlay-title";
  title.textContent = "作業机";

  // レシピ一覧コンテナ
  const recipeList = document.createElement("div");
  recipeList.className = "workbench-recipe-list";

  // レシピ項目を作成
  WorkbenchState.recipeElements = [];
  for (let i = 0; i < CraftingRecipes.length; i++) {
    const recipe = CraftingRecipes[i];
    const recipeItem = createRecipeItem(recipe, i);
    recipeList.appendChild(recipeItem);
    WorkbenchState.recipeElements.push(recipeItem);
  }

  // 素材表示エリア
  const materialsArea = document.createElement("div");
  materialsArea.className = "workbench-materials";
  WorkbenchState.materialsDisplay = materialsArea;

  // 作成ボタンエリア
  const buttonArea = document.createElement("div");
  buttonArea.className = "workbench-buttons";

  const craftAmounts = [1, 5, 10];
  WorkbenchState.craftButtons = [];
  for (const amount of craftAmounts) {
    const btn = document.createElement("button");
    btn.className = "craft-button";
    btn.textContent = `×${amount}`;
    btn.addEventListener("click", () => {
      craftSelectedRecipe(amount);
    });
    buttonArea.appendChild(btn);
    WorkbenchState.craftButtons.push(btn);
  }

  // 操作説明
  const hint = document.createElement("div");
  hint.className = "workbench-hint";
  hint.textContent = "↑↓キー / ホイール: 選択　クリック: 作成";

  panel.appendChild(title);
  panel.appendChild(recipeList);
  panel.appendChild(materialsArea);
  panel.appendChild(buttonArea);
  panel.appendChild(hint);
  overlay.appendChild(panel);
  root.appendChild(overlay);

  // キーボードとホイールイベント
  overlay.addEventListener("keydown", handleWorkbenchKeydown);
  overlay.addEventListener("wheel", handleWorkbenchWheel, { passive: false });
  overlay.tabIndex = -1;

  return overlay;
}

// レシピ項目を作成する
function createRecipeItem(recipe, index) {
  const item = document.createElement("div");
  item.className = "workbench-recipe-item";
  item.dataset.index = index;

  const nameSpan = document.createElement("span");
  nameSpan.className = "recipe-name";
  nameSpan.textContent = recipe.name;

  const materialsSpan = document.createElement("span");
  materialsSpan.className = "recipe-materials";
  materialsSpan.textContent = formatRecipeMaterials(recipe);

  item.appendChild(nameSpan);
  item.appendChild(materialsSpan);

  item.addEventListener("click", () => {
    selectRecipe(index);
  });

  return item;
}

// レシピの素材を文字列化する
function formatRecipeMaterials(recipe) {
  return recipe.materials
    .map((mat) => `${ItemNames[mat.itemId]}×${mat.count}`)
    .join(" + ");
}

// レシピを選択する
function selectRecipe(index) {
  WorkbenchState.selectedRecipeIndex = index;
  updateWorkbenchUI();
}

// 作業机UIを開く
function openWorkbenchUI(placeable) {
  if (!uiElements.workbenchOverlay) {
    return;
  }
  GameState.overlayState.activePlaceable = placeable;
  WorkbenchState.selectedRecipeIndex = 0;
  uiElements.workbenchOverlay.classList.remove("hidden");
  uiElements.workbenchOverlay.focus();
  updateWorkbenchUI();
}

// 作業机UIを閉じる
function closeWorkbenchUI() {
  if (!uiElements.workbenchOverlay) {
    return;
  }
  uiElements.workbenchOverlay.classList.add("hidden");
  GameState.overlayState.activePlaceable = null;
}

// 作業机UIを更新する
function updateWorkbenchUI() {
  const selectedIndex = WorkbenchState.selectedRecipeIndex;

  // レシピ一覧の選択状態を更新
  for (let i = 0; i < WorkbenchState.recipeElements.length; i++) {
    const elem = WorkbenchState.recipeElements[i];
    const recipe = CraftingRecipes[i];
    const canCraft = canCraftRecipe(recipe, 1);

    elem.classList.toggle("selected", i === selectedIndex);
    elem.classList.toggle("disabled", !canCraft);
  }

  // 素材表示を更新
  updateMaterialsDisplay();

  // 作成ボタンの状態を更新
  updateCraftButtons();
}

// 素材表示を更新する
function updateMaterialsDisplay() {
  const display = WorkbenchState.materialsDisplay;
  if (!display) {
    return;
  }

  display.innerHTML = "";

  const recipe = CraftingRecipes[WorkbenchState.selectedRecipeIndex];
  if (!recipe) {
    return;
  }

  const header = document.createElement("div");
  header.className = "materials-header";
  header.textContent = `「${recipe.name}」の必要素材:`;
  display.appendChild(header);

  for (const mat of recipe.materials) {
    const line = document.createElement("div");
    line.className = "materials-line";

    const owned = getItemCount(mat.itemId);
    const enough = owned >= mat.count;

    line.textContent = `${ItemNames[mat.itemId]}: ${mat.count}個 (所持: ${owned}個)`;
    line.classList.toggle("materials-enough", enough);
    line.classList.toggle("materials-lacking", !enough);

    display.appendChild(line);
  }
}

// 作成ボタンの状態を更新する
function updateCraftButtons() {
  const recipe = CraftingRecipes[WorkbenchState.selectedRecipeIndex];
  if (!recipe) {
    return;
  }

  const amounts = [1, 5, 10];
  for (let i = 0; i < WorkbenchState.craftButtons.length; i++) {
    const btn = WorkbenchState.craftButtons[i];
    const amount = amounts[i];
    const canCraft = canCraftRecipe(recipe, amount);

    btn.disabled = !canCraft;
    btn.classList.toggle("disabled", !canCraft);
  }
}

// レシピを作成できるか判定する
function canCraftRecipe(recipe, amount) {
  for (const mat of recipe.materials) {
    const required = mat.count * amount;
    const owned = getItemCount(mat.itemId);
    if (owned < required) {
      return false;
    }
  }
  return true;
}

// 選択中のレシピを作成する
function craftSelectedRecipe(amount) {
  const recipe = CraftingRecipes[WorkbenchState.selectedRecipeIndex];
  if (!recipe) {
    return;
  }

  if (!canCraftRecipe(recipe, amount)) {
    return;
  }

  // 素材を消費
  for (const mat of recipe.materials) {
    addItemCount(mat.itemId, -(mat.count * amount));
  }

  // 結果アイテムを追加
  addItemCount(recipe.resultItemId, recipe.resultCount * amount);

  // スロットにアイテムがない場合は空きスロットに追加
  ensureItemInSlot(recipe.resultItemId);

  // UIを更新
  updateWorkbenchUI();
  updateSidebarUI();
}

// アイテムがスロットに存在することを保証する
function ensureItemInSlot(itemId) {
  // 既にスロットにあれば何もしない
  if (findInventorySlotByItem(itemId) >= 0) {
    return true;
  }

  // 空きスロットを探して追加
  const emptyIndex = findEmptyInventoryIndex();
  if (emptyIndex < 0) {
    return false;
  }

  const itemDef = getItemDef(itemId);
  if (!itemDef) {
    return false;
  }

  GameState.inventoryState.inventorySlots[emptyIndex] = {
    kind: itemDef.kind,
    itemId: itemId,
  };
  return true;
}

// キーボードイベント処理
function handleWorkbenchKeydown(event) {
  if (uiElements.workbenchOverlay.classList.contains("hidden")) {
    return;
  }

  if (event.key === "ArrowUp") {
    event.preventDefault();
    navigateRecipe(-1);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    navigateRecipe(1);
  } else if (event.key === "Escape") {
    event.preventDefault();
    closeWorkbenchUI();
  }
}

// マウスホイールイベント処理
function handleWorkbenchWheel(event) {
  if (uiElements.workbenchOverlay.classList.contains("hidden")) {
    return;
  }

  event.preventDefault();
  const direction = event.deltaY > 0 ? 1 : -1;
  navigateRecipe(direction);
}

// レシピ選択を移動する
function navigateRecipe(direction) {
  const newIndex = WorkbenchState.selectedRecipeIndex + direction;
  if (newIndex >= 0 && newIndex < CraftingRecipes.length) {
    selectRecipe(newIndex);
  }
}
