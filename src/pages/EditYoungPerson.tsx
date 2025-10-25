import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ModuleHeader } from "@/components/ModuleHeader";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { NewYoungPersonWizard } from "@/components/young-people/NewYoungPersonWizard";
import { supabase } from "@/integrations/supabase/untypedClient";
import { LoadingScreen } from "@/components/LoadingScreen";

const EditYoungPerson = () => {
  const { id } = useParams<{ id: string }>();
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [youngPerson, setYoungPerson] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate("/auth");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (id && user) {
      loadYoungPerson();
    }
  }, [id, user]);

  const loadYoungPerson = async () => {
    try {
      const { data, error } = await supabase
        .from("young_people")
        .select("*")
        .eq("id", id)
        .eq("user_id", user?.id)
        .single();

      if (error) throw error;
      setYoungPerson(data);
    } catch (error) {
      console.error("Error loading young person:", error);
      navigate("/young-people");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) return <LoadingScreen />;
  if (!youngPerson) return null;

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
        <NewYoungPersonWizard existingData={youngPerson} editMode={true} />
      </div>
    </div>
  );
};

export default EditYoungPerson;
