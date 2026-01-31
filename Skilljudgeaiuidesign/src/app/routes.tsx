import { createBrowserRouter, Navigate } from "react-router";
import Layout from "@/app/components/Layout";
import Landing from "@/app/components/screens/Landing";
import Upload from "@/app/components/screens/Upload";
import ATSScore from "@/app/components/screens/ATSScore";
import RoleSelection from "@/app/components/screens/RoleSelection";
import RoleReadiness from "@/app/components/screens/RoleReadiness";
import Roadmap from "@/app/components/screens/Roadmap";
import Dashboard from "@/app/components/screens/Dashboard";
import Certificate from "@/app/components/screens/Certificate";
import { ProtectedRoute } from "@/app/components/ProtectedRoute";
import { LoginRedirect } from "@/app/components/LoginRedirect";
import { ErrorBoundary, NotFound } from "@/app/components/ErrorBoundary";
import { useAuth } from "@/app/components/AuthContext";

// Component to handle root redirect based on auth status
function RootRedirect() {
  const { isAuthenticated } = useAuth();
  return <Navigate to={isAuthenticated ? "/home" : "/login"} replace />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        path: "/",
        Component: RootRedirect,
      },
      {
        path: "/login",
        Component: LoginRedirect,
      },
      {
        element: <ProtectedRoute />,
        children: [
          {
            path: "/home",
            Component: Landing,
          },
          {
            path: "/upload",
            Component: Upload,
          },
          {
            path: "/ats-score",
            Component: ATSScore,
          },
          {
            path: "/role-selection",
            Component: RoleSelection,
          },
          {
            path: "/role-readiness",
            Component: RoleReadiness,
          },
          {
            path: "/roadmap",
            Component: Roadmap,
          },
          {
            path: "/dashboard",
            Component: Dashboard,
          },
          {
            path: "/certificate",
            Component: Certificate,
          },
        ],
      },
      {
        path: "*",
        Component: NotFound,
      },
    ],
  },
]);