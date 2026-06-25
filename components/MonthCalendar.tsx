import { Completion, Habit } from '@/lib/types';

interface MonthCalendarProps {
  completions: Completion[];
  habits: Habit[];
}

function localDateStr(d: Date): string {
  const y  = d.getFullYear();
  const m  = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${dd}`;
}

function cellBg(rate: number): string {
  if (rate === 0)   return '#F3F4F6';
  if (rate < 0.34)  return '#C7D2FE';
  if (rate < 0.67)  return '#A5B4FC';
  if (rate < 1)     return '#818CF8';
  return '#6366F1';
}

export default function MonthCalendar({ completions, habits }: MonthCalendarProps) {
  const now         = new Date();
  const year        = now.getFullYear();
  const month       = now.getMonth();
  const todayDate   = new Date(year, month, now.getDate());
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;

  type Cell = { date: string; rate: number; isToday: boolean; isFuture: boolean } | null;

  const cells: Cell[] = [
    ...Array<null>(startOffset).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => {
      const day       = i + 1;
      const cellDate  = new Date(year, month, day);
      const dateStr   = localDateStr(cellDate);
      const isFuture  = cellDate > todayDate;
      const dayIdx    = (cellDate.getDay() + 6) % 7;
      const scheduled = habits.filter(h => h.days.includes(dayIdx));
      const total     = scheduled.length || 1;
      const done      = isFuture
        ? 0
        : completions.filter(c => c.date === dateStr && scheduled.some(h => h.id === c.habitId)).length;

      return { date: dateStr, rate: isFuture ? 0 : done / total, isToday: day === now.getDate(), isFuture };
    }),
  ];

  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div>
      <p className="text-sm text-text-muted mb-3">{monthLabel}</p>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((cell, i) => {
          if (!cell) return <div key={i} className="aspect-square" />;

          const bg = cell.isFuture ? '#F9FAFB' : cellBg(cell.rate);

          return (
            <div
              key={i}
              className={`aspect-square rounded-lg relative ${cell.isToday ? 'ring-2 ring-accent ring-inset' : ''}`}
              style={{ backgroundColor: bg }}
              title={cell.isFuture ? cell.date : `${cell.date} · ${Math.round(cell.rate * 100)}%`}
            />
          );
        })}
      </div>
    </div>
  );
}
