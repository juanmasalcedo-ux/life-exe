'use client';

import { useState } from 'react';
import { Habit, Category, CATEGORY_ICONS } from '@/lib/types';

const CATEGORIES: { value: Category; label: string; color: string }[] = [
  { value: 'health',   label: 'Health',   color: '#EF4444' },
  { value: 'mind',     label: 'Mind',     color: '#8B5CF6' },
  { value: 'work',     label: 'Work',     color: '#3B82F6' },
  { value: 'social',   label: 'Social',   color: '#F97316' },
  { value: 'creative', label: 'Creative', color: '#D946EF' },
];

const DAY_LABELS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];

interface HabitFormProps {
  initial?: Partial<Habit>;
  onSave: (data: Omit<Habit, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
}

export default function HabitForm({ initial, onSave }: HabitFormProps) {
  const [name,     setName]     = useState(initial?.name     ?? '');
  const [category, setCategory] = useState<Category>(initial?.category ?? 'health');
  const [days,     setDays]     = useState<number[]>(initial?.days ?? [0,1,2,3,4,5,6]);

  function toggleDay(idx: number) {
    if (days.includes(idx)) {
      if (days.length === 1) return; // keep at least one day
      setDays(days.filter(d => d !== idx));
    } else {
      setDays([...days, idx].sort((a, b) => a - b));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSave({ name: name.trim(), icon: CATEGORY_ICONS[category], category, days });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Name</label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Habit name…"
          maxLength={40}
          autoFocus
          className="w-full bg-white border border-border-default rounded-lg px-3 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">Category</label>
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map(({ value, label, color }) => (
            <button
              key={value}
              type="button"
              onClick={() => setCategory(value)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-full border transition-colors"
              style={
                category === value
                  ? { color, borderColor: color + '50', backgroundColor: color + '12' }
                  : { color: '#9CA3AF', borderColor: '#E5E7EB' }
              }
            >
              <span>{CATEGORY_ICONS[value]}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Days */}
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-2">
          Days — <span className="font-normal text-text-muted">{days.length}× per week</span>
        </label>
        <div className="flex gap-1.5">
          {DAY_LABELS.map((label, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => toggleDay(idx)}
              className={`flex-1 py-2.5 text-sm font-medium rounded-lg border transition-colors ${
                days.includes(idx)
                  ? 'bg-accent text-white border-accent'
                  : 'bg-white text-text-muted border-border-default hover:border-gray-300'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Submit */}
      <div className="pt-1">
        <button
          type="submit"
          disabled={!name.trim()}
          className="w-full py-3 text-sm font-medium rounded-lg bg-accent text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-indigo-600 transition-colors"
        >
          {initial?.id ? 'Save changes' : 'Add habit'}
        </button>
      </div>
    </form>
  );
}
