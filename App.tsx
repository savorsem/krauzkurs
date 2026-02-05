
import React, { useState, useEffect } from 'react';
import { Tab, UserProgress, Lesson, AppConfig, Module, CalendarEvent, AdminTab } from './types';
import { COURSE_MODULES, MOCK_EVENTS } from './constants';
import { ModuleList } from './components/ModuleList';
import { ChatAssistant } from './components/ChatAssistant';
import { Profile } from './components/Profile';
import { LessonView } from './components/LessonView';
import { CuratorDashboard } from './components/CuratorDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CalendarView } from './components/CalendarView';
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
  theme: {
      cardStyle: 'GLASS',
      borderRadius: 'ROUNDED',
      accentColor: '#D4AF37'
  },
  database: {
      syncEnabled: true,
      lastBackup: null,
      crmWebhook: '',
      autoBackupInterval: 'DAILY'
  },
  integrations: {
    telegramBotToken: '',
    googleDriveFolderId: '',
    aiModelVersion: 'gemini-3-pro-preview',
    aiTemperature: 0.7
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
  const [activeAdminTab, setActiveAdminTab] = useState<AdminTab>('OVERVIEW');
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [avatarRegenerating, setAvatarRegenerating] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  const [appConfig, setAppConfig] = useState<AppConfig>(() => Storage.get<AppConfig>('appConfig', DEFAULT_CONFIG));
  const [modules, setModules] = useState<Module[]>(() => Storage.get<Module[]>('courseModules', COURSE_MODULES));
  const [events, setEvents] = useState<CalendarEvent[]>(() => Storage.get<CalendarEvent[]>('calendarEvents', MOCK_EVENTS));
  const [allUsers, setAllUsers] = useState<UserProgress[]>(() => Storage.get<UserProgress[]>('allUsers', []));

  const [userProgress, setUserProgress] = useState<UserProgress>(() => {
    return Storage.get<UserProgress>('progress', {
      xp: 0,
      level: 1,
      completedLessonIds: [],
      completedModuleIds: [],
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
      },
      stats: {
          referrals: 0,
          storyReposts: 0,
          questionsAsked: {},
          notebookEntries: { habits: 0, goals: 0, gratitude: 0 },
          suggestionsMade: 0,
          webinarsAttended: 0,
          skills: { sales: 10, tactics: 10, psychology: 10, discipline: 10 }
      }
    });
  });

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

  const calculateTotalXpGained = (base: number, bonus: number, level: number) => {
    const levelBonus = Math.floor(level * 5); 
    return base + bonus + levelBonus;
  };

  const handleLogin = (data: any) => {
    const existingUser = allUsers.find(u => u.telegramUsername === data.telegramUsername);
    let newUserState: UserProgress;

    const defaultStats = {
        referrals: 0,
        storyReposts: 0,
        questionsAsked: {},
        notebookEntries: { habits: 0, goals: 0, gratitude: 0 },
        suggestionsMade: 0,
        webinarsAttended: 0,
        skills: { sales: 20, tactics: 20, psychology: 20, discipline: 50 }
    };

    if (existingUser && !data.isRegistration) {
        newUserState = {
            ...existingUser,
            isAuthenticated: true,
            stats: existingUser.stats || defaultStats
        };
    } else {
        newUserState = {
            ...userProgress,
            isAuthenticated: true,
            role: data.role,
            name: data.name,
            telegramUsername: data.telegramUsername,
            password: data.password, 
            originalPhotoBase64: data.originalPhoto,
            avatarUrl: data.avatarUrl,
            armorStyle: data.armorStyle,
            backgroundStyle: data.backgroundStyle,
            registrationDate: new Date().toISOString(),
            stats: defaultStats
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

    addToast('success', `Система синхронизирована. Приветствую, ${newUserState.name}.`);
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

  const handleLessonComplete = (lessonId: string, bonusXp: number = 0) => {
    if (userProgress.completedLessonIds.includes(lessonId)) return;
    
    const lesson = modules.flatMap(m => m.lessons).find(l => l.id === lessonId);
    if (!lesson) return;
    const parentModule = modules.find(m => m.lessons.some(l => l.id === lessonId));

    const totalXpAwarded = calculateTotalXpGained(lesson.xpReward, bonusXp, userProgress.level);
    const newTotalXp = userProgress.xp + totalXpAwarded;
    const newLevel = Math.max(userProgress.level, Math.floor(newTotalXp / 100) + 1);
    
    const updatedCompletedLessons = [...userProgress.completedLessonIds, lessonId];
    
    // Check for Module Completion
    const newlyCompletedModules: string[] = [];
    modules.forEach(mod => {
        if (!userProgress.completedModuleIds.includes(mod.id)) {
            const allLessonsDone = mod.lessons.every(l => updatedCompletedLessons.includes(l.id));
            if (allLessonsDone) {
                newlyCompletedModules.push(mod.id);
            }
        }
    });
    
    // Update Skills based on category
    const currentSkills = { ...userProgress.stats.skills };
    if (parentModule) {
        if (parentModule.category === 'SALES') currentSkills.sales += 5;
        if (parentModule.category === 'TACTICS') currentSkills.tactics += 5;
        if (parentModule.category === 'PSYCHOLOGY') currentSkills.psychology += 5;
    }
    currentSkills.discipline += 2; // Every lesson adds discipline

    const updates: Partial<UserProgress> = {
        xp: newTotalXp,
        level: newLevel,
        completedLessonIds: updatedCompletedLessons,
        completedModuleIds: [...userProgress.completedModuleIds, ...newlyCompletedModules],
        stats: { ...userProgress.stats, skills: currentSkills }
    };

    handleUpdateUser(updates);
    addToast('success', `Миссия выполнена! +${totalXpAwarded} XP`);

    if (newlyCompletedModules.length > 0) {
        addToast('success', `Модуль полностью пройден!`);
    }

    if (newLevel > userProgress.level) {
       addToast('info', `ПОВЫШЕНИЕ! Теперь ты Уровень ${newLevel}`);
       if (userProgress.originalPhotoBase64) {
           regenerateAvatar(newLevel, userProgress.originalPhotoBase64, userProgress.armorStyle, userProgress.backgroundStyle);
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

  const handleNotebookAction = (type: 'HABIT' | 'GOAL' | 'GRATITUDE' | 'SUGGESTION') => {
      let xpAward = 0;
      const stats = { ...userProgress.stats };
      
      if (type === 'HABIT') { xpAward = 5; stats.notebookEntries.habits++; stats.skills.discipline++; }
      if (type === 'GOAL') { xpAward = 10; stats.notebookEntries.goals++; stats.skills.discipline++; }
      if (type === 'GRATITUDE') { xpAward = 10; stats.notebookEntries.gratitude++; stats.skills.psychology++; }
      if (type === 'SUGGESTION') { xpAward = 50; stats.suggestionsMade++; stats.skills.tactics++; }

      const newXp = userProgress.xp + xpAward;
      handleUpdateUser({ xp: newXp, stats });
      addToast('success', `Запись в блокнот: +${xpAward} XP`);
  };

  const handleReferral = () => {
      const xpAward = 10000;
      const newXp = userProgress.xp + xpAward;
      const stats = { ...userProgress.stats, referrals: userProgress.stats.referrals + 1 };
      handleUpdateUser({ xp: newXp, stats });
      addToast('success', `Боец завербован! +${xpAward} XP`);
  };

  const handleShareStory = () => {
      if (userProgress.stats.storyReposts >= 5) {
          addToast('error', 'Лимит наград за репосты (5) исчерпан.');
          return;
      }
      const xpAward = 400;
      const newXp = userProgress.xp + xpAward;
      const stats = { ...userProgress.stats, storyReposts: userProgress.stats.storyReposts + 1 };
      handleUpdateUser({ xp: newXp, stats });
      addToast('success', `Репост учтен! +${xpAward} XP`);
  };

  const handleAskQuestion = (question: string) => {
      if(!selectedLesson) return;
      const lessonId = selectedLesson.id;
      const currentCount = userProgress.stats.questionsAsked[lessonId] || 0;
      
      if (currentCount >= 5) {
           addToast('error', 'Лимит вопросов к этому уроку (5) исчерпан.');
           return;
      }

      const xpAward = 10;
      const newXp = userProgress.xp + xpAward;
      const stats = { 
          ...userProgress.stats, 
          questionsAsked: { ...userProgress.stats.questionsAsked, [lessonId]: currentCount + 1 } 
      };
      
      handleUpdateUser({ xp: newXp, stats });
      addToast('success', `Вопрос задан! +${xpAward} XP`);
  };

  const handleGlobalAskQuestion = () => {
      alert("Нажмите кнопку '?' внутри урока, чтобы отправить вопрос.");
  };

  if (!userProgress.isAuthenticated) return <Auth onLogin={handleLogin} existingUsers={allUsers} />;

  const currentParentModule = selectedLesson ? modules.find(m => m.lessons.some(l => l.id === selectedLesson.id)) : undefined;

  return (
    <div className="min-h-screen w-full relative bg-[#0F1115]">
       <div className="toast-container">
           {toasts.map(toast => (
               <Toast key={toast.id} toast={toast} onRemove={removeToast} />
           ))}
       </div>

       {(isSyncing || avatarRegenerating) && (
          <div className="fixed top-4 right-4 z-[100] animate-fade-in pointer-events-none" style={{ paddingTop: 'var(--safe-area-top)' }}>
             <div className="glass px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                <div className={`w-2 h-2 rounded-full animate-pulse ${avatarRegenerating ? 'bg-[#FFAB7B]' : 'bg-green-400'}`}></div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{avatarRegenerating ? 'Forging Armor' : 'Saved'}</span>
             </div>
          </div>
       )}

      <main className="relative z-10 max-w-lg mx-auto md:max-w-2xl min-h-screen shadow-2xl overflow-hidden bg-[#0F1115]">
        {selectedLesson ? (
          <LessonView 
            lesson={selectedLesson} 
            isCompleted={userProgress.completedLessonIds.includes(selectedLesson.id)} 
            onComplete={handleLessonComplete} 
            onBack={() => setSelectedLesson(null)} 
            parentModule={currentParentModule}
            onAskQuestion={handleAskQuestion}
          />
        ) : (
          <>
            {activeTab === Tab.MODULES && (
                <ModuleList 
                    modules={modules} 
                    userProgress={userProgress} 
                    onSelectLesson={setSelectedLesson} 
                    onProfileClick={() => setActiveTab(Tab.PROFILE)}
                    onNotebookAction={handleNotebookAction}
                    theme={appConfig.theme}
                />
            )}
            {activeTab === Tab.CHAT && <ChatAssistant history={userProgress.chatHistory} onUpdateHistory={(h) => handleUpdateUser({chatHistory: h})} systemInstruction={appConfig.systemInstruction} />}
            {activeTab === Tab.CALENDAR && (
              <div className="p-6 pt-16">
                 <h1 className="text-3xl font-black text-white mb-8 tracking-tighter">PLANNING <span className="text-slate-600">PHASE</span></h1>
                 <CalendarView externalEvents={events} isDark={true} />
              </div>
            )}
            {activeTab === Tab.PROFILE && (
                <Profile 
                    userProgress={userProgress} 
                    onLogout={handleLogout} 
                    allUsers={allUsers} 
                    onUpdateUser={handleUpdateUser} 
                    events={events}
                    onReferral={handleReferral}
                    onShareStory={handleShareStory}
                    isSettingsOpen={isSettingsOpen}
                    theme={appConfig.theme}
                />
            )}
            {activeTab === Tab.CURATOR_DASHBOARD && userProgress.role === 'CURATOR' && <CuratorDashboard />}
            {activeTab === Tab.ADMIN_DASHBOARD && userProgress.role === 'ADMIN' && (
                <AdminDashboard 
                    config={appConfig} 
                    onUpdateConfig={setAppConfig} 
                    modules={modules} 
                    onUpdateModules={setModules} 
                    users={allUsers} 
                    onUpdateUsers={setAllUsers} 
                    events={events}
                    onUpdateEvents={setEvents}
                    addToast={addToast}
                    activeTab={activeAdminTab}
                />
            )}
          </>
        )}
      </main>
      
      <SmartNav 
        activeTab={activeTab} 
        setActiveTab={(t) => { setActiveTab(t); setIsSettingsOpen(false); telegram.haptic('selection'); }} 
        role={userProgress.role} 
        selectedLesson={selectedLesson} 
        onExitLesson={() => setSelectedLesson(null)} 
        onAskQuestion={handleGlobalAskQuestion}
        onLogout={handleLogout}
        onToggleSettings={() => setIsSettingsOpen(!isSettingsOpen)}
        isSettingsOpen={isSettingsOpen}
        activeAdminTab={activeAdminTab}
        setActiveAdminTab={setActiveAdminTab}
      />
    </div>
  );
};

export default App;
