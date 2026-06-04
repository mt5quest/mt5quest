interface Props {
  value: number;
  max: number;
  color?: string;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({ value, max, color = '#06B6D4', className = '', showLabel = false }: Props) {
  const pct = Math.min(100, (value / max) * 100);
  return (
    <div className={`relative h-2 rounded-full bg-white/10 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full transition-all duration-500 ease-out"
        style={{ width: `${pct}%`, backgroundColor: color }}
      />
      {showLabel && (
        <span className="absolute right-0 -top-5 text-xs text-gray-400">
          {value}/{max}
        </span>
      )}
    </div>
  );
}
