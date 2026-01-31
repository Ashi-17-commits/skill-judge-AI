import { useState } from "react";
import { useNavigate } from "react-router";
import { motion } from "motion/react";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { ArrowRight } from "lucide-react";
import { useAuth } from "@/app/components/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - set authentication and navigate to home
    login();
    navigate("/home");
  };

  const handleGoogleLogin = () => {
    // Mock Google login
    login();
    navigate("/home");
  };

  const handleCreateAccount = () => {
    // Mock account creation
    login();
    navigate("/home");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-8 py-16">
      <ThemeToggle />
      
      <div className="max-w-md w-full">
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
            className="space-y-3 text-center"
          >
            <div className="text-muted-foreground uppercase tracking-wider text-sm font-medium">
              Premium Career Diagnostic
            </div>
            <h1 
              className="text-foreground" 
              style={{ fontSize: 'clamp(40px, 5vw, 52px)', lineHeight: 1.2 }}
            >
              Skill Judge AI
            </h1>
            <p 
              className="text-muted-foreground" 
              style={{ fontSize: '17px' }}
            >
              Log in to access your career evaluation
            </p>
          </motion.div>

          {/* Login Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="glass-panel p-10"
          >
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Email Field */}
              <div className="space-y-3">
                <label 
                  htmlFor="email" 
                  className="block text-foreground font-medium"
                  style={{ fontSize: '16px' }}
                >
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full px-5 py-4 glass-panel border-border hover:border-accent 
                             focus:border-accent focus:ring-2 focus:ring-accent/20 
                             transition-all duration-300 text-foreground"
                  style={{ fontSize: '17px' }}
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-3">
                <label 
                  htmlFor="password" 
                  className="block text-foreground font-medium"
                  style={{ fontSize: '16px' }}
                >
                  Password
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-5 py-4 glass-panel border-border hover:border-accent 
                             focus:border-accent focus:ring-2 focus:ring-accent/20 
                             transition-all duration-300 text-foreground"
                  style={{ fontSize: '17px' }}
                  placeholder="••••••••"
                />
              </div>

              {/* Submit Button */}
              <motion.button
                type="submit"
                className="w-full glass-panel px-8 py-5 hover:bg-accent hover:text-accent-foreground 
                           transition-all duration-300 group inline-flex items-center justify-center gap-3"
                whileHover={{ scale: 1.01, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                <span className="font-medium" style={{ fontSize: '18px' }}>Log in</span>
                <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
              </motion.button>
            </form>
          </motion.div>

          {/* Alternative Actions */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.6 }}
            className="space-y-6"
          >
            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center">
                <span 
                  className="px-4 bg-background text-muted-foreground"
                  style={{ fontSize: '14px' }}
                >
                  or
                </span>
              </div>
            </div>

            {/* Google Login */}
            <button
              onClick={handleGoogleLogin}
              className="w-full glass-panel px-6 py-4 hover:bg-accent/5 
                         transition-all duration-300 text-center"
            >
              <span 
                className="text-muted-foreground font-medium"
                style={{ fontSize: '16px' }}
              >
                Continue with Google
              </span>
            </button>

            {/* Create Account Link */}
            <div className="text-center pt-4">
              <p className="text-muted-foreground" style={{ fontSize: '15px' }}>
                Don't have an account?{" "}
                <button
                  onClick={handleCreateAccount}
                  className="text-accent hover:underline font-medium"
                >
                  Create account
                </button>
              </p>
            </div>
          </motion.div>

          {/* Footer Note */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.6 }}
            className="pt-8 border-t border-border text-center"
          >
            <p 
              className="text-muted-foreground"
              style={{ fontSize: '14px' }}
            >
              Secure authentication for professional career diagnostics
            </p>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}