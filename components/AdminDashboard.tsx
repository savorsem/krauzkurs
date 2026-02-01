
import React, { useState, useEffect } from 'react';
import { AppConfig, Module, UserProgress, CalendarEvent, Lesson, HomeworkType, EventType, ModuleCategory, UserRole } from '../types';
import { Storage } from '../services/storage';
import { DriveSync } from '../services/driveService';
import { Button } from './Button';

interface AdminDashboardProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  modules: Module[];
  onUpdateModules: (newModules: Module[]) => void;
  users: UserProgress[];
  onUpdateUsers: (newUsers: UserProgress[]) => void;
  onUpdateEvents: (newEvents: CalendarEvent[]) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

type AdminTab = 'OVERVIEW' | 'COURSE' | 'USERS' | 'CALENDAR' | 'SETTINGS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  config, onUpdateConfig, modules, onUpdateModules, users, onUpdateUsers, onUpdateEvents, addToast
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.get<CalendarEvent[]>('calendarEvents', []));
  const [userSearch, setUserSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Editors State
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [selectedParentModuleId, setSelectedParentModuleId] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleSync = async () => {
      setIsSyncing(true);
      try {
          // Simulate Drive Sync
          await DriveSync.syncFolder(config.integrations?.googleDriveFolderId || 'mock', []);
          addToast('success', 'Synchronization Complete');
      } catch (e) {
          addToast('error', 'Sync Failed: Check Configuration');
      } finally {
          setIsSyncing(false);
      }
  };

  // 1. Module Actions
  const saveModule = () => {
    if (!editingModule || !editingModule.title) {
        addToast('error', 'Title required');
        return;
    }
    let updatedModules = [...modules];
    if (editingModule.id) {
        updatedModules = updatedModules.map(m => m.id === editingModule.id ? { ...m, ...editingModule } as Module : m);
    } else {
        const newModule: Module = {
            id: `mod_${Date.now()}`,
            title: editingModule.title,
            description: editingModule.description || '',
            minLevel: editingModule.minLevel || 1,
            category: editingModule.category || 'GENERAL',
            imageUrl: editingModule.imageUrl || '',
            videoUrl: editingModule.videoUrl || '',
            pdfUrl: editingModule.pdfUrl || '',
            lessons: []
        };
        updatedModules.push(newModule);
    }
    onUpdateModules(updatedModules);
    setEditingModule(null);
    addToast('success', 'Module Saved');
  };

  const deleteModule = (id: string) => {
      if (confirm('Delete Module?')) {
          onUpdateModules(modules.filter(m => m.id !== id));
          addToast('info', 'Module Deleted');
      }
  };

  // 2. Lesson Actions
  const saveLesson = () => {
      if (!editingLesson || !editingLesson.title || !selectedParentModuleId) {
          addToast('error', 'Title & Module required');
          return;
      }
      const updatedModules = modules.map(mod => {
          if (mod.id !== selectedParentModuleId) return mod;
          let updatedLessons = [...mod.lessons];
          if (editingLesson.id) {
              updatedLessons = updatedLessons.map(l => l.id === editingLesson.id ? { ...l, ...editingLesson } as Lesson : l);
          } else {
              updatedLessons.push({
                  id: `les_${Date.now()}`,
                  title: editingLesson.title,
                  description: editingLesson.description || '',
                  content: editingLesson.content || '',
                  xpReward: editingLesson.xpReward || 100,
                  homeworkType: editingLesson.homeworkType || 'TEXT',
                  homeworkTask: editingLesson.homeworkTask || '',
                  aiGradingInstruction: editingLesson.aiGradingInstruction || ''
              });
          }
          return { ...mod, lessons: updatedLessons };
      });
      onUpdateModules(updatedModules);
      setEditingLesson(null);
      addToast('success', 'Lesson Saved');
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
      if (confirm('Delete Lesson?')) {
        const updatedModules = modules.map(mod => {
            if (mod.id !== moduleId) return mod;
            return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
        });
        onUpdateModules(updatedModules);
        addToast('info', 'Lesson Deleted');
      }
  };

  // 3. User Actions
  const toggleUserRole = (user: UserProgress) => {
      const roles: UserRole[] = ['STUDENT', 'CURATOR', 'ADMIN'];
      const nextIndex = (roles.indexOf(user.role) + 1) % roles.length;
      const nextRole = roles[nextIndex];
      const updatedUsers = users.map(u => u.name === user.name ? { ...u, role: nextRole } : u);
      onUpdateUsers(updatedUsers);
      addToast('info', `User role updated to ${nextRole}`);
  };

  const resetUserProgress = (user: UserProgress) => {
      if (confirm(`Reset progress for ${user.name}?`)) {
          const updatedUsers = users.map(u => u.name === user.name ? { ...u, xp: 0, level: 1, completedLessonIds: [] } : u);
          onUpdateUsers(updatedUsers);
          addToast('success', 'Progress Reset');
      }
  };

  // 4. Event Actions
  const handleSaveEvent = () => {
      if (!editingEvent || !editingEvent.title) {
          addToast('error', 'Event title required');
          return;
      }
      const currentEvents = Storage.get<CalendarEvent[]>('calendarEvents', []);
      let updatedEvents = [...currentEvents];
      if (editingEvent.id) {
          updatedEvents = updatedEvents.map(e => e.id === editingEvent.id ? { ...e, ...editingEvent } as CalendarEvent : e);
      } else {
          updatedEvents.push({
              id: `evt_${Date.now()}`,
              title: editingEvent.title,
              description: editingEvent.description || '',
              date: editingEvent.date || new Date().toISOString(),
              type: editingEvent.type || EventType.WEBINAR,
              durationMinutes: editingEvent.durationMinutes || 60
          });
      }
      setEvents(updatedEvents);
      onUpdateEvents(updatedEvents);
      setEditingEvent(null);
      addToast('success', 'Event Saved');
  };

  const deleteEvent = (id: string) => {
      if(confirm('Delete Event?')) {
        const currentEvents = Storage.get<CalendarEvent[]>('calendarEvents', []);
        const updated = currentEvents.filter(e => e.id !== id);
        setEvents(updated);
        onUpdateEvents(updated);
        addToast('info', 'Event Deleted');
      }
  };

  // --- RENDERERS ---

  const renderHeader = () => (
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#1F2128] p-6 rounded-[2rem] border border-white/5">
          <div>
              <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                  COMMAND CENTER <span className="text-[#6C5DD3] text-sm align-top">v4.0</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Admin Control Panel</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2 px-4 py-2 bg-black/20 rounded-full border border-white/5">
                  <div className={`w-2 h-2 rounded-full ${config.features?.enableRealTimeSync ? 'bg-green-500 animate-pulse' : 'bg-slate-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{config.features?.enableRealTimeSync ? 'LIVE SYNC' : 'OFFLINE'}</span>
              </div>
              <Button 
                onClick={handleSync} 
                loading={isSyncing}
                variant="primary"
                className="!py-2 !px-6 !text-xs !rounded-xl"
              >
                  {isSyncing ? 'SYNCING...' : 'SYNC DATA'}
              </Button>
          </div>
      </header>
  );

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Total Users', val: users.length, diff: '+12%', color: 'text-white' },
                { label: 'Active Missions', val: modules.reduce((a, b) => a + b.lessons.length, 0), diff: 'Stable', color: 'text-[#6C5DD3]' },
                { label: 'Scheduled Events', val: events.length, diff: '+2 New', color: 'text-[#D4AF37]' },
                { label: 'System Health', val: '98%', diff: 'Optimal', color: 'text-green-500' },
            ].map((stat, i) => (
                <div key={i} className="bg-[#1F2128] p-5 rounded-[1.5rem] border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">{stat.label}</p>
                    <div className="flex items-end justify-between">
                        <span className={`text-3xl font-black ${stat.color}`}>{stat.val}</span>
                        <span className="text-[9px] font-bold bg-white/5 px-2 py-1 rounded text-slate-400">{stat.diff}</span>
                    </div>
                </div>
            ))}
        </div>

        {/* Activity Feed */}
        <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5">
             <div className="flex justify-between items-center mb-6">
                <h3 className="text-white font-black text-lg">System Logs</h3>
                <button className="text-xs font-bold text-[#6C5DD3] hover:text-white transition-colors">View All</button>
             </div>
             <div className="space-y-2">
                 {[1,2,3].map((_, i) => (
                     <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5 last:border-0">
                         <div className="w-2 h-2 rounded-full bg-[#6C5DD3]"></div>
                         <div className="flex-1">
                             <p className="text-slate-300 text-sm font-medium"><span className="text-white font-bold">System</span> auto-synced {3 + i} files.</p>
                             <p className="text-slate-600 text-[10px]">{i * 12 + 5} mins ago</p>
                         </div>
                     </div>
                 ))}
             </div>
        </div>
    </div>
  );

  const renderUsers = () => {
      const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()));

      return (
        <div className="space-y-4 animate-fade-in">
            {/* Search Bar */}
            <div className="bg-[#1F2128] p-3 rounded-2xl border border-white/5 flex items-center gap-3">
                <svg className="w-5 h-5 text-slate-500 ml-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                <input 
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search operatives..."
                    className="bg-transparent w-full text-white outline-none placeholder:text-slate-600 font-bold text-sm"
                />
            </div>

            {/* User List - Mobile Card / Desktop Table */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredUsers.map((u, i) => (
                    <div key={i} className="bg-[#1F2128] p-5 rounded-[1.5rem] border border-white/5 hover:border-[#6C5DD3]/50 transition-all group">
                        <div className="flex items-center gap-4 mb-4">
                            <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} className="w-12 h-12 rounded-full object-cover bg-slate-700 ring-2 ring-white/5" />
                            <div>
                                <p className="text-white font-bold text-sm">{u.name}</p>
                                <p className="text-[#6C5DD3] text-[10px] font-bold uppercase tracking-wide">{u.role}</p>
                            </div>
                            <div className="ml-auto flex flex-col items-end">
                                <span className="text-white font-black text-lg">{u.level}</span>
                                <span className="text-slate-500 text-[9px] uppercase">Lvl</span>
                            </div>
                        </div>
                        
                        <div className="flex gap-2 mt-4 pt-4 border-t border-white/5">
                            <button onClick={() => toggleUserRole(u)} className="flex-1 py-2 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
                                Change Role
                            </button>
                            <button onClick={() => resetUserProgress(u)} className="px-3 py-2 text-[10px] font-bold uppercase bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                                Reset
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  };

  const renderCourses = () => {
    // Lesson Editor
    if (editingLesson) {
        return (
            <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 animate-slide-in space-y-4">
                 <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-white font-black text-xl">{editingLesson.id ? 'Edit Mission' : 'New Mission'}</h3>
                    <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase">Close</button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Mission Title</label>
                        <input value={editingLesson.title || ''} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} placeholder="Lesson Title" className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-bold" />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Briefing (Content)</label>
                        <textarea value={editingLesson.content || ''} onChange={e => setEditingLesson({...editingLesson, content: e.target.value})} placeholder="Markdown supported..." rows={6} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-medium text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Report Type</label>
                            <select value={editingLesson.homeworkType || 'TEXT'} onChange={e => setEditingLesson({...editingLesson, homeworkType: e.target.value as any})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none text-sm font-bold appearance-none">
                                <option value="TEXT">Text Report</option>
                                <option value="PHOTO">Photo Proof</option>
                                <option value="VIDEO">Video Log</option>
                                <option value="FILE">File Attachment</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">XP Reward</label>
                            <input type="number" value={editingLesson.xpReward || 100} onChange={e => setEditingLesson({...editingLesson, xpReward: parseInt(e.target.value)})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Task Description</label>
                         <input value={editingLesson.homeworkTask || ''} onChange={e => setEditingLesson({...editingLesson, homeworkTask: e.target.value})} placeholder="What should the recruit do?" className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none text-sm" />
                    </div>

                    <div className="p-4 rounded-xl bg-[#6C5DD3]/10 border border-[#6C5DD3]/20">
                         <label className="text-[#6C5DD3] text-[10px] font-black uppercase mb-2 block">AI Grading Protocol (Hidden)</label>
                         <textarea value={editingLesson.aiGradingInstruction || ''} onChange={e => setEditingLesson({...editingLesson, aiGradingInstruction: e.target.value})} placeholder="Instructions for the AI Commander..." rows={3} className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/5 text-sm" />
                    </div>

                    <button onClick={saveLesson} className="w-full bg-[#6C5DD3] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#6C5DD3]/20 hover:scale-[1.02] transition-transform">Save Mission</button>
                </div>
            </div>
        );
    }

    // Module Editor
    if (editingModule) {
        return (
            <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 animate-slide-in space-y-4">
                 <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-white font-black text-xl">{editingModule.id ? 'Edit Module' : 'New Module'}</h3>
                    <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase">Close</button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Module Title</label>
                        <input value={editingModule.title || ''} onChange={e => setEditingModule({...editingModule, title: e.target.value})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Description</label>
                        <textarea value={editingModule.description || ''} onChange={e => setEditingModule({...editingModule, description: e.target.value})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Category</label>
                             <select value={editingModule.category || 'GENERAL'} onChange={e => setEditingModule({...editingModule, category: e.target.value as ModuleCategory})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none font-bold">
                                <option value="GENERAL">General</option>
                                <option value="SALES">Sales</option>
                                <option value="PSYCHOLOGY">Psychology</option>
                                <option value="TACTICS">Tactics</option>
                             </select>
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Min Level</label>
                             <input type="number" value={editingModule.minLevel || 1} onChange={e => setEditingModule({...editingModule, minLevel: parseInt(e.target.value)})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none font-bold" />
                         </div>
                    </div>
                    <button onClick={saveModule} className="w-full bg-[#6C5DD3] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Save Module</button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={() => setEditingModule({})} className="w-full py-4 bg-[#6C5DD3]/10 text-[#6C5DD3] border border-[#6C5DD3]/20 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#6C5DD3] hover:text-white transition-all flex items-center justify-center gap-2">
                <span>+</span> Create Module
            </button>

            {modules.map(mod => (
                <div key={mod.id} className="bg-[#1F2128] rounded-[2rem] border border-white/5 overflow-hidden group">
                    <div className="p-5 flex justify-between items-center border-b border-white/5 bg-white/5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-[#1A1A1A] flex items-center justify-center text-xl border border-white/10 shadow-inner">
                                {mod.category === 'SALES' ? '💰' : mod.category === 'TACTICS' ? '⚔️' : mod.category === 'PSYCHOLOGY' ? '🧠' : '🎓'}
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg">{mod.title}</h4>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">{mod.lessons.length} Missions • Level {mod.minLevel}+</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setEditingModule(mod)} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-bold uppercase transition-colors">Edit</button>
                             <button onClick={() => deleteModule(mod.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase transition-colors">Del</button>
                        </div>
                    </div>
                    <div className="p-3 space-y-2">
                        {mod.lessons.map(les => (
                            <div key={les.id} className="p-3 pl-4 rounded-xl bg-black/20 hover:bg-black/40 flex justify-between items-center group/lesson cursor-pointer border border-white/5">
                                <div className="flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-600 group-hover/lesson:bg-[#6C5DD3] transition-colors"></div>
                                    <span className="text-slate-300 text-sm font-medium">{les.title}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover/lesson:opacity-100 transition-opacity">
                                    <button onClick={() => { setSelectedParentModuleId(mod.id); setEditingLesson(les); }} className="text-[10px] font-black text-[#6C5DD3] uppercase bg-[#6C5DD3]/10 px-2 py-1 rounded">Edit</button>
                                    <button onClick={() => deleteLesson(mod.id, les.id)} className="text-[10px] font-black text-red-500 uppercase bg-red-500/10 px-2 py-1 rounded">Del</button>
                                </div>
                            </div>
                        ))}
                        <button onClick={() => { setSelectedParentModuleId(mod.id); setEditingLesson({}); }} className="w-full py-3 text-slate-500 text-[10px] font-black uppercase hover:bg-white/5 rounded-xl transition-colors border border-dashed border-white/10 hover:border-white/20 hover:text-slate-300">
                            + Add Mission
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const renderSettings = () => (
      <div className="space-y-6 animate-fade-in">
          {/* Main App Settings */}
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-[#6C5DD3]">⚙️</span> General Configuration
              </h3>
              
              <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] font-black uppercase mb-1 block">Application Name</label>
                  <input value={config.appName} onChange={e => onUpdateConfig({...config, appName: e.target.value})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-bold" />
              </div>
              <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] font-black uppercase mb-1 block">System Prompt (AI Commander)</label>
                  <textarea rows={5} value={config.systemInstruction} onChange={e => onUpdateConfig({...config, systemInstruction: e.target.value})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 outline-none text-xs font-mono leading-relaxed" />
              </div>
          </div>

          {/* Features & Permissions */}
           <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-blue-500">🛡️</span> Protocols & Permissions
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                      { key: 'enableRealTimeSync', label: 'Real-Time Sync' },
                      { key: 'autoApproveHomework', label: 'Auto-Approve Homework' },
                      { key: 'maintenanceMode', label: 'Maintenance Mode' },
                      { key: 'allowStudentChat', label: 'Allow Student Chat' },
                      { key: 'publicLeaderboard', label: 'Public Leaderboard' },
                  ].map(feature => (
                       <div key={feature.key} className="flex items-center justify-between p-3 bg-black/20 rounded-xl border border-white/5">
                           <span className="text-slate-300 text-xs font-bold">{feature.label}</span>
                           <button 
                             onClick={() => onUpdateConfig({
                                 ...config, 
                                 features: {
                                     ...config.features,
                                     [feature.key]: !config.features?.[feature.key as keyof typeof config.features]
                                 }
                             } as AppConfig)}
                             className={`w-10 h-6 rounded-full p-1 transition-all ${config.features?.[feature.key as keyof typeof config.features] ? 'bg-[#6C5DD3]' : 'bg-slate-700'}`}
                           >
                               <div className={`w-4 h-4 rounded-full bg-white shadow-sm transition-transform ${config.features?.[feature.key as keyof typeof config.features] ? 'translate-x-4' : 'translate-x-0'}`} />
                           </button>
                       </div>
                  ))}
              </div>
          </div>

          {/* Integrations Section */}
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4">
               <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-green-500">🔌</span> Integrations
              </h3>
              
              <div className="space-y-3">
                  <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${config.integrations?.telegramBotToken ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <input 
                        type="password"
                        placeholder="Telegram Bot Token" 
                        value={config.integrations?.telegramBotToken || ''} 
                        onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, telegramBotToken: e.target.value}})}
                        className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-700 font-mono" 
                      />
                  </div>

                  <div className="p-3 bg-black/20 rounded-xl border border-white/5 flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full ${config.integrations?.googleDriveFolderId ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <input 
                        placeholder="Google Drive Folder ID" 
                        value={config.integrations?.googleDriveFolderId || ''} 
                        onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, googleDriveFolderId: e.target.value}})}
                        className="w-full bg-transparent text-white text-xs outline-none placeholder:text-slate-700 font-mono" 
                      />
                  </div>
              </div>
          </div>
          
          <button 
             onClick={() => { if(confirm('⚠️ FULL RESET?')) { Storage.clear(); window.location.reload(); } }} 
             className="w-full py-4 border border-red-500/30 text-red-500 rounded-[1.5rem] font-bold uppercase hover:bg-red-500/10 transition-colors text-xs tracking-widest"
          >
              FACTORY RESET SYSTEM
          </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] pb-32 flex flex-col md:flex-row">
       {/* Sidebar / Topbar */}
       <div className="md:w-20 lg:w-64 bg-[#1F2128] border-r border-white/5 p-4 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible sticky top-0 z-30 shadow-2xl">
          <div className="hidden lg:block mb-8 px-4 mt-4">
              <h1 className="text-white font-black text-xl tracking-tighter">CMD</h1>
          </div>
          
          {[
              { id: 'OVERVIEW', label: 'Home', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg> },
              { id: 'COURSE', label: 'Course', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg> },
              { id: 'USERS', label: 'Users', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg> },
              { id: 'CALENDAR', label: 'Events', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
              { id: 'SETTINGS', label: 'Config', icon: <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg> }
          ].map(item => (
              <button 
                key={item.id}
                onClick={() => setActiveTab(item.id as AdminTab)}
                className={`flex items-center gap-3 px-3 lg:px-4 py-3 rounded-xl transition-all whitespace-nowrap justify-center lg:justify-start
                    ${activeTab === item.id ? 'bg-[#6C5DD3] text-white shadow-lg shadow-[#6C5DD3]/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}
                `}
                title={item.label}
              >
                  {item.icon}
                  <span className="text-xs font-bold uppercase tracking-wide hidden lg:block">{item.label}</span>
              </button>
          ))}
       </div>

       {/* Content Area */}
       <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
           {renderHeader()}

           {activeTab === 'OVERVIEW' && renderOverview()}
           {activeTab === 'USERS' && renderUsers()}
           {activeTab === 'COURSE' && renderCourses()}
           {activeTab === 'SETTINGS' && renderSettings()}
           
           {activeTab === 'CALENDAR' && (
               <div className="space-y-4 animate-fade-in">
                   <button onClick={() => setEditingEvent({})} className="w-full py-4 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-xl font-bold uppercase hover:bg-[#6C5DD3] hover:text-white transition-all">+ Add Event</button>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                       {events.map(evt => (
                           <div key={evt.id} className="bg-[#1F2128] p-5 rounded-2xl border border-white/5 flex justify-between items-center group hover:border-[#6C5DD3]/30 transition-colors">
                               <div>
                                   <h4 className="text-white font-bold">{evt.title}</h4>
                                   <p className="text-slate-500 text-xs font-medium mt-1">{new Date(evt.date as string).toLocaleDateString()} • {evt.type}</p>
                               </div>
                               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                   <button onClick={() => setEditingEvent(evt)} className="text-slate-400 hover:text-white text-[10px] font-black uppercase bg-white/5 px-2 py-1 rounded">Edit</button>
                                   <button onClick={() => deleteEvent(evt.id)} className="text-red-500 hover:text-red-400 text-[10px] font-black uppercase bg-red-500/10 px-2 py-1 rounded">Del</button>
                               </div>
                           </div>
                       ))}
                   </div>
                   {editingEvent && (
                       <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                           <div className="bg-[#1F2128] p-6 rounded-[2rem] w-full max-w-sm space-y-4 border border-white/10 shadow-2xl">
                               <h3 className="text-white font-black text-xl">Event Details</h3>
                               <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Title</label>
                                    <input value={editingEvent.title || ''} onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 outline-none font-bold" />
                               </div>
                               <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Type</label>
                                    <select value={editingEvent.type || EventType.WEBINAR} onChange={e => setEditingEvent({...editingEvent, type: e.target.value as EventType})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 outline-none font-bold">
                                        <option value={EventType.WEBINAR}>Webinar</option>
                                        <option value={EventType.HOMEWORK}>Deadline</option>
                                        <option value={EventType.OTHER}>Other</option>
                                    </select>
                               </div>
                               <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Date & Time</label>
                                    <input type="datetime-local" value={editingEvent.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ''} onChange={e => setEditingEvent({...editingEvent, date: new Date(e.target.value).toISOString()})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 outline-none" />
                               </div>
                               <div className="flex gap-2 pt-4">
                                   <button onClick={() => setEditingEvent(null)} className="flex-1 py-3 text-slate-400 font-bold bg-white/5 rounded-xl hover:bg-white/10">Cancel</button>
                                   <button onClick={handleSaveEvent} className="flex-1 py-3 text-white font-bold bg-[#6C5DD3] rounded-xl shadow-lg shadow-[#6C5DD3]/20">Save</button>
                               </div>
                           </div>
                       </div>
                   )}
               </div>
           )}
       </div>
    </div>
  );
};
