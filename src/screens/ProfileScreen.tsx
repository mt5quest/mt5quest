import { Flame, Trophy, Target, Zap, Star, Edit2 } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { getRankForXP, getNextRank } from '../data/missions';
import { ProgressBar } from '../components/ui/ProgressBar';
import { AnimatedNumber } from '../components/ui/AnimatedNumber';

export function ProfileScreen() {
  const { state } = useGame();
  const profile = state.profile!;
  const rank = getRankForXP(profile.xp);
  const nextRank = getNextRank(profile.xp);
  const accuracy = profile.total_missions > 0
    ? Math.round((profile.total_correct / profile.total_missions) * 100)
    : 0;
  const earnedBadges = state.badges.filter(b => b.earned).length;

  const stats = [
    { label: 'Missions', value: profile.total_missions, icon: Target, color: '#06B6D4' },
    { label: 'Série max', value: profile.max_streak, icon: Flame, color: '#EF4444', suffix: 'j' },
    { label: 'Précision', value: accuracy, icon: Star, color: '#F59E0B', suffix: '%' },
    { label: 'Badges', value: earnedBadges, icon: Trophy, color: '#10B981' },
    { label: 'XP Total', value: profile.xp, icon: Zap, color: '#8B5CF6' },
    { label: 'Pièces', value: profile.coins, icon: () => <span>🪙</span>, color: '#F59E0B' },
  ];

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#0A0F1E' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-6 text-center">
        <div className="relative inline-block mb-4">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-4xl mx-auto"
            style={{ background: `${rank.color}20`, border: `3px solid ${rank.color}50` }}
          >
            {rank.icon}
          </div>
          <div
            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#0F172A', border: `2px solid ${rank.color}` }}
          >
            <Edit2 size={12} style={{ color: rank.color }} />
          </div>
        </div>
        <h2 className="text-white text-2xl font-bold">{profile.username}</h2>
        <p className="font-semibold mt-1" style={{ color: rank.color }}>{rank.name}</p>
        <div className="flex items-center justify-center gap-2 mt-1">
          <Flame size={14} className="text-orange-400" />
          <span className="text-orange-400 text-sm font-medium">{profile.streak} jours de suite</span>
        </div>
      </div>

      {/* XP bar */}
      {nextRank && (
        <div className="mx-4 mb-4 rounded-2xl p-4" style={{ background: '#0F172A', border: `1px solid ${rank.color}20` }}>
          <div className="flex justify-between text-xs text-gray-400 mb-2">
            <span>{rank.name}</span>
            <span>{profile.xp} / {nextRank.minXP} XP</span>
          </div>
          <ProgressBar
            value={profile.xp - rank.minXP}
            max={nextRank.minXP - rank.minXP}
            color={rank.color}
          />
          <p className="text-xs text-gray-500 mt-1 text-right">
            Prochain rang : <span style={{ color: rank.color }}>{nextRank.name}</span>
          </p>
        </div>
      )}

      {/* Stats grid */}
      <div className="px-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Statistiques</h3>
        <div className="grid grid-cols-3 gap-3">
          {stats.map(stat => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="rounded-xl p-3 text-center"
                style={{ background: '#0F172A', border: '1px solid #ffffff08' }}
              >
                <div className="flex justify-center mb-1">
                  <Icon size={18} color={stat.color} />
                </div>
                <p className="text-white font-bold text-lg">
                  <AnimatedNumber value={stat.value} />
                  {stat.suffix || ''}
                </p>
                <p className="text-gray-500 text-xs">{stat.label}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent badges */}
      <div className="px-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Badges récents</h3>
        {earnedBadges === 0 ? (
          <div className="rounded-xl p-6 text-center" style={{ background: '#0F172A', border: '1px solid #ffffff08' }}>
            <p className="text-gray-500 text-sm">Aucun badge encore — joue pour en gagner !</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-3">
            {state.badges
              .filter(b => b.earned)
              .slice(-6)
              .map(badge => (
                <div
                  key={badge.id}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl"
                  style={{ background: `${badge.color}15`, border: `1px solid ${badge.color}30` }}
                >
                  <span className="text-xl">{badge.icon}</span>
                  <span className="text-xs font-medium" style={{ color: badge.color }}>{badge.name}</span>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Disclaimer */}
      <div className="mx-4 p-3 rounded-xl" style={{ background: '#0F172A', border: '1px solid #374151' }}>
        <p className="text-xs text-gray-500 text-center leading-relaxed">
          Application éducative — pas un conseil financier.<br />
          Le trading comporte un risque de perte de capital.
        </p>
      </div>
    </div>
  );
}
