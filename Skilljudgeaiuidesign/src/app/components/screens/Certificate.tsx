import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { Download, Share2 } from "lucide-react";

export default function Certificate() {
  const recipientName = "Alex Morgan";
  const roleAchieved = "Senior Software Engineer";
  const completionDate = "January 27, 2026";
  const certificateId = "SKJ-2026-001847";

  return (
    <div className="min-h-screen px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-6xl mx-auto space-y-16">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-4"
        >
          <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium">
            Completion Recognition
          </div>
          <h1 className="text-foreground">Certificate of Achievement</h1>
        </motion.div>

        {/* Certificate */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="glass-panel-strong p-20 space-y-16 border-2"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-center"
          >
            <div className="inline-flex items-center justify-center w-32 h-32 rounded-full 
                          border-4 border-accent bg-accent/10 mb-6">
              <span className="text-5xl font-bold text-accent">✓</span>
            </div>
            <div className="text-accent uppercase tracking-wider text-sm font-medium">
              Skill Judge AI
            </div>
          </motion.div>

          {/* Title */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="text-center space-y-6"
          >
            <h2 className="text-foreground">
              Certificate of Completion
            </h2>
            <p className="text-muted-foreground max-w-3xl mx-auto" style={{ fontSize: '19px' }}>
              This certifies that
            </p>
          </motion.div>

          {/* Recipient */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="text-center space-y-8"
          >
            <div className="inline-block border-b-2 border-accent pb-4 px-8">
              <h1 className="text-foreground">{recipientName}</h1>
            </div>
            
            <div className="space-y-4">
              <p className="text-muted-foreground" style={{ fontSize: '19px' }}>
                has successfully completed the comprehensive skill development program for
              </p>
              <h3 className="text-foreground">{roleAchieved}</h3>
              <p className="text-muted-foreground" style={{ fontSize: '19px' }}>
                achieving 95% role readiness through strategic skill acquisition and portfolio development
              </p>
            </div>
          </motion.div>

          {/* Details */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="flex justify-between items-end pt-8 border-t border-border"
          >
            <div>
              <div className="text-sm text-muted-foreground mb-1">Completion Date</div>
              <div className="text-foreground font-medium">{completionDate}</div>
            </div>
            
            <div className="text-center">
              <div className="font-bold text-accent mb-2" style={{ fontSize: '28px' }}>95%</div>
              <div className="text-sm text-muted-foreground">Final Readiness</div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Certificate ID</div>
              <div className="text-foreground font-medium font-mono text-sm">{certificateId}</div>
            </div>
          </motion.div>

          {/* Signature */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2 }}
            className="text-center pt-8"
          >
            <div className="inline-block">
              <div className="font-serif italic text-foreground mb-2" style={{ fontSize: '22px' }}>Skill Judge AI</div>
              <div className="h-px bg-border w-64 mx-auto" />
              <div className="text-sm text-muted-foreground mt-2">Authorized Evaluator</div>
            </div>
          </motion.div>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.4 }}
          className="flex justify-center gap-6"
        >
          <motion.button
            className="glass-panel px-10 py-5 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-3"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Download className="w-5 h-5" />
            <span className="text-lg font-medium">Download PDF</span>
          </motion.button>

          <motion.button
            className="glass-panel px-10 py-5 hover:bg-accent hover:text-accent-foreground 
                       transition-all duration-300 group inline-flex items-center gap-3"
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <Share2 className="w-5 h-5" />
            <span className="text-lg font-medium">Share on LinkedIn</span>
          </motion.button>
        </motion.div>

        {/* Celebration */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.6, duration: 0.8 }}
          className="text-center py-16 space-y-6"
        >
          <h2 className="text-foreground">
            Congratulations
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto" style={{ fontSize: '19px' }}>
            You have successfully transformed your professional profile through strategic skill development. 
            Your career trajectory has been judged—and elevated.
          </p>
        </motion.div>
      </div>
    </div>
  );
}
