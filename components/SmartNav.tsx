
import React, { useState, useEffect } from 'react';
import { Tab, UserRole, Lesson, AdminTab } from '../types';

interface SmartNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  role: UserRole;
  selectedLesson: Lesson | null;
  onExitLesson: () => void;
  onAskQuestion?: () => void;
  onLogout?: () => void;
  onToggleSettings?: () => void;
  isSettingsOpen?: boolean;
  
  // Admin Specific Props
  activeAdminTab?: AdminTab;
  setActiveAdminTab?: (tab: AdminTab) => void;
}

export const SmartNav: React.FC<SmartNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  role, 
  selectedLesson, 
  onExitLesson,
  onAskQuestion,
  onLogout,
  onToggleSettings,
  isSettingsOpen,
  activeAdminTab,
  setActiveAdminTab
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Intelligent Scroll Detection
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.body.offsetHeight;

      // Always show if at top or bottom
      if (currentScrollY < 50 || (windowHeight + currentScrollY) >= documentHeight - 50) {
        setIsVisible(true);
      } else {
        // Hide on scroll down, show on scroll up
        if (Math.abs(currentScrollY - lastScrollY) > 10) {
            setIsVisible(currentScrollY < lastScrollY);
        }
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  // --- RENDERERS ---

  const renderLessonMode = () => (
    <div className="flex items-center justify-between w-full h-full gap-3 px-1">
      <button 
        onClick={onExitLesson} 
        className="group w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:text-white hover:bg-white/10 hover:border-white/20 active:scale-90 transition-all shadow-lg"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 group-hover:-translate-x-1 transition-transform">
          <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
        </svg>
      </button>

      <div className="flex flex-col items-center flex-1 overflow-hidden transition-all duration-300">
         <div className="flex items-center gap-1.5 mb-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
            <span className="text-[9px] text-red-400 font-black uppercase tracking-[0.2em]">MISSION ACTIVE</span>
         </div>
         <span className="text-xs font-bold text-white truncate w-full max-w-[180px] text-center">{selectedLesson?.title}</span>
      </div>

      <button 
        onClick={onAskQuestion}
        className="w-12 h-12 rounded-full bg-gradient-to-br from-[#6C5DD3] to-[#5a4cb5] border border-white/10 flex items-center justify-center text-white active:scale-90 hover:scale-105 transition-all shadow-[0_0_20px_rgba(108,93,211,0.4)]"
      >
        <span className="text-xl font-black">?</span>
      </button>
    </div>
  );

  const renderProfileMode = () => (
    <div className="flex items-center justify-between w-full h-full gap-2 px-1">
        <button 
            onClick={() => setActiveTab(Tab.MODULES)} 
            className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 active:scale-90 hover:bg-white/10 hover:text-white transition-all"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" /></svg>
        </button>

        <button 
            onClick={onToggleSettings}
            className={`
                flex-1 h-12 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 shadow-lg
                ${isSettingsOpen 
                    ? 'bg-white text-black border-white shadow-white/10' 
                    : 'bg-[#1F2128] text-white border-white/10 hover:border-white/20 hover:bg-[#2a2d36]'
                }
            `}
        >
            <span className="text-lg">{isSettingsOpen ? '✕' : '⚙️'}</span>
            <span>{isSettingsOpen ? 'ЗАКРЫТЬ' : 'НАСТРОЙКИ'}</span>
        </button>

        <button 
            onClick={onLogout}
            className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 active:scale-90 hover:bg-red-500/20 transition-all shadow-lg shadow-red-500/10"
        >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
        </button>
    </div>
  );

  const renderAdminMode = () => {
    const adminItems = [
        { id: 'OVERVIEW', icon: '📊' },
        { id: 'USERS', icon: '👥' },
        { id: 'COURSE', icon: '🎓' },
        { id: 'SETTINGS', icon: '⚙️' },
    ];
    
    return (
        <div className="flex items-center justify-between w-full h-full gap-1 px-1">
             <button 
                onClick={() => setActiveTab(Tab.MODULES)} 
                className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 active:scale-90 transition-all mr-2 flex-shrink-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <div className="h-8 w-px bg-white/10 mx-1"></div>
            <div className="flex flex-1 justify-around">
                {adminItems.map((item) => {
                    const isActive = activeAdminTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveAdminTab && setActiveAdminTab(item.id as AdminTab)}
                            className={`flex flex-col items-center justify-center w-12 h-12 rounded-2xl transition-all duration-300 relative
                                ${isActive ? 'bg-white/10 text-white shadow-inner' : 'text-slate-500 hover:text-slate-300'}
                            `}
                        >
                            <span className={`text-lg transition-transform duration-300 ${isActive ? 'scale-110' : 'scale-100'}`}>{item.icon}</span>
                            {isActive && <div className="absolute bottom-1 w-1 h-1 bg-[#6C5DD3] rounded-full shadow-[0_0_5px_#6C5DD3]"></div>}
                        </button>
                    )
                })}
            </div>
        </div>
    );
  };

  const renderDefaultMode = () => {
    const navItems = [
        { tab: Tab.MODULES, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>, label: 'БАЗА' },
        { tab: Tab.CURRICULUM, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.25 4.533A9.707 9.707 0 006 3a9.735 9.735 0 00-3.25.555.75.75 0 00-.5.707v14.25a.75.75 0 001 .707A8.237 8.237 0 016 18.75c1.995 0 3.823.707 5.25 1.886V4.533zM12.75 20.636A8.214 8.214 0 0118 18.75c1.11 0 2.152.22 3.102.617a.75.75 0 001-.707V4.392a.75.75 0 00-.5-.707 9.742 9.742 0 00-3.25-.555 9.707 9.707 0 00-5.25 1.533v16.003z" /></svg>, label: 'ПЛАН' },
        { tab: Tab.CHAT, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 01-1.112-1.083zM12.643 11.43a.75.75 0 00-1.286 0l-1.5 3a.75.75 0 001.176.93L12 14.229l.967 1.132a.75.75 0 001.176-.93l-1.5-3z" clipRule="evenodd" /></svg>, label: 'ШТАБ' },
        { tab: Tab.PROFILE, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>, label: 'ДОСЬЕ' },
    ];

    if (role === 'ADMIN') navItems.push({ tab: Tab.ADMIN_DASHBOARD, icon: <span>⚙️</span>, label: 'ПУЛЬТ' });

    return (
        <div className="flex justify-between items-center w-full px-2">
            {navItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                    <button
                        key={item.tab}
                        onClick={() => { setActiveTab(item.tab); }}
                        className={`relative flex flex-col items-center justify-center transition-all duration-300 w-16 h-14 rounded-2xl group active:scale-90`}
                    >
                        {isActive && (
                            <div className="absolute inset-0 bg-gradient-to-t from-[#00CEFF]/10 to-transparent rounded-2xl animate-fade-in pointer-events-none"></div>
                        )}

                        <div className={`transition-all duration-300 relative z-10 ${isActive ? 'text-[#00CEFF] -translate-y-1' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            <div className={isActive ? 'filter drop-shadow-[0_0_8px_rgba(0,206,255,0.6)]' : ''}>
                                {item.icon}
                            </div>
                        </div>
                        
                        <span className={`text-[9px] font-black uppercase mt-1 tracking-[0.2em] transition-colors duration-300 ${isActive ? 'text-white' : 'text-slate-600'}`}>
                            {item.label}
                        </span>
                        
                        <div className={`absolute bottom-1 w-1 h-1 bg-[#00CEFF] rounded-full shadow-[0_0_8px_#00CEFF] transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-0'}`}></div>
                    </button>
                );
            })}
        </div>
    );
  };

  return (
    <div 
      className={`
        fixed bottom-0 left-0 w-full flex justify-center z-[90] pointer-events-none
        transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1)
        pb-[calc(1.5rem+env(safe-area-inset-bottom))]
        ${isVisible ? 'translate-y-0' : 'translate-y-[150%]'}
      `}
    >
      <nav 
        className={`
          pointer-events-auto
          bg-[#131419]/80 backdrop-blur-2xl 
          border border-white/10 ring-1 ring-white/5
          shadow-[0_20px_40px_-10px_rgba(0,0,0,0.8)]
          rounded-[2.5rem]
          flex items-center
          transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
          mx-4
          ${selectedLesson ? 'w-[calc(100%-2rem)] max-w-md p-2' : 'w-auto min-w-[320px] max-w-md p-1.5'}
        `}
      >
         {selectedLesson 
            ? renderLessonMode() 
            : activeTab === Tab.PROFILE 
                ? renderProfileMode() 
                : activeTab === Tab.ADMIN_DASHBOARD 
                    ? renderAdminMode()
                    : renderDefaultMode()
         }
      </nav>
    </div>
  );
};
