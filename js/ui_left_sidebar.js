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

// 時間帯の定義（8段階、3時間ごと）
const TIME_PERIODS = [
  { start: 6, name: "Morning", isDay: true },
  { start: 9, name: "Forenoon", isDay: true },
  { start: 12, name: "Afternoon", isDay: true },
  { start: 15, name: "Dusk", isDay: true },
  { start: 18, name: "Evening", isDay: false },
  { start: 21, name: "Night", isDay: false },
  { start: 0, name: "Midnight", isDay: false },
  { start: 3, name: "Dawn", isDay: false },
];

// 時刻から時間帯を取得
function getTimePeriod(hour) {
  // 時間帯を逆順でチェック（大きい時刻から）
  if (hour >= 21) return TIME_PERIODS[5]; // Night
  if (hour >= 18) return TIME_PERIODS[4]; // Evening
  if (hour >= 15) return TIME_PERIODS[3]; // Dusk
  if (hour >= 12) return TIME_PERIODS[2]; // Afternoon
  if (hour >= 9) return TIME_PERIODS[1];  // Forenoon
  if (hour >= 6) return TIME_PERIODS[0];  // Morning
  if (hour >= 3) return TIME_PERIODS[7];  // Dawn
  return TIME_PERIODS[6];                  // Midnight
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

  // 時間帯表示を更新
  const period = getTimePeriod(hour);
  leftSidebarElements.timePeriod.textContent = period.name;
  leftSidebarElements.timePeriod.className = "time-period " + (period.isDay ? "day" : "night");
}

// 左サイドバー全体の更新
function updateLeftSidebar() {
  updateLeftSidebarTime();
}
