// --- /js/main.js ---
// The main entry point for the application.
// It orchestrates the initialization of all modules and components.

import { applyInitialTheme, cycleTheme, updateThemeToggleButtonVisuals } from './theme.js';
import { initI18n, setLanguage, getInitialLanguage, T } from './i18n.js';
import {
    initTypedJS,
    initLottieAnimations,
    initCountdown,
    initCounters,
    initSalaryCalculator,
    initReadinessTest,
    initRotatingGlobe,
    initJobMap,
    initAIAssistant,
    initSubscriptionForm
} from './components.js';

// The main function to start our application
async function main() {
    console.log('[main.js] Main function STARTED.');
    
    applyInitialTheme(); // Applies theme from localStorage or default
    console.log('[main.js] Initial theme applied.');
    
    const initialLang = getInitialLanguage();
    console.log('[main.js] Initial language detected:', initialLang);
    
    // Crucially, setLanguage loads translations and applies them via applyTranslationsToDOM
    await initI18n(initialLang);
    console.log('[main.js] setLanguage(initialLang) awaited. Translations should be loaded and applied.');
        
    // Update buttons that depend on translated text
    updateLanguageDropdownButton(initialLang); 
    console.log('[main.js] Language dropdown button updated for initial language.');
    
    updateThemeToggleButtonVisuals(T); // Pass the T function for translations
    console.log('[main.js] Theme toggle button visuals updated with initial translations.');

    // Initialize AOS after basic setup and language is ready
    if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true });
        console.log('[main.js] AOS initialized.');
    } else {
        console.warn('[main.js] AOS library not found.');
    }

    // Initialize all other components that might depend on translated text or specific DOM elements
    initTypedJS(); 
    console.log('[main.js] Typed.js initialization attempted.');
    
    initLottieAnimations();
    console.log('[main.js] Lottie animations initialization attempted.');
    
    initCountdown(); 
    console.log('[main.js] Countdown initialization attempted.');
    
    initCounters(); 
    console.log('[main.js] Counters initialization attempted.');
    
    initSalaryCalculator(); 
    console.log('[main.js] Salary Calculator initialization attempted.');
    
    initReadinessTest();
    console.log('[main.js] Readiness Test initialization attempted.');

    initRotatingGlobe();
    console.log('[main.js] Rotating Globe initialization attempted.');

    initJobMap();
    console.log('[main.js] Job Map initialization attempted.');
    
    initAIAssistant(); 
    console.log('[main.js] AI Assistant initialization attempted.');
    
    initSubscriptionForm(); 
    console.log('[main.js] Subscription Form initialization attempted.');

    attachEventListeners(); // Attach event listeners that might also need T() or other setup
    console.log('[main.js] Event listeners attached.');
    console.log('[main.js] Main function FINISHED.');
}

function updateLanguageDropdownButton(langCode) {
    console.log('[main.js - updateLanguageDropdownButton] Updating for langCode:', langCode);
    const langDropdownBtnTextSpan = document.getElementById('language-name-display');
    const langMenuItem = document.querySelector(`.dropdown-item[data-lang="${langCode}"]`);
    
    if (langDropdownBtnTextSpan && langMenuItem) {
        langDropdownBtnTextSpan.textContent = langMenuItem.textContent; 
        console.log('[main.js - updateLanguageDropdownButton] Button text set to:', langMenuItem.textContent);
    } else if (langDropdownBtnTextSpan) {
        const langNameFromT = T('language_name_dropdown_' + langCode) || T('language_name') || langCode.toUpperCase();
        langDropdownBtnTextSpan.textContent = langNameFromT;
        console.warn('[main.js - updateLanguageDropdownButton] Menu item not found for', langCode, ', using T() or lang code as fallback.');
    } else {
        console.error('[main.js - updateLanguageDropdownButton] #language-name-display element not found.');
    }
}

function attachEventListeners() {
    console.log('[main.js - attachEventListeners] Attaching main event listeners.');
    const themeButton = document.getElementById('theme-cycle-button');
    if (themeButton) {
        themeButton.addEventListener('click', () => {
            console.log('[main.js] Theme cycle button clicked.');
            cycleTheme(); 
            updateThemeToggleButtonVisuals(T); 
        });
    } else {
        console.warn('[main.js] Theme cycle button not found.');
    }

    const langDropdownItems = document.querySelectorAll('.dropdown-item[data-lang]');
    if (langDropdownItems.length > 0) {
        langDropdownItems.forEach(el => {
            el.addEventListener('click', async (e) => {
                e.preventDefault();
                const lang = e.currentTarget.getAttribute('data-lang');
                console.log('[main.js] Language change clicked for:', lang);
                if (lang) {
                    await setLanguage(lang); 
                    console.log('[main.js] Language set to', lang, 'after click. DOM should be updated.');
                    
                    initTypedJS(); 
                    console.log('[main.js] Typed.js re-initialized after language change.');
                    
                    updateLanguageDropdownButton(lang); 
                    updateThemeToggleButtonVisuals(T); 

                    const aiAssistantWidget = document.getElementById('ai-assistant-widget');
                    const messagesContainer = document.getElementById('ai-assistant-messages-container');
                    if (aiAssistantWidget && aiAssistantWidget.classList.contains('show') && messagesContainer) {
                        console.log('[main.js] AI Assistant is visible, refreshing welcome message for new language.');
                        messagesContainer.innerHTML = ''; 
                        // The addMessageToAIAssistant function needs to be accessible or called from components.js
                        // For now, we re-initialize the AI assistant which should show the welcome message.
                        // This is a bit heavy, a dedicated refresh function in components.js would be better.
                        initAIAssistant(); // This will re-add event listeners too, which might not be ideal.
                                           // A more refined approach would be a specific function to update AI assistant text.
                    }
                }
            });
        });
    } else {
        console.warn('[main.js] No language dropdown items found.');
    }
    console.log('[main.js - attachEventListeners] Event listeners attached.');
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('[main.js] DOMContentLoaded event fired.');
    main();
});
