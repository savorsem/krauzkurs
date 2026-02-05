
export type HomeworkType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'FILE';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  videoUrl?: string; // Support for lesson specific video
  xpReward: number;
  homeworkType: HomeworkType;
  homeworkTask: string;
  aiGradingInstruction: string;
  deadline?: string; 
  difficulty: 'Easy' | 'Medium' | 'Hard';
}

export type ModuleCategory = 'SALES' | 'PSYCHOLOGY' | 'TACTICS' | 'GENERAL' | 'NOTEBOOK';

export interface Module {
  id: string;
  title: string;
  description: string;
  minLevel: number;
  category: ModuleCategory;
  lessons: Lesson[];
  imageUrl: string;
  videoUrl?: string;
  pdfUrl?: string;
  prerequisites: string[];
  isHidden?: boolean; // Added for Admin control
}

export type UserRole = 'STUDENT' | 'CURATOR' | 'ADMIN';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date | string;
}

export interface NotificationSettings {
  pushEnabled: boolean;
  telegramSync: boolean;
  deadlineReminders: boolean;
  chatNotifications: boolean;
}

export interface UserStats {
  referrals: number; 
  storyReposts: number; 
  questionsAsked: Record<string, number>; 
  notebookEntries: {
    habits: number; 
    goals: number; 
    gratitude: number; 
  };
  suggestionsMade: number; 
  webinarsAttended: number;
  skills: {
    sales: number;
    tactics: number;
    psychology: number;
    discipline: number;
  };
}

export interface UserProgress {
  id?: string;
  telegramId?: string; 
  telegramUsername?: string; 
  password?: string; 
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
  registrationDate?: string;
  isBanned?: boolean; // New field
  
  xp: number;
  level: number;
  completedLessonIds: string[];
  completedModuleIds: string[]; 
  submittedHomeworks: string[];
  
  chatHistory: ChatMessage[];
  originalPhotoBase64?: string;
  avatarUrl?: string;
  armorStyle?: string;
  backgroundStyle?: string;
  
  notifications: NotificationSettings;
  stats: UserStats;
}

export interface ThemeConfig {
    cardStyle: 'GLASS' | 'SOLID' | 'NEON' | 'MINIMAL';
    borderRadius: 'ROUNDED' | 'SHARP' | 'CIRCLE';
    accentColor: string;
    fontFamily?: string;
    bgStyle: 'LIVE_DARK' | 'STATIC_DARK' | 'DEEP_SPACE';
}

export interface DatabaseConfig {
    syncEnabled: boolean;
    lastBackup: string | null;
    crmWebhook: string;
    autoBackupInterval: 'HOURLY' | 'DAILY' | 'WEEKLY';
}

export interface AppConfig {
  appName: string;
  appDescription: string;
  primaryColor: string;
  systemInstruction: string;
  theme: ThemeConfig;
  database: DatabaseConfig;
  integrations: {
    telegramBotToken?: string;
    googleDriveFolderId?: string;
    aiModelVersion?: string;
    aiTemperature: number;
  };
  features: {
    enableRealTimeSync: boolean;
    autoApproveHomework: boolean;
    maintenanceMode: boolean;
    allowStudentChat: boolean;
    publicLeaderboard: boolean;
  };
}

export enum EventType {
  HOMEWORK = 'HOMEWORK',
  WEBINAR = 'WEBINAR',
  OTHER = 'OTHER'
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date | string;
  type: EventType;
  durationMinutes?: number;
  lessonId?: string;
}

export enum Tab {
  MODULES = 'MODULES',
  CURRICULUM = 'CURRICULUM',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  CALENDAR = 'CALENDAR',
  CURATOR_DASHBOARD = 'CURATOR_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export type AdminTab = 'OVERVIEW' | 'COURSE' | 'USERS' | 'CALENDAR' | 'SETTINGS' | 'DESIGN' | 'DATABASE';

export interface ArenaScenario {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  clientRole: string;
  objective: string;
  initialMessage: string;
}
