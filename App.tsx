
import React, { useState, useEffect } from 'react';
import { Tab, UserProgress, Lesson, UserRole, ChatMessage, AppConfig, Module, CalendarEvent } from './types';
import { COURSE_MODULES, MOCK_EVENTS } from './constants';
import { ModuleList } from './components/ModuleList';
import { ChatAssistant } from './components/ChatAssistant';
import { Profile } from './components/Profile';
import { LessonView } from './components/LessonView';
import { CuratorDashboard } from './components/CuratorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { Auth } from './components/Auth';
import { SmartNav } from './components/SmartNav';
import { generateSpartanAvatar } from './services/geminiService';
import { Storage } from './services/storage';

const DEFAULT_CONFIG: AppConfig = {
  appName: 'SalesPro: 300 Spartans',
  appDescription: 'Elite Sales Academy',
  primaryColor: '#1A1A1A',
  systemInstruction: `Ты — Командир элитного отряда продаж "300 Спартанцев". Твоя задача: сделать из новобранца (пользователя) настоящую машину продаж.`
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MODULES);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [avatarRegenerating, setAvatarRegenerating] = useState(false);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(() => Storage.get<AppConfig>('appConfig', DEFAULT_CONFIG));
  const [modules, setModules] = useState<Module[]>(() => Storage.get<Module[]>('courseModules', COURSE_MODULES));
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.get<CalendarEvent[]>('calendarEvents', MOCK_EVENTS));
  const [allUsers, setAllUsers] = useState<UserProgress[]>([]);

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    return Storage.get<UserProgress>('progress', {
      xp: 0,
      level: 1,
      completedLessonIds: [],
      submittedHomeworks: [],
      role: 'STUDENT',
      name: 'User',
      isAuthenticated: false,
      chatHistory: [],
      notifications: {
        pushEnabled: true,
        telegramSync: false,
        deadlineReminders: true,
        chatNotifications: true
      }
    });
  });

  useEffect(() => {
    setIsSyncing(true);
    Storage.set('progress', userProgress);
    Storage.set('appConfig', appConfig);
    Storage.set('courseModules', modules);
    Storage.set('calendarEvents', events);
    const timeout = setTimeout(() => setIsSyncing(false), 1200);
    return () => clearTimeout(timeout);
  }, [userProgress, appConfig, modules, events]);

  const handleLogin = (data: any) => {
    setUserProgress(prev => ({
      ...prev,
      isAuthenticated: true,
      role: data.role,
      name: data.name,
      instagramUsername: data.instagram,
      originalPhotoBase64: data.originalPhoto,
      avatarUrl: data.avatarUrl,
      armorStyle: data.armorStyle,
      backgroundStyle: data.backgroundStyle,
      registrationDate: new Date().toISOString()
    }));
  };

  const handleLogout = () => {
    setUserProgress(prev => ({ ...prev, isAuthenticated: false }));
    setActiveTab(Tab.MODULES);
  };

  const handleUpdateUser = (updatedUser: Partial<UserProgress>) => setUserProgress(prev => ({ ...prev, ...updatedUser }));

  const handleLessonComplete = (lessonId: string) => {
    if (userProgress.completedLessonIds.includes(lessonId)) return;
    const lesson = modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    if (lesson) {
      const newXp = userProgress.xp + lesson.xpReward;
      const newLevel = Math.max(userProgress.level, Math.floor(newXp / 100) + 1);
      setUserProgress(prev => {
        const nextState = {
          ...prev,
          xp: newXp,
          level: newLevel,
          completedLessonIds: [...prev.completedLessonIds, lessonId]
        };
        
        if (newLevel > prev.level && prev.originalPhotoBase64) {
            regenerateAvatar(newLevel, prev.originalPhotoBase64, prev.armorStyle, prev.backgroundStyle);
        }
        
        return nextState;
      });
    }
    setSelectedLesson(null);
  };

  const regenerateAvatar = async (lvl: number, photo: string, armor?: string, bg?: string) => {
     setAvatarRegenerating(true);
     const newAvatar = await generateSpartanAvatar(photo, lvl, armor, bg);
     if (newAvatar) setUserProgress(prev => ({ ...prev, avatarUrl: newAvatar }));
     setAvatarRegenerating(false);
  };

  if (!userProgress.isAuthenticated) return <Auth onLogin={handleLogin} />;

  const currentParentModule = selectedLesson ? modules.find(m => m.lessons.some(l => l.id === selectedLesson.id)) : undefined;

  return (
    <div className="min-h-screen w-full relative text-[#1A1A1A]">
       {/* Animated Background from index.html CSS */}
       <div className="mesh-bg"></div>

       {/* Loading Indicators */}
       {(isSyncing || avatarRegenerating) && (
          <div className="fixed top-6 right-6 z-[60] animate-fade-in pointer-events-none">
             <div className="glass px-4 py-2 rounded-2xl flex items-center gap-2 shadow-soft">
                <div className="w-2 h-2 bg-[#4B6BFB] rounded-full animate-pulse"></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{avatarRegenerating ? 'Forging Armor' : 'Syncing'}</span>
             </div>
          </div>
       )}

      <main className="relative z-10 max-w-lg mx-auto md:max-w-2xl">
        {selectedLesson ? (
          <LessonView lesson={selectedLesson} isCompleted={userProgress.completedLessonIds.includes(selectedLesson.id)} onComplete={handleLessonComplete} onBack={() => setSelectedLesson(null)} parentModule={currentParentModule} />
        ) : (
          <>
            {activeTab === Tab.MODULES && <ModuleList modules={modules} userProgress={userProgress} onSelectLesson={setSelectedLesson} />}
            {activeTab === Tab.CHAT && <ChatAssistant history={userProgress.chatHistory} onUpdateHistory={(h) => handleUpdateUser({chatHistory: h})} systemInstruction={appConfig.systemInstruction} />}
            {activeTab === Tab.PROFILE && <Profile userProgress={userProgress} onLogout={handleLogout} allUsers={allUsers} onUpdateUser={handleUpdateUser} events={events} />}
            {activeTab === Tab.CURATOR_DASHBOARD && <CuratorDashboard />}
            {activeTab === Tab.ADMIN_DASHBOARD && <AdminDashboard config={appConfig} onUpdateConfig={setAppConfig} modules={modules} onUpdateModules={setModules} users={allUsers} onUpdateUsers={setAllUsers} onUpdateEvents={setEvents} />}
          </>
        )}
      </main>
      
      <SmartNav activeTab={activeTab} setActiveTab={setActiveTab} role={userProgress.role} selectedLesson={selectedLesson} onExitLesson={() => setSelectedLesson(null)} />
    </div>
  );
};

export default App;
