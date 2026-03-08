import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import focusLogo from "@/assets/focus-logo.jpg";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background flex flex-col">
      {/* Minimal Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm">
        <div className="container flex h-16 items-center px-4 max-w-full">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
            <img src={focusLogo} alt="FOCUS Logo" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="text-base font-bold">FOCUS</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">NextGen Care Support</p>
            </div>
          </div>
        </div>
      </header>

      {/* 404 Content */}
      <main className="flex-1 flex items-center justify-center px-4">
        <div className="text-center max-w-md mx-auto">
          {/* Large 404 */}
          <div className="relative mb-6">
            <span className="text-[10rem] md:text-[12rem] font-black leading-none text-primary/10 select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <Search className="h-16 w-16 md:h-20 md:w-20 text-primary/40" />
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold mb-3">Page Not Found</h2>
          <p className="text-muted-foreground mb-2">
            The page <code className="bg-muted px-2 py-0.5 rounded text-sm font-mono">{location.pathname}</code> doesn't exist.
          </p>
          <p className="text-sm text-muted-foreground mb-8">
            It may have been moved, deleted, or you may have mistyped the URL.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={() => navigate(-1)} variant="outline" className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Go Back
            </Button>
            <Button onClick={() => navigate("/dashboard")} className="gap-2">
              <Home className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-muted-foreground border-t">
        FOCUS NextGen Care Support Platform
      </footer>
    </div>
  );
};

export default NotFound;
