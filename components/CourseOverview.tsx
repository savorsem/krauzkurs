
import React from 'react';
import { Module, UserProgress, Lesson } from '../types';

interface CourseOverviewProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
}

export const CourseOverview: React.FC<CourseOverviewProps> = ({ modules, userProgress, onSelectLesson }) => {
  return (
    <div className="min-h-screen pb-40 animate-fade-in px-6 pt-12">
      <header className="mb-10">
        <div className="flex items-center gap-2 mb-2">
            <span className="w-12 h-[1px] bg-[#D4AF37]"></span>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Tactical Roadmap</span>
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter">
            ПЛАН <span className="text-slate-500">ПОДГОТОВКИ</span>
        </h1>
        <p className="text-slate-400 text-sm mt-2 max-w-xs">
            Полный путь от новобранца до легендарного спартанца продаж.
        </p>
      </header>

      <div className="relative space-y-12">
        {/* Timeline Path Line */}
        <div className="absolute left-8 top-4 bottom-4 w-[2px] bg-gradient-to-b from-[#D4AF37] via-slate-800 to-slate-800 opacity-20"></div>

        {modules.map((module, idx) => {
          const isUnlocked = userProgress.level >= module.minLevel;
          const isCompleted = userProgress.completedModuleIds.includes(module.id);
          const totalXp = module.lessons.reduce((acc, curr) => acc + curr.xpReward, 0);

          return (
            <div key={module.id} className={`relative flex items-start gap-8 transition-all duration-500 ${isUnlocked ? 'opacity-100' : 'opacity-40 grayscale'}`}>
              {/* Connector Circle */}
              <div className={`
                flex-shrink-0 w-16 h-16 rounded-2xl flex items-center justify-center z-10 border-2 transition-all duration-500
                ${isCompleted ? 'bg-[#00B050] border-[#00B050] shadow-[0_0_15px_rgba(0,176,80,0.4)]' : 
                  isUnlocked ? 'bg-[#1F2128] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.2)]' : 
                  'bg-[#0F1115] border-slate-800'}
              `}>
                <span className="text-xl font-black text-white">{idx + 1}</span>
              </div>

              {/* Module Card Content */}
              <div 
                className={`
                    flex-1 glass p-6 rounded-[2rem] border transition-all
                    ${isUnlocked ? 'border-white/10' : 'border-white/5 bg-transparent'}
                `}
                onClick={() => {
                    if (isUnlocked) {
                        const firstLesson = module.lessons[0];
                        if (firstLesson) onSelectLesson(firstLesson);
                    }
                }}
              >
                <div className="flex justify-between items-start mb-4">
                    <div className="w-full">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">
                                {module.category}
                            </span>
                            {!isUnlocked && (
                                <span className="text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-lg">
                                    L{module.minLevel}+
                                </span>
                            )}
                        </div>
                        <h3 className="text-xl font-black text-white mb-2 leading-tight uppercase tracking-tight">
                            {module.title.includes(':') ? module.title.split(':')[1].trim() : module.title}
                        </h3>
                    </div>
                </div>

                <div className="relative h-24 w-full rounded-2xl overflow-hidden mb-4 border border-white/5">
                    <img src={module.imageUrl} className="w-full h-full object-cover" alt={module.title} />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                </div>

                <p className="text-xs text-slate-400 font-medium leading-relaxed mb-6 line-clamp-2">
                    {module.description}
                </p>

                <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-600 uppercase">Этапов</span>
                            <span className="text-xs font-black text-white">{module.lessons.length}</span>
                        </div>
                        <div className="w-[1px] h-4 bg-white/10"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-black text-slate-600 uppercase">Награда</span>
                            <span className="text-xs font-black text-[#D4AF37]">{totalXp} XP</span>
                        </div>
                    </div>
                    
                    {isCompleted ? (
                        <div className="flex items-center gap-1 text-[#00B050] font-black text-[10px] uppercase">
                            <span>✓</span> ПРОЙДЕНО
                        </div>
                    ) : isUnlocked ? (
                        <div className="text-white/60 font-black text-[10px] uppercase group-hover:text-white transition-colors">
                            ОТКРЫТЬ →
                        </div>
                    ) : (
                        <div className="text-slate-600 font-black text-[10px] uppercase">
                            ЗАКРЫТО 🔒
                        </div>
                    )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
