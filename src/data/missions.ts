import type { Mission, MissionType } from '../types/game';

export const MISSIONS: Mission[] = [
  {
    id: 'find-tab-1',
    type: 'find-tab',
    title: 'Trouve l\'Onglet',
    description: 'Identifie le bon onglet MT5 en un clin d\'œil !',
    duration: 30,
    xpReward: 50,
    coinsReward: 10,
    difficulty: 'easy',
  },
  {
    id: 'find-xauusd-1',
    type: 'find-xauusd',
    title: 'Repère XAUUSD',
    description: 'Trouve XAUUSD dans la liste de symboles !',
    duration: 45,
    xpReward: 60,
    coinsReward: 12,
    difficulty: 'easy',
  },
  {
    id: 'buy-sell-1',
    type: 'buy-or-sell',
    title: 'BUY ou SELL ?',
    description: 'Analyse le graphique et décide rapidement !',
    duration: 60,
    xpReward: 80,
    coinsReward: 15,
    difficulty: 'medium',
  },
  {
    id: 'stop-loss-1',
    type: 'set-stop-loss',
    title: 'Pose ton Stop Loss',
    description: 'Place ton stop loss au bon niveau !',
    duration: 90,
    xpReward: 100,
    coinsReward: 20,
    difficulty: 'medium',
  },
  {
    id: 'error-1',
    type: 'beginner-error',
    title: 'Erreur de Débutant',
    description: 'Identifie l\'erreur commise par ce trader !',
    duration: 60,
    xpReward: 70,
    coinsReward: 15,
    difficulty: 'medium',
  },
  {
    id: 'sprint-1',
    type: 'mt5-sprint',
    title: 'Sprint MT5',
    description: 'Enchaîne les actions MT5 le plus vite possible !',
    duration: 90,
    xpReward: 120,
    coinsReward: 25,
    difficulty: 'hard',
  },
];

export const MISSION_TYPES: { type: MissionType; label: string; icon: string; color: string }[] = [
  { type: 'find-tab', label: 'Trouve l\'Onglet', icon: '📱', color: '#06B6D4' },
  { type: 'find-xauusd', label: 'Repère XAUUSD', icon: '🥇', color: '#F59E0B' },
  { type: 'buy-or-sell', label: 'BUY ou SELL ?', icon: '📊', color: '#10B981' },
  { type: 'set-stop-loss', label: 'Stop Loss', icon: '🛡️', color: '#EF4444' },
  { type: 'beginner-error', label: 'Erreur Débutant', icon: '⚠️', color: '#F59E0B' },
  { type: 'mt5-sprint', label: 'Sprint MT5', icon: '⚡', color: '#8B5CF6' },
];

export const RANKS = [
  { name: 'Novice', minXP: 0, maxXP: 499, color: '#9CA3AF', icon: '🌱' },
  { name: 'Explorateur', minXP: 500, maxXP: 1499, color: '#06B6D4', icon: '🗺️' },
  { name: 'Exécuteur', minXP: 1500, maxXP: 3499, color: '#10B981', icon: '⚔️' },
  { name: 'Gardien du risque', minXP: 3500, maxXP: 6999, color: '#F59E0B', icon: '🛡️' },
  { name: 'Stratège XAUUSD', minXP: 7000, maxXP: 14999, color: '#EF4444', icon: '🎯' },
  { name: 'Maître MT5 Mobile', minXP: 15000, maxXP: 999999, color: '#FFD700', icon: '👑' },
];

export function getRankForXP(xp: number) {
  return RANKS.slice().reverse().find(r => xp >= r.minXP) || RANKS[0];
}

export function getNextRank(xp: number) {
  return RANKS.find(r => xp < r.minXP) || null;
}
