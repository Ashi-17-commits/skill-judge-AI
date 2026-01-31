import { useState } from "react";
import { useNavigate } from "react-router";
import { motion, AnimatePresence } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ChevronRight, ChevronDown } from "lucide-react";

const roadmap = [
  {
    phase: "Phase 1",
    title: "Foundation (Weeks 1-4)",
    focus: "Core competency development",
    weeks: [
      {
        week: "Week 1-2",
        tasks: [
          "Complete System Design fundamentals course",
          "Build and document a distributed cache system",
          "Review 5 major system design case studies"
        ]
      },
      {
        week: "Week 3-4",
        tasks: [
          "Implement load balancer from scratch",
          "Write technical blog post on architecture decisions",
          "Participate in 2 design review sessions"
        ]
      }
    ]
  },
  {
    phase: "Phase 2",
    title: "Application (Weeks 5-8)",
    focus: "Practical implementation and leadership",
    weeks: [
      {
        week: "Week 5-6",
        tasks: [
          "Lead technical design for current project",
          "Obtain AWS Solutions Architect certification",
          "Mentor junior developer on system design"
        ]
      },
      {
        week: "Week 7-8",
        tasks: [
          "Contribute to open-source distributed system",
          "Present tech talk on scalability patterns",
          "Complete mock system design interviews (3x)"
        ]
      }
    ]
  },
  {
    phase: "Phase 3",
    title: "Mastery (Weeks 9-12)",
    focus: "Portfolio building and positioning",
    weeks: [
      {
        week: "Week 9-10",
        tasks: [
          "Build production-ready microservices portfolio project",
          "Document architecture decisions and trade-offs",
          "Create case study of scalability optimization"
        ]
      },
      {
        week: "Week 11-12",
        tasks: [
          "Conduct technical interviews (practice)",
          "Update resume with quantified achievements",
          "Network with engineers in target companies"
        ]
      }
    ]
  }
];

export default function Roadmap() {
  const navigate = useNavigate();
  const [expandedPhase, setExpandedPhase] = useState<string | null>(roadmap[0].phase);

  return (
    <div className="min-h-screen px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-5xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium mb-4">
            Development Plan
          </div>
          <h1 className="text-foreground mb-6">90-Day Strategic Roadmap</h1>
          <p className="text-muted-foreground max-w-3xl" style={{ fontSize: '19px' }}>
            Structured plan to close skill gaps and achieve role readiness
          </p>
        </motion.div>

        {/* Timeline */}
        <div className="space-y-6">
          {roadmap.map((phase, index) => (
            <motion.div
              key={phase.phase}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className="glass-panel overflow-hidden"
            >
              {/* Phase Header */}
              <button
                onClick={() => setExpandedPhase(
                  expandedPhase === phase.phase ? null : phase.phase
                )}
                className="w-full p-8 text-left hover:bg-accent/10 transition-colors"
              >
                <div className="flex items-start justify-between gap-6">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-center gap-4">
                      <span className="text-accent font-medium uppercase tracking-wider text-sm">
                        {phase.phase}
                      </span>
                      <div className="h-px flex-1 bg-border max-w-xs" />
                    </div>
                    <h3 className="text-foreground">{phase.title}</h3>
                    <p className="text-muted-foreground" style={{ fontSize: '17px' }}>{phase.focus}</p>
                  </div>
                  <ChevronDown
                    className={`w-6 h-6 transition-transform flex-shrink-0 mt-2 ${
                      expandedPhase === phase.phase ? "rotate-180" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Phase Content */}
              <AnimatePresence>
                {expandedPhase === phase.phase && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="border-t border-border"
                  >
                    <div className="p-8 pt-6 space-y-8">
                      {phase.weeks.map((weekData, weekIndex) => (
                        <motion.div
                          key={weekData.week}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: weekIndex * 0.1 }}
                          className="space-y-4"
                        >
                          <h4 className="text-muted-foreground font-medium">
                            {weekData.week}
                          </h4>
                          <div className="space-y-2 ml-4">
                            {weekData.tasks.map((task, taskIndex) => (
                              <motion.div
                                key={taskIndex}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: weekIndex * 0.1 + taskIndex * 0.05 }}
                                className="flex items-start gap-3"
                              >
                                <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-2" />
                                <span className="text-foreground" style={{ fontSize: '17px' }}>{task}</span>
                              </motion.div>
                            ))}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={() => navigate("/dashboard")}
            className="glass-panel px-12 py-6 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium" style={{ fontSize: '18px' }}>View Progress Dashboard</span>
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
