// --- /js/api.js ---
// Handles all communication with external services (APIs).

import { GOOGLE_SCRIPT_URL } from './config.js';

// تأكد أن كلمة "export" موجودة هنا بالضبط
export async function submitSubscriptionForm(formData) {
  console.log('[api.js] Submitting form data to Google Sheet:', formData);
  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: "POST",
      body: formData
    });

    console.log('[api.js] Google Sheet raw response status:', response.status);

    if (response.type === 'opaque' || response.type === 'opaqueredirect') {
        console.warn('[api.js] Opaque response from Google Script. Assuming success if no network error.');
        return { result: "success", subscriberId: "N/A (Opaque)" };
    }
    
    if (!response.ok) { 
      console.error('[api.js] Network response was not ok.', response);
      const errorText = await response.text(); 
      console.error('[api.js] Error response text:', errorText);
      throw new Error(`Network response was not ok, status: ${response.status}, message: ${errorText}`);
    }
    
    const responseData = await response.json();
    console.log('[api.js] Google Sheet JSON response:', responseData);
    return responseData;

  } catch (error) {
    console.error("[api.js] API Submission Error:", error);
    return { result: "error", message: error.message || "Form submission failed due to a network or script error." };
  }
}
