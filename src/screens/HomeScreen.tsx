import { Flame, Coins, Star, ChevronRight, Target, Calendar } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/ui/ProgressBar';
import { getRankForXP, getNextRank, MISSIONS } from '../data/missions';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

export function HomeScreen() {
  const { state, navigate, startMission } = useGame();
  const profile = state.profile!;
  const rank = getRankForXP(profile.xp);
  const nextRank = getNextRank(profile.xp);
  const xpInRank = profile.xp - rank.minXP;
  const xpToNext = nextRank ? nextRank.minXP - rank.minXP : 1;
  const dailyProgress = state.dailyMission.completed;
  const dailyRequired = state.dailyMission.required;

  const randomMission = MISSIONS[Math.floor(Math.random() * MISSIONS.length)];

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: 'linear-gradient(180deg, #0A0F1E 0%, #0D1526 100%)' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-gray-400 text-sm">Bonjour,</p>
            <h1 className="text-white text-2xl font-bold">{profile.username}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: '#1C1407', border: '1px solid #F59E0B30' }}>
              <Coins size={16} className="text-yellow-400" />
              <AnimatedNumber value={profile.coins} className="text-yellow-400 font-bold text-sm" />
            </div>
            <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl" style={{ background: '#1C0A07', border: '1px solid #EF444430' }}>
              <Flame size={16} className="text-orange-400" />
              <span className="text-orange-400 font-bold text-sm">{profile.streak}j</span>
            </div>
          </div>
        </div>

        {/* Rank card */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: 'linear-gradient(135deg, #0F172A 0%, #1E293B 100%)', border: '1px solid #ffffff10' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{rank.icon}</span>
              <div>
                <p className="text-xs text-gray-400">Rang actuel</p>
                <p className="font-bold" style={{ color: rank.color }}>{rank.name}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-400">XP Total</p>
              <AnimatedNumber value={profile.xp} className="text-white font-bold" />
            </div>
          </div>
          {nextRank && (
            <>
              <ProgressBar value={xpInRank} max={xpToNext} color={rank.color} className="mb-1" />
              <p className="text-xs text-gray-500">
                {xpToNext - xpInRank} XP pour <span style={{ color: rank.color }}>{nextRank.name}</span>
              </p>
            </>
          )}
          {!nextRank && (
            <p className="text-xs text-center" style={{ color: rank.color }}>Rang maximum atteint ! 👑</p>
          )}
        </div>

        {/* Daily mission */}
        <div
          className="rounded-2xl p-4 mb-4"
          style={{ background: '#0F172A', border: '1px solid #06B6D430' }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-cyan-400" />
              <span className="text-white font-semibold text-sm">Mission du Jour</span>
            </div>
            <span className="text-cyan-400 text-xs font-bold">{dailyProgress}/{dailyRequired}</span>
          </div>
          <ProgressBar value={dailyProgress} max={dailyRequired} color="#06B6D4" className="mb-2" />
          {dailyProgress >= dailyRequired ? (
            <p className="text-xs text-center text-cyan-400">Mission complète ! +200 XP bonus</p>
          ) : (
            <p className="text-xs text-gray-400">Complète {dailyRequired - dailyProgress} mission(s) pour débloquer la récompense du jour</p>
          )}
        </div>
      </div>

      {/* Main CTA */}
      <div className="px-4">
        <button
          onClick={() => startMission(randomMission)}
          className="w-full py-5 rounded-2xl font-bold text-xl text-white flex items-center justify-center gap-3 transition-transform active:scale-95"
          style={{ background: 'linear-gradient(135deg, #06B6D4, #0891B2)', boxShadow: '0 8px 32px #06B6D440' }}
        >
          <Target size={24} />
          Jouer Maintenant
          <ChevronRight size={24} />
        </button>

        {/* Quick stats */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          <div className="rounded-xl p-3 text-center" style={{ background: '#0F172A', border: '1px solid #ffffff08' }}>
            <Star size={18} className="text-yellow-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{profile.total_missions}</p>
            <p className="text-gray-500 text-xs">Missions</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#0F172A', border: '1px solid #ffffff08' }}>
            <Flame size={18} className="text-orange-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">{profile.streak}</p>
            <p className="text-gray-500 text-xs">Série</p>
          </div>
          <div className="rounded-xl p-3 text-center" style={{ background: '#0F172A', border: '1px solid #ffffff08' }}>
            <Target size={18} className="text-cyan-400 mx-auto mb-1" />
            <p className="text-white font-bold text-lg">
              {profile.total_missions > 0 ? Math.round((profile.total_correct / profile.total_missions) * 100) : 0}%
            </p>
            <p className="text-gray-500 text-xs">Précision</p>
          </div>
        </div>

        <button
          onClick={() => navigate('hub')}
          className="w-full mt-3 py-3 rounded-xl text-gray-300 font-medium flex items-center justify-center gap-2 transition-all active:scale-95"
          style={{ background: '#0F172A', border: '1px solid #ffffff10' }}
        >
          Voir toutes les missions
          <ChevronRight size={16} />
        </button>
      </div>

      {/* Disclaimer */}
      <div className="mx-4 mt-6 p-3 rounded-xl" style={{ background: '#0F172A', border: '1px solid #374151' }}>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Application éducative — pas un conseil financier.<br />
          Le trading comporte un risque de perte de capital.
        </p>
      </div>
    </div>
  );
}
