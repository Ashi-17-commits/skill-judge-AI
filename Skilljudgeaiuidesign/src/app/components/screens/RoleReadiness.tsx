import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ChevronRight, AlertCircle, CheckCircle2, XCircle } from "lucide-react";
import { analyzeRole } from "@/api/api";

// Dynamic data will be fetched from backend

export default function RoleReadiness() {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayPercentage, setDisplayPercentage] = useState(0);
  const [targetPercentage, setTargetPercentage] = useState(0);
  const [targetRole, setTargetRole] = useState<string>("");
  const [verdict, setVerdict] = useState<string>("");
  const [strengths, setStrengths] = useState<string[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);
  const [nonNegotiable, setNonNegotiable] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const role = (location.state as any)?.role;
  const resume_id = (location.state as any)?.resume_id;

  useEffect(() => {
    if (!role || !resume_id) {
      console.warn("Missing role or resume_id. Role:", role, "Resume ID:", resume_id);
      setLoading(false);
      return;
    }

    const fetchRoleAnalysis = async () => {
      setLoading(true);
      setError(null);
      setTargetPercentage(0);
      setDisplayPercentage(0);
      setTargetRole("");
      setVerdict("");
      setStrengths([]);
      setGaps([]);
      setNonNegotiable([]);

      try {
        console.log("[RoleReadiness] User selected role:", role, "resume_id:", resume_id);
        const data = await analyzeRole(resume_id, role);
        console.log("[RoleReadiness] Full API response:", JSON.stringify(data));
        if (data == null || typeof data !== "object") {
          setError("Invalid response from server");
          return;
        }
        const targetRoleFromApi = data.target_role;
        const readinessFromApi = data.readiness_score;
        const strengthsFromApi = Array.isArray(data.strengths) ? data.strengths : [];
        const gapsFromApi = Array.isArray(data.gaps) ? data.gaps : [];
        const nonNegotiableFromApi = Array.isArray(data.non_negotiable) ? data.non_negotiable : [];
        const verdictFromApi = data.verdict ?? "";
        console.log("[RoleReadiness] Values used to render: target_role=", targetRoleFromApi, "readiness_score=", readinessFromApi, "strengths.length=", strengthsFromApi.length, "gaps.length=", gapsFromApi.length, "non_negotiable.length=", nonNegotiableFromApi.length);
        setTargetRole(targetRoleFromApi ?? role);
        setTargetPercentage(readinessFromApi ?? 0);
        setStrengths(strengthsFromApi);
        setGaps(gapsFromApi);
        setNonNegotiable(nonNegotiableFromApi);
        setVerdict(verdictFromApi);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Failed to load role analysis";
        console.error("[RoleReadiness] Role analysis error:", errorMessage);
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchRoleAnalysis();
  }, [role, resume_id]);

  useEffect(() => {
    let start = 0;
    const duration = 1200;
    const increment = (targetPercentage || 0) / (duration / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= (targetPercentage || 0)) {
        setDisplayPercentage(targetPercentage || 0);
        clearInterval(timer);
      } else {
        setDisplayPercentage(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [targetPercentage]);

  const circumference = 2 * Math.PI * 120;
  const strokeDashoffset = circumference - (displayPercentage / 100) * circumference;

  return (
    <div className="min-h-screen px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Error Display */}
        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">Error loading analysis</p>
              <p className="text-sm opacity-90">{error}</p>
            </div>
          </div>
        )}

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium mb-4">
            Role Evaluation
          </div>
          <h1 className="text-foreground mb-6">{targetRole || (loading ? "Loading…" : "Role Evaluation")}</h1>
          <p className="text-muted-foreground max-w-3xl" style={{ fontSize: '19px' }}>
            Comprehensive readiness assessment for your target position
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Readiness Meter */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-16 flex flex-col items-center justify-center space-y-8"
          >
            <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium">
              Readiness Score
            </div>
            
            {/* Circular Progress */}
            <div className="relative">
              <svg width="280" height="280" className="transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  className="text-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="140"
                  cy="140"
                  r="120"
                  stroke="currentColor"
                  strokeWidth="16"
                  fill="none"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  className="text-accent transition-all duration-1000 ease-out"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="leading-none font-bold text-foreground" style={{ fontSize: '88px' }}>
                    {displayPercentage}
                  </div>
                  <div className="text-muted-foreground mt-2" style={{ fontSize: '20px' }}>%</div>
                </div>
              </div>
            </div>

            <div className="text-center">
              <div className="text-accent font-medium mb-2" style={{ fontSize: '18px' }}>
                {verdict || (loading ? "…" : "—")}
              </div>
              <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
                Strategic development required to reach full qualification
              </p>
            </div>
          </motion.div>

          {/* Analysis Sections */}
          <div className="space-y-8">
            {/* Strengths */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="space-y-4"
            >
              <h3 className="text-foreground">Strengths</h3>
              <div className="space-y-3">
                {strengths.map((strength, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                    className="flex items-start gap-3 text-muted-foreground"
                    style={{ fontSize: '17px' }}
                  >
                    <CheckCircle2 className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <span>{strength}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Skill Gaps */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
              className="space-y-4"
            >
              <h3 className="text-foreground">Skill Gaps</h3>
              <div className="space-y-3">
                {gaps.map((gap, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.9 + index * 0.1 }}
                    className="flex items-start gap-3 text-muted-foreground"
                    style={{ fontSize: '17px' }}
                  >
                    <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-1" />
                    <span>{gap}</span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Non-Negotiables */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.2 }}
              className="space-y-4"
            >
              <h3 className="text-foreground">Non-Negotiable Skills</h3>
              <div className="space-y-3">
                {nonNegotiable.map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 1.3 + index * 0.1 }}
                    className="glass-panel p-4"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      {item.status === "critical" && (
                        <XCircle className="w-5 h-5 text-destructive" />
                      )}
                      {item.status === "warning" && (
                        <AlertCircle className="w-5 h-5 text-accent" />
                      )}
                      {item.status === "good" && (
                        <CheckCircle2 className="w-5 h-5 text-accent" />
                      )}
                      <span className="font-medium text-foreground">{item.skill}</span>
                    </div>
                    <p className="text-muted-foreground text-sm ml-8">{item.reason}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.6 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={() => navigate("/roadmap")}
            className="glass-panel px-12 py-6 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium" style={{ fontSize: '18px' }}>View 90-Day Roadmap</span>
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
