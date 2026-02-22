
import React, { useState, useEffect } from 'react';
import Layout from './components/Layout';
import HomeScreen from './screens/HomeScreen';
import ChatInterface from './components/ChatInterface';
import ModuleDetailScreen from './screens/ModuleDetailScreen';
import ModuleContentScreen from './screens/ModuleContentScreen';
import ChatHistoryScreen from './screens/ChatHistoryScreen';
import ChatHistoryDetailScreen from './screens/ChatHistoryDetailScreen';
import SettingsScreen from './screens/SettingsScreen';
import { NavigationState, ScreenName, HistoryRecord } from './types';
import { getHistory, deleteHistoryRecord } from './services/db';

const App: React.FC = () => {
  const [navState, setNavState] = useState<NavigationState>({
    current: 'home',
  });
  
  const [history, setHistory] = useState<HistoryRecord[]>([]);

  // Function to refresh history data from DB
  const refreshHistory = async () => {
    try {
      const data = await getHistory();
      setHistory(data);
    } catch (e) {
      console.error("Failed to load history", e);
    }
  };

  useEffect(() => {
    // Load history when the app starts
    refreshHistory();
  }, []);

  // Also refresh when navigating to history screen
  useEffect(() => {
    if (navState.current === 'chat_history') {
      refreshHistory();
    }
  }, [navState.current]);

  const navigate = (screen: ScreenName, params?: any) => {
    setNavState({ current: screen, params });
  };
  
  const handleDeleteHistory = async (id: string) => {
    try {
      await deleteHistoryRecord(id);
      // Update local state to reflect deletion immediately
      setHistory(prev => prev.filter(item => item.id !== id));
      
      // If we are on the detail screen, go back to history list
      if (navState.current === 'history_detail') {
        navigate('chat_history');
      }
    } catch (e) {
      console.error("Failed to delete record", e);
    }
  };

  const renderScreen = () => {
    switch (navState.current) {
      case 'home':
        return <HomeScreen onNavigate={navigate} viewMode="home" />;
      
      case 'learn':
        return <HomeScreen onNavigate={navigate} viewMode="learn" />;
        
      case 'practice':
        return <HomeScreen onNavigate={navigate} viewMode="practice" initialParams={navState.params} />;

      case 'chat_checkin':
        // Full screen chat overlay
        return (
          <ChatInterface
            title="Check-in"
            initialMessage="Take a quiet moment to check-in with yourself. How are you feeling today – physically and emotionally?"
            onClose={() => navigate('chat_history')}
            ttsOn={navState.params?.ttsOn === true}
          />
        );

      case 'module_detail':
        const origin = navState.params.from || 'home';
        return (
          <ModuleDetailScreen 
            module={navState.params.module} 
            onNavigate={(screen, params) => navigate(screen, { ...params, origin })} 
            onBack={() => navigate(origin)} 
          />
        );

      case 'module_content':
         return (
          <ModuleContentScreen 
            module={navState.params.module}
            subModule={navState.params.subModule}
            onNavigate={navigate} 
            onClose={() => {
                const { from, origin, subModule } = navState.params;
                if (from === 'practice') {
                    navigate('practice');
                } else if (!subModule) {
                    // Sequential content pages -> Go back to Journeys tab
                    navigate('learn');
                } else {
                    // Sub-modules -> Go back to module detail to see the list
                    // Pass the original source (origin) so back navigation works correctly there.
                    navigate('module_detail', { 
                        module: navState.params.module,
                        from: origin 
                    });
                }
            }}
          />
         );
      
      case 'module_reflection':
        return (
          <ChatInterface 
            title={navState.params.title}
            initialMessage={navState.params.initialMessage}
            botId={navState.params.botId}
            spaceId={navState.params.spaceId}
            onClose={() => navigate('chat_history')} 
          />
        );

      case 'chat_history':
        return (
          <ChatHistoryScreen 
            history={history}
            onDelete={handleDeleteHistory}
            onBack={() => navigate('home')} 
            onNavigate={navigate} 
          />
        );
      
      case 'history_detail':
        return (
          <ChatHistoryDetailScreen 
            record={navState.params.record} 
            onDelete={handleDeleteHistory}
            onBack={() => navigate('chat_history')}
          />
        );
      
      case 'settings':
        return <SettingsScreen onNavigate={navigate} />;

      default:
        return <HomeScreen onNavigate={navigate} viewMode="home" />;
    }
  };

  // Screens where we hide the bottom navigation
  const isFullScreen = [
    'chat_checkin', 
    'module_detail', 
    'module_content', 
    'module_reflection', 
    'history_detail', 
    'settings'
  ].includes(navState.current);

  return (
    <Layout 
      onNavigate={(screen) => navigate(screen)} 
      activeScreen={navState.current}
      hideNav={isFullScreen}
    >
      {renderScreen()}
    </Layout>
  );
};

export default App;
