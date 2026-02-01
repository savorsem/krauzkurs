
export type HomeworkType = 'TEXT' | 'PHOTO' | 'VIDEO' | 'FILE';

export interface Lesson {
  id: string;
  title: string;
  description: string;
  content: string;
  xpReward: number;
  
  // New configuration fields
  homeworkType: HomeworkType;
  homeworkTask: string; // Description displayed to student
  aiGradingInstruction: string; // Hidden instruction for the AI agent
}

export interface Module {
  id: string;
  title: string;
  description: string;
  minLevel: number;
  lessons: Lesson[];
  imageUrl: string;
  videoUrl?: string; // Link to the video course file (YouTube/Direct)
  pdfUrl?: string;   // Link to the PDF resource
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

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  isUnlocked: boolean;
}

export interface UserProgress {
  id?: string;
  instagramUsername?: string;
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

export interface AppConfig {
  appName: string;
  appDescription: string;
  primaryColor: string;
  systemInstruction: string;
  driveFolderId?: string; 
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
