import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Smile } from "lucide-react";

const MOODS = [
  { score: 1, label: "Very Low", emoji: "😢", color: "bg-red-500" },
  { score: 2, label: "Low", emoji: "😟", color: "bg-orange-500" },
  { score: 3, label: "Neutral", emoji: "😐", color: "bg-yellow-500" },
  { score: 4, label: "Good", emoji: "😊", color: "bg-lime-500" },
  { score: 5, label: "Great", emoji: "😄", color: "bg-green-500" },
];

interface MoodCaptureWidgetProps {
  youngPersonId: string;
  onSaved?: () => void;
}

export function MoodCaptureWidget({ youngPersonId, onSaved }: MoodCaptureWidgetProps) {
  const { user } = useAuth();
  const [selected, setSelected] = useState<number | null>(null);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!selected || !user) return;
    setSaving(true);
    const mood = MOODS.find((m) => m.score === selected)!;
    const today = new Date().toISOString().split("T")[0];

    const { error } = await supabase.from("mood_entries").upsert(
      {
        young_person_id: youngPersonId,
        recorded_by: user.id,
        mood_date: today,
        mood_score: mood.score,
        mood_label: mood.label,
        notes: notes || null,
      },
      { onConflict: "young_person_id,mood_date" }
    );

    if (error) {
      toast.error("Failed to save mood entry");
    } else {
      toast.success("Mood recorded for today");
      setSelected(null);
      setNotes("");
      onSaved?.();
    }
    setSaving(false);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <Smile className="h-5 w-5" />
          Record Today's Mood
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between gap-2">
          {MOODS.map((mood) => (
            <button
              key={mood.score}
              onClick={() => setSelected(mood.score)}
              className={`flex flex-col items-center gap-1 p-2 rounded-lg border-2 transition-all flex-1 ${
                selected === mood.score
                  ? "border-primary bg-primary/10 scale-105"
                  : "border-transparent hover:border-muted-foreground/20"
              }`}
            >
              <span className="text-2xl">{mood.emoji}</span>
              <span className="text-xs text-muted-foreground">{mood.label}</span>
            </button>
          ))}
        </div>
        {selected && (
          <>
            <Textarea
              placeholder="Optional notes about mood today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
            <Button onClick={handleSave} disabled={saving} size="sm" className="w-full">
              {saving ? "Saving..." : "Save Mood"}
            </Button>
          </>
        )}
      </CardContent>
    </Card>
  );
}
