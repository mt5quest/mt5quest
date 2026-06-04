import { useEffect, useState, useRef } from 'react';

interface Props {
  duration: number;
  onComplete: () => void;
  paused?: boolean;
}

export function Timer({ duration, onComplete, paused = false }: Props) {
  const [remaining, setRemaining] = useState(duration);
  const completedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  useEffect(() => {
    completedRef.current = false;
    setRemaining(duration);
  }, [duration]);

  useEffect(() => {
    if (paused || completedRef.current) return;
    const interval = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          if (!completedRef.current) {
            completedRef.current = true;
            setTimeout(() => onCompleteRef.current(), 0);
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [paused]);

  const pct = (remaining / duration) * 100;
  const color = pct > 50 ? '#10B981' : pct > 25 ? '#F59E0B' : '#EF4444';

  return (
    <div className="flex items-center gap-2">
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-12 h-12 -rotate-90" viewBox="0 0 48 48">
          <circle cx="24" cy="24" r="20" fill="none" stroke="#1F2937" strokeWidth="4" />
          <circle
            cx="24" cy="24" r="20"
            fill="none"
            stroke={color}
            strokeWidth="4"
            strokeDasharray={`${2 * Math.PI * 20}`}
            strokeDashoffset={`${2 * Math.PI * 20 * (1 - pct / 100)}`}
            strokeLinecap="round"
            className="transition-all duration-1000"
            style={{ stroke: color }}
          />
        </svg>
        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold" style={{ color }}>
          {remaining}
        </span>
      </div>
    </div>
  );
}
