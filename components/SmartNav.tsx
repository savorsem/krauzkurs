
import React, { useState, useEffect } from 'react';
import { Tab, UserRole, Lesson } from '../types';

interface SmartNavProps {
  activeTab: Tab;
  setActiveTab: (tab: Tab) => void;
  role: UserRole;
  selectedLesson: Lesson | null;
  onExitLesson: () => void;
}

export const SmartNav: React.FC<SmartNavProps> = ({ 
  activeTab, 
  setActiveTab, 
  role, 
  selectedLesson, 
  onExitLesson
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

  const isFocusMode = !!selectedLesson;

  const navItems = [
    { tab: Tab.MODULES, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0l-8.69 8.69a.75.75 0 001.061 1.06l8.69-8.69z" /><path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" /></svg>, label: 'Home' },
    { tab: Tab.CHAT, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M4.804 21.644A6.707 6.707 0 006 21.75a6.721 6.721 0 003.583-1.029c.774.182 1.584.279 2.417.279 5.322 0 9.75-3.97 9.75-9 0-5.03-4.428-9-9.75-9s-9.75 3.97-9.75 9c0 2.409 1.025 4.587 2.674 6.192.232.226.277.428.254.543a3.73 3.73 0 01-.814 1.686.75.75 0 01-1.112-1.083zM12.643 11.43a.75.75 0 00-1.286 0l-1.5 3a.75.75 0 001.176.93L12 14.229l.967 1.132a.75.75 0 001.176-.93l-1.5-3z" clipRule="evenodd" /></svg>, label: 'AI' },
    { tab: Tab.PROFILE, icon: <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653zm-12.54-1.285A7.486 7.486 0 0112 15a7.486 7.486 0 015.855 2.812A8.224 8.224 0 0112 20.25a8.224 8.224 0 01-5.855-2.438zM15.75 9a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>, label: 'Me' },
  ];

  const availableItems = [...navItems];
  if (role === 'CURATOR') availableItems.push({ tab: Tab.CURATOR_DASHBOARD, icon: <span>✓</span>, label: 'K' });
  if (role === 'ADMIN') availableItems.push({ tab: Tab.ADMIN_DASHBOARD, icon: <span>⚙️</span>, label: 'A' });

  return (
    <div 
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
        ${isVisible ? 'bottom-6 translate-y-0' : 'bottom-0 translate-y-[150%]'}
      `}
    >
      <div 
        className={`
          bg-[#1F2128] shadow-[0_10px_30px_rgba(0,0,0,0.3)]
          transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) text-white
          flex items-center justify-between px-6 py-2
          ${isFocusMode 
             ? 'rounded-[2rem] h-16 gap-4 px-6' 
             : 'rounded-[2.5rem] h-20 min-w-[300px] gap-10' 
          }
        `}
      >
        {isFocusMode ? (
          <>
             <button onClick={onExitLesson} className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
             </button>
             <div className="flex flex-col items-start pr-4">
                 <span className="text-[10px] font-bold text-white/50 uppercase tracking-wider">Lesson</span>
                 <span className="text-sm font-bold text-white">Active</span>
             </div>
          </>
        ) : (
          availableItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`relative flex flex-col items-center justify-center transition-all duration-300 group
                    ${isActive ? 'text-[#FFAB7B] scale-110' : 'text-slate-500 hover:text-slate-300'}
                `}
              >
                <div className={`transition-all duration-300 ${isActive ? '-translate-y-1' : ''}`}>
                    {item.icon}
                </div>
                {isActive && <div className="absolute -bottom-2 w-1.5 h-1.5 bg-[#FFAB7B] rounded-full animate-fade-in"></div>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
