// Production-safe API configuration
// In production (Render), use the backend URL from env variable
// In development, empty string uses the Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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
    const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: "POST",
      body: formData,
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
    const message = error instanceof Error ? error.message : "Unknown error uploading resume";
    console.error("[API] uploadResume error:", message);
    throw new Error(message);
  }
};

export const analyzeRole = async (resumeId, role) => {
  try {
    console.log(`[API] Starting role analysis for role: ${role}, resume_id: ${resumeId}`);
    const res = await fetch(`${API_BASE_URL}/api/role/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, role }),
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
    console.log(`[API] Role analysis completed, readiness_score: ${result.readiness_score}`);
    return result;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error analyzing role";
    console.error("[API] analyzeRole error:", message);
    throw new Error(message);
  }
};
