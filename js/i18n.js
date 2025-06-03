// --- /js/i18n.js ---
// Handles all internationalization (language) logic.

export let translations = {}; // Exported for components.js to access ai_assistant_mock_responses
let currentLang = 'en';

export function T(key, params = null) {
  let text = translations[key]; 
  if (text === undefined) { 
    // console.warn(`[i18n - T] Translation not found for key: "${key}". Using key as fallback.`); // This can be too noisy
    text = key; 
  }
  if (params && typeof text === 'string') {
    for (const paramKey in params) {
      text = text.replace(`{${paramKey}}`, params[paramKey]);
    }
  }
  return text;
}

export function getCurrentLanguage() { return currentLang; }

export async function setLanguage(lang) {
  console.log('[i18n] Attempting to set language to:', lang); 
  
  if (!lang) {
    console.warn('[i18n] Language code is undefined or null, falling back to "en".'); 
    lang = 'en';
  }

  if (currentLang === lang && Object.keys(translations).length > 0 && lang !== undefined) {
      console.log(`[i18n] Language ${lang} already set and translations loaded. Re-applying to DOM.`); 
      applyTranslationsToDOM(); 
      return;
  }

  try {
    console.log(`[i18n] Fetching /translations/${lang}.json`); 
    const response = await fetch(`/translations/${lang}.json`); // Absolute path
    console.log(`[i18n] Fetch response for ${lang}.json - Status: ${response.status}, OK: ${response.ok}`); 
    
    if (!response.ok) {
      throw new Error(`Translation file not found or fetch error for: ${lang} (Status: ${response.status})`);
    }
    
    const newTranslations = await response.json();
    if (Object.keys(newTranslations).length === 0 && lang !== 'en') { 
        console.warn(`[i18n] Translations for ${lang} seem empty. Check the JSON file: /translations/${lang}.json`); 
    } else {
        console.log(`[i18n] Translations successfully parsed for ${lang}.`); 
    }
    
    translations = newTranslations; 
    currentLang = lang;
    localStorage.setItem('preferredLang', lang);
    
    console.log(`[i18n] About to apply translations for ${lang} to DOM. Current translations object has ${Object.keys(translations).length} keys.`); 
    applyTranslationsToDOM();
    console.log(`[i18n] Language ${lang} applied successfully to DOM.`); 

  } catch (error) {
    console.error(`[i18n] Could not set language to ${lang}:`, error); 
    if (lang !== 'en') { 
        console.warn('[i18n] Falling back to English due to error in loading', lang); 
        await setLanguage('en'); 
    } else {
        console.error('[i18n] CRITICAL: Failed to load English (fallback) translations. Site text might be broken.'); 
        translations = { "error_loading_translations": "Content loading error. Please refresh." }; 
        applyTranslationsToDOM(); 
    }
  }
}

function applyTranslationsToDOM() {
  console.log('[i18n - applyTranslationsToDOM] Starting DOM update for language:', currentLang); 
  document.documentElement.lang = currentLang;
  document.documentElement.dir = ['ar', 'ru', 'uk', 'he', 'fa'].includes(currentLang) ? 'rtl' : 'ltr';

  let elementsProcessed = 0;
  document.querySelectorAll('[data-key]').forEach(element => {
    elementsProcessed++;
    const key = element.getAttribute('data-key');
    const messageParamsRaw = element.dataset.messageParams;
    let messageParams = null;
    if (messageParamsRaw) {
        try { messageParams = JSON.parse(messageParamsRaw); }
        catch (e) { console.warn("[i18n] Could not parse messageParams for key:", key, e); }
    }

    const translatedText = T(key, messageParams);
    
    if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
        if(element.type !== 'submit' && element.type !== 'button') {
             if (element.placeholder !== translatedText) element.placeholder = translatedText;
        } else {
             if (element.value !== translatedText) element.value = translatedText;
        }
    } else if (element.dataset.keyAlt !== undefined) { 
        if (element.alt !== translatedText) element.alt = translatedText;
    } else if (element.tagName === 'BUTTON') { 
        if (element.innerHTML !== translatedText) element.innerHTML = translatedText; 
    }
     else {
        if (element.innerHTML !== translatedText) element.innerHTML = translatedText;
    }
  });
  console.log(`[i18n - applyTranslationsToDOM] Finished DOM update. ${elementsProcessed} elements with data-key processed.`); 
}

export function getInitialLanguage() {
    const savedLang = localStorage.getItem('preferredLang');
    const browserLang = navigator.language.split('-')[0];
    const supportedLangs = ['en', 'ar', 'hi', 'fil', 'zh', 'ru', 'uk', 'id', 'tr']; 

    let initialLang = 'en'; 

    if (savedLang && supportedLangs.includes(savedLang)) {
        initialLang = savedLang;
    } else if (supportedLangs.includes(browserLang)) {
        initialLang = browserLang;
    }
    console.log('[i18n - getInitialLanguage] Determined initial language:', initialLang); 
    return initialLang;
}
