import { useState, useCallback } from 'react';
import { X, Zap } from 'lucide-react';
import { useGame } from '../context/GameContext';
import { Timer } from '../components/ui/Timer';
import { ComboIndicator } from '../components/ui/ComboIndicator';
import { FindTabGame } from '../components/minigames/FindTabGame';
import { FindXAUUSDGame } from '../components/minigames/FindXAUUSDGame';
import { BuySellGame } from '../components/minigames/BuySellGame';
import { StopLossGame } from '../components/minigames/StopLossGame';
import { BeginnerErrorGame } from '../components/minigames/BeginnerErrorGame';
import { MT5SprintGame } from '../components/minigames/MT5SprintGame';
import type { MissionResult } from '../types/game';

export function MissionScreen() {
  const { state, navigate, completeMission } = useGame();
  const mission = state.currentMission!;
  const [startTime] = useState(() => Date.now());
  const [paused, setPaused] = useState(false);
  const [done, setDone] = useState(false);

  const handleComplete = useCallback((result: Omit<MissionResult, 'badgeEarned'>) => {
    if (done) return;
    setDone(true);
    setPaused(true);
    const comboMultiplier = state.combo >= 4 ? 1.5 : state.combo >= 2 ? 1.2 : 1;
    const finalResult: MissionResult = {
      ...result,
      xpEarned: Math.round(result.xpEarned * comboMultiplier),
      coinsEarned: Math.round(result.coinsEarned * comboMultiplier),
    };
    completeMission(finalResult);
  }, [done, state.combo, completeMission]);

  const handleTimeUp = useCallback(() => {
    if (done) return;
    setDone(true);
    setPaused(true);
    completeMission({
      score: 0,
      stars: 0,
      xpEarned: 5,
      coinsEarned: 1,
      timeTaken: mission.duration,
      correct: false,
      explanation: 'Temps écoulé ! La rapidité est essentielle sur MT5. Refais cette mission pour t\'améliorer.',
    });
  }, [done, mission.duration, completeMission]);

  const DIFFICULTY_COLORS: Record<string, string> = {
    easy: '#10B981',
    medium: '#F59E0B',
    hard: '#EF4444',
  };
  const DIFFICULTY_LABELS: Record<string, string> = {
    easy: 'Facile',
    medium: 'Moyen',
    hard: 'Difficile',
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#0A0F1E' }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 pt-12 pb-4">
        <button
          onClick={() => navigate('hub')}
          className="w-10 h-10 rounded-xl flex items-center justify-center transition-all active:scale-95"
          style={{ background: '#0F172A', border: '1px solid #ffffff10' }}
        >
          <X size={18} className="text-gray-400" />
        </button>

        <div className="flex items-center gap-3">
          <ComboIndicator combo={state.combo} />
          {state.combo >= 2 && (
            <div className="flex items-center gap-1 text-xs text-yellow-400">
              <Zap size={12} className="fill-yellow-400" />
              <span>x{state.combo >= 4 ? '1.5' : '1.2'} XP</span>
            </div>
          )}
        </div>

        <Timer duration={mission.duration} onComplete={handleTimeUp} paused={paused} />
      </div>

      {/* Mission header */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              background: `${DIFFICULTY_COLORS[mission.difficulty]}20`,
              color: DIFFICULTY_COLORS[mission.difficulty],
            }}
          >
            {DIFFICULTY_LABELS[mission.difficulty]}
          </span>
          <span className="text-xs text-gray-500">+{mission.xpReward} XP • +{mission.coinsReward} pièces</span>
        </div>
        <h2 className="text-white text-xl font-bold">{mission.title}</h2>
        <p className="text-gray-400 text-sm mt-0.5">{mission.description}</p>
      </div>

      {/* Game area */}
      <div className="flex-1 px-4 overflow-y-auto">
        {mission.type === 'find-tab' && (
          <FindTabGame onComplete={handleComplete} startTime={startTime} duration={mission.duration} />
        )}
        {mission.type === 'find-xauusd' && (
          <FindXAUUSDGame onComplete={handleComplete} startTime={startTime} duration={mission.duration} />
        )}
        {mission.type === 'buy-or-sell' && (
          <BuySellGame onComplete={handleComplete} startTime={startTime} duration={mission.duration} />
        )}
        {mission.type === 'set-stop-loss' && (
          <StopLossGame onComplete={handleComplete} startTime={startTime} duration={mission.duration} />
        )}
        {mission.type === 'beginner-error' && (
          <BeginnerErrorGame onComplete={handleComplete} startTime={startTime} duration={mission.duration} />
        )}
        {mission.type === 'mt5-sprint' && (
          <MT5SprintGame onComplete={handleComplete} startTime={startTime} duration={mission.duration} />
        )}
      </div>
    </div>
  );
}
