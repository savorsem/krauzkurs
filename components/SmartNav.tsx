
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

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY < 50 || (window.innerHeight + window.scrollY) >= document.body.offsetHeight - 20) {
        setIsVisible(true);
      } else {
        setIsVisible(currentScrollY < lastScrollY);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const renderContent = () => {
    if (selectedLesson) {
      return (
        <div className="flex items-center justify-between w-full h-full px-1 gap-2">
          <button 
            onClick={onExitLesson} 
            className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white active:scale-90 transition-all hover:bg-white/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>

          <div className="flex flex-col items-center flex-1 px-2 overflow-hidden">
             <span className="text-[8px] text-white/50 font-black uppercase tracking-widest">АКТИВНАЯ МИССИЯ</span>
             <span className="text-[10px] font-bold text-white truncate w-full text-center leading-tight">{selectedLesson.title}</span>
          </div>

          <button 
            onClick={onAskQuestion}
            className="w-12 h-12 rounded-full bg-[#6C5DD3] flex items-center justify-center text-white active:scale-90 transition-all shadow-lg shadow-[#6C5DD3]/30"
          >
            <span className="text-xl font-bold">?</span>
          </button>
        </div>
      );
    }

    if (activeTab === Tab.PROFILE) {
        return (
            <div className="flex items-center justify-between w-full h-full px-1">
                <button 
                    onClick={() => setActiveTab(Tab.MODULES)} 
                    className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-400 active:scale-90 transition-all hover:bg-white/10"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
                </button>

                <button 
                   onClick={onToggleSettings}
                   className={`flex-1 mx-2 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border flex items-center justify-center gap-2 ${
                       isSettingsOpen ? 'bg-white text-black border-white' : 'bg-transparent text-white border-white/20'
                   }`}
                >
                   {isSettingsOpen ? 'ЗАКРЫТЬ' : 'НАСТРОЙКИ'}
                </button>

                <button 
                    onClick={onLogout}
                    className="w-12 h-12 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 active:scale-90 transition-all"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" /></svg>
                </button>
            </div>
        );
    }

    if (activeTab === Tab.ADMIN_DASHBOARD && setActiveAdminTab) {
        const adminItems = [
            { id: 'OVERVIEW', icon: '📊' },
            { id: 'USERS', icon: '👥' },
            { id: 'COURSE', icon: '🎓' },
            { id: 'SETTINGS', icon: '⚙️' },
        ];

        return (
            <div className="flex justify-between items-center w-full px-1">
                 <button 
                    onClick={() => setActiveTab(Tab.MODULES)} 
                    className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center text-red-400 active:scale-90 transition-all mr-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <div className="h-8 w-px bg-white/10 mx-1"></div>
                {adminItems.map((item) => {
                    const isActive = activeAdminTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveAdminTab(item.id as AdminTab)}
                            className={`flex flex-col items-center justify-center w-14 h-12 rounded-xl transition-all ${isActive ? 'bg-white/10 text-white scale-110 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                        >
                            <span className="text-xl leading-none mb-0.5">{item.icon}</span>
                            {isActive && <div className="w-1 h-1 bg-[#6C5DD3] rounded-full mt-1"></div>}
                        </button>
                    )
                })}
            </div>
        );
    }

    const navItems = [
        { tab: Tab.MODULES, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>, label: 'БАЗА' },
        { tab: Tab.CHAT, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 01-1.112-1.083zM12.643 11.43a.75.75 0 00-1.286 0l-1.5 3a.75.75 0 001.176.93L12 14.229l.967 1.132a.75.75 0 001.176-.93l-1.5-3z" clipRule="evenodd" /></svg>, label: 'РАЗВЕДКА' },
        { tab: Tab.PROFILE, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>, label: 'ПРОФИЛЬ' },
    ];

    if (role === 'CURATOR') navItems.splice(2, 0, { tab: Tab.CURATOR_DASHBOARD, icon: <span>✓</span>, label: 'ШТАБ' });
    if (role === 'ADMIN') navItems.push({ tab: Tab.ADMIN_DASHBOARD, icon: <span>⚙️</span>, label: 'ПУЛЬТ' });

    return (
        <div className="flex justify-between items-center w-full px-4">
            {navItems.map((item) => {
                const isActive = activeTab === item.tab;
                return (
                    <button
                        key={item.tab}
                        onClick={() => setActiveTab(item.tab)}
                        className={`relative flex flex-col items-center justify-center transition-all duration-300 w-16 h-14 rounded-2xl group
                            ${isActive ? 'bg-white/10' : 'hover:bg-white/5'}
                        `}
                    >
                        <div className={`transition-all duration-300 ${isActive ? 'text-[#00CEFF] scale-110 drop-shadow-[0_0_10px_rgba(0,206,255,0.4)]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                            {item.icon}
                        </div>
                        <span className={`text-[8px] font-black uppercase mt-1 tracking-widest ${isActive ? 'text-white' : 'text-slate-600'}`}>{item.label}</span>
                        {isActive && <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-[#00CEFF] rounded-full shadow-[0_0_5px_#00CEFF]"></div>}
                    </button>
                );
            })}
        </div>
    );
  };

  return (
    <div 
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) w-full max-w-[380px] px-4
        ${isVisible ? 'bottom-8 translate-y-0' : 'bottom-0 translate-y-[150%]'}
      `}
    >
      <div 
        className={`
          bg-[#1F2128]/95 backdrop-blur-2xl shadow-[0_20px_40px_rgba(0,0,0,0.8)]
          transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
          border border-white/10 flex items-center
          ${selectedLesson 
             ? 'rounded-[2rem] h-18 py-2' 
             : 'rounded-[2.5rem] h-20 py-1' 
          }
        `}
      >
         {renderContent()}
      </div>
    </div>
  );
};
