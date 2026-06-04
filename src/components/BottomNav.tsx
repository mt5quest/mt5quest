import { Home, Layers, Trophy, BarChart2, User } from 'lucide-react';
import type { Screen } from '../types/game';

interface Props {
  current: Screen;
  onNavigate: (s: Screen) => void;
}

const TABS = [
  { screen: 'home' as Screen, label: 'Accueil', icon: Home },
  { screen: 'hub' as Screen, label: 'Hub', icon: Layers },
  { screen: 'collection' as Screen, label: 'Badges', icon: Trophy },
  { screen: 'progression' as Screen, label: 'Progrès', icon: BarChart2 },
  { screen: 'profile' as Screen, label: 'Profil', icon: User },
];

const HIDDEN_SCREENS: Screen[] = ['mission', 'result'];

export function BottomNav({ current, onNavigate }: Props) {
  if (HIDDEN_SCREENS.includes(current)) return null;

  return (
    <div
      className="fixed bottom-0 left-0 right-0 max-w-sm mx-auto border-t"
      style={{ background: '#0A0F1E', borderColor: '#ffffff10', paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex">
        {TABS.map(tab => {
          const Icon = tab.icon;
          const isActive = current === tab.screen;
          return (
            <button
              key={tab.screen}
              onClick={() => onNavigate(tab.screen)}
              className="flex-1 flex flex-col items-center gap-1 py-3 transition-all duration-150"
            >
              <div
                className="flex items-center justify-center w-8 h-8 rounded-xl transition-all duration-200"
                style={{ background: isActive ? '#06B6D420' : 'transparent' }}
              >
                <Icon
                  size={18}
                  style={{ color: isActive ? '#06B6D4' : '#6B7280' }}
                />
              </div>
              <span
                className="text-xs font-medium transition-colors duration-200"
                style={{ color: isActive ? '#06B6D4' : '#6B7280' }}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
