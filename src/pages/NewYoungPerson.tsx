import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/ModuleHeader";
import { NewYoungPersonWizard } from "@/components/young-people/NewYoungPersonWizard";

const NewYoungPerson = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">New Young Person Profile</h1>
            <p className="text-muted-foreground">Complete all sections to create a comprehensive profile</p>
          </div>
          <NewYoungPersonWizard />
        </div>
      </div>
    </div>
  );
};

export default NewYoungPerson;
