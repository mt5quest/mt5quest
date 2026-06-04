import { useState, useCallback, useEffect } from 'react';
import { CheckCircle } from 'lucide-react';
import type { MissionResult } from '../../types/game';

interface Props {
  onComplete: (result: Omit<MissionResult, 'badgeEarned'>) => void;
  startTime: number;
  duration: number;
}

interface SprintStep {
  instruction: string;
  options: string[];
  correct: number;
}

const SPRINT_SETS: SprintStep[][] = [
  [
    { instruction: 'Ouvre MT5. Quel est le premier onglet visible ?', options: ['Cotations', 'Graphiques', 'Transaction', 'Historique'], correct: 0 },
    { instruction: 'Tu veux voir le graphique XAUUSD. Quel onglet ?', options: ['Cotations', 'Graphiques', 'Transaction', 'Paramètres'], correct: 1 },
    { instruction: 'Prêt à passer un ordre. Quel onglet ?', options: ['Cotations', 'Graphiques', 'Transaction', 'Historique'], correct: 2 },
    { instruction: 'Voir tes trades passés. Quel onglet ?', options: ['Cotations', 'Graphiques', 'Transaction', 'Historique'], correct: 3 },
  ],
  [
    { instruction: 'Pour modifier le timeframe du graphique, tu appuies sur ?', options: ['Le symbole', 'La timeframe (ex: H1)', 'Le bouton BUY', 'Les paramètres'], correct: 1 },
    { instruction: 'Un lot de 0.01 sur XAUUSD représente ?', options: ['100 oz d\'or', '10 oz d\'or', '1 oz d\'or', '1000 oz d\'or'], correct: 2 },
    { instruction: 'Take Profit = ?', options: ['Niveau de perte max', 'Niveau de profit cible', 'Taille de position', 'Type d\'ordre'], correct: 1 },
    { instruction: 'BID = prix de ?', options: ['Vente (tu vends)', 'Achat (tu achètes)', 'Clôture du marché', 'Ouverture du marché'], correct: 0 },
  ],
  [
    { instruction: 'Le spread = ?', options: ['Le prix de l\'or', 'ASK − BID', 'Le profit', 'La marge requise'], correct: 1 },
    { instruction: 'Pour un BUY, tu entres au prix ?', options: ['BID', 'ASK', 'MID', 'LAST'], correct: 1 },
    { instruction: 'Timeframe H4 = ?', options: ['4 minutes', '4 heures', '4 jours', '4 semaines'], correct: 1 },
    { instruction: 'Pour fermer une position BUY sur MT5 mobile, tu ?', options: ['Appuies sur SELL', 'Appuies sur fermer ×', 'Supprimes l\'app', 'Coupes internet'], correct: 1 },
  ],
  [
    { instruction: 'XAUUSD signifie ?', options: ['Argent / Dollar', 'Or / Dollar', 'Or / Euro', 'Platine / Dollar'], correct: 1 },
    { instruction: 'Stop Loss trop proche du prix = ?', options: ['Gain assuré', 'Risque de se faire sortir par le bruit', 'Meilleure protection', 'Aucun risque'], correct: 1 },
    { instruction: 'M15 timeframe = bougie de ?', options: ['15 secondes', '15 minutes', '15 heures', '15 jours'], correct: 1 },
    { instruction: 'Pour un SELL, tu entres au prix ?', options: ['ASK', 'BID', 'OPEN', 'CLOSE'], correct: 1 },
  ],
  [
    { instruction: 'Margin Call signifie ?', options: ['Tu gagnes beaucoup', 'Ton solde tombe sous la marge requise', 'Un signal de vente', 'Une news économique'], correct: 1 },
    { instruction: 'Levier 1:100 signifie que 1$ contrôle ?', options: ['1$', '10$', '100$', '1000$'], correct: 2 },
    { instruction: 'Pip sur XAUUSD = ?', options: ['0.0001$', '0.1$', '1$', '10$'], correct: 2 },
    { instruction: 'Ordre en attente (Pending Order) = ?', options: ['Ordre au prix actuel', 'Ordre déclenché à un prix futur', 'Ordre annulé', 'Ordre partiel'], correct: 1 },
  ],
  [
    { instruction: 'Risk/Reward 1:3 signifie ?', options: ['Risquer 3 pour gagner 1', 'Risquer 1 pour gagner 3', 'Gagner 3 fois de suite', 'Ouvrir 3 trades'], correct: 1 },
    { instruction: 'Pour trader sur l\'or on utilise ?', options: ['EURUSD', 'XAGUSD', 'XAUUSD', 'BTCUSD'], correct: 2 },
    { instruction: 'Lot size 0.01 est appelé ?', options: ['Lot standard', 'Mini lot', 'Micro lot', 'Nano lot'], correct: 2 },
    { instruction: 'Support = ?', options: ['Niveau où le prix a tendance à monter', 'Niveau où le prix a tendance à baisser', 'Le stop loss', 'Le take profit'], correct: 0 },
  ],
  [
    { instruction: 'Résistance = ?', options: ['Niveau où le prix rebondit à la hausse', 'Niveau où le prix a du mal à passer', 'Un indicateur technique', 'Le prix d\'ouverture'], correct: 1 },
    { instruction: 'Tendance haussière = ?', options: ['Sommets et creux qui descendent', 'Sommets et creux qui montent', 'Prix stable horizontalement', 'Bougies rouges uniquement'], correct: 1 },
    { instruction: 'Pour analyser la tendance principale, quel timeframe ?', options: ['M1', 'M5', 'H4 ou Daily', 'W1 uniquement'], correct: 2 },
    { instruction: 'Un chandelier Doji indique ?', options: ['Forte tendance haussière', 'Indécision du marché', 'Signal de vente certain', 'Haute volatilité'], correct: 1 },
  ],
  [
    { instruction: 'NFP (Non-Farm Payrolls) est une news de quel pays ?', options: ['France', 'Japon', 'États-Unis', 'Allemagne'], correct: 2 },
    { instruction: 'Volatilité élevée = ?', options: ['Marché calme, facile à trader', 'Prix qui bougent beaucoup et rapidement', 'Aucune opportunité', 'Spreads serrés'], correct: 1 },
    { instruction: 'EMA = ?', options: ['Extreme Moving Average', 'Exponential Moving Average', 'Expected Market Action', 'Efficient Market Analysis'], correct: 1 },
    { instruction: 'Overtrading signifie ?', options: ['Trader avec un grand lot', 'Prendre trop de trades sans discipline', 'Trader sur plusieurs marchés', 'Utiliser trop d\'indicateurs'], correct: 1 },
  ],
];

export function MT5SprintGame({ onComplete, startTime, duration }: Props) {
  const [steps] = useState(() => SPRINT_SETS[Math.floor(Math.random() * SPRINT_SETS.length)]);
  const [currentStep, setCurrentStep] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [flash, setFlash] = useState<'correct' | 'wrong' | null>(null);

  const handleAnswer = useCallback((optIndex: number) => {
    if (done) return;
    const correct = optIndex === steps[currentStep].correct;
    if (correct) {
      setCorrectCount(c => c + 1);
      setFlash('correct');
    } else {
      setFlash('wrong');
    }
    setTimeout(() => {
      setFlash(null);
      if (currentStep + 1 >= steps.length) {
        setDone(true);
      } else {
        setCurrentStep(s => s + 1);
      }
    }, 400);
  }, [done, currentStep, steps]);

  useEffect(() => {
    if (!done) return;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const timeBonus = Math.round(remaining / duration * 80);
    const accuracy = correctCount / steps.length;
    const score = Math.round(accuracy * 100) + timeBonus;
    const stars = accuracy === 1 ? 3 : accuracy >= 0.75 ? 2 : accuracy >= 0.5 ? 1 : 0;
    const correct = correctCount >= steps.length * 0.75;

    setTimeout(() => {
      onComplete({
        score,
        stars,
        xpEarned: correct ? 120 + timeBonus : 20,
        coinsEarned: correct ? 25 + Math.round(timeBonus / 3) : 5,
        timeTaken: elapsed,
        correct,
        explanation: `Tu as répondu correctement à ${correctCount}/${steps.length} questions. ${correct ? 'Excellent sprint !' : 'Continue à t\'entraîner sur les bases MT5 !'}`,
      });
    }, 500);
  }, [done, correctCount, steps.length, startTime, duration, onComplete]);

  const step = steps[currentStep];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <p className="text-white font-semibold">Sprint MT5</p>
        <span className="text-sm text-gray-400">{currentStep + 1} / {steps.length}</span>
      </div>

      <div className="flex gap-2">
        {steps.map((_, i) => (
          <div
            key={i}
            className="flex-1 h-1.5 rounded-full transition-all duration-300"
            style={{ background: i < currentStep ? '#10B981' : i === currentStep ? '#06B6D4' : '#374151' }}
          />
        ))}
      </div>

      <div
        className="rounded-2xl p-5 border transition-all duration-200"
        style={{
          background: flash === 'correct' ? '#10B98115' : flash === 'wrong' ? '#EF444415' : '#0F172A',
          borderColor: flash === 'correct' ? '#10B98140' : flash === 'wrong' ? '#EF444440' : '#ffffff10',
        }}
      >
        <p className="text-white text-base font-medium leading-snug">{step?.instruction}</p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {step?.options.map((opt, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(i)}
            className="py-3 px-3 rounded-xl text-sm font-medium text-left transition-all duration-150 active:scale-95"
            style={{ background: '#1F2937', color: '#D1D5DB', border: '1.5px solid #374151' }}
          >
            {opt}
          </button>
        ))}
      </div>

      {flash && (
        <div className="flex items-center justify-center gap-2 py-2">
          <CheckCircle size={16} className={flash === 'correct' ? 'text-green-400' : 'text-red-400'} />
          <span className={`text-sm font-medium ${flash === 'correct' ? 'text-green-400' : 'text-red-400'}`}>
            {flash === 'correct' ? 'Correct !' : 'Pas tout à fait...'}
          </span>
        </div>
      )}
    </div>
  );
}
