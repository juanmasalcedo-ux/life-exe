'use client';

import { Habit, CATEGORY_ICONS } from '@/lib/types';

const CATEGORY_BG: Record<string, string> = {
  health:   '#FEF2F2',
  mind:     '#F5F3FF',
  work:     '#EFF6FF',
  social:   '#FFF7ED',
  creative: '#FDF4FF',
};

const CATEGORY_COLOR: Record<string, string> = {
  health:   '#EF4444',
  mind:     '#8B5CF6',
  work:     '#3B82F6',
  social:   '#F97316',
  creative: '#D946EF',
};

interface HabitCardProps {
  habit: Habit;
  completed: boolean;
  streak: number;
  onToggle: () => void;
}

export default function HabitCard({ habit, completed, streak, onToggle }: HabitCardProps) {
  const catColor = CATEGORY_COLOR[habit.category] ?? '#6B7280';
  const iconBg   = CATEGORY_BG[habit.category]   ?? '#F3F4F6';

  return (
    <button
      onClick={onToggle}
      className={`w-full text-left flex items-center gap-3.5 p-4 rounded-xl border transition-all duration-200 active:scale-[0.98] select-none shadow-card-sm ${
        completed
          ? 'bg-accent-bg border-accent-border'
          : 'bg-white border-border-default hover:border-gray-300'
      }`}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
        style={{ backgroundColor: iconBg }}
      >
        {CATEGORY_ICONS[habit.category]}
      </div>

      <div className="flex-1 min-w-0">
        <p className={`text-base font-medium truncate ${completed ? 'text-accent' : 'text-text-primary'}`}>
          {habit.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-medium" style={{ color: catColor }}>
            {habit.category}
          </span>
          {streak > 0 && (
            <span className="text-sm text-text-muted">· 🔥 {streak}d</span>
          )}
        </div>
      </div>

      <div
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-200 ${
          completed ? 'bg-accent border-accent' : 'bg-white border-gray-300'
        }`}
      >
        {completed && (
          <svg width="13" height="13" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        )}
      </div>
    </button>
  );
}
