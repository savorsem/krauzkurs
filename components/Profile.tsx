
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

type ViewMode = 'DASHBOARD' | 'SETTINGS' | 'LEADERBOARD';

export const Profile: React.FC<ProfileProps> = ({ userProgress, onLogout, allUsers, onUpdateUser, events }) => {
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
  // Mock Win/Lose based on activity (just for visual matching)
  const winRate = Math.min(100, 50 + (userProgress.completedLessonIds.length * 5)); 

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
        onUpdateUser({
            name: editName,
            telegramUsername: editTelegram,
            notifications: editNotifications
        });
        setIsSaving(false);
        setViewMode('DASHBOARD');
    }, 800);
  };

  const toggleNotification = (key: keyof typeof editNotifications) => {
    setEditNotifications(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // --- SUB-COMPONENTS ---

  const renderHeader = () => (
    <div className="flex justify-between items-center px-4 py-2 mb-6">
        <button 
            onClick={onLogout} 
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
        >
            <span className="text-lg">✕</span>
            <span className="text-sm font-medium">Close</span>
        </button>

        <div className="flex items-center gap-4">
             {viewMode === 'DASHBOARD' && (
                 <>
                    <button onClick={() => setViewMode('SETTINGS')} className="text-white/80 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 4.889c-.02.12-.115.26-.297.348a7.493 7.493 0 00-.986.57c-.166.115-.334.126-.45.083L6.3 5.508a1.875 1.875 0 00-2.282.819l-.922 1.597a1.875 1.875 0 00.432 2.385l.84.692c.095.078.17.229.154.43a7.598 7.598 0 000 1.139c.015.2-.059.352-.153.43l-.841.692a1.875 1.875 0 00-.432 2.385l.922 1.597a1.875 1.875 0 002.282.818l1.019-.382c.115-.043.283-.031.45.082.312.214.641.405.985.57.182.088.277.228.297.35l.178 1.071c.151.904.933 1.567 1.85 1.567h1.844c.916 0 1.699-.663 1.85-1.567l.178-1.072c.02-.12.114-.26.297-.349.344-.165.673-.356.985-.57.167-.114.335-.125.45-.082l1.02.382a1.875 1.875 0 002.28-.819l.922-1.597a1.875 1.875 0 00-.432-2.385l-.84-.692c-.095-.078-.17-.229-.154-.43a7.614 7.614 0 000-1.139c-.016-.2.059-.352.153-.43l.84-.692c.708-.582.891-1.59.433-2.385l-.922-1.597a1.875 1.875 0 00-2.282-.818l-1.02.382c-.114.043-.282.031-.45-.083a7.49 7.49 0 00-.985-.57c-.183-.087-.277-.227-.297-.348l-.179-1.072a1.875 1.875 0 00-1.85-1.567h-1.843zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" />
                        </svg>
                    </button>
                    <button className="text-white/80 hover:text-white transition-colors">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M5.25 9a6.75 6.75 0 0113.5 0v.75c0 2.123.8 4.057 2.118 5.52a.75.75 0 01-.297 1.206c-1.544.57-3.16.99-4.831 1.243a3.75 3.75 0 11-7.48 0 24.585 24.585 0 01-4.831-1.244.75.75 0 01-.298-1.205A8.217 8.217 0 005.25 9.75V9zm4.502 8.9a2.25 2.25 0 104.496 0 25.057 25.057 0 01-4.496 0z" clipRule="evenodd" />
                        </svg>
                    </button>
                 </>
             )}
             
            <div className="bg-[#1F2128] border border-white/10 rounded-full px-3 py-1.5 flex items-center gap-2">
                <span className="text-[#00B050] text-sm font-black">
                    {userProgress.xp.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <button className="w-5 h-5 bg-[#00CEFF] rounded-full flex items-center justify-center text-black font-bold text-xs hover:scale-110 transition-transform">+</button>
            </div>
        </div>
    </div>
  );

  const renderStatsRow = () => (
      <div className="flex justify-between items-center px-6 mb-8">
          {/* Win/Lose */}
          <div className="flex flex-col items-center gap-2">
              <div className="relative w-12 h-12 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                      <circle cx="24" cy="24" r="22" stroke="#1F2128" strokeWidth="4" fill="none" />
                      <circle cx="24" cy="24" r="22" stroke="#00CEFF" strokeWidth="4" fill="none" strokeDasharray={138} strokeDashoffset={138 - (138 * winRate / 100)} strokeLinecap="round" />
                  </svg>
                  <span className="absolute text-[10px] font-bold text-[#00CEFF]">{winRate}%</span>
              </div>
              <span className="text-white/40 text-[10px] font-bold">Win/Lose</span>
          </div>

          {/* Level */}
          <div className="flex flex-col items-center gap-2 transform -translate-y-4">
               <div className="w-16 h-16 bg-[#1F2128] rounded-2xl flex items-center justify-center border border-white/5 relative shadow-[0_0_20px_rgba(0,0,0,0.5)]">
                   <div className="absolute -top-2 -right-2 text-xl">✨</div>
                   <div className="text-[#00CEFF] font-black text-2xl">{userProgress.level}</div>
               </div>
               <span className="text-white/40 text-[10px] font-bold">Level</span>
          </div>

          {/* Days */}
          <div className="flex flex-col items-center gap-2">
              <div className="w-12 h-12 bg-[#1F2128] rounded-xl flex items-center justify-center border border-white/5 text-white/80">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
              </div>
              <div className="flex flex-col items-center">
                  <span className="text-white font-bold text-sm leading-none">{daysInSystem}</span>
                  <span className="text-white/40 text-[10px] font-bold">Days</span>
              </div>
          </div>
      </div>
  );

  const renderCalendarStrip = () => {
      const today = new Date();
      const days = [];
      // Generate 7 days centered on selection (or today)
      for (let i = -3; i <= 3; i++) {
          const d = new Date(selectedDate);
          d.setDate(selectedDate.getDate() + i);
          days.push(d);
      }

      const weekDays = ['Sun', 'Mon', 'Tue', 'Wen', 'Thu', 'Fri', 'Sat'];

      return (
          <div className="flex justify-between items-center px-4 mb-8">
              {days.map((date, i) => {
                  const isSelected = date.getDate() === selectedDate.getDate() && date.getMonth() === selectedDate.getMonth();
                  const isToday = date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
                  
                  return (
                      <button 
                        key={i} 
                        onClick={() => setSelectedDate(date)}
                        className={`flex flex-col items-center gap-2 p-2 rounded-[1rem] transition-all min-w-[44px]
                            ${isSelected ? 'bg-[#1F2128] border border-[#00CEFF]/50 shadow-[0_0_15px_rgba(0,206,255,0.1)] -translate-y-1' : 'hover:bg-white/5'}
                        `}
                      >
                          <span className={`text-[9px] font-bold uppercase ${isSelected ? 'text-[#00CEFF]' : 'text-slate-500'}`}>
                              {weekDays[date.getDay()]}
                          </span>
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-slate-400'} ${isToday && !isSelected ? 'text-[#00B050]' : ''}`}>
                              {date.getDate()}
                          </span>
                          {isSelected && <div className="w-1 h-1 bg-[#00CEFF] rounded-full"></div>}
                      </button>
                  );
              })}
          </div>
      );
  };

  const renderDashboard = () => (
      <div className="animate-fade-in">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
              <div className="relative w-32 h-32 mb-3">
                  <div className="absolute inset-0 bg-[#00CEFF] rounded-full blur-[50px] opacity-20"></div>
                  <div className="w-full h-full rounded-full border-4 border-[#1F2128] overflow-hidden relative bg-[#131419] shadow-2xl">
                      <img 
                          src={userProgress.avatarUrl || `https://ui-avatars.com/api/?name=${userProgress.name}`} 
                          className="w-full h-full object-cover transform scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                  </div>
                  {/* Status Indicator */}
                  <div className="absolute bottom-2 right-2 w-6 h-6 bg-[#1F2128] rounded-full flex items-center justify-center">
                      <div className="w-4 h-4 bg-[#00B050] rounded-full border-2 border-[#1F2128]"></div>
                  </div>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">{userProgress.name}</h2>
              <p className="text-slate-500 text-xs font-bold">@{userProgress.telegramUsername || 'recruit'}</p>
          </div>

          {renderStatsRow()}
          {renderCalendarStrip()}

          {/* Widgets Grid */}
          <div className="grid grid-cols-2 gap-4 px-4 pb-24">
              {/* Friends / Leaderboard Widget */}
              <button onClick={() => setViewMode('LEADERBOARD')} className="bg-[#1F2128] p-4 rounded-[2rem] border border-white/5 flex flex-col items-start gap-4 hover:border-white/20 transition-all group relative overflow-hidden">
                  <div className="flex -space-x-3 relative z-10">
                      {allUsers.slice(0, 3).map((u, i) => (
                          <div key={i} className="w-10 h-10 rounded-full border-2 border-[#1F2128] overflow-hidden bg-slate-800">
                               <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-full h-full object-cover" />
                          </div>
                      ))}
                      {allUsers.length > 3 && (
                        <div className="w-10 h-10 rounded-full border-2 border-[#1F2128] bg-[#2A2D35] text-white flex items-center justify-center text-[10px] font-bold">
                            +{allUsers.length - 3}
                        </div>
                      )}
                  </div>
                  <div className="relative z-10 text-left">
                      <h3 className="text-white font-bold text-lg leading-none">Friends</h3>
                      <p className="text-[#00CEFF] text-[10px] font-bold">{Math.max(1, Math.floor(allUsers.length / 2))} online</p>
                  </div>
                  {/* Decor */}
                  <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-[#00CEFF]/10 rounded-full blur-xl group-hover:bg-[#00CEFF]/20 transition-colors"></div>
              </button>

              {/* Keep it up / Streak Widget */}
              <div className="bg-[#1F2128] p-4 rounded-[2rem] border border-white/5 flex flex-col items-start justify-between relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-3 opacity-20 group-hover:opacity-40 transition-opacity transform group-hover:scale-110 duration-500">
                      <span className="text-5xl">🏆</span>
                  </div>
                  <div className="relative z-10">
                      <h3 className="text-white font-bold text-lg mb-1">Keep it up!</h3>
                      <p className="text-slate-400 text-[10px] font-medium leading-tight">
                          <span className="text-[#00B050] font-bold">{daysInSystem} days</span> in a row you are here!
                      </p>
                  </div>
                  <div className="flex gap-1 mt-3">
                       {[1,2,3,4].map(i => <div key={i} className={`w-2 h-2 rounded-full ${i <= 3 ? 'bg-[#00CEFF]' : 'bg-slate-700'}`}></div>)}
                       <div className="w-2 h-2 rounded-full bg-[#00B050] animate-pulse"></div>
                  </div>
              </div>

              {/* Complete New Tasks Widget (Wide) */}
              <div className="col-span-2 bg-gradient-to-r from-[#1F2128] to-[#16181D] p-5 rounded-[2.5rem] border border-white/5 flex items-center justify-between relative overflow-hidden group hover:border-[#00CEFF]/30 transition-all cursor-pointer">
                  <div className="absolute left-0 top-0 bottom-0 w-2 bg-[#00CEFF]"></div>
                  <div className="flex items-center gap-4 relative z-10 pl-2">
                       <div className="w-12 h-12 bg-[#00CEFF]/10 rounded-full flex items-center justify-center text-[#00CEFF] text-2xl group-hover:scale-110 transition-transform">
                           ⚡
                       </div>
                       <div>
                           <h3 className="text-white font-bold text-lg">Complete new tasks</h3>
                           <p className="text-slate-500 text-xs">Get a bonus on your winnings</p>
                       </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white group-hover:bg-[#00CEFF] group-hover:text-black transition-all">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
                  </div>
                  
                  {/* Background Glow */}
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 bg-[#00CEFF] rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
              </div>
          </div>
      </div>
  );

  const renderLeaderboard = () => {
      const sortedUsers = [...allUsers].sort((a, b) => b.xp - a.xp);
      return (
          <div className="px-6 animate-slide-in pb-24">
               <div className="flex items-center gap-4 mb-6">
                   <button onClick={() => setViewMode('DASHBOARD')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">←</button>
                   <h2 className="text-2xl font-black text-white">Leaderboard</h2>
               </div>

               <div className="space-y-3">
                   {sortedUsers.map((u, i) => (
                       <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 border ${u.name === userProgress.name ? 'bg-[#00CEFF]/10 border-[#00CEFF]/50' : 'bg-[#1F2128] border-white/5'}`}>
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
      <div className="px-6 animate-slide-in pb-24">
          <div className="flex items-center gap-4 mb-8">
               <button onClick={() => setViewMode('DASHBOARD')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white hover:bg-white/10">←</button>
               <h2 className="text-2xl font-black text-white">Settings</h2>
          </div>

          <div className="space-y-6">
              <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5">
                  <h3 className="text-white font-bold mb-4">Profile Info</h3>
                  <div className="space-y-4">
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Callsign</label>
                          <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#00CEFF] outline-none font-bold" />
                      </div>
                      <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Telegram</label>
                          <input value={editTelegram} onChange={e => setEditTelegram(e.target.value)} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#00CEFF] outline-none font-bold" />
                      </div>
                  </div>
              </div>

              <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5">
                  <h3 className="text-white font-bold mb-4">Notifications</h3>
                  <div className="space-y-4">
                      {Object.entries(editNotifications).map(([key, val]) => (
                          <div key={key} className="flex items-center justify-between p-2">
                              <span className="text-slate-300 text-sm font-medium capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                              <button 
                                onClick={() => toggleNotification(key as keyof typeof editNotifications)}
                                className={`w-12 h-6 rounded-full p-1 transition-colors ${val ? 'bg-[#00CEFF]' : 'bg-slate-700'}`}
                              >
                                  <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${val ? 'translate-x-6' : 'translate-x-0'}`} />
                              </button>
                          </div>
                      ))}
                  </div>
              </div>

              <button 
                onClick={handleSaveSettings}
                disabled={isSaving}
                className="w-full py-4 bg-[#00CEFF] text-black rounded-[1.5rem] font-black uppercase tracking-widest hover:scale-[1.02] transition-transform shadow-[0_0_30px_rgba(0,206,255,0.3)]"
              >
                  {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] pb-24 font-sans text-white overflow-x-hidden">
        {renderHeader()}
        
        {viewMode === 'DASHBOARD' && renderDashboard()}
        {viewMode === 'SETTINGS' && renderSettings()}
        {viewMode === 'LEADERBOARD' && renderLeaderboard()}
    </div>
  );
};
