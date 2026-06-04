export type Screen =
  | 'home'
  | 'hub'
  | 'mission-select'
  | 'mission'
  | 'result'
  | 'collection'
  | 'progression'
  | 'profile'
  | 'daily';

export type MissionType =
  | 'find-tab'
  | 'find-xauusd'
  | 'buy-or-sell'
  | 'set-stop-loss'
  | 'beginner-error'
  | 'mt5-sprint';

export type Rank =
  | 'Novice'
  | 'Explorateur'
  | 'Exécuteur'
  | 'Gardien du risque'
  | 'Stratège XAUUSD'
  | 'Maître MT5 Mobile';

export interface Profile {
  id: string;
  username: string;
  xp: number;
  coins: number;
  rank: Rank;
  streak: number;
  last_played_at: string | null;
  max_streak: number;
  total_missions: number;
  total_correct: number;
}

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  requirement: string;
  earned?: boolean;
  earnedAt?: string;
}

export interface Mission {
  id: string;
  type: MissionType;
  title: string;
  description: string;
  duration: number;
  xpReward: number;
  coinsReward: number;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface MissionResult {
  score: number;
  stars: number;
  xpEarned: number;
  coinsEarned: number;
  timeTaken: number;
  correct: boolean;
  explanation: string;
  badgeEarned?: Badge;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
  maxLevel: number;
  icon: string;
  color: string;
  description: string;
}

export interface DailyMission {
  completed: number;
  required: number;
  rewardClaimed: boolean;
}

export interface GameState {
  profile: Profile | null;
  badges: Badge[];
  skills: Skill[];
  combo: number;
  dailyMission: DailyMission;
  currentMission: Mission | null;
  lastResult: MissionResult | null;
  screen: Screen;
  isLoading: boolean;
}
