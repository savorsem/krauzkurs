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
      if (currentScrollY < 50) {
        setIsVisible(true);
      } else {
        if (Math.abs(currentScrollY - lastScrollY) > 10) {
            setIsVisible(currentScrollY < lastScrollY);
        }
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const navItems = [
      { tab: Tab.MODULES, icon: '🏠', label: 'Home' },
      { tab: Tab.CURRICULUM, icon: '📅', label: 'Plan' },
      { tab: Tab.CHAT, icon: '💬', label: 'HQ' },
      { tab: Tab.PROFILE, icon: '👤', label: 'Profile' },
  ];

  if (role === 'ADMIN') navItems.push({ tab: Tab.ADMIN_DASHBOARD, icon: '⚙️', label: 'Admin' });

  return (
    <div className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] transition-transform duration-500 ${isVisible ? 'translate-y-0' : 'translate-y-32'}`}>
      <nav className="bg-[#1F2128] px-4 py-3 rounded-full flex items-center gap-2 shadow-2xl border border-white/5">
        {selectedLesson ? (
            <>
                <button onClick={onExitLesson} className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-white text-xl">←</button>
                <div className="px-4 py-2 bg-white/5 rounded-2xl flex flex-col items-center">
                    <span className="text-[8px] font-black text-[#FF9A62] tracking-widest uppercase">Mission</span>
                    <span className="text-[10px] font-bold text-white truncate max-w-[100px]">{selectedLesson.title}</span>
                </div>
                <button onClick={onAskQuestion} className="w-12 h-12 rounded-full bg-[#6C5DD3] flex items-center justify-center text-white text-xl shadow-lg">?</button>
            </>
        ) : (
            navItems.map((item) => (
                <button
                    key={item.tab}
                    onClick={() => setActiveTab(item.tab)}
                    className={`flex items-center justify-center transition-all duration-300 w-12 h-12 rounded-full ${activeTab === item.tab ? 'bg-[#6C5DD3] text-white scale-110 shadow-lg shadow-[#6C5DD3]/30' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className="text-xl">{item.icon}</span>
                </button>
            ))
        )}
      </nav>
    </div>
  );
};