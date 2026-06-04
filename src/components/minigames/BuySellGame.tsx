import { useState, useCallback } from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import type { MissionResult } from '../../types/game';

interface Props {
  onComplete: (result: Omit<MissionResult, 'badgeEarned'>) => void;
  startTime: number;
  duration: number;
}

interface Scenario {
  candles: { open: number; close: number; high: number; low: number }[];
  signal: 'buy' | 'sell';
  explanation: string;
  label: string;
}

const SCENARIOS: Scenario[] = [
  {
    label: 'Double fond haussier',
    candles: [
      { open: 2380, close: 2370, high: 2382, low: 2368 },
      { open: 2370, close: 2365, high: 2372, low: 2363 },
      { open: 2365, close: 2368, high: 2370, low: 2363 },
      { open: 2368, close: 2378, high: 2380, low: 2366 },
      { open: 2378, close: 2389, high: 2391, low: 2376 },
    ],
    signal: 'buy',
    explanation: 'Double fond : deux creux similaires puis rebond haussier. Signal d\'achat classique sur XAUUSD !',
  },
  {
    label: 'Tendance baissière confirmée',
    candles: [
      { open: 2410, close: 2400, high: 2412, low: 2398 },
      { open: 2400, close: 2392, high: 2402, low: 2390 },
      { open: 2392, close: 2395, high: 2397, low: 2389 },
      { open: 2395, close: 2384, high: 2396, low: 2382 },
      { open: 2384, close: 2375, high: 2386, low: 2373 },
    ],
    signal: 'sell',
    explanation: 'Tendance baissière : chaque rebond est vendu. Les sommets descendent progressivement. Signal de vente.',
  },
  {
    label: 'Cassure haussière',
    candles: [
      { open: 2370, close: 2372, high: 2375, low: 2368 },
      { open: 2372, close: 2371, high: 2376, low: 2369 },
      { open: 2371, close: 2373, high: 2377, low: 2370 },
      { open: 2373, close: 2382, high: 2384, low: 2372 },
      { open: 2382, close: 2394, high: 2396, low: 2380 },
    ],
    signal: 'buy',
    explanation: 'Cassure d\'une résistance avec grande bougie verte. Fort signal d\'achat — le prix brise un niveau clé !',
  },
  {
    label: 'Étoile du soir',
    candles: [
      { open: 2385, close: 2392, high: 2394, low: 2383 },
      { open: 2392, close: 2398, high: 2400, low: 2390 },
      { open: 2398, close: 2399, high: 2402, low: 2396 },
      { open: 2399, close: 2390, high: 2400, low: 2388 },
      { open: 2390, close: 2380, high: 2392, low: 2378 },
    ],
    signal: 'sell',
    explanation: 'Étoile du soir : après une montée, chandelier d\'hésitation puis grande bougie rouge. Signal de vente fort !',
  },
  {
    label: 'Marteau sur support',
    candles: [
      { open: 2395, close: 2385, high: 2396, low: 2383 },
      { open: 2385, close: 2380, high: 2387, low: 2375 },
      { open: 2380, close: 2379, high: 2383, low: 2368 },
      { open: 2379, close: 2386, high: 2388, low: 2378 },
      { open: 2386, close: 2395, high: 2397, low: 2384 },
    ],
    signal: 'buy',
    explanation: 'Marteau sur support : longue mèche basse + corps vert = les acheteurs reprennent le contrôle. Signal d\'achat !',
  },
  {
    label: 'Triple sommet',
    candles: [
      { open: 2388, close: 2395, high: 2397, low: 2386 },
      { open: 2395, close: 2390, high: 2398, low: 2388 },
      { open: 2390, close: 2394, high: 2398, low: 2388 },
      { open: 2394, close: 2389, high: 2397, low: 2387 },
      { open: 2389, close: 2381, high: 2391, low: 2379 },
    ],
    signal: 'sell',
    explanation: 'Triple sommet : le prix teste 3 fois le même niveau de résistance et échoue. Cassure baissière confirmée.',
  },
  {
    label: 'Bullish engulfing',
    candles: [
      { open: 2402, close: 2396, high: 2404, low: 2394 },
      { open: 2396, close: 2390, high: 2398, low: 2388 },
      { open: 2390, close: 2388, high: 2392, low: 2385 },
      { open: 2386, close: 2384, high: 2389, low: 2382 },
      { open: 2383, close: 2396, high: 2397, low: 2381 },
    ],
    signal: 'buy',
    explanation: 'Bullish engulfing : grande bougie verte qui "avale" la précédente rouge. Inversion haussière classique après une baisse.',
  },
  {
    label: 'Bearish engulfing en résistance',
    candles: [
      { open: 2375, close: 2382, high: 2384, low: 2373 },
      { open: 2382, close: 2388, high: 2390, low: 2380 },
      { open: 2388, close: 2392, high: 2394, low: 2386 },
      { open: 2392, close: 2394, high: 2396, low: 2390 },
      { open: 2395, close: 2382, high: 2396, low: 2380 },
    ],
    signal: 'sell',
    explanation: 'Bearish engulfing en résistance : grande bougie rouge qui avale la précédente verte au sommet = inversion baissière.',
  },
  {
    label: 'Consolidation + cassure baissière',
    candles: [
      { open: 2398, close: 2396, high: 2400, low: 2394 },
      { open: 2396, close: 2397, high: 2401, low: 2393 },
      { open: 2397, close: 2395, high: 2399, low: 2393 },
      { open: 2395, close: 2394, high: 2398, low: 2392 },
      { open: 2394, close: 2383, high: 2395, low: 2381 },
    ],
    signal: 'sell',
    explanation: 'Après une consolidation serrée, grande bougie rouge qui casse le support. Momentum vendeur fort — signal SELL.',
  },
  {
    label: 'Fond en V — rebond rapide',
    candles: [
      { open: 2390, close: 2383, high: 2391, low: 2381 },
      { open: 2383, close: 2376, high: 2384, low: 2374 },
      { open: 2376, close: 2374, high: 2378, low: 2370 },
      { open: 2374, close: 2383, high: 2385, low: 2373 },
      { open: 2383, close: 2392, high: 2394, low: 2381 },
    ],
    signal: 'buy',
    explanation: 'Fond en V : baisse rapide puis reprise tout aussi rapide. Les acheteurs défendent le niveau. Signal d\'achat sur momentum.',
  },
  {
    label: 'Doji en résistance',
    candles: [
      { open: 2378, close: 2385, high: 2387, low: 2376 },
      { open: 2385, close: 2391, high: 2393, low: 2383 },
      { open: 2391, close: 2395, high: 2397, low: 2389 },
      { open: 2395, close: 2395, high: 2400, low: 2390 },
      { open: 2395, close: 2386, high: 2396, low: 2384 },
    ],
    signal: 'sell',
    explanation: 'Doji après montée = indécision au sommet. Suivi d\'une bougie rouge = confirmation que les vendeurs prennent le contrôle.',
  },
  {
    label: 'Rebond sur moyenne mobile',
    candles: [
      { open: 2400, close: 2396, high: 2402, low: 2394 },
      { open: 2396, close: 2392, high: 2398, low: 2390 },
      { open: 2392, close: 2389, high: 2394, low: 2387 },
      { open: 2389, close: 2391, high: 2393, low: 2387 },
      { open: 2391, close: 2400, high: 2402, low: 2389 },
    ],
    signal: 'buy',
    explanation: 'Le prix corrige jusqu\'à la moyenne mobile puis rebondit fortement. Pullback classique dans une tendance haussière = achat.',
  },
];

function MiniChart({ candles }: { candles: Scenario['candles'] }) {
  const allValues = candles.flatMap(c => [c.high, c.low]);
  const min = Math.min(...allValues);
  const max = Math.max(...allValues);
  const range = max - min || 1;
  const W = 260;
  const H = 120;
  const candleW = 32;
  const gap = (W - candles.length * candleW) / (candles.length + 1);

  return (
    <svg width={W} height={H} className="overflow-visible">
      {candles.map((c, i) => {
        const x = gap + i * (candleW + gap) + candleW / 2;
        const yHigh = H - ((c.high - min) / range) * H;
        const yLow = H - ((c.low - min) / range) * H;
        const yOpen = H - ((c.open - min) / range) * H;
        const yClose = H - ((c.close - min) / range) * H;
        const isUp = c.close >= c.open;
        const color = isUp ? '#10B981' : '#EF4444';
        const bodyY = Math.min(yOpen, yClose);
        const bodyH = Math.max(Math.abs(yOpen - yClose), 2);
        return (
          <g key={i}>
            <line x1={x} y1={yHigh} x2={x} y2={yLow} stroke={color} strokeWidth="1.5" />
            <rect x={x - candleW / 2 + 4} y={bodyY} width={candleW - 8} height={bodyH} fill={color} rx="1" />
          </g>
        );
      })}
    </svg>
  );
}

export function BuySellGame({ onComplete, startTime, duration }: Props) {
  const [scenario] = useState(() => SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<'buy' | 'sell' | null>(null);

  const handleAnswer = useCallback((choice: 'buy' | 'sell') => {
    if (answered) return;
    setAnswered(true);
    setSelected(choice);
    const correct = choice === scenario.signal;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const timeBonus = Math.round(remaining / duration * 50);
    const score = correct ? 100 + timeBonus : 0;
    const stars = correct ? (remaining > duration * 0.6 ? 3 : remaining > duration * 0.3 ? 2 : 1) : 0;

    setTimeout(() => {
      onComplete({
        score,
        stars,
        xpEarned: correct ? 80 + timeBonus : 8,
        coinsEarned: correct ? 15 + Math.round(timeBonus / 3) : 2,
        timeTaken: elapsed,
        correct,
        explanation: scenario.explanation,
      });
    }, 1000);
  }, [answered, scenario, startTime, duration, onComplete]);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-sm text-gray-400 font-medium">{scenario.label}</p>
        <p className="text-xs text-gray-500 mt-1">XAUUSD • 1H</p>
      </div>

      <div className="rounded-2xl p-4 border border-white/10 flex items-center justify-center" style={{ background: '#0F172A' }}>
        <MiniChart candles={scenario.candles} />
      </div>

      <p className="text-center text-white font-semibold">Que fais-tu sur ce graphique ?</p>

      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => handleAnswer('buy')}
          disabled={answered}
          className="flex flex-col items-center gap-2 py-5 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-95"
          style={{
            background: answered
              ? scenario.signal === 'buy' ? '#10B98125' : selected === 'buy' ? '#EF444425' : '#1F2937'
              : '#10B98120',
            color: answered
              ? scenario.signal === 'buy' ? '#10B981' : selected === 'buy' ? '#EF4444' : '#4B5563'
              : '#10B981',
            border: `2px solid ${answered ? (scenario.signal === 'buy' ? '#10B98150' : selected === 'buy' ? '#EF444450' : '#374151') : '#10B98140'}`,
          }}
        >
          <TrendingUp size={28} />
          BUY
          <span className="text-xs font-normal opacity-70">Achat / Hausse</span>
        </button>
        <button
          onClick={() => handleAnswer('sell')}
          disabled={answered}
          className="flex flex-col items-center gap-2 py-5 rounded-2xl font-bold text-lg transition-all duration-200 active:scale-95"
          style={{
            background: answered
              ? scenario.signal === 'sell' ? '#10B98125' : selected === 'sell' ? '#EF444425' : '#1F2937'
              : '#EF444420',
            color: answered
              ? scenario.signal === 'sell' ? '#10B981' : selected === 'sell' ? '#EF4444' : '#4B5563'
              : '#EF4444',
            border: `2px solid ${answered ? (scenario.signal === 'sell' ? '#10B98150' : selected === 'sell' ? '#EF444450' : '#374151') : '#EF444440'}`,
          }}
        >
          <TrendingDown size={28} />
          SELL
          <span className="text-xs font-normal opacity-70">Vente / Baisse</span>
        </button>
      </div>

      {answered && (
        <div
          className="rounded-xl p-3 text-sm text-center"
          style={{
            background: selected === scenario.signal ? '#10B98115' : '#EF444415',
            color: selected === scenario.signal ? '#10B981' : '#EF4444',
          }}
        >
          {selected === scenario.signal ? '✓ Bonne décision !' : `✗ Il fallait ${scenario.signal === 'buy' ? 'BUY' : 'SELL'}`}
        </div>
      )}
    </div>
  );
}
