import { Habit, Completion, DayBonus } from './types';
import { xpForCompletion, XP_PERFECT_DAY_BONUS } from './xp';
import { getStorage, setStorage, hasStorage } from './storage';

const KEYS = {
  habits:     'life_exe_habits',
  completions:'life_exe_completions',
  dayBonuses: 'life_exe_day_bonuses',
  habitOrder: 'life_exe_habit_order',
} as const;

const ALL_DAYS = [0, 1, 2, 3, 4, 5, 6];

const SEED_HABITS: Habit[] = [
  { id: 'seed_1', name: 'Morning Exercise', icon: '🏃', category: 'health', days: ALL_DAYS, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed_2', name: 'Read 20 mins',     icon: '📚', category: 'mind',   days: ALL_DAYS, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed_3', name: 'Deep Work Block',  icon: '💻', category: 'work',   days: [0,1,2,3,4], createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed_4', name: 'Meditate',         icon: '🧘', category: 'mind',   days: ALL_DAYS, createdAt: '2024-01-01T00:00:00.000Z' },
  { id: 'seed_5', name: 'Connect w/ Friend',icon: '💬', category: 'social', days: [5, 6],   createdAt: '2024-01-01T00:00:00.000Z' },
];

// ── Storage helpers ───────────────────────────────────────────────────────────

function store<T>(key: string, val: T): void {
  setStorage(key, val);
}

function load<T>(key: string, fallback: T): T {
  return getStorage(key, fallback);
}

// ── Migration from old frequency format ──────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function migrateHabit(h: any): Habit {
  if (Array.isArray(h.days)) return h as Habit;
  return { ...h, days: ALL_DAYS, frequency: undefined };
}

// ── Date helpers ─────────────────────────────────────────────────────────────

export function todayStr(): string {
  const d = new Date();
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function prevDay(dateStr: string): string {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() - 1);
  const ny  = date.getFullYear();
  const nm  = String(date.getMonth() + 1).padStart(2, '0');
  const nd  = String(date.getDate()).padStart(2, '0');
  return `${ny}-${nm}-${nd}`;
}

/** Returns 0=Mon … 6=Sun for a YYYY-MM-DD string */
function dayIndex(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number);
  return (new Date(y, m - 1, d).getDay() + 6) % 7;
}

/** Returns today's day index: 0=Mon … 6=Sun */
export function todayDayIndex(): number {
  return (new Date().getDay() + 6) % 7;
}

// ── Habits CRUD ───────────────────────────────────────────────────────────────

export function initialize(): void {
  if (!hasStorage(KEYS.habits)) {
    store(KEYS.habits, SEED_HABITS);
  }
}

export function getHabits(): Habit[] {
  const raw = load<unknown[]>(KEYS.habits, SEED_HABITS);
  return raw.map(migrateHabit);
}

export function saveHabits(habits: Habit[]): void {
  store(KEYS.habits, habits);
}

export function addHabit(data: Omit<Habit, 'id' | 'createdAt'>): Habit {
  const habit: Habit = {
    ...data,
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    createdAt: new Date().toISOString(),
  };
  saveHabits([...getHabits(), habit]);
  return habit;
}

export function updateHabit(id: string, updates: Partial<Omit<Habit, 'id' | 'createdAt'>>): void {
  saveHabits(getHabits().map(h => (h.id === id ? { ...h, ...updates } : h)));
}

export function deleteHabit(id: string): void {
  saveHabits(getHabits().filter(h => h.id !== id));
}

// ── Completions ───────────────────────────────────────────────────────────────

export function getCompletions(): Completion[] {
  return load(KEYS.completions, []);
}

export function saveCompletions(completions: Completion[]): void {
  store(KEYS.completions, completions);
}

// ── Day bonuses ───────────────────────────────────────────────────────────────

export function getDayBonuses(): DayBonus[] {
  return load(KEYS.dayBonuses, []);
}

export function saveDayBonuses(bonuses: DayBonus[]): void {
  store(KEYS.dayBonuses, bonuses);
}

// ── XP ────────────────────────────────────────────────────────────────────────

export function getTotalXP(): number {
  return getCompletions().reduce((s, c) => s + c.xpEarned, 0)
       + getDayBonuses().reduce((s, b) => s + b.xp, 0);
}

