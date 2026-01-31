/**
 * Production-ready API configuration
 * Reads backend URL from environment variable VITE_API_BASE_URL
 * 
 * Environment setup:
 * - Production: VITE_API_BASE_URL=https://skill-judge-ai-tm61.onrender.com
 * - Development: VITE_API_BASE_URL=http://localhost:8000
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

if (!API_BASE_URL) {
  console.warn("[API CONFIG] Warning: VITE_API_BASE_URL is not set. Using relative URLs (dev mode).");
}

console.log(`[API CONFIG] Backend URL: ${API_BASE_URL || "(using relative URLs)"}`);

/**
 * Safe JSON response parsing with defensive error handling.
 * If backend returns non-JSON or empty response, throw descriptive error.
 * 
 * IMPORTANT: Response body can only be read once!
 * Use clone() to preserve the body if reading multiple times.
 */
const safeParse = async (response) => {
  console.log(`[API] Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);
  
  // Clone the response before reading to preserve the body
  const clonedResponse = response.clone();
  const text = await clonedResponse.text();
  console.log(`[API] Response text length: ${text.length}`);
  
  if (!text) {
    throw new Error(`Empty response from server (status: ${response.status})`);
  }
  try {
    const parsed = JSON.parse(text);
    console.log(`[API] Successfully parsed JSON, keys: ${Object.keys(parsed).join(', ')}`);
    return parsed;
  } catch (e) {
    console.error("[API] Failed to parse JSON response:", text.substring(0, 500));
    throw new Error(`Invalid JSON response from server`);
  }
};

/**
 * Upload resume to backend
 * @param {FormData} formData - Form data with 'file' field
 * @returns {Promise<Object>} ATS score response
 */
export const uploadResume = async (formData) => {
  const endpoint = `${API_BASE_URL}/api/resume/upload`;
  console.log(`[API] POST ${endpoint}`);
  
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      body: formData,
    });
    
    console.log(`[API] Response received: status ${res.status}`);
    
    if (!res.ok) {
      const cloned = res.clone();
      const errorText = await cloned.text();
      console.error("[API] Error response:", errorText.substring(0, 500));
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorJson.detail || `HTTP ${res.status}`);
      } catch {
        throw new Error(errorText || `HTTP ${res.status}`);
      }
    }
    
    const result = await safeParse(res);
    console.log(`[API] Upload successful, resume_id: ${result.resume_id}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error uploading resume";
    console.error("[API] uploadResume failed:", message);
    throw new Error(message);
  }
};

/**
 * Analyze role readiness
 * @param {string} resumeId - Resume ID from upload
 * @param {string} role - Role name to analyze
 * @returns {Promise<Object>} Role readiness response
 */
export const analyzeRole = async (resumeId, role) => {
  const endpoint = `${API_BASE_URL}/api/role/analyze`;
  console.log(`[API] POST ${endpoint}`);
  
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, role }),
    });
    
    console.log(`[API] Response received: status ${res.status}`);
    
    if (!res.ok) {
      const cloned = res.clone();
      const errorText = await cloned.text();
      console.error("[API] Error response:", errorText.substring(0, 500));
      
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorJson.detail || `HTTP ${res.status}`);
      } catch {
        throw new Error(errorText || `HTTP ${res.status}`);
      }
    }
    
    const result = await safeParse(res);
    console.log(`[API] Role analysis successful, readiness_score: ${result.readiness_score}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error analyzing role";
    console.error("[API] analyzeRole failed:", message);
    throw new Error(message);
  }
};
