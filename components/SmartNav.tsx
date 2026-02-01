
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
    { tab: Tab.MODULES, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" /></svg>, label: 'Курс' },
    { tab: Tab.CHAT, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z" /></svg>, label: 'Штаб' },
    { tab: Tab.PROFILE, icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>, label: 'Профиль' },
  ];

  const availableItems = [...navItems];
  if (role === 'CURATOR') availableItems.push({ tab: Tab.CURATOR_DASHBOARD, icon: <span>✓</span>, label: 'Куратор' });
  if (role === 'ADMIN') availableItems.push({ tab: Tab.ADMIN_DASHBOARD, icon: <span>⚙️</span>, label: 'Админ' });

  return (
    <div 
      className={`fixed left-1/2 transform -translate-x-1/2 z-50 transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1)
        ${isVisible ? 'bottom-8 translate-y-0' : 'bottom-0 translate-y-[150%]'}
      `}
    >
      <div 
        className={`
          bg-[#1A1A1A] shadow-2xl shadow-black/20
          transition-all duration-500 cubic-bezier(0.23, 1, 0.32, 1) text-white
          flex items-center justify-between px-6 py-2
          ${isFocusMode 
             ? 'rounded-full h-14 gap-4 px-4' 
             : 'rounded-full h-16 min-w-[280px] gap-8' 
          }
        `}
      >
        {isFocusMode ? (
          <>
             <button onClick={onExitLesson} className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white">✕</button>
             <span className="text-sm font-bold pr-2">Урок активен</span>
          </>
        ) : (
          availableItems.map((item) => {
            const isActive = activeTab === item.tab;
            return (
              <button
                key={item.tab}
                onClick={() => setActiveTab(item.tab)}
                className={`relative flex flex-col items-center justify-center transition-all ${isActive ? 'text-white scale-110' : 'text-white/40 hover:text-white/70'}`}
              >
                {item.icon}
                {isActive && <div className="absolute -bottom-2 w-1 h-1 bg-white rounded-full"></div>}
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};
