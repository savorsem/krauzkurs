
import React, { useState, useMemo, useEffect, useRef } from 'react';
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
  const [isLevelUp, setIsLevelUp] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const [scrollPos, setScrollPos] = useState(0);
  const [newlyUnlockedIds, setNewlyUnlockedIds] = useState<string[]>([]);
  const prevLevelRef = useRef(userProgress.level);

  const accent = theme?.accentColor || '#D4AF37';
  const radius = theme?.borderRadius === 'SHARP' ? '0.5rem' : '2.5rem';

  // Scroll listener for parallax
  useEffect(() => {
    const handleScroll = () => {
      setScrollPos(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (userProgress.level > prevLevelRef.current) {
        setIsLevelUp(true);
        const unlocked = modules
          .filter(m => m.minLevel > prevLevelRef.current && m.minLevel <= userProgress.level)
          .map(m => m.id);
        
        if (unlocked.length > 0) {
          setNewlyUnlockedIds(unlocked);
          setTimeout(() => setNewlyUnlockedIds([]), 5000);
        }
        const timer = setTimeout(() => setIsLevelUp(false), 2000);
        prevLevelRef.current = userProgress.level;
        return () => clearTimeout(timer);
    }
  }, [userProgress.level, modules]);

  const categories: { id: ModuleCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'All', icon: '⚡' },
    { id: 'SALES', label: 'Sales', icon: '💰' },
    { id: 'PSYCHOLOGY', label: 'Psy', icon: '🧠' },
    { id: 'TACTICS', label: 'Tac', icon: '⚔️' },
    { id: 'NOTEBOOK', label: 'Notes', icon: '📓' },
  ];

  const filteredModules = useMemo(() => {
      if (activeCategory === 'ALL' || activeCategory === 'NOTEBOOK') return modules;
      return modules.filter(m => m.category === activeCategory);
  }, [modules, activeCategory]);

  const xpProgress = userProgress.xp % 100; 

  const getModuleStyle = (category: ModuleCategory) => {
    switch(category) {
      case 'SALES': return 'from-blue-600/30 via-blue-900/10 to-transparent border-blue-400/40 hover:shadow-blue-500/20';
      case 'PSYCHOLOGY': return 'from-purple-600/30 via-purple-900/10 to-transparent border-purple-400/40 hover:shadow-purple-500/20';
      case 'TACTICS': return 'from-red-600/30 via-red-900/10 to-transparent border-red-400/40 hover:shadow-red-500/20';
      default: return `from-[${accent}]/30 via-transparent to-transparent border-white/20 hover:shadow-white/10`;
    }
  };

  const getModuleBackground = (module: Module) => {
    if (module.imageUrl) {
      return `linear-gradient(to bottom, rgba(31, 33, 40, 0.4), rgba(31, 33, 40, 0.95)), url(${module.imageUrl})`;
    }
    return 'none';
  };

  return (
    <div className="min-h-screen bg-[#0F1115] relative font-sans text-white overflow-x-hidden">
      {/* HEADER */}
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00B050] rounded-full animate-pulse shadow-[0_0_8px_#00B050]"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYSTEM ONLINE</span>
            </div>
            
            <div className="flex flex-col items-end gap-1.5">
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all duration-500 ${isLevelUp ? 'text-[#00CEFF] scale-125' : `text-[${accent}]`}`}>
                    LVL <AnimatedCounter value={userProgress.level} />
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full border border-white/10 overflow-hidden relative group">
                    <div className={`h-full transition-all duration-700 ease-out relative ${isLevelUp ? 'bg-[#00CEFF]' : `bg-[${accent}]`}`} style={{ width: `${xpProgress}%`, backgroundColor: isLevelUp ? '#00CEFF' : accent }}>
                        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
            </div>
        </div>

        <h1 className="text-[36px] font-black text-white leading-[1] mb-8 tracking-tighter">
            COURSE <br/> <span className="text-slate-600">OVERVIEW</span>
        </h1>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6">
            {categories.map((cat) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 text-[10px] font-black uppercase transition-all duration-300 border
                    ${activeCategory === cat.id ? 'text-black scale-105' : 'bg-white/5 text-slate-400 border-white/5'}
                    `}
                    style={{ 
                        borderRadius: theme?.borderRadius === 'SHARP' ? '0.5rem' : '1rem',
                        backgroundColor: activeCategory === cat.id ? accent : undefined,
                        borderColor: activeCategory === cat.id ? accent : undefined
                    }}
                >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* VIDEO OVERLAY */}
      {activeVideo && (
        <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center p-4 animate-fade-in">
            <button onClick={() => setActiveVideo(null)} className="absolute top-8 right-8 text-white text-3xl z-30">×</button>
            <div className="w-full max-w-xl aspect-video rounded-2xl overflow-hidden shadow-2xl">
                <VideoPlayer url={activeVideo} width="100%" height="100%" controls playing />
            </div>
        </div>
      )}

      {/* MODULE CARDS */}
      <div className="px-6 pb-32 space-y-8">
        {activeCategory === 'NOTEBOOK' ? (
            <Notebook onAction={onNotebookAction} />
        ) : (
            filteredModules.map((module, idx) => {
                const completedCount = module.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
                const totalCount = module.lessons.length;
                
                const isCompleted = userProgress.completedModuleIds.includes(module.id);
                const isLevelLocked = userProgress.level < module.minLevel;
                const isPrereqLocked = module.prerequisites.some(pid => !userProgress.completedModuleIds.includes(pid));
                const isLocked = !isCompleted && (isLevelLocked || isPrereqLocked);
                
                const isNewlyUnlocked = newlyUnlockedIds.includes(module.id);
                const totalXp = module.lessons.reduce((acc, l) => acc + l.xpReward, 0);

                const parallaxY = (scrollPos * 0.08);

                return (
                    <div 
                        key={module.id}
                        onClick={() => {
                            if (!isLocked) {
                                const nextLesson = module.lessons.find(l => !userProgress.completedLessonIds.includes(l.id)) || module.lessons[0];
                                if(nextLesson) onSelectLesson(nextLesson);
                            }
                        }}
                        className={`
                            relative w-full aspect-[4/3] p-6 flex flex-col justify-between overflow-hidden shadow-2xl border transition-all duration-[400ms] cubic-bezier(0.23, 1, 0.32, 1) group
                            ${isLocked 
                                ? 'border-white/5 opacity-50 grayscale bg-[#1F2128] cursor-not-allowed' 
                                : `bg-[#1F2128] ${getModuleStyle(module.category)} hover:-translate-y-3 hover:brightness-125 hover:saturate-[1.2] cursor-pointer active:scale-[0.98] active:brightness-95 hover:scale-[1.03] hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)]`
                            }
                            ${isCompleted ? 'border-[#00B050]/50' : ''}
                            ${isNewlyUnlocked ? `animate-unlock-pulse ring-4 ring-[${accent}] shadow-[0_0_50px_rgba(212,175,55,0.4)]` : ''}
                        `}
                        style={{ 
                          borderRadius: radius,
                          animationDelay: isNewlyUnlocked ? '0s' : `${0.1 * idx}s`,
                          backgroundImage: getModuleBackground(module),
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                    >
                        {/* Parallax Background Pattern */}
                        {!isLocked && (
                            <div className="absolute inset-0 opacity-[0.2] pointer-events-none transition-transform duration-300" 
                                 style={{ 
                                   backgroundSize: '40px 40px',
                                   transform: `translateY(${parallaxY % 40}px)` 
                                 }}></div>
                        )}

                        {/* Completion Indicator */}
                        {isCompleted && (
                            <div className="absolute top-6 right-6 z-40 bg-[#00B050] text-white w-8 h-8 rounded-full flex items-center justify-center shadow-lg border border-white/20 animate-scale-in">
                                <span className="font-bold">✓</span>
                            </div>
                        )}

                        {isLocked && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/70 backdrop-blur-[4px]" style={{ borderRadius: radius }}>
                                <div className="text-center animate-scale-in flex flex-col items-center">
                                    <div className="text-5xl mb-4 drop-shadow-[0_0_15px_rgba(255,255,255,0.5)]">🔒</div>
                                    <div className="text-[12px] font-black uppercase tracking-widest px-4 py-1.5 bg-black/40 rounded-full border border-[#D4AF37]/30" style={{ color: accent, borderColor: accent }}>
                                         {isLevelLocked ? `LVL ${module.minLevel} REQUIRED` : 'PREREQUISITES MISSING'}
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="flex justify-between items-start relative z-10">
                            <div className={`w-12 h-12 rounded-full backdrop-blur-md flex items-center justify-center text-2xl border transition-all ${isCompleted ? 'bg-[#00B050]/20 border-[#00B050]/40' : 'bg-white/10 border-white/20 group-hover:scale-110 group-hover:bg-white/20'}`}>
                                {module.category === 'SALES' ? '💰' : module.category === 'PSYCHOLOGY' ? '🧠' : module.category === 'TACTICS' ? '⚔️' : '🎓'}
                            </div>
                        </div>

                        <div className="relative z-10 group-hover:translate-x-1 transition-transform">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1 flex items-center gap-2 drop-shadow-md">
                                <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_5px] ${isCompleted ? 'bg-[#00CEFF] shadow-[#00CEFF]' : 'bg-[#00B050] shadow-[#00B050]'}`}></span>
                                MISSION: {completedCount}/{totalCount}
                            </p>
                            <h3 className="text-2xl font-black text-white leading-tight tracking-tight transition-colors drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                                {module.title}
                            </h3>
                        </div>

                        <div className="relative z-10 flex justify-between items-center mt-auto">
                           <div className={`px-3 py-1 rounded-full backdrop-blur-sm text-[9px] font-black border shadow-lg transition-all ${isCompleted ? 'bg-[#00B050] text-white border-[#00B050]' : `bg-white/10 text-white border-white/10 group-hover:bg-[${accent}] group-hover:text-black`}`}>
                                {totalXp} XP
                            </div>
                        </div>
                    </div>
                );
            })
        )}
      </div>
      <style>{`
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        @keyframes unlock-pulse {
          0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0.7); }
          50% { transform: scale(1.02); box-shadow: 0 0 30px 10px rgba(212, 175, 55, 0); }
          100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(212, 175, 55, 0); }
        }
        .animate-unlock-pulse {
          animation: unlock-pulse 2s infinite;
        }
      `}</style>
    </div>
  );
};
