import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { ChevronRight } from "lucide-react";

const skillData = [
  { skill: "System Design", current: 65, target: 90 },
  { skill: "Cloud Infrastructure", current: 45, target: 85 },
  { skill: "Leadership", current: 55, target: 80 },
  { skill: "Distributed Systems", current: 40, target: 85 },
  { skill: "Performance Optimization", current: 70, target: 90 },
  { skill: "Technical Communication", current: 75, target: 90 },
];

const progressData = [
  { week: "Week 1", readiness: 67 },
  { week: "Week 2", readiness: 69 },
  { week: "Week 3", readiness: 72 },
  { week: "Week 4", readiness: 74 },
  { week: "Week 5", readiness: 77 },
  { week: "Week 6", readiness: 80 },
  { week: "Week 7", readiness: 82 },
  { week: "Week 8", readiness: 85 },
];

export default function Dashboard() {
  const navigate = useNavigate();

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
            Progress Tracking
          </div>
          <h1 className="text-foreground mb-6">Development Dashboard</h1>
          <p className="text-muted-foreground max-w-3xl" style={{ fontSize: '19px' }}>
            Track your skill development and readiness evolution
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Skill Heatmap */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <h3 className="text-foreground">Skill Assessment</h3>
            
            <div className="space-y-6">
              {skillData.map((item, index) => (
                <motion.div
                  key={item.skill}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-foreground font-medium">{item.skill}</span>
                    <span className="text-muted-foreground text-sm">
                      {item.current}% / {item.target}%
                    </span>
                  </div>
                  
                  <div className="relative h-12 glass-panel">
                    {/* Target line */}
                    <div
                      className="absolute top-0 bottom-0 w-px bg-accent/30"
                      style={{ left: `${item.target}%` }}
                    />
                    
                    {/* Current progress */}
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-accent/20 to-accent/40 rounded-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${item.current}%` }}
                      transition={{ duration: 1, delay: 0.4 + index * 0.1, ease: "easeOut" }}
                    />
                    
                    {/* Progress value */}
                    <div className="relative h-full flex items-center px-4">
                      <span className="text-foreground font-medium">{item.current}%</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Readiness Evolution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-6"
          >
            <h3 className="text-foreground">Readiness Evolution</h3>
            
            <div className="glass-panel p-8">
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={progressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis
                    dataKey="week"
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '14px' }}
                  />
                  <YAxis
                    stroke="rgba(255,255,255,0.5)"
                    style={{ fontSize: '14px' }}
                    domain={[60, 90]}
                  />
                  <Line
                    type="monotone"
                    dataKey="readiness"
                    stroke="#D97706"
                    strokeWidth={3}
                    dot={{ fill: '#D97706', r: 6 }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>

              <div className="mt-6 grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="font-bold text-foreground" style={{ fontSize: '22px' }}>67%</div>
                  <div className="text-sm text-muted-foreground mt-1">Starting</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-accent" style={{ fontSize: '22px' }}>85%</div>
                  <div className="text-sm text-muted-foreground mt-1">Current</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-foreground" style={{ fontSize: '22px' }}>95%</div>
                  <div className="text-sm text-muted-foreground mt-1">Target</div>
                </div>
              </div>
            </div>

            {/* Milestones */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="glass-panel p-6 space-y-4"
            >
              <h4 className="text-foreground font-medium">Recent Milestones</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Completed System Design certification</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Published 3 technical blog posts</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <div className="w-2 h-2 rounded-full bg-accent" />
                  <span>Led design review session</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={() => navigate("/certificate")}
            className="glass-panel px-12 py-6 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-4"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span className="font-medium" style={{ fontSize: '18px' }}>Generate Certificate</span>
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
