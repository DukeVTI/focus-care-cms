import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/untypedClient";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { format, subDays, startOfDay } from "date-fns";
import { Activity } from "lucide-react";

interface MoodEntry {
  mood_date: string;
  mood_score: number;
  mood_label: string;
  notes: string | null;
}

const SCORE_COLORS: Record<number, string> = {
  1: "bg-red-500",
  2: "bg-orange-400",
  3: "bg-yellow-400",
  4: "bg-lime-400",
  5: "bg-green-500",
};

interface MoodHeatmapWidgetProps {
  youngPersonId: string;
  refreshKey?: number;
}

export function MoodHeatmapWidget({ youngPersonId, refreshKey }: MoodHeatmapWidgetProps) {
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMoods();
  }, [youngPersonId, refreshKey]);

  const fetchMoods = async () => {
    const from = format(subDays(new Date(), 89), "yyyy-MM-dd");
    const { data } = await supabase
      .from("mood_entries")
      .select("mood_date, mood_score, mood_label, notes")
      .eq("young_person_id", youngPersonId)
      .gte("mood_date", from)
      .order("mood_date", { ascending: true });
    setEntries(data || []);
    setLoading(false);
  };

  // Build 90-day grid (13 weeks × 7 days)
  const today = startOfDay(new Date());
  const days: Date[] = [];
  for (let i = 89; i >= 0; i--) {
    days.push(subDays(today, i));
  }

  const moodMap = new Map(entries.map((e) => [e.mood_date, e]));

  // Group into weeks (columns)
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  days.forEach((day, i) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || i === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const avgScore = entries.length
    ? (entries.reduce((s, e) => s + e.mood_score, 0) / entries.length).toFixed(1)
    : "—";

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Mood Heatmap (90 Days)
          </span>
          <span className="text-sm font-normal text-muted-foreground">
            Avg: {avgScore}/5 · {entries.length} entries
          </span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-24 flex items-center justify-center text-muted-foreground text-sm">Loading...</div>
        ) : (
          <div className="space-y-2">
            <TooltipProvider delayDuration={100}>
              <div className="flex gap-[3px]">
                {weeks.map((week, wi) => (
                  <div key={wi} className="flex flex-col gap-[3px]">
                    {week.map((day) => {
                      const key = format(day, "yyyy-MM-dd");
                      const entry = moodMap.get(key);
                      return (
                        <Tooltip key={key}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm ${
                                entry ? SCORE_COLORS[entry.mood_score] : "bg-muted"
                              }`}
                            />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            <p className="font-medium">{format(day, "EEE, d MMM")}</p>
                            {entry ? (
                              <>
                                <p>{entry.mood_label} ({entry.mood_score}/5)</p>
                                {entry.notes && <p className="max-w-48 truncate">{entry.notes}</p>}
                              </>
                            ) : (
                              <p className="text-muted-foreground">No entry</p>
                            )}
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </TooltipProvider>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>Low</span>
              {[1, 2, 3, 4, 5].map((s) => (
                <div key={s} className={`w-3 h-3 rounded-sm ${SCORE_COLORS[s]}`} />
              ))}
              <span>Great</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
