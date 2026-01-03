// 左サイドバーのUI管理

const leftSidebarElements = {
  gameTime: null,
  timePeriod: null,
  guideText: null,
};

// 左サイドバーの初期化
function initLeftSidebar() {
  leftSidebarElements.gameTime = document.getElementById("gameTime");
  leftSidebarElements.timePeriod = document.getElementById("timePeriod");
  leftSidebarElements.guideText = document.getElementById("guideText");
}

// timeOfDay (0-1) をゲーム内時刻に変換
// timeOfDay = 0 → 6:00 (朝)
// timeOfDay = 0.5 → 18:00 (夕方)
// timeOfDay = 1.0 → 6:00 (翌朝、ループ)
function getGameTime(timeOfDay) {
  const MINUTES_PER_DAY = 1440; // 24 * 60
  const OFFSET_MINUTES = 360; // 6時間 = 360分

  // 総分数を計算（0-1を0-1440分に変換し、6時間オフセット）
  const totalMinutes = timeOfDay * MINUTES_PER_DAY;
  const gameMinutes = (totalMinutes + OFFSET_MINUTES) % MINUTES_PER_DAY;

  // 時と分を計算（10分刻み）
  const hour = Math.floor(gameMinutes / 60);
  const minute = Math.floor((gameMinutes % 60) / 10) * 10;

  return { hour, minute };
}

// 時刻を文字列にフォーマット（HH:MM形式）
function formatGameTime(hour, minute) {
  const hourStr = String(hour).padStart(2, "0");
  const minuteStr = String(minute).padStart(2, "0");
  return hourStr + ":" + minuteStr;
}

// 昼夜判定
// 昼: 6:00〜17:50 (hour 6-17)
// 夜: 18:00〜5:50 (hour 18-23, 0-5)
function isDaytime(hour) {
  return hour >= 6 && hour < 18;
}

// 左サイドバーの時間表示を更新
function updateLeftSidebarTime() {
  if (!leftSidebarElements.gameTime || !leftSidebarElements.timePeriod) {
    return;
  }

  const timeOfDay = GameState.environment.timeOfDay;
  const { hour, minute } = getGameTime(timeOfDay);

  // 時刻表示を更新
  leftSidebarElements.gameTime.textContent = formatGameTime(hour, minute);

  // 昼夜表示を更新
  const isDay = isDaytime(hour);
  leftSidebarElements.timePeriod.textContent = isDay ? "Day" : "Night";
  leftSidebarElements.timePeriod.className = "time-period " + (isDay ? "day" : "night");
}

// 左サイドバー全体の更新
function updateLeftSidebar() {
  updateLeftSidebarTime();
}
