import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ArrowRight } from "lucide-react";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-5xl w-full">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="space-y-12"
        >
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="space-y-2"
          >
            <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium">
              Premium Career Diagnostic
            </div>
            <h1 className="text-foreground" style={{ fontSize: 'clamp(56px, 6vw, 72px)' }}>
              Skill Judge AI
            </h1>
          </motion.div>

          {/* Main headline */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="space-y-6"
          >
            <h2 className="text-foreground max-w-4xl" style={{ fontSize: 'clamp(32px, 3.5vw, 44px)', lineHeight: 1.35 }}>
              Your career will be judged.
            </h2>
            <p className="text-muted-foreground max-w-2xl leading-relaxed" style={{ fontSize: '19px' }}>
              An uncompromising evaluation of your resume against market standards. 
              Brutal analysis. Strategic guidance. Real results.
            </p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
          >
            <motion.button
              onClick={() => navigate("/upload")}
              className="glass-panel px-12 py-6 hover:bg-accent hover:text-accent-foreground 
                         transition-all duration-300 group inline-flex items-center gap-4"
              whileHover={{ scale: 1.02, y: -2 }}
              whileTap={{ scale: 0.98 }}
            >
              <span className="font-medium" style={{ fontSize: '18px' }}>Upload Resume</span>
              <ArrowRight className="w-6 h-6 transition-transform group-hover:translate-x-1" />
            </motion.button>
          </motion.div>

          {/* Disclaimer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pt-8 border-t border-border"
          >
            <p className="text-muted-foreground" style={{ fontSize: '16px' }}>
              Professional evaluation tool designed for serious career advancement. 
              This is not a friendly assistant—this is strategic analysis.
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
