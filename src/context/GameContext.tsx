import { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import type { GameState, Screen, Mission, MissionResult, Profile, Badge, Skill } from '../types/game';
import { ALL_BADGES } from '../data/badges';
import { INITIAL_SKILLS } from '../data/skills';
import { getRankForXP } from '../data/missions';

type Action =
  | { type: 'SET_SCREEN'; screen: Screen }
  | { type: 'SET_PROFILE'; profile: Profile }
  | { type: 'SET_BADGES'; badges: Badge[] }
  | { type: 'SET_SKILLS'; skills: Skill[] }
  | { type: 'SET_MISSION'; mission: Mission }
  | { type: 'SET_RESULT'; result: MissionResult }
  | { type: 'INCREMENT_COMBO' }
  | { type: 'RESET_COMBO' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'COMPLETE_MISSION'; result: MissionResult }
  | { type: 'SET_DAILY'; completed: number; required: number; rewardClaimed: boolean };

const initialProfile: Profile = {
  id: 'local',
  username: 'Joueur',
  xp: 0,
  coins: 0,
  rank: 'Novice',
  streak: 1,
  last_played_at: null,
  max_streak: 1,
  total_missions: 0,
  total_correct: 0,
};

const initialState: GameState = {
  profile: null,
  badges: ALL_BADGES.map(b => ({ ...b, earned: false })),
  skills: INITIAL_SKILLS,
  combo: 0,
  dailyMission: { completed: 0, required: 3, rewardClaimed: false },
  currentMission: null,
  lastResult: null,
  screen: 'home',
  isLoading: false,
};

function gameReducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen };
    case 'SET_PROFILE':
      return { ...state, profile: action.profile };
    case 'SET_BADGES':
      return { ...state, badges: action.badges };
    case 'SET_SKILLS':
      return { ...state, skills: action.skills };
    case 'SET_MISSION':
      return { ...state, currentMission: action.mission };
    case 'SET_RESULT':
      return { ...state, lastResult: action.result };
    case 'INCREMENT_COMBO':
      return { ...state, combo: state.combo + 1 };
    case 'RESET_COMBO':
      return { ...state, combo: 0 };
    case 'SET_LOADING':
      return { ...state, isLoading: action.loading };
    case 'SET_DAILY':
      return {
        ...state,
        dailyMission: {
          completed: action.completed,
          required: action.required,
          rewardClaimed: action.rewardClaimed,
        },
      };
    case 'COMPLETE_MISSION': {
      const result = action.result;
      const profile = state.profile || initialProfile;
      const newXP = profile.xp + result.xpEarned;
      const newRank = getRankForXP(newXP).name as Profile['rank'];
      const updatedProfile: Profile = {
        ...profile,
        xp: newXP,
        coins: profile.coins + result.coinsEarned,
        rank: newRank,
        total_missions: profile.total_missions + 1,
        total_correct: profile.total_correct + (result.correct ? 1 : 0),
      };
      const newCombo = result.correct ? state.combo + 1 : 0;
      const newDaily = {
        ...state.dailyMission,
        completed: Math.min(state.dailyMission.completed + 1, state.dailyMission.required),
      };
      return {
        ...state,
        profile: updatedProfile,
        combo: newCombo,
        lastResult: result,
        dailyMission: newDaily,
        screen: 'result',
      };
    }
    default:
      return state;
  }
}

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<Action>;
  navigate: (screen: Screen) => void;
  startMission: (mission: Mission) => void;
  completeMission: (result: MissionResult) => void;
}

const GameContext = createContext<GameContextType | null>(null);

function loadFromStorage(): Partial<GameState> {
  try {
    const raw = localStorage.getItem('mt5-game-state');
    if (!raw) return {};
    const data = JSON.parse(raw);
    return {
      profile: data.profile || null,
      badges: data.badges || ALL_BADGES.map(b => ({ ...b, earned: false })),
      skills: data.skills || INITIAL_SKILLS,
      combo: 0,
      dailyMission: data.dailyMission || { completed: 0, required: 3, rewardClaimed: false },
    };
  } catch {
    return {};
  }
}

