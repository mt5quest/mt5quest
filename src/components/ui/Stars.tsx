import { Star } from 'lucide-react';

interface Props {
  count: number;
  max?: number;
  size?: number;
}

export function Stars({ count, max = 3, size = 24 }: Props) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: max }, (_, i) => (
        <Star
          key={i}
          size={size}
          className={i < count ? 'text-yellow-400 fill-yellow-400' : 'text-gray-600'}
        />
      ))}
    </div>
  );
}
