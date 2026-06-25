'use client';

import { useEffect, useState, useCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import HabitCard from '@/components/HabitCard';
import {
  initialize,
  getHabitsSorted,
  getCompletions,
  toggleHabit,
  getStreakFor,
  todayStr,
  todayDayIndex,
  getCompletionRate,
  saveHabitOrder,
} from '@/lib/habits';
import { Habit, Completion } from '@/lib/types';

function formatDate(d: Date): string {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

interface PageState {
  habits: Habit[];
  completions: Completion[];
  completedToday: Set<string>;
  streaks: Record<string, number>;
}

function buildState(): PageState {
  const habits = getHabitsSorted();
  const completions = getCompletions();
  const today = todayStr();
  const completedToday = new Set(completions.filter(c => c.date === today).map(c => c.habitId));
  const streaks: Record<string, number> = {};
  for (const h of habits) streaks[h.id] = getStreakFor(h, completions);
  return { habits, completions, completedToday, streaks };
}

// ── Circle progress ──────────────────────────────────────────────────────────
function CircleProgress({ percent, done, total }: { percent: number; done: number; total: number }) {
  const size = 180;
  const r = 74;
  const circumference = 2 * Math.PI * r;
  const offset = circumference * (1 - Math.min(percent, 100) / 100);
  return (
    <div className="relative flex items-center justify-center mx-auto" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0" style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#F3F4F6" strokeWidth="12" />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke="#6366F1" strokeWidth="12"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.7s ease-out' }}
        />
      </svg>
      <div className="flex flex-col items-center">
        <span className="text-4xl font-bold text-text-primary">{Math.round(percent)}%</span>
        <span className="text-sm text-text-muted mt-1">{done} of {total}</span>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 bg-page-bg rounded-xl p-3 text-center">
      <p className="text-xl font-semibold text-text-primary">{value}</p>
      <p className="text-sm text-text-muted mt-0.5">{label}</p>
    </div>
  );
}

// ── Drag handle icon ──────────────────────────────────────────────────────────
function GripIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
      <circle cx="5.5" cy="4" r="1.5" /><circle cx="10.5" cy="4" r="1.5" />
      <circle cx="5.5" cy="8" r="1.5" /><circle cx="10.5" cy="8" r="1.5" />
      <circle cx="5.5" cy="12" r="1.5" /><circle cx="10.5" cy="12" r="1.5" />
    </svg>
  );
}

// ── Sortable wrapper ──────────────────────────────────────────────────────────
function SortableItem({
  habit, completed, streak, onToggle,
}: {
  habit: Habit; completed: boolean; streak: number; onToggle: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: habit.id });
  return (
    <div
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className={`flex items-center gap-2 ${isDragging ? 'opacity-50 z-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="p-2 text-gray-300 hover:text-gray-400 cursor-grab active:cursor-grabbing touch-none shrink-0"
        tabIndex={-1}
        aria-label="Drag to reorder"
      >
        <GripIcon />
      </button>
      <div className="flex-1 min-w-0">
        <HabitCard habit={habit} completed={completed} streak={streak} onToggle={onToggle} />
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [state, setState] = useState<PageState>({
    habits: [], completions: [], completedToday: new Set(), streaks: {},
  });

  const refresh = useCallback(() => setState(buildState()), []);

  useEffect(() => { initialize(); refresh(); }, [refresh]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor,   { activationConstraint: { delay: 200, tolerance: 6 } }),
  );

  function handleToggle(habitId: string) {
    toggleHabit(habitId);
    refresh();
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const todayHabits = state.habits.filter(h => h.days.includes(todayDayIndex()));
    const oldIdx = todayHabits.findIndex(h => h.id === active.id);
    const newIdx = todayHabits.findIndex(h => h.id === over.id);
    const reordered = arrayMove(todayHabits, oldIdx, newIdx);
    const otherIds = state.habits.filter(h => !todayHabits.some(s => s.id === h.id)).map(h => h.id);
    saveHabitOrder([...reordered.map(h => h.id), ...otherIds]);
    refresh();
  }

  const { habits, completions, completedToday, streaks } = state;
  const todayIdx   = todayDayIndex();
  const todayHabits = habits.filter(h => h.days.includes(todayIdx));
  const doneCount  = todayHabits.filter(h => completedToday.has(h.id)).length;
  const todayPct   = todayHabits.length > 0 ? (doneCount / todayHabits.length) * 100 : 0;
  const weekPct    = getCompletionRate(habits, completions, 7) * 100;
  const monthPct   = getCompletionRate(habits, completions, 30) * 100;

  return (
    <div className="min-h-screen bg-page-bg pb-24 max-w-lg mx-auto">
      {/* Header */}
      <header className="bg-white border-b border-border-default px-4 pt-8 pb-4">
        <p className="text-sm text-text-muted mb-1">{formatDate(new Date())}</p>
        <h1 className="text-2xl font-semibold text-text-primary">Today</h1>
      </header>

      {/* Progress card */}
      <div className="mx-4 mt-4 bg-white rounded-2xl border border-border-default p-5 shadow-card-sm">
        <CircleProgress percent={todayPct} done={doneCount} total={todayHabits.length} />
        <div className="flex gap-2 mt-5">
          <StatBox label="Today" value={`${Math.round(todayPct)}%`} />
          <StatBox label="Week"  value={`${Math.round(weekPct)}%`} />
          <StatBox label="Month" value={`${Math.round(monthPct)}%`} />
        </div>
      </div>

      {/* Today's habits */}
      {todayHabits.length > 0 && (
        <section className="px-4 mt-5">
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={todayHabits.map(h => h.id)} strategy={verticalListSortingStrategy}>
              <div className="space-y-2">
                {todayHabits.map(habit => (
                  <SortableItem
                    key={habit.id}
                    habit={habit}
                    completed={completedToday.has(habit.id)}
                    streak={streaks[habit.id] ?? 0}
                    onToggle={() => handleToggle(habit.id)}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </section>
      )}

      {todayHabits.length === 0 && habits.length > 0 && (
        <div className="px-4 pt-16 text-center">
          <p className="text-text-muted text-base">Nothing scheduled today.</p>
          <p className="text-text-muted text-sm mt-1">Enjoy your rest day!</p>
        </div>
      )}

      {habits.length === 0 && (
        <div className="px-4 pt-16 text-center">
          <p className="text-text-muted text-base">No habits yet.</p>
          <p className="text-text-muted text-sm mt-1">Go to Habits to add some.</p>
        </div>
      )}
    </div>
  );
}
