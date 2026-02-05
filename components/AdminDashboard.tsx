import React, { useState, useEffect } from 'react';
import { AppConfig, Module, UserProgress, CalendarEvent, Lesson, AdminTab, ModuleCategory } from '../types';
import { Button } from './Button';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface AdminDashboardProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  modules: Module[];
  onUpdateModules: (newModules: Module[]) => void;
  users: UserProgress[];
  onUpdateUsers: (newUsers: UserProgress[]) => void;
  events: CalendarEvent[];
  onUpdateEvents: (newEvents: CalendarEvent[]) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  activeTab: AdminTab;
  moduleToEdit?: Module | null;
  onClearModuleToEdit?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  config, onUpdateConfig, modules, onUpdateModules, users, onUpdateUsers, activeTab, addToast, moduleToEdit, onClearModuleToEdit
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Partial<Module>>({});

  useEffect(() => {
    if (moduleToEdit) {
        setEditingModule(moduleToEdit);
        setIsEditModalOpen(true);
    }
  }, [moduleToEdit]);

  const handleCloseModal = () => {
      setIsEditModalOpen(false);
      setEditingModule({});
      if (onClearModuleToEdit) onClearModuleToEdit();
  };

  const handleSaveModule = () => {
      if (!editingModule.title || !editingModule.id) {
          addToast('error', 'Title and ID are required');
          return;
      }

      const newModule = editingModule as Module;
      const exists = modules.find(m => m.id === newModule.id);

      if (exists) {
          onUpdateModules(modules.map(m => m.id === newModule.id ? newModule : m));
          addToast('success', 'Module updated');
      } else {
          onUpdateModules([...modules, newModule]);
          addToast('success', 'Module created');
      }
      handleCloseModal();
  };
  
  // --- SUB-COMPONENTS ---
  
  const StatCard: React.FC<{ title: string; value: string | number; icon: string; color: string }> = ({ title, value, icon, color }) => (
      <div className={`bg-[#1F2128] p-5 rounded-[1.5rem] border border-white/5 relative overflow-hidden group`}>
          <div className={`absolute top-0 right-0 p-4 opacity-5 text-4xl group-hover:scale-110 transition-transform ${color}`}>{icon}</div>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-1">{title}</p>
          <h3 className="text-2xl font-black text-white">{value}</h3>
          <div className={`absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-${color.replace('text-', '')} to-transparent opacity-50`}></div>
      </div>
  );

  const UserRow: React.FC<{ user: UserProgress }> = ({ user }) => (
      <div className="flex items-center justify-between p-4 bg-[#1F2128] rounded-2xl border border-white/5 mb-2 hover:border-[#6C5DD3]/30 transition-all">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden">
                  <img src={user.avatarUrl} className="w-full h-full object-cover" />
              </div>
              <div>
                  <h4 className="text-white font-bold text-sm">{user.name}</h4>
                  <p className="text-slate-500 text-[10px]">@{user.telegramUsername}</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
               <div className="text-right">
                   <p className="text-white font-bold text-xs">{user.xp} XP</p>
                   <p className="text-[#D4AF37] text-[9px] font-black">LVL {user.level}</p>
               </div>
               <div className={`px-2 py-1 rounded text-[9px] font-black uppercase ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-400' : 'bg-blue-500/20 text-blue-400'}`}>
                   {user.role}
               </div>
               <button 
                  onClick={() => {
                      const updated = users.map(u => u.telegramUsername === user.telegramUsername ? { ...u, isBanned: !u.isBanned } : u);
                      onUpdateUsers(updated);
                      addToast(user.isBanned ? 'success' : 'info', user.isBanned ? 'Разблокирован' : 'Заблокирован');
                  }}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${user.isBanned ? 'bg-green-500/20 text-green-400' : 'bg-red-500/10 text-red-500 hover:bg-red-500/20'}`}
               >
                   {user.isBanned ? '🔓' : '🚫'}
               </button>
          </div>
      </div>
  );

  const ModuleCard: React.FC<{ module: Module }> = ({ module }) => (
      <div className="bg-[#1F2128] rounded-[2rem] overflow-hidden border border-white/5 hover:border-white/20 transition-all group">
          <div className="h-32 bg-slate-800 relative">
              <img src={module.imageUrl} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg">
                  <span className="text-[9px] font-black text-white uppercase">{module.category}</span>
              </div>
          </div>
          <div className="p-5">
              <h3 className="text-white font-bold text-sm mb-1">{module.title}</h3>
              <p className="text-slate-500 text-xs line-clamp-2 mb-4">{module.description}</p>
              <div className="flex justify-between items-center">
                  <span className="text-slate-400 text-xs font-bold">{module.lessons.length} уроков</span>
                  <div className="flex gap-2">
                       <button 
                            onClick={() => {
                                setEditingModule(module);
                                setIsEditModalOpen(true);
                            }}
                            className="text-[10px] font-bold bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg text-white transition-colors"
                        >
                            EDIT
                       </button>
                       <button 
                            onClick={() => {
                                if(confirm('Удалить?')) {
                                    onUpdateModules(modules.filter(m => m.id !== module.id));
                                }
                            }}
                            className="text-[10px] font-bold bg-red-500/10 hover:bg-red-500/20 px-3 py-1.5 rounded-lg text-red-400 transition-colors"
                        >
                            DEL
                        </button>
                  </div>
              </div>
          </div>
      </div>
  );

  // --- TAB CONTENT ---

  const renderOverview = () => (
      <div className="space-y-6 pb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <StatCard title="Active Users" value={users.length} icon="👥" color="text-blue-500" />
              <StatCard title="Total XP" value={users.reduce((acc, u) => acc + u.xp, 0).toLocaleString()} icon="⚡" color="text-yellow-500" />
              <StatCard title="Modules" value={modules.length} icon="📚" color="text-purple-500" />
              <StatCard title="System" value="Stable" icon="🟢" color="text-green-500" />
          </div>

          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 h-[300px]">
              <h3 className="text-white font-bold mb-4">Activity Pulse</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={[{name: 'Mon', val: 10}, {name: 'Tue', val: 30}, {name: 'Wed', val: 20}, {name: 'Thu', val: 50}, {name: 'Fri', val: 40}, {name: 'Sat', val: 70}, {name: 'Sun', val: 60}]}>
                      <defs>
                          <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C5DD3" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6C5DD3" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#555" fontSize={10} tickLine={false} />
                      <YAxis stroke="#555" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2128', borderColor: '#333', borderRadius: '10px' }} />
                      <Area type="monotone" dataKey="val" stroke="#6C5DD3" fillOpacity={1} fill="url(#colorVal)" />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>
  );

  const renderUsers = () => (
      <div className="space-y-4 pb-32">
          <div className="flex gap-2 mb-4">
              <input 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                placeholder="Поиск по базе..." 
                className="flex-1 bg-[#1F2128] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-[#6C5DD3] outline-none"
              />
          </div>
          {users.filter(u => u.name.toLowerCase().includes(searchTerm.toLowerCase())).map(u => (
              <UserRow key={u.telegramUsername || u.name} user={u} />
          ))}
      </div>
  );

  const renderCourse = () => (
      <div className="pb-32">
           <div className="flex justify-between items-center mb-6">
               <h2 className="text-xl font-black text-white">Modules Repository</h2>
               <Button 
                   className="!py-2 !px-4 text-xs !rounded-xl" 
                   onClick={() => {
                       setEditingModule({ 
                           id: `m${Date.now()}`, 
                           title: '', 
                           description: '', 
                           lessons: [], 
                           category: 'GENERAL',
                           minLevel: 1,
                           prerequisites: []
                       });
                       setIsEditModalOpen(true);
                   }}
               >
                   + New Module
               </Button>
           </div>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               {modules.map(m => <ModuleCard key={m.id} module={m} />)}
           </div>
      </div>
  );

  const renderSettings = () => (
      <div className="bg-[#1F2128] p-8 rounded-[2rem] border border-white/5 pb-32">
          <h2 className="text-xl font-black text-white mb-6">System Configuration</h2>
          <div className="space-y-6">
              <div>
                  <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">System Instruction (AI Prompt)</label>
                  <textarea 
                    value={config.systemInstruction}
                    onChange={e => onUpdateConfig({...config, systemInstruction: e.target.value})}
                    className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm h-32 outline-none focus:border-[#6C5DD3]"
                  />
              </div>
              <div>
                   <label className="text-[10px] uppercase font-bold text-slate-500 mb-2 block">Theme Accent</label>
                   <input 
                      type="color"
                      value={config.theme.accentColor}
                      onChange={e => onUpdateConfig({...config, theme: {...config.theme, accentColor: e.target.value}})}
                      className="w-full h-10 rounded-xl bg-transparent cursor-pointer"
                   />
              </div>
          </div>
      </div>
  );

  const EditModal = () => (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={handleCloseModal}></div>
          <div className="bg-[#1F2128] w-full max-w-lg rounded-[2.5rem] p-6 relative z-10 border border-white/10 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto custom-scrollbar">
              <h2 className="text-2xl font-black text-white mb-6">
                  {editingModule.id ? 'EDIT MODULE' : 'CREATE MODULE'}
              </h2>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Title</label>
                      <input 
                        value={editingModule.title || ''}
                        onChange={e => setEditingModule({...editingModule, title: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#6C5DD3]"
                        placeholder="Module Title"
                      />
                  </div>
                  <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Description</label>
                      <textarea 
                        value={editingModule.description || ''}
                        onChange={e => setEditingModule({...editingModule, description: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm h-24 outline-none focus:border-[#6C5DD3]"
                        placeholder="Description"
                      />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Category</label>
                          <select 
                            value={editingModule.category || 'GENERAL'}
                            onChange={e => setEditingModule({...editingModule, category: e.target.value as ModuleCategory})}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#6C5DD3]"
                          >
                              <option value="GENERAL">General</option>
                              <option value="SALES">Sales</option>
                              <option value="PSYCHOLOGY">Psychology</option>
                              <option value="TACTICS">Tactics</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Min Level</label>
                          <input 
                            type="number"
                            value={editingModule.minLevel || 1}
                            onChange={e => setEditingModule({...editingModule, minLevel: parseInt(e.target.value)})}
                            className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#6C5DD3]"
                          />
                      </div>
                  </div>
                  <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Image URL</label>
                      <input 
                        value={editingModule.imageUrl || ''}
                        onChange={e => setEditingModule({...editingModule, imageUrl: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#6C5DD3]"
                        placeholder="https://..."
                      />
                  </div>
                  <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Video URL (Optional)</label>
                      <input 
                        value={editingModule.videoUrl || ''}
                        onChange={e => setEditingModule({...editingModule, videoUrl: e.target.value})}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white text-sm outline-none focus:border-[#6C5DD3]"
                        placeholder="https://youtube.com/..."
                      />
                  </div>
                  
                  <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                      <h4 className="text-white font-bold text-sm mb-2">Lessons ({editingModule.lessons?.length || 0})</h4>
                      <p className="text-slate-500 text-[10px]">Lesson editing is currently limited to JSON import/export in this version.</p>
                  </div>
              </div>

              <div className="flex gap-3 mt-8">
                  <button onClick={handleCloseModal} className="flex-1 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold hover:bg-white/10 transition-colors">CANCEL</button>
                  <Button onClick={handleSaveModule} className="flex-1 !rounded-2xl !py-4">SAVE CHANGES</Button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="p-6 pt-12 min-h-screen bg-[#0F1115]">
        <div className="mb-8 flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-2xl font-black text-white tracking-widest">COMMAND CENTER</h1>
        </div>
        
        {activeTab === 'OVERVIEW' && renderOverview()}
        {activeTab === 'USERS' && renderUsers()}
        {activeTab === 'COURSE' && renderCourse()}
        {activeTab === 'SETTINGS' && renderSettings()}
        
        {isEditModalOpen && <EditModal />}
    </div>
  );
};
