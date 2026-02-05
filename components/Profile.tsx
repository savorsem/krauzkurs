
import React, { useState, useEffect } from 'react';
import { UserProgress, CalendarEvent } from '../types';

interface ProfileProps {
  userProgress: UserProgress;
  onLogout: () => void;
  allUsers: UserProgress[];
  onUpdateUser: (updatedUser: Partial<UserProgress>) => void;
  events: CalendarEvent[];
  onReferral: () => void;
  onShareStory: () => void;
  isSettingsOpen: boolean; // Controlled by SmartNav
}

type ViewMode = 'DASHBOARD' | 'LEADERBOARD';

export const Profile: React.FC<ProfileProps> = ({ 
    userProgress, 
    onLogout, 
    allUsers, 
    onUpdateUser, 
    events, 
    onReferral, 
    onShareStory,
    isSettingsOpen 
}) => {
  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  
  // Settings State
  const [editName, setEditName] = useState(userProgress.name);
  const [editTelegram, setEditTelegram] = useState(userProgress.telegramUsername || '');
  const [editNotifications, setEditNotifications] = useState(userProgress.notifications);
  const [isSaving, setIsSaving] = useState(false);

  // Calendar State
  const [selectedDate, setSelectedDate] = useState(new Date());

  // Calculated Stats
  const registrationDate = userProgress.registrationDate ? new Date(userProgress.registrationDate) : new Date();
  const daysInSystem = Math.floor((new Date().getTime() - registrationDate.getTime()) / (1000 * 3600 * 24)) + 1;
  const winRate = Math.min(100, 50 + (userProgress.completedLessonIds.length * 5)); 
  const circleCircumference = 2 * Math.PI * 22; // r=22
  const strokeDashoffset = circleCircumference - (circleCircumference * winRate) / 100;

  const handleSaveSettings = () => {
    setIsSaving(true);
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

  const renderStatsRow = () => (
      <div className="flex justify-between items-center px-6 mb-8 gap-3">
          {/* Win/Lose Card */}
          <div className="flex flex-col items-center gap-2 flex-1 animate-scale-in delay-100 p-2 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95 cursor-pointer">
              <div className="relative w-14 h-14 flex items-center justify-center group">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(0,206,255,0.3)]">
                      <circle cx="28" cy="28" r="22" stroke="#1F2128" strokeWidth="4" fill="none" />
                      <circle 
                        cx="28" cy="28" r="22" 
                        stroke="#00CEFF" strokeWidth="4" fill="none" 
                        strokeDasharray={circleCircumference} 
                        strokeDashoffset={strokeDashoffset} 
                        strokeLinecap="round" 
                        className="transition-all duration-1000 ease-out group-hover:drop-shadow-[0_0_10px_#00CEFF]"
                      />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#00CEFF] group-hover:scale-110 transition-transform">{winRate}%</span>
              </div>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wide">Rate</span>
          </div>

          {/* Level Card */}
          <div className="flex flex-col items-center gap-2 transform -translate-y-4 flex-1 animate-scale-in delay-200">
               <div className="w-16 h-16 bg-[#1F2128] rounded-2xl flex items-center justify-center border border-white/5 relative shadow-[0_10px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-110 hover:bg-[#252830] hover:border-[#00CEFF]/30 group cursor-pointer overflow-hidden">
                   <div className="absolute -top-2 -right-2 text-xl animate-bounce z-10">✨</div>
                   <div className="text-[#00CEFF] font-black text-2xl group-hover:scale-125 transition-transform duration-300 relative z-10">{userProgress.level}</div>
                   
                   {/* Shimmer Effect */}
                   <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none"></div>
                   <div className="absolute inset-0 bg-[#00CEFF]/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
               </div>
               <span className="text-white/40 text-[10px] font-bold uppercase tracking-wide">Level</span>
          </div>

          {/* Days Card */}
          <div className="flex flex-col items-center gap-2 flex-1 animate-scale-in delay-300 p-2 rounded-2xl transition-all duration-300 hover:bg-white/5 hover:scale-105 active:scale-95 cursor-pointer group">
              <div className="w-14 h-14 bg-[#1F2128] rounded-2xl flex items-center justify-center border border-white/5 text-white/80 transition-all duration-300 group-hover:bg-[#252830] group-hover:text-[#D4AF37] group-hover:border-[#D4AF37]/30 shadow-sm relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-[#D4AF37]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="flex flex-col items-center relative z-10">
                      <span className="text-white font-bold text-lg leading-none mb-1 group-hover:text-[#D4AF37] transition-colors">{daysInSystem}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 text-white/40 group-hover:text-[#D4AF37] group-hover:animate-pulse"><path fillRule="evenodd" d="M12.963 2.286a.75.75 0 00-1.071-.136 9.742 9.742 0 00-3.539 6.177 7.547 7.547 0 01-1.705-1.715.75.75 0 00-1.152-.082A9 9 0 1015.68 4.534a7.46 7.46 0 01-2.717-2.248zM15.75 14.25a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" clipRule="evenodd" /></svg>
                  </div>
              </div>
              <span className="text-white/40 text-[10px] font-bold uppercase tracking-wide">Streak</span>
          </div>
      </div>
  );

  const renderCalendarStrip = () => {
      const today = new Date();
      const days = [];
      for (let i = -3; i <= 3; i++) {
          const d = new Date(selectedDate);
          d.setDate(selectedDate.getDate() + i);
          days.push(d);
      }
      const weekDays = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];

      return (
          <div className="flex justify-between items-center px-4 mb-8 animate-slide-up fill-mode-both delay-100">
              {days.map((date, i) => {
                  const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
                  
                  return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center justify-center gap-1.5 w-[44px] h-[70px] rounded-[1.2rem] transition-all duration-300 relative
                            ${isSelected 
                                ? 'bg-[#1F2128] border border-[#00CEFF]/50 shadow-[0_0_15px_#00CEFF] -translate-y-2 scale-110 z-10' 
                                : 'hover:bg-white/5 border border-transparent active:scale-95'}
                        `}
                      >
                          {isSelected && <div className="absolute inset-0 bg-[#00CEFF]/5 rounded-[1.2rem] animate-pulse"></div>}
                          <span className={`text-[9px] font-bold uppercase tracking-tight relative z-10 ${isSelected ? 'text-[#00CEFF]' : 'text-slate-500'}`}>
                              {weekDays[date.getDay()]}
                          </span>
                          <span className={`text-sm font-black relative z-10 ${isSelected ? 'text-white' : 'text-slate-400'} ${isToday && !isSelected ? 'text-[#00B050]' : ''}`}>
                              {date.getDate()}
                          </span>
                          {isSelected && <div className="w-1 h-1 bg-[#00CEFF] rounded-full shadow-[0_0_5px_#00CEFF] relative z-10"></div>}
                      </button>
                  );
              })}
          </div>
      );
  };

  const renderDashboard = () => (
      <div className="animate-fade-in">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8 animate-slide-up pt-8">
              <div className="relative w-32 h-32 mb-3 group cursor-pointer">
                  <div className="absolute -inset-4 rounded-full border border-dashed border-[#00CEFF]/20 animate-[spin_10s_linear_infinite]"></div>
                  <div className="absolute inset-0 bg-[#00CEFF] rounded-full blur-[50px] opacity-20 group-hover:opacity-40 transition-opacity duration-500 animate-pulse-slow"></div>
                  <div className="w-full h-full rounded-full border-4 border-[#1F2128] overflow-hidden relative bg-[#131419] shadow-2xl transition-transform duration-500 group-hover:scale-105 group-hover:rotate-2 group-hover:border-[#00CEFF]/50">
                      <img 
                          src={userProgress.avatarUrl || `https://ui-avatars.com/api/?name=${userProgress.name}`} 
                          className="w-full h-full object-cover transform scale-110 group-hover:scale-100 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  <div className="absolute bottom-2 right-2 w-7 h-7 bg-[#1F2128] rounded-full flex items-center justify-center z-10 group-hover:scale-110 transition-transform">
                      <div className="w-4 h-4 bg-[#00B050] rounded-full border-2 border-[#1F2128] animate-pulse shadow-[0_0_8px_#00B050]"></div>
                  </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                  {userProgress.name}
                  {userProgress.role === 'ADMIN' && <span className="text-[#00CEFF] text-sm">🛡️</span>}
              </h2>
              <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">@{userProgress.telegramUsername || 'recruit'}</p>
          </div>

          {renderStatsRow()}
          {renderCalendarStrip()}

          {/* Quick Actions */}
          <div className="px-4 mb-4 grid grid-cols-2 gap-4">
              <button onClick={onReferral} className="bg-[#6C5DD3]/10 p-3 rounded-2xl border border-[#6C5DD3]/30 flex items-center gap-3 active:scale-95 transition-transform hover:bg-[#6C5DD3]/20 hover:border-[#6C5DD3]/50 group">
                  <div className="w-10 h-10 rounded-full bg-[#6C5DD3]/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">🤝</div>
                  <div className="text-left">
                      <div className="text-white font-bold text-xs group-hover:text-[#6C5DD3] transition-colors">Приведи друга</div>
                      <div className="text-[#6C5DD3] font-black text-[9px]">+10,000 XP</div>
                  </div>
              </button>
              <button onClick={onShareStory} className="bg-[#D4AF37]/10 p-3 rounded-2xl border border-[#D4AF37]/30 flex items-center gap-3 active:scale-95 transition-transform hover:bg-[#D4AF37]/20 hover:border-[#D4AF37]/50 group">
                  <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-xl group-hover:scale-110 transition-transform">📸</div>
                  <div className="text-left">
                      <div className="text-white font-bold text-xs group-hover:text-[#D4AF37] transition-colors">Репост сторис</div>
                      <div className="text-[#D4AF37] font-black text-[9px]">+400 XP</div>
                  </div>
              </button>
          </div>

          {/* Widgets Grid */}
          <div className="grid grid-cols-2 gap-4 px-4 pb-32 animate-slide-up delay-200 fill-mode-both">
              <button onClick={() => setViewMode('LEADERBOARD')} className="bg-[#1F2128] p-5 rounded-[2rem] border border-white/5 flex flex-col items-start gap-4 hover:border-white/20 transition-all duration-300 group relative overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20 active:scale-[0.98]">
                  <div className="flex -space-x-3 relative z-10 transition-all duration-300 group-hover:space-x-[-8px]">
                      {allUsers.slice(0, 3).map((u, i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1F2128] overflow-hidden bg-slate-800 transition-transform hover:scale-110 hover:z-20">
                               <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-full h-full object-cover" />
                          </div>
                      ))}
                  </div>
                  <div className="relative z-10 text-left">
                      <h3 className="text-white font-bold text-lg leading-none mb-1">Friends</h3>
                      <div className="flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 bg-[#00CEFF] rounded-full animate-pulse"></span>
                          <p className="text-[#00CEFF] text-[10px] font-bold">{Math.max(1, Math.floor(allUsers.length / 2))} online</p>
                      </div>
                  </div>
              </button>

              <div className="bg-[#1F2128] p-5 rounded-[2rem] border border-white/5 flex flex-col items-start justify-between relative overflow-hidden group hover:border-white/20 hover:-translate-y-1 transition-all duration-300">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-100 transition-all transform group-hover:scale-110 group-hover:rotate-12 duration-500 text-[#00B050] drop-shadow-[0_0_10px_rgba(0,176,80,0.5)]">
                      <span className="text-5xl">🏆</span>
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg mb-1">Keep it up!</h3>
                      <p className="text-slate-400 text-[10px] font-medium leading-tight">
                          <span className="text-[#00B050] font-bold">{daysInSystem} days</span> streak
                      </p>
                  </div>
              </div>
          </div>
      </div>
  );

  const renderLeaderboard = () => {
      const sortedUsers = [...allUsers].sort((a, b) => b.xp - a.xp);
      return (
          <div className="px-6 animate-slide-in pb-32 pt-12">
               <div className="flex items-center gap-4 mb-6">
                   <button onClick={() => setViewMode('DASHBOARD')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10 active:scale-95 transition-all">←</button>
                   <h2 className="text-2xl font-black text-white">Leaderboard</h2>
               </div>

               <div className="space-y-3">
                   {sortedUsers.map((u, i) => (
                       <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 border transition-all hover:scale-[1.02] ${u.name === userProgress.name ? 'bg-[#00CEFF]/10 border-[#00CEFF]/50 shadow-[0_0_15px_rgba(0,206,255,0.1)]' : 'bg-[#1F2128] border-white/5'}`}>
                           <span className={`font-black text-lg w-6 ${i < 3 ? 'text-[#D4AF37]' : 'text-slate-500'}`}>{i + 1}</span>
                           <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full object-cover bg-slate-700" />
                           <div className="flex-1">
                               <h4 className="text-white font-bold text-sm">{u.name}</h4>
                               <p className="text-slate-500 text-[10px] uppercase font-bold">{u.level} Level</p>
                           </div>
                           <div className="text-right">
                               <p className="text-white font-black">{u.xp}</p>
                               <p className="text-[#00CEFF] text-[9px] uppercase font-bold">XP</p>
                           </div>
                       </div>
                   ))}
               </div>
          </div>
      );
  };

  const renderSettings = () => (
      <div className="px-6 animate-slide-in pb-32 pt-12">
          <h2 className="text-2xl font-black text-white mb-8">Settings</h2>
          <div className="space-y-6">
              <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 shadow-lg">
                  <h3 className="text-white font-bold mb-4">Profile Info</h3>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Callsign</label>
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#00CEFF] outline-none font-bold transition-colors" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Telegram</label>
                          <input value={editTelegram} onChange={e => setEditTelegram(e.target.value)} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#00CEFF] outline-none font-bold transition-colors" />
                      </div>
                  </div>
              </div>

              <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 shadow-lg">
                  <h3 className="text-white font-bold mb-4">Notifications</h3>
                  <div className="space-y-4">
                      {Object.entries(editNotifications).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-xl transition-colors">
                              <span className="text-slate-300 text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <button 
                                onClick={() => toggleNotification(key as keyof typeof editNotifications)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 ${val ? 'bg-[#00CEFF]' : 'bg-slate-700'}`}
                              >
                                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-300 ${val ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full py-4 bg-[#00CEFF] text-black rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_0_30px_rgba(0,206,255,0.3)] disabled:opacity-50"
              >
                  {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 font-sans text-white overflow-x-hidden">
        {isSettingsOpen ? renderSettings() : (
            <>
                {viewMode === 'DASHBOARD' && renderDashboard()}
                {viewMode === 'LEADERBOARD' && renderLeaderboard()}
            </>
        )}
    </div>
  );
};
