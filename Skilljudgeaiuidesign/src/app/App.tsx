import { RouterProvider } from "react-router";
import { router } from "./routes";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { AuthProvider } from "@/app/components/AuthContext";
import { Toaster } from "@/app/components/ui/sonner";

export default function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}