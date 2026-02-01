
export type HomeworkType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'FILE';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  xpReward: number;
  homeworkType: HomeworkType;
  homeworkTask: string;
  aiGradingInstruction: string;
}

export type ModuleCategory = 'SALES' | 'PSYCHOLOGY' | 'TACTICS' | 'GENERAL';

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

export interface UserProgress {
  id?: string;
  telegramId?: string; // Replaces generic ID for Telegram users
  telegramUsername?: string; // Replaces instagramUsername
  password?: string; // Added for local auth
  name: string;
  role: UserRole;
  isAuthenticated: boolean;
  registrationDate?: string;
  
  xp: number;
  level: number;
  completedLessonIds: string[];
  submittedHomeworks: string[];
  
  chatHistory: ChatMessage[];
  originalPhotoBase64?: string;
  avatarUrl?: string;
  
  // Customization preferences
  armorStyle?: string;
  backgroundStyle?: string;
  
  notifications: NotificationSettings;
}

export interface AppIntegrations {
  telegramBotToken?: string;
  googleDriveFolderId?: string;
  crmWebhookUrl?: string;
  aiModelVersion?: string;
}

export interface AppFeatures {
  enableRealTimeSync: boolean;
  autoApproveHomework: boolean;
  maintenanceMode: boolean;
  allowStudentChat: boolean;
  publicLeaderboard: boolean;
}

export interface AppConfig {
  appName: string;
  appDescription: string;
  primaryColor: string;
  systemInstruction: string;
  integrations: AppIntegrations;
  features: AppFeatures;
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
}

export enum Tab {
  MODULES = 'MODULES',
  CHAT = 'CHAT',
  PROFILE = 'PROFILE',
  CURATOR_DASHBOARD = 'CURATOR_DASHBOARD',
  ADMIN_DASHBOARD = 'ADMIN_DASHBOARD'
}

export interface ArenaScenario {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  clientRole: string;
  objective: string;
  initialMessage: string;
}
