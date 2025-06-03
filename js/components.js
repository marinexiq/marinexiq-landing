// --- /js/components.js --- (Final Corrected Version with ALL features & Static PNG Logo)
import { LAUNCH_DATE } from './config.js';
import { T, getCurrentLanguage, translations as i18nLoadedTranslations } from './i18n.js';
import { submitSubscriptionForm } from './api.js';

let subscribers = 142364; 
let typedHeadline;
let jobMap; 
let countdownIntervalId; 
let statsCounterIntervalId; 

let aiAssistantIsDragging = false;
let aiAssistantDragOffsetX, aiAssistantDragOffsetY;

// --- Typed.js (Headline Animation) ---
export function initTypedJS() {
    console.log('[components.js] initTypedJS called.');
    if (typedHeadline) {
        typedHeadline.destroy();
    }
    const element = document.getElementById('main-headline-typed');
    if (element && typeof Typed !== 'undefined') {
        const headlineText = T('main_headline_v2');
        typedHeadline = new Typed('#main-headline-typed', {
            strings: [headlineText || 'main_headline_v2'], 
            typeSpeed: 50, backSpeed: 25, loop: false, cursorChar: '_', startDelay: 500,
        });
        console.log('[components.js] Typed.js instance created/recreated.');
    } else if (!element) { console.warn('[components.js] Typed.js: Element #main-headline-typed not found.'); }
      else if (typeof Typed === 'undefined') { console.warn('[components.js] Typed.js: Typed library not loaded.'); }
}

