import { Play, CheckCircle, Clock } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { MISSIONS, MISSION_TYPES } from '../data/missions';

type MissionStatus = 'todo' | 'in_progress' | 'done';

export function HubScreen() {
  const { state, startMission } = useGame();
  const completed = state.dailyMission.completed;

  const getMissionStatus = (index: number): MissionStatus => {
    if (index < completed) return 'done';
    if (index === completed) return 'in_progress';
    return 'todo';
  };

  const getStatusStyles = (status: MissionStatus) => {
    switch (status) {
      case 'done':
        return { bg: '#052E16', border: '#10B98140', text: '#10B981', label: 'Terminé' };
      case 'in_progress':
        return { bg: '#0F172A', border: '#F59E0B40', text: '#F59E0B', label: 'En cours' };
      default:
        return { bg: '#0F172A', border: '#374151', text: '#9CA3AF', label: 'À faire' };
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24" style={{ background: '#0A0F1E' }}>
      {/* Header */}
      <div className="px-4 pt-12 pb-4">
        <h2 className="text-white text-2xl font-bold">Missions</h2>
        <p className="text-gray-400 text-sm mt-1">
          {completed}/6 terminées aujourd'hui
        </p>
      </div>

      {/* Missions list */}
      <div className="px-4 flex flex-col gap-3">
        {MISSIONS.map((mission, index) => {
          const mt = MISSION_TYPES.find(m => m.type === mission.type);
          const status = getMissionStatus(index);
          const styles = getStatusStyles(status);
          const isDone = status === 'done';
          const isCurrent = status === 'in_progress';

          return (
            <div
              key={mission.id}
              className="rounded-2xl p-4 transition-all"
              style={{ background: styles.bg, border: `1px solid ${styles.border}` }}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{mt?.icon}</span>
                  <div>
                    <h3 className="text-white font-semibold">{mission.title}</h3>
                    <p className="text-gray-400 text-xs">{mission.description}</p>
                  </div>
                </div>
                {isDone && <CheckCircle size={18} style={{ color: styles.text }} />}
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium px-2 py-1 rounded-full" style={{ background: `${mt?.color}20`, color: mt?.color }}>
                    +{mission.xpReward} XP
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock size={12} />
                    {mission.duration}s
                  </span>
                </div>

                {isDone ? (
                  <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: '#10B98120', color: '#10B981' }}>
                    Terminé
                  </span>
                ) : (
                  <button
                    onClick={() => startMission(mission)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-full font-medium text-sm transition-all active:scale-95"
                    style={{
                      background: isCurrent ? '#F59E0B' : '#06B6D4',
                      color: '#fff',
                    }}
                  >
                    <Play size={14} />
                    Commencer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Progress footer */}
      <div className="px-4 mt-6">
        <div className="h-2 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(completed / MISSIONS.length) * 100}%`,
              background: 'linear-gradient(90deg, #06B6D4, #10B981)'
            }}
          />
        </div>
        <p className="text-center text-xs text-gray-500 mt-2">
          {MISSIONS.length - completed} mission(s) restante(s)
        </p>
      </div>
    </div>
  );
}
