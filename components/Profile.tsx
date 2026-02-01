
import React, { useState } from 'react';
import { UserProgress, NotificationSettings, Achievement, CalendarEvent } from '../types';
import { CalendarView } from './CalendarView';

interface ProfileProps {
  userProgress: UserProgress;
  onLogout: () => void;
  allUsers: UserProgress[];
  onUpdateUser: (updatedUser: Partial<UserProgress>) => void;
  events: CalendarEvent[];
}

export const Profile: React.FC<ProfileProps> = ({ userProgress, onLogout, allUsers, onUpdateUser, events }) => {
  const [activeTab, setActiveTab] = useState<'STATS' | 'ACHIEVEMENTS' | 'CALENDAR' | 'SETTINGS'>('STATS');

  const updateNotifications = (key: keyof NotificationSettings, val: boolean) => {
    onUpdateUser({ notifications: { ...userProgress.notifications, [key]: val } });
  };

  const achievements: Achievement[] = [
    { id: 'first-step', title: 'Первый шаг', description: 'Завершить 1 урок', icon: '👣', isUnlocked: userProgress.completedLessonIds.length >= 1 },
    { id: 'spartan', title: 'Спартанец', description: 'Пройти 5 уроков', icon: '🛡️', isUnlocked: userProgress.completedLessonIds.length >= 5 },
    { id: 'sales-champion', title: 'Чемпион', description: '1000 XP', icon: '🏆', isUnlocked: userProgress.xp >= 1000 }
  ];

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-32">
      {/* HEADER AVATAR AREA */}
      <div className="relative pt-12 pb-8 px-6 flex flex-col items-center">
         <div className="w-32 h-32 rounded-full p-1 bg-white shadow-soft mb-4 relative">
             <img src={userProgress.avatarUrl || `https://ui-avatars.com/api/?name=${userProgress.name}`} className="w-full h-full object-cover rounded-full" />
             <div className="absolute bottom-1 right-1 w-8 h-8 bg-[#1A1A1A] rounded-full border-2 border-white flex items-center justify-center text-white text-xs shadow-md">
                 {userProgress.level}
             </div>
         </div>
         <h1 className="text-2xl font-black text-[#1A1A1A]">{userProgress.name}</h1>
         <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Spartan Recruit</p>
      </div>

      {/* TABS - Floating Pills */}
      <div className="flex justify-center gap-2 mb-8 px-4 overflow-x-auto no-scrollbar">
          {[
              { id: 'STATS', label: 'Обзор' }, 
              { id: 'ACHIEVEMENTS', label: 'Награды' },
              { id: 'CALENDAR', label: 'План' },
              { id: 'SETTINGS', label: 'Настройки' }
          ].map(t => (
              <button 
                key={t.id} 
                onClick={() => setActiveTab(t.id as any)}
                className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wide transition-all ${
                    activeTab === t.id ? 'bg-[#1A1A1A] text-white shadow-lg shadow-black/10' : 'bg-white text-slate-400 hover:text-[#1A1A1A]'
                }`}
              >
                  {t.label}
              </button>
          ))}
      </div>

      {/* CONTENT */}
      <div className="px-6 animate-fade-in">
         {activeTab === 'STATS' && (
             <div className="space-y-4">
                 {/* Dark "Resolution Team" Style Card */}
                 <div className="card-dark p-8 relative overflow-hidden">
                     <div className="relative z-10">
                         <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest mb-2">Общий прогресс</p>
                         <h2 className="text-4xl font-black text-white mb-6">{userProgress.xp} <span className="text-lg font-normal text-white/50">XP</span></h2>
                         
                         {/* Timeline / Calendar Row Look */}
                         <div className="flex justify-between items-end">
                             <div className="flex -space-x-3">
                                 {[1,2,3].map(i => <div key={i} className="w-8 h-8 rounded-full bg-white/20 border border-white/10 backdrop-blur-sm"></div>)}
                             </div>
                             <div className="w-12 h-12 rounded-full bg-[#FFB08E] flex items-center justify-center text-[#1A1A1A]">
                                 <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" /></svg>
                             </div>
                         </div>
                     </div>
                     {/* Decorative circles */}
                     <div className="absolute -right-6 -top-6 w-32 h-32 rounded-full border-[16px] border-white/5 opacity-50"></div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                     <div className="bg-white p-6 rounded-[2rem] shadow-soft">
                         <span className="text-2xl mb-2 block">📚</span>
                         <h4 className="font-bold text-[#1A1A1A]">Уроков</h4>
                         <p className="text-slate-400 text-xs font-bold">{userProgress.completedLessonIds.length} завершено</p>
                     </div>
                     <div className="bg-white p-6 rounded-[2rem] shadow-soft">
                         <span className="text-2xl mb-2 block">🔥</span>
                         <h4 className="font-bold text-[#1A1A1A]">Ранг</h4>
                         <p className="text-slate-400 text-xs font-bold">Топ 10%</p>
                     </div>
                 </div>
             </div>
         )}

         {activeTab === 'ACHIEVEMENTS' && (
             <div className="space-y-4">
                 {achievements.map(ach => (
                     <div key={ach.id} className={`p-5 rounded-[2rem] flex items-center gap-4 ${ach.isUnlocked ? 'bg-white shadow-soft' : 'bg-slate-100 opacity-60'}`}>
                         <div className="w-12 h-12 rounded-2xl bg-[#F2F4F6] flex items-center justify-center text-2xl">{ach.icon}</div>
                         <div>
                             <h4 className="font-bold text-[#1A1A1A]">{ach.title}</h4>
                             <p className="text-xs text-slate-500">{ach.description}</p>
                         </div>
                     </div>
                 ))}
             </div>
         )}

         {activeTab === 'CALENDAR' && (
             <div className="bg-white p-2 rounded-[2.5rem] shadow-soft">
                <CalendarView externalEvents={events} isDark={false} />
             </div>
         )}

         {activeTab === 'SETTINGS' && (
             <div className="bg-white p-6 rounded-[2.5rem] shadow-soft space-y-6">
                 <h3 className="font-bold text-[#1A1A1A]">Уведомления</h3>
                 {['pushEnabled', 'telegramSync', 'deadlineReminders'].map(key => (
                     <div key={key} className="flex justify-between items-center">
                         <span className="text-sm font-medium text-slate-600 capitalize">{key}</span>
                         <label className="relative inline-flex items-center cursor-pointer">
                             <input type="checkbox" className="sr-only peer" checked={(userProgress.notifications as any)[key]} onChange={e => updateNotifications(key as any, e.target.checked)} />
                             <div className="w-11 h-6 bg-slate-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1A1A1A]"></div>
                         </label>
                     </div>
                 ))}
                 <button onClick={onLogout} className="w-full py-4 text-red-500 font-bold text-sm bg-red-50 rounded-2xl mt-4">Выйти из аккаунта</button>
             </div>
         )}
      </div>
    </div>
  );
};
