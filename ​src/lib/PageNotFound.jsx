import { useLocation } from "react-router-dom";
import { apiClient } from "@/api/client";
import { useQuery } from "@tanstack/react-query";

export default function PageNotFound() {
  const location = useLocation();
  const pageName = location.pathname.substring(1);

  const { data: authData, isFetched } = useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      try {
        const user = await apiClient.auth.me();
        return { user, isAuthenticated: Boolean(user) };
      } catch {
        return { user: null, isAuthenticated: false };
      }
    },
  });

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-background">
      <div className="max-w-md w-full">
        <div className="text-center space-y-6">
          <div className="space-y-2">
            <h1 className="text-7xl font-light text-muted-foreground/40">404</h1>
            <div className="h-0.5 w-16 bg-border mx-auto" />
          </div>

          <div className="space-y-3">
            <h2 className="text-2xl font-medium text-foreground">
              Page Not Found
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              The page{" "}
              <span className="font-medium text-foreground">"{pageName}"</span>{" "}
              could not be found in this application.
            </p>
          </div>

          {isFetched &&
            authData?.isAuthenticated &&
            authData.user?.role === "admin" && (
              <div className="mt-8 p-4 bg-secondary rounded-lg border border-border text-left space-y-1">
                <p className="text-sm font-medium text-foreground">Admin Note</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  This route has not been added yet.
                </p>
              </div>
            )}

          <div className="pt-6">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/";
              }}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-secondary transition-colors duration-200"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
