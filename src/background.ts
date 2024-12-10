// Start with your interfaces
interface OpenAIConfig {
  apiKey: string;
  model: string;
  maxTokens: number;
}

interface OpenAIResponse {
  success: boolean;
  content?: string;
  error?: string;
}

class OpenAIService {
  private config: OpenAIConfig = {
    apiKey: '',
    model: 'gpt-3.5-turbo',
    maxTokens: 150
  };

  async initialize(): Promise<void> {
    const stored = await chrome.storage.sync.get(['openAIConfig']);
    if (stored.openAIConfig) {
      this.config = { ...this.config, ...stored.openAIConfig };
    }
  }

  async summarizeParagraph(text: string): Promise<OpenAIResponse> {
    if (!this.config.apiKey) {
      return { 
        success: false, 
        error: 'OpenAI API key not configured' 
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: 'You are a concise summarizer. Provide brief, clear summaries.'
            },
            {
              role: 'user',
              content: `Summarize this text in 1-2 sentences: ${text}`
            }
          ],
          max_tokens: this.config.maxTokens,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content.trim()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async translateParagraph(text: string, targetLanguage: string): Promise<OpenAIResponse> {
    if (!this.config.apiKey) {
      return { 
        success: false, 
        error: 'OpenAI API key not configured' 
      };
    }

    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: this.config.model,
          messages: [
            {
              role: 'system',
              content: `You are a translator. Translate text to ${targetLanguage} maintaining the original meaning and tone.`
            },
            {
              role: 'user',
              content: text
            }
          ],
          max_tokens: this.config.maxTokens * 2,
          temperature: 0.3
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'API request failed');
      }

      const data = await response.json();
      return {
        success: true,
        content: data.choices[0].message.content.trim()
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }

  async updateConfig(newConfig: Partial<OpenAIConfig>): Promise<void> {
    this.config = { ...this.config, ...newConfig };
    await chrome.storage.sync.set({ 
      openAIConfig: this.config 
    });
  }
}

// Initialize OpenAI service
const openAIService = new OpenAIService();
openAIService.initialize();

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((
  message: {
    type: string;
    text?: string;
    targetLanguage?: string;
    config?: Partial<OpenAIConfig>;
  },
  sender,
  sendResponse
) => {
  // Use async response pattern
  const handleMessage = async () => {
    switch (message.type) {
      case 'SUMMARIZE_PARAGRAPH':
        if (message.text) {
          return await openAIService.summarizeParagraph(message.text);
        }
        break;

      case 'TRANSLATE_PARAGRAPH':
        if (message.text && message.targetLanguage) {
          return await openAIService.translateParagraph(
            message.text,
            message.targetLanguage
          );
        }
        break;

      case 'UPDATE_OPENAI_CONFIG':
        if (message.config) {
          await openAIService.updateConfig(message.config);
          return { success: true };
        }
        break;
    }
    return { success: false, error: 'Invalid request' };
  };

  // Keep message channel open for async response
  handleMessage().then(sendResponse);
  return true;
});

// Add this to your existing listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'BROADCAST_SETTINGS' && message.targetTabId) {
    chrome.tabs.sendMessage(message.targetTabId, {
      type: 'SETTINGS_UPDATED',
      settings: message.settings
    });
  }
  return true;
}); 