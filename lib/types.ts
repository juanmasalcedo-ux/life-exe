export type Category = 'health' | 'mind' | 'work' | 'social' | 'creative';

export const CATEGORY_ICONS: Record<Category, string> = {
  health:   '🏃',
  mind:     '🧠',
  work:     '💼',
  social:   '💬',
  creative: '🎨',
};

export interface Habit {
  id: string;
  name: string;
  icon: string;
  category: Category;
  days: number[]; // 0=Mon, 1=Tue, 2=Wed, 3=Thu, 4=Fri, 5=Sat, 6=Sun
  createdAt: string;
}

export interface Completion {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD local
  xpEarned: number;
}

export interface DayBonus {
  date: string; // YYYY-MM-DD local
  xp: number;
}
