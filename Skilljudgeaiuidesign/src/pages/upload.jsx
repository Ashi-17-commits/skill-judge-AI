import React, { useState } from "react";
import { uploadResume } from "../api/api";

const Upload = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);

  const handleUpload = async (file) => {
    setError("");
    setResult(null);
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setLoading(true);
      const res = await uploadResume(formData);
      setResult(res);
    } catch (err) {
      console.error(err);
      setError(err?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl mb-4">Upload Resume</h2>

      <input
        type="file"
        accept=".pdf,.docx"
        onChange={(e) => handleUpload(e.target.files[0])}
        className="mb-4"
      />

      {loading && <div>Uploading and parsing...</div>}
      {error && <div className="text-red-500">Error: {error}</div>}

      {result && (
        <div className="mt-6 space-y-4">
          <div>
            <strong>File:</strong> {result.file_name} — {result.content_type}
          </div>

          <div>
            <strong>ATS score:</strong> {result.ats_facts.ats_score}
          </div>

          <div>
            <strong>Verdict:</strong> {result.explanation.verdict}
          </div>

          <div>
            <strong>Summary:</strong>
            <p className="whitespace-pre-wrap">{result.explanation.summary}</p>
          </div>

          <div>
            <strong>Strengths</strong>
            <ul className="list-disc ml-6">
              {result.explanation.strengths.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Skill gaps</strong>
            <ul className="list-disc ml-6">
              {result.explanation.skill_gaps.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          <div>
            <strong>Next actions</strong>
            <ul className="list-disc ml-6">
              {result.explanation.next_actions.map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {result.raw_text_preview && (
            <div>
              <strong>Raw text preview</strong>
              <pre className="bg-slate-800 p-3 rounded text-sm whitespace-pre-wrap">{result.raw_text_preview}</pre>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;
