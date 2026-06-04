import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';
import type { MissionResult } from '../../types/game';

interface Props {
  onComplete: (result: Omit<MissionResult, 'badgeEarned'>) => void;
  startTime: number;
  duration: number;
}

interface ErrorScenario {
  story: string;
  options: { label: string; correct: boolean }[];
  explanation: string;
}

const SCENARIOS: ErrorScenario[] = [
  {
    story: 'Marc ouvre un BUY sur XAUUSD à 2389. L\'or monte à 2395. Excité, il augmente son lot de 0.01 à 0.5 et ouvre un nouveau BUY. L\'or retombe à 2380 et il perd tout + plus.',
    options: [
      { label: 'Il n\'a pas mis de Take Profit', correct: false },
      { label: 'Il a surlevéragé en plein profit sans plan', correct: true },
      { label: 'Il a acheté au mauvais moment', correct: false },
      { label: 'Il utilisait le mauvais symbole', correct: false },
    ],
    explanation: 'Erreur classique : doubler la mise après un gain. Le marché peut toujours se retourner. Respecte toujours ton plan de trading !',
  },
  {
    story: 'Sophie voit que l\'or monte depuis 3 jours. Elle ouvre un BUY avec tout son compte (2% de marge). L\'or corrige légèrement : -15 points. Son stop loss saute, elle perd 40% de son capital.',
    options: [
      { label: 'Son analyse était fausse', correct: false },
      { label: 'Elle a trop risqué sur un seul trade', correct: true },
      { label: 'Elle aurait dû vendre à la place', correct: false },
      { label: 'Elle n\'a pas attendu assez longtemps', correct: false },
    ],
    explanation: 'Règle d\'or : ne jamais risquer plus de 1-2% de son capital sur un seul trade. La gestion du risque prime sur tout !',
  },
  {
    story: 'Alex a une position SELL ouverte. Il voit une grande bougie verte et panique. Il ferme son trade en perte juste avant que le marché reprenne sa tendance baissière.',
    options: [
      { label: 'Son stop loss était mal placé', correct: false },
      { label: 'Il a laissé ses émotions guider sa décision', correct: true },
      { label: 'Il aurait dû utiliser un autre timeframe', correct: false },
      { label: 'Il n\'avait pas de take profit', correct: false },
    ],
    explanation: 'Les émotions sont le pire ennemi du trader. Une seule bougie ne change pas la tendance. Respecte ton plan !',
  },
  {
    story: 'Lucas place un stop loss à -50 points sur XAUUSD. Il utilise un lot de 0.1. Stop 50 pts × 0.1 lot = 500$ de perte possible sur un compte de 300$.',
    options: [
      { label: 'Son stop loss est bien placé', correct: false },
      { label: 'Il n\'a pas calculé le risque en dollars', correct: true },
      { label: 'Il devrait utiliser un lot plus grand', correct: false },
      { label: 'Il aurait dû attendre le lendemain', correct: false },
    ],
    explanation: 'Toujours calculer le risque en argent réel ! Stop Loss (pts) × Lot × Valeur du pip = risque en dollars.',
  },
  {
    story: 'Karim ouvre 5 trades simultanément sur XAUUSD, EURUSD, BTCUSD, GBPUSD et USDJPY. Quand le dollar monte, toutes ses positions perdent en même temps.',
    options: [
      { label: 'Il a trop de trades gagnants', correct: false },
      { label: 'Toutes ses paires sont corrélées au dollar', correct: true },
      { label: 'Il aurait dû trader uniquement l\'or', correct: false },
      { label: 'Il a ouvert les trades trop vite', correct: false },
    ],
    explanation: 'La corrélation : plusieurs paires liées au dollar bougent ensemble. Diversifier ne sert à rien si tout est corrélé au même actif !',
  },
  {
    story: 'Yasmine voit une news économique importante dans 5 minutes. Elle ouvre un gros SELL juste avant. La news est positive pour l\'or, il monte de 40 points et son stop saute.',
    options: [
      { label: 'Elle aurait dû acheter à la place', correct: false },
      { label: 'Trader avant une news majeure sans protection est très risqué', correct: true },
      { label: 'Son take profit était trop petit', correct: false },
      { label: 'Elle a utilisé le mauvais timeframe', correct: false },
    ],
    explanation: 'Les news (NFP, CPI, Fed) créent des pics de volatilité imprévisibles. Mieux vaut attendre après la news ou élargir son stop loss.',
  },
  {
    story: 'Omar fait 3 trades gagnants de suite. Au 4e il est trop confiant et risque 10% de son capital. Ce trade perd et efface tous ses gains précédents.',
    options: [
      { label: 'Il a mal analysé le graphique', correct: false },
      { label: 'La surconfiance a dérèglé sa gestion du risque', correct: true },
      { label: 'Il aurait dû prendre 5 trades', correct: false },
      { label: 'Il n\'avait pas de stop loss', correct: false },
    ],
    explanation: 'Après une série gagnante, la surconfiance est dangereuse. Garde toujours le même % de risque par trade, peu importe les résultats précédents.',
  },
  {
    story: 'Fatima voit l\'or à 2400. Elle se dit "il a déjà monté de 50 points, il ne peut pas monter encore" et ouvre un SELL. L\'or monte encore à 2430 et son stop saute.',
    options: [
      { label: 'Son timing était parfait', correct: false },
      { label: 'Elle a raisonné selon le biais "trop haut = doit baisser"', correct: true },
      { label: 'Elle aurait dû utiliser un plus grand lot', correct: false },
      { label: 'Son stop loss était trop proche', correct: false },
    ],
    explanation: '"Le prix ne peut pas monter encore" est un biais cognitif. Une tendance forte peut continuer bien plus longtemps qu\'on ne le pense.',
  },
  {
    story: 'Julien ouvre un BUY à 2395. Il fixe un Take Profit à 2397 (+2 pts) et un Stop Loss à 2380 (-15 pts). Même en gagnant souvent, il perd de l\'argent globalement.',
    options: [
      { label: 'Son analyse technique est mauvaise', correct: false },
      { label: 'Son ratio risque/récompense est négatif (risque 15, gagne 2)', correct: true },
      { label: 'Il devrait supprimer son stop loss', correct: false },
      { label: 'Il ouvre trop de trades', correct: false },
    ],
    explanation: 'Ratio risque/récompense : risquer 15 pts pour gagner 2 pts est catastrophique. Vise minimum 1:2 (risque 10, vise 20 pts de profit).',
  },
  {
    story: 'Nadia regarde le graphique M1 et voit 10 bougies rouges de suite. Elle ouvre un SELL. Sur le H4, l\'or est en forte tendance haussière. Son trade perd.',
    options: [
      { label: 'Elle a bien suivi la tendance', correct: false },
      { label: 'Elle a tradé contre la tendance du timeframe supérieur', correct: true },
      { label: 'Le M1 est le meilleur timeframe', correct: false },
      { label: 'Elle aurait dû attendre plus longtemps', correct: false },
    ],
    explanation: 'Le timeframe petit doit confirmer la tendance du grand. Sur M1 contre H4 en hausse = trade contre-tendance = dangereux.',
  },
  {
    story: 'Rayan perd 3 trades de suite. Frustré, il double son lot pour "se refaire". Il perd encore. Il redouble. En 1 heure, il a perdu 60% de son compte.',
    options: [
      { label: 'Il avait une mauvaise stratégie', correct: false },
      { label: 'Il a appliqué un système Martingale émotionnel', correct: true },
      { label: 'Il aurait dû changer de symbole', correct: false },
      { label: 'Il manquait d\'expérience sur MT5', correct: false },
    ],
    explanation: 'Doubler après une perte (Martingale) est l\'une des façons les plus rapides de vider un compte. Après une perte, reviens à ton lot de base.',
  },
  {
    story: 'Ines ouvre un trade et va dormir sans stop loss car "l\'or ne bouge pas beaucoup la nuit". Au réveil, une news asiatique a fait bouger l\'or de 80 points et son compte est à -90%.',
    options: [
      { label: 'Elle aurait dû surveiller le graphique', correct: false },
      { label: 'Laisser un trade ouvert sans stop loss est suicidaire', correct: true },
      { label: 'Elle a choisi le mauvais horaire', correct: false },
      { label: 'Son lot était trop petit', correct: false },
    ],
    explanation: 'Le stop loss est obligatoire sur TOUT trade overnight. Les marchés bougent 24h/24 et des événements imprévisibles peuvent survenir à tout moment.',
  },
  {
    story: 'Thomas voit une vidéo YouTube qui montre un "signal sûr à 95%". Il investit 500$ sur ce signal sans vérifier le graphique. C\'est un piège, il perd tout.',
    options: [
      { label: 'Il a bien suivi un expert', correct: false },
      { label: 'Il a investi sans analyser ni comprendre le trade', correct: true },
      { label: 'Il aurait dû investir plus', correct: false },
      { label: 'Il n\'avait pas assez de capital', correct: false },
    ],
    explanation: 'Aucun signal n\'est sûr à 95%. Comprendre toi-même pourquoi tu prends un trade est essentiel. Dépendre des signaux sans comprendre = danger.',
  },
  {
    story: 'Leila a 200$ sur son compte. Elle ouvre un lot de 1.0 sur XAUUSD (marge requise ~2000$). MT5 accepte grâce au levier. Un mouvement de 2 points déclenche un margin call.',
    options: [
      { label: 'Elle a bien utilisé le levier', correct: false },
      { label: 'Elle a sursizé sa position par rapport à son capital', correct: true },
      { label: 'Son stop loss était trop serré', correct: false },
      { label: 'XAUUSD n\'est pas bon pour les petits comptes', correct: false },
    ],
    explanation: 'Avec 200$, un lot de 0.01 est adapté (marge ~20$). Un lot de 1.0 avec 200$ = levier ×100 = la moindre correction vide le compte.',
  },
  {
    story: 'David voit l\'or baisser depuis 2 semaines. Il ouvre un SELL au bas d\'une grande bougie rouge. Au lieu de continuer à baisser, l\'or rebondit de 30 points et son stop saute.',
    options: [
      { label: 'Il a bien suivi la tendance baissière', correct: false },
      { label: 'Il a entré après une grosse bougie, au pire moment', correct: true },
      { label: 'Son stop était trop proche', correct: false },
      { label: 'Il aurait dû attendre un signal haussier', correct: false },
    ],
    explanation: 'Entrer après une grande bougie = entrer trop tard. Le prix a besoin d\'une consolidation ou d\'un retrace avant de continuer la tendance.',
  },
  {
    story: 'Amira clôture manuellement chaque trade dès qu\'il est à +3 points, même si son TP était à +20. Elle a 80% de trades gagnants mais perd de l\'argent chaque mois.',
    options: [
      { label: 'Son taux de réussite est trop bas', correct: false },
      { label: 'Elle coupe ses profits trop vite et laisse courir ses pertes', correct: true },
      { label: 'Elle devrait augmenter son TP à +50 pts', correct: false },
      { label: 'Elle fait trop de trades par jour', correct: false },
    ],
    explanation: 'Couper ses profits trop vite tout en laissant les pertes courir détruit le ratio R:R. Laisse tes gagnants atteindre leur cible et coupe tes perdants rapidement.',
  },
];

