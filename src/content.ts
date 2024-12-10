import { VoiceService } from './services/VoiceService';

interface ParagraphData {
  id: number;
  text: string;
  element: HTMLElement;
  summary?: string;
  translation?: string;
}

class AIOverlay {
  private container: HTMLElement;
  private currentParagraph: ParagraphData | null = null;
  private voiceService: VoiceService;

  constructor() {
    this.container = document.createElement('div');
    this.container.className = 'reading-assistant-overlay';
    this.injectStyles();
    document.body.appendChild(this.container);
    this.voiceService = new VoiceService();
  }

  private injectStyles() {
    const styles = `
      .reading-assistant-overlay {
        position: fixed;
        right: 20px;
        top: 50%;
        transform: translateY(-50%);
        width: 320px;
        background: white;
        border-radius: 12px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
        z-index: 9999;
        opacity: 0;
        transition: opacity 0.3s ease;
        font-family: -apple-system, BlinkMacSystemFont, sans-serif;
      }

      @media (prefers-color-scheme: dark) {
        .reading-assistant-overlay {
          background: #1F2937;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
        }
      }

      .reading-assistant-overlay.visible {
        opacity: 1;
      }

      .overlay-header {
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }

      .overlay-content {
        padding: 16px;
      }

      .overlay-actions {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
      }

      .overlay-button {
        flex: 1;
        padding: 8px;
        border: none;
        border-radius: 6px;
        background: #4F46E5;
        color: white;
        cursor: pointer;
        font-size: 14px;
        transition: background 0.2s ease;
      }

      .overlay-button:hover {
        background: #4338CA;
      }

      .overlay-section {
        margin-bottom: 16px;
      }

      .overlay-section:last-child {
        margin-bottom: 0;
      }

      .overlay-section h3 {
        margin: 0 0 8px 0;
        font-size: 14px;
        color: #6B7280;
      }

      .overlay-section-content {
        padding: 12px;
        background: rgba(0, 0, 0, 0.05);
        border-radius: 6px;
        font-size: 14px;
        line-height: 1.5;
      }

      @media (prefers-color-scheme: dark) {
        .overlay-section-content {
          background: rgba(255, 255, 255, 0.05);
        }
      }

      .loading {
        display: flex;
        align-items: center;
        justify-content: center;
        height: 100px;
      }

      .loading::after {
        content: '';
        width: 24px;
        height: 24px;
        border: 2px solid #4F46E5;
        border-right-color: transparent;
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }

      @keyframes spin {
        to {
          transform: rotate(360deg);
        }
      }

      .overlay-button.reading {
        background: #DC2626;
      }

      .overlay-button.reading:hover {
        background: #B91C1C;
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  public show(paragraph: ParagraphData) {
    this.currentParagraph = paragraph;
    this.container.classList.add('visible');
    this.render();
  }

  public hide() {
    this.container.classList.remove('visible');
    this.currentParagraph = null;
  }

  private async handleSummarize() {
    if (!this.currentParagraph) return;

    const section = this.getOrCreateSection('summary', 'Summary');
    section.classList.add('loading');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'SUMMARIZE_PARAGRAPH',
        text: this.currentParagraph.text
      });

      if (response.success) {
        this.currentParagraph.summary = response.content;
        this.render();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      section.textContent = `Error: ${error instanceof Error ? error.message : 'Failed to summarize'}`;
    } finally {
      section.classList.remove('loading');
    }
  }

  private async handleTranslate() {
    if (!this.currentParagraph) return;

    const section = this.getOrCreateSection('translation', 'Translation');
    section.classList.add('loading');

    try {
      const response = await chrome.runtime.sendMessage({
        type: 'TRANSLATE_PARAGRAPH',
        text: this.currentParagraph.text
      });

      if (response.success) {
        this.currentParagraph.translation = response.content;
        this.render();
      } else {
        throw new Error(response.error);
      }
    } catch (error) {
      section.textContent = `Error: ${error instanceof Error ? error.message : 'Failed to translate'}`;
    } finally {
      section.classList.remove('loading');
    }
  }

  private async handleReadAloud() {
    if (!this.currentParagraph) return;

    if (this.voiceService.isReading()) {
      this.voiceService.stop();
      this.render();
      return;
    }

    try {
      await this.voiceService.speak(this.currentParagraph.text);
      this.render();
    } catch (error) {
      console.error('Failed to read text:', error);
    }
  }

  private getOrCreateSection(id: string, title: string): HTMLElement {
    let section = this.container.querySelector(`#${id}-section`);
    if (!section) {
      section = document.createElement('div');
      section.id = `${id}-section`;
      section.className = 'overlay-section';
      section.innerHTML = `
        <h3>${title}</h3>
        <div class="overlay-section-content"></div>
      `;
    }
    return section.querySelector('.overlay-section-content') as HTMLElement;
  }

