import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import focusLogo from "@/assets/focus-logo.jpg";

interface ModuleHeaderProps {
  backTo?: string;
}

export const ModuleHeader = ({ backTo = "/dashboard" }: ModuleHeaderProps) => {
  const navigate = useNavigate();
  const { signOut } = useAuth();

  return (
    <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-10">
      <div className="container flex h-16 items-center justify-between px-4 max-w-full">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(backTo)}
          className="gap-1 md:gap-2 text-xs md:text-sm"
        >
          <ArrowLeft className="h-3 w-3 md:h-4 md:w-4" />
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Back</span>
        </Button>
        
        <div className="flex items-center gap-2 md:gap-3">
          <img 
            src={focusLogo} 
            alt="FOCUS Logo" 
            className="h-8 w-8 md:h-10 md:w-10 object-contain"
          />
          <Button variant="outline" size="sm" onClick={signOut} className="text-xs md:text-sm">
            <LogOut className="h-3 w-3 md:h-4 md:w-4 md:mr-2" />
            <span className="hidden sm:inline">Sign Out</span>
          </Button>
        </div>
      </div>
    </header>
  );
};