import React, { useState } from 'react';
import { UserProgress, CalendarEvent, ThemeConfig, NotificationSettings, ShopItem, NewsItem } from '../types';
import { telegram } from '../services/telegramService';
import { Button } from './Button';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';

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
  onClose?: () => void;
}

const WEEKLY_DATA = [
    { day: 'Mon', lessons: 39, color: '#FF9A62' },
    { day: 'Tue', lessons: 14, color: '#FF9A62' },
    { day: 'Wed', lessons: 48, color: '#6C5DD3' },
    { day: 'Thr', lessons: 32, color: '#FF9A62' },
    { day: 'Fri', lessons: 22, color: '#FF9A62' },
];

export const Profile: React.FC<ProfileProps> = ({ 
    userProgress, 
    onLogout, 
    onUpdateUser, 
    onClose,
}) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SETTINGS' | 'SHOP'>('NONE');

  return (
    <div className="min-h-screen bg-[#FDF3E7] text-[#1F2128] pb-40 animate-fade-in relative font-sans overflow-hidden">
      
      {/* HEADER BAR */}
      <div className="px-6 pt-8 pb-4 flex justify-between items-center bg-white rounded-b-[3rem] shadow-sm mb-6">
          <h1 className="text-3xl font-black">Progress</h1>
          <button onClick={() => setActiveModal('SETTINGS')} className="w-12 h-12 rounded-full bg-[#FDF3E7] flex items-center justify-center text-xl border border-black/5">
              ⚙️
          </button>
      </div>

      {/* STATS OVERVIEW */}
      <div className="bg-white mx-6 p-8 rounded-[3rem] border border-black/5 shadow-sm mb-6 relative overflow-hidden">
          <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-[#1F2128] flex items-center justify-center text-white text-xl">
                      📊
                  </div>
                  <div>
                      <h3 className="text-xl font-black">Current Level</h3>
                      <p className="text-[11px] font-bold text-[#6B6D7B]">Elite Spartan Status</p>
                  </div>
              </div>
              <div className="text-3xl font-black text-[#6C5DD3]">{userProgress.level}</div>
          </div>

          <div className="grid grid-cols-2 gap-8 border-t border-black/5 pt-6">
              <div>
                  <h4 className="text-[11px] font-bold text-[#6B6D7B] uppercase tracking-widest mb-1">{userProgress.completedLessonIds.length} Lessons</h4>
                  <div className="text-2xl font-black">48 lessons</div>
              </div>
              <div>
                  <h4 className="text-[11px] font-bold text-[#6B6D7B] uppercase tracking-widest mb-1">{userProgress.xp / 10} Hours</h4>
                  <div className="text-2xl font-black">12 hours</div>
              </div>
          </div>
      </div>

      {/* CHART SECTION */}
      <div className="bg-white mx-6 p-8 rounded-[3rem] border border-black/5 shadow-sm mb-6">
          <div className="flex justify-between items-center mb-8">
              <h3 className="text-sm font-black uppercase tracking-tight">Weekly Activity</h3>
              <div className="flex gap-2">
                  <span className="px-3 py-1 bg-[#1F2128] text-white text-[9px] font-bold rounded-full">Weekly</span>
                  <span className="px-3 py-1 bg-[#FDF3E7] text-[#6B6D7B] text-[9px] font-bold rounded-full">Month</span>
              </div>
          </div>

          <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={WEEKLY_DATA}>
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#6B6D7B' }} />
                      <Tooltip cursor={{ fill: 'transparent' }} content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                              return (
                                  <div className="bg-[#1F2128] text-white p-2 rounded-xl text-[10px] font-bold shadow-xl">
                                      {payload[0].value} lessons
                                  </div>
                              );
                          }
                          return null;
                      }} />
                      <Bar dataKey="lessons" radius={[10, 10, 10, 10]} barSize={24}>
                          {WEEKLY_DATA.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                      </Bar>
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* RATING SECTION */}
      <div className="bg-white mx-6 p-6 rounded-[2.5rem] border border-black/5 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#FFD700] flex items-center justify-center text-xl shadow-lg shadow-[#FFD700]/20">
                  ⭐
              </div>
              <div>
                  <h4 className="text-sm font-black">Rating of students</h4>
                  <p className="text-[10px] font-bold text-[#6B6D7B]">10 best students</p>
              </div>
          </div>
          <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden">
                      <img src={`https://picsum.photos/40/40?random=${i}`} className="w-full h-full object-cover" />
                  </div>
              ))}
          </div>
      </div>

      {/* SETTINGS MODAL */}
      {activeModal === 'SETTINGS' && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 animate-fade-in">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setActiveModal('NONE')}></div>
              <div className="bg-white w-full max-w-sm rounded-[3rem] p-8 relative z-10 shadow-2xl">
                  <h2 className="text-2xl font-black mb-6">Profile Settings</h2>
                  <div className="space-y-4 mb-8">
                      <button className="w-full py-4 bg-[#FDF3E7] rounded-2xl text-left px-6 font-bold flex justify-between items-center">
                          <span>Edit Info</span>
                          <span>→</span>
                      </button>
                      <button className="w-full py-4 bg-[#FDF3E7] rounded-2xl text-left px-6 font-bold flex justify-between items-center">
                          <span>Notifications</span>
                          <span className="text-[#6C5DD3]">ON</span>
                      </button>
                  </div>
                  <Button fullWidth onClick={onLogout} variant="danger" className="!rounded-2xl">LOGOUT</Button>
              </div>
          </div>
      )}

    </div>
  );
};