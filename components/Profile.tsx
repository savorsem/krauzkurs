
import React, { useState, useMemo } from 'react';
import { UserProgress, CalendarEvent, ThemeConfig, NotificationSettings } from '../types';
import { AnimatedCounter } from './AnimatedCounter';
import { telegram } from '../services/telegramService';
import { Notebook } from './Notebook';
import { Button } from './Button';

interface ProfileProps {
  userProgress: UserProgress;
  onLogout: () => void;
  allUsers: UserProgress[];
  onUpdateUser: (updatedUser: Partial<UserProgress>) => void;
  events: CalendarEvent[];
  onReferral: () => void;
  onShareStory: () => void;
  isSettingsOpen: boolean; 
  theme?: ThemeConfig;
}

type ProfileView = 'MAIN' | 'LEADERBOARD' | 'SETTINGS' | 'NOTEBOOK';

export const Profile: React.FC<ProfileProps> = ({ 
    userProgress, 
    onLogout, 
    onUpdateUser, 
    allUsers,
    onReferral,
    onShareStory,
    theme,
}) => {
  const [currentView, setCurrentView] = useState<ProfileView>('MAIN');
  const [editName, setEditName] = useState(userProgress.name);
  const [isSaving, setIsSaving] = useState(false);
  const [notifState, setNotifState] = useState<NotificationSettings>(userProgress.notifications);

  const accent = theme?.accentColor || '#D4AF37';
  const radius = theme?.borderRadius === 'SHARP' ? '0.5rem' : '2.5rem';

  // --- DERIVED DATA ---
  const sortedUsers = useMemo(() => [...allUsers].sort((a, b) => b.xp - a.xp), [allUsers]);
  const userRank = sortedUsers.findIndex(u => u.telegramUsername === userProgress.telegramUsername) + 1;

  // --- ACTIONS ---

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
        onUpdateUser({ 
            name: editName,
            notifications: notifState
        });
        setIsSaving(false);
        telegram.haptic('success');
        setCurrentView('MAIN');
    }, 800);
  };

  const handleShareProgress = () => {
      telegram.haptic('medium');
      telegram.shareProgress(userProgress.level, userProgress.xp);
      onShareStory(); 
  };

  const handleCopyReferral = () => {
      const refLink = `https://t.me/SalesProBot?start=ref_${userProgress.telegramUsername || 'user'}`;
      navigator.clipboard.writeText(refLink).then(() => {
          telegram.haptic('success');
          onReferral();
          alert('Ссылка скопирована! Отправь её будущему спартанцу.');
      }).catch(() => {
          alert(`Твоя реферальная ссылка: ${refLink}`);
      });
  };

  const toggleNotif = (key: keyof NotificationSettings) => {
      setNotifState(prev => ({ ...prev, [key]: !prev[key] }));
      telegram.haptic('selection');
  };

  // --- SUB-COMPONENTS ---

  const renderHeader = (title: string, backView: ProfileView = 'MAIN') => (
      <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => setCurrentView(backView)} 
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-95 transition-all"
          >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 text-white">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
          </button>
          <h2 className="text-2xl font-black uppercase text-white tracking-tight">{title}</h2>
      </div>
  );

  // 1. LEADERBOARD VIEW
  if (currentView === 'LEADERBOARD') {
      return (
        <div className="px-6 py-8 animate-fade-in pb-32 min-h-screen text-white bg-[#0F1115]">
          {renderHeader('Зал Славы')}
          
          <div className="bg-[#1F2128] rounded-[2rem] p-4 border border-white/5 mb-6">
              <div className="flex justify-between items-center text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">
                  <span>Твой ранг</span>
                  <span className="text-white text-lg">#{userRank}</span>
              </div>
          </div>

          <div className="space-y-3">
            {sortedUsers.map((u, i) => {
                const isMe = u.telegramUsername === userProgress.telegramUsername;
                const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i+1}`;
                
                return (
                    <div key={i} className={`
                        p-4 rounded-2xl flex items-center gap-4 border transition-all
                        ${isMe 
                            ? `border-[#D4AF37] bg-[#D4AF37]/10 shadow-[0_0_15px_rgba(212,175,55,0.1)]` 
                            : 'border-white/5 bg-white/5'
                        }
                    `}>
                        <div className="w-8 text-center font-black text-sm text-slate-400">{medal}</div>
                        <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full bg-slate-800 object-cover border border-white/10" />
                        <div className="flex-1 min-w-0">
                             <div className="font-bold truncate text-sm text-white">{u.name}</div>
                             <div className="text-[10px] text-slate-500 font-medium">Lvl {u.level} • {u.role === 'ADMIN' ? 'CMD' : 'Soldier'}</div>
                        </div>
                        <span className="font-black text-[#6C5DD3] whitespace-nowrap">{u.xp} XP</span>
                    </div>
                );
            })}
          </div>
        </div>
      );
  }

  // 2. NOTEBOOK VIEW
  if (currentView === 'NOTEBOOK') {
      return (
          <div className="px-6 py-8 animate-slide-in pb-32 min-h-screen bg-[#0F1115]">
              {renderHeader('Личный Дневник')}
              <Notebook onAction={() => telegram.haptic('success')} />
          </div>
      );
  }

  // 3. SETTINGS VIEW
  if (currentView === 'SETTINGS') {
      return (
        <div className="px-6 py-8 animate-fade-in pb-32 min-h-screen text-white bg-[#0F1115]">
            {renderHeader('Настройки')}
            
            <div className="space-y-6">
                <div className="space-y-2">
                        <label className="text-[10px] uppercase font-bold text-slate-500 pl-2">Позывной</label>
                        <input 
                            value={editName} 
                            onChange={e => setEditName(e.target.value)} 
                            className="w-full bg-[#1F2128] border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-[#6C5DD3] text-white transition-colors" 
                        />
                </div>
                
                <div className="bg-[#1F2128] rounded-[2rem] p-6 border border-white/5 space-y-6">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 border-b border-white/5 pb-2">Уведомления</p>
                    
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleNotif('pushEnabled')}>
                        <span className="text-sm font-bold text-white">Боевые задачи</span>
                        <div className={`w-12 h-7 rounded-full relative transition-colors ${notifState.pushEnabled ? 'bg-[#00B050]' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notifState.pushEnabled ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                    
                    <div className="flex items-center justify-between cursor-pointer" onClick={() => toggleNotif('deadlineReminders')}>
                        <span className="text-sm font-bold text-white">Дедлайны</span>
                        <div className={`w-12 h-7 rounded-full relative transition-colors ${notifState.deadlineReminders ? 'bg-[#00B050]' : 'bg-slate-700'}`}>
                            <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-transform ${notifState.deadlineReminders ? 'right-1' : 'left-1'}`}></div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 space-y-3">
                    <Button fullWidth onClick={handleSaveSettings} loading={isSaving} className="!rounded-2xl !py-4 shadow-lg shadow-[#6C5DD3]/20">
                        СОХРАНИТЬ
                    </Button>
                    
                    <button 
                        onClick={onLogout} 
                        className="w-full text-red-500 font-bold text-xs uppercase py-4 border border-red-500/20 rounded-2xl hover:bg-red-500/10 active:scale-95 transition-all"
                    >
                        ВЫЙТИ ИЗ СИСТЕМЫ
                    </button>
                </div>
            </div>
        </div>
      );
  }

  // 4. MAIN DASHBOARD VIEW
  return (
      <div className="min-h-screen text-white pb-40 bg-[#0F1115]">
          
          {/* Top Bar */}
          <div className="pt-6 px-6 flex justify-between items-center mb-6">
               <h1 className="text-xl font-black uppercase tracking-wider text-slate-300">Личное Дело</h1>
               <button 
                  onClick={() => setCurrentView('SETTINGS')}
                  className="w-10 h-10 rounded-xl bg-[#1F2128] border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-[#6C5DD3] transition-colors shadow-lg"
               >
                  ⚙️
               </button>
          </div>

          {/* Hero Card */}
          <div className="px-4 mb-8">
              <div 
                className="relative overflow-hidden bg-[#1F2128] border border-white/10 shadow-2xl group"
                style={{ borderRadius: radius }}
              >
                  {/* Dynamic Background */}
                  <div className="absolute inset-0 opacity-30 group-hover:opacity-40 transition-opacity duration-700" 
                       style={{ backgroundImage: `url(${userProgress.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(30px)' }}>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F2128]/90 to-[#1F2128]"></div>

                  <div className="relative z-10 p-8 flex flex-col items-center">
                      <div className="relative w-36 h-36 mb-6">
                          <div className="absolute inset-0 rounded-full blur-2xl opacity-20 animate-pulse-slow" style={{ backgroundColor: accent }}></div>
                          <div className="w-full h-full rounded-full p-1 border-2 border-dashed border-white/20 relative">
                              <img src={userProgress.avatarUrl || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full object-cover shadow-2xl" />
                          </div>
                          <div className="absolute -bottom-2 -right-2 bg-[#1F2128] rounded-xl p-1.5 border border-white/10 shadow-lg">
                              <div className="bg-gradient-to-br from-[#D4AF37] to-[#8B7326] text-black font-black text-xs px-3 py-1 rounded">
                                  LVL {userProgress.level}
                              </div>
                          </div>
                      </div>

                      <h2 className="text-4xl font-black tracking-tighter text-white mb-2 drop-shadow-md">{userProgress.name}</h2>
                      <p className="text-[#6C5DD3] text-xs font-bold uppercase tracking-[0.2em] mb-8 bg-[#6C5DD3]/10 px-4 py-1.5 rounded-lg border border-[#6C5DD3]/20">
                         {userProgress.role === 'ADMIN' ? 'Commander' : userProgress.role === 'CURATOR' ? 'Officer' : 'Spartan Unit'}
                      </p>

                      {/* Improved Stats Layout */}
                      <div className="grid grid-cols-2 gap-4 w-full">
                          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                              <div className="text-3xl font-black text-white mb-1"><AnimatedCounter value={userProgress.xp} /></div>
                              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Total XP</div>
                          </div>
                          
                          <div className="bg-white/5 p-5 rounded-2xl border border-white/5 flex flex-col items-center justify-center hover:bg-white/10 transition-colors">
                              <div className="text-3xl font-black text-[#00B050] mb-1"><AnimatedCounter value={userProgress.completedLessonIds.length} /></div>
                              <div className="text-[9px] text-slate-500 font-black uppercase tracking-widest">Missions</div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>

          {/* Action Grid */}
          <div className="px-6 grid grid-cols-2 gap-4 mb-8">
              <button 
                onClick={() => setCurrentView('NOTEBOOK')}
                className="bg-[#1F2128] border border-white/10 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 hover:border-white/20 active:scale-95 transition-all shadow-lg group relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl group-hover:scale-110 transition-transform">📓</div>
                  <span className="text-3xl relative z-10">📓</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 relative z-10">Дневник</span>
              </button>

              <button 
                onClick={() => setCurrentView('LEADERBOARD')}
                className="bg-[#1F2128] border border-white/10 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 hover:border-[#D4AF37]/50 active:scale-95 transition-all shadow-lg group relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl group-hover:scale-110 transition-transform">🏆</div>
                  <span className="text-3xl relative z-10">🏆</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 relative z-10">Рейтинг #{userRank}</span>
              </button>

              <button 
                onClick={handleCopyReferral}
                className="bg-gradient-to-br from-[#2B4E99]/20 to-[#1F2128] border border-blue-500/20 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-lg group relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl group-hover:scale-110 transition-transform text-blue-500">🤝</div>
                  <span className="text-3xl relative z-10">🤝</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-200 relative z-10">Вербовка</span>
              </button>

              <button 
                onClick={handleShareProgress}
                className="bg-gradient-to-br from-[#6C5DD3] to-[#4A3D8D] border border-white/10 p-5 rounded-[1.5rem] flex flex-col items-center justify-center gap-3 active:scale-95 transition-all shadow-lg shadow-[#6C5DD3]/20 group relative overflow-hidden"
              >
                  <div className="absolute top-0 right-0 p-3 opacity-10 text-5xl group-hover:scale-110 transition-transform text-white">🚀</div>
                  <span className="text-3xl relative z-10 text-white">🚀</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-white relative z-10">Share</span>
              </button>
          </div>

          {/* Activity Summary / Habits Progress */}
           <div className="px-6 space-y-4">
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-2 ml-2">Дисциплина</h3>
              
              <div className="bg-[#1F2128] rounded-[2rem] border border-white/5 p-6 relative overflow-hidden">
                   <div className="flex items-center justify-between mb-3 relative z-10">
                      <span className="text-sm font-bold text-slate-300">Привычки (Streak)</span>
                      <span className="text-white font-black text-xl">{userProgress.stats.notebookEntries.habits} дн.</span>
                  </div>
                  <div className="w-full h-2 bg-black/40 rounded-full overflow-hidden relative z-10">
                      <div className="h-full bg-[#D4AF37] shadow-[0_0_10px_#D4AF37]" style={{ width: `${Math.min(userProgress.stats.notebookEntries.habits * 5, 100)}%` }}></div>
                  </div>
                  
                  {/* Background Decoration */}
                  <div className="absolute -bottom-4 -right-4 text-8xl opacity-5">🔥</div>
              </div>
          </div>
      </div>
  );
};
