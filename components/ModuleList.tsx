
import React from 'react';
import { Module, UserProgress, Lesson } from '../types';

interface ModuleListProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, userProgress, onSelectLesson }) => {
  let nextLesson: Lesson | null = null;
  for (const mod of modules) {
    if (userProgress.level < mod.minLevel) continue;
    for (const less of mod.lessons) {
      if (!userProgress.completedLessonIds.includes(less.id)) {
        nextLesson = less;
        break;
      }
    }
    if (nextLesson) break;
  }

  return (
    <div className="p-5 pb-32 animate-fade-in">
      {/* HEADER SECTION */}
      <header className="flex justify-between items-end mb-8 pt-6 px-1">
        <div>
           <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.2em] mb-1">Академия</p>
           <h1 className="text-3xl font-extrabold text-[#1A1A1A] tracking-tight leading-none">Мой Путь</h1>
        </div>
        <div className="relative group cursor-pointer">
           <div className="w-12 h-12 rounded-full p-[2px] bg-gradient-to-tr from-[#D4AF37] to-transparent">
               <img 
                  src={userProgress.avatarUrl || `https://ui-avatars.com/api/?name=${userProgress.name}`} 
                  alt="Avatar" 
                  className="w-full h-full object-cover rounded-full border-2 border-white shadow-sm" 
               />
           </div>
           <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-[#1A1A1A] rounded-full border-2 border-white flex items-center justify-center text-[9px] text-white font-bold">
             {userProgress.level}
           </div>
        </div>
      </header>

      {/* HERO ACTION CARD - Premium Dark Theme */}
      <div className="relative rounded-[2rem] overflow-hidden shadow-xl mb-10 group transform transition-all duration-300 hover:scale-[1.01]">
         {/* Dynamic Dark Background */}
         <div className="absolute inset-0 bg-[#0F1115]">
             <div className="absolute top-0 right-0 w-64 h-64 bg-[#4B6BFB] rounded-full filter blur-[80px] opacity-20 translate-x-10 -translate-y-10"></div>
             <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#D4AF37] rounded-full filter blur-[60px] opacity-10 -translate-x-10 translate-y-10"></div>
         </div>

         <div className="relative z-10 p-7">
            <div className="flex items-center gap-3 mb-5">
                 <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center text-lg shadow-inner border border-white/5">🎯</div>
                 <div>
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block">Текущая цель</span>
                    <span className="text-xs font-bold text-white">Продолжить обучение</span>
                 </div>
            </div>
            
            <h2 className="text-2xl font-black text-white leading-tight mb-3 pr-4">
               {nextLesson ? nextLesson.title : 'Курс завершен'}
            </h2>
            <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed line-clamp-2">
               {nextLesson ? nextLesson.description : 'Вы прошли путь воина. Ожидайте новых миссий от командования.'}
            </p>
            
            {nextLesson && (
               <button 
                  onClick={() => onSelectLesson(nextLesson!)}
                  className="w-full bg-white text-[#0F1115] py-4 rounded-xl font-extrabold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors shadow-lg shadow-white/5"
               >
                  <span>Приступить</span>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
               </button>
            )}
         </div>
      </div>

      {/* MODULES LIST */}
      <div className="space-y-6">
        <h3 className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] ml-2 mb-2">Программа</h3>
        
        {modules.map((module, index) => {
          const isLocked = userProgress.level < module.minLevel;
          const completedCount = module.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
          const totalCount = module.lessons.length;
          const progressPercent = (completedCount / totalCount) * 100;
          const isCompleted = completedCount === totalCount;
          const delayClass = index === 0 ? '' : index === 1 ? 'delay-100' : 'delay-200';

          return (
            <div 
               key={module.id}
               className={`
                 relative p-6 rounded-[2rem] transition-all duration-300 border animate-fade-in ${delayClass}
                 ${isLocked 
                    ? 'bg-slate-100/50 border-transparent opacity-70 grayscale pointer-events-none' 
                    : 'glass border-white/40 shadow-soft hover:scale-[1.01] active:scale-[0.99] cursor-pointer'
                 }
               `}
            >
               {isLocked && (
                   <div className="absolute inset-0 z-20 flex items-center justify-center">
                       <div className="bg-slate-200/50 backdrop-blur-sm p-4 rounded-full shadow-inner">
                           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6 text-slate-500">
                             <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                           </svg>
                       </div>
                   </div>
               )}

               <div className="flex justify-between items-start mb-4">
                  <div className="flex gap-4 items-center">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm border border-white/50 ${
                          isCompleted ? 'bg-gradient-to-br from-green-50 to-green-100 text-[#00B050]' : 
                          isLocked ? 'bg-slate-200 text-slate-400' : 
                          'bg-gradient-to-br from-blue-50 to-blue-100 text-[#4B6BFB]'
                      }`}>
                          {['⚔️', '🛡️', '⚡', '🏛️'][index % 4]}
                      </div>
                      <div>
                          <h4 className={`text-lg font-black leading-tight ${isLocked ? 'text-slate-400' : 'text-[#1A1A1A]'}`}>{module.title}</h4>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                              {isLocked ? `Требуется ${module.minLevel} уровень` : `${completedCount}/${totalCount} выполнено`}
                          </span>
                      </div>
                  </div>
               </div>

               <p className="text-slate-500 text-xs font-medium leading-relaxed mb-6 pl-1 pr-4 line-clamp-2">{module.description}</p>
               
               {/* Progress Bar */}
               <div className="relative h-2 bg-slate-100 rounded-full overflow-hidden mb-6">
                    <div className="absolute top-0 left-0 h-full bg-[#4B6BFB] rounded-full transition-all duration-1000 ease-out" style={{ width: `${progressPercent}%` }}></div>
               </div>
               
               {/* Lesson Pills */}
               {!isLocked && (
                   <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1">
                       {module.lessons.map((lesson, idx) => {
                           const isLessonDone = userProgress.completedLessonIds.includes(lesson.id);
                           const isNext = !isLessonDone && !module.lessons.slice(0, idx).some(l => !userProgress.completedLessonIds.includes(l.id));

                           return (
                               <div key={idx} className={`
                                   flex-shrink-0 w-10 h-10 rounded-2xl flex items-center justify-center text-xs font-bold border transition-all duration-300
                                   ${isLessonDone 
                                       ? 'bg-[#4B6BFB] text-white border-[#4B6BFB] shadow-md shadow-[#4B6BFB]/20' 
                                       : isNext 
                                           ? 'bg-white text-[#4B6BFB] border-[#4B6BFB] animate-pulse ring-2 ring-[#4B6BFB]/20' 
                                           : 'bg-slate-50 text-slate-300 border-slate-100'
                                   }
                               `}>
                                   {idx + 1}
                               </div>
                           )
                       })}
                   </div>
               )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
