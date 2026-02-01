
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
      this.webApp.expand(); // Always try to expand to full height
    }
  }

  get isAvailable() {
    return !!this.webApp;
  }

  get user() {
    return this.webApp?.initDataUnsafe?.user;
  }

  get platform() {
      return this.webApp?.platform || 'unknown';
  }

  // Haptic Feedback
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

  // Close the Mini App
  close() {
    this.webApp?.close();
  }
}

export const telegram = new TelegramService();
