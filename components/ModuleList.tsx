
import React, { useState, useMemo } from 'react';
import { Module, UserProgress, Lesson, ModuleCategory } from '../types';
import { Notebook } from './Notebook';

interface ModuleListProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onProfileClick: () => void;
  onNotebookAction: (type: 'HABIT' | 'GOAL' | 'GRATITUDE' | 'SUGGESTION') => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, userProgress, onSelectLesson, onProfileClick, onNotebookAction }) => {
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'ALL'>('ALL');

  const categories: { id: ModuleCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'All', icon: '⚡' },
    { id: 'SALES', label: 'Sales', icon: '💰' },
    { id: 'PSYCHOLOGY', label: 'Psy', icon: '🧠' },
    { id: 'TACTICS', label: 'Tac', icon: '⚔️' },
    { id: 'NOTEBOOK', label: 'Notes', icon: '📓' },
  ];

  // Avatars for the "squad" feel
  const avatars = [
    "https://ui-avatars.com/api/?name=Alex&background=random&color=fff",
    "https://ui-avatars.com/api/?name=Max&background=random&color=fff",
    "https://ui-avatars.com/api/?name=Kate&background=random&color=fff"
  ];

  const filteredModules = useMemo(() => {
      if (activeCategory === 'ALL' || activeCategory === 'NOTEBOOK') return modules;
      return modules.filter(m => m.category === activeCategory);
  }, [modules, activeCategory]);

  return (
    <div className="min-h-screen bg-[#0F1115] relative font-sans text-white">
      {/* HEADER SECTION - Cleaned up */}
      <div className="px-6 pt-12 pb-4">
        {/* Status Bar */}
        <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00B050] rounded-full animate-pulse shadow-[0_0_8px_#00B050]"></span>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">SYSTEM ONLINE</span>
            </div>
            <div className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest">
                LVL {userProgress.level}
            </div>
        </div>

        {/* Title */}
        <h1 className="text-[36px] font-black text-white leading-[1] mb-8 tracking-tighter animate-slide-in">
            COURSE <br/> <span className="text-slate-600">OVERVIEW</span>
        </h1>

        {/* Categories Scroller */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-4 -mx-6 px-6 animate-slide-in delay-100">
            {categories.map((cat) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-[10px] font-black uppercase transition-all whitespace-nowrap active:scale-95 border
                    ${activeCategory === cat.id 
                        ? 'bg-[#D4AF37] text-black border-[#D4AF37] shadow-lg shadow-[#D4AF37]/20' 
                        : 'bg-white/5 text-slate-400 border-white/5 hover:border-white/20'
                    }`}
                >
                    <span className="opacity-80">{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>
      </div>

      {/* MODULES LIST OR NOTEBOOK */}
      <div className="px-6 pb-32 space-y-6 animate-slide-up delay-200 fill-mode-both">
        {activeCategory === 'NOTEBOOK' ? (
            <Notebook onAction={onNotebookAction} />
        ) : (
            filteredModules.map((module, idx) => {
                const completedCount = module.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
                const totalCount = module.lessons.length;
                const isLocked = userProgress.level < module.minLevel;

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
                            relative w-full aspect-[4/3] rounded-[2.5rem] p-6 flex flex-col justify-between overflow-hidden shadow-2xl transition-transform active:scale-95 cursor-pointer border
                            ${isLocked ? 'border-white/5 opacity-50 grayscale' : 'border-white/10 hover:border-[#6C5DD3]/50'}
                            bg-[#1F2128]
                        `}
                        style={{ animationDelay: `${0.1 * idx}s` }}
                    >
                        {/* Background Texture/Gradient */}
                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent pointer-events-none"></div>
                        
                        {/* Top Row */}
                        <div className="flex justify-between items-start relative z-10">
                            <div className="w-12 h-12 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center text-2xl text-white border border-white/10">
                                {module.category === 'SALES' ? '💰' : module.category === 'PSYCHOLOGY' ? '🧠' : '🎓'}
                            </div>
                            
                            {isLocked ? (
                                <div className="w-8 h-8 flex items-center justify-center text-slate-600">🔒</div>
                            ) : (
                                <div className="w-12 h-12 rounded-full bg-[#D4AF37]/10 backdrop-blur-md flex items-center justify-center text-[#D4AF37] shadow-lg border border-[#D4AF37]/20">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
                                        <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                                    </svg>
                                </div>
                            )}
                        </div>

                        {/* Middle Content */}
                        <div className="relative z-10 mt-4">
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-2">
                                PROGRESS: {completedCount} / {totalCount}
                            </p>
                            <h3 className="text-2xl font-black text-white leading-tight max-w-[80%] tracking-tight">
                                {module.title}
                            </h3>
                        </div>

                        {/* Bottom Row */}
                        <div className="relative z-10 flex justify-between items-center mt-auto">
                            <div className="flex items-center">
                                <div className="flex -space-x-3">
                                    {avatars.map((av, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1F2128] overflow-hidden bg-slate-700">
                                            <img src={av} className="w-full h-full object-cover" />
                                        </div>
                                    ))}
                                </div>
                                <span className="text-[9px] font-bold text-slate-400 ml-3 uppercase">+20 RECRUITS</span>
                            </div>
                            
                            <div className="px-3 py-1 rounded-full bg-white/5 backdrop-blur-sm text-slate-300 text-[9px] font-black border border-white/5">
                                {module.lessons.length * 100} XP
                            </div>
                        </div>

                        {/* Decorative Circle Progress (Right side) */}
                        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 opacity-5 pointer-events-none">
                            <svg width="200" height="200" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="40" stroke="white" strokeWidth="10" fill="none" strokeDasharray="20 10" />
                            </svg>
                        </div>
                    </div>
                );
            })
        )}
      </div>
    </div>
  );
};