function saveToStorage(state: GameState) {
  try {
    localStorage.setItem('mt5-game-state', JSON.stringify({
      profile: state.profile,
      badges: state.badges,
      skills: state.skills,
      dailyMission: state.dailyMission,
    }));
  } catch {
    // ignore
  }
}

export function GameProvider({ children }: { children: ReactNode }) {
  const stored = loadFromStorage();
  const [state, dispatch] = useReducer(gameReducer, {
    ...initialState,
    ...stored,
    profile: stored.profile || {
      ...initialProfile,
      streak: 1,
    },
  });

  useEffect(() => {
    saveToStorage(state);
  }, [state]);

  const navigate = useCallback((screen: Screen) => {
    dispatch({ type: 'SET_SCREEN', screen });
  }, []);

  const startMission = useCallback((mission: Mission) => {
    dispatch({ type: 'SET_MISSION', mission });
    dispatch({ type: 'SET_SCREEN', screen: 'mission' });
  }, []);

  const completeMission = useCallback((result: MissionResult) => {
    dispatch({ type: 'COMPLETE_MISSION', result });
    // Update skills based on mission type
    const currentMission = state.currentMission;
    if (currentMission && result.correct) {
      const skillMap: Record<string, string> = {
        'find-tab': 'navigation',
        'find-xauusd': 'xauusd',
        'buy-or-sell': 'buy-sell',
        'set-stop-loss': 'stop-loss',
        'beginner-error': 'risk',
        'mt5-sprint': 'navigation',
      };
      const skillId = skillMap[currentMission.type];
      if (skillId) {
        const updatedSkills = state.skills.map(s =>
          s.id === skillId && s.level < s.maxLevel
            ? { ...s, level: Math.min(s.level + 0.5, s.maxLevel) }
            : s
        );
        dispatch({ type: 'SET_SKILLS', skills: updatedSkills });
      }
    }
    // Check badges
    const newProfile = {
      ...(state.profile || initialProfile),
      xp: (state.profile?.xp || 0) + result.xpEarned,
      total_missions: (state.profile?.total_missions || 0) + 1,
    };
    const updatedBadges = checkBadges(state.badges, newProfile, state.combo + (result.correct ? 1 : 0), result);
    if (updatedBadges !== state.badges) {
      dispatch({ type: 'SET_BADGES', badges: updatedBadges });
    }
  }, [state]);

  return (
    <GameContext.Provider value={{ state, dispatch, navigate, startMission, completeMission }}>
      {children}
    </GameContext.Provider>
  );
}

function checkBadges(badges: Badge[], profile: Profile, combo: number, result: MissionResult): Badge[] {
  let changed = false;
  const updated = badges.map(badge => {
    if (badge.earned) return badge;
    let earn = false;
    switch (badge.id) {
      case 'first-mission': earn = profile.total_missions >= 1; break;
      case 'missions-10': earn = profile.total_missions >= 10; break;
      case 'missions-50': earn = profile.total_missions >= 50; break;
      case 'combo-5': earn = combo >= 5; break;
      case 'perfect-mission': earn = result.stars === 3; break;
      case 'rank-explorer': earn = profile.xp >= 500; break;
      case 'rank-executor': earn = profile.xp >= 1500; break;
      case 'rank-guardian': earn = profile.xp >= 3500; break;
      case 'rank-strategist': earn = profile.xp >= 7000; break;
      case 'rank-master': earn = profile.xp >= 15000; break;
      case 'streak-3': earn = profile.streak >= 3; break;
      case 'streak-7': earn = profile.streak >= 7; break;
    }
    if (earn) { changed = true; return { ...badge, earned: true, earnedAt: new Date().toISOString() }; }
    return badge;
  });
  return changed ? updated : badges;
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}
