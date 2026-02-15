
import React from 'react';
import { ScreenName } from '../types';

interface LayoutProps {
  children: React.ReactNode;
  onNavigate: (screen: ScreenName) => void;
  activeScreen: ScreenName;
  hideNav?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, onNavigate, activeScreen, hideNav }) => {
  const navItems = [
    { id: 'home', label: 'Home', icon: 'home', screen: 'home' as ScreenName },
    { id: 'journeys', label: 'Journeys', icon: 'map', screen: 'learn' as ScreenName },
    { id: 'practice', label: 'Practice', icon: 'spa', screen: 'practice' as ScreenName },
    { id: 'insights', label: 'Insights', icon: 'psychology', screen: 'chat_history' as ScreenName },
  ];

  return (
    <div className="grain-overlay h-screen bg-slate-50 flex flex-col max-w-md mx-auto shadow-modal overflow-hidden relative">
      <main className={`flex-1 overflow-y-auto no-scrollbar ${hideNav ? '' : 'pb-24'}`}>
        {children}
      </main>

      {!hideNav && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white/95 border-t border-slate-200 px-8 py-3 pb-6 z-50 backdrop-blur-lg flex justify-between items-center max-w-md mx-auto transition-all">
          {navItems.map((item) => {
            const isActive = activeScreen === item.screen;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.screen)}
                className="flex flex-col items-center gap-1.5 cursor-pointer group w-16"
              >
                <span 
                    className={`material-icons-round text-[28px] transition-colors ${
                        isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}
                >
                    {item.icon}
                </span>
                <span className={`text-[10px] font-medium transition-colors ${
                    isActive ? 'text-indigo-600' : 'text-slate-400 group-hover:text-indigo-600'
                }`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
};

export default Layout;
