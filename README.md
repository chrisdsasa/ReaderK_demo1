# Smart Reading Assistant

A powerful Chrome extension that enhances your reading experience with AI-powered features including text summarization, translation, and text-to-speech capabilities.

## 🌟 Features

- **AI-Powered Summarization**: Get quick summaries of paragraphs using OpenAI's GPT models
- **Smart Translation**: Translate text into multiple languages (Chinese, Spanish, French, German, Japanese)
- **Text-to-Speech**: Natural voice reading with customizable speech settings
- **Customizable Highlighting**: Visual reading aids with adjustable colors and opacity
- **Dark Mode Support**: Automatic theme switching based on system preferences

## 🚀 Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- Chrome browser

### Development Setup

1. Clone the repository: 
2. Install dependencies:
3. Build the extension:
4. Load the extension in Chrome:
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked"
   - Select the `dist` directory from the project

### Development Commands

- `npm run build`: Build the extension
- `npm run watch`: Watch for changes and rebuild
- `npm run dev`: Development mode with hot reload
- `npm run type-check`: Run TypeScript type checking

## 🏗️ Project Structure
smart-reading-assistant/
├── src/
│ ├── content.ts # Content script
│ ├── background.ts # Background service worker
│ ├── popup.ts # Popup UI logic
│ ├── popup.html # Popup UI template
│ ├── popup.css # Popup styles
│ ├── content.css # Content script styles
│ └── services/
│ ├── SettingsService.ts # Settings management
│ └── VoiceService.ts # Text-to-speech functionality
├── dist/ # Built extension files
├── icons/ # Extension icons
├── webpack.config.js # Webpack configuration
└── manifest.json # Extension manifest
## 🔧 Configuration

### OpenAI API Setup

1. Get an API key from [OpenAI](https://platform.openai.com/)
2. Enter the API key in the extension settings
3. Choose your preferred model (GPT-3.5-Turbo or GPT-4)

### Reading Settings

- **Highlight Color**: Customize the text highlight color
- **Highlight Opacity**: Adjust highlight transparency (0-100%)
- **Translation Language**: Select target language for translations
- **Voice Settings**: Choose voice and adjust speech rate

## 🛠️ Technical Details

### Technologies Used

- TypeScript
- Chrome Extension APIs
- OpenAI API
- Web Speech API
- Webpack
- CSS3

### Key Components

#### Content Script (`content.ts`)
- Handles DOM manipulation
- Manages text selection and highlighting
- Coordinates with AI services

#### Background Service (`background.ts`)
- Manages OpenAI API communication
- Handles cross-script messaging
- Maintains extension state

#### Settings Service (`SettingsService.ts`)
- Manages user preferences
- Handles Chrome storage sync
- Provides settings interface

#### Voice Service (`VoiceService.ts`)
- Text-to-speech functionality
- Voice selection and configuration
- Speech rate control

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch:
3. Commit your changes:
4. Push to the branch:
5. Open a Pull Request

### Coding Standards

- Follow TypeScript best practices
- Use meaningful variable and function names
- Add comments for complex logic
- Write unit tests for new features
- Update documentation as needed

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenAI for their powerful API
- Chrome Extension development community
- Contributors and users of this extension

## 📫 Contact

Your Name - [Jiace Zhao(krypoto)]([https://twitter.com/yourtwitter](https://x.com/KrypotoZ))

Project Link: [https://github.com/yourusername/smart-reading-assistant](https://github.com/yourusername/smart-reading-assistant)

My studio site: https://studio.krypoto.top/
