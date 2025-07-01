// --- /js/i18n.js ---
// Internationalization using i18next library

export let translations = {};
let currentLang = 'en';

function applyTranslationsToDOM() {
    document.documentElement.lang = currentLang;
    document.documentElement.dir = ['ar','ru','uk','he','fa'].includes(currentLang) ? 'rtl' : 'ltr';
    document.querySelectorAll('[data-key]').forEach(el => {
        const key = el.getAttribute('data-key');
        const text = i18next.t(key);
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
            if(el.type !== 'submit' && el.type !== 'button') el.placeholder = text;
            else el.value = text;
        } else if(el.dataset.keyAlt !== undefined) {
            el.alt = text;
        } else {
            el.innerHTML = text;
        }
    });
    translations = i18next.getResourceBundle(currentLang) || {};
}

export async function initI18n(lang) {
    return new Promise((resolve, reject) => {
        i18next
            .use(i18nextHttpBackend)
            .init({
                lng: lang,
                fallbackLng: 'en',
                debug: false,
                backend: {
                    loadPath: '/translations/{{lng}}.json'
                }
            }, (err) => {
                if (err) { reject(err); return; }
                currentLang = i18next.language;
                applyTranslationsToDOM();
                resolve();
            });
    });
}

export async function setLanguage(lang) {
    await i18next.changeLanguage(lang);
    currentLang = i18next.language;
    localStorage.setItem('preferredLang', currentLang);
    applyTranslationsToDOM();
}

export function getCurrentLanguage() { return currentLang; }

export function T(key, params = null) { return i18next.t(key, params); }

export function getInitialLanguage() {
    const saved = localStorage.getItem('preferredLang');
    if (saved) return saved;
    const browserLang = navigator.language.split('-')[0];
    return browserLang || 'en';
}
