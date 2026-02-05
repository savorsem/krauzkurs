
import React, { useState } from 'react';
import { AppConfig, Module, UserProgress, CalendarEvent, Lesson, EventType, ModuleCategory, UserRole, AdminTab } from '../types';
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
  activeTab: AdminTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  config, onUpdateConfig, modules, onUpdateModules, users, onUpdateUsers, onUpdateEvents, addToast, activeTab
}) => {
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.get<CalendarEvent[]>('calendarEvents', []));
  const [userSearch, setUserSearch] = useState('');
  const [isSyncing, setIsSyncing] = useState(false);

  // Editors State
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [editingUser, setEditingUser] = useState<UserProgress | null>(null);
  const [selectedParentModuleId, setSelectedParentModuleId] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleSync = async () => {
      setIsSyncing(true);
      try {
          await DriveSync.syncFolder(config.integrations?.googleDriveFolderId || 'mock', []);
          addToast('success', 'Синхронизация завершена');
      } catch (e) {
          addToast('error', 'Ошибка синхронизации');
      } finally {
          setIsSyncing(false);
      }
  };

  // 1. Module Actions
  const saveModule = () => {
    if (!editingModule || !editingModule.title) {
        addToast('error', 'Требуется название');
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
    addToast('success', 'Модуль сохранен');
  };

  const deleteModule = (id: string) => {
      if (confirm('Удалить модуль?')) {
          onUpdateModules(modules.filter(m => m.id !== id));
          addToast('info', 'Модуль удален');
      }
  };

  // 2. Lesson Actions
  const saveLesson = () => {
      if (!editingLesson || !editingLesson.title || !selectedParentModuleId) {
          addToast('error', 'Ошибка сохранения');
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
      addToast('success', 'Урок сохранен');
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
      if (confirm('Удалить урок?')) {
        const updatedModules = modules.map(mod => {
            if (mod.id !== moduleId) return mod;
            return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
        });
        onUpdateModules(updatedModules);
        addToast('info', 'Урок удален');
      }
  };

  // 3. User Actions
  const saveUser = () => {
    if (!editingUser) return;
    const updatedUsers = users.map(u => u.name === editingUser.name ? editingUser : u);
    onUpdateUsers(updatedUsers);
    setEditingUser(null);
    addToast('success', 'Профиль обновлен');
  };

  const resetUserProgress = (user: UserProgress) => {
      if (confirm(`Сбросить прогресс бойца ${user.name}?`)) {
          const updatedUsers = users.map(u => u.name === user.name ? { ...u, xp: 0, level: 1, completedLessonIds: [] } : u);
          onUpdateUsers(updatedUsers);
          addToast('success', 'Прогресс сброшен');
      }
  };

  // --- RENDERERS ---

  const renderHeader = () => (
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#1F2128] p-6 rounded-[2rem] border border-white/5">
          <div>
              <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                  ЦЕНТР УПРАВЛЕНИЯ <span className="text-[#6C5DD3] text-sm align-top">v4.0</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Панель Администратора</p>
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
                  {isSyncing ? 'СИНХРОНИЗАЦИЯ...' : 'ОБНОВИТЬ ДАННЫЕ'}
              </Button>
          </div>
      </header>
  );

  const renderOverview = () => (
    <div className="space-y-6 animate-fade-in">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
                { label: 'Всего бойцов', val: users.length, diff: '+12%', color: 'text-white' },
                { label: 'Миссии', val: modules.reduce((a, b) => a + b.lessons.length, 0), diff: 'Стабильно', color: 'text-[#6C5DD3]' },
                { label: 'События', val: events.length, diff: '+2 новых', color: 'text-[#D4AF37]' },
                { label: 'Система', val: '98%', diff: 'Норма', color: 'text-green-500' },
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
                <h3 className="text-white font-black text-lg">Системный журнал</h3>
                <button className="text-xs font-bold text-[#6C5DD3] hover:text-white transition-colors">Показать все</button>
             </div>
             <div className="space-y-2">
                 {[1,2,3].map((_, i) => (
                     <div key={i} className="flex items-center gap-4 p-3 hover:bg-white/5 rounded-xl transition-colors border-b border-white/5 last:border-0">
                         <div className="w-2 h-2 rounded-full bg-[#6C5DD3]"></div>
                         <div className="flex-1">
                             <p className="text-slate-300 text-sm font-medium"><span className="text-white font-bold">System</span> синхронизировал {3 + i} файла.</p>
                             <p className="text-slate-600 text-[10px]">{i * 12 + 5} мин. назад</p>
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
                    placeholder="Поиск по позывному..."
                    className="bg-transparent w-full text-white outline-none placeholder:text-slate-600 font-bold text-sm"
                />
            </div>

            {/* User List */}
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
                            <button onClick={() => setEditingUser(u)} className="flex-1 py-2 text-[10px] font-bold uppercase bg-white/5 hover:bg-white/10 rounded-lg text-slate-300 transition-colors">
                                Управление
                            </button>
                            <button onClick={() => resetUserProgress(u)} className="px-3 py-2 text-[10px] font-bold uppercase bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-lg transition-colors">
                                Сброс
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* User Editor Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-6 backdrop-blur-sm animate-fade-in">
                     <div className="bg-[#1F2128] p-6 rounded-[2rem] w-full max-w-md space-y-6 border border-white/10 shadow-2xl">
                         <div className="flex justify-between items-center border-b border-white/5 pb-4">
                            <h3 className="text-white font-black text-xl">Личное дело</h3>
                            <button onClick={() => setEditingUser(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase">Закрыть</button>
                        </div>

                        <div className="flex items-center gap-4">
                             <img src={editingUser.avatarUrl || `https://ui-avatars.com/api/?name=${editingUser.name}`} className="w-16 h-16 rounded-full border-2 border-white/10" />
                             <div>
                                 <h4 className="text-white font-bold text-lg">{editingUser.name}</h4>
                                 <p className="text-slate-500 text-xs">@{editingUser.telegramUsername || 'unknown'}</p>
                             </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Уровень доступа (Роль)</label>
                            <div className="grid grid-cols-3 gap-2">
                                {(['STUDENT', 'CURATOR', 'ADMIN'] as UserRole[]).map(role => (
                                    <button
                                        key={role}
                                        onClick={() => setEditingUser({...editingUser, role})}
                                        className={`py-3 rounded-xl text-[10px] font-black uppercase transition-all border ${
                                            editingUser.role === role 
                                            ? 'bg-[#6C5DD3] text-white border-[#6C5DD3] shadow-lg shadow-[#6C5DD3]/20' 
                                            : 'bg-transparent text-slate-400 border-slate-700 hover:border-slate-500 hover:text-white'
                                        }`}
                                    >
                                        {role}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <p className="text-[10px] font-bold text-slate-500 uppercase mb-2">Активные права:</p>
                            <ul className="space-y-1">
                                {editingUser.role === 'STUDENT' && ['Доступ к обучению', 'Сдача заданий', 'Рейтинг'].map(p => (
                                    <li key={p} className="text-white text-xs flex items-center gap-2"><span className="text-[#6C5DD3]">✓</span> {p}</li>
                                ))}
                                {editingUser.role === 'CURATOR' && ['Доступ к обучению', 'Проверка ДЗ', 'Панель куратора'].map(p => (
                                    <li key={p} className="text-white text-xs flex items-center gap-2"><span className="text-[#6C5DD3]">✓</span> {p}</li>
                                ))}
                                {editingUser.role === 'ADMIN' && ['Полный доступ', 'Редактор контента', 'Управление пользователями'].map(p => (
                                    <li key={p} className="text-white text-xs flex items-center gap-2"><span className="text-[#6C5DD3]">✓</span> {p}</li>
                                ))}
                            </ul>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button 
                                onClick={() => {
                                    if(confirm('Сбросить весь прогресс этого пользователя?')) {
                                        setEditingUser({...editingUser, xp: 0, level: 1, completedLessonIds: []});
                                    }
                                }} 
                                className="flex-1 py-3 text-red-500 font-bold bg-red-500/10 rounded-xl hover:bg-red-500/20 text-xs uppercase"
                            >
                                Обнулить
                            </button>
                            <button onClick={saveUser} className="flex-1 py-3 text-white font-bold bg-[#6C5DD3] rounded-xl shadow-lg shadow-[#6C5DD3]/20 text-xs uppercase hover:scale-[1.02] transition-transform">
                                Сохранить
                            </button>
                        </div>
                     </div>
                </div>
            )}
        </div>
      );
  };

  const renderCourses = () => {
    // Lesson Editor
    if (editingLesson) {
        return (
            <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 animate-slide-in space-y-4">
                 <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-white font-black text-xl">{editingLesson.id ? 'Редактирование' : 'Новый урок'}</h3>
                    <button onClick={() => setEditingLesson(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase">Отмена</button>
                </div>

                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Название урока</label>
                        <input value={editingLesson.title || ''} onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} placeholder="Lesson Title" className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-bold" />
                    </div>
                    
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Контент (Описание/Теория)</label>
                        <textarea value={editingLesson.content || ''} onChange={e => setEditingLesson({...editingLesson, content: e.target.value})} placeholder="Markdown supported..." rows={6} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-medium text-sm" />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Тип отчета</label>
                            <select value={editingLesson.homeworkType || 'TEXT'} onChange={e => setEditingLesson({...editingLesson, homeworkType: e.target.value as any})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none text-sm font-bold appearance-none">
                                <option value="TEXT">Текст</option>
                                <option value="PHOTO">Фото</option>
                                <option value="VIDEO">Видео</option>
                                <option value="FILE">Файл (PDF)</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-500 uppercase">Награда (XP)</label>
                            <input type="number" value={editingLesson.xpReward || 100} onChange={e => setEditingLesson({...editingLesson, xpReward: parseInt(e.target.value)})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Задание для ученика</label>
                         <input value={editingLesson.homeworkTask || ''} onChange={e => setEditingLesson({...editingLesson, homeworkTask: e.target.value})} placeholder="Что нужно сделать?" className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none text-sm" />
                    </div>

                    <div className="p-4 rounded-xl bg-[#6C5DD3]/10 border border-[#6C5DD3]/20">
                         <label className="text-[#6C5DD3] text-[10px] font-black uppercase mb-2 block">Промпт для AI-проверки (Скрыто)</label>
                         <textarea value={editingLesson.aiGradingInstruction || ''} onChange={e => setEditingLesson({...editingLesson, aiGradingInstruction: e.target.value})} placeholder="Инструкция для AI..." rows={3} className="w-full bg-black/20 text-white p-3 rounded-lg border border-white/5 text-sm" />
                    </div>

                    <button onClick={saveLesson} className="w-full bg-[#6C5DD3] text-white py-4 rounded-xl font-black uppercase tracking-widest shadow-lg shadow-[#6C5DD3]/20 hover:scale-[1.02] transition-transform">Сохранить урок</button>
                </div>
            </div>
        );
    }

    // Module Editor
    if (editingModule) {
        return (
            <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 animate-slide-in space-y-4">
                 <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
                    <h3 className="text-white font-black text-xl">{editingModule.id ? 'Редактирование' : 'Новый модуль'}</h3>
                    <button onClick={() => setEditingModule(null)} className="text-slate-400 hover:text-white text-xs font-bold uppercase">Отмена</button>
                </div>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Название модуля</label>
                        <input value={editingModule.title || ''} onChange={e => setEditingModule({...editingModule, title: e.target.value})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-bold" />
                    </div>
                    <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Описание</label>
                        <textarea value={editingModule.description || ''} onChange={e => setEditingModule({...editingModule, description: e.target.value})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none text-sm" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Категория</label>
                             <select value={editingModule.category || 'GENERAL'} onChange={e => setEditingModule({...editingModule, category: e.target.value as ModuleCategory})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none font-bold">
                                <option value="GENERAL">База</option>
                                <option value="SALES">Продажи</option>
                                <option value="PSYCHOLOGY">Психология</option>
                                <option value="TACTICS">Тактика</option>
                             </select>
                         </div>
                         <div className="space-y-1">
                             <label className="text-[10px] font-bold text-slate-500 uppercase">Мин. Уровень</label>
                             <input type="number" value={editingModule.minLevel || 1} onChange={e => setEditingModule({...editingModule, minLevel: parseInt(e.target.value)})} className="w-full bg-black/20 text-white p-4 rounded-xl border border-white/10 outline-none font-bold" />
                         </div>
                    </div>
                    <button onClick={saveModule} className="w-full bg-[#6C5DD3] text-white py-4 rounded-xl font-black uppercase tracking-widest hover:scale-[1.02] transition-transform">Сохранить модуль</button>
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="space-y-6 animate-fade-in">
            <button onClick={() => setEditingModule({})} className="w-full py-4 bg-[#6C5DD3]/10 text-[#6C5DD3] border border-[#6C5DD3]/20 rounded-[1.5rem] font-black uppercase tracking-widest hover:bg-[#6C5DD3] hover:text-white transition-all flex items-center justify-center gap-2">
                <span>+</span> Создать модуль
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
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-wide">{mod.lessons.length} миссий • Уровень {mod.minLevel}+</p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                             <button onClick={() => setEditingModule(mod)} className="px-3 py-1.5 rounded-lg bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-bold uppercase transition-colors">Изм</button>
                             <button onClick={() => deleteModule(mod.id)} className="px-3 py-1.5 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500/20 text-xs font-bold uppercase transition-colors">Удал</button>
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
                            + Добавить миссию
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
  };

  const renderSettings = () => (
      <div className="space-y-6 animate-fade-in pb-24">
          {/* Main App Settings */}
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-[#6C5DD3]">⚙️</span> Общая конфигурация
              </h3>
              
              <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] font-black uppercase mb-1 block">Название приложения</label>
                  <input value={config.appName} onChange={e => onUpdateConfig({...config, appName: e.target.value})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 focus:border-[#6C5DD3] outline-none font-bold" />
              </div>

              <div className="space-y-1">
                  <label className="text-slate-500 text-[10px] font-black uppercase mb-1 block">Системный Промпт (Личность Командира)</label>
                  <textarea rows={6} value={config.systemInstruction} onChange={e => onUpdateConfig({...config, systemInstruction: e.target.value})} className="w-full bg-black/20 text-white p-3 rounded-xl border border-white/10 outline-none text-xs font-mono leading-relaxed" />
              </div>
          </div>

          {/* Features & Permissions */}
           <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4">
              <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-blue-500">🛡️</span> Протоколы и Функции
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[
                      { key: 'enableRealTimeSync', label: 'Real-Time Синхронизация' },
                      { key: 'autoApproveHomework', label: 'Авто-прием ДЗ' },
                      { key: 'maintenanceMode', label: 'Режим тех. работ' },
                      { key: 'allowStudentChat', label: 'Чат для студентов' },
                      { key: 'publicLeaderboard', label: 'Публичный рейтинг' },
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
                  <span className="text-green-500">🔌</span> Интеграции
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
                      <span className="text-xl">🤖</span>
                      <select 
                          value={config.integrations?.aiModelVersion || 'gemini-1.5-pro'}
                          onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, aiModelVersion: e.target.value}})}
                          className="w-full bg-transparent text-white text-xs outline-none font-mono"
                      >
                          <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                          <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                      </select>
                  </div>
              </div>
          </div>
          
          <button 
             onClick={() => { if(confirm('⚠️ ПОЛНЫЙ СБРОС СИСТЕМЫ? Это удалит все данные локально.')) { Storage.clear(); window.location.reload(); } }} 
             className="w-full py-4 border border-red-500/30 text-red-500 rounded-[1.5rem] font-bold uppercase hover:bg-red-500/10 transition-colors text-xs tracking-widest"
          >
              ЗАВОДСКОЙ СБРОС (FACTORY RESET)
          </button>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] pb-32 flex flex-col md:flex-row w-full">
       <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
           {renderHeader()}

           {activeTab === 'OVERVIEW' && renderOverview()}
           {activeTab === 'USERS' && renderUsers()}
           {activeTab === 'COURSE' && renderCourses()}
           {activeTab === 'SETTINGS' && renderSettings()}
       </div>
    </div>
  );
};