  private render() {
    if (!this.currentParagraph) return;

    this.container.innerHTML = `
      <div class="overlay-header">
        <div class="overlay-actions">
          <button class="overlay-button" id="summarize-btn">Summarize</button>
          <button class="overlay-button" id="translate-btn">Translate</button>
          <button class="overlay-button ${this.voiceService.isReading() ? 'reading' : ''}" id="read-btn">
            ${this.voiceService.isReading() ? 'Stop Reading' : 'Read Aloud'}
          </button>
        </div>
      </div>
      <div class="overlay-content">
        ${this.currentParagraph.summary ? `
          <div class="overlay-section">
            <h3>Summary</h3>
            <div class="overlay-section-content">${this.currentParagraph.summary}</div>
          </div>
        ` : ''}
        ${this.currentParagraph.translation ? `
          <div class="overlay-section">
            <h3>Translation</h3>
            <div class="overlay-section-content">${this.currentParagraph.translation}</div>
          </div>
        ` : ''}
      </div>
    `;

    // Add event listeners
    this.container.querySelector('#summarize-btn')?.addEventListener('click', () => this.handleSummarize());
    this.container.querySelector('#translate-btn')?.addEventListener('click', () => this.handleTranslate());
    this.container.querySelector('#read-btn')?.addEventListener('click', () => this.handleReadAloud());
  }

  public destroy() {
    this.voiceService.stop();
    this.hide();
  }
}

class ReadingAssistant {
  private paragraphs: ParagraphData[] = [];
  private currentHighlightedId: number | null = null;
  private observer: IntersectionObserver;
  private highlightColor: string = 'rgba(255, 255, 0, 0.2)';
  private scrollTimeout: number | undefined;
  private overlay: AIOverlay;

