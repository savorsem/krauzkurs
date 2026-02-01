
import React, { useState, useMemo } from 'react';
import { Module, UserProgress, Lesson, ModuleCategory } from '../types';

interface ModuleListProps {
  modules: Module[];
  userProgress: UserProgress;
  onSelectLesson: (lesson: Lesson) => void;
  onProfileClick: () => void;
}

export const ModuleList: React.FC<ModuleListProps> = ({ modules, userProgress, onSelectLesson, onProfileClick }) => {
  const [activeCategory, setActiveCategory] = useState<ModuleCategory | 'ALL'>('ALL');

  const totalLessons = modules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedGlobal = userProgress.completedLessonIds.length;
  const subjectsCount = modules.length;

  const categories: { id: ModuleCategory | 'ALL'; label: string; icon: string }[] = [
    { id: 'ALL', label: 'Все', icon: '📚' },
    { id: 'SALES', label: 'Продажи', icon: '💰' },
    { id: 'PSYCHOLOGY', label: 'Психология', icon: '🧠' },
    { id: 'TACTICS', label: 'Тактика', icon: '⚔️' },
    { id: 'GENERAL', label: 'Основы', icon: '🏛️' },
  ];

  // Avatars for the "squad" feel
  const avatars = [
    "https://ui-avatars.com/api/?name=Alex&background=random&color=fff",
    "https://ui-avatars.com/api/?name=Max&background=random&color=fff",
    "https://ui-avatars.com/api/?name=Kate&background=random&color=fff"
  ];

  const filteredModules = useMemo(() => {
      if (activeCategory === 'ALL') return modules;
      return modules.filter(m => m.category === activeCategory);
  }, [modules, activeCategory]);

  return (
    <div className="min-h-screen bg-[#FFAB7B] relative overflow-hidden animate-fade-in">
      {/* Background Decorative Path */}
      <svg className="absolute top-0 left-0 w-full h-[500px] opacity-20 pointer-events-none z-0" viewBox="0 0 375 500" fill="none">
        <path d="M-10 100 C 50 100, 100 50, 150 150 S 250 250, 400 200" stroke="white" strokeWidth="2" strokeDasharray="6 6" className="dashed-path" />
        <path d="M-10 200 C 80 250, 150 100, 300 300" stroke="white" strokeWidth="2" strokeDasharray="6 6" className="dashed-path" style={{animationDuration: '25s'}} />
        <circle cx="280" cy="120" r="10" fill="white" fillOpacity="0.4" className="animate-pulse" />
        <circle cx="50" cy="250" r="6" fill="white" fillOpacity="0.4" className="animate-pulse delay-300" />
      </svg>

      {/* HEADER SECTION (Orange Part) */}
      <div className="relative z-10 px-6 pt-12 pb-8">
        {/* Top Nav */}
        <div className="flex justify-between items-center mb-8">
          <div className="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full flex items-center gap-2 border border-white/20">
             <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
             <span className="text-[10px] font-bold text-white uppercase tracking-wider">Online</span>
          </div>
          
          {/* Avatar / Profile Clickable */}
          <button 
            onClick={onProfileClick}
            className="flex items-center gap-2 bg-white/20 backdrop-blur-sm pl-1 pr-3 py-1 rounded-full hover:bg-white/30 transition-all active:scale-95 cursor-pointer border border-white/20"
          >
             <img src={userProgress.avatarUrl || `https://ui-avatars.com/api/?name=${userProgress.name}`} className="w-8 h-8 rounded-full border border-white object-cover" />
             <div className="flex flex-col items-start">
                <span className="text-[9px] text-white/80 font-medium leading-none">Уровень</span>
                <span className="text-xs font-bold text-white leading-none">{userProgress.level}</span>
             </div>
          </button>
        </div>

        {/* Hero Title & Illustration */}
        <div className="flex justify-between items-start mb-8">
            <div className="w-[60%]">
                <h1 className="text-4xl font-black text-[#1F2128] leading-tight mb-6 animate-slide-in">
                    Курс <br/> Подготовки
                </h1>
                
                {/* Stats Pills */}
                <div className="flex gap-3 animate-slide-in delay-100">
                    <div className="bg-[#1F2128] px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/10 transition-transform hover:scale-105">
                        <span className="text-white text-lg">📓</span>
                        <div className="flex flex-col">
                            <span className="text-white font-bold text-sm leading-none">{subjectsCount}</span>
                            <span className="text-white/50 text-[9px] font-bold uppercase">Модулей</span>
                        </div>
                    </div>
                    <div className="bg-[#FFFFFF] px-4 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-black/5 transition-transform hover:scale-105">
                        <span className="text-[#FFAB7B] text-lg">🔥</span>
                        <div className="flex flex-col">
                            <span className="text-[#1F2128] font-bold text-sm leading-none">{completedGlobal}/{totalLessons}</span>
                            <span className="text-slate-400 text-[9px] font-bold uppercase">Уроков</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3D Cap Illustration (CSS Art) */}
            <div className="w-[35%] relative h-32 animate-scale-in delay-200 pointer-events-none">
                <div className="absolute top-0 right-0 transform translate-x-2">
                    <div className="text-[80px] drop-shadow-2xl filter brightness-110 transform -rotate-12">🎓</div>
                    <div className="absolute -bottom-2 -right-4 text-2xl animate-bounce">✨</div>
                </div>
            </div>
        </div>
      </div>

      {/* CONTENT BODY (White Part) */}
      <div className="bg-[#F9FAFB] min-h-screen rounded-t-[3rem] relative z-20 px-6 pt-8 pb-32 shadow-[0_-20px_40px_rgba(0,0,0,0.1)]">
        
        {/* Categories Scroller */}
        <div className="flex gap-3 overflow-x-auto no-scrollbar mb-8 -mx-6 px-6 pb-2">
            {categories.map((cat, idx) => (
                <button 
                    key={cat.id} 
                    onClick={() => setActiveCategory(cat.id)}
                    className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold transition-all whitespace-nowrap shadow-sm active:scale-95
                    ${activeCategory === cat.id 
                        ? 'bg-[#1F2128] text-white shadow-lg ring-2 ring-[#1F2128]/20' 
                        : 'bg-white text-slate-400 border border-slate-50 hover:bg-slate-50'
                    }`}
                >
                    <span>{cat.icon}</span>
                    <span>{cat.label}</span>
                </button>
            ))}
        </div>

        {/* Modules Grid */}
        <div className="space-y-6">
            {filteredModules.length === 0 && (
                <div className="text-center py-10 text-slate-400">
                    <p className="text-4xl mb-2">🕵️‍♂️</p>
                    <p className="font-bold text-sm">Модули не найдены</p>
                </div>
            )}

            {filteredModules.map((module, index) => {
                const isLocked = userProgress.level < module.minLevel;
                const completedCount = module.lessons.filter(l => userProgress.completedLessonIds.includes(l.id)).length;
                const totalCount = module.lessons.length;
                const isCompleted = completedCount === totalCount && totalCount > 0;
                const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
                
                const isDarkCard = index % 2 === 0;
                
                return (
                    <div 
                        key={module.id}
                        className={`
                            relative p-8 rounded-[2.5rem] transition-all duration-500 group
                            ${isDarkCard 
                                ? 'bg-[#1F2128] text-white shadow-xl shadow-black/20' 
                                : 'bg-[#B2AFFE] text-[#1F2128] shadow-xl shadow-[#B2AFFE]/30'
                            }
                            ${isLocked 
                                ? 'cursor-not-allowed opacity-90' 
                                : 'cursor-pointer hover:scale-[1.02] hover:shadow-2xl active:scale-[0.98]'
                            }
                        `}
                        style={{ animationDelay: `${index * 0.1}s` }}
                        onClick={() => {
                            if (!isLocked) {
                                const nextLesson = module.lessons.find(l => !userProgress.completedLessonIds.includes(l.id)) || module.lessons[0];
                                if(nextLesson) onSelectLesson(nextLesson);
                            }
                        }}
                    >
                         {/* Locked Overlay */}
                         {isLocked && (
                             <div className="absolute inset-0 bg-[#0F1115]/60 z-20 flex items-center justify-center rounded-[2.5rem] backdrop-blur-[2px]">
                                <div className="bg-[#1F2128]/90 p-4 rounded-full border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-3 px-6 transform transition-transform group-hover:scale-110">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-slate-400">
                                        <path fillRule="evenodd" d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z" clipRule="evenodd" />
                                    </svg>
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Locked</span>
                                        <span className="text-white font-bold text-xs">Level {module.minLevel} Req.</span>
                                    </div>
                                </div>
                             </div>
                         )}

                         {/* Progress Bar Top */}
                         {!isLocked && (
                            <div className="absolute top-0 left-0 w-full h-1.5 bg-black/10 rounded-t-[2.5rem] overflow-hidden z-10">
                                <div 
                                    className={`h-full transition-all duration-1000 ${isDarkCard ? 'bg-[#FFAB7B]' : 'bg-white'}`} 
                                    style={{ width: `${progressPercent}%` }}
                                ></div>
                            </div>
                         )}

                        {/* Card Header */}
                        <div className="flex justify-between items-start mb-12 relative z-10">
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl border backdrop-blur-md shadow-inner transition-transform duration-500 group-hover:rotate-12 ${isDarkCard ? 'bg-white/10 border-white/10' : 'bg-white/30 border-white/20'}`}>
                                {module.category === 'SALES' ? '💰' : module.category === 'PSYCHOLOGY' ? '🧠' : module.category === 'TACTICS' ? '⚔️' : '🎓'}
                            </div>
                            
                            <div className="relative w-12 h-12">
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center border transition-all shadow-lg ${
                                    isLocked
                                      ? 'bg-slate-800 text-slate-600 border-slate-700'
                                      : isCompleted
                                        ? 'bg-[#00B050] text-white border-[#00B050]'
                                        : isDarkCard 
                                            ? 'bg-[#FFAB7B] text-[#1F2128] border-[#FFAB7B] group-hover:bg-white' 
                                            : 'bg-white text-[#1F2128] border-white group-hover:bg-[#1F2128] group-hover:text-white'
                                }`}>
                                   {isLocked ? (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                                       </svg>
                                   ) : isCompleted ? (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                       </svg>
                                   ) : (
                                       <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-5 h-5 ml-0.5 transform group-hover:translate-x-0.5 transition-transform">
                                         <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
                                       </svg>
                                   )}
                                </div>
                            </div>
                        </div>

                        {/* Card Content */}
                        <div className={`relative z-10 transition-opacity duration-300 ${isLocked ? 'opacity-30 blur-[1px]' : ''}`}>
                            <div className="flex justify-between items-center mb-2">
                                <p className={`text-[10px] font-bold uppercase tracking-widest ${isDarkCard ? 'text-white/50' : 'text-[#1F2128]/60'}`}>
                                    {isLocked ? `Доступ закрыт` : `${completedCount} из ${totalCount} завершено`}
                                </p>
                            </div>
                            
                            <h3 className="text-2xl font-black leading-tight mb-6 max-w-[90%]">
                                {module.title}
                            </h3>

                            <div className="flex items-center gap-3">
                                {/* Avatars Stack */}
                                <div className="flex -space-x-3">
                                    {avatars.map((av, i) => (
                                        <div key={i} className={`w-8 h-8 rounded-full border-2 overflow-hidden ${isDarkCard ? 'border-[#1F2128]' : 'border-[#B2AFFE]'}`}>
                                            <img src={av} alt="" className="w-full h-full object-cover grayscale opacity-80" />
                                        </div>
                                    ))}
                                </div>
                                <span className={`text-[10px] font-bold ${isDarkCard ? 'text-white/40' : 'text-[#1F2128]/40'}`}>+20 бойцов</span>
                                
                                {/* Badge */}
                                <div className={`ml-auto px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                    isDarkCard ? 'bg-white/10 text-white' : 'bg-white/30 text-[#1F2128]'
                                }`}>
                                    {module.lessons.length * 100} XP
                                </div>
                            </div>
                        </div>

                        {/* Background Decor */}
                        {!isLocked && (
                            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transition-transform duration-700 group-hover:scale-150 group-hover:-rotate-12 origin-bottom-right">
                                <svg width="180" height="180" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M50 0C22.3858 0 0 22.3858 0 50C0 77.6142 22.3858 100 50 100" stroke="currentColor" strokeWidth="20" strokeDasharray="10 10"/>
                                </svg>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
      </div>
    </div>
  );
};
