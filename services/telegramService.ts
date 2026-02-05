
// Wrapper for Telegram WebApp API
declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        ready: () => void;
        expand: () => void;
        close: () => void;
        initData: string;
        initDataUnsafe: {
          user?: {
            id: number;
            first_name: string;
            last_name?: string;
            username?: string;
            photo_url?: string;
          };
        };
        HapticFeedback: {
          impactOccurred: (style: 'light' | 'medium' | 'heavy' | 'rigid' | 'soft') => void;
          notificationOccurred: (type: 'error' | 'success' | 'warning') => void;
          selectionChanged: () => void;
        };
        shareToStory: (media_url: string, params?: { text?: string, widget_link?: { url: string, name?: string } }) => void;
        switchInlineQuery: (query: string, choose_chat_types?: string[]) => void;
        isVersionAtLeast: (version: string) => boolean;
        version: string;
        themeParams: any;
        isExpanded: boolean;
        viewportHeight: number;
        platform: string;
      };
    };
  }
}

class TelegramService {
  private webApp = window.Telegram?.WebApp;

  constructor() {
    if (this.webApp) {
      this.webApp.ready();
      this.webApp.expand(); 
    }
  }

  get isAvailable() {
    return !!this.webApp;
  }

  get user() {
    return this.webApp?.initDataUnsafe?.user;
  }

  haptic(type: 'light' | 'medium' | 'heavy' | 'success' | 'error' | 'selection') {
    if (!this.webApp) return;
    switch (type) {
      case 'light':
      case 'medium':
      case 'heavy':
        this.webApp.HapticFeedback.impactOccurred(type);
        break;
      case 'success':
      case 'error':
        this.webApp.HapticFeedback.notificationOccurred(type);
        break;
      case 'selection':
        this.webApp.HapticFeedback.selectionChanged();
        break;
    }
  }

  shareProgress(level: number, xp: number) {
    if (!this.webApp) return;
    const text = `Я достиг ${level} уровня в академии 300 Спартанцев! Мой опыт: ${xp} XP. Кто со мной? ⚔️`;
    
    // Version 7.8 is required for reliable Story sharing
    const canShareToStory = this.webApp.isVersionAtLeast('7.8') && typeof this.webApp.shareToStory === 'function';

    if (canShareToStory) {
        try {
          this.webApp.shareToStory('https://picsum.photos/1080/1920', { 
              text, 
              widget_link: { url: 'https://t.me/your_bot_link', name: 'Вступить в отряд' } 
          });
        } catch (e) {
          console.error("Story share failed even with version check", e);
          this.webApp.switchInlineQuery(text);
        }
    } else {
        // Fallback to inline query (Supported in 6.0+)
        this.webApp.switchInlineQuery(text);
    }
  }

  close() {
    this.webApp?.close();
  }
}

export const telegram = new TelegramService();
