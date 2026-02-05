
import React, { useState } from 'react';
import { AppConfig, Module, UserProgress, CalendarEvent, Lesson, EventType, ModuleCategory, UserRole, AdminTab } from '../types';
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
}

// --- HELPERS ---
const createEmptyModule = (): Module => ({
    id: Date.now().toString(),
    title: 'Новый Модуль',
    description: '',
    minLevel: 1,
    category: 'GENERAL',
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop',
    lessons: [],
    prerequisites: [],
    isHidden: true
});

const createEmptyLesson = (): Lesson => ({
    id: Date.now().toString(),
    title: 'Новый Урок',
    description: '',
    content: '',
    xpReward: 100,
    homeworkType: 'TEXT',
    homeworkTask: '',
    aiGradingInstruction: '',
    difficulty: 'Easy'
});

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  config, onUpdateConfig, modules, onUpdateModules, users, onUpdateUsers, events, onUpdateEvents, addToast, activeTab
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  
  // Editor State
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [editingLesson, setEditingLesson] = useState<{ lesson: Lesson, moduleId: string } | null>(null);

  // --- ANALYTICS MOCK ---
  const analyticsData = Array.from({ length: 7 }, (_, i) => {
      const d = new Date(); d.setDate(d.getDate() - (6 - i));
      return {
          name: d.toLocaleDateString('ru-RU', { weekday: 'short' }),
          xp: Math.floor(Math.random() * 5000) + 1000,
          active: Math.floor(Math.random() * users.length)
      };
  });

  // --- USER ACTIONS ---
  const handleUpdateUserStats = (user: UserProgress, updates: Partial<UserProgress>) => {
      const updatedUser = { ...user, ...updates };
      const newUsers = users.map(u => u.telegramUsername === user.telegramUsername ? updatedUser : u);
      onUpdateUsers(newUsers);
      setSelectedUser(updatedUser);
      addToast('success', 'Досье бойца обновлено');
  };

  const handleManualXp = (amount: number) => {
      if (!selectedUser) return;
      const newXp = Math.max(0, selectedUser.xp + amount);
      const newLevel = Math.floor(newXp / 100) + 1;
      handleUpdateUserStats(selectedUser, { xp: newXp, level: newLevel });
  };

  // --- MODULE ACTIONS ---
  const handleSaveModule = (moduleToSave: Module) => {
    const exists = modules.find(m => m.id === moduleToSave.id);
    const newModules = exists 
        ? modules.map(m => m.id === moduleToSave.id ? moduleToSave : m)
        : [...modules, moduleToSave];
    onUpdateModules(newModules);
    setEditingModule(null);
    addToast('success', 'Модуль сохранен в базу');
  };

  const handleDeleteModule = (id: string) => {
    if (confirm('ВНИМАНИЕ: Удаление модуля необратимо. Продолжить?')) {
        onUpdateModules(modules.filter(m => m.id !== id));
        addToast('info', 'Модуль удален');
    }
  };

  // --- LESSON ACTIONS ---
  const handleSaveLesson = (moduleId: string, lessonToSave: Lesson) => {
      // 1. Update the lesson list inside the currently editing module
      if (!editingModule) return;

      const lessonExists = editingModule.lessons.find(l => l.id === lessonToSave.id);
      let newLessons;
      if (lessonExists) {
          newLessons = editingModule.lessons.map(l => l.id === lessonToSave.id ? lessonToSave : l);
      } else {
          newLessons = [...editingModule.lessons, lessonToSave];
      }

      const updatedModule = { ...editingModule, lessons: newLessons };
      
      // 2. Update local editing state
      setEditingModule(updatedModule);
      
      // 3. Close lesson modal
      setEditingLesson(null);
  };

  const handleDeleteLesson = (moduleId: string, lessonId: string) => {
      if (!editingModule) return;
      if (confirm('Удалить урок из модуля?')) {
          const updatedLessons = editingModule.lessons.filter(l => l.id !== lessonId);
          setEditingModule({ ...editingModule, lessons: updatedLessons });
      }
  };

  // --- RENDERERS ---

  const renderOverview = () => (
      <div className="space-y-6 animate-fade-in pb-32">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass p-4 rounded-2xl border border-white/5">
                  <div className="text-slate-500 text-[10px] font-black uppercase">Личный состав</div>
                  <div className="text-3xl font-black text-white mt-1">{users.length}</div>
              </div>
              <div className="glass p-4 rounded-2xl border border-white/5">
                  <div className="text-slate-500 text-[10px] font-black uppercase">Материалы</div>
                  <div className="text-3xl font-black text-[#6C5DD3] mt-1">{modules.length}</div>
              </div>
          </div>

          <div className="bg-[#1F2128]/90 backdrop-blur-xl p-6 rounded-[2rem] border border-white/5 shadow-xl h-[300px]">
              <h3 className="text-white font-bold mb-4">Боевая Активность (XP)</h3>
              <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analyticsData}>
                      <defs>
                          <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#6C5DD3" stopOpacity={0.8}/>
                              <stop offset="95%" stopColor="#6C5DD3" stopOpacity={0}/>
                          </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} tickLine={false} />
                      <YAxis stroke="#666" fontSize={10} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#1F2128', borderRadius: '10px', border: '1px solid #333' }} />
                      <Area type="monotone" dataKey="xp" stroke="#6C5DD3" fillOpacity={1} fill="url(#colorXp)" />
                  </AreaChart>
              </ResponsiveContainer>
          </div>
      </div>
  );

  const renderUsers = () => (
      <div className="space-y-6 animate-fade-in pb-32">
           <div className="flex justify-between items-center bg-[#1F2128] p-2 rounded-2xl border border-white/5">
               <input 
                   type="text" 
                   placeholder="Поиск по позывному..." 
                   value={userSearch}
                   onChange={(e) => setUserSearch(e.target.value)}
                   className="bg-transparent text-white px-4 py-2 outline-none w-full text-sm font-bold"
               />
               <div className="text-xl pr-3">🔍</div>
           </div>

           <div className="grid gap-3">
               {users
                   .filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || (u.telegramUsername || '').toLowerCase().includes(userSearch.toLowerCase()))
                   .map(user => (
                   <div key={user.telegramUsername || user.name} onClick={() => setSelectedUser(user)} className="bg-[#1F2128]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-[#6C5DD3]/50 cursor-pointer transition-all hover:translate-x-1">
                       <div className="flex items-center gap-4">
                           <div className={`w-12 h-12 rounded-full overflow-hidden border-2 ${user.isBanned ? 'border-red-500 grayscale' : 'border-[#6C5DD3]'}`}>
                               <img src={user.avatarUrl} className="w-full h-full object-cover" />
                           </div>
                           <div>
                               <div className="flex items-center gap-2">
                                   <h4 className={`font-bold text-sm ${user.isBanned ? 'text-red-500 line-through' : 'text-white'}`}>{user.name}</h4>
                                   <span className="text-[9px] bg-white/10 px-2 rounded text-slate-400">{user.role}</span>
                               </div>
                               <p className="text-slate-500 text-[10px]">Lvl {user.level} • {user.xp} XP</p>
                           </div>
                       </div>
                       <div className="text-slate-500">➜</div>
                   </div>
               ))}
           </div>
      </div>
  );

  const renderCourseManager = () => (
      <div className="space-y-6 animate-fade-in pb-32">
          <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold">Учебные модули</h3>
              <button 
                onClick={() => setEditingModule(createEmptyModule())}
                className="bg-[#6C5DD3] text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-[#6C5DD3]/20"
              >
                  + Создать
              </button>
          </div>

          <div className="space-y-4">
              {modules.map(mod => (
                  <div key={mod.id} className="bg-[#1F2128] p-5 rounded-2xl border border-white/5 group hover:border-white/20 transition-all">
                      <div className="flex justify-between items-start mb-4">
                          <div className="flex gap-4">
                              <div className="w-16 h-16 rounded-xl bg-cover bg-center bg-slate-800" style={{ backgroundImage: `url(${mod.imageUrl})` }}></div>
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <h4 className="font-bold text-white text-sm">{mod.title}</h4>
                                      {mod.isHidden && <span className="bg-slate-700 text-[9px] px-1.5 rounded text-slate-300">СКРЫТ</span>}
                                  </div>
                                  <p className="text-slate-500 text-xs line-clamp-1">{mod.description}</p>
                                  <div className="mt-2 text-[10px] font-bold text-[#6C5DD3] bg-[#6C5DD3]/10 inline-block px-2 py-0.5 rounded">
                                      {mod.category} • {mod.lessons.length} уроков
                                  </div>
                              </div>
                          </div>
                      </div>
                      <div className="flex gap-2">
                          <button onClick={() => setEditingModule(mod)} className="flex-1 bg-white/5 hover:bg-white/10 py-2 rounded-xl text-xs font-bold text-white uppercase transition-colors">
                              Редактировать
                          </button>
                          <button onClick={() => handleDeleteModule(mod.id)} className="w-10 bg-red-500/10 hover:bg-red-500/20 rounded-xl flex items-center justify-center text-red-500 transition-colors">
                              ✕
                          </button>
                      </div>
                  </div>
              ))}
          </div>
      </div>
  );

  const renderSettings = () => (
      <div className="space-y-6 animate-fade-in pb-32">
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4">
               <h3 className="text-white font-bold mb-4 flex items-center gap-2">🧠 Настройки AI Командира</h3>
               
               <div>
                   <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Системный промпт</label>
                   <textarea 
                       value={config.systemInstruction}
                       onChange={(e) => onUpdateConfig({...config, systemInstruction: e.target.value})}
                       className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-3 text-xs text-white font-mono leading-relaxed outline-none focus:border-[#6C5DD3]"
                   />
               </div>
               
               <div className="grid grid-cols-2 gap-4">
                   <div>
                       <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Температура (Креативность)</label>
                       <input 
                           type="range" min="0" max="1" step="0.1"
                           value={config.integrations.aiTemperature}
                           onChange={(e) => onUpdateConfig({...config, integrations: {...config.integrations, aiTemperature: parseFloat(e.target.value)}})}
                           className="w-full accent-[#6C5DD3]"
                       />
                       <div className="text-right text-xs text-white">{config.integrations.aiTemperature}</div>
                   </div>
                   <div>
                        <label className="text-[10px] font-black uppercase text-slate-500 mb-2 block">Цветовая тема</label>
                        <input 
                            type="color" 
                            value={config.theme.accentColor}
                            onChange={(e) => onUpdateConfig({...config, theme: {...config.theme, accentColor: e.target.value}})}
                            className="w-full h-8 rounded bg-transparent cursor-pointer"
                        />
                   </div>
               </div>
          </div>
      </div>
  );

  // --- MODALS ---

  const ModuleEditorModal = () => {
      if (!editingModule) return null;
      return (
          <div className="fixed inset-0 z-40 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#1F2128] w-full max-w-2xl rounded-[2rem] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-6 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-xl font-black text-white">Редактор Модуля</h3>
                      <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                      <input 
                        value={editingModule.title} 
                        onChange={e => setEditingModule({...editingModule, title: e.target.value})}
                        placeholder="Название модуля"
                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white font-bold outline-none focus:border-[#6C5DD3]"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                          <select 
                            value={editingModule.category} 
                            onChange={e => setEditingModule({...editingModule, category: e.target.value as any})}
                            className="bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none"
                          >
                              <option value="GENERAL">General</option>
                              <option value="SALES">Sales</option>
                              <option value="TACTICS">Tactics</option>
                              <option value="PSYCHOLOGY">Psychology</option>
                          </select>
                          <div className="flex items-center gap-2 bg-black/40 px-3 rounded-xl border border-white/10">
                              <input type="checkbox" checked={editingModule.isHidden} onChange={e => setEditingModule({...editingModule, isHidden: e.target.checked})} className="accent-[#6C5DD3]" />
                              <span className="text-sm text-slate-300">Скрытый модуль</span>
                          </div>
                      </div>

                      <textarea 
                        value={editingModule.description} 
                        onChange={e => setEditingModule({...editingModule, description: e.target.value})}
                        placeholder="Описание..."
                        className="w-full bg-black/40 border border-white/10 p-4 rounded-xl text-white text-sm h-20 outline-none"
                      />

                      <input 
                        value={editingModule.imageUrl} 
                        onChange={e => setEditingModule({...editingModule, imageUrl: e.target.value})}
                        placeholder="URL обложки"
                        className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none"
                      />

                      {/* Lesson List within Module Editor */}
                      <div className="pt-4 border-t border-white/5">
                          <div className="flex justify-between items-center mb-3">
                              <h4 className="text-white font-bold text-sm">Уроки ({editingModule.lessons.length})</h4>
                              <button 
                                onClick={() => setEditingLesson({ lesson: createEmptyLesson(), moduleId: editingModule.id })}
                                className="text-[#6C5DD3] text-[10px] font-black uppercase bg-[#6C5DD3]/10 px-3 py-1 rounded-lg hover:bg-[#6C5DD3]/20"
                              >
                                  + Добавить урок
                              </button>
                          </div>
                          <div className="space-y-2">
                              {editingModule.lessons.map((l, i) => (
                                  <div key={l.id} className="bg-white/5 p-3 rounded-xl flex justify-between items-center">
                                      <div className="flex items-center gap-3">
                                          <span className="text-slate-500 text-xs font-bold">{i + 1}</span>
                                          <span className="text-white text-sm font-medium">{l.title}</span>
                                      </div>
                                      <div className="flex gap-2">
                                          <button onClick={() => setEditingLesson({ lesson: l, moduleId: editingModule.id })} className="text-blue-400 bg-blue-500/10 p-1.5 rounded text-xs">✎</button>
                                          <button onClick={() => handleDeleteLesson(editingModule.id, l.id)} className="text-red-400 bg-red-500/10 p-1.5 rounded text-xs">✕</button>
                                      </div>
                                  </div>
                              ))}
                              {editingModule.lessons.length === 0 && <div className="text-center text-slate-500 text-xs italic py-2">Список пуст</div>}
                          </div>
                      </div>
                  </div>

                  <div className="p-5 border-t border-white/5 flex gap-3">
                      <Button variant="secondary" onClick={() => setEditingModule(null)} className="flex-1">Отмена</Button>
                      <Button variant="primary" onClick={() => handleSaveModule(editingModule)} className="flex-1 bg-[#6C5DD3]">Сохранить</Button>
                  </div>
              </div>
          </div>
      );
  };

  const LessonEditorModal = () => {
      if (!editingLesson) return null;
      const { lesson, moduleId } = editingLesson;
      
      const handleChange = (field: keyof Lesson, value: any) => {
          setEditingLesson({ moduleId, lesson: { ...lesson, [field]: value } });
      };

      return (
          <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#1F2128] w-full max-w-lg rounded-[2rem] border border-white/10 shadow-2xl flex flex-col max-h-[90vh]">
                  <div className="p-5 border-b border-white/5 flex justify-between items-center">
                      <h3 className="text-lg font-black text-white">Редактор Урока</h3>
                      <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-white">✕</button>
                  </div>
                  
                  <div className="p-6 overflow-y-auto space-y-4 custom-scrollbar">
                      <input 
                        value={lesson.title} onChange={e => handleChange('title', e.target.value)}
                        placeholder="Название урока" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white outline-none"
                      />
                      <textarea 
                        value={lesson.content} onChange={e => handleChange('content', e.target.value)}
                        placeholder="Текст лекции..." className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm h-32 outline-none"
                      />
                      <input 
                        value={lesson.videoUrl || ''} onChange={e => handleChange('videoUrl', e.target.value)}
                        placeholder="Ссылка на видео (YouTube)" className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none"
                      />
                      
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="text-[10px] text-slate-500 uppercase block mb-1">Награда (XP)</label>
                              <input type="number" value={lesson.xpReward} onChange={e => handleChange('xpReward', parseInt(e.target.value))} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none" />
                          </div>
                          <div>
                              <label className="text-[10px] text-slate-500 uppercase block mb-1">Сложность</label>
                              <select value={lesson.difficulty} onChange={e => handleChange('difficulty', e.target.value)} className="w-full bg-black/40 border border-white/10 p-3 rounded-xl text-white text-sm outline-none">
                                  <option value="Easy">Легко</option>
                                  <option value="Medium">Средне</option>
                                  <option value="Hard">Сложно</option>
                              </select>
                          </div>
                      </div>

                      <div className="bg-white/5 p-4 rounded-xl border border-white/10">
                          <label className="text-[10px] text-[#6C5DD3] font-black uppercase block mb-2">Настройки Домашнего Задания</label>
                          <select value={lesson.homeworkType} onChange={e => handleChange('homeworkType', e.target.value)} className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-white text-xs mb-3">
                              <option value="TEXT">Текст</option>
                              <option value="PHOTO">Фото</option>
                              <option value="VIDEO">Видео</option>
                          </select>
                          <textarea 
                            value={lesson.homeworkTask} onChange={e => handleChange('homeworkTask', e.target.value)}
                            placeholder="Задание для студента..." className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-white text-xs h-16 outline-none mb-3"
                          />
                          <textarea 
                            value={lesson.aiGradingInstruction} onChange={e => handleChange('aiGradingInstruction', e.target.value)}
                            placeholder="Инструкция для AI проверки..." className="w-full bg-black/40 border border-white/10 p-2 rounded-lg text-white text-xs h-16 outline-none"
                          />
                      </div>
                  </div>

                  <div className="p-5 border-t border-white/5 flex gap-3">
                      <Button variant="secondary" onClick={() => setEditingLesson(null)} className="flex-1">Отмена</Button>
                      <Button variant="primary" onClick={() => handleSaveLesson(moduleId, lesson)} className="flex-1 bg-[#6C5DD3]">Сохранить Урок</Button>
                  </div>
              </div>
          </div>
      );
  };

  const UserEditModal = () => {
      if (!selectedUser) return null;
      return (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
              <div className="bg-[#1F2128] w-full max-w-sm rounded-[2rem] border border-white/10 shadow-2xl p-6 relative">
                  <button onClick={() => setSelectedUser(null)} className="absolute top-4 right-4 text-slate-500 hover:text-white">✕</button>
                  
                  <div className="text-center mb-6">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden border-2 border-[#6C5DD3] mb-3">
                          <img src={selectedUser.avatarUrl} className="w-full h-full object-cover" />
                      </div>
                      <h2 className="text-xl font-black text-white">{selectedUser.name}</h2>
                      <p className="text-slate-500 text-xs">@{selectedUser.telegramUsername}</p>
                  </div>

                  <div className="space-y-4">
                      <div className="flex gap-2">
                          <button onClick={() => handleManualXp(100)} className="flex-1 bg-green-500/20 text-green-500 py-2 rounded-xl text-xs font-bold">+100 XP</button>
                          <button onClick={() => handleManualXp(1000)} className="flex-1 bg-green-500/20 text-green-500 py-2 rounded-xl text-xs font-bold">+1k XP</button>
                      </div>

                      <select 
                         value={selectedUser.role} 
                         onChange={(e) => handleUpdateUserStats(selectedUser, { role: e.target.value as any })}
                         className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-sm outline-none"
                      >
                          <option value="STUDENT">Боец</option>
                          <option value="CURATOR">Офицер (Куратор)</option>
                          <option value="ADMIN">Командир (Админ)</option>
                      </select>

                      <button 
                          onClick={() => handleUpdateUserStats(selectedUser, { isBanned: !selectedUser.isBanned })} 
                          className={`w-full py-3 rounded-xl font-bold uppercase text-xs ${selectedUser.isBanned ? 'bg-green-600 text-white' : 'bg-red-600/20 text-red-500'}`}
                      >
                          {selectedUser.isBanned ? 'РАЗБЛОКИРОВАТЬ' : 'ЗАБЛОКИРОВАТЬ ДОСТУП'}
                      </button>
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="min-h-screen bg-transparent flex flex-col w-full relative">
       <UserEditModal />
       <ModuleEditorModal />
       <LessonEditorModal />

       <div className="flex-1 p-6 max-w-5xl mx-auto w-full">
           <header className="mb-8">
               <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
                   ПАНЕЛЬ УПРАВЛЕНИЯ
               </h1>
               <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Доступ: {config.appName}</p>
           </header>

           {activeTab === 'OVERVIEW' && renderOverview()}
           {activeTab === 'USERS' && renderUsers()}
           {activeTab === 'COURSE' && renderCourseManager()}
           {activeTab === 'SETTINGS' && renderSettings()}
       </div>
    </div>
  );
};
