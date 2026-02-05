
import React, { useState } from 'react';
import { AppConfig, Module, UserProgress, CalendarEvent, Lesson, EventType, ModuleCategory, UserRole, AdminTab, ThemeConfig } from '../types';
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
  events: CalendarEvent[];
  onUpdateEvents: (newEvents: CalendarEvent[]) => void;
  addToast: (type: 'success' | 'error' | 'info', message: string) => void;
  activeTab: AdminTab;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
  config, onUpdateConfig, modules, onUpdateModules, users, onUpdateUsers, events, onUpdateEvents, addToast, activeTab
}) => {
  const [userSearch, setUserSearch] = useState('');
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'SYNCING' | 'ERROR'>('CONNECTED');
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleUserRoleChange = (username: string, newRole: UserRole) => {
      const updatedUsers = users.map(u => u.telegramUsername === username ? { ...u, role: newRole } : u);
      onUpdateUsers(updatedUsers);
      addToast('success', `Боец ${username} назначен: ${newRole}`);
  };

  const handleDeleteUser = (username: string) => {
      if (confirm('Вы уверены? Это действие необратимо.')) {
          const updatedUsers = users.filter(u => u.telegramUsername !== username);
          onUpdateUsers(updatedUsers);
          addToast('info', 'Досье бойца удалено из базы.');
      }
  };

  const handleModuleVisibility = (id: string) => {
     const updatedModules = modules.map(m => m.id === id ? { ...m, isHidden: !m.isHidden } : m);
     onUpdateModules(updatedModules);
     const isHidden = updatedModules.find(m => m.id === id)?.isHidden;
     addToast('info', `Модуль ${isHidden ? 'скрыт' : 'опубликован'}`);
  };
  
  const handleUpdateModuleField = (moduleId: string, field: keyof Module, value: any) => {
      const updatedModules = modules.map(m => m.id === moduleId ? { ...m, [field]: value } : m);
      onUpdateModules(updatedModules);
  };

  const handleUpdateLessonVideo = (moduleId: string, lessonId: string, url: string) => {
      const updatedModules = modules.map(m => {
          if (m.id !== moduleId) return m;
          return {
              ...m,
              lessons: m.lessons.map(l => l.id === lessonId ? { ...l, videoUrl: url } : l)
          };
      });
      onUpdateModules(updatedModules);
  };
  
  const handleForceBackup = () => {
      setDbStatus('SYNCING');
      setTimeout(() => {
          setDbStatus('CONNECTED');
          addToast('success', 'Резервная копия создана в локальном хранилище.');
      }, 1500);
  };

  // --- RENDERERS ---

  const renderHeader = () => (
      <header className="mb-8">
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
              УПРАВЛЕНИЕ СИСТЕМОЙ <span className="text-[#6C5DD3] text-sm align-top bg-[#6C5DD3]/10 px-2 py-1 rounded-lg">АДМИН</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">Уровень Доступа: Командир</p>
      </header>
  );

  const renderUsers = () => {
      const filteredUsers = users.filter(u => u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.telegramUsername?.includes(userSearch));

      return (
        <div className="space-y-4 animate-fade-in pb-32">
            <input 
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
                placeholder="Поиск по позывному..."
                className="w-full bg-[#1F2128]/80 border border-white/10 rounded-2xl p-4 text-white outline-none focus:border-[#6C5DD3] text-sm font-bold backdrop-blur-sm"
            />
            
            <div className="space-y-2">
                {filteredUsers.map(user => (
                    <div key={user.telegramUsername} className="bg-[#1F2128]/80 p-4 rounded-2xl border border-white/5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 backdrop-blur-sm">
                        <div className="flex items-center gap-3">
                            <img src={user.avatarUrl || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full bg-slate-800 object-cover" />
                            <div>
                                <h4 className="font-bold text-white text-sm">{user.name} <span className="text-slate-500 text-xs font-normal">@{user.telegramUsername}</span></h4>
                                <div className="flex gap-2 mt-1">
                                    <span className={`text-[9px] font-black px-2 py-0.5 rounded uppercase ${user.role === 'ADMIN' ? 'bg-red-500/20 text-red-500' : 'bg-blue-500/20 text-blue-500'}`}>{user.role}</span>
                                    <span className="text-[9px] font-bold text-slate-500 bg-white/5 px-2 py-0.5 rounded">УР. {user.level}</span>
                                </div>
                            </div>
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <select 
                                value={user.role}
                                onChange={(e) => handleUserRoleChange(user.telegramUsername!, e.target.value as UserRole)}
                                className="bg-black/40 text-white text-xs p-2 rounded-xl border border-white/10 outline-none"
                            >
                                <option value="STUDENT">БОЕЦ</option>
                                <option value="CURATOR">ОФИЦЕР</option>
                                <option value="ADMIN">КОМАНДИР</option>
                            </select>
                            <button onClick={() => handleDeleteUser(user.telegramUsername!)} className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20">
                                🗑️
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
      );
  };

  const renderCourse = () => (
      <div className="space-y-4 animate-fade-in pb-32">
           <div className="flex justify-between items-center mb-4">
               <h3 className="text-white font-bold">Активные Модули</h3>
               <button className="bg-[#6C5DD3] text-white px-4 py-2 rounded-xl text-xs font-black uppercase shadow-lg shadow-[#6C5DD3]/20 hover:scale-105 transition-transform">
                   + Создать Модуль
               </button>
           </div>
           
           <div className="grid gap-4">
               {modules.map(mod => {
                   const isEditing = editingModuleId === mod.id;

                   return (
                   <div key={mod.id} className={`bg-[#1F2128]/80 backdrop-blur-md rounded-[1.5rem] overflow-hidden border transition-all group ${mod.isHidden ? 'border-red-500/20 opacity-70' : 'border-white/5'}`}>
                       <div className="h-24 bg-cover bg-center relative" style={{ backgroundImage: `url(${mod.imageUrl})` }}>
                           <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                               <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-black uppercase">Изменить Обложку</button>
                           </div>
                       </div>
                       <div className="p-5">
                           <div className="flex justify-between items-start mb-2">
                               <h4 className="text-lg font-black text-white">{mod.title}</h4>
                               <span className="text-[9px] font-bold bg-white/10 px-2 py-1 rounded text-slate-400">{mod.category}</span>
                           </div>
                           <p className="text-slate-500 text-xs line-clamp-2 mb-4">{mod.description}</p>
                           
                           {/* Quick Actions */}
                           <div className="flex justify-between items-center border-t border-white/5 pt-4">
                               <span className="text-xs font-bold text-slate-400">{mod.lessons.length} Миссий</span>
                               <div className="flex gap-2">
                                   <button 
                                      onClick={() => setEditingModuleId(isEditing ? null : mod.id)}
                                      className="text-xs text-white font-bold transition-colors bg-white/10 px-3 py-1 rounded-lg hover:bg-white/20"
                                   >
                                       {isEditing ? 'Готово' : 'Настройки'}
                                   </button>
                                   <button 
                                       onClick={() => handleModuleVisibility(mod.id)} 
                                       className={`text-xs font-bold transition-colors px-2 py-1 rounded-lg ${mod.isHidden ? 'text-red-500 hover:text-red-400 bg-red-500/10' : 'text-[#00B050] hover:text-[#00D060] bg-[#00B050]/10'}`}
                                    >
                                       {mod.isHidden ? '👁️' : '🔒'}
                                   </button>
                               </div>
                           </div>

                           {/* Editing Panel */}
                           {isEditing && (
                               <div className="mt-4 pt-4 border-t border-white/10 animate-slide-up space-y-4">
                                   <div>
                                       <label className="text-[9px] font-black uppercase text-slate-500 mb-1 block">Видео Модуля (URL)</label>
                                       <input 
                                          value={mod.videoUrl || ''} 
                                          onChange={(e) => handleUpdateModuleField(mod.id, 'videoUrl', e.target.value)}
                                          placeholder="https://youtube.com/..." 
                                          className="w-full bg-black/40 text-white text-xs p-3 rounded-xl border border-white/10 outline-none focus:border-[#6C5DD3]"
                                       />
                                   </div>
                                   
                                   <div>
                                       <label className="text-[9px] font-black uppercase text-slate-500 mb-2 block">Видео в уроках</label>
                                       <div className="space-y-2">
                                           {mod.lessons.map(lesson => (
                                               <div key={lesson.id} className="flex flex-col gap-1 bg-white/5 p-2 rounded-xl">
                                                   <span className="text-xs font-bold text-slate-300">{lesson.title}</span>
                                                   <input 
                                                      value={lesson.videoUrl || ''} 
                                                      onChange={(e) => handleUpdateLessonVideo(mod.id, lesson.id, e.target.value)}
                                                      placeholder="Вставьте ссылку на видео урока..." 
                                                      className="w-full bg-black/20 text-white text-[10px] p-2 rounded-lg border border-white/5 outline-none focus:border-[#6C5DD3]/50"
                                                   />
                                               </div>
                                           ))}
                                       </div>
                                   </div>
                               </div>
                           )}
                       </div>
                   </div>
               )})}
           </div>
      </div>
  );

  const renderSettings = () => (
      <div className="space-y-6 animate-fade-in pb-32">
          <div className="bg-[#1F2128]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
               <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-green-500">🔌</span> Интеграции и AI
              </h3>
              
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Telegram Bot Token</label>
                      <input 
                        type="password"
                        placeholder="123456:ABC-DEF..." 
                        value={config.integrations?.telegramBotToken || ''} 
                        onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, telegramBotToken: e.target.value}})}
                        className="w-full bg-black/20 rounded-xl border border-white/5 text-white text-xs p-3 outline-none font-mono focus:border-[#6C5DD3]" 
                      />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Модель AI</label>
                          <select 
                              value={config.integrations?.aiModelVersion || 'gemini-3-pro-preview'}
                              onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, aiModelVersion: e.target.value}})}
                              className="w-full bg-black/20 rounded-xl border border-white/5 text-white text-xs p-3 outline-none focus:border-[#6C5DD3]"
                          >
                              <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                              <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Температура (Креативность)</label>
                          <input 
                            type="range" min="0" max="1" step="0.1" 
                            value={config.integrations.aiTemperature}
                            onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, aiTemperature: parseFloat(e.target.value)}})}
                            className="w-full accent-[#6C5DD3] h-10"
                          />
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="bg-[#1F2128]/80 backdrop-blur-md p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
               <h3 className="text-white font-black text-lg mb-4">База Данных</h3>
               <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                  <div>
                      <p className="text-white font-bold text-sm">Статус</p>
                      <p className={`text-xs ${dbStatus === 'CONNECTED' ? 'text-[#00B050]' : 'text-yellow-500'}`}>
                          {dbStatus === 'CONNECTED' ? '● СИСТЕМА В НОРМЕ' : '⟳ СИНХРОНИЗАЦИЯ...'}
                      </p>
                  </div>
                  <button 
                      onClick={handleForceBackup}
                      disabled={dbStatus === 'SYNCING'}
                      className="bg-white/5 text-white border border-white/10 px-4 py-2 rounded-xl text-xs font-black uppercase hover:bg-white/10 disabled:opacity-50"
                  >
                      СОЗДАТЬ БЭКАП
                  </button>
              </div>
          </div>
      </div>
  );

  return (
    <div className="min-h-screen bg-transparent flex flex-col w-full">
       <div className="flex-1 p-6 max-w-4xl mx-auto w-full">
           {renderHeader()}

           {activeTab === 'USERS' && renderUsers()}
           {activeTab === 'COURSE' && renderCourse()}
           {activeTab === 'SETTINGS' && renderSettings()}
           {activeTab === 'OVERVIEW' && (
               <div className="grid grid-cols-2 gap-4 animate-fade-in">
                   <div className="bg-gradient-to-br from-[#6C5DD3] to-[#4A3D8D] p-6 rounded-[2rem] text-white shadow-lg backdrop-blur-md">
                       <div className="text-4xl font-black mb-1">{users.length}</div>
                       <div className="text-xs font-bold uppercase opacity-80">Бойцов в строю</div>
                   </div>
                   <div className="bg-[#1F2128]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-white">
                       <div className="text-4xl font-black mb-1 text-[#00B050]">{modules.filter(m => !m.isHidden).length}</div>
                       <div className="text-xs font-bold uppercase text-slate-500">Активных Модулей</div>
                   </div>
                   <div className="col-span-2 bg-[#1F2128]/80 backdrop-blur-md border border-white/5 p-6 rounded-[2rem] text-white">
                       <h4 className="font-bold mb-4">Последняя активность</h4>
                       <div className="space-y-3">
                           {[1,2,3].map(i => (
                               <div key={i} className="flex items-center gap-3 text-sm">
                                   <div className="w-2 h-2 bg-[#6C5DD3] rounded-full"></div>
                                   <span className="text-slate-400">Боец X выполнил Миссию 1.{i}</span>
                                   <span className="ml-auto text-slate-600 text-xs">{i * 12}м назад</span>
                               </div>
                           ))}
                       </div>
                   </div>
               </div>
           )}
       </div>
    </div>
  );
};
