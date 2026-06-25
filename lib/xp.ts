export const XP_PER_HABIT = 10;
export const XP_STREAK_BONUS_PER_DAY = 2;
export const XP_STREAK_CAP = 10; // caps streak multiplier at 10 days
export const XP_PERFECT_DAY_BONUS = 50;

export const LEVEL_THRESHOLDS = [0, 200, 500, 1000, 2000, 4000];
export const LEVEL_TITLES = ['Rookie', 'Apprentice', 'Consistent', 'Champion', 'Legend', 'Ascended'];

export function streakBonus(streakBeforeToday: number): number {
  return Math.min(streakBeforeToday, XP_STREAK_CAP) * XP_STREAK_BONUS_PER_DAY;
}

export function xpForCompletion(streakBeforeToday: number): number {
  return XP_PER_HABIT + streakBonus(streakBeforeToday);
}

export function currentLevel(totalXP: number): number {
  let level = 0;
  for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
    if (totalXP >= LEVEL_THRESHOLDS[i]) level = i;
  }
  return level;
}

export function levelTitle(level: number): string {
  return LEVEL_TITLES[Math.min(level, LEVEL_TITLES.length - 1)];
}

export function xpProgress(totalXP: number): {
  level: number;
  title: string;
  levelFloor: number;
  nextThreshold: number | null;
  fraction: number;
} {
  const level = currentLevel(totalXP);
  const levelFloor = LEVEL_THRESHOLDS[level];
  const nextThreshold = LEVEL_THRESHOLDS[level + 1] ?? null;
  const fraction =
    nextThreshold == null
      ? 1
      : (totalXP - levelFloor) / (nextThreshold - levelFloor);
  return { level, title: levelTitle(level), levelFloor, nextThreshold, fraction };
}
