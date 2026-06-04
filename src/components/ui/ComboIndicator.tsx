import { useEffect, useState } from 'react';
import { Zap } from 'lucide-react';

interface Props {
  combo: number;
}

export function ComboIndicator({ combo }: Props) {
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (combo > 1) {
      setAnimate(true);
      const t = setTimeout(() => setAnimate(false), 400);
      return () => clearTimeout(t);
    }
  }, [combo]);

  if (combo < 2) return null;

  return (
    <div
      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm font-bold transition-all duration-300 ${animate ? 'scale-125' : 'scale-100'}`}
      style={{ backgroundColor: '#F59E0B20', color: '#F59E0B', border: '1px solid #F59E0B40' }}
    >
      <Zap size={14} className="fill-yellow-400" />
      <span>x{combo} COMBO</span>
    </div>
  );
}
