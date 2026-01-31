import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ChevronRight, Info } from "lucide-react";

interface ScoreCategory {
  name: string;
  score: number;
  total: number;
  reason?: string;
}

const defaultScoreCategories: ScoreCategory[] = [
  { name: "Format & Structure", score: 85, total: 100 },
  { name: "Keyword Optimization", score: 72, total: 100 },
  { name: "Experience Clarity", score: 91, total: 100 },
  { name: "Skills Presentation", score: 78, total: 100 },
  { name: "Achievement Metrics", score: 68, total: 100 },
];

export default function ATSScore() {
  const navigate = useNavigate();
  const location = useLocation();
  const [displayScore, setDisplayScore] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [scoreCategories, setScoreCategories] = useState<ScoreCategory[]>(defaultScoreCategories);
  const [finalScore, setFinalScore] = useState(79);

  useEffect(() => {
    // Get data from navigation state if available
    const state = location.state as any;
    if (state?.data) {
      console.log("ATS Score data received:", state.data);
      
      // Map backend response to score categories
      if (state.data.score_breakdown && Array.isArray(state.data.score_breakdown)) {
        const mappedCategories: ScoreCategory[] = state.data.score_breakdown.map(
          (item: any) => ({
            name: item.label,
            score: item.score,
            total: 100,
            reason: item.reason,
          })
        );
        setScoreCategories(mappedCategories);
        console.log("Score categories mapped:", mappedCategories);
      }
      
      if (state.data.overall_score !== undefined) {
        setFinalScore(state.data.overall_score);
      }
    }
  }, [location.state]);

  useEffect(() => {
    let start = 0;
    const duration = 2000;
    const increment = finalScore / (duration / 16);
    
    const timer = setInterval(() => {
      start += increment;
      if (start >= finalScore) {
        setDisplayScore(finalScore);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.floor(start));
      }
    }, 16);

    return () => clearInterval(timer);
  }, [finalScore]);

  const getCategoryExplanation = (name: string) => {
    const category = scoreCategories.find(cat => cat.name === name);
    if (category?.reason) {
      return category.reason;
    }
    
    // Fallback to default explanations if no reason from backend
    const explanations: Record<string, string> = {
      "Format & Structure": "Your resume follows ATS-compatible formatting with clear sections and consistent styling. Minor improvements needed in heading hierarchy.",
      "Keyword Optimization": "Moderate keyword density. Consider incorporating more industry-specific terms and action verbs from target job descriptions.",
      "Experience Clarity": "Strong clarity in describing roles and responsibilities. Chronology is logical and easy to parse.",
      "Skills Presentation": "Skills are listed but lack context. Consider demonstrating proficiency levels and real-world applications.",
      "Achievement Metrics": "Limited quantification of accomplishments. Add specific numbers, percentages, and measurable outcomes."
    };
    return explanations[name] || "";
  };

  return (
    <div className="min-h-screen px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium mb-4">
            Diagnostic Results
          </div>
          <h1 className="text-foreground">ATS Score</h1>
          <p className="text-muted-foreground mt-4 max-w-3xl" style={{ fontSize: '19px' }}>
            Your resume's compatibility with Applicant Tracking Systems
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Giant Score */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="glass-panel p-16 text-center space-y-6"
          >
            <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium">
              Overall Score
            </div>
            <motion.div
              className="leading-none font-bold text-foreground"
              style={{ fontSize: '96px' }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {displayScore}
            </motion.div>
            <div className="text-muted-foreground" style={{ fontSize: '20px' }}>
              out of 100
            </div>
            <div className="pt-6 border-t border-border">
              <div className="text-accent font-medium" style={{ fontSize: '18px' }}>
                Moderate Performance
              </div>
              <p className="text-muted-foreground mt-2" style={{ fontSize: '16px' }}>
                Your resume will pass most ATS scans but has room for optimization
              </p>
            </div>
          </motion.div>

          {/* Category Breakdown */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="space-y-4"
          >
            <h3 className="mb-8">Score Breakdown</h3>
            
            {scoreCategories.map((category, index) => (
              <motion.button
                key={category.name}
                onClick={() => setSelectedCategory(
                  selectedCategory === category.name ? null : category.name
                )}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
                className="w-full text-left glass-panel p-6 hover:bg-accent/10 
                           transition-all duration-300 space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-medium" style={{ fontSize: '17px' }}>{category.name}</span>
                      <Info className="w-4 h-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-accent rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${(category.score / category.total) * 100}%` }}
                          transition={{ duration: 1, delay: 0.6 + index * 0.1 }}
                        />
                      </div>
                      <span className="font-bold min-w-[3ch]" style={{ fontSize: '17px' }}>
                        {category.score}
                      </span>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 ml-4 transition-transform ${
                      selectedCategory === category.name ? "rotate-90" : ""
                    }`}
                  />
                </div>

                {selectedCategory === category.name && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="pt-4 border-t border-border text-muted-foreground"
                    style={{ fontSize: '16px' }}
                  >
                    {getCategoryExplanation(category.name)}
                  </motion.div>
                )}
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={() => navigate("/role-selection", { state: { resume_id: (location.state as any)?.data?.resume_id } })}
            className="glass-panel px-12 py-6 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium" style={{ fontSize: '18px' }}>Select Target Role</span>
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
