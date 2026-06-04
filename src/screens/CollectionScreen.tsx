import { Lock } from 'lucide-react';
import { useGame } from '../context/GameContext';

export function CollectionScreen() {
  const { state } = useGame();
  const earned = state.badges.filter(b => b.earned).length;

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#0A0F1E' }}>
      <div className="px-4 pt-12 pb-4">
        <h2 className="text-white text-2xl font-bold">Collection</h2>
        <p className="text-gray-400 text-sm mt-1">{earned}/{state.badges.length} badges débloqués</p>
      </div>

      {/* Progress bar */}
      <div className="mx-4 mb-6">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${(earned / state.badges.length) * 100}%`, background: 'linear-gradient(90deg, #F59E0B, #EF4444)' }}
          />
        </div>
        <p className="text-right text-xs text-gray-500 mt-1">{Math.round((earned / state.badges.length) * 100)}% complété</p>
      </div>

      {/* Badges grid */}
      <div className="px-4 grid grid-cols-3 gap-3">
        {state.badges.map(badge => (
          <div
            key={badge.id}
            className="relative rounded-2xl p-3 flex flex-col items-center gap-2 transition-all"
            style={{
              background: badge.earned ? `${badge.color}15` : '#0F172A',
              border: `1.5px solid ${badge.earned ? badge.color + '40' : '#374151'}`,
              filter: badge.earned ? 'none' : 'grayscale(0.8)',
            }}
          >
            {!badge.earned && (
              <div className="absolute top-2 right-2">
                <Lock size={10} className="text-gray-600" />
              </div>
            )}
            <div className="text-3xl">{badge.icon}</div>
            <p className="text-center text-xs font-semibold leading-tight" style={{ color: badge.earned ? badge.color : '#6B7280' }}>
              {badge.name}
            </p>
            {badge.earned ? (
              <span className="text-xs text-gray-400 text-center leading-tight">{badge.description}</span>
            ) : (
              <span className="text-xs text-gray-600 text-center leading-tight">{badge.requirement}</span>
            )}
            {badge.earned && badge.earnedAt && (
              <span className="text-xs text-gray-600">
                {new Date(badge.earnedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