  constructor() {
    // Initialize intersection observer for paragraph tracking
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.5, // Trigger when 50% of paragraph is visible
      }
    );

    this.initialize();
    this.overlay = new AIOverlay();
  }

  private async initialize() {
    await this.extractParagraphs();
    this.setupScrollListener();
    this.injectStyles();
  }

  private async extractParagraphs() {
    // Main content selectors - can be expanded based on common website layouts
    const contentSelectors = [
      'article',
      '[role="main"]',
      '.main-content',
      '#main-content',
      'main',
    ];

    let mainContent: Element | null = null;

    // Find the main content container
    for (const selector of contentSelectors) {
      mainContent = document.querySelector(selector);
      if (mainContent) break;
    }

    // If no main content found, use body as fallback
    const container = mainContent || document.body;

    // Find all paragraph elements
    const paragraphElements = container.querySelectorAll('p');

    // Process each paragraph
    paragraphElements.forEach((element, index) => {
      const text = element.textContent?.trim();
      if (text && text.length > 20) { // Filter out short paragraphs
        // Create paragraph number indicator
        const numberIndicator = document.createElement('span');
        numberIndicator.className = 'reading-assistant-number';
        numberIndicator.textContent = `[${index + 1}]`;
        
        // Insert number before paragraph
        element.insertBefore(numberIndicator, element.firstChild);

        // Store paragraph data
        this.paragraphs.push({
          id: index + 1,
          text,
          element: element as HTMLElement,
        });

        // Observe paragraph for visibility
        this.observer.observe(element);
      }
    });
  }

  private handleIntersection(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const element = entry.target as HTMLElement;
        const paragraphData = this.paragraphs.find(p => p.element === element);
        
        if (paragraphData && this.currentHighlightedId !== paragraphData.id) {
          this.highlightParagraph(paragraphData.id);
        }
      }
    });
  }

  private highlightParagraph(id: number) {
    // Remove previous highlight
    if (this.currentHighlightedId) {
      const prevParagraph = this.paragraphs.find(p => p.id === this.currentHighlightedId);
      if (prevParagraph) {
        prevParagraph.element.style.backgroundColor = '';
        prevParagraph.element.style.transition = '';
      }
    }

    // Add new highlight
    const paragraph = this.paragraphs.find(p => p.id === id);
    if (paragraph) {
      paragraph.element.style.backgroundColor = this.highlightColor;
      paragraph.element.style.transition = 'background-color 0.3s ease';
      this.currentHighlightedId = id;
      this.overlay.show(paragraph);
    }
  }

  private setupScrollListener() {
    window.addEventListener('scroll', () => {
      // Debounce scroll events
      if (this.scrollTimeout) {
        window.clearTimeout(this.scrollTimeout);
      }
      this.scrollTimeout = window.setTimeout(() => {
        this.checkVisibleParagraphs();
      }, 100);
    });
  }

  private checkVisibleParagraphs() {
    // Find the paragraph most visible in the viewport
    let maxVisibility = 0;
    let mostVisibleId: number | null = null;

    this.paragraphs.forEach(({ id, element }) => {
      const rect = element.getBoundingClientRect();
      const visibility = this.getVisibilityPercentage(rect);
      
      if (visibility > maxVisibility) {
        maxVisibility = visibility;
        mostVisibleId = id;
      }
    });

    if (mostVisibleId && mostVisibleId !== this.currentHighlightedId) {
      this.highlightParagraph(mostVisibleId);
    }
  }

  private getVisibilityPercentage(rect: DOMRect): number {
    const windowHeight = window.innerHeight;
    
    if (rect.top > windowHeight || rect.bottom < 0) return 0;
    
    const visibleHeight = Math.min(rect.bottom, windowHeight) - Math.max(rect.top, 0);
    return (visibleHeight / rect.height) * 100;
  }

  private injectStyles() {
    const styles = `
      .reading-assistant-number {
        display: inline-block;
        margin-right: 8px;
        color: #666;
        font-size: 0.9em;
        font-weight: 500;
        opacity: 0.8;
      }

      @media (prefers-color-scheme: dark) {
        .reading-assistant-number {
          color: #999;
        }
      }
    `;

    const styleElement = document.createElement('style');
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
  }

  // Public methods for external control
  public setHighlightColor(color: string) {
    this.highlightColor = color;
    if (this.currentHighlightedId) {
      this.highlightParagraph(this.currentHighlightedId);
    }
  }

  // Add cleanup method
  public destroy() {
    // Cleanup observers and listeners
    this.observer.disconnect();
    window.removeEventListener('scroll', this.setupScrollListener);
    if (this.scrollTimeout) {
      window.clearTimeout(this.scrollTimeout);
    }
    
    // Remove paragraph numbers and highlights
    this.paragraphs.forEach(({ element }) => {
      const numberIndicator = element.querySelector('.reading-assistant-number');
      if (numberIndicator) {
        numberIndicator.remove();
      }
      element.style.backgroundColor = '';
      element.style.transition = '';
    });
    this.overlay.hide();
  }

  // Add method to get current paragraph
  public getCurrentParagraph(): ParagraphData | null {
    return this.currentHighlightedId 
      ? this.paragraphs.find(p => p.id === this.currentHighlightedId) || null 
      : null;
  }

  // Add method to get all paragraphs
  public getParagraphs(): ParagraphData[] {
    return [...this.paragraphs];
  }

  public updateSettings(settings: any): void {
    if (settings.reading) {
      if (settings.reading.highlightColor) {
        this.setHighlightColor(settings.reading.highlightColor);
      }
      // Add other settings updates as needed
    }
  }
}

// Initialize the reading assistant
const readingAssistant = new ReadingAssistant();

// Message handling with type safety
interface Message {
  type: 'SET_HIGHLIGHT_COLOR' | 'GET_CURRENT_PARAGRAPH' | 'GET_ALL_PARAGRAPHS';
  color?: string;
}

chrome.runtime.onMessage.addListener((
  message: Message,
  sender: any,
  sendResponse: (response?: any) => void
) => {
  switch (message.type) {
    case 'SET_HIGHLIGHT_COLOR':
      if (message.color) {
        readingAssistant.setHighlightColor(message.color);
      }
      break;
      
    case 'GET_CURRENT_PARAGRAPH':
      const currentParagraph = readingAssistant.getCurrentParagraph();
      sendResponse(currentParagraph);
      break;
      
    case 'GET_ALL_PARAGRAPHS':
      const paragraphs = readingAssistant.getParagraphs();
      sendResponse(paragraphs);
      break;
  }
});

// Add to your existing message listeners
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SETTINGS_UPDATED') {
    // Handle the settings update
    readingAssistant.updateSettings(message.settings);
  }
  return true;
});

// Cleanup on extension unload
window.addEventListener('unload', () => {
  readingAssistant.destroy();
}); 