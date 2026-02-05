
import React, { useState } from 'react';
import { UserProgress, CalendarEvent, ThemeConfig } from '../types';
import { AnimatedCounter } from './AnimatedCounter';
import { telegram } from '../services/telegramService';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

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

export const Profile: React.FC<ProfileProps> = ({ 
    userProgress, 
    onLogout, 
    onUpdateUser, 
    allUsers,
    onReferral,
    onShareStory,
    isSettingsOpen,
    theme
}) => {
  const [viewMode, setViewMode] = useState<'DASHBOARD' | 'LEADERBOARD'>('DASHBOARD');
  const [editName, setEditName] = useState(userProgress.name);
  const [isSaving, setIsSaving] = useState(false);

  const accent = theme?.accentColor || '#D4AF37';

  // Prepare Data for Radar Chart
  const skillsData = [
    { subject: 'Sales', A: userProgress.stats.skills.sales, fullMark: 100 },
    { subject: 'Tactics', A: userProgress.stats.skills.tactics, fullMark: 100 },
    { subject: 'Psy', A: userProgress.stats.skills.psychology, fullMark: 100 },
    { subject: 'Discipline', A: userProgress.stats.skills.discipline, fullMark: 100 },
    { subject: 'XP', A: Math.min(userProgress.xp / 100, 100), fullMark: 100 },
  ];

  const handleSaveSettings = () => {
    setIsSaving(true);
    setTimeout(() => {
        onUpdateUser({ name: editName });
        setIsSaving(false);
        telegram.haptic('success');
    }, 800);
  };

  const handleShareProgress = () => {
      telegram.haptic('heavy');
      telegram.shareProgress(userProgress.level, userProgress.xp);
  };

  if (viewMode === 'LEADERBOARD') {
      return (
        <div className="px-6 py-8 animate-fade-in pb-32 min-h-screen text-white">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={() => setViewMode('DASHBOARD')} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10">←</button>
            <h2 className="text-2xl font-black">RANKINGS</h2>
          </div>
          <div className="space-y-4">
            {allUsers.sort((a,b) => b.xp - a.xp).map((u, i) => (
                <div key={i} className={`p-4 rounded-2xl flex items-center gap-4 border ${u.name === userProgress.name ? 'border-[#6C5DD3] bg-[#6C5DD3]/10' : 'border-white/5 bg-white/5'}`}>
                    <span className="text-xs font-black opacity-40">#{i+1}</span>
                    <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                    <span className="flex-1 font-bold truncate">{u.name}</span>
                    <span className="font-black text-[#6C5DD3]">{u.xp} XP</span>
                </div>
            ))}
          </div>
        </div>
      );
  }

  return (
      <div className="min-h-screen text-white pb-32">
          {/* Settings Overlay */}
          {isSettingsOpen && (
            <div className="fixed inset-0 z-[100] bg-black/90 backdrop-blur-xl p-6 pt-20 animate-fade-in overflow-y-auto">
                <div className="max-w-md mx-auto space-y-8">
                    <h2 className="text-3xl font-black text-center">SYSTEM SETTINGS</h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                             <label className="text-[10px] uppercase font-bold text-slate-500">Callsign</label>
                             <input value={editName} onChange={e => setEditName(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 font-bold outline-none focus:border-[#6C5DD3]" />
                        </div>
                        
                        <div className="bg-white/5 rounded-3xl p-6 border border-white/10 space-y-4">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Notification Protocols</p>
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-bold">Combat Alerts</span>
                                <div className="w-10 h-6 bg-[#00B050] rounded-full relative"><div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div></div>
                            </div>
                        </div>

                        <button onClick={handleSaveSettings} disabled={isSaving} className="w-full py-4 bg-[#6C5DD3] rounded-2xl font-black uppercase text-xs tracking-widest">
                            {isSaving ? 'SAVING...' : 'SAVE CONFIG'}
                        </button>
                    </div>
                    <button onClick={onLogout} className="w-full text-red-500 font-bold text-xs uppercase py-4 border border-red-500/20 rounded-2xl hover:bg-red-500/10">TERMINATE SESSION</button>
                </div>
            </div>
          )}

          {/* Header Card (Service Record) */}
          <div className="pt-8 px-4 mb-6">
              <div 
                className="relative overflow-hidden rounded-[2.5rem] bg-[#1F2128] border border-white/10 shadow-2xl"
                style={{ borderRadius: theme?.borderRadius === 'SHARP' ? '0.5rem' : '2.5rem' }}
              >
                  {/* Background Image */}
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url(${userProgress.avatarUrl})`, backgroundSize: 'cover', backgroundPosition: 'center', filter: 'blur(20px)' }}></div>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1F2128]/80 to-[#1F2128]"></div>

                  <div className="relative z-10 p-6 flex flex-col items-center">
                      {/* Avatar */}
                      <div className="relative w-32 h-32 mb-4 group">
                          <div className="absolute inset-0 rounded-full blur-xl opacity-40 animate-pulse" style={{ backgroundColor: accent }}></div>
                          <img src={userProgress.avatarUrl || 'https://via.placeholder.com/150'} className="w-full h-full rounded-full border-4 border-[#1F2128] object-cover relative z-10 shadow-2xl" />
                          <div className="absolute bottom-0 right-0 z-20 bg-[#1F2128] rounded-full p-1 border border-white/10">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D4AF37] to-[#8B7326] flex items-center justify-center text-black font-black text-xs shadow-lg">
                                  {userProgress.level}
                              </div>
                          </div>
                      </div>

                      <h2 className="text-3xl font-black tracking-tight mb-1">{userProgress.name}</h2>
                      <div className="flex items-center gap-2 mb-6">
                          <span className="px-3 py-1 bg-white/5 rounded-lg border border-white/10 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                             {userProgress.role} CLASS
                          </span>
                      </div>

                      {/* Radar Chart */}
                      <div className="w-full h-[200px] -ml-4">
                         <ResponsiveContainer width="100%" height="100%">
                            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={skillsData}>
                              <PolarGrid stroke="rgba(255,255,255,0.1)" />
                              <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 'bold' }} />
                              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                              <Radar
                                name="Skills"
                                dataKey="A"
                                stroke={accent}
                                strokeWidth={2}
                                fill={accent}
                                fillOpacity={0.3}
                              />
                            </RadarChart>
                         </ResponsiveContainer>
                      </div>
                  </div>
              </div>
          </div>

          {/* Action Buttons */}
          <div className="px-6 mb-8 grid grid-cols-2 gap-3">
              <button onClick={handleShareProgress} className="bg-white text-black py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-slate-200 active:scale-95 transition-all">
                  <span>🚀</span> SHARE STATUS
              </button>
              <button onClick={() => setViewMode('LEADERBOARD')} className="bg-[#1F2128] border border-white/10 text-white py-4 rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl flex items-center justify-center gap-2 hover:bg-white/5 active:scale-95 transition-all">
                  <span>🏆</span> LEADERBOARD
              </button>
          </div>

          {/* Detailed Stats */}
          <div className="px-6 space-y-4">
              <h3 className="text-slate-500 text-xs font-black uppercase tracking-widest mb-4 ml-2">Service Record</h3>
              
              <div className="grid grid-cols-2 gap-3">
                  <div className="bg-[#1F2128] p-4 rounded-2xl border border-white/5">
                      <div className="text-2xl font-black text-[#6C5DD3] mb-1"><AnimatedCounter value={userProgress.xp} /></div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Total XP Earned</div>
                  </div>
                  <div className="bg-[#1F2128] p-4 rounded-2xl border border-white/5">
                      <div className="text-2xl font-black text-[#00B050] mb-1">{userProgress.completedLessonIds.length}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Missions Complete</div>
                  </div>
                  <div className="bg-[#1F2128] p-4 rounded-2xl border border-white/5">
                      <div className="text-2xl font-black text-[#D4AF37] mb-1">{userProgress.stats.notebookEntries.habits}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Habit Streaks</div>
                  </div>
                  <div className="bg-[#1F2128] p-4 rounded-2xl border border-white/5">
                      <div className="text-2xl font-black text-white mb-1">{userProgress.stats.suggestionsMade}</div>
                      <div className="text-[9px] text-slate-500 font-bold uppercase">Intel Provided</div>
                  </div>
              </div>

              {/* Recruitment Link */}
              <div onClick={onReferral} className="mt-6 bg-gradient-to-r from-[#2B4E99] to-[#1F2128] p-6 rounded-3xl border border-white/10 relative overflow-hidden group cursor-pointer">
                  <div className="relative z-10">
                      <h4 className="text-lg font-black text-white mb-1">Recruit New Spartans</h4>
                      <p className="text-xs text-slate-300 mb-4">Earn 10,000 XP for every soldier you bring to the cause.</p>
                      <span className="bg-white/10 px-3 py-1.5 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white border border-white/20">Copy Referral Link</span>
                  </div>
                  <div className="absolute right-[-20px] bottom-[-20px] text-8xl opacity-10 rotate-12 group-hover:rotate-0 transition-transform">🤝</div>
              </div>
          </div>
      </div>
  );
};
