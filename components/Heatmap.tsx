import { Completion, Habit } from '@/lib/types';

interface HeatmapProps {
  completions: Completion[];
  habits: Habit[];
}

function localDateStr(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function cellColor(rate: number): string {
  if (rate === 0)    return '#F3F4F6';
  if (rate < 0.34)  return '#C7D2FE';
  if (rate < 0.67)  return '#A5B4FC';
  if (rate < 1)     return '#818CF8';
  return '#6366F1';
}

// 13 weeks × 7 days = 91 cells, oldest top-left → newest bottom-right
const WEEKS = 13;
const DAYS  = WEEKS * 7;

export default function Heatmap({ completions, habits }: HeatmapProps) {
  // oldest first → grid flows left-to-right, top-to-bottom
  const cells = Array.from({ length: DAYS }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (DAYS - 1 - i));
    const date    = localDateStr(d);
    const dayIdx  = (d.getDay() + 6) % 7;
    const scheduled = habits.filter(h => h.days.includes(dayIdx));
    const total   = scheduled.length || 1;
    const done = completions.filter(
      c => c.date === date && scheduled.some(h => h.id === c.habitId)
    ).length;
    return { date, rate: done / total };
  });

  return (
    <div
      className="grid w-full"
      style={{ gridTemplateColumns: 'repeat(7, 1fr)', gap: '3px' }}
    >
      {cells.map((cell, i) => (
        <div
          key={i}
          className="rounded-sm w-full aspect-square"
          style={{ backgroundColor: cellColor(cell.rate) }}
          title={`${cell.date} · ${Math.round(cell.rate * 100)}%`}
        />
      ))}
    </div>
  );
}
