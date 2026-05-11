import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, User, Calendar } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { ModuleHeader } from "@/components/ModuleHeader";
import { YoungPerson } from "@/lib/types";

export default function YoungPeople() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [youngPeople, setYoungPeople] = useState<YoungPerson[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      navigate("/auth");
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (user) {
      fetchYoungPeople();
    }
  }, [user]);

  const fetchYoungPeople = async () => {
    setLoadingData(true);
    const { data, error } = await supabase
      .from("young_people")
      .select("*")
      .order("last_name", { ascending: true });
    
    if (!error && data) {
      setYoungPeople(data);
    }
    setLoadingData(false);
  };

  if (loading || loadingData) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-accent/5 to-background">
      <ModuleHeader />
      <div className="container py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Young People</h1>
            <p className="text-muted-foreground">Manage your caseload</p>
          </div>
          <Button onClick={() => navigate("/young-people/new")}>
            <Plus className="h-4 w-4 mr-2" />
            Add Young Person
          </Button>
        </div>

        {youngPeople.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent className="pt-6">
              <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No young people yet</h3>
              <p className="text-muted-foreground mb-4">
                Get started by adding your first young person to the system
              </p>
              <Button onClick={() => navigate("/young-people/new")}>
                <Plus className="h-4 w-4 mr-2" />
                Add Young Person
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {youngPeople.map((person) => (
              <Card
                key={person.id}
                className="cursor-pointer transition-all hover:shadow-lg hover:-translate-y-1"
                onClick={() => navigate(`/young-people/${person.id}`)}
              >
                <CardHeader>
                  <div className="flex items-start gap-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-foreground font-semibold text-xl">
                      {person.first_name[0]}{person.last_name[0]}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {person.first_name} {person.last_name}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(person.date_of_birth), "PP")}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                {person.placement_info && (
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {person.placement_info}
                    </p>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}