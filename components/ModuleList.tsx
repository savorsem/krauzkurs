
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Module, UserProgress, Lesson, ModuleCategory } from '../types';
import { Notebook } from './Notebook';
import { AnimatedCounter } from './AnimatedCounter';

interface ModuleListProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onProfileClick: () => void;
  onNotebookAction: (type: 'HABIT' | 'GOAL' | 'GRATITUDE' | 'SUGGESTION') => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, userProgress, onSelectLesson, onProfileClick, onNotebookAction }) => {
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'ALL'>('ALL');
  const [isLevelUp, setIsLevelUp] = useState(false);
  const prevLevelRef = useRef(userProgress.level);

  // Trigger Level Up Animation
  useEffect(() => {
    if (userProgress.level > prevLevelRef.current) {
        setIsLevelUp(true);
        const timer = setTimeout(() => setIsLevelUp(false), 2000);
        prevLevelRef.current = userProgress.level;
        return () => clearTimeout(timer);
    }
  }, [userProgress.level]);

  const categories: { id: ModuleCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'All', icon: '⚡' },
    { id: 'SALES', label: 'Sales', icon: '💰' },
    { id: 'PSYCHOLOGY', label: 'Psy', icon: '🧠' },
    { id: 'TACTICS', label: 'Tac', icon: '⚔️' },
    { id: 'NOTEBOOK', label: 'Notes', icon: '📓' },
  ];

  const avatars = [
    "https://ui-avatars.com/api/?name=Alex&background=random&color=fff",
    "https://ui-avatars.com/api/?name=Max&background=random&color=fff",
    "https://ui-avatars.com/api/?name=Kate&background=random&color=fff"
  ];

  const filteredModules = useMemo(() => {
      if (activeCategory === 'ALL' || activeCategory === 'NOTEBOOK') return modules;
      return modules.filter(m => m.category === activeCategory);
  }, [modules, activeCategory]);

  const xpForCurrentLevel = userProgress.xp % 100;
  const xpProgress = xpForCurrentLevel; 

  const getModuleStyle = (category: ModuleCategory) => {
    switch(category) {
      case 'SALES': return 'from-blue-600/20 via-blue-900/10 to-transparent border-blue-500/30 group-hover:border-blue-400';
      case 'PSYCHOLOGY': return 'from-purple-600/20 via-purple-900/10 to-transparent border-purple-500/30 group-hover:border-purple-400';
      case 'TACTICS': return 'from-red-600/20 via-red-900/10 to-transparent border-red-500/30 group-hover:border-red-400';
      default: return 'from-[#D4AF37]/20 via-transparent to-transparent border-white/10 group-hover:border-[#D4AF37]/50';
    }
  };

  const getFloatingElement = (category: ModuleCategory) => {
    switch(category) {
      case 'SALES': return <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>;
      case 'PSYCHOLOGY': return <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl group-hover:translate-x-10 transition-transform duration-1000"></div>;
      case 'TACTICS': return <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-red-500/5 rotate-45 group-hover:rotate-180 transition-transform duration-[2000ms]"></div>;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#0F1115] relative font-sans text-white">
      <div className="px-6 pt-12 pb-4">
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00B050] rounded-full animate-pulse shadow-[0_0_8px_#00B050]"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYSTEM ONLINE</span>
            </div>
            
            <div className="flex flex-col items-end gap-1.5">
                <div className={`text-[10px] font-black uppercase tracking-widest flex items-center gap-1 transition-all duration-500 ${isLevelUp ? 'text-[#00CEFF] scale-125' : 'text-[#D4AF37]'}`}>
                    {isLevelUp && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00CEFF] opacity-20"></span>}
                    LVL <AnimatedCounter value={userProgress.level} />
                </div>
                <div className="w-24 h-1.5 bg-white/5 rounded-full border border-white/10 overflow-hidden relative group">
                    <div 
                        className={`h-full shadow-[0_0_8px_#D4AF37] transition-all duration-700 ease-out relative ${isLevelUp ? 'bg-[#00CEFF] shadow-[0_0_12px_#00CEFF]' : 'bg-[#D4AF37]'}`}
                        style={{ width: `${xpProgress}%` }}
                    >
                        <div className="absolute top-0 left-0 h-full w-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full animate-[shimmer_2s_infinite]"></div>
                    </div>
                </div>
            </div>
        </div>

        <h1 className="text-[36px] font-black text-white leading-[1] mb-8 tracking-tighter animate-slide-in">
            COURSE <br/> <span className="text-slate-600">OVERVIEW</span>
        </h1>

        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-8 -mx-6 px-6 animate-slide-in delay-100">
            {categories.map((cat) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 whitespace-nowrap active:scale-95 border
                    ${activeCategory === cat.id 
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.4)] ring-2 ring-white/10 scale-105 z-10' 
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20 hover:bg-white/10'
                    }`}
                >
                    <span className={`text-lg transition-transform duration-300 ${activeCategory === cat.id ? 'scale-110' : ''}`}>{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
      </div>

      <div className="px-6 pb-32 space-y-6 animate-slide-up delay-200 fill-mode-both">
        {activeCategory === 'NOTEBOOK' ? (
            <Notebook onAction={onNotebookAction} />
        ) : (
            filteredModules.map((module, idx) => {
                const completedCount = module.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
                const totalCount = module.lessons.length;
                const isLocked = userProgress.level < module.minLevel;
                const totalXp = module.lessons.reduce((acc, lesson) => acc + lesson.xpReward, 0);

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
                            relative w-full aspect-[4/3] rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-all duration-500 border bg-gradient-to-br group
                            ${isLocked 
                                ? 'border-white/5 cursor-not-allowed filter grayscale bg-[#1F2128]' 
                                : `bg-[#1F2128] ${getModuleStyle(module.category)} hover:-translate-y-2 hover:shadow-[0_20px_40px_rgba(0,0,0,0.5)] cursor-pointer active:scale-95`
                            }
                        `}
                        style={{ animationDelay: `${0.1 * idx}s` }}
                    >
                        {!isLocked && getFloatingElement(module.category)}

                        {isLocked && (
                            <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/60 backdrop-blur-[2px] rounded-[2.5rem]">
                                <div className="bg-[#1F2128]/90 backdrop-blur-md px-6 py-4 rounded-3xl border border-white/10 shadow-2xl flex flex-col items-center gap-2 transform translate-y-0 transition-transform">
                                    <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center text-2xl shadow-inner">🔒</div>
                                    <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/40">Locked Content</div>
                                    <div className="text-[11px] font-black text-[#D4AF37] uppercase tracking-widest bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                                        LVL {module.minLevel} REQUIRED
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className={`flex justify-between items-start relative z-10 transition-opacity duration-300 ${isLocked ? 'opacity-20' : ''}`}>
                            <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-2xl text-white border border-white/10 group-hover:scale-110 transition-transform">
                                {module.category === 'SALES' ? '💰' : module.category === 'PSYCHOLOGY' ? '🧠' : '🎓'}
                            </div>
                            
                            {!isLocked && (
                                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 backdrop-blur-md flex items-center justify-center text-[#D4AF37] shadow-lg border border-[#D4AF37]/20 group-hover:bg-[#D4AF37] group-hover:text-black transition-all">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5 group-hover:scale-110 transition-transform">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        <div className={`relative z-10 mt-4 transition-all duration-300 ${isLocked ? 'opacity-20 translate-x-2' : 'group-hover:translate-x-1'}`}>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <span className="w-1 h-1 bg-slate-600 rounded-full"></span>
                                PROGRESS: {completedCount} / {totalCount}
                            </p>
                            <h3 className="text-2xl font-black text-white leading-tight max-w-[80%] tracking-tight group-hover:text-[#00CEFF] transition-colors">
                                {module.title}
                            </h3>
                        </div>

                        <div className={`relative z-10 flex justify-between items-center mt-auto transition-opacity duration-300 ${isLocked ? 'opacity-20' : ''}`}>
                            <div className="flex items-center">
                                <div className="flex -space-x-3 transition-all duration-300 group-hover:space-x-[-10px]">
                                    {avatars.map((av, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1F2128] overflow-hidden bg-slate-700 shadow-lg">
                                            <img src={av} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 ml-3 uppercase group-hover:text-white transition-colors tracking-tight">+20 RECRUITS ACTIVE</span>
                            </div>
                            
                            <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm text-slate-300 text-[9px] font-black border border-white/5 group-hover:bg-[#6C5DD3]/20 group-hover:border-[#6C5DD3]/30 transition-all">
                                {totalXp} XP REWARD
                            </div>
                        </div>

                        <div className={`absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-[0.03] transition-all duration-700 pointer-events-none ${isLocked ? 'opacity-0' : 'group-hover:opacity-[0.1] group-hover:rotate-45'}`}>
                            <svg width="200" height="200" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="10" fill="none" strokeDasharray="20 10" />
                            </svg>
                        </div>
                    </div>
                );
            })
        )}
      </div>
      <style>{`
        @keyframes shimmer {
            0% { transform: translateX(-100%); }
            100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};
