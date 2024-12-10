import { Settings, SettingsService } from './services/SettingsService';

class PopupUI {
    private settingsService: SettingsService;
    private elements: {
        apiKey: HTMLInputElement;
        model: HTMLSelectElement;
        enableHighlight: HTMLInputElement;
        highlightColor: HTMLInputElement;
        highlightOpacity: HTMLInputElement;
        targetLanguage: HTMLSelectElement;
        voice: HTMLSelectElement;
        rate: HTMLInputElement;
        saveButton: HTMLButtonElement;
    };

    constructor() {
        this.settingsService = SettingsService.getInstance();
        this.elements = this.getElements();
        this.initialize();
    }

    private getElements() {
        return {
            apiKey: document.getElementById('apiKey') as HTMLInputElement,
            model: document.getElementById('model') as HTMLSelectElement,
            enableHighlight: document.getElementById('enableHighlight') as HTMLInputElement,
            highlightColor: document.getElementById('highlightColor') as HTMLInputElement,
            highlightOpacity: document.getElementById('highlightOpacity') as HTMLInputElement,
            targetLanguage: document.getElementById('targetLanguage') as HTMLSelectElement,
            voice: document.getElementById('voice') as HTMLSelectElement,
            rate: document.getElementById('rate') as HTMLInputElement,
            saveButton: document.getElementById('saveSettings') as HTMLButtonElement,
        };
    }

    private async initialize() {
        // Load current settings
        const settings = await this.settingsService.getSettings();
        this.populateForm(settings);

        // Setup voice options
        this.setupVoiceOptions();

        // Add event listeners
        this.elements.saveButton.addEventListener('click', () => this.saveSettings());
    }

    private populateForm(settings: Settings) {
        this.elements.apiKey.value = settings.openAI.apiKey;
        this.elements.model.value = settings.openAI.model;
        this.elements.enableHighlight.checked = settings.reading.enableHighlight;
        this.elements.highlightColor.value = settings.reading.highlightColor;
        this.elements.highlightOpacity.value = String(settings.reading.highlightOpacity * 100);
        this.elements.targetLanguage.value = settings.reading.targetLanguage;
        this.elements.rate.value = String(settings.reading.voiceSettings.rate);
        // Voice will be set in setupVoiceOptions
    }

    private setupVoiceOptions() {
        // Get available voices
        const voices = speechSynthesis.getVoices();
        
        // Clear existing options
        this.elements.voice.innerHTML = '';
        
        // Add voice options
        voices.forEach(voice => {
            const option = document.createElement('option');
            option.value = voice.name;
            option.textContent = `${voice.name} (${voice.lang})`;
            this.elements.voice.appendChild(option);
        });
    }

    private async saveSettings() {
        try {
            const settings: Settings = {
                openAI: {
                    apiKey: this.elements.apiKey.value,
                    model: this.elements.model.value,
                    maxTokens: 150
                },
                reading: {
                    enableHighlight: this.elements.enableHighlight.checked,
                    highlightColor: this.elements.highlightColor.value,
                    highlightOpacity: Number(this.elements.highlightOpacity.value) / 100,
                    targetLanguage: this.elements.targetLanguage.value,
                    voiceSettings: {
                        voice: this.elements.voice.value,
                        rate: Number(this.elements.rate.value),
                        pitch: 1
                    }
                }
            };

            await this.settingsService.saveSettings(settings);
            
            // Show success message
            const status = document.createElement('div');
            status.textContent = 'Settings saved successfully!';
            status.style.color = '#4CAF50';
            status.style.padding = '8px';
            status.style.textAlign = 'center';
            this.elements.saveButton.parentNode?.insertBefore(status, this.elements.saveButton.nextSibling);
            
            // Remove message after 2 seconds
            setTimeout(() => {
                status.remove();
            }, 2000);
        } catch (error) {
            console.error('Failed to save settings:', error);
            // Show error message
            const status = document.createElement('div');
            status.textContent = 'Failed to save settings. Please try again.';
            status.style.color = '#F44336';
            status.style.padding = '8px';
            status.style.textAlign = 'center';
            this.elements.saveButton.parentNode?.insertBefore(status, this.elements.saveButton.nextSibling);
        }
    }
}

// Initialize popup when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PopupUI();
}); 