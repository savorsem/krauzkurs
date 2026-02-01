
import React, { useState, useEffect, useRef } from 'react';
import { UserProgress, CalendarEvent, UserRole } from '../types';
import { CalendarView } from './CalendarView';

interface ProfileProps {
  userProgress: UserProgress;
  onLogout: () => void;
  allUsers: UserProgress[];
  onUpdateUser: (updatedUser: Partial<UserProgress>) => void;
  events: CalendarEvent[];
}

type ProfileTab = 'STATS' | 'CALENDAR' | 'RATING' | 'SETTINGS';

export const Profile: React.FC<ProfileProps> = ({ userProgress, onLogout, allUsers, onUpdateUser, events }) => {
  const [activeTab, setActiveTab] = useState<ProfileTab>('STATS');
  
  // Parallax Effect State
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const avatarRef = useRef<HTMLDivElement>(null);

  // Settings State
  const [editName, setEditName] = useState(userProgress.name);
  const [editTelegram, setEditTelegram] = useState(userProgress.telegramUsername || '');
  const [editNotifications, setEditNotifications] = useState(userProgress.notifications);
  const [isSaving, setIsSaving] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!avatarRef.current) return;
    const rect = avatarRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation (max 15 degrees)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;

    setTilt({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => setTilt({ x: 0, y: 0 });

  const handleSaveSettings = () => {
    setIsSaving(true);
    // Simulate network delay
    setTimeout(() => {
        onUpdateUser({
            name: editName,
            telegramUsername: editTelegram,
            notifications: editNotifications
        });
        setIsSaving(false);
    }, 800);
  };

  const toggleNotification = (key: keyof typeof editNotifications) => {
    setEditNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- SUB-COMPONENTS ---

  const renderStats = () => (
      <div className="space-y-6">
          {/* Main Stats Grid */}
          <div className="grid grid-cols-2 gap-4 animate-slide-up fill-mode-both">
              <div className="bg-white p-5 rounded-[2rem] shadow-sm border border-slate-100 flex flex-col justify-between h-32">
                  <div className="w-8 h-8 bg-[#FFAB7B]/20 text-[#FFAB7B] rounded-full flex items-center justify-center text-lg">⚡</div>
                  <div>
                      <h3 className="text-3xl font-black text-[#1F2128]">{userProgress.xp}</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total XP</p>
                  </div>
              </div>
              <div className="bg-[#1F2128] p-5 rounded-[2rem] shadow-lg shadow-black/20 flex flex-col justify-between h-32 text-white">
                  <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center text-lg">🛡️</div>
                  <div>
                      <h3 className="text-3xl font-black">{userProgress.level}</h3>
                      <p className="text-[10px] font-bold text-white/50 uppercase tracking-widest">Rank Level</p>
                  </div>
              </div>
          </div>

          {/* Activity Graph Card */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 relative overflow-hidden animate-slide-up delay-100 fill-mode-both">
             <div className="flex justify-between items-center mb-6">
                 <h3 className="font-black text-[#1F2128]">Активность</h3>
                 <span className="text-[10px] bg-green-100 text-green-600 px-2 py-1 rounded-lg font-bold uppercase">+12% week</span>
             </div>
             
             {/* CSS Chart */}
             <div className="flex items-end h-32 gap-3">
                 {[40, 65, 30, 80, 50, 90, 60].map((h, i) => (
                     <div key={i} className="flex-1 flex flex-col items-center gap-2 group cursor-pointer">
                         <div className="w-full bg-[#F2F4F6] rounded-t-xl relative h-full overflow-hidden">
                             <div 
                                className="absolute bottom-0 w-full bg-[#1F2128] rounded-t-xl transition-all duration-1000 group-hover:bg-[#FFAB7B]" 
                                style={{ height: `${h}%` }}
                             ></div>
                         </div>
                         <span className="text-[9px] font-bold text-slate-300 uppercase">{['Пн','Вт','Ср','Чт','Пт','Сб','Вс'][i]}</span>
                     </div>
                 ))}
             </div>
          </div>

          {/* Achievement Badges */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 animate-slide-up delay-200 fill-mode-both">
              <h3 className="font-black text-[#1F2128] mb-4">Награды</h3>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
                  {[
                      { icon: '🎓', bg: 'bg-blue-100', color: 'text-blue-600', label: 'Кадет' },
                      { icon: '🔥', bg: 'bg-orange-100', color: 'text-orange-600', label: 'Огонь' },
                      { icon: '💰', bg: 'bg-green-100', color: 'text-green-600', label: 'Сделка' },
                      { icon: '🤖', bg: 'bg-purple-100', color: 'text-purple-600', label: 'AI' }
                  ].map((b, i) => (
                      <div key={i} className="min-w-[80px] h-[100px] bg-slate-50 rounded-2xl flex flex-col items-center justify-center gap-2 border border-slate-100">
                          <div className={`w-10 h-10 rounded-full ${b.bg} ${b.color} flex items-center justify-center text-xl`}>{b.icon}</div>
                          <span className="text-[10px] font-bold text-slate-500">{b.label}</span>
                      </div>
                  ))}
              </div>
          </div>
      </div>
  );

  const renderLeaderboard = () => {
      // Merge current user with allUsers if not present, and add some mocks
      const mockUsers: UserProgress[] = [
          { name: 'Leonidas', xp: 5000, level: 10, role: 'ADMIN', isAuthenticated: true, completedLessonIds: [], submittedHomeworks: [], chatHistory: [], notifications: {} } as UserProgress,
          { name: 'Artemis', xp: 4200, level: 8, role: 'STUDENT', isAuthenticated: true, completedLessonIds: [], submittedHomeworks: [], chatHistory: [], notifications: {} } as UserProgress,
      ];
      
      const combinedUsers = [...mockUsers, ...allUsers];
      // Ensure current user is in the list
      if (!combinedUsers.find(u => u.name === userProgress.name)) {
          combinedUsers.push(userProgress);
      }
      
      const sortedUsers = combinedUsers.sort((a, b) => b.xp - a.xp);

      return (
          <div className="space-y-4">
              <div className="bg-[#1F2128] text-white p-6 rounded-[2rem] mb-6 relative overflow-hidden animate-slide-up fill-mode-both">
                  <div className="absolute top-0 right-0 text-[100px] opacity-10 rotate-12 -translate-y-4">🏆</div>
                  <h3 className="text-2xl font-black mb-1">Топ Бойцов</h3>
                  <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-6">Рейтинг отряда</p>
                  
                  <div className="flex items-end justify-center gap-4 mb-4">
                      {/* 2nd Place */}
                      <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-2 border-[#C0C0C0] p-0.5 mb-2 relative">
                              <img src={`https://ui-avatars.com/api/?name=${sortedUsers[1]?.name || 'Bot'}`} className="w-full h-full rounded-full object-cover grayscale" />
                              <div className="absolute -bottom-2 bg-[#C0C0C0] text-[#1F2128] text-[9px] font-black px-1.5 rounded-full">2</div>
                          </div>
                          <span className="text-[10px] font-bold">{sortedUsers[1]?.name || 'Empty'}</span>
                          <span className="text-[9px] text-white/50">{sortedUsers[1]?.xp || 0} XP</span>
                      </div>
                      
                      {/* 1st Place */}
                      <div className="flex flex-col items-center -translate-y-4">
                          <div className="w-16 h-16 rounded-full border-4 border-[#FFD700] p-0.5 mb-2 relative shadow-[0_0_20px_rgba(255,215,0,0.3)]">
                              <img src={`https://ui-avatars.com/api/?name=${sortedUsers[0]?.name || 'Bot'}`} className="w-full h-full rounded-full object-cover" />
                              <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-[#FFD700] text-[#1F2128] text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg">1</div>
                              <div className="absolute -top-4 text-2xl animate-bounce">👑</div>
                          </div>
                          <span className="text-xs font-bold text-[#FFD700]">{sortedUsers[0]?.name || 'Empty'}</span>
                          <span className="text-[9px] text-white/50">{sortedUsers[0]?.xp || 0} XP</span>
                      </div>

                      {/* 3rd Place */}
                      <div className="flex flex-col items-center">
                          <div className="w-12 h-12 rounded-full border-2 border-[#CD7F32] p-0.5 mb-2 relative">
                              <img src={`https://ui-avatars.com/api/?name=${sortedUsers[2]?.name || 'Bot'}`} className="w-full h-full rounded-full object-cover grayscale" />
                              <div className="absolute -bottom-2 bg-[#CD7F32] text-[#1F2128] text-[9px] font-black px-1.5 rounded-full">3</div>
                          </div>
                          <span className="text-[10px] font-bold">{sortedUsers[2]?.name || 'Empty'}</span>
                          <span className="text-[9px] text-white/50">{sortedUsers[2]?.xp || 0} XP</span>
                      </div>
                  </div>
              </div>

              <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden animate-slide-up delay-100 fill-mode-both">
                  {sortedUsers.slice(3).map((u, i) => (
                      <div key={i} className={`p-4 flex items-center justify-between border-b border-slate-50 last:border-0 ${u.name === userProgress.name ? 'bg-orange-50' : ''}`}>
                          <div className="flex items-center gap-4">
                              <span className="text-slate-300 font-black text-sm w-4">{i + 4}</span>
                              <div className="w-10 h-10 rounded-full bg-slate-100 overflow-hidden">
                                  <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-full h-full object-cover" />
                              </div>
                              <div>
                                  <p className="font-bold text-[#1F2128] text-sm">{u.name} {u.name === userProgress.name && '(Вы)'}</p>
                                  <p className="text-[10px] text-slate-400 font-bold uppercase">Lvl {u.level}</p>
                              </div>
                          </div>
                          <div className="text-right">
                              <span className="font-black text-[#1F2128] text-sm">{u.xp}</span>
                              <span className="text-[9px] text-slate-400 block">XP</span>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  const renderSettings = () => (
      <div className="space-y-6">
          {/* Personal Info */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 animate-slide-up fill-mode-both">
              <h3 className="font-black text-[#1F2128] mb-6 text-lg">Личное дело</h3>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-2 mb-1 block">Позывной (Имя)</label>
                      <input 
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="w-full bg-[#F9FAFB] p-4 rounded-2xl font-bold text-[#1F2128] outline-none border border-transparent focus:border-[#FFAB7B] transition-all"
                      />
                  </div>
                  <div>
                      <label className="text-[10px] font-black uppercase text-slate-400 pl-2 mb-1 block">Связь (Telegram)</label>
                      <input 
                          value={editTelegram}
                          onChange={(e) => setEditTelegram(e.target.value)}
                          placeholder="@username"
                          className="w-full bg-[#F9FAFB] p-4 rounded-2xl font-bold text-[#1F2128] outline-none border border-transparent focus:border-[#FFAB7B] transition-all"
                      />
                  </div>
              </div>
          </div>

          {/* Notifications */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 animate-slide-up delay-100 fill-mode-both">
              <h3 className="font-black text-[#1F2128] mb-6 text-lg">Уведомления</h3>
              
              <div className="space-y-4">
                  {[
                      { key: 'pushEnabled', label: 'Push-уведомления' },
                      { key: 'telegramSync', label: 'Синхронизация Telegram' },
                      { key: 'deadlineReminders', label: 'Напоминания о дедлайнах' },
                      { key: 'chatNotifications', label: 'Сообщения штаба' },
                  ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-2">
                          <span className="font-bold text-sm text-[#1F2128]">{item.label}</span>
                          <button 
                            onClick={() => toggleNotification(item.key as keyof typeof editNotifications)}
                            className={`w-12 h-7 rounded-full p-1 transition-colors duration-300 ${
                                editNotifications[item.key as keyof typeof editNotifications] 
                                ? 'bg-[#1F2128]' 
                                : 'bg-slate-200'
                            }`}
                          >
                              <div className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-300 ${
                                  editNotifications[item.key as keyof typeof editNotifications] 
                                  ? 'translate-x-5' 
                                  : 'translate-x-0'
                              }`} />
                          </button>
                      </div>
                  ))}
              </div>
          </div>

          {/* Customization */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-100 animate-slide-up delay-200 fill-mode-both">
              <h3 className="font-black text-[#1F2128] mb-6 text-lg">Кастомизация</h3>
              <p className="text-xs text-slate-500 mb-4">Смена брони доступна с 5 уровня.</p>
              
              <div className="grid grid-cols-2 gap-3 opacity-50 pointer-events-none">
                   <div className="aspect-square bg-[#F9FAFB] rounded-2xl flex flex-col items-center justify-center border border-slate-200">
                       <span className="text-2xl">🌑</span>
                       <span className="text-[10px] font-black uppercase mt-2">Stealth</span>
                   </div>
                   <div className="aspect-square bg-[#F9FAFB] rounded-2xl flex flex-col items-center justify-center border border-slate-200">
                       <span className="text-2xl">👑</span>
                       <span className="text-[10px] font-black uppercase mt-2">Gold</span>
                   </div>
              </div>
          </div>

          <button 
            onClick={handleSaveSettings}
            disabled={isSaving}
            className="w-full py-4 bg-[#1F2128] text-white rounded-[1.5rem] font-black uppercase tracking-widest shadow-xl shadow-black/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 animate-slide-up delay-300 fill-mode-both"
          >
              {isSaving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    Сохранение...
                  </>
              ) : 'Сохранить изменения'}
          </button>
      </div>
  );

  // --- MAIN RENDER ---
  
  return (
    <div className="min-h-screen bg-[#F9FAFB] pb-32 overflow-x-hidden">
      {/* HEADER WITH 3D AVATAR */}
      <div className="relative bg-[#1A1A1A] pb-10 rounded-b-[3rem] overflow-hidden">
          {/* Animated Background */}
          <div className="absolute inset-0 opacity-20">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,_rgba(255,171,123,0.4),_transparent_70%)]"></div>
             <div className="absolute bottom-0 w-full h-1/2 bg-[linear-gradient(to_top,_#1A1A1A,_transparent)]"></div>
          </div>

          {/* Top Bar */}
          <div className="relative z-20 px-6 pt-12 flex justify-between items-start mb-4">
             <button onClick={onLogout} className="flex items-center gap-2 text-white/50 hover:text-white transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" /></svg>
                <span className="text-[10px] font-bold uppercase tracking-widest">Выход</span>
             </button>
             <div className="px-3 py-1 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-[10px] font-black text-white uppercase tracking-widest">
                 {userProgress.role}
             </div>
          </div>

          {/* 3D AVATAR STAGE */}
          <div 
            className="relative z-10 flex flex-col items-center justify-center perspective-container py-4"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            ref={avatarRef}
          >
              <div 
                 className="relative w-48 h-48 md:w-56 md:h-56 transition-transform duration-100 ease-out preserve-3d"
                 style={{ 
                     transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
                 }}
              >
                  {/* Holographic Ring Base */}
                  <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-[#FFAB7B]/20 rounded-full blur-xl transform scale-y-50 animate-pulse"></div>
                  
                  {/* Energy Aura/Glow behind */}
                  <div className="absolute inset-0 rounded-[2.5rem] bg-[#6C5DD3]/30 blur-2xl animate-pulse-slow"></div>

                  {/* The Avatar Image */}
                  <div className="w-full h-full rounded-[2.5rem] border-4 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden relative bg-[#0F1115] group animate-avatar-breathe">
                      <img 
                        src={userProgress.avatarUrl || `https://ui-avatars.com/api/?name=${userProgress.name}`} 
                        className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-700"
                        alt="Avatar" 
                      />
                      {/* Scanline Effect */}
                      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/5 to-transparent h-[200%] w-full animate-scanline pointer-events-none"></div>
                      <div className="absolute inset-0 ring-1 ring-inset ring-white/20 rounded-[2.5rem]"></div>
                  </div>
              </div>

              <div className="text-center mt-6">
                  <h1 className="text-3xl font-black text-white leading-tight mb-1">{userProgress.name}</h1>
                  <p className="text-[#FFAB7B] font-bold text-xs uppercase tracking-[0.2em]">{userProgress.armorStyle || 'Recruit'}</p>
              </div>
          </div>
      </div>

      {/* NAVIGATION TABS */}
      <div className="px-6 -mt-8 relative z-20">
          <div className="bg-white p-2 rounded-[2rem] shadow-xl shadow-black/5 flex justify-between items-center mb-8 overflow-x-auto no-scrollbar">
              {[
                  { id: 'STATS', icon: '📊', label: 'Инфо' },
                  { id: 'CALENDAR', icon: '📅', label: 'План' },
                  { id: 'RATING', icon: '🏆', label: 'Топ' },
                  { id: 'SETTINGS', icon: '⚙️', label: 'Опции' },
              ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as ProfileTab)}
                    className={`flex items-center gap-2 px-4 py-3 rounded-[1.5rem] transition-all min-w-[90px] justify-center ${
                        activeTab === tab.id 
                        ? 'bg-[#1F2128] text-white shadow-lg' 
                        : 'text-slate-400 hover:bg-slate-50'
                    }`}
                  >
                      <span className="text-lg">{tab.icon}</span>
                      <span className="text-[10px] font-black uppercase tracking-wide">{tab.label}</span>
                  </button>
              ))}
          </div>

          {/* CONTENT AREA */}
          <div className="min-h-[300px]">
              {activeTab === 'STATS' && renderStats()}
              {activeTab === 'CALENDAR' && <CalendarView externalEvents={events} />}
              {activeTab === 'RATING' && renderLeaderboard()}
              {activeTab === 'SETTINGS' && renderSettings()}
          </div>
      </div>

      <style>{`
        .perspective-container { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        @keyframes scanline {
            0% { transform: translateY(-50%); }
            100% { transform: translateY(0%); }
        }
        .animate-scanline { animation: scanline 3s linear infinite; }
        @keyframes breathe {
            0%, 100% { transform: scale(1); box-shadow: 0 20px 50px rgba(0,0,0,0.5); border-color: rgba(255,255,255,0.1); }
            50% { transform: scale(1.02); box-shadow: 0 25px 60px rgba(108, 93, 211, 0.3); border-color: rgba(108, 93, 211, 0.4); }
        }
        .animate-avatar-breathe {
            animation: breathe 4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};