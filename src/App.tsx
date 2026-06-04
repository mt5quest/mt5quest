import { GameProvider, useGame } from './context/GameContext';
import { BottomNav } from './components/BottomNav';
import { HomeScreen } from './screens/HomeScreen';
import { HubScreen } from './screens/HubScreen';
import { MissionScreen } from './screens/MissionScreen';
import { ResultScreen } from './screens/ResultScreen';
import { CollectionScreen } from './screens/CollectionScreen';
import { ProgressionScreen } from './screens/ProgressionScreen';
import { ProfileScreen } from './screens/ProfileScreen';

function GameApp() {
  const { state, navigate } = useGame();
  const { screen } = state;

  const renderScreen = () => {
    switch (screen) {
      case 'home': return <HomeScreen />;
      case 'hub': return <HubScreen />;
      case 'mission': return <MissionScreen />;
      case 'result': return <ResultScreen />;
      case 'collection': return <CollectionScreen />;
      case 'progression': return <ProgressionScreen />;
      case 'profile': return <ProfileScreen />;
      default: return <HomeScreen />;
    }
  };

  return (
    <div className="game-container">
      <div className="screen-content">
        {renderScreen()}
      </div>
      <BottomNav current={screen} onNavigate={navigate} />
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <GameApp />
    </GameProvider>
  );
}

export default App;
