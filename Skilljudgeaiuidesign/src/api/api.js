/**
 * Backend URL: runtime (window) then build-time env.
 * On Render: set VITE_API_BASE_URL or VITE_API_URL to your backend service URL (HTTPS) at build time.
 * Accept both names so either env var works.
 */
function getApiBaseUrl() {
  if (typeof window !== "undefined" && window.__API_BASE_URL__ != null && String(window.__API_BASE_URL__).trim() !== "") {
    return String(window.__API_BASE_URL__).trim().replace(/\/$/, "");
  }
  const a = import.meta.env.VITE_API_BASE_URL;
  const b = import.meta.env.VITE_API_URL;
  const fromEnv = (a != null && String(a).trim() !== "") ? String(a).trim() : (b != null && String(b).trim() !== "" ? String(b).trim() : "");
  return fromEnv.replace(/\/$/, "");
}

const API_BASE_URL = getApiBaseUrl();

if (typeof window !== "undefined") {
  console.log("[API] Backend URL:", API_BASE_URL || "(relative – same origin)");
}

/**
 * Safe JSON response parsing with defensive error handling.
 * If backend returns non-JSON or empty response, throw descriptive error.
 * 
 * IMPORTANT: Response body can only be read once!
 * Once consumed, subsequent reads return empty.
 */
const safeParse = async (response) => {
  console.log(`[API] Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);
  
  // Clone the response before reading to preserve the body
  const clonedResponse = response.clone();
  const text = await clonedResponse.text();
  console.log(`[API] Response text length: ${text.length}, first 200 chars: ${text.substring(0, 200)}`);
  
  if (!text) {
    throw new Error(`Empty response from server (status: ${response.status})`);
  }
  try {
    const parsed = JSON.parse(text);
    console.log(`[API] Successfully parsed JSON, keys: ${Object.keys(parsed).join(', ')}`);
    return parsed;
  } catch (e) {
    console.error("[API] Failed to parse JSON response:", text.substring(0, 200));
    throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`);
  }
};

export const uploadResume = async (formData) => {
  try {
    console.log(`[API] Starting resume upload to: ${API_BASE_URL || '(proxy)'}/api/resume/upload`);
    const url = `${API_BASE_URL}/api/resume/upload`;
    console.log("[API] POST", url);
    const res = await fetch(url, {
      method: "POST",
      body: formData,
      credentials: "include",
    });
    
    console.log(`[API] Upload response received, status: ${res.status}, ok: ${res.ok}`);
    
    if (!res.ok) {
      // Try to get error message from response
      const cloned = res.clone();
      const errorText = await cloned.text();
      console.error("Upload failed with status", res.status, ":", errorText.substring(0, 500));
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorJson.detail || `Request failed with status ${res.status}`);
      } catch {
        // If not JSON, use the text or status
        throw new Error(errorText || `Request failed with status ${res.status}`);
      }
    }
    
    const result = await safeParse(res);
    console.log(`[API] Upload completed successfully, resume_id: ${result.resume_id}`);
    return result;
  } catch (error) {
    let message = error instanceof Error ? error.message : "Unknown error uploading resume";
    const isProd = typeof window !== "undefined" && window.location && !/^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname);
    if (isProd && !API_BASE_URL) {
      message += " Set VITE_API_BASE_URL (or VITE_API_URL) to your backend URL (e.g. https://your-backend.onrender.com) in Render and rebuild.";
    }
    console.error("[API] uploadResume error:", message);
    throw new Error(message);
  }
};

export const analyzeRole = async (resumeId, role) => {
  try {
    console.log(`[API] Starting role analysis for role: ${role}, resume_id: ${resumeId}`);
    const url = `${API_BASE_URL}/api/role/analyze`;
    console.log("[API] POST", url);
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, role }),
      credentials: "include",
    });
    
    console.log(`[API] Role analysis response received, status: ${res.status}, ok: ${res.ok}`);
    
    if (!res.ok) {
      // Try to get error message from response
      const cloned = res.clone();
      const errorText = await cloned.text();
      console.error("Role analysis failed with status", res.status, ":", errorText.substring(0, 500));
      
      // Try to parse error as JSON
      try {
        const errorJson = JSON.parse(errorText);
        throw new Error(errorJson.message || errorJson.detail || `Request failed with status ${res.status}`);
      } catch {
        // If not JSON, use the text or status
        throw new Error(errorText || `Request failed with status ${res.status}`);
      }
    }
    
    const result = await safeParse(res);
    console.log("[API] Role analysis full response:", result);
    

    console.log("[API] Role analysis completed, target_role:", result?.target_role, "readiness_score:", result?.readiness_score, "gaps:", result?.gaps?.length ?? 0, "non_negotiable:", result?.non_negotiable?.length ?? 0);

    return result;
  } catch (error) {
    let message = error instanceof Error ? error.message : "Unknown error analyzing role";
    const isProd = typeof window !== "undefined" && window.location && !/^localhost$|^127\.0\.0\.1$/i.test(window.location.hostname);
    if (isProd && !API_BASE_URL) {
      message += " Set VITE_API_BASE_URL (or VITE_API_URL) to your backend URL in Render and rebuild.";
    }
    console.error("[API] analyzeRole error:", message);
    throw new Error(message);
  }
};