// ── Streak (counts consecutive scheduled days that were completed) ────────────

export function getStreakFor(habit: Habit, completions: Completion[]): number {
  const doneSet = new Set(completions.filter(c => c.habitId === habit.id).map(c => c.date));
  const today   = todayStr();
  let streak    = 0;
  let current   = today;
  let limit     = 0; // safety cap

  while (limit++ < 400) {
    const idx = dayIndex(current);
    if (habit.days.includes(idx)) {
      if (doneSet.has(current)) {
        streak++;
      } else if (current === today) {
        // Today not yet done — don't break streak, keep looking back
      } else {
        break; // missed a scheduled day
      }
    }
    current = prevDay(current);
  }
  return streak;
}

// ── Toggle completion ─────────────────────────────────────────────────────────

export function toggleHabit(habitId: string): {
  xpDelta: number;
  newStreak: number;
  perfectDay: boolean;
} {
  const today       = todayStr();
  const completions = getCompletions();
  const existing    = completions.find(c => c.habitId === habitId && c.date === today);

  if (existing) {
    const next = completions.filter(c => !(c.habitId === habitId && c.date === today));
    saveCompletions(next);
    saveDayBonuses(getDayBonuses().filter(b => b.date !== today));
    const habit = getHabits().find(h => h.id === habitId)!;
    return { xpDelta: -existing.xpEarned, newStreak: getStreakFor(habit, next), perfectDay: false };
  }

  const habit       = getHabits().find(h => h.id === habitId)!;
  const streakBefore = getStreakFor(habit, completions);
  const xpEarned    = xpForCompletion(streakBefore);

  const newCompletion: Completion = {
    id: Math.random().toString(36).slice(2) + Date.now().toString(36),
    habitId,
    date: today,
    xpEarned,
  };
  const next = [...completions, newCompletion];
  saveCompletions(next);

  // Perfect day: all habits scheduled today are done
  const habits     = getHabits();
  const todayIdx   = todayDayIndex();
  const scheduled  = habits.filter(h => h.days.includes(todayIdx));
  const todayDone  = new Set(next.filter(c => c.date === today).map(c => c.habitId));
  const isPerfect  = scheduled.length > 0 && scheduled.every(h => todayDone.has(h.id));

  let xpDelta  = xpEarned;
  let perfectDay = false;

  if (isPerfect) {
    const bonuses = getDayBonuses();
    if (!bonuses.some(b => b.date === today)) {
      saveDayBonuses([...bonuses, { date: today, xp: XP_PERFECT_DAY_BONUS }]);
      xpDelta += XP_PERFECT_DAY_BONUS;
      perfectDay = true;
    }
  }

  return { xpDelta, newStreak: getStreakFor(habit, next), perfectDay };
}

// ── Completion rate (uses scheduled days per date) ────────────────────────────

export function getCompletionRate(habits: Habit[], completions: Completion[], days: number): number {
  let possible = 0;
  let done     = 0;

  for (let i = 0; i < days; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const y       = d.getFullYear();
    const m       = String(d.getMonth() + 1).padStart(2, '0');
    const dd      = String(d.getDate()).padStart(2, '0');
    const dateStr = `${y}-${m}-${dd}`;
    const idx     = (d.getDay() + 6) % 7;

    const scheduled  = habits.filter(h => h.days.includes(idx));
    const doneThatDay = new Set(completions.filter(c => c.date === dateStr).map(c => c.habitId));
    for (const h of scheduled) {
      possible++;
      if (doneThatDay.has(h.id)) done++;
    }
  }
  return possible > 0 ? done / possible : 0;
}

// ── Order ─────────────────────────────────────────────────────────────────────

export function getHabitOrder(): string[] {
  return load(KEYS.habitOrder, []);
}

export function saveHabitOrder(ids: string[]): void {
  store(KEYS.habitOrder, ids);
}

export function getHabitsSorted(): Habit[] {
  const habits = getHabits();
  const order  = getHabitOrder();
  if (!order.length) return habits;
  const rank = new Map(order.map((id, i) => [id, i]));
  return [...habits].sort((a, b) => (rank.get(a.id) ?? 999) - (rank.get(b.id) ?? 999));
}
