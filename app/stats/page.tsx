'use client';

import { useEffect, useState } from 'react';
import MonthCalendar from '@/components/MonthCalendar';
import {
  getHabits,
  getCompletions,
  getStreakFor,
  getCompletionRate,
} from '@/lib/habits';
import { Habit, Completion, CATEGORY_ICONS } from '@/lib/types';

const CATEGORY_COLOR: Record<string, string> = {
  health:   '#EF4444',
  mind:     '#8B5CF6',
  work:     '#3B82F6',
  social:   '#F97316',
  creative: '#D946EF',
};

const CATEGORY_BG: Record<string, string> = {
  health:   '#FEF2F2',
  mind:     '#F5F3FF',
  work:     '#EFF6FF',
  social:   '#FFF7ED',
  creative: '#FDF4FF',
};

export default function StatsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [rate7, setRate7] = useState(0);
  const [rate30, setRate30] = useState(0);
  const [rate1, setRate1] = useState(0);

  useEffect(() => {
    const hs = getHabits();
    const cs = getCompletions();
    setHabits(hs);
    setCompletions(cs);
    setRate1(getCompletionRate(hs, cs, 1));
    setRate7(getCompletionRate(hs, cs, 7));
    setRate30(getCompletionRate(hs, cs, 30));
  }, []);

  const streakRows = habits
    .map(h => ({ habit: h, streak: getStreakFor(h, completions) }))
    .sort((a, b) => b.streak - a.streak);

  return (
    <div className="min-h-screen bg-page-bg pb-24 max-w-lg mx-auto">
      <header className="bg-white border-b border-border-default px-4 pt-8 pb-4">
        <h1 className="text-2xl font-semibold text-text-primary">Stats</h1>
      </header>

      {/* Completion rates */}
      <section className="px-4 pt-4 grid grid-cols-3 gap-3">
        <StatCard value={`${Math.round(rate1 * 100)}%`}  label="Today" />
        <StatCard value={`${Math.round(rate7 * 100)}%`}  label="This week" />
        <StatCard value={`${Math.round(rate30 * 100)}%`} label="This month" />
      </section>

      {/* Month calendar */}
      <section className="px-4 pt-4">
        <p className="text-sm font-medium text-text-muted mb-2">Activity</p>
        <div className="bg-white border border-border-default rounded-xl p-4">
          <MonthCalendar completions={completions} habits={habits} />
        </div>
      </section>

      {/* Streaks */}
      <section className="px-4 pt-4">
        <p className="text-sm font-medium text-text-muted mb-2">Streaks</p>
        <div className="bg-white border border-border-default rounded-xl overflow-hidden">
          {streakRows.length === 0 && (
            <p className="text-base text-text-muted text-center py-8">No data yet</p>
          )}
          {streakRows.map(({ habit, streak }, i) => (
            <div
              key={habit.id}
              className={`flex items-center gap-3 px-4 py-3.5 ${
                i < streakRows.length - 1 ? 'border-b border-border-default' : ''
              }`}
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0"
                style={{ backgroundColor: CATEGORY_BG[habit.category] ?? '#F3F4F6' }}
              >
                {CATEGORY_ICONS[habit.category]}
              </div>
              <span className="flex-1 text-base text-text-primary truncate">{habit.name}</span>
              <span className="text-sm font-medium shrink-0" style={{ color: CATEGORY_COLOR[habit.category] }}>
                {habit.category}
              </span>
              <span className="text-base font-medium text-text-primary ml-3 w-14 text-right shrink-0">
                {streak > 0 ? `🔥 ${streak}d` : '—'}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function StatCard({ value, label }: { value: string; label: string }) {
  return (
    <div className="bg-white border border-border-default rounded-xl p-4">
      <p className="text-2xl font-semibold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted mt-1">{label}</p>
    </div>
  );
}
