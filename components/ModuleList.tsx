import React, { useState, useMemo } from 'react';
import { Module, UserProgress, Lesson, ModuleCategory } from '../types';
import { Notebook } from './Notebook';

interface ModuleListProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onProfileClick: () => void;
  onNotebookAction: (type: 'HABIT' | 'GOAL' | 'GRATITUDE' | 'SUGGESTION') => void;
  onEditModule?: (module: Module) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ 
    modules, 
    userProgress, 
    onSelectLesson, 
    onProfileClick, 
    onNotebookAction,
    onEditModule 
}) => {
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'ALL'>('ALL');

  const categories: { id: ModuleCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'All', icon: '✨' },
    { id: 'SALES', label: 'Sales', icon: '💰' },
    { id: 'PSYCHOLOGY', label: 'Psych', icon: '🧠' },
    { id: 'TACTICS', label: 'Tactics', icon: '⚔️' },
    { id: 'NOTEBOOK', label: 'Log', icon: '📓' },
  ];

  const filteredModules = useMemo(() => {
      let filtered = modules;
      if (userProgress.role !== 'ADMIN') {
          filtered = filtered.filter(m => !m.isHidden || userProgress.completedModuleIds.includes(m.id));
      }
      if (activeCategory !== 'ALL' && activeCategory !== 'NOTEBOOK') {
          filtered = filtered.filter(m => m.category === activeCategory);
      }
      return filtered;
  }, [modules, activeCategory, userProgress.role, userProgress.completedModuleIds]);

  const getModuleVisuals = (category: ModuleCategory) => {
    switch(category) {
      case 'SALES': return { bg: 'bg-[#C6CCFF]', textColor: 'text-[#1F2128]', icon: '💰' };
      case 'PSYCHOLOGY': return { bg: 'bg-[#FFCCEB]', textColor: 'text-[#1F2128]', icon: '🧠' };
      case 'TACTICS': return { bg: 'bg-[#1F2128]', textColor: 'text-white', icon: '⚔️' };
      default: return { bg: 'bg-[#FF9A62]', textColor: 'text-white', icon: '🛡️' };
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-[#1F2128] pb-40">
      
      {/* HEADER: USER INFO */}
      <div className="pt-8 px-6 pb-6 flex justify-between items-center bg-white rounded-b-[3rem] shadow-sm">
          <div className="flex items-center gap-3" onClick={onProfileClick}>
              <div className="w-12 h-12 rounded-full border-2 border-[#FF9A62] p-0.5 overflow-hidden">
                  <img src={userProgress.avatarUrl || 'https://via.placeholder.com/100'} className="w-full h-full rounded-full object-cover" />
              </div>
              <div>
                  <h1 className="text-xl font-black">Hello, {userProgress.name.split(' ')[0]}</h1>
                  <p className="text-[11px] font-bold text-[#6B6D7B]">⚡ Progress: {userProgress.level * 10}%</p>
              </div>
          </div>
          <button className="w-12 h-12 rounded-full bg-[#FDF3E7] flex items-center justify-center text-xl relative border border-black/5">
              🔔
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></div>
          </button>
      </div>

      {/* FEATURED CARD */}
      {activeCategory === 'ALL' && (
          <div className="mx-6 mt-6 p-6 rounded-[3rem] bg-[#6C5DD3] text-white relative overflow-hidden shadow-xl">
              <div className="relative z-10 w-2/3">
                  <h2 className="text-2xl font-black mb-2 leading-tight">Elite Sales Mastery</h2>
                  <p className="text-[11px] opacity-80 mb-6 font-medium">Master the art of high-ticket sales with AI-powered coaching.</p>
                  <button className="w-10 h-10 rounded-full bg-[#1F2128] flex items-center justify-center text-white">
                      →
                  </button>
              </div>
              <div className="absolute right-[-20px] bottom-[-10px] w-48 h-48 opacity-90 select-none pointer-events-none">
                  <span className="text-[140px]">🏆</span>
              </div>
          </div>
      )}

      {/* STATS ROW */}
      {activeCategory === 'ALL' && (
          <div className="grid grid-cols-2 gap-4 mx-6 mt-4">
              <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B6D7B] uppercase tracking-widest flex items-center gap-1">
                      📚 Lessons
                  </span>
                  <span className="text-3xl font-black">{userProgress.completedLessonIds.length}</span>
              </div>
              <div className="bg-white p-6 rounded-[2.5rem] border border-black/5 shadow-sm flex flex-col gap-1">
                  <span className="text-[10px] font-bold text-[#6B6D7B] uppercase tracking-widest flex items-center gap-1">
                      ⏱️ XP
                  </span>
                  <span className="text-3xl font-black">{userProgress.xp}</span>
              </div>
          </div>
      )}

      {/* CATEGORY TABS */}
      <div className="mt-8 px-6">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-4">
            {categories.map((cat) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-[12px] font-bold transition-all border whitespace-nowrap
                    ${activeCategory === cat.id 
                        ? 'bg-[#1F2128] text-white border-[#1F2128]' 
                        : 'bg-white text-[#6B6D7B] border-black/5'}
                    `}
                >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
          </div>
      </div>

      {/* MODULE LIST */}
      <div className="px-6 space-y-4">
        {activeCategory === 'NOTEBOOK' ? (
            <Notebook onAction={onNotebookAction} />
        ) : (
            filteredModules.map((module) => {
                const visuals = getModuleVisuals(module.category);
                const isLocked = userProgress.level < module.minLevel;

                return (
                    <div 
                        key={module.id}
                        className={`
                            relative w-full p-6 rounded-[2.5rem] transition-all duration-300 flex items-center justify-between
                            ${isLocked ? 'opacity-50 grayscale' : `${visuals.bg} ${visuals.textColor} shadow-lg`}
                        `}
                        onClick={() => {
                            if (!isLocked) {
                                const nextLesson = module.lessons.find(l => !userProgress.completedLessonIds.includes(l.id)) || module.lessons[0];
                                if(nextLesson) onSelectLesson(nextLesson);
                            }
                        }}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl">
                                {visuals.icon}
                            </div>
                            <div>
                                <h3 className="text-sm font-black uppercase tracking-tight line-clamp-1">{module.title}</h3>
                                <p className="text-[11px] font-bold opacity-70">
                                    {module.lessons.length} Stages • Min Lvl {module.minLevel}
                                </p>
                            </div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center">
                            {isLocked ? '🔒' : '→'}
                        </button>

                        {userProgress.role === 'ADMIN' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEditModule?.(module); }}
                                className="absolute top-2 right-2 p-2 bg-black/10 rounded-full"
                            >
                                ✏️
                            </button>
                        )}
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};