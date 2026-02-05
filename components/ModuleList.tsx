
import React, { useState, useMemo, useEffect } from 'react';
import { Module, UserProgress, Lesson, ModuleCategory, ThemeConfig } from '../types';
import { Notebook } from './Notebook';
import ReactPlayer from 'react-player';

const VideoPlayer = (ReactPlayer as any).default || ReactPlayer;

interface ModuleListProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onProfileClick: () => void;
  onNotebookAction: (type: 'HABIT' | 'GOAL' | 'GRATITUDE' | 'SUGGESTION') => void;
  theme?: ThemeConfig;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, userProgress, onSelectLesson, onProfileClick, onNotebookAction, theme }) => {
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'ALL'>('ALL');
  const [scrollPos, setScrollPos] = useState(0);
  const [hoveredModuleId, setHoveredModuleId] = useState<string | null>(null);
  
  const radius = theme?.borderRadius === 'SHARP' ? '0.5rem' : '2.5rem';

  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const categories: { id: ModuleCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'Обзор', icon: '⚡' },
    { id: 'SALES', label: 'Продажи', icon: '💰' },
    { id: 'PSYCHOLOGY', label: 'Психо', icon: '🧠' },
    { id: 'TACTICS', label: 'Тактика', icon: '⚔️' },
    { id: 'NOTEBOOK', label: 'Блокнот', icon: '📓' },
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

  // Visual helper for categories
  const getModuleVisuals = (category: ModuleCategory) => {
    switch(category) {
      case 'SALES': return {
          gradient: 'from-[#0F172A] to-[#1E3A8A]',
          border: 'border-blue-500/20',
          shadow: 'shadow-blue-500/10',
          icon: '💰',
          accentColor: 'text-blue-400',
          barColor: 'bg-blue-500',
      };
      case 'PSYCHOLOGY': return {
          gradient: 'from-[#2E1065] to-[#581C87]',
          border: 'border-purple-500/20',
          shadow: 'shadow-purple-500/10',
          icon: '🧠',
          accentColor: 'text-purple-400',
          barColor: 'bg-purple-500',
      };
      case 'TACTICS': return {
          gradient: 'from-[#450A0A] to-[#7F1D1D]',
          border: 'border-red-500/20',
          shadow: 'shadow-red-500/10',
          icon: '⚔️',
          accentColor: 'text-red-400',
          barColor: 'bg-red-500',
      };
      default: return { // GENERAL
          gradient: 'from-[#1F2128] to-[#1A1C23]',
          border: 'border-[#D4AF37]/20',
          shadow: 'shadow-[#D4AF37]/10',
          icon: '🛡️',
          accentColor: 'text-[#D4AF37]',
          barColor: 'bg-[#D4AF37]',
      };
    }
  };

  const DailyBriefing = () => (
      <div className="mx-6 mt-6 mb-8 p-6 rounded-[2.5rem] bg-gradient-to-r from-[#1F2128] to-[#131419] border border-white/5 relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-8 opacity-5 text-8xl pointer-events-none">🎯</div>
          <div className="relative z-10">
              <div className="flex justify-between items-start mb-4">
                  <div>
                      <h2 className="text-xl font-black text-white uppercase tracking-tight mb-1">Ежедневная Сводка</h2>
                      <p className="text-slate-400 text-xs font-bold">Цель: Закрыть 3 модуля</p>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-[#00B050]/20 flex items-center justify-center text-[#00B050] border border-[#00B050]/30 animate-pulse-slow">
                      ⚡
                  </div>
              </div>
              <div className="w-full h-2 bg-black/50 rounded-full overflow-hidden mb-2">
                  <div className="h-full bg-gradient-to-r from-[#6C5DD3] to-[#00CEFF] w-[45%]"></div>
              </div>
              <div className="flex justify-between text-[9px] font-black uppercase text-slate-500 tracking-widest">
                  <span>Прогресс дня</span>
                  <span>45%</span>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen relative font-sans text-white overflow-x-hidden pb-40 bg-[#0F1115]">
      
      {/* HERO / HEADER */}
      <div className="relative z-10 pt-8 pb-4 px-6">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <div 
                    onClick={onProfileClick}
                    className="w-12 h-12 rounded-full border border-white/10 p-0.5 relative cursor-pointer active:scale-95 transition-transform bg-[#1F2128]"
                  >
                      <img src={userProgress.avatarUrl || 'https://via.placeholder.com/100'} className="w-full h-full rounded-full object-cover" />
                      <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black text-[9px] font-black px-1.5 rounded-md border border-black/50">
                          {userProgress.level}
                      </div>
                  </div>
                  <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">В сети</p>
                      <h1 className="text-lg font-black text-white leading-none">{userProgress.name}</h1>
                  </div>
              </div>
              <div className="flex items-center gap-2 bg-[#1F2128] px-3 py-1.5 rounded-full border border-white/5">
                  <span className="text-[#D4AF37]">🪙</span>
                  <span className="font-bold text-xs">{userProgress.balance}</span>
              </div>
          </div>

          {/* Categories */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2 mask-linear">
            {categories.map((cat) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[10px] font-black uppercase transition-all duration-300 border backdrop-blur-md flex-shrink-0
                    ${activeCategory === cat.id 
                        ? 'bg-white text-black border-white shadow-lg shadow-white/10 scale-105' 
                        : 'bg-[#1F2128] text-slate-400 border-white/5 hover:bg-[#2a2d36]'}
                    `}
                >
                    <span className="text-sm">{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
      </div>

      <DailyBriefing />

      {/* MODULE LIST */}
      <div className="px-6 space-y-5 relative z-10 min-h-[500px]">
        {activeCategory === 'NOTEBOOK' ? (
            <Notebook onAction={onNotebookAction} />
        ) : (
            filteredModules.map((module, idx) => {
                const completedCount = module.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
                const totalCount = module.lessons.length;
                const progressPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
                
                const isCompleted = userProgress.completedModuleIds.includes(module.id);
                const missingPrereqs = module.prerequisites.filter(pid => !userProgress.completedModuleIds.includes(pid));
                const isLocked = !isCompleted && (userProgress.level < module.minLevel || missingPrereqs.length > 0);
                
                const visuals = getModuleVisuals(module.category);

                return (
                    <div 
                        key={module.id}
                        onClick={() => {
                            if (!isLocked) {
                                const nextLesson = module.lessons.find(l => !userProgress.completedLessonIds.includes(l.id)) || module.lessons[0];
                                if(nextLesson) onSelectLesson(nextLesson);
                            }
                        }}
                        onMouseEnter={() => setHoveredModuleId(module.id)}
                        onMouseLeave={() => setHoveredModuleId(null)}
                        className={`
                            relative w-full min-h-[200px] flex flex-col justify-end p-6 overflow-hidden transition-all duration-300 group rounded-[2.5rem] border backdrop-blur-md
                            ${isLocked 
                                ? 'opacity-75 grayscale filter cursor-not-allowed border-white/5 bg-[#1F2128]' 
                                : `cursor-pointer hover:scale-[1.02] ${visuals.border} ${visuals.shadow} bg-gradient-to-br ${visuals.gradient}`
                            }
                        `}
                        style={{ borderRadius: radius }}
                    >
                        {/* Background Image Overlay */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
                            style={{ backgroundImage: `url(${module.imageUrl})` }}
                        ></div>

                        {/* Content */}
                        <div className="relative z-20">
                            <div className="flex justify-between items-start mb-6">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1 backdrop-blur-sm
                                    ${isCompleted ? 'bg-[#00B050]/20 text-[#00B050]' : 'bg-white/10 text-slate-300'}
                                `}>
                                    {isCompleted ? '✓ ПРОЙДЕНО' : `${completedCount}/${totalCount} ЭТАПОВ`}
                                </span>
                                {isLocked && <span className="text-xl">🔒</span>}
                            </div>

                            <h3 className="text-2xl font-black text-white leading-tight mb-2 uppercase tracking-tight">
                                {module.title}
                            </h3>
                            
                            <p className="text-xs font-medium text-slate-400 line-clamp-2 mb-4">
                                {module.description}
                            </p>

                            {/* Progress Bar */}
                            <div className="mt-auto">
                                <div className="h-1 w-full bg-black/30 rounded-full overflow-hidden backdrop-blur-sm">
                                    <div 
                                        className={`h-full transition-all duration-1000 ${visuals.barColor}`} 
                                        style={{ width: `${progressPercentage}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
