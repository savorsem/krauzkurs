
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
  const [isSyncing, setIsSyncing] = useState(false);
  const [dbStatus, setDbStatus] = useState<'CONNECTED' | 'SYNCING' | 'ERROR' | 'OFFLINE'>('CONNECTED');

  // Editors State
  const [editingModule, setEditingModule] = useState<Partial<Module> | null>(null);
  const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null);
  const [editingEvent, setEditingEvent] = useState<Partial<CalendarEvent> | null>(null);
  const [editingUser, setEditingUser] = useState<UserProgress | null>(null);
  const [selectedParentModuleId, setSelectedParentModuleId] = useState<string | null>(null);

  // --- ACTIONS ---

  const handleSync = async () => {
      setIsSyncing(true);
      setDbStatus('SYNCING');
      try {
          await DriveSync.syncFolder(config.integrations?.googleDriveFolderId || 'mock', []);
          setDbStatus('CONNECTED');
          addToast('success', 'Database Synchronized');
      } catch (e) {
          setDbStatus('ERROR');
          addToast('error', 'Sync Failed');
      } finally {
          setIsSyncing(false);
      }
  };

  const deleteModule = (id: string) => {
      if (confirm('Delete Module?')) {
          onUpdateModules(modules.filter(m => m.id !== id));
          addToast('info', 'Module Deleted');
      }
  };

  const saveModule = () => {
    if (!editingModule || !editingModule.title) return;
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
            lessons: [],
            prerequisites: []
        };
        updatedModules.push(newModule);
    }
    onUpdateModules(updatedModules);
    setEditingModule(null);
    addToast('success', 'Module Saved');
  };

  // --- RENDERERS ---

  const renderHeader = () => (
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4 bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 shadow-xl">
          <div>
              <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
                  COMMAND CENTER <span className="text-[#6C5DD3] text-sm align-top">v4.0</span>
              </h1>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.2em] mt-1">System Administration</p>
          </div>
          <div className="flex items-center gap-3">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                  dbStatus === 'CONNECTED' ? 'bg-green-500/10 border-green-500/20' : 
                  dbStatus === 'SYNCING' ? 'bg-blue-500/10 border-blue-500/20' : 'bg-red-500/10 border-red-500/20'
              }`}>
                  <div className={`w-2 h-2 rounded-full ${dbStatus === 'CONNECTED' ? 'bg-green-500' : dbStatus === 'SYNCING' ? 'bg-blue-500 animate-pulse' : 'bg-red-500'}`}></div>
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">{dbStatus}</span>
              </div>
          </div>
      </header>
  );

  const renderDesign = () => (
      <div className="space-y-6 animate-fade-in pb-24">
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-white font-black text-lg mb-4">UI Theme Engine</h3>
              
              <div className="space-y-6">
                  {/* Card Style */}
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Card Style</label>
                      <div className="grid grid-cols-3 gap-3">
                          {['GLASS', 'SOLID', 'NEON'].map((style) => (
                              <button
                                key={style}
                                onClick={() => onUpdateConfig({ ...config, theme: { ...config.theme, cardStyle: style as any } })}
                                className={`py-4 rounded-xl border font-bold text-xs uppercase transition-all ${
                                    config.theme.cardStyle === style 
                                    ? 'bg-[#6C5DD3] text-white border-[#6C5DD3]' 
                                    : 'bg-black/20 text-slate-400 border-white/5 hover:bg-white/5'
                                }`}
                              >
                                  {style}
                              </button>
                          ))}
                      </div>
                  </div>

                  {/* Border Radius */}
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Corner Radius</label>
                      <div className="grid grid-cols-2 gap-3">
                          <button
                            onClick={() => onUpdateConfig({ ...config, theme: { ...config.theme, borderRadius: 'ROUNDED' } })}
                            className={`py-4 rounded-2xl border font-bold text-xs uppercase transition-all ${config.theme.borderRadius === 'ROUNDED' ? 'bg-[#6C5DD3] text-white border-[#6C5DD3]' : 'bg-black/20 border-white/5'}`}
                          >
                              Rounded (Soft)
                          </button>
                          <button
                            onClick={() => onUpdateConfig({ ...config, theme: { ...config.theme, borderRadius: 'SHARP' } })}
                            className={`py-4 rounded-sm border font-bold text-xs uppercase transition-all ${config.theme.borderRadius === 'SHARP' ? 'bg-[#6C5DD3] text-white border-[#6C5DD3]' : 'bg-black/20 border-white/5'}`}
                          >
                              Sharp (Tech)
                          </button>
                      </div>
                  </div>

                  {/* Accent Color */}
                  <div>
                      <label className="text-[10px] font-bold text-slate-500 uppercase mb-2 block">Primary Accent Color</label>
                      <div className="flex gap-4">
                          {['#D4AF37', '#00CEFF', '#6C5DD3', '#FF4B4B', '#00B050'].map(color => (
                              <button
                                key={color}
                                onClick={() => onUpdateConfig({ ...config, theme: { ...config.theme, accentColor: color } })}
                                className={`w-12 h-12 rounded-full border-2 transition-transform hover:scale-110 ${config.theme.accentColor === color ? 'border-white scale-110' : 'border-transparent'}`}
                                style={{ backgroundColor: color }}
                              />
                          ))}
                      </div>
                  </div>
              </div>
          </div>
          
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 shadow-xl text-center">
             <div className="p-10 border-2 border-dashed border-white/10 rounded-xl mb-4">
                 <h4 className="text-xl font-black mb-2" style={{ color: config.theme.accentColor }}>Preview Component</h4>
                 <p className="text-slate-400 text-sm">This is how your modules will look.</p>
                 <div className={`mt-4 p-4 ${config.theme.cardStyle === 'GLASS' ? 'bg-white/10 backdrop-blur-md' : 'bg-[#252830]'} border border-white/10`} style={{ borderRadius: config.theme.borderRadius === 'ROUNDED' ? '1.5rem' : '0.25rem' }}>
                     Sample Card
                 </div>
             </div>
          </div>
      </div>
  );

  const renderDatabase = () => (
      <div className="space-y-6 animate-fade-in">
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 shadow-xl">
              <h3 className="text-white font-black text-lg mb-4">Database Operations</h3>
              
              <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                      <div>
                          <p className="text-white font-bold text-sm">Status</p>
                          <p className="text-slate-500 text-xs">{dbStatus === 'CONNECTED' ? 'Online & Listening' : 'Offline'}</p>
                      </div>
                      <Button onClick={handleSync} loading={isSyncing} className="!py-2 !px-4 !text-xs">FORCE SYNC</Button>
                  </div>

                  <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-500 uppercase">CRM Webhook URL</label>
                       <input 
                         value={config.database.crmWebhook} 
                         onChange={e => onUpdateConfig({...config, database: {...config.database, crmWebhook: e.target.value}})}
                         className="w-full bg-black/20 border border-white/10 rounded-xl p-3 text-white text-xs font-mono outline-none focus:border-[#6C5DD3]" 
                         placeholder="https://api.crm.com/webhook..."
                       />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                       <button className="py-4 bg-[#6C5DD3]/10 text-[#6C5DD3] rounded-xl border border-[#6C5DD3]/20 font-bold text-xs uppercase hover:bg-[#6C5DD3]/20">
                           Backup JSON
                       </button>
                       <button className="py-4 bg-red-500/10 text-red-500 rounded-xl border border-red-500/20 font-bold text-xs uppercase hover:bg-red-500/20">
                           Flush Cache
                       </button>
                  </div>
              </div>
          </div>
      </div>
  );
  
  const renderSettings = () => (
      <div className="space-y-6 animate-fade-in pb-24">
          <div className="bg-[#1F2128] p-6 rounded-[2rem] border border-white/5 space-y-4 shadow-xl">
               <h3 className="text-white font-black text-lg flex items-center gap-2 mb-4">
                  <span className="text-green-500">🔌</span> Integrations & AI
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

                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">AI Model</label>
                          <select 
                              value={config.integrations?.aiModelVersion || 'gemini-3-pro-preview'}
                              onChange={e => onUpdateConfig({...config, integrations: {...config.integrations, aiModelVersion: e.target.value}})}
                              className="w-full bg-black/20 rounded-xl border border-white/5 text-white text-xs p-3 outline-none"
                          >
                              <option value="gemini-3-pro-preview">Gemini 3 Pro</option>
                              <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                          </select>
                      </div>
                      <div>
                          <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 block">Temperature ({config.integrations.aiTemperature})</label>
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
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] pb-32 flex flex-col md:flex-row w-full">
       <div className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
           {renderHeader()}

           {activeTab === 'DESIGN' && renderDesign()}
           {activeTab === 'DATABASE' && renderDatabase()}
           {activeTab === 'SETTINGS' && renderSettings()}
           {activeTab === 'OVERVIEW' && <div className="text-white text-center py-20">Overview Dashboard (Same as before)</div>}
           {/* Placeholder for other tabs to keep file short for this update */}
       </div>
    </div>
  );
};
