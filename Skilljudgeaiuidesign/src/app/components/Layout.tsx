import { Outlet, useLocation, useNavigate } from "react-router";
import { Button } from "@/app/components/ui/button";
import { ArrowLeft, Home, LogOut } from "lucide-react";
import { motion } from "motion/react";
import { useAuth } from "@/app/components/AuthContext";

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const isHome = location.pathname === "/" || location.pathname === "/home";
  const isLogin = location.pathname === "/login";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <>
      {!isHome && !isLogin && isAuthenticated && (
        <motion.div 
          className="fixed top-8 left-8 z-50 flex items-center gap-3"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="w-12 h-12 rounded-full glass-panel border border-border/50 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300"
            title="Go Back"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/home")}
            className="w-12 h-12 rounded-full glass-panel border border-border/50 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300"
            title="Return to Home"
          >
            <Home className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
      
      {isAuthenticated && !isLogin && (
        <motion.div 
          className="fixed top-8 right-8 z-50"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLogout}
            className="w-12 h-12 rounded-full glass-panel border border-border/50 hover:border-accent hover:text-accent hover:bg-accent/5 transition-all duration-300"
            title="Log Out"
          >
            <LogOut className="w-5 h-5" />
          </Button>
        </motion.div>
      )}
      
      <Outlet />
    </>
  );
}