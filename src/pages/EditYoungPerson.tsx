import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

const EditYoungPerson = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    // Edit functionality to be implemented in Phase 3
    toast.info("Edit functionality will be available soon. Please create a new profile for now.");
    navigate(`/young-people/${id}`);
  }, [id, navigate]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <Button
          variant="ghost"
          onClick={() => navigate(`/young-people/${id}`)}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Profile
        </Button>
        <div className="max-w-5xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Edit Young Person Profile</h1>
            <p className="text-muted-foreground">This feature will be available in Phase 3</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditYoungPerson;
