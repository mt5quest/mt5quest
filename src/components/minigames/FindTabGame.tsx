import { useState, useCallback } from 'react';
import { BarChart2, Clock, ArrowLeftRight, BookOpen, Settings } from 'lucide-react';
import type { MissionResult } from '../../types/game';

interface Props {
  onComplete: (result: Omit<MissionResult, 'badgeEarned'>) => void;
  startTime: number;
  duration: number;
}

const TABS = [
  { id: 'quotes', label: 'Cotations', icon: BarChart2, color: '#06B6D4' },
  { id: 'charts', label: 'Graphiques', icon: BarChart2, color: '#10B981' },
  { id: 'trade', label: 'Transaction', icon: ArrowLeftRight, color: '#F59E0B' },
  { id: 'history', label: 'Historique', icon: Clock, color: '#EF4444' },
  { id: 'news', label: 'Actualités', icon: BookOpen, color: '#8B5CF6' },
];

const QUESTIONS = [
  { question: 'Quel onglet affiche les graphiques en temps réel ?', answer: 'charts' },
  { question: 'Où trouves-tu la liste des prix des symboles ?', answer: 'quotes' },
  { question: 'Dans quel onglet passer un ordre d\'achat ou de vente ?', answer: 'trade' },
  { question: 'Quel onglet montre tes ordres passés ?', answer: 'history' },
  { question: 'Où consulter les nouvelles du marché ?', answer: 'news' },
  { question: 'Tu veux surveiller le prix de l\'or en direct. Quel onglet ?', answer: 'quotes' },
  { question: 'Quel onglet utilises-tu pour analyser la tendance de XAUUSD ?', answer: 'charts' },
  { question: 'Tu veux fermer une position ouverte. Quel onglet ?', answer: 'trade' },
  { question: 'Tu cherches ton trade gagnant d\'hier. Quel onglet ?', answer: 'history' },
  { question: 'Une annonce de la Fed est publiée. Où la lire dans MT5 ?', answer: 'news' },
  { question: 'Tu veux ajouter XAUUSD à ta watchlist. Quel onglet ?', answer: 'quotes' },
  { question: 'Tu veux placer un ordre en attente (pending order). Quel onglet ?', answer: 'trade' },
  { question: 'Quel onglet montre le spread BID/ASK de chaque paire ?', answer: 'quotes' },
  { question: 'Tu veux modifier le Stop Loss d\'un trade ouvert. Quel onglet ?', answer: 'trade' },
  { question: 'Quel onglet te permet de changer le timeframe du graphique ?', answer: 'charts' },
  { question: 'Tu veux vérifier ton profit total du mois. Quel onglet ?', answer: 'history' },
  { question: 'Tu cherches un événement économique qui a causé un pic. Quel onglet ?', answer: 'news' },
  { question: 'Où vois-tu le prix actuel de BTCUSD en temps réel ?', answer: 'quotes' },
];

export function FindTabGame({ onComplete, startTime, duration }: Props) {
  const [q] = useState(() => QUESTIONS[Math.floor(Math.random() * QUESTIONS.length)]);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const handleAnswer = useCallback((tabId: string) => {
    if (answered) return;
    setAnswered(true);
    setSelected(tabId);
    const correct = tabId === q.answer;
    const elapsed = Math.round((Date.now() - startTime) / 1000);
    const remaining = Math.max(0, duration - elapsed);
    const timeBonus = Math.round(remaining / duration * 30);
    const score = (correct ? 100 : 0) + (correct ? timeBonus : 0);
    const stars = correct ? (remaining > duration * 0.6 ? 3 : remaining > duration * 0.3 ? 2 : 1) : 0;

    setTimeout(() => {
      onComplete({
        score,
        stars,
        xpEarned: correct ? 50 + timeBonus : 5,
        coinsEarned: correct ? 10 + Math.round(timeBonus / 3) : 1,
        timeTaken: elapsed,
        correct,
        explanation: correct
          ? `Excellent ! L'onglet "${TABS.find(t => t.id === q.answer)?.label}" est bien la bonne réponse.`
          : `L'onglet correct était "${TABS.find(t => t.id === q.answer)?.label}". Mémorise bien l'interface MT5 !`,
      });
    }, 900);
  }, [answered, q, startTime, duration, onComplete]);

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-2xl overflow-hidden border border-white/10" style={{ background: '#0F172A' }}>
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
          <span className="text-xs text-gray-400">MetaTrader 5</span>
          <span className="text-xs text-green-400">● Connecté</span>
        </div>
        <div className="flex justify-around py-3">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isAnswer = tab.id === q.answer;
            const isSelected = tab.id === selected;
            let bg = 'transparent';
            let textColor = '#9CA3AF';
            if (answered && isAnswer) { bg = '#10B98120'; textColor = '#10B981'; }
            if (answered && isSelected && !isAnswer) { bg = '#EF444420'; textColor = '#EF4444'; }
            return (
              <button
                key={tab.id}
                onClick={() => handleAnswer(tab.id)}
                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all duration-200 active:scale-95"
                style={{ background: bg, minWidth: 52 }}
              >
                <Icon size={20} style={{ color: answered ? textColor : tab.color }} />
                <span className="text-xs" style={{ color: answered ? textColor : '#D1D5DB' }}>
                  {tab.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="text-center">
        <p className="text-lg font-semibold text-white leading-snug">{q.question}</p>
        <p className="text-sm text-gray-400 mt-2">Appuie sur le bon onglet ci-dessus</p>
      </div>

      {answered && (
        <div
          className="rounded-xl p-4 text-center text-sm font-medium"
          style={{
            background: selected === q.answer ? '#10B98120' : '#EF444420',
            color: selected === q.answer ? '#10B981' : '#EF4444',
            border: `1px solid ${selected === q.answer ? '#10B98140' : '#EF444440'}`,
          }}
        >
          {selected === q.answer ? '✓ Bonne réponse !' : '✗ Pas tout à fait...'}
        </div>
      )}
    </div>
  );
}