// --- Lottie (JSON Animations) ---
export function initLottieAnimations() {
    console.log('[components.js] initLottieAnimations called.');
    const lottieAnimations = {
        'lottie-logo-main': 'assets/marinexiq-logo.png', // <-- مسار شعارك الـ PNG
        'lottie-cv': 'https://lottie.host/91ddf900-170f-453a-872c-253d39ae74f9/NaX25xPIYd.json',
        'lottie-jobs': 'https://lottie.host/79f3a763-d873-4181-b671-cc592ac8a3b2/B0Ff2F9F1P.json',
        'lottie-interview': 'https://lottie.host/78b2c934-73af-4a14-bf5b-c8f82173a526/r2pY4E2R82.json',
        'lottie-certs': 'https://lottie.host/37a69b09-3e80-4691-8752-19663205e134/Y08y1t0zYg.json',
        'lottie-score': 'https://lottie.host/496057a0-5f85-4277-9f5c-901bd772df0d/eS5QG9W3q9.json',
        'lottie-support': 'https://lottie.host/7203cfb2-5c3a-4e8b-9efb-90897d8253d3/s2tLq0tXj5.json',
        'lottie-smart-badge': 'https://lottie.host/08ba957b-57e8-4614-a285-559f6f00b327/P3vGg04P3D.json'
    };
    let loadedCount = 0;
    for (const id in lottieAnimations) {
        const container = document.getElementById(id);
        const pathUrl = lottieAnimations[id];

        if (!container) {
            continue;
        }
        
        // --- تعديل لعرض شعار PNG أو Lottie ---
        if (id === 'lottie-logo-main') {
            if (pathUrl.endsWith('.png') || pathUrl.endsWith('.jpg') || pathUrl.endsWith('.jpeg') || pathUrl.endsWith('.svg')) { // إذا كان المسار لصورة ثابتة
                console.log(`[components.js] Using static image for main logo: ${pathUrl}`);
                container.innerHTML = `<img src="${pathUrl}" alt="${T('hero_logo_alt')}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
            } else if (pathUrl.endsWith('.json') && typeof lottie !== 'undefined') { // إذا كان ملف Lottie
                 console.log(`[components.js] Using Lottie for main logo: ${pathUrl}`);
                try {
                    container.innerHTML = ''; 
                    lottie.loadAnimation({
                        container: container, renderer: 'svg', loop: true, autoplay: true, path: pathUrl
                    });
                    loadedCount++;
                } catch(e) {
                     console.error("[components.js] Main logo Lottie loading error:", e);
                     container.textContent = T('hero_logo_alt');
                }
            } else { // fallback أو إذا كان الرابط هو المؤقت
                console.warn(`[components.js] Main logo path is placeholder or invalid: ${pathUrl}. Using alt text.`);
                container.textContent = T('hero_logo_alt');
            }
            continue; 
        }
        // --- نهاية تعديل الشعار ---

        if (typeof lottie === 'undefined') {
            console.warn(`[components.js] Lottie library not loaded for ${id}.`);
            const altTextKey = container.dataset.keyAlt;
            if(altTextKey) container.textContent = T(altTextKey);
            continue;
        }

        if (pathUrl && (pathUrl.startsWith('http') || pathUrl.startsWith('assets/')) && pathUrl.endsWith('.json')) {
             try {
                container.innerHTML = ''; 
                lottie.loadAnimation({
                    container: container, renderer: 'svg', loop: true, autoplay: true, path: pathUrl
                });
                loadedCount++;
            } catch(e) {
                console.error("[components.js] Lottie loading error for " + id + ":", e);
                const altTextKey = container.dataset.keyAlt;
                if(altTextKey) container.textContent = T(altTextKey); else container.textContent = `[Lottie Error]`;
            }
        } else { 
            console.warn(`[components.js] Lottie skipped for ${id}: Invalid path: ${pathUrl}`);
            const altTextKey = container.dataset.keyAlt;
            if(altTextKey) container.textContent = T(altTextKey); else container.textContent = `[Lottie Path Error]`;
        }
    }
    console.log(`[components.js] Lottie animations processed. ${loadedCount} Lottie files initiated.`);
}

// --- Countdown Timer ---
function updateCountdown() {
    const daysEl = document.getElementById("days");
    const hoursEl = document.getElementById("hours");
    const minutesEl = document.getElementById("minutes");
    const secondsEl = document.getElementById("seconds");
    if (!daysEl || !hoursEl || !minutesEl || !secondsEl) {
      if (countdownIntervalId) clearInterval(countdownIntervalId);
      return;
    }
    const now = new Date();
    const timeLeft = LAUNCH_DATE.getTime() - now.getTime();
    if (timeLeft <= 0) {
        const countdownTimerDramatic = document.getElementById("countdown-timer-dramatic");
        if (countdownTimerDramatic) {
            const launchedText = T('launched_text'); 
            countdownTimerDramatic.innerHTML = `<span class="fs-2 highlight">${launchedText}</span>`;
        }
        if (countdownIntervalId) clearInterval(countdownIntervalId);
        return;
    }
    daysEl.textContent = String(Math.floor(timeLeft / (1000 * 60 * 60 * 24))).padStart(2, '0');
    hoursEl.textContent = String(Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))).padStart(2, '0');
    minutesEl.textContent = String(Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))).padStart(2, '0');
    secondsEl.textContent = String(Math.floor((timeLeft % (1000 * 60)) / 1000)).padStart(2, '0');
}
export function initCountdown() {
    console.log('[components.js] initCountdown called.');
    if (document.getElementById("countdown-timer-dramatic")) {
        updateCountdown(); 
        if (countdownIntervalId) clearInterval(countdownIntervalId); 
        countdownIntervalId = setInterval(updateCountdown, 1000);
        console.log('[components.js] Countdown interval started.');
    } else { console.warn('[components.js] Countdown timer container not found.'); }
}

// --- AI Stats Counter ---
function updateDynamicAICounters() {
    const countersData = {
        "total-seafarers-count-dynamic": { base: 142571, elementId: "total-seafarers-count-dynamic" },
        "deck-officers-count-dynamic": { base: 17412, elementId: "deck-officers-count-dynamic" },
        "engine-officers-count-dynamic": { base: 29024, elementId: "engine-officers-count-dynamic" },
        "ready-to-work-count-dynamic": { base: 8103, elementId: "ready-to-work-count-dynamic" }
    };
    for (const key in countersData) {
        const item = countersData[key];
        const element = document.getElementById(item.elementId);
        if (element) {
            let currentValueStr = element.textContent.replace(/,/g, '');
            let currentValue = parseInt(currentValueStr);
            if (isNaN(currentValue) || (currentValue === 0 && element.textContent !== "0")) { 
                currentValue = item.base;
            }
            let change = Math.floor(Math.random() * 5) - 2; 
            currentValue += change;
            if (currentValue < item.base * 0.95 && item.base !== 0) currentValue = Math.floor(item.base * 0.95); 
            if (currentValue < 0) currentValue = 0;
            element.textContent = currentValue.toLocaleString();
        }
    }
}
export function initCounters() {
    console.log('[components.js] initCounters called.');
    updateDynamicAICounters(); 
    if (statsCounterIntervalId) clearInterval(statsCounterIntervalId);
    statsCounterIntervalId = setInterval(updateDynamicAICounters, 3000); 
    console.log('[components.js] Stats counter interval started.');
}

// --- Salary Calculator ---
function calculateSalary() {
    console.log('[components.js] calculateSalary called.');
    const rankSelect = document.getElementById('rank-select-salary');
    const experienceInput = document.getElementById('experience-input-salary');
    const salaryResultDiv = document.getElementById('salary-result');
    const estimatedSalarySpan = document.getElementById('estimated-salary');

    if (!rankSelect || !experienceInput || !salaryResultDiv || !estimatedSalarySpan) {
        console.warn('[components.js - SalaryCalc] One or more salary calculator elements not found.');
        return;
    }

    if (!rankSelect.value || experienceInput.value === "" || isNaN(parseInt(experienceInput.value))) {
        estimatedSalarySpan.textContent = T('smart_test_validation_error'); 
        salaryResultDiv.className = 'salary-result-container mt-4 text-center alert alert-danger';
        salaryResultDiv.style.display = 'block';
        return;
    }
    const rank = rankSelect.value;
    const experience = parseInt(experienceInput.value);
    const baseSalaries = {
        chief_mate: 6000, second_mate: 4500, third_mate: 3500,
        chief_engineer: 7000, second_engineer: 5000, third_engineer: 4000,
        eto: 4800, bosun: 2500, ab: 2000, os: 1500, motorman: 1800, cook: 2200
    };
    let estimatedSalary = baseSalaries[rank] || 1000; 
    estimatedSalary += experience * (Math.floor(Math.random() * 151) + 100); 
    estimatedSalary = Math.max(0, estimatedSalary); 

    estimatedSalarySpan.textContent = `$${estimatedSalary.toLocaleString()} - $${(estimatedSalary + Math.floor(Math.random() * 501) + 500).toLocaleString()}`;
    salaryResultDiv.className = 'salary-result-container mt-4 text-center alert alert-success';
    salaryResultDiv.style.display = 'block';
}
export function initSalaryCalculator() {
    console.log('[components.js] initSalaryCalculator called.');
    const calcButton = document.getElementById('calculate-salary-btn');
    if (calcButton) {
        calcButton.addEventListener('click', calculateSalary);
        console.log('[components.js] Salary calculator event listener attached.');
    } else {
        console.warn('[components.js] Salary calculator button not found.');
    }
}

// --- Readiness Test (Modal) ---
function calculateReadinessModal() {
    console.log('[components.js] calculateReadinessModal called.');
    const q1 = document.getElementById('q1-readiness')?.value;
    const q2 = document.getElementById('q2-readiness')?.value;
    const q3 = document.getElementById('q3-readiness')?.value;
    const q4 = document.getElementById('q4-readiness')?.value;
    const q5 = document.getElementById('q5-readiness')?.value;
    const resultDiv = document.getElementById('readiness-test-result');
    
    if (!resultDiv) {
        console.warn('[components.js - ReadinessTest] Result div #readiness-test-result not found.');
        return;
    }
    
    resultDiv.innerHTML = `
        <h4 data-key="smart_test_result_header">${T('smart_test_result_header')}</h4>
        <p><strong data-key="smart_test_result_readiness_label">${T('smart_test_result_readiness_label')}</strong> <span id="readiness-percentage-span" class="fw-bold"></span></p>
        <p><strong data-key="smart_test_result_company_fit_label">${T('smart_test_result_company_fit_label')}</strong> <span id="company-fit-suggestion-span"></span></p>
        <p><strong data-key="smart_test_result_recommendation_label">${T('smart_test_result_recommendation_label')}</strong> <span id="course-recommendation-span"></span></p>
    `;
    const percentageSpan = document.getElementById('readiness-percentage-span');
    const companySpan = document.getElementById('company-fit-suggestion-span');
    const recommendationSpan = document.getElementById('course-recommendation-span');

    if (!percentageSpan || !companySpan || !recommendationSpan){ 
        console.error('[components.js - ReadinessTest] Result spans not found after rebuilding resultDiv innerHTML.');
        resultDiv.innerHTML = `<p>${T('smart_test_validation_error')}</p>`;
        resultDiv.className = 'mt-4 p-3 border rounded alert alert-danger';
        resultDiv.style.display = 'block';
        return;
    }

    if (!q1 || !q2 || !q3 || !q4 || !q5) {
        resultDiv.style.display = 'block';
        resultDiv.className = 'mt-4 p-3 border rounded alert alert-danger';
        resultDiv.querySelector('h4').textContent = T('smart_test_validation_error');
        percentageSpan.textContent = ''; companySpan.textContent = ''; recommendationSpan.textContent = '';
        return;
    }
    let score = 0;
    if (q1 === 'coc') score += 30; else if (q1 === 'basic_stcw') score += 15;
    if (q2 === 'yes') score += 20;
    if (q3 === '5+') score += 20; else if (q3 === '3-5') score += 15; else if (q3 === '1-3') score += 10; else if (q3 === '<1') score += 5;
    if (q4 === 'officer') score += 20; else if (q4 === 'rating') score += 10;
    if (q5 !== 'any') score += 10;
    score = Math.min(score, 100);

    percentageSpan.textContent = `${score}%`;
    companySpan.textContent = (score > 70 ? T('company_fit_high_score_text') : T('company_fit_low_score_text')); 
    recommendationSpan.textContent = (score > 70 ? T('recommend_high_score_text') : T('recommend_low_score_text')); 
    
    resultDiv.className = 'mt-4 p-3 border rounded alert alert-success';
    resultDiv.style.display = 'block';
}
export function initReadinessTest() {
    console.log('[components.js] initReadinessTest called.');
    const calcButton = document.getElementById('calculate-readiness-modal-btn'); 
    if(calcButton) {
        calcButton.addEventListener('click', calculateReadinessModal);
        console.log('[components.js] Readiness test event listener attached.');
    } else {
        console.warn('[components.js] Readiness test calculate button #calculate-readiness-modal-btn not found.');
    }
}

// --- Leaflet Job Map ---
export function initJobMap() {
    console.log('[components.js] initJobMap called.');
    const mapElement = document.getElementById('jobMap');
    if (!mapElement || typeof L === 'undefined') {
        console.error("[components.js] Leaflet library (L) not loaded or map container #jobMap not found.");
        if(mapElement) mapElement.innerHTML = `<p style="padding: 20px; text-align: center;">${T('job_map_note')} (Map loading error)</p>`;
        return;
    }
    if (mapElement.offsetParent === null || mapElement.clientHeight === 0 || mapElement.clientWidth === 0) {
        console.warn("[components.js] Map container #jobMap is not visible or has no dimensions. Map will not initialize correctly. Will try again in 1s.");
        setTimeout(initJobMap, 1000); 
        return;
    }
    if (jobMap && typeof jobMap.getContainer === 'function' && jobMap.getContainer()) { 
        try { jobMap.invalidateSize(); } catch(e) { console.warn("[components.js] Could not invalidate map size:", e); }
        console.log('[components.js] Job map already initialized, invalidated size.');
        return;
    }

    try {
        jobMap = L.map('jobMap').setView([20, 0], 2);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 18,
            attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(jobMap);

        const jobHotspots = [
            { name: "Singapore", intensity: 0.9, lat: 1.3521, lon: 103.8198, jobs: 1200 },
            { name: "UAE", intensity: 0.8, lat: 23.4241, lon: 53.8478, jobs: 950 },
            { name: "Netherlands", intensity: 0.7, lat: 52.1326, lon: 5.2913, jobs: 700 },
            { name: "USA (Gulf)", intensity: 0.75, lat: 29.7604, lon: -95.3698, jobs: 800 },
            { name: "Norway", intensity: 0.6, lat: 60.4720, lon: 8.4689, jobs: 600 },
            { name: "China", intensity: 0.85, lat: 35.8617, lon: 104.1954, jobs: 1100 },
            { name: "India", intensity: 0.65, lat: 20.5937, lon: 78.9629, jobs: 550 },
            { name: "Philippines", intensity: 0.7, lat: 12.8797, lon: 121.7740, jobs: 650 }
        ];

        jobHotspots.forEach(spot => {
            const radius = spot.intensity * 200000 + 100000;
            const color = spot.intensity > 0.7 ? '#ff5722' : spot.intensity > 0.5 ? '#ffc107' : '#4caf50';
            L.circle([spot.lat, spot.lon], {
                color: color, fillColor: color, fillOpacity: 0.4, radius: radius
            }).addTo(jobMap)
            .bindPopup(`<b>${spot.name}</b><br>Approx. ${spot.jobs} ${T('job_opportunities_text') || 'job opportunities'}.`)
            .on('mouseover', function (e) { this.openPopup(); })
            .on('mouseout', function (e) { this.closePopup(); });
        });
        
        setTimeout(() => { if(jobMap && typeof jobMap.getContainer === 'function' && jobMap.getContainer()) jobMap.invalidateSize(); }, 500);
        console.log('[components.js] Leaflet Job Map initialized successfully.');
    } catch(e) {
        console.error('[components.js] Error initializing Leaflet Job Map:', e);
        mapElement.innerHTML = `<p style="padding: 20px; text-align: center;">${T('job_map_note')} (Map loading error)</p>`;
    }
}

// --- Subscription Form ---
export function initSubscriptionForm() {
    console.log('[components.js] initSubscriptionForm called.');
    const form = document.getElementById("subscription-form-landing");
    const formStatusMessageDiv = document.getElementById("form-status-message");
    const formStatusContainer = document.getElementById("form-status-container");
    const smartBadgeContainer = document.getElementById("smart-badge-container");

    if (!form || !formStatusMessageDiv || !formStatusContainer || !smartBadgeContainer) {
        console.error("[components.js - SubscriptionForm] One or more subscription form elements not found.");
        return;
    }

    form.addEventListener("submit", async function (e) {
        e.preventDefault();
        console.log('[components.js] Subscription form submitted.');
        const emailInput = document.getElementById("email-input-landing");
        const phoneInput = document.getElementById("phone-input-landing");
        const commentInput = document.getElementById("comment-input-landing");
        const roleSelect = document.getElementById("role-select-landing");

        const displayError = (messageKey) => {
            formStatusMessageDiv.textContent = T(messageKey);
            formStatusMessageDiv.className = 'mb-3 alert alert-danger'; 
            formStatusContainer.style.display = 'block';
            smartBadgeContainer.style.display = 'none';
            console.warn('[components.js] Subscription form validation error:', T(messageKey));
        };

        if (!emailInput.value || !emailInput.checkValidity()) { displayError('alert_invalid_email'); return; }
        if (!phoneInput.value) { displayError('alert_phone_required'); return; }
        if (!roleSelect.value) { displayError('alert_role_required'); return; }
        if (!commentInput.value) { displayError('alert_comment_required'); return; }
        
        const formData = new FormData();
        formData.append("email", emailInput.value);
        formData.append("phoneNumber", phoneInput.value);
        formData.append("role", roleSelect.value);
        formData.append("comment", commentInput.value);
        formData.append("language", getCurrentLanguage());
        
        const submitButton = form.querySelector('button[type="submit"]');
        const originalButtonTextKey = submitButton.dataset.key; 
        const originalButtonHTML = T(originalButtonTextKey); 

        submitButton.disabled = true;
        submitButton.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Sending...';
        
        formStatusMessageDiv.textContent = 'Submitting... Please wait.'; 
        formStatusMessageDiv.className = 'mb-3 alert alert-info';
        formStatusContainer.style.display = 'block';
        smartBadgeContainer.style.display = 'none';

        const response = await submitSubscriptionForm(formData); 

        if (response.result === "success") {
            console.log('[components.js] Subscription form submission successful.');
            subscribers += 1;
            updateDynamicAICounters(); 
            formStatusMessageDiv.textContent = T('alert_form_submission_success', { subscriberId: response.subscriberId || 'N/A' });
            formStatusMessageDiv.className = 'mb-3 alert alert-success';
            smartBadgeContainer.style.display = 'block'; 
            form.reset();
        } else {
            console.error('[components.js] Subscription form submission failed:', response.message);
            formStatusMessageDiv.textContent = response.message || T('alert_form_submission_error');
            formStatusMessageDiv.className = 'mb-3 alert alert-danger';
        }
        submitButton.disabled = false;
        submitButton.innerHTML = originalButtonHTML; 
    });
    console.log('[components.js] Subscription form event listener attached.');
}

// --- AI Assistant Widget ---
function addMessageToAIAssistant(message, sender) {
    const messagesContainer = document.getElementById('ai-assistant-messages-container');
    if (!messagesContainer) {
        console.warn('[components.js - AI Assistant] Messages container not found.');
        return;
    }
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', sender);
    messageDiv.innerHTML = (sender === 'assistant') ? `<i class="fas fa-robot me-2"></i> ${message}` : message; // Basic HTML for icon
    messagesContainer.appendChild(messageDiv);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function handleAIAssistantInput(event) {
    event.preventDefault();
    const userInputField = document.getElementById('ai-assistant-user-input');
    if (!userInputField) return;
    const userMessage = userInputField.value.trim();
    if (userMessage === "") return;

    console.log('[components.js - AI Assistant] User typed:', userMessage);
    addMessageToAIAssistant(userMessage, 'user');
    userInputField.value = ""; 

    setTimeout(() => {
        const lang = getCurrentLanguage();
        const currentLangTranslations = i18nLoadedTranslations[lang] || i18nLoadedTranslations['en'] || {};
        const mockResponsesContainer = currentLangTranslations.ai_assistant_mock_responses || {};
        
        console.log(`[components.js - AI Assistant] Mock responses for lang '${lang}':`, mockResponsesContainer);

        let response = mockResponsesContainer.default || "I am still learning new responses! (Default Fallback)";
        const userMessageLower = userMessage.toLowerCase();

        if (userMessageLower.includes("aramco") || userMessageLower.includes("أرامكو")) {
            response = mockResponsesContainer.key_aramco || response;
        } else if (userMessageLower.includes("chief officer") || userMessageLower.includes("ضابط أول") || userMessageLower.includes("كبير ضباط")) {
            response = mockResponsesContainer.key_chief_officer || response;
        } else if (userMessageLower.includes("career") || userMessageLower.includes("plan") || userMessageLower.includes("ترقية") || userMessageLower.includes("خطة")) {
            response = mockResponsesContainer.key_career_plan || response;
        } else if (userMessageLower.includes("jobs") || userMessageLower.includes("وظائف") || userMessageLower.includes("خبرة") || userMessageLower.includes("experience")) {
            response = mockResponsesContainer.key_jobs_experience || response;
        }
        
        console.log('[components.js - AI Assistant] Responding with:', response);
        addMessageToAIAssistant(response, 'assistant');
    }, 700 + Math.random() * 500);
}

export function initAIAssistant() {
    console.log('[components.js] initAIAssistant called.');
    const openBtn = document.getElementById('open-ai-assistant-btn');
    const closeBtn = document.getElementById('close-ai-assistant');
    const widget = document.getElementById('ai-assistant-widget');
    const form = document.getElementById('ai-assistant-input-form');
    const header = document.getElementById('ai-assistant-header-drag');
    const messagesContainer = document.getElementById('ai-assistant-messages-container');

    if (!openBtn || !widget || !closeBtn || !form || !header || !messagesContainer) {
        console.warn('[components.js - AI Assistant] One or more AI assistant elements not found.');
        return;
    }

    openBtn.addEventListener('click', () => {
        console.log('[components.js - AI Assistant] Open button clicked.');
        widget.classList.add('show');
        openBtn.classList.add('hide');
        // Add welcome message only if container is empty, to prevent duplicates on re-init
        if (messagesContainer.innerHTML.trim() === '') { 
            addMessageToAIAssistant(T('ai_assistant_welcome_message'), 'assistant');
        }
    });
    closeBtn.addEventListener('click', () => {
        console.log('[components.js - AI Assistant] Close button clicked.');
        widget.classList.remove('show');
        if(openBtn) openBtn.classList.remove('hide');
    });
    form.addEventListener('submit', handleAIAssistantInput);

    // Drag logic
    header.addEventListener('mousedown', (e) => {
        if (e.target.tagName === 'BUTTON' || e.target.tagName === 'INPUT') return;
        aiAssistantIsDragging = true;
        aiAssistantDragOffsetX = e.clientX - widget.getBoundingClientRect().left;
        aiAssistantDragOffsetY = e.clientY - widget.getBoundingClientRect().top;
        widget.style.cursor = 'grabbing'; header.style.cursor = 'grabbing';
    });
    document.addEventListener('mousemove', (e) => {
        if (!aiAssistantIsDragging) return;
        e.preventDefault();
        let newX = e.clientX - aiAssistantDragOffsetX;
        let newY = e.clientY - aiAssistantDragOffsetY;
        const maxX = window.innerWidth - widget.offsetWidth;
        const maxY = window.innerHeight - widget.offsetHeight;
        widget.style.left = Math.min(Math.max(0, newX), maxX) + 'px';
        widget.style.top = Math.min(Math.max(0, newY), maxY) + 'px';
        widget.style.bottom = 'auto'; widget.style.right = 'auto';
    });
    document.addEventListener('mouseup', () => {
        if(aiAssistantIsDragging){
            aiAssistantIsDragging = false;
            widget.style.cursor = 'default'; header.style.cursor = 'grab';
        }
    });
    header.addEventListener('selectstart', (e) => e.preventDefault());
    console.log('[components.js] AI Assistant event listeners and drag logic attached.');
}
