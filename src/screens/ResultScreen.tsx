import { useEffect, useState } from 'react';
import { RotateCcw, ChevronRight, Home, Zap, Coins } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Stars } from '../components/ui/Stars';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';
import { MISSIONS } from '../data/missions';

export function ResultScreen() {
  const { state, navigate, startMission } = useGame();
  const result = state.lastResult!;
  const [showDetails, setShowDetails] = useState(false);
  const [badgeAnim, setBadgeAnim] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowDetails(true), 300);
    const t2 = setTimeout(() => setBadgeAnim(true), 600);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, []);

  const isSuccess = result.correct;
  const earnedBadge = state.badges.find(b => b.earned && b.earnedAt && Date.now() - new Date(b.earnedAt).getTime() < 5000);

  const nextMission = MISSIONS.find(m => m.id !== state.currentMission?.id);

  return (
    <div className="flex flex-col min-h-screen pb-24 overflow-y-auto" style={{ background: '#0A0F1E' }}>
      {/* Result banner */}
      <div
        className="relative overflow-hidden pt-14 pb-8 px-4 text-center"
        style={{
          background: isSuccess
            ? 'linear-gradient(180deg, #052E16 0%, #0A0F1E 100%)'
            : 'linear-gradient(180deg, #1C0A0A 0%, #0A0F1E 100%)',
        }}
      >
        {/* Animated bg glow */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            background: isSuccess
              ? 'radial-gradient(circle at 50% 0%, #10B981, transparent 60%)'
              : 'radial-gradient(circle at 50% 0%, #EF4444, transparent 60%)',
          }}
        />

        <div className="relative">
          <div
            className="text-6xl mb-3 transition-all duration-500"
            style={{ transform: showDetails ? 'scale(1)' : 'scale(0.5)', opacity: showDetails ? 1 : 0 }}
          >
            {isSuccess ? '🎉' : '💪'}
          </div>
          <h1
            className="text-3xl font-black mb-1 transition-all duration-500"
            style={{
              color: isSuccess ? '#10B981' : '#EF4444',
              transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
              opacity: showDetails ? 1 : 0,
            }}
          >
            {isSuccess ? 'Bravo !' : 'Essaie encore !'}
          </h1>
          <p className="text-gray-400 text-sm">
            {isSuccess ? 'Excellente réponse !' : 'Tu progresses à chaque essai'}
          </p>
        </div>
      </div>

      {/* Score & stars */}
      <div
        className="mx-4 -mt-2 rounded-2xl p-5 flex flex-col items-center gap-4 transition-all duration-500"
        style={{
          background: '#0F172A',
          border: `1px solid ${isSuccess ? '#10B98130' : '#EF444430'}`,
          transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
          opacity: showDetails ? 1 : 0,
        }}
      >
        <Stars count={result.stars} size={32} />

        <div className="text-center">
          <AnimatedNumber value={result.score} className="text-4xl font-black text-white" />
          <p className="text-gray-400 text-sm">points</p>
        </div>

        <div className="flex gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#10B98120' }}>
              <Zap size={16} className="text-green-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">XP gagnés</p>
              <p className="text-white font-bold">+<AnimatedNumber value={result.xpEarned} /></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#F59E0B20' }}>
              <Coins size={16} className="text-yellow-400" />
            </div>
            <div>
              <p className="text-xs text-gray-400">Pièces</p>
              <p className="text-white font-bold">+<AnimatedNumber value={result.coinsEarned} /></p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EF444420' }}>
              <span className="text-sm">⚡</span>
            </div>
            <div>
              <p className="text-xs text-gray-400">Combo</p>
              <p className="text-white font-bold">x{state.combo || 1}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Badge earned */}
      {earnedBadge && (
        <div
          className="mx-4 mt-3 rounded-2xl p-4 flex items-center gap-3 transition-all duration-700"
          style={{
            background: `${earnedBadge.color}15`,
            border: `1px solid ${earnedBadge.color}40`,
            transform: badgeAnim ? 'scale(1)' : 'scale(0.8)',
            opacity: badgeAnim ? 1 : 0,
          }}
        >
          <span className="text-3xl">{earnedBadge.icon}</span>
          <div>
            <p className="text-xs text-gray-400">Badge débloqué !</p>
            <p className="font-bold" style={{ color: earnedBadge.color }}>{earnedBadge.name}</p>
            <p className="text-xs text-gray-400">{earnedBadge.description}</p>
          </div>
        </div>
      )}

      {/* Explanation */}
      <div
        className="mx-4 mt-3 rounded-2xl p-4 transition-all duration-500"
        style={{
          background: '#0F172A',
          border: '1px solid #ffffff08',
          transitionDelay: '200ms',
          transform: showDetails ? 'translateY(0)' : 'translateY(20px)',
          opacity: showDetails ? 1 : 0,
        }}
      >
        <p className="text-xs text-cyan-400 font-semibold mb-1">À retenir :</p>
        <p className="text-gray-300 text-sm leading-relaxed">{result.explanation}</p>
      </div>

      {/* Combo indicator */}
      {state.combo > 1 && (
        <div className="mx-4 mt-3 rounded-xl p-3 flex items-center justify-center gap-2" style={{ background: '#1C1407', border: '1px solid #F59E0B30' }}>
          <span className="text-yellow-400 text-sm font-bold">🔥 Série de {state.combo} — Continue comme ça !</span>
        </div>
      )}

      {/* CTA buttons */}
      <div className="px-4 mt-5 flex flex-col gap-3">
        {state.currentMission && (
          <button
            onClick={() => startMission(state.currentMission!)}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', boxShadow: '0 6px 24px #06B6D430' }}
          >
            <RotateCcw size={18} />
            Rejouer
          </button>
        )}
        {nextMission && (
          <button
            onClick={() => startMission(nextMission)}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95"
            style={{ background: '#0F172A', border: '1px solid #06B6D430' }}
          >
            Mission suivante
            <ChevronRight size={18} />
          </button>
        )}
        <button
          onClick={() => navigate('hub')}
          className="w-full py-3 rounded-xl text-gray-400 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Home size={16} />
          Accueil
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-center text-xs text-gray-600 px-4 mt-4 mb-2">
        Application éducative — pas un conseil financier
      </p>
    </div>
  );
}
