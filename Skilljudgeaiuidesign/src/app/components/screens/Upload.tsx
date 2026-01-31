import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Upload as UploadIcon, FileText, Loader2 } from "lucide-react";
import { uploadResume } from "@/api/api";

export default function Upload() {
  const navigate = useNavigate();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [fileName, setFileName] = useState<string>("");
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState("");
  const [error, setError] = useState<string>("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      startAnalysis(file);
    }
  };

  const startAnalysis = async (file: File) => {
    setIsAnalyzing(true);
    setProgress(0);
    setError("");

    const statuses = [
      "Extracting document structure",
      "Analyzing skill signals",
      "Evaluating experience depth",
      "Comparing against market standards",
      "Calculating ATS compatibility",
      "Generating diagnostic report"
    ];

    let currentStatus = 0;
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + (100 / statuses.length);
        if (next >= 100) {
          clearInterval(interval);
          return 100;
        }
        return next;
      });

      if (currentStatus < statuses.length) {
        setStatusText(statuses[currentStatus]);
        currentStatus++;
      }
    }, 800);

    try {
      const formData = new FormData();
      formData.append("file", file);
      
      console.log("Uploading file:", file.name);
      const result = await uploadResume(formData);
      console.log("Upload successful:", result);
      
      clearInterval(interval);
      setProgress(100);
      setStatusText("Analysis complete!");
      
      setTimeout(() => navigate("/ats-score", { state: { data: result } }), 500);
    } catch (err) {
      clearInterval(interval);
      const errorMessage = err instanceof Error ? err.message : "Failed to upload resume";
      setError(errorMessage);
      setIsAnalyzing(false);
      console.error("Upload error:", err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-4xl w-full">
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 p-4 bg-red-100 border border-red-300 rounded-lg text-red-800"
          >
            {error}
          </motion.div>
        )}
        <AnimatePresence mode="wait">
          {!isAnalyzing ? (
            <motion.div
              key="upload"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.6 }}
              className="space-y-12"
            >
              <div>
                <h1 className="text-foreground mb-4">Upload Resume</h1>
                <p className="text-muted-foreground" style={{ fontSize: '19px' }}>
                  Submit your resume for comprehensive evaluation.
                </p>
              </div>

              <label className="block cursor-pointer">
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                <motion.div
                  className="glass-panel p-24 border-2 border-dashed border-border hover:border-accent 
                             transition-all duration-300 text-center"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <UploadIcon className="w-16 h-16 mx-auto mb-6 text-muted-foreground" />
                  <h3 className="mb-3">Drop resume or click to browse</h3>
                  <p className="text-muted-foreground">
                    PDF, DOC, or DOCX • Maximum 10MB
                  </p>
                </motion.div>
              </label>

              {fileName && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel p-6 flex items-center gap-4"
                >
                  <FileText className="w-5 h-5 text-accent" />
                  <span className="text-foreground flex-1">{fileName}</span>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="analyzing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="space-y-16"
            >
              <div className="text-center space-y-4">
                <h2 className="text-foreground" style={{ fontSize: 'clamp(28px, 3vw, 40px)' }}>
                  Skill Judge AI is analyzing your resume
                </h2>
                <p className="text-muted-foreground" style={{ fontSize: '19px' }}>
                  Please wait while we perform a comprehensive evaluation
                </p>
              </div>

              {/* Progress bar */}
              <div className="space-y-6">
                <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-accent rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  />
                </div>
                <div className="text-center">
                  <div className="font-bold text-foreground mb-2" style={{ fontSize: '48px' }}>
                    {Math.round(progress)}%
                  </div>
                </div>
              </div>

              {/* Status text */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={statusText}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-center"
                >
                  <div className="flex items-center justify-center gap-3 text-muted-foreground" style={{ fontSize: '17px' }}>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>{statusText}</span>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Scanning line effect */}
              <div className="glass-panel p-16 relative overflow-hidden">
                <FileText className="w-32 h-32 mx-auto text-muted-foreground/20" />
                <motion.div
                  className="absolute inset-x-0 h-1 bg-accent/50 blur-sm"
                  initial={{ top: 0 }}
                  animate={{ top: "100%" }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
