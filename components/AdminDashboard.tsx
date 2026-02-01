
import React, { useState } from 'react';
import { AppConfig, Module, UserProgress, CalendarEvent, Lesson, HomeworkType, EventType } from '../types';
import { Storage } from '../services/storage';

interface AdminDashboardProps {
  config: AppConfig;
  onUpdateConfig: (newConfig: AppConfig) => void;
  modules: Module[];
  onUpdateModules: (newModules: Module[]) => void;
  users: UserProgress[];
  onUpdateUsers: (newUsers: UserProgress[]) => void;
  onUpdateEvents: (newEvents: CalendarEvent[]) => void; // Added prop for events
}

type AdminTab = 'OVERVIEW' | 'COURSE' | 'USERS' | 'CALENDAR' | 'SETTINGS';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  config, onUpdateConfig, modules, onUpdateModules, users, onUpdateUsers, onUpdateEvents
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('OVERVIEW');
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.get<CalendarEvent[]>('calendarEvents', []));

  // Editors State
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [selectedParentModuleId, setSelectedParentModuleId] = useState<string | null>(null);

  // --- ACTIONS ---

  // 1. Module Actions
  const saveModule = () => {
    if (!editingModule || !editingModule.title) return;
    
    let updatedModules = [...modules];
    if (editingModule.id) {
        // Edit existing
        updatedModules = updatedModules.map(m => m.id === editingModule.id ? { ...m, ...editingModule } as Module : m);
    } else {
        // Create new
        const newModule: Module = {
            id: `mod_${Date.now()}`,
            title: editingModule.title,
            description: editingModule.description || '',
            minLevel: editingModule.minLevel || 1,
            imageUrl: editingModule.imageUrl || '',
            videoUrl: editingModule.videoUrl || '',
            pdfUrl: editingModule.pdfUrl || '',
            lessons: []
        };
        updatedModules.push(newModule);
    }
    onUpdateModules(updatedModules);
    setEditingModule(null);
  };

  const deleteModule = (id: string) => {
      if (confirm('Вы уверены? Это удалит модуль и все уроки внутри.')) {
          onUpdateModules(modules.filter(m => m.id !== id));
      }
  };

  // 2. Lesson Actions
  const saveLesson = () => {
      if (!editingLesson || !editingLesson.title || !selectedParentModuleId) return;

      const updatedModules = modules.map(mod => {
          if (mod.id !== selectedParentModuleId) return mod;

          let updatedLessons = [...mod.lessons];
          if (editingLesson.id) {
              // Edit
              updatedLessons = updatedLessons.map(l => l.id === editingLesson.id ? { ...l, ...editingLesson } as Lesson : l);
          } else {
              // Create
              const newLesson: Lesson = {
                  id: `les_${Date.now()}`,
                  title: editingLesson.title,
                  description: editingLesson.description || '',
                  content: editingLesson.content || '',
                  xpReward: editingLesson.xpReward || 100,
                  homeworkType: editingLesson.homeworkType || 'TEXT',
                  homeworkTask: editingLesson.homeworkTask || '',
                  aiGradingInstruction: editingLesson.aiGradingInstruction || ''
              };
              updatedLessons.push(newLesson);
          }
          return { ...mod, lessons: updatedLessons };
      });

      onUpdateModules(updatedModules);
      setEditingLesson(null);
  };

  const deleteLesson = (moduleId: string, lessonId: string) => {
      if (confirm('Удалить урок?')) {
        const updatedModules = modules.map(mod => {
            if (mod.id !== moduleId) return mod;
            return { ...mod, lessons: mod.lessons.filter(l => l.id !== lessonId) };
        });
        onUpdateModules(updatedModules);
      }
  };

  // 3. User Actions
  const toggleUserRole = (user: UserProgress) => {
      const newRole = user.role === 'ADMIN' ? 'STUDENT' : 'ADMIN'; // Simple toggle for now
      const updatedUsers = users.map(u => u.name === user.name ? { ...u, role: newRole } : u);
      onUpdateUsers(updatedUsers);
  };

  const resetUserProgress = (user: UserProgress) => {
      if (confirm(`Сбросить прогресс пользователя ${user.name}?`)) {
          const updatedUsers = users.map(u => u.name === user.name ? { ...u, xp: 0, level: 1, completedLessonIds: [] } : u);
          onUpdateUsers(updatedUsers);
      }
  };

  // 4. Event Actions
  const handleSaveEvent = () => {
      if (!editingEvent || !editingEvent.title) return;
      
      // Fetch fresh events from parent or storage to ensure sync
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
      onUpdateEvents(updatedEvents); // Propagate up
      setEditingEvent(null);
  };

  const deleteEvent = (id: string) => {
      if(confirm('Удалить событие?')) {
        const currentEvents = Storage.get<CalendarEvent[]>('calendarEvents', []);
        const updated = currentEvents.filter(e => e.id !== id);
        setEvents(updated);
        onUpdateEvents(updated);
      }
  };


  // --- RENDERERS ---

  const renderOverview = () => (
    <div className="grid grid-cols-2 gap-4 animate-fade-in">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm col-span-2">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-2">Статус Системы</h3>
            <div className="flex items-center gap-2">
                <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-lg font-black text-slate-900">Active</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">Версия 1.4.2 • Storage: Local</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Всего бойцов</h3>
            <p className="text-3xl font-black text-slate-900">{users.length}</p>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
            <h3 className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1">Материалы</h3>
            <p className="text-3xl font-black text-slate-900">{modules.reduce((acc, m) => acc + m.lessons.length, 0)} <span className="text-sm font-medium text-slate-400">уроков</span></p>
        </div>
    </div>
  );

  const renderCourseManager = () => {
      if (editingLesson) {
          return (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 animate-slide-in">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-lg">
                        {editingLesson.id ? 'Редактирование Урока' : 'Новый Урок'}
                    </h3>
                    <button onClick={() => setEditingLesson(null)} className="text-slate-400 text-xs font-bold uppercase">Отмена</button>
                </div>
                
                <input 
                    placeholder="Название урока" 
                    value={editingLesson.title || ''} 
                    onChange={e => setEditingLesson({...editingLesson, title: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                />
                
                <textarea 
                    placeholder="Текст урока (поддерживает переносы строк)" 
                    rows={6}
                    value={editingLesson.content || ''} 
                    onChange={e => setEditingLesson({...editingLesson, content: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm border border-slate-200" 
                />

                <div className="grid grid-cols-2 gap-4">
                     <select 
                        value={editingLesson.homeworkType || 'TEXT'}
                        onChange={e => setEditingLesson({...editingLesson, homeworkType: e.target.value as any})}
                        className="bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200"
                     >
                         <option value="TEXT">Текст</option>
                         <option value="PHOTO">Фото</option>
                         <option value="VIDEO">Видео</option>
                     </select>
                     <input 
                        type="number"
                        placeholder="XP Reward" 
                        value={editingLesson.xpReward || 100} 
                        onChange={e => setEditingLesson({...editingLesson, xpReward: parseInt(e.target.value)})} 
                        className="bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                    />
                </div>

                <input 
                    placeholder="Текст задания (что видит ученик)" 
                    value={editingLesson.homeworkTask || ''} 
                    onChange={e => setEditingLesson({...editingLesson, homeworkTask: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                />

                <div className="bg-purple-50 p-4 rounded-xl border border-purple-100">
                    <label className="text-[10px] font-black uppercase text-purple-600 block mb-2">Инструкция для AI (Скрыто)</label>
                    <textarea 
                        placeholder="Как проверять задание? Критерии успеха..." 
                        rows={3}
                        value={editingLesson.aiGradingInstruction || ''} 
                        onChange={e => setEditingLesson({...editingLesson, aiGradingInstruction: e.target.value})} 
                        className="w-full bg-white p-3 rounded-xl text-sm border border-purple-200" 
                    />
                </div>

                <button onClick={saveLesson} className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold">Сохранить Урок</button>
            </div>
          );
      }

      if (editingModule) {
          return (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 animate-slide-in">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="font-black text-lg">
                        {editingModule.id ? 'Настройки Модуля' : 'Новый Модуль'}
                    </h3>
                    <button onClick={() => setEditingModule(null)} className="text-slate-400 text-xs font-bold uppercase">Отмена</button>
                </div>
                <input 
                    placeholder="Название Модуля" 
                    value={editingModule.title || ''} 
                    onChange={e => setEditingModule({...editingModule, title: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                />
                <textarea 
                    placeholder="Описание модуля" 
                    value={editingModule.description || ''} 
                    onChange={e => setEditingModule({...editingModule, description: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm border border-slate-200" 
                />
                <input 
                    type="number"
                    placeholder="Мин. уровень доступа" 
                    value={editingModule.minLevel || 1} 
                    onChange={e => setEditingModule({...editingModule, minLevel: parseInt(e.target.value)})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                />
                <input 
                    placeholder="Ссылка на Видео (YouTube)" 
                    value={editingModule.videoUrl || ''} 
                    onChange={e => setEditingModule({...editingModule, videoUrl: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm border border-slate-200" 
                />
                <input 
                    placeholder="Ссылка на PDF" 
                    value={editingModule.pdfUrl || ''} 
                    onChange={e => setEditingModule({...editingModule, pdfUrl: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm border border-slate-200" 
                />
                <button onClick={saveModule} className="w-full py-4 bg-[#1A1A1A] text-white rounded-xl font-bold">Сохранить Модуль</button>
            </div>
          );
      }

      return (
          <div className="space-y-4 animate-fade-in">
              {modules.map(mod => (
                  <div key={mod.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                      <div className="p-4 flex justify-between items-center bg-slate-50 border-b border-slate-100">
                          <div>
                              <h4 className="font-black text-[#1A1A1A]">{mod.title}</h4>
                              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wide">{mod.lessons.length} уроков • Уровень {mod.minLevel}+</p>
                          </div>
                          <div className="flex gap-2">
                              <button onClick={() => setEditingModule(mod)} className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-xs hover:bg-[#1A1A1A] hover:text-white transition-colors">✎</button>
                              <button onClick={() => deleteModule(mod.id)} className="w-8 h-8 rounded-full bg-red-50 border border-red-100 flex items-center justify-center text-xs text-red-500 hover:bg-red-500 hover:text-white transition-colors">🗑</button>
                          </div>
                      </div>
                      <div className="p-2 space-y-2">
                          {mod.lessons.map(les => (
                              <div key={les.id} className="p-3 rounded-xl hover:bg-slate-50 flex justify-between items-center group">
                                  <span className="text-sm font-medium text-slate-700">{les.title}</span>
                                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => { setSelectedParentModuleId(mod.id); setEditingLesson(les); }} className="text-[10px] font-bold text-blue-500 uppercase">Edit</button>
                                    <button onClick={() => deleteLesson(mod.id, les.id)} className="text-[10px] font-bold text-red-500 uppercase">Del</button>
                                  </div>
                              </div>
                          ))}
                          <button 
                             onClick={() => { setSelectedParentModuleId(mod.id); setEditingLesson({}); }}
                             className="w-full py-2 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-bold uppercase hover:border-[#1A1A1A] hover:text-[#1A1A1A] transition-colors"
                          >
                              + Добавить урок
                          </button>
                      </div>
                  </div>
              ))}
              <button 
                  onClick={() => setEditingModule({})}
                  className="w-full py-4 bg-[#1A1A1A] text-white rounded-[1.5rem] font-bold text-sm shadow-lg shadow-black/10"
              >
                  + Создать Новый Модуль
              </button>
          </div>
      );
  };

  const renderUserManager = () => (
      <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden animate-fade-in">
          <table className="w-full text-left border-collapse">
              <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400">Пользователь</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400">Роль</th>
                      <th className="p-4 text-[10px] font-black uppercase text-slate-400 text-right">Действия</th>
                  </tr>
              </thead>
              <tbody>
                  {users.map((u, i) => (
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="p-4">
                              <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                                      <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}`} alt="" className="w-full h-full object-cover" />
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-[#1A1A1A]">{u.name}</p>
                                      <p className="text-[10px] text-slate-400">Lvl {u.level}</p>
                                  </div>
                              </div>
                          </td>
                          <td className="p-4">
                              <span 
                                onClick={() => toggleUserRole(u)}
                                className={`px-2 py-1 rounded-md text-[9px] font-black uppercase cursor-pointer ${u.role === 'ADMIN' ? 'bg-purple-100 text-purple-600' : 'bg-slate-100 text-slate-500'}`}
                              >
                                  {u.role}
                              </span>
                          </td>
                          <td className="p-4 text-right">
                              <button onClick={() => resetUserProgress(u)} className="text-[10px] font-bold text-red-400 hover:text-red-600 uppercase">Сброс</button>
                          </td>
                      </tr>
                  ))}
              </tbody>
          </table>
      </div>
  );

  const renderCalendarManager = () => {
    if (editingEvent) {
        return (
            <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4 animate-slide-in">
                <h3 className="font-black text-lg mb-2">{editingEvent.id ? 'Редактировать' : 'Новое Событие'}</h3>
                
                <input 
                    placeholder="Название события" 
                    value={editingEvent.title || ''} 
                    onChange={e => setEditingEvent({...editingEvent, title: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                />
                <input 
                    type="datetime-local"
                    value={editingEvent.date ? new Date(editingEvent.date).toISOString().slice(0, 16) : ''} 
                    onChange={e => setEditingEvent({...editingEvent, date: new Date(e.target.value).toISOString()})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                />
                <select 
                    value={editingEvent.type || EventType.WEBINAR}
                    onChange={e => setEditingEvent({...editingEvent, type: e.target.value as EventType})}
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200"
                >
                    <option value={EventType.WEBINAR}>Вебинар</option>
                    <option value={EventType.HOMEWORK}>Дедлайн</option>
                    <option value={EventType.OTHER}>Другое</option>
                </select>
                <textarea 
                    placeholder="Описание" 
                    value={editingEvent.description || ''} 
                    onChange={e => setEditingEvent({...editingEvent, description: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm border border-slate-200" 
                />
                
                <div className="flex gap-2">
                    <button onClick={() => setEditingEvent(null)} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl font-bold">Отмена</button>
                    <button onClick={handleSaveEvent} className="flex-1 py-3 bg-[#1A1A1A] text-white rounded-xl font-bold">Сохранить</button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 animate-fade-in">
             {events.length === 0 && <div className="text-center text-slate-400 text-sm py-8">Нет запланированных событий</div>}
             {events.map(evt => (
                 <div key={evt.id} className="bg-white p-4 rounded-2xl border border-slate-100 flex justify-between items-center">
                     <div>
                         <p className="font-bold text-[#1A1A1A]">{evt.title}</p>
                         <p className="text-xs text-slate-500">{new Date(evt.date as string).toLocaleDateString()} • {evt.type}</p>
                     </div>
                     <div className="flex gap-2">
                         <button onClick={() => setEditingEvent(evt)} className="text-xs bg-slate-100 p-2 rounded-lg">✎</button>
                         <button onClick={() => deleteEvent(evt.id)} className="text-xs bg-red-50 text-red-500 p-2 rounded-lg">🗑</button>
                     </div>
                 </div>
             ))}
             <button 
                onClick={() => setEditingEvent({})}
                className="w-full py-4 bg-[#1A1A1A] text-white rounded-[1.5rem] font-bold text-sm shadow-lg shadow-black/10"
             >
                 + Добавить событие
             </button>
        </div>
    );
  };

  const renderSettings = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-[#1A1A1A]">Основные настройки</h3>
              
              <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Название Приложения</label>
                  <input 
                    value={config.appName} 
                    onChange={e => onUpdateConfig({...config, appName: e.target.value})} 
                    className="w-full bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200" 
                  />
              </div>

              <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 mb-1 block">Основной цвет (HEX)</label>
                  <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={config.primaryColor} 
                        onChange={e => onUpdateConfig({...config, primaryColor: e.target.value})} 
                        className="h-10 w-10 rounded-lg cursor-pointer border-0" 
                      />
                      <input 
                        value={config.primaryColor} 
                        onChange={e => onUpdateConfig({...config, primaryColor: e.target.value})} 
                        className="flex-1 bg-slate-50 p-3 rounded-xl text-sm font-bold border border-slate-200 uppercase" 
                      />
                  </div>
              </div>
          </div>

          <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm space-y-4">
              <h3 className="font-black text-[#1A1A1A]">AI Личность (System Prompt)</h3>
              <p className="text-xs text-slate-500">Это базовая инструкция для всех чатов в приложении. Меняйте осторожно.</p>
              <textarea 
                rows={8}
                value={config.systemInstruction} 
                onChange={e => onUpdateConfig({...config, systemInstruction: e.target.value})} 
                className="w-full bg-slate-50 p-3 rounded-xl text-sm border border-slate-200 font-mono" 
              />
          </div>
          
          <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-center">
              <p className="text-red-500 text-xs font-bold uppercase mb-2">Опасная зона</p>
              <button 
                onClick={() => { if(confirm('Удалить ВСЕ данные приложения (уроки, пользователей)?')) Storage.clear(); }}
                className="text-red-600 underline text-xs font-bold"
              >
                  Полный сброс (Hard Reset)
              </button>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#F2F4F6] pb-32 text-[#1A1A1A]">
      {/* Header */}
      <div className="pt-12 px-6 pb-6">
          <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-[#1A1A1A] rounded-xl flex items-center justify-center text-white text-lg shadow-lg">⚙️</div>
              <h1 className="text-2xl font-black text-[#1A1A1A]">Admin Panel</h1>
          </div>
          <p className="text-slate-400 text-xs font-bold uppercase tracking-widest pl-1">Control Center v2.0</p>
      </div>

      {/* Navigation */}
      <div className="px-6 mb-8 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 p-1 bg-white/50 backdrop-blur-sm rounded-2xl w-fit border border-white/50">
              {[
                  { id: 'OVERVIEW', label: 'Обзор' },
                  { id: 'COURSE', label: 'Курс' },
                  { id: 'USERS', label: 'Люди' },
                  { id: 'CALENDAR', label: 'События' },
                  { id: 'SETTINGS', label: 'Настройки' }
              ].map(tab => (
                  <button 
                    key={tab.id}
                    onClick={() => { setActiveTab(tab.id as AdminTab); setEditingModule(null); setEditingLesson(null); }}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                        activeTab === tab.id ? 'bg-[#1A1A1A] text-white shadow-md' : 'text-slate-400 hover:text-[#1A1A1A]'
                    }`}
                  >
                      {tab.label}
                  </button>
              ))}
          </div>
      </div>

      {/* Main Content Area */}
      <div className="px-6 max-w-3xl mx-auto">
          {activeTab === 'OVERVIEW' && renderOverview()}
          {activeTab === 'COURSE' && renderCourseManager()}
          {activeTab === 'USERS' && renderUserManager()}
          {activeTab === 'CALENDAR' && renderCalendarManager()}
          {activeTab === 'SETTINGS' && renderSettings()}
      </div>
    </div>
  );
};
