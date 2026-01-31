import { useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Check, ChevronRight } from "lucide-react";

const roles = [
  {
    title: "Software Engineer",
    level: "Early Career",
    category: "Engineering",
    description: "Foundational full-stack development and core programming"
  },
  {
    title: "Product Manager",
    level: "Early Career",
    category: "Product",
    description: "Product fundamentals and early-stage feature ownership"
  },
  {
    title: "Data Scientist",
    level: "Early Career",
    category: "Data & Analytics",
    description: "Entry-level data analysis and machine learning concepts"
  },
  {
    title: "UX Designer",
    level: "Early Career",
    category: "Design",
    description: "User research fundamentals and design thinking"
  },
  {
    title: "Engineering Manager",
    level: "Early Career",
    category: "Engineering Leadership",
    description: "Team collaboration and foundational leadership skills"
  },
  {
    title: "DevOps Engineer",
    level: "Early Career",
    category: "Infrastructure",
    description: "CI/CD basics and cloud infrastructure fundamentals"
  },
];

export default function RoleSelection() {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

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
            Step 2 of 4
          </div>
          <h1 className="text-foreground mb-6" style={{ fontSize: 'clamp(40px, 4.5vw, 56px)', lineHeight: 1.3 }}>
            Select the role you want Skill Judge AI to evaluate
          </h1>
          <p className="text-muted-foreground max-w-3xl" style={{ fontSize: '19px' }}>
            Choose the position you're targeting. We'll assess your readiness and identify critical gaps.
          </p>
        </motion.div>

        {/* Role Grid */}
        <div className="space-y-4">
          {roles.map((role, index) => (
            <motion.button
              key={role.title}
              onClick={() => setSelectedRole(role.title)}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index, duration: 0.5 }}
              className={`w-full glass-panel p-8 text-left transition-all duration-300 
                         hover:bg-accent/10 ${
                selectedRole === role.title 
                  ? "ring-2 ring-accent bg-accent/5" 
                  : ""
              }`}
              whileHover={{ scale: 1.01, x: 4 }}
              whileTap={{ scale: 0.99 }}
            >
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-4">
                    <h3 className="text-foreground">{role.title}</h3>
                    <span className="px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm">
                      {role.level}
                    </span>
                  </div>
                  <div className="text-muted-foreground uppercase tracking-wider text-sm">
                    {role.category}
                  </div>
                  <p className="text-muted-foreground" style={{ fontSize: '17px' }}>
                    {role.description}
                  </p>
                </div>
                
                <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center
                               transition-colors ${
                  selectedRole === role.title
                    ? "border-accent bg-accent"
                    : "border-border"
                }`}>
                  {selectedRole === role.title && (
                    <Check className="w-5 h-5 text-accent-foreground" />
                  )}
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: selectedRole ? 1 : 0.5 }}
          className="flex justify-end"
        >
          <motion.button
            onClick={() => selectedRole && navigate("/role-readiness", { state: { role: selectedRole, resume_id: (location.state as any)?.resume_id } })}
            disabled={!selectedRole}
            className="glass-panel px-12 py-6 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-4
                       disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-transparent
                       disabled:hover:text-foreground"
            whileHover={selectedRole ? { scale: 1.02 } : {}}
            whileTap={selectedRole ? { scale: 0.98 } : {}}
          >
            <span className="font-medium" style={{ fontSize: '18px' }}>Evaluate Readiness</span>
            <ChevronRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
