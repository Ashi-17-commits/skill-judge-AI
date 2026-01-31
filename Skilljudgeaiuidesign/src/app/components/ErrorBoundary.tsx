import { useRouteError, isRouteErrorResponse } from "react-router";
import { Button } from "@/app/components/ui/button";

export function ErrorBoundary() {
  const error = useRouteError();

  // Check if it's a route error response
  if (isRouteErrorResponse(error)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
        <div className="text-center">
          <h1 className="text-6xl font-bold text-red-500 mb-4">{error.status}</h1>
          <h2 className="text-2xl font-semibold text-white mb-2">{error.statusText || "Error"}</h2>
          {error.data?.message && (
            <p className="text-gray-400 mb-8">{error.data.message}</p>
          )}
          <Button
            onClick={() => window.location.href = "/"}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Go Home
          </Button>
        </div>
      </div>
    );
  }

  // Handle generic errors
  const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-red-500 mb-4">Oops!</h1>
        <p className="text-gray-400 mb-8">{errorMessage}</p>
        <Button
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 px-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-red-500 mb-4">404</h1>
        <h2 className="text-2xl font-semibold text-white mb-2">Page Not Found</h2>
        <p className="text-gray-400 mb-8">The page you're looking for doesn't exist.</p>
        <Button
          onClick={() => window.location.href = "/"}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Go Home
        </Button>
      </div>
    </div>
  );
}
