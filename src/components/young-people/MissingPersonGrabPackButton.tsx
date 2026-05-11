import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { downloadMissingPersonGrabPack } from "@/utils/missingPersonGrabPack";

interface MissingPersonGrabPackButtonProps {
  youngPersonId: string;
}

export const MissingPersonGrabPackButton = ({ youngPersonId }: MissingPersonGrabPackButtonProps) => {
  const { toast } = useToast();

  const handleGenerateGrabPack = async () => {
    try {
      // Fetch young person data
      const { data: youngPerson, error: ypError } = await supabase
        .from("young_people")
        .select("*")
        .eq("id", youngPersonId)
        .single();

      if (ypError || !youngPerson) {
        throw new Error("Failed to load young person data");
      }

      // Fetch contacts
      const { data: contacts } = await supabase
        .from("young_person_contacts")
        .select("*")
        .eq("young_person_id", youngPersonId);

      // Fetch recent missing episodes
      const { data: episodes } = await supabase
        .from("missing_episodes")
        .select("case_id, missing_from, returned_at, missing_reason, last_known_location")
        .eq("young_person_id", youngPersonId)
        .order("missing_from", { ascending: false })
        .limit(5);

      // Generate and download the grab pack
      downloadMissingPersonGrabPack(
        youngPerson,
        contacts || [],
        episodes || []
      );

      toast({
        title: "Success",
        description: "Missing Person Grab Pack generated successfully",
      });
    } catch (error) {
      console.error("Error generating grab pack:", error);
      toast({
        title: "Error",
        description: "Failed to generate grab pack. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Button onClick={handleGenerateGrabPack} variant="outline" size="sm">
      <FileText className="h-4 w-4 mr-2" />
      Generate Missing Person Grab Pack
    </Button>
  );
};
