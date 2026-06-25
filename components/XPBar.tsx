interface XPBarProps {
  totalXP: number;
  level: number;
  title: string;
  fraction: number;
  nextThreshold: number | null;
}

export default function XPBar({ totalXP, level, title, fraction, nextThreshold }: XPBarProps) {
  const pct = Math.min(fraction * 100, 100);

  return (
    <div className="px-4 py-4 bg-white border-b border-border-default">
      <div className="flex items-baseline justify-between mb-2">
        <div className="flex items-baseline gap-2">
          <span className="text-base font-semibold text-text-primary">Level {level}</span>
          <span className="text-sm text-text-secondary">{title}</span>
        </div>
        <span className="font-mono text-sm text-text-muted">
          {totalXP.toLocaleString()}
          {nextThreshold != null ? ` / ${nextThreshold.toLocaleString()} XP` : ' XP'}
        </span>
      </div>
      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct.toFixed(1)}%` }}
        />
      </div>
    </div>
  );
}
