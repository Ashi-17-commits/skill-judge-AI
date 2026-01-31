import { Navigate } from "react-router";
import { useAuth } from "@/app/components/AuthContext";
import Login from "@/app/components/screens/Login";

export function LoginRedirect() {
  const { isAuthenticated } = useAuth();

  // If user is already logged in, redirect to home
  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  // Otherwise show the login page
  return <Login />;
}
