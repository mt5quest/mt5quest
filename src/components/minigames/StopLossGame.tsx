import { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';
import type { MissionResult } from '../../types/game';

interface Props {
  onComplete: (result: Omit<MissionResult, 'badgeEarned'>) => void;
  startTime: number;
  duration: number;
}

interface SLScenario {
  entry: number;
  direction: 'buy' | 'sell';
  context: string;
  options: { label: string; value: number; correct: boolean; reason: string }[];
  explanation: string;
}

const SCENARIOS: SLScenario[] = [
  {
    entry: 2389,
    direction: 'buy',
    context: 'Support récent à 2385',
    options: [
      { label: '2395 (+6)', value: 2395, correct: false, reason: 'Un stop au-dessus du prix d\'entrée pour un BUY provoquerait une perte immédiate !' },
      { label: '2385 (-4)', value: 2385, correct: true, reason: 'Correct ! Stop juste sous le support récent à 2385.' },
      { label: '2350 (-39)', value: 2350, correct: false, reason: 'Stop trop loin = risque trop élevé. Max 1-2% du capital par trade.' },
    ],
    explanation: 'Pour un BUY, le stop loss est sous le prix d\'entrée, sous le dernier support. Ni trop proche (bruit), ni trop loin (risque excessif).',
  },
  {
    entry: 2410,
    direction: 'sell',
    context: 'Résistance récente à 2415',
    options: [
      { label: '2415 (+5)', value: 2415, correct: true, reason: 'Correct ! Stop juste au-dessus de la résistance récente à 2415.' },
      { label: '2405 (-5)', value: 2405, correct: false, reason: 'Un stop sous le prix pour un SELL = dans la direction du trade, ça ne protège pas !' },
      { label: '2450 (+40)', value: 2450, correct: false, reason: 'Stop trop loin = risque excessif par rapport au bénéfice potentiel.' },
    ],
    explanation: 'Pour un SELL, le stop loss est au-dessus du prix d\'entrée, au-dessus de la dernière résistance.',
  },
  {
    entry: 2375,
    direction: 'buy',
    context: 'Support visible à 2370',
    options: [
      { label: '2370 (-5)', value: 2370, correct: true, reason: 'Stop sous le support à 2370. Risque de 5 points = raisonnable.' },
      { label: '2365 (-10)', value: 2365, correct: false, reason: 'Trop loin du niveau de support. Ratio risque/récompense trop élevé.' },
      { label: '2380 (+5)', value: 2380, correct: false, reason: 'ERREUR : stop au-dessus du prix pour un BUY = perte immédiate garantie !' },
    ],
    explanation: 'Le stop optimal est juste sous le dernier support, avec un risque de 5-15 points sur l\'or.',
  },
  {
    entry: 2400,
    direction: 'sell',
    context: 'Résistance forte à 2405',
    options: [
      { label: '2395 (-5)', value: 2395, correct: false, reason: 'Stop sous le prix pour un SELL = dans la direction du trade, inutile.' },
      { label: '2406 (+6)', value: 2406, correct: true, reason: 'Parfait ! Stop juste au-dessus de la résistance à 2405. Zone de protection idéale.' },
      { label: '2420 (+20)', value: 2420, correct: false, reason: 'Trop loin = ratio R:R mauvais. Risquer 20 pour un objectif de 10 n\'a pas de sens.' },
    ],
    explanation: 'Pour un SELL depuis une résistance, le stop va juste au-dessus de cette résistance — c\'est là que ta thèse est invalidée.',
  },
  {
    entry: 2360,
    direction: 'buy',
    context: 'Creux récent à 2355, compte de 500$',
    options: [
      { label: '2355 (-5)', value: 2355, correct: true, reason: 'Stop sous le creux à 2355. Risque limité, placement logique.' },
      { label: '2340 (-20)', value: 2340, correct: false, reason: 'Stop trop loin = avec un lot de 0.1, risque de 200$ sur un compte de 500$. Trop dangereux.' },
      { label: '2363 (+3)', value: 2363, correct: false, reason: 'Stop au-dessus du prix d\'entrée pour un BUY = trade en perte dès le départ !' },
    ],
    explanation: 'Calcule toujours le risque en dollars : Stop (pts) × lot × 1$/pt. Ici 5 pts × 0.1 lot = 5$, soit 1% de 500$. Parfait !',
  },
  {
    entry: 2430,
    direction: 'sell',
    context: 'Précédent sommet à 2433',
    options: [
      { label: '2434 (+4)', value: 2434, correct: true, reason: 'Stop au-dessus du précédent sommet. Si le prix dépasse 2433, la thèse baissière est annulée.' },
      { label: '2425 (-5)', value: 2425, correct: false, reason: 'Stop sous le prix pour un SELL = gain immédiat si le prix monte légèrement ? Non — ça ne protège pas.' },
      { label: '2445 (+15)', value: 2445, correct: false, reason: 'Trop loin. Risquer 15 points pour un objectif de 10 = ratio négatif. À éviter.' },
    ],
    explanation: 'Le stop doit être au niveau qui invalide ton analyse. Pour un SELL depuis un sommet, c\'est au-dessus de ce sommet.',
  },
  {
    entry: 2415,
    direction: 'buy',
    context: 'Bougie de soutien formée à 2412',
    options: [
      { label: '2412 (-3)', value: 2412, correct: true, reason: 'Stop sous la bougie de soutien. Risque de 3 points seulement — excellent ratio.' },
      { label: '2420 (+5)', value: 2420, correct: false, reason: 'Stop AU-DESSUS du prix d\'entrée pour un BUY = impossible, tu perdrais immédiatement !' },
      { label: '2400 (-15)', value: 2400, correct: false, reason: 'Stop trop loin du niveau clé. Le marché aurait le temps de te faire peur inutilement.' },
    ],
    explanation: 'Quand une bougie de soutien se forme, le stop va juste en dessous. C\'est précis et logique — si ce niveau casse, ta thèse est fausse.',
  },
  {
    entry: 2385,
    direction: 'sell',
    context: 'Étoile du soir formée à 2388',
    options: [
      { label: '2390 (+5)', value: 2390, correct: true, reason: 'Stop au-dessus de l\'étoile du soir à 2388. Si le prix monte encore, le signal est invalidé.' },
      { label: '2380 (-5)', value: 2380, correct: false, reason: 'Stop sous le prix pour un SELL = cela ne protège pas contre une montée du prix.' },
      { label: '2395 (+10)', value: 2395, correct: false, reason: 'Trop loin de la structure. Ton risque est double pour la même thèse. Pas optimal.' },
    ],
    explanation: 'Pour un SELL sur signal chandelier (étoile du soir), le stop va au-dessus du plus haut du pattern. C\'est là que le signal est invalide.',
  },
  {
    entry: 2370,
    direction: 'buy',
    context: 'Zone de demande 2365-2368',
    options: [
      { label: '2363 (-7)', value: 2363, correct: true, reason: 'Stop sous la zone de demande (2365-2368). Si cette zone casse, les acheteurs sont vaincus.' },
      { label: '2367 (-3)', value: 2367, correct: false, reason: 'Stop à l\'intérieur de la zone de demande = trop serré, le bruit du marché peut te sortir.' },
      { label: '2355 (-15)', value: 2355, correct: false, reason: 'Stop trop loin de la structure. Ratio R:R dégradé sans raison technique.' },
    ],
    explanation: 'Pour un BUY depuis une zone de demande, le stop va sous toute la zone. Si la zone est brisée, les acheteurs ont perdu le contrôle.',
  },
  {
    entry: 2395,
    direction: 'sell',
    context: 'Zone d\'offre 2395-2398',
    options: [
      { label: '2400 (+5)', value: 2400, correct: true, reason: 'Stop au-dessus de la zone d\'offre. Si le prix casse au-dessus de 2398, les vendeurs ont perdu.' },
      { label: '2390 (-5)', value: 2390, correct: false, reason: 'Stop sous le prix pour un SELL = dans le sens du trade. Cela ne protège rien.' },
      { label: '2392 (-3)', value: 2392, correct: false, reason: 'Stop sous le prix d\'entrée pour un SELL signifie que tu perdrais si le prix baisse. Absurde.' },
    ],
    explanation: 'Pour un SELL depuis une zone d\'offre, le stop se place au-dessus de la zone entière. C\'est le niveau qui invalide ton analyse vendeuse.',
  },
  {
    entry: 2345,
    direction: 'buy',
    context: 'Support historique majeur à 2340',
    options: [
      { label: '2339 (-6)', value: 2339, correct: true, reason: 'Stop sous le support majeur à 2340. Une cassure de ce niveau invalide la hausse.' },
      { label: '2348 (+3)', value: 2348, correct: false, reason: 'Stop au-dessus du prix pour un BUY = sortie immédiate en perte. Logiquement impossible.' },
      { label: '2330 (-15)', value: 2330, correct: false, reason: 'Trop loin. Ratio R:R est dégradé. Cherche le niveau technique le plus proche.' },
    ],
    explanation: 'Plus le support est majeur et historique, plus le stop juste en dessous est fiable. Si ce niveau cède, la tendance baissière est confirmée.',
  },
];

export function StopLossGame({ onComplete, startTime, duration }: Props) {
  const [scenario] = useState(() => SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = useCallback((optionValue: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(optionValue);
    const opt = scenario.options.find(o => o.value === optionValue);
    const correct = opt?.correct ?? false;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const timeBonus = Math.round(remaining / duration * 60);
    const score = correct ? 100 + timeBonus : 0;
    const stars = correct ? (remaining > duration * 0.6 ? 3 : remaining > duration * 0.3 ? 2 : 1) : 0;

    setTimeout(() => {
      onComplete({
        score,
        stars,
        xpEarned: correct ? 100 + timeBonus : 10,
        coinsEarned: correct ? 20 + Math.round(timeBonus / 3) : 2,
        timeTaken: elapsed,
        correct,
        explanation: correct ? scenario.explanation : (opt?.reason ?? scenario.explanation),
      });
    }, 1000);
  }, [answered, scenario, startTime, duration, onComplete]);

  const isBuy = scenario.direction === 'buy';

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center">
        <p className="text-white font-semibold text-lg">Où placer ton Stop Loss ?</p>
        <p className="text-gray-400 text-sm mt-1">XAUUSD • Entrée : {scenario.entry}</p>
      </div>

      <div className="rounded-2xl p-4 border border-white/10" style={{ background: '#0F172A' }}>
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs text-gray-400">Position ouverte</span>
          <span
            className="px-3 py-1 rounded-full text-xs font-bold"
            style={{ background: isBuy ? '#10B98120' : '#EF444420', color: isBuy ? '#10B981' : '#EF4444' }}
          >
            {isBuy ? '▲ BUY' : '▼ SELL'}
          </span>
        </div>
        <div className="flex justify-between items-center mb-3">
          <div>
            <p className="text-xs text-gray-500">Symbole</p>
            <p className="text-white font-bold">XAUUSD</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Prix d'entrée</p>
            <p className="text-white font-bold">{scenario.entry}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Volume</p>
            <p className="text-white font-bold">0.01</p>
          </div>
        </div>
        <div className="rounded-lg px-3 py-2" style={{ background: '#1E293B' }}>
          <p className="text-xs text-cyan-400">{scenario.context}</p>
        </div>
      </div>

      <p className="text-center text-sm text-gray-300 flex items-center justify-center gap-2">
        <Shield size={14} className="text-cyan-400" />
        Choisis le niveau de Stop Loss optimal
      </p>

      <div className="flex flex-col gap-2">
        {scenario.options.map(opt => {
          const isSelected = selected === opt.value;
          const showResult = answered;
          let bg = '#1F2937';
          let border = '#374151';
          let textColor = '#D1D5DB';
          if (showResult && opt.correct) { bg = '#10B98120'; border = '#10B98150'; textColor = '#10B981'; }
          if (showResult && isSelected && !opt.correct) { bg = '#EF444420'; border = '#EF444450'; textColor = '#EF4444'; }

          return (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              disabled={answered}
              className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 active:scale-98"
              style={{ background: bg, border: `1.5px solid ${border}`, color: textColor }}
            >
              <span className="font-semibold">{opt.label}</span>
              {showResult && opt.correct && <span className="text-green-400 text-sm">✓ Correct</span>}
              {showResult && isSelected && !opt.correct && <span className="text-red-400 text-sm">✗ Incorrect</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