export function BeginnerErrorGame({ onComplete, startTime, duration }: Props) {
  const [scenario] = useState(() => SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)]);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);

  const handleAnswer = useCallback((index: number) => {
    if (answered) return;
    setAnswered(true);
    setSelected(index);
    const correct = scenario.options[index].correct;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const timeBonus = Math.round(remaining / duration * 45);
    const score = correct ? 100 + timeBonus : 0;
    const stars = correct ? (remaining > duration * 0.6 ? 3 : remaining > duration * 0.3 ? 2 : 1) : 0;

    setTimeout(() => {
      onComplete({
        score,
        stars,
        xpEarned: correct ? 70 + timeBonus : 8,
        coinsEarned: correct ? 15 + Math.round(timeBonus / 3) : 2,
        timeTaken: elapsed,
        correct,
        explanation: scenario.explanation,
      });
    }, 900);
  }, [answered, scenario, startTime, duration, onComplete]);

  return (
    <div className="flex flex-col gap-5">
      <div className="text-center flex items-center justify-center gap-2">
        <AlertTriangle size={18} className="text-yellow-400" />
        <p className="text-white font-semibold">Identifie l'erreur !</p>
      </div>

      <div className="rounded-2xl p-4 border border-yellow-500/20" style={{ background: '#1C1407' }}>
        <p className="text-sm text-yellow-100 leading-relaxed">{scenario.story}</p>
      </div>

      <p className="text-center text-sm text-gray-400">Quelle est la principale erreur commise ?</p>

      <div className="flex flex-col gap-2">
        {scenario.options.map((opt, i) => {
          const isSelected = selected === i;
          const showResult = answered;
          let bg = '#1F2937';
          let border = '#374151';
          let textColor = '#D1D5DB';
          if (showResult && opt.correct) { bg = '#10B98120'; border = '#10B98150'; textColor = '#10B981'; }
          if (showResult && isSelected && !opt.correct) { bg = '#EF444420'; border = '#EF444450'; textColor = '#EF4444'; }

          return (
            <button
              key={i}
              onClick={() => handleAnswer(i)}
              disabled={answered}
              className="flex items-center justify-between px-4 py-3 rounded-xl text-left transition-all duration-200 active:scale-98"
              style={{ background: bg, border: `1.5px solid ${border}`, color: textColor }}
            >
              <span className="text-sm">{opt.label}</span>
              {showResult && opt.correct && <span className="text-green-400 text-xs ml-2 flex-shrink-0">✓</span>}
              {showResult && isSelected && !opt.correct && <span className="text-red-400 text-xs ml-2 flex-shrink-0">✗</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
