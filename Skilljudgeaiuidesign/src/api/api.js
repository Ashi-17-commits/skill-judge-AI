/**
 * Single source of truth for backend URL.
 * ONLY from environment: import.meta.env.VITE_API_BASE_URL
 * - Production (Render): Set VITE_API_BASE_URL to backend service URL (HTTPS).
 * - Development: VITE_API_BASE_URL=http://localhost:8000 or leave unset for same-origin.
 * NEVER use localhost in production builds.
 */
const API_BASE_URL = (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) != null
  ? String(import.meta.env.VITE_API_BASE_URL).trim()
  : "";

const isProduction = import.meta.env?.MODE === "production";
if (isProduction && !API_BASE_URL) {
  console.warn("[API CONFIG] VITE_API_BASE_URL is not set in production. Requests will use relative URLs (same-origin only).");
}
console.log(`[API CONFIG] Backend URL: ${API_BASE_URL || "(relative)"}`);

/**
 * Safe JSON parsing: use response.text() + try/catch. Never call response.json() blindly.
 * Response body can only be read once.
 */
const safeParseResponse = async (response) => {
  const contentType = response.headers.get("content-type") || "";
  console.log(`[API] Response status: ${response.status}, content-type: ${contentType}`);
  const text = await response.text();
  console.log(`[API] Response text length: ${text.length}`);
  if (!text || !text.trim()) {
    throw new Error(`Empty response from server (status: ${response.status})`);
  }
  try {
    const parsed = JSON.parse(text);
    console.log(`[API] Parsed JSON, keys: ${Object.keys(parsed).join(", ")}`);
    return parsed;
  } catch (e) {
    console.error("[API] Invalid JSON:", text.substring(0, 500));
    throw new Error("Invalid JSON response from server");
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
      credentials: "include",
    });
    console.log(`[API] Response received: status ${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      console.error("[API] Error response:", text.substring(0, 500));
      try {
        const err = text ? JSON.parse(text) : {};
        const msg = err.message ?? err.detail ?? err.error ?? text || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      } catch (e) {
        if (e instanceof Error && e.message !== "Invalid JSON response from server") throw e;
        throw new Error(text || `Request failed (${res.status})`);
      }
    }
    const result = await safeParseResponse(res);
    console.log(`[API] Upload successful, resume_id: ${result.resume_id}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error. Check connection and CORS.";
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
      credentials: "include",
    });
    console.log(`[API] Response received: status ${res.status}`);
    if (!res.ok) {
      const text = await res.text();
      console.error("[API] Error response:", text.substring(0, 500));
      try {
        const err = text ? JSON.parse(text) : {};
        const msg = err.message ?? err.detail ?? err.error ?? text || `HTTP ${res.status}`;
        throw new Error(typeof msg === "string" ? msg : JSON.stringify(msg));
      } catch (e) {
        if (e instanceof Error && e.message !== "Invalid JSON response from server") throw e;
        throw new Error(text || `Request failed (${res.status})`);
      }
    }
    const result = await safeParseResponse(res);
    console.log(`[API] Role analysis successful, readiness_score: ${result.readiness_score}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Network error. Check connection and CORS.";
    console.error("[API] analyzeRole failed:", message);
    throw new Error(message);
  }
};
