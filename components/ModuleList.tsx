import React, { useState, useMemo, useEffect } from 'react';
import { Module, UserProgress, Lesson, ModuleCategory, ThemeConfig } from '../types';
import { Notebook } from './Notebook';
import { AnimatedCounter } from './AnimatedCounter';
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
  
  const accent = theme?.accentColor || '#D4AF37';
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

  const xpProgress = userProgress.xp % 100; 

  // Visual helper for categories
  const getModuleVisuals = (category: ModuleCategory) => {
    switch(category) {
      case 'SALES': return {
          gradient: 'from-blue-900/90 to-[#1F2128]',
          border: 'border-blue-500/30',
          shadow: 'shadow-blue-500/20',
          icon: '💰',
          watermarkColor: 'text-blue-500',
          accentColor: 'text-blue-400',
          barColor: 'bg-blue-500',
          pattern: (
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none group-hover:scale-110 transition-transform duration-700">
                <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="sales_pattern" width="20" height="20" patternUnits="userSpaceOnUse">
                             <circle cx="1" cy="1" r="1" className="fill-blue-400" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#sales_pattern)" />
                </svg>
                <div className="absolute top-[-50px] right-[-50px] w-64 h-64 bg-blue-600 rounded-full blur-[80px] opacity-20 animate-pulse-slow"></div>
            </div>
          )
      };
      case 'PSYCHOLOGY': return {
          gradient: 'from-purple-900/90 to-[#1F2128]',
          border: 'border-purple-500/30',
          shadow: 'shadow-purple-500/20',
          icon: '🧠',
          watermarkColor: 'text-purple-500',
          accentColor: 'text-purple-400',
          barColor: 'bg-purple-500',
          pattern: (
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none group-hover:rotate-3 transition-transform duration-700">
                 <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                     <path d="M0,50 Q50,0 100,50 T200,50" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500 opacity-20" />
                     <path d="M0,150 Q50,100 100,150 T200,150" fill="none" stroke="currentColor" strokeWidth="2" className="text-purple-500 opacity-20" />
                 </svg>
                 <div className="absolute bottom-[-50px] left-[-50px] w-64 h-64 bg-purple-600 rounded-full blur-[80px] opacity-20 animate-pulse-slow delay-700"></div>
            </div>
          )
      };
      case 'TACTICS': return {
          gradient: 'from-red-900/90 to-[#1F2128]',
          border: 'border-red-500/30',
          shadow: 'shadow-red-500/20',
          icon: '⚔️',
          watermarkColor: 'text-red-500',
          accentColor: 'text-red-400',
          barColor: 'bg-red-500',
          pattern: (
            <div className="absolute inset-0 opacity-[0.07] pointer-events-none">
                 <div className="absolute top-0 right-0 w-full h-full" style={{ backgroundImage: 'linear-gradient(45deg, transparent 48%, rgba(239, 68, 68, 0.3) 50%, transparent 52%)', backgroundSize: '10px 10px' }}></div>
                 <div className="absolute top-10 right-10 w-32 h-32 border-4 border-red-500/20 rounded-full blur-sm group-hover:scale-125 transition-transform duration-500"></div>
            </div>
          )
      };
      default: return { // GENERAL
          gradient: 'from-yellow-900/90 to-[#1F2128]',
          border: 'border-[#D4AF37]/30',
          shadow: 'shadow-[#D4AF37]/20',
          icon: '🛡️',
          watermarkColor: 'text-[#D4AF37]',
          accentColor: 'text-[#D4AF37]',
          barColor: 'bg-[#D4AF37]',
          pattern: (
             <div className="absolute inset-0 opacity-[0.05] pointer-events-none group-hover:scale-105 transition-transform duration-1000">
                 <svg width="100%" height="100%">
                    <pattern id="hexagons" width="50" height="43.4" patternUnits="userSpaceOnUse" patternTransform="scale(2)">
                      <path d="M25 0 L50 14.4 L50 43.3 L25 57.7 L0 43.3 L0 14.4 Z" fill="none" stroke="currentColor" strokeWidth="1" className="text-[#D4AF37]"/>
                    </pattern>
                    <rect width="100%" height="100%" fill="url(#hexagons)" />
                 </svg>
                 <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent"></div>
             </div>
          )
      };
    }
  };

  return (
    <div className="min-h-screen relative font-sans text-white overflow-x-hidden pb-40">
      
      {/* HERO SECTION */}
      <div className="relative z-10 pt-8 pb-10 px-6 overflow-hidden">
          <div className="flex justify-between items-start mb-10">
              <div>
                  <div className="flex items-center gap-2 mb-1">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#00B050]"></div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">СИСТЕМА АКТИВНА</span>
                  </div>
                  <h1 className="text-4xl font-black text-white leading-none tracking-tighter drop-shadow-lg">
                      С ВОЗВРАЩЕНИЕМ, <br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{userProgress.name.split(' ')[0].toUpperCase()}</span>
                  </h1>
              </div>
              <div 
                onClick={onProfileClick}
                className="w-14 h-14 rounded-full border-2 border-white/20 p-0.5 relative cursor-pointer active:scale-95 transition-transform backdrop-blur-md bg-white/5"
              >
                  <img src={userProgress.avatarUrl || 'https://via.placeholder.com/100'} className="w-full h-full rounded-full object-cover filter brightness-90" />
                  <div className="absolute -bottom-1 -right-1 bg-[#D4AF37] text-black text-[10px] font-black px-1.5 py-0.5 rounded-md border border-black/50">
                      L{userProgress.level}
                  </div>
              </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mb-8">
              <div className="flex justify-between items-end mb-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Опыт</span>
                  <span className="text-sm font-black text-white">{userProgress.xp} <span className="text-[#D4AF37]">XP</span></span>
              </div>
              <div className="h-3 w-full bg-[#1F2128]/60 rounded-full overflow-hidden border border-white/5 relative backdrop-blur-sm">
                  <div 
                    className="h-full bg-gradient-to-r from-[#2B4E99] to-[#00CEFF] shadow-[0_0_15px_#00CEFF] relative"
                    style={{ width: `${xpProgress}%` }}
                  >
                      <div className="absolute top-0 right-0 bottom-0 w-1 bg-white opacity-50 shadow-[0_0_5px_white]"></div>
                  </div>
              </div>
          </div>

          {/* Categories */}
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {categories.map((cat) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 border backdrop-blur-md
                    ${activeCategory === cat.id 
                        ? 'bg-white/90 text-black border-white shadow-[0_0_20px_rgba(255,255,255,0.3)] scale-105' 
                        : 'bg-black/30 text-slate-400 border-white/10 hover:border-white/30 hover:bg-black/50'}
                    `}
                >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* MODULE LIST */}
      <div className="px-6 space-y-6 relative z-10 min-h-[500px]">
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
                const parallaxY = (scrollPos * (0.05 + idx * 0.01));

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
                            relative w-full min-h-[240px] flex flex-col justify-end p-6 overflow-hidden transition-all duration-500 group rounded-[2.5rem] border backdrop-blur-md
                            ${isLocked 
                                ? 'opacity-80 grayscale filter brightness-50 cursor-not-allowed border-white/5 bg-[#1F2128]/80' 
                                : `cursor-pointer hover:scale-[1.02] hover:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] ${visuals.border} ${visuals.shadow} bg-[#1F2128]/80`
                            }
                        `}
                        style={{ borderRadius: radius }}
                    >
                        {/* Dynamic Background Image with Mix Blend */}
                        <div 
                            className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 group-hover:scale-110 opacity-30 mix-blend-overlay"
                            style={{ 
                                backgroundImage: `url(${module.imageUrl})`,
                                transform: `scale(1.1) translateY(${parallaxY * 0.2}px)`
                            }}
                        ></div>
                        
                        {/* Category Specific Pattern */}
                        {visuals.pattern}
                        
                        {/* Gradient Overlay */}
                        <div className={`absolute inset-0 bg-gradient-to-t ${visuals.gradient} transition-opacity duration-500`}></div>

                        {/* Category Watermark Icon */}
                        <div className={`absolute -right-4 -top-4 text-9xl opacity-[0.05] group-hover:opacity-[0.15] group-hover:scale-110 group-hover:rotate-12 transition-all duration-700 ${visuals.watermarkColor}`}>
                            {visuals.icon}
                        </div>

                        {/* Content */}
                        <div className="relative z-20">
                            <div className="flex justify-between items-end mb-3">
                                <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-white/20 shadow-lg flex items-center gap-2
                                    ${isCompleted ? 'bg-[#00B050] text-white' : 'bg-white/10 text-white'}
                                `}>
                                    {isCompleted ? (
                                        <><span>✓</span> ЗАВЕРШЕНО</>
                                    ) : (
                                        <><span>⚡</span> {completedCount}/{totalCount} ЭТАПОВ</>
                                    )}
                                </span>
                                {module.videoUrl && (
                                     <span className="px-2 py-1.5 bg-black/50 rounded-lg text-white/80 border border-white/10 backdrop-blur-sm">
                                         🎥
                                     </span>
                                )}
                                {isLocked && (
                                    <span className="px-3 py-1 rounded-lg bg-red-500/80 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-red-500/20 flex items-center gap-1">
                                        <span>🔒</span> ЗАКРЫТО
                                    </span>
                                )}
                                {module.isHidden && (
                                    <span className="px-3 py-1 rounded-lg bg-slate-500/80 text-white text-[9px] font-black uppercase tracking-widest backdrop-blur-md border border-slate-500/20 flex items-center gap-1 ml-2">
                                        👁️ СКРЫТО
                                    </span>
                                )}
                            </div>

                            <h3 className="text-3xl font-black text-white leading-[0.9] mb-3 drop-shadow-xl tracking-tight group-hover:translate-x-2 transition-transform duration-300">
                                {module.title.split(':').map((part, i) => (
                                    <span key={i} className={i === 0 ? `block text-lg mb-1 font-bold opacity-80 ${visuals.accentColor}` : "block"}>{part}</span>
                                ))}
                            </h3>
                            
                            <p className="text-sm font-medium text-slate-300 line-clamp-2 max-w-[95%] drop-shadow-md mb-5 group-hover:text-white transition-colors">
                                {module.description}
                            </p>

                            {/* Enhanced Progress Bar */}
                            <div className="mt-auto">
                                <div className="flex justify-between items-center mb-1">
                                    <span className={`text-[9px] font-bold uppercase tracking-widest opacity-80 ${visuals.accentColor}`}>
                                        Прогресс
                                    </span>
                                    <span className="text-[10px] font-black text-white">
                                        {progressPercentage}%
                                    </span>
                                </div>
                                <div className="h-1.5 w-full bg-black/40 rounded-full overflow-hidden border border-white/5 backdrop-blur-sm">
                                    <div 
                                        className={`h-full transition-all duration-1000 relative ${visuals.barColor} shadow-[0_0_10px_currentColor]`} 
                                        style={{ width: `${progressPercentage}%` }}
                                    >
                                        <div className="absolute top-0 right-0 bottom-0 w-2 bg-white/50 blur-[2px]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Lock Overlay Detail */}
                        {isLocked && (
                             <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 backdrop-blur-[4px] z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                 <div className="text-5xl mb-4 animate-bounce">🔒</div>
                                 <div className="text-xs font-black uppercase tracking-widest text-red-400 border border-red-400/50 px-6 py-3 rounded-2xl bg-black/80 shadow-2xl">
                                     {missingPrereqs.length > 0 ? "ТРЕБУЕТСЯ ПРЕДЫДУЩИЙ МОДУЛЬ" : `ДОСТУП С УРОВНЯ ${module.minLevel}`}
                                 </div>
                             </div>
                        )}
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};