// --- /js/theme.js ---
// Handles all logic related to theme switching (light/dark/default).

const THEMES = ['theme-default', 'theme-light', 'theme-dark'];
let currentTheme = 'theme-default'; // Default if nothing is saved

/**
 * Cycles to the next theme in the THEMES array and saves the preference.
 */
export function cycleTheme() {
  console.log('[theme.js] cycleTheme called. Current theme:', currentTheme);
  const body = document.body;
  body.classList.remove(currentTheme); // Remove current theme class

  let currentThemeIndex = THEMES.indexOf(currentTheme);
  currentThemeIndex = (currentThemeIndex + 1) % THEMES.length; // Cycle to next theme
  currentTheme = THEMES[currentThemeIndex];

  body.classList.add(currentTheme); // Add new theme class
  localStorage.setItem('preferredTheme', currentTheme); // Save preference
  console.log('[theme.js] New theme set:', currentTheme);
  // Visual update of the button (icon/text) will be handled by updateThemeToggleButtonVisuals in main.js
}

/**
 * Applies the saved theme from localStorage or default on initial page load.
 */
export function applyInitialTheme() {
  const savedTheme = localStorage.getItem('preferredTheme');
  currentTheme = (savedTheme && THEMES.includes(savedTheme)) ? savedTheme : THEMES[0]; // Fallback to the first theme in the array
  console.log('[theme.js] applyInitialTheme. Determined theme:', currentTheme);
  
  // Ensure no other theme classes are present before adding the correct one.
  THEMES.forEach(t => document.body.classList.remove(t));
  document.body.classList.add(currentTheme);
}

/**
 * Updates the theme toggle button's icon and text based on the current theme.
 * This function is called from main.js after language is set to ensure text is translated.
 */
export function updateThemeToggleButtonVisuals(translatedTextProvider) {
    const themeToggleButton = document.getElementById('theme-cycle-button');
    if (!themeToggleButton) {
        console.warn('[theme.js] Theme cycle button not found for visual update.');
        return;
    }

    let nextThemeKey;
    let currentIconClass = 'fa-adjust'; // Default icon

    if (currentTheme === 'theme-light') {
        nextThemeKey = 'theme_toggle_dark'; // Text will be "Switch to Dark Theme"
        currentIconClass = 'fa-moon';
    } else if (currentTheme === 'theme-dark') {
        nextThemeKey = 'theme_toggle_default'; // Text will be "Switch to Default Theme"
        currentIconClass = 'fa-yin-yang'; 
    } else { // theme-default
        nextThemeKey = 'theme_toggle_light'; // Text will be "Switch to Light Theme"
        currentIconClass = 'fa-sun';
    }
    
    const text = translatedTextProvider ? translatedTextProvider(nextThemeKey) : 'Cycle Theme'; // Use the T() function
    themeToggleButton.innerHTML = `<i class="fas ${currentIconClass}"></i> <span style="font-size: 0.7rem;">${text}</span>`;
    console.log('[theme.js] Theme toggle button visuals updated. Icon:', currentIconClass, 'Text Key:', nextThemeKey);
}
