export interface Settings {
  openAI: {
    apiKey: string;
    model: string;
    maxTokens: number;
  };
  reading: {
    enableHighlight: boolean;
    highlightColor: string;
    highlightOpacity: number;
    targetLanguage: string;
    voiceSettings: {
      voice: string;
      rate: number;
      pitch: number;
    };
  };
}

export class SettingsService {
  private static instance: SettingsService;
  
  private defaultSettings: Settings = {
    openAI: {
      apiKey: '',
      model: 'gpt-3.5-turbo',
      maxTokens: 150
    },
    reading: {
      enableHighlight: true,
      highlightColor: '#FFEB3B',
      highlightOpacity: 0.2,
      targetLanguage: 'en',
      voiceSettings: {
        voice: '',
        rate: 1,
        pitch: 1
      }
    }
  };

  private constructor() {}

  public static getInstance(): SettingsService {
    if (!SettingsService.instance) {
      SettingsService.instance = new SettingsService();
    }
    return SettingsService.instance;
  }

  public async getSettings(): Promise<Settings> {
    return new Promise<Settings>((resolve) => {
      chrome.storage.sync.get(['settings']).then((result: { settings?: Settings }) => {
        resolve(result.settings || this.defaultSettings);
      });
    });
  }

  public async saveSettings(settings: Settings): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      chrome.storage.sync.set({ settings }).then(() => {
        // Notify active tab about settings update
        this.notifyActiveTab(settings)
          .then(() => resolve())
          .catch((error) => {
            console.error('Error updating tabs:', error);
            resolve(); // Still resolve as the settings were saved
          });
      }).catch((error) => {
        reject(error);
      });
    });
  }

  private async notifyActiveTab(settings: Settings): Promise<void> {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const activeTab = tabs[0];
    
    if (activeTab?.id) {
      await chrome.tabs.sendMessage(activeTab.id, {
        type: 'SETTINGS_UPDATED',
        settings
      });
    }
  }
} 