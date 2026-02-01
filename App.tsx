
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
import { telegram } from './services/telegramService';
import { Toast, ToastMessage } from './components/Toast';

const DEFAULT_CONFIG: AppConfig = {
  appName: 'SalesPro: 300 Spartans',
  appDescription: 'Elite Sales Academy',
  primaryColor: '#1A1A1A',
  systemInstruction: `Ты — Командир элитного отряда продаж "300 Спартанцев". Твоя задача: сделать из новобранца (пользователя) настоящую машину продаж.`,
  integrations: {
    telegramBotToken: '',
    googleDriveFolderId: '',
    crmWebhookUrl: '',
    aiModelVersion: 'gemini-1.5-pro'
  },
  features: {
    enableRealTimeSync: false,
    autoApproveHomework: false,
    maintenanceMode: false,
    allowStudentChat: true,
    publicLeaderboard: true
  }
};

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.MODULES);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [avatarRegenerating, setAvatarRegenerating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Load state from local storage or use defaults
  const [appConfig, setAppConfig] = useState<AppConfig>(() => Storage.get<AppConfig>('appConfig', DEFAULT_CONFIG));
  const [modules, setModules] = useState<Module[]>(() => Storage.get<Module[]>('courseModules', COURSE_MODULES));
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.get<CalendarEvent[]>('calendarEvents', MOCK_EVENTS));
  const [allUsers, setAllUsers] = useState<UserProgress[]>(() => Storage.get<UserProgress[]>('allUsers', []));

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

  // Persistence Effect
  useEffect(() => {
    setIsSyncing(true);
    Storage.set('progress', userProgress);
    Storage.set('appConfig', appConfig);
    Storage.set('courseModules', modules);
    Storage.set('calendarEvents', events);
    Storage.set('allUsers', allUsers);

    const timeout = setTimeout(() => setIsSyncing(false), 800);
    return () => clearTimeout(timeout);
  }, [userProgress, appConfig, modules, events, allUsers]);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    if (type === 'success') telegram.haptic('success');
    if (type === 'error') telegram.haptic('error');
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const handleLogin = (data: any) => {
    // Check if it's an existing user login or a new registration
    const existingUser = allUsers.find(u => u.telegramUsername === data.telegramUsername);
    
    let newUserState: UserProgress;

    if (existingUser && !data.isRegistration) {
        // Login: Merge existing data
        newUserState = {
            ...existingUser,
            isAuthenticated: true,
            // Update fields if they changed (though usually they don't on login)
        };
    } else {
        // Registration or First Time Admin
        newUserState = {
            ...userProgress,
            isAuthenticated: true,
            role: data.role,
            name: data.name,
            telegramUsername: data.telegramUsername,
            password: data.password, // Store password
            originalPhotoBase64: data.originalPhoto,
            avatarUrl: data.avatarUrl,
            armorStyle: data.armorStyle,
            backgroundStyle: data.backgroundStyle,
            registrationDate: new Date().toISOString()
        };
    }
    
    setUserProgress(newUserState);
    
    setAllUsers(prev => {
        const existingIndex = prev.findIndex(u => u.telegramUsername === data.telegramUsername);
        if (existingIndex >= 0) {
            const updated = [...prev];
            updated[existingIndex] = { ...updated[existingIndex], ...newUserState };
            return updated;
        }
        return [...prev, newUserState];
    });

    addToast('success', `Добро пожаловать, ${newUserState.name}!`);
  };

  const handleLogout = () => {
    setUserProgress(prev => ({ ...prev, isAuthenticated: false }));
    setActiveTab(Tab.MODULES);
    telegram.haptic('medium');
  };

  const handleUpdateUser = (updatedUser: Partial<UserProgress>) => {
      setUserProgress(prev => {
          const next = { ...prev, ...updatedUser };
          setAllUsers(users => users.map(u => u.name === prev.name ? { ...u, ...updatedUser } : u));
          return next;
      });
  };

  const handleLessonComplete = (lessonId: string) => {
    if (userProgress.completedLessonIds.includes(lessonId)) return;
    const lesson = modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    if (lesson) {
      const newXp = userProgress.xp + lesson.xpReward;
      const newLevel = Math.max(userProgress.level, Math.floor(newXp / 100) + 1);
      
      const updates: Partial<UserProgress> = {
          xp: newXp,
          level: newLevel,
          completedLessonIds: [...userProgress.completedLessonIds, lessonId]
      };

      handleUpdateUser(updates);
      addToast('success', `Урок пройден! +${lesson.xpReward} XP`);

      if (newLevel > userProgress.level) {
         addToast('info', `ПОВЫШЕНИЕ! Теперь ты Уровень ${newLevel}`);
         if (userProgress.originalPhotoBase64) {
             regenerateAvatar(newLevel, userProgress.originalPhotoBase64, userProgress.armorStyle, userProgress.backgroundStyle);
         }
      }
    }
    setSelectedLesson(null);
  };

  const regenerateAvatar = async (lvl: number, photo: string, armor?: string, bg?: string) => {
     setAvatarRegenerating(true);
     const newAvatar = await generateSpartanAvatar(photo, lvl, armor, bg);
     if (newAvatar) {
         handleUpdateUser({ avatarUrl: newAvatar });
         addToast('success', 'Броня обновлена!');
     }
     setAvatarRegenerating(false);
  };

  if (!userProgress.isAuthenticated) return <Auth onLogin={handleLogin} existingUsers={allUsers} />;

  const currentParentModule = selectedLesson ? modules.find(m => m.lessons.some(l => l.id === selectedLesson.id)) : undefined;

  return (
    <div className="min-h-screen w-full relative">
       {/* Toast Container */}
       <div className="toast-container">
           {toasts.map(toast => (
               <Toast key={toast.id} toast={toast} onRemove={removeToast} />
           ))}
       </div>

       {/* Loading Indicators */}
       {(isSyncing || avatarRegenerating) && (
          <div className="fixed top-4 right-4 z-[100] animate-fade-in pointer-events-none" style={{ paddingTop: 'var(--safe-area-top)' }}>
             <div className="glass px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <div className={`w-2 h-2 rounded-full animate-pulse ${avatarRegenerating ? 'bg-[#FFAB7B]' : 'bg-green-400'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{avatarRegenerating ? 'Forging Armor' : 'Saved'}</span>
             </div>
          </div>
       )}

      <main className="relative z-10 max-w-lg mx-auto md:max-w-2xl bg-[#F9FAFB] min-h-screen shadow-2xl overflow-hidden">
        {selectedLesson ? (
          <LessonView lesson={selectedLesson} isCompleted={userProgress.completedLessonIds.includes(selectedLesson.id)} onComplete={handleLessonComplete} onBack={() => setSelectedLesson(null)} parentModule={currentParentModule} />
        ) : (
          <>
            {activeTab === Tab.MODULES && (
                <ModuleList 
                    modules={modules} 
                    userProgress={userProgress} 
                    onSelectLesson={setSelectedLesson} 
                    onProfileClick={() => setActiveTab(Tab.PROFILE)}
                />
            )}
            {activeTab === Tab.CHAT && <ChatAssistant history={userProgress.chatHistory} onUpdateHistory={(h) => handleUpdateUser({chatHistory: h})} systemInstruction={appConfig.systemInstruction} />}
            {activeTab === Tab.PROFILE && <Profile userProgress={userProgress} onLogout={handleLogout} allUsers={allUsers} onUpdateUser={handleUpdateUser} events={events} />}
            {activeTab === Tab.CURATOR_DASHBOARD && userProgress.role === 'CURATOR' && <CuratorDashboard />}
            {activeTab === Tab.ADMIN_DASHBOARD && userProgress.role === 'ADMIN' && (
                <AdminDashboard 
                    config={appConfig} 
                    onUpdateConfig={setAppConfig} 
                    modules={modules} 
                    onUpdateModules={setModules} 
                    users={allUsers} 
                    onUpdateUsers={setAllUsers} 
                    onUpdateEvents={setEvents}
                    addToast={addToast}
                />
            )}
          </>
        )}
      </main>
      
      <SmartNav activeTab={activeTab} setActiveTab={(t) => { setActiveTab(t); telegram.haptic('selection'); }} role={userProgress.role} selectedLesson={selectedLesson} onExitLesson={() => setSelectedLesson(null)} />
    </div>
  );
};

export default App;
