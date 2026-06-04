import { useGame } from '../context/GameContext';
import { ProgressBar } from '../components/ui/ProgressBar';
import { RANKS, getRankForXP, getNextRank } from '../data/missions';
import { CheckCircle, Lock } from 'lucide-react';

export function ProgressionScreen() {
  const { state } = useGame();
  const profile = state.profile!;
  const currentRank = getRankForXP(profile.xp);
  const nextRank = getNextRank(profile.xp);

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#0A0F1E' }}>
      <div className="px-4 pt-12 pb-4">
        <h2 className="text-white text-2xl font-bold">Progression</h2>
        <p className="text-gray-400 text-sm mt-1">Ton parcours vers le rang Maître</p>
      </div>

      {/* Current XP */}
      <div className="mx-4 mb-6 rounded-2xl p-4" style={{ background: '#0F172A', border: '1px solid #ffffff08' }}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{currentRank.icon}</span>
            <p className="font-bold" style={{ color: currentRank.color }}>{currentRank.name}</p>
          </div>
          <p className="text-white font-bold">{profile.xp.toLocaleString('fr-FR')} XP</p>
        </div>
        {nextRank && (
          <>
            <ProgressBar
              value={profile.xp - currentRank.minXP}
              max={nextRank.minXP - currentRank.minXP}
              color={currentRank.color}
            />
            <p className="text-xs text-gray-500 mt-1">
              {(nextRank.minXP - profile.xp).toLocaleString('fr-FR')} XP jusqu'à <span style={{ color: currentRank.color }}>{nextRank.name}</span>
            </p>
          </>
        )}
      </div>

      {/* Rank ladder */}
      <div className="px-4 mb-6">
        <h3 className="text-white font-semibold mb-3">Échelle des Rangs</h3>
        <div className="flex flex-col gap-0">
          {RANKS.slice().reverse().map((rank, idx) => {
            const reached = profile.xp >= rank.minXP;
            const isCurrent = currentRank.name === rank.name;
            return (
              <div key={rank.name} className="flex items-center gap-3 relative">
                {/* Vertical line */}
                {idx < RANKS.length - 1 && (
                  <div
                    className="absolute left-5 top-10 w-0.5 h-8"
                    style={{ background: reached ? rank.color + '40' : '#374151' }}
                  />
                )}
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-lg z-10 flex-shrink-0"
                  style={{
                    background: reached ? `${rank.color}20` : '#1F2937',
                    border: `2px solid ${reached ? rank.color : '#374151'}`,
                    boxShadow: isCurrent ? `0 0 12px ${rank.color}60` : 'none',
                  }}
                >
                  {rank.icon}
                </div>
                <div
                  className="flex-1 flex items-center justify-between py-3 px-3 rounded-xl mb-2"
                  style={{
                    background: isCurrent ? `${rank.color}10` : 'transparent',
                    border: isCurrent ? `1px solid ${rank.color}30` : '1px solid transparent',
                  }}
                >
                  <div>
                    <p className="font-semibold text-sm" style={{ color: reached ? rank.color : '#6B7280' }}>{rank.name}</p>
                    <p className="text-xs text-gray-500">{rank.minXP.toLocaleString('fr-FR')} XP</p>
                  </div>
                  {reached ? (
                    <CheckCircle size={18} style={{ color: rank.color }} />
                  ) : (
                    <Lock size={14} className="text-gray-600" />
                  )}
                  {isCurrent && (
                    <span className="ml-2 text-xs px-2 py-0.5 rounded-full" style={{ background: `${rank.color}20`, color: rank.color }}>
                      Actuel
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Skills */}
      <div className="px-4">
        <h3 className="text-white font-semibold mb-3">Compétences</h3>
        <div className="flex flex-col gap-3">
          {state.skills.map(skill => {
            const pct = (skill.level / skill.maxLevel) * 100;
            return (
              <div key={skill.id} className="rounded-xl p-4" style={{ background: '#0F172A', border: '1px solid #ffffff08' }}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span>{skill.icon}</span>
                    <p className="text-white text-sm font-medium">{skill.name}</p>
                  </div>
                  <span className="text-xs font-bold" style={{ color: skill.color }}>
                    Niv. {Math.floor(skill.level)}/{skill.maxLevel}
                  </span>
                </div>
                <ProgressBar value={skill.level} max={skill.maxLevel} color={skill.color} />
                {pct === 0 && (
                  <p className="text-xs text-gray-600 mt-1">Complète des missions pour progresser</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
