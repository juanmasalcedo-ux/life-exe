'use client';

import { useEffect, useState } from 'react';
import HabitForm from '@/components/HabitForm';
import {
  initialize,
  getHabits,
  addHabit,
  updateHabit,
  deleteHabit,
} from '@/lib/habits';
import { Habit, CATEGORY_ICONS } from '@/lib/types';

const DAY_NAMES = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

function formatDays(days: number[]): string {
  if (days.length === 7) return 'Every day';
  if (days.length === 5 && !days.includes(5) && !days.includes(6)) return 'Weekdays';
  if (days.length === 2 && days.includes(5) && days.includes(6)) return 'Weekends';
  return days.map(d => DAY_NAMES[d]).join(', ');
}

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

type Mode = { type: 'idle' } | { type: 'adding' } | { type: 'editing'; habit: Habit };

function DeleteModal({ habit, onConfirm, onCancel }: {
  habit: Habit;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm mx-4 p-6 shadow-xl"
        onClick={e => e.stopPropagation()}
      >
        <div
          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mx-auto mb-4"
          style={{ backgroundColor: CATEGORY_BG[habit.category] ?? '#F3F4F6' }}
        >
          {CATEGORY_ICONS[habit.category]}
        </div>
        <h2 className="text-lg font-semibold text-text-primary text-center">Delete habit?</h2>
        <p className="text-sm text-text-muted text-center mt-1 mb-6">
          &ldquo;{habit.name}&rdquo; and all its history will be permanently removed.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={onConfirm}
            className="w-full py-3 text-sm font-medium rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="w-full py-3 text-sm font-medium rounded-xl border border-border-default text-text-secondary hover:text-text-primary hover:border-gray-300 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default function HabitsPage() {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [mode, setMode] = useState<Mode>({ type: 'idle' });
  const [deletingHabit, setDeletingHabit] = useState<Habit | null>(null);

  function refresh() { setHabits(getHabits()); }

  useEffect(() => { initialize(); refresh(); }, []);

  function handleSaveNew(data: Omit<Habit, 'id' | 'createdAt'>) {
    addHabit(data);
    setMode({ type: 'idle' });
    refresh();
  }

  function handleSaveEdit(data: Omit<Habit, 'id' | 'createdAt'>) {
    if (mode.type !== 'editing') return;
    updateHabit(mode.habit.id, data);
    setMode({ type: 'idle' });
    refresh();
  }

  function confirmDelete() {
    if (!deletingHabit) return;
    deleteHabit(deletingHabit.id);
    setDeletingHabit(null);
    refresh();
  }

  const showForm = mode.type !== 'idle';

  return (
    <div className="min-h-screen bg-page-bg pb-20 max-w-lg mx-auto">
      <header className="bg-white border-b border-border-default px-4 pt-8 pb-4 flex items-center justify-between">
        {showForm ? (
          <button
            onClick={() => setMode({ type: 'idle' })}
            className="flex items-center gap-1.5 text-base font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 14l-5-5 5-5" />
            </svg>
            {mode.type === 'adding' ? 'New habit' : 'Edit habit'}
          </button>
        ) : (
          <h1 className="text-2xl font-semibold text-text-primary">Habits</h1>
        )}
        {!showForm && (
          <button
            onClick={() => setMode({ type: 'adding' })}
            className="text-base font-medium text-accent hover:text-indigo-700 transition-colors"
          >
            + New habit
          </button>
        )}
      </header>

      {showForm && (
        <div className="px-4 py-5 bg-white border-b border-border-default">
          <HabitForm
            initial={mode.type === 'editing' ? mode.habit : undefined}
            onSave={mode.type === 'adding' ? handleSaveNew : handleSaveEdit}
            onCancel={() => setMode({ type: 'idle' })}
          />
        </div>
      )}

      <div className="px-4 py-4">
        {habits.length === 0 && !showForm && (
          <p className="text-sm text-text-muted text-center py-12">
            No habits yet. Add your first one!
          </p>
        )}

        {habits.length > 0 && !showForm && (
          <div className="bg-white border border-border-default rounded-xl overflow-hidden">
            {habits.map((habit, i) => (
              <div
                key={habit.id}
                className={`flex items-center gap-3 px-4 py-3.5 ${
                  i < habits.length - 1 ? 'border-b border-border-default' : ''
                }`}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
                  style={{ backgroundColor: CATEGORY_BG[habit.category] ?? '#F3F4F6' }}
                >
                  {CATEGORY_ICONS[habit.category]}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-base font-medium text-text-primary truncate">{habit.name}</p>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span
                      className="text-sm font-medium"
                      style={{ color: CATEGORY_COLOR[habit.category] }}
                    >
                      {habit.category}
                    </span>
                    <span className="text-sm text-text-muted">·</span>
                    <span className="text-sm text-text-muted">{formatDays(habit.days)}</span>
                  </div>
                </div>

                <div className="flex gap-1 shrink-0">
                  <button
                    onClick={() => setMode({ type: 'editing', habit })}
                    className="px-3 py-1.5 text-sm font-medium text-text-secondary hover:text-text-primary border border-border-default rounded-lg hover:border-gray-300 transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setDeletingHabit(habit)}
                    className="px-3 py-1.5 text-sm font-medium rounded-lg border text-red-400 border-red-100 hover:border-red-200 hover:text-red-500 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {deletingHabit && (
        <DeleteModal
          habit={deletingHabit}
          onConfirm={confirmDelete}
          onCancel={() => setDeletingHabit(null)}
        />
      )}
    </div>
  );
}
