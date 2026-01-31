// Use relative paths so the dev server (or production server) can proxy/serve the API
const API_BASE_URL = ""; // empty -> request goes to same origin

export const uploadResume = async (formData) => {
  const res = await fetch(`${API_BASE_URL}/api/resume/upload`, {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(text || `Request failed with status ${res.status}`);
  }
  return res.json();
};
