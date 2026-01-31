// Production-safe API configuration
// In production (Render), use the backend URL from env variable
// In development, empty string uses the Vite proxy
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

/**
 * Safe JSON response parsing with defensive error handling.
 * If backend returns non-JSON or empty response, throw descriptive error.
 */
const safeParse = async (response) => {
  const text = await response.text();
  if (!text) {
    throw new Error(`Empty response from server (status: ${response.status})`);
  }
  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("Failed to parse JSON response:", text.substring(0, 200));
    throw new Error(`Invalid JSON response from server: ${text.substring(0, 100)}`);
  }
};

export const uploadResume = async (formData) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
      method: "POST",
      body: formData,
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Upload failed:", res.status, errorText);
      throw new Error(errorText || `Request failed with status ${res.status}`);
    }
    
    return await safeParse(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error uploading resume";
    console.error("uploadResume error:", message);
    throw new Error(message);
  }
};

export const analyzeRole = async (resumeId, role) => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/role/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resume_id: resumeId, role }),
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Role analysis failed:", res.status, errorText);
      throw new Error(errorText || `Request failed with status ${res.status}`);
    }
    
    return await safeParse(res);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error analyzing role";
    console.error("analyzeRole error:", message);
    throw new Error(message);
  }
};
