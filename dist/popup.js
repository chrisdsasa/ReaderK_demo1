/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/popup.ts":
/*!**********************!*\
  !*** ./src/popup.ts ***!
  \**********************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var _services_SettingsService__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! ./services/SettingsService */ \"./src/services/SettingsService.ts\");\n\nclass PopupUI {\n    constructor() {\n        this.settingsService = _services_SettingsService__WEBPACK_IMPORTED_MODULE_0__.SettingsService.getInstance();\n        this.elements = this.getElements();\n        this.initialize();\n    }\n    getElements() {\n        return {\n            apiKey: document.getElementById('apiKey'),\n            model: document.getElementById('model'),\n            enableHighlight: document.getElementById('enableHighlight'),\n            highlightColor: document.getElementById('highlightColor'),\n            highlightOpacity: document.getElementById('highlightOpacity'),\n            targetLanguage: document.getElementById('targetLanguage'),\n            voice: document.getElementById('voice'),\n            rate: document.getElementById('rate'),\n            saveButton: document.getElementById('saveSettings'),\n        };\n    }\n    async initialize() {\n        // Load current settings\n        const settings = await this.settingsService.getSettings();\n        this.populateForm(settings);\n        // Setup voice options\n        this.setupVoiceOptions();\n        // Add event listeners\n        this.elements.saveButton.addEventListener('click', () => this.saveSettings());\n    }\n    populateForm(settings) {\n        this.elements.apiKey.value = settings.openAI.apiKey;\n        this.elements.model.value = settings.openAI.model;\n        this.elements.enableHighlight.checked = settings.reading.enableHighlight;\n        this.elements.highlightColor.value = settings.reading.highlightColor;\n        this.elements.highlightOpacity.value = String(settings.reading.highlightOpacity * 100);\n        this.elements.targetLanguage.value = settings.reading.targetLanguage;\n        this.elements.rate.value = String(settings.reading.voiceSettings.rate);\n        // Voice will be set in setupVoiceOptions\n    }\n    setupVoiceOptions() {\n        // Get available voices\n        const voices = speechSynthesis.getVoices();\n        // Clear existing options\n        this.elements.voice.innerHTML = '';\n        // Add voice options\n        voices.forEach(voice => {\n            const option = document.createElement('option');\n            option.value = voice.name;\n            option.textContent = `${voice.name} (${voice.lang})`;\n            this.elements.voice.appendChild(option);\n        });\n    }\n    async saveSettings() {\n        try {\n            const settings = {\n                openAI: {\n                    apiKey: this.elements.apiKey.value,\n                    model: this.elements.model.value,\n                    maxTokens: 150\n                },\n                reading: {\n                    enableHighlight: this.elements.enableHighlight.checked,\n                    highlightColor: this.elements.highlightColor.value,\n                    highlightOpacity: Number(this.elements.highlightOpacity.value) / 100,\n                    targetLanguage: this.elements.targetLanguage.value,\n                    voiceSettings: {\n                        voice: this.elements.voice.value,\n                        rate: Number(this.elements.rate.value),\n                        pitch: 1\n                    }\n                }\n            };\n            await this.settingsService.saveSettings(settings);\n            // Show success message\n            const status = document.createElement('div');\n            status.textContent = 'Settings saved successfully!';\n            status.style.color = '#4CAF50';\n            status.style.padding = '8px';\n            status.style.textAlign = 'center';\n            this.elements.saveButton.parentNode?.insertBefore(status, this.elements.saveButton.nextSibling);\n            // Remove message after 2 seconds\n            setTimeout(() => {\n                status.remove();\n            }, 2000);\n        }\n        catch (error) {\n            console.error('Failed to save settings:', error);\n            // Show error message\n            const status = document.createElement('div');\n            status.textContent = 'Failed to save settings. Please try again.';\n            status.style.color = '#F44336';\n            status.style.padding = '8px';\n            status.style.textAlign = 'center';\n            this.elements.saveButton.parentNode?.insertBefore(status, this.elements.saveButton.nextSibling);\n        }\n    }\n}\n// Initialize popup when DOM is loaded\ndocument.addEventListener('DOMContentLoaded', () => {\n    new PopupUI();\n});\n\n\n//# sourceURL=webpack://smart-reading-assistant/./src/popup.ts?");

/***/ }),

/***/ "./src/services/SettingsService.ts":
/*!*****************************************!*\
  !*** ./src/services/SettingsService.ts ***!
  \*****************************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   SettingsService: () => (/* binding */ SettingsService)\n/* harmony export */ });\nclass SettingsService {\n    constructor() {\n        this.defaultSettings = {\n            openAI: {\n                apiKey: '',\n                model: 'gpt-3.5-turbo',\n                maxTokens: 150\n            },\n            reading: {\n                enableHighlight: true,\n                highlightColor: '#FFEB3B',\n                highlightOpacity: 0.2,\n                targetLanguage: 'en',\n                voiceSettings: {\n                    voice: '',\n                    rate: 1,\n                    pitch: 1\n                }\n            }\n        };\n    }\n    static getInstance() {\n        if (!SettingsService.instance) {\n            SettingsService.instance = new SettingsService();\n        }\n        return SettingsService.instance;\n    }\n    async getSettings() {\n        return new Promise((resolve) => {\n            chrome.storage.sync.get(['settings']).then((result) => {\n                resolve(result.settings || this.defaultSettings);\n            });\n        });\n    }\n    async saveSettings(settings) {\n        return new Promise((resolve, reject) => {\n            chrome.storage.sync.set({ settings }).then(() => {\n                // Notify active tab about settings update\n                this.notifyActiveTab(settings)\n                    .then(() => resolve())\n                    .catch((error) => {\n                    console.error('Error updating tabs:', error);\n                    resolve(); // Still resolve as the settings were saved\n                });\n            }).catch((error) => {\n                reject(error);\n            });\n        });\n    }\n    async notifyActiveTab(settings) {\n        const tabs = await chrome.tabs.query({ active: true, currentWindow: true });\n        const activeTab = tabs[0];\n        if (activeTab?.id) {\n            await chrome.tabs.sendMessage(activeTab.id, {\n                type: 'SETTINGS_UPDATED',\n                settings\n            });\n        }\n    }\n}\n\n\n//# sourceURL=webpack://smart-reading-assistant/./src/services/SettingsService.ts?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module can't be inlined because the eval devtool is used.
/******/ 	var __webpack_exports__ = __webpack_require__("./src/popup.ts");
/******/ 	
/******/ })()
;