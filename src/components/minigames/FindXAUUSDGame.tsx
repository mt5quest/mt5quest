import { useState, useCallback } from 'react';
import type { MissionResult } from '../../types/game';

interface Props {
  onComplete: (result: Omit<MissionResult, 'badgeEarned'>) => void;
  startTime: number;
  duration: number;
}

const SYMBOL_LISTS = [
  ['EURUSD', 'GBPUSD', 'XAUUSD', 'USDJPY', 'BTCUSD', 'NZDUSD'],
  ['AUDUSD', 'USDCAD', 'EURJPY', 'XAUUSD', 'GBPJPY', 'USDCHF'],
  ['XAGUSD', 'EURUSD', 'BTCUSD', 'XAUUSD', 'EURGBP', 'USDSEK'],
  ['GBPUSD', 'XAUUSD', 'USDMXN', 'EURAUD', 'GBPCHF', 'CADCHF'],
  ['USDJPY', 'ETHUSD', 'XAUUSD', 'USDCHF', 'AUDNZD', 'EURCAD'],
  ['XPTUSD', 'XAGUSD', 'EURUSD', 'XAUUSD', 'GBPAUD', 'NZDJPY'],
  ['AUDCAD', 'XAUUSD', 'USDHKD', 'EURUSD', 'GBPNZD', 'USDSGD'],
  ['XAUUSD', 'BTCUSD', 'ETHUSD', 'LTCUSD', 'XAGUSD', 'BNBUSD'],
  ['EURCHF', 'GBPCHF', 'AUDCHF', 'XAUUSD', 'NZDCHF', 'CADCHF'],
];

const PRICE_DATA: Record<string, { bid: string; ask: string; change: string; up: boolean }> = {
  EURUSD: { bid: '1.0845', ask: '1.0847', change: '+0.12%', up: true },
  GBPUSD: { bid: '1.2734', ask: '1.2736', change: '-0.08%', up: false },
  XAUUSD: { bid: '2389.45', ask: '2389.85', change: '+0.34%', up: true },
  USDJPY: { bid: '149.82', ask: '149.84', change: '+0.21%', up: true },
  BTCUSD: { bid: '67245', ask: '67265', change: '+1.45%', up: true },
  NZDUSD: { bid: '0.6123', ask: '0.6125', change: '-0.15%', up: false },
  AUDUSD: { bid: '0.6589', ask: '0.6591', change: '+0.07%', up: true },
  USDCAD: { bid: '1.3645', ask: '1.3647', change: '-0.05%', up: false },
  EURJPY: { bid: '162.34', ask: '162.37', change: '+0.18%', up: true },
  GBPJPY: { bid: '190.78', ask: '190.82', change: '+0.09%', up: true },
  USDCHF: { bid: '0.9123', ask: '0.9125', change: '+0.03%', up: true },
  XAGUSD: { bid: '28.45', ask: '28.47', change: '+0.22%', up: true },
  EURGBP: { bid: '0.8512', ask: '0.8514', change: '-0.04%', up: false },
  USDSEK: { bid: '10.234', ask: '10.238', change: '+0.11%', up: true },
  USDMXN: { bid: '17.456', ask: '17.462', change: '-0.31%', up: false },
  EURAUD: { bid: '1.6453', ask: '1.6458', change: '+0.14%', up: true },
  GBPCHF: { bid: '1.1612', ask: '1.1615', change: '+0.06%', up: true },
  CADCHF: { bid: '0.6689', ask: '0.6692', change: '-0.02%', up: false },
  ETHUSD: { bid: '3245.5', ask: '3246.0', change: '+2.10%', up: true },
  AUDNZD: { bid: '1.0834', ask: '1.0837', change: '+0.05%', up: true },
  EURCAD: { bid: '1.4823', ask: '1.4826', change: '-0.07%', up: false },
  XPTUSD: { bid: '986.30', ask: '986.90', change: '+0.44%', up: true },
  AUDCAD: { bid: '0.9012', ask: '0.9015', change: '+0.03%', up: true },
  USDHKD: { bid: '7.8243', ask: '7.8245', change: '+0.01%', up: true },
  GBPNZD: { bid: '2.0834', ask: '2.0839', change: '-0.12%', up: false },
  USDSGD: { bid: '1.3456', ask: '1.3459', change: '+0.08%', up: true },
  LTCUSD: { bid: '82.45', ask: '82.55', change: '+0.92%', up: true },
  BNBUSD: { bid: '412.30', ask: '412.50', change: '+1.20%', up: true },
  EURCHF: { bid: '0.9878', ask: '0.9880', change: '-0.03%', up: false },
  AUDCHF: { bid: '0.5934', ask: '0.5936', change: '+0.02%', up: true },
  NZDCHF: { bid: '0.5567', ask: '0.5569', change: '-0.05%', up: false },
  NZDJPY: { bid: '91.45', ask: '91.48', change: '+0.14%', up: true },
  GBPAUD: { bid: '1.9345', ask: '1.9349', change: '+0.10%', up: true },
};

export function FindXAUUSDGame({ onComplete, startTime, duration }: Props) {
  const [list] = useState(() => SYMBOL_LISTS[Math.floor(Math.random() * SYMBOL_LISTS.length)]);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = useCallback((symbol: string) => {
    if (answered) return;
    setAnswered(true);
    setSelected(symbol);
    const correct = symbol === 'XAUUSD';
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const timeBonus = Math.round(remaining / duration * 40);
    const score = correct ? 100 + timeBonus : 0;
    const stars = correct ? (remaining > duration * 0.6 ? 3 : remaining > duration * 0.3 ? 2 : 1) : 0;

    setTimeout(() => {
      onComplete({
        score,
        stars,
        xpEarned: correct ? 60 + timeBonus : 5,
        coinsEarned: correct ? 12 + Math.round(timeBonus / 3) : 1,
        timeTaken: elapsed,
        correct,
        explanation: correct
          ? 'Parfait ! XAUUSD = Or (XAU) / Dollar US. XAU est le code ISO international de l\'or.'
          : 'XAUUSD représente l\'Or (XAU) contre le Dollar US. XAU est le code ISO de l\'or — mémorise-le !',
      });
    }, 900);
  }, [answered, startTime, duration, onComplete]);

  return (
    <div className="flex flex-col gap-4">
      <div className="text-center">
        <p className="text-lg font-semibold text-white">Trouve <span style={{ color: '#F59E0B' }}>XAUUSD</span> dans la liste</p>
        <p className="text-sm text-gray-400 mt-1">Appuie sur le bon symbole</p>
      </div>

      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#0F172A' }}>
        <div className="flex items-center justify-between px-4 py-2 border-b border-white/5">
          <span className="text-xs font-semibold text-gray-300">Cotations</span>
          <span className="text-xs text-gray-500">BID / VAR</span>
        </div>
        {list.map(symbol => {
          const data = PRICE_DATA[symbol] || { bid: '0.0000', ask: '0.0001', change: '+0.00%', up: true };
          const isSelected = symbol === selected;
          const isXAU = symbol === 'XAUUSD';
          let bg = 'transparent';
          let borderLeft = 'transparent';
          if (answered && isXAU) { bg = '#10B98115'; borderLeft = '#10B98140'; }
          if (answered && isSelected && !isXAU) { bg = '#EF444415'; borderLeft = '#EF444440'; }

          return (
            <button
              key={symbol}
              onClick={() => handleSelect(symbol)}
              className="w-full flex items-center justify-between px-4 py-3 border-b border-white/5 transition-all duration-200 active:scale-98 last:border-0"
              style={{ background: bg, borderLeft: `3px solid ${borderLeft}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                  style={{ background: isXAU ? '#F59E0B20' : '#37415130', color: isXAU ? '#F59E0B' : '#9CA3AF' }}
                >
                  {symbol.slice(0, 2)}
                </div>
                <div className="text-left">
                  <span className="text-sm font-semibold text-white">{symbol}</span>
                  {isXAU && answered && <span className="ml-2 text-xs text-yellow-400">← C'est lui !</span>}
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm font-mono text-white">{data.bid}</div>
                <div className={`text-xs ${data.up ? 'text-green-400' : 'text-red-400'}`}>{data.change}</div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
