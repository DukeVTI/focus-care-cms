import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Users, CheckSquare, AlertTriangle, FileText, BookOpen, Heart } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";

// ── Types ─────────────────────────────────────────────────────────────────────

interface SearchResult {
  id: string;
  label: string;
  sublabel?: string;
  group: "young_people" | "tasks" | "missing" | "chronology" | "risk";
  route: string;
}

// ── Hook: useGlobalSearch ─────────────────────────────────────────────────────

function useGlobalSearch(query: string) {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (q: string) => {
    if (!q || q.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    const term = `%${q.trim()}%`;

    try {
      const [ypRes, taskRes, missingRes, chronRes, riskRes] = await Promise.all([
        // Young people — search name + focus_id
        supabase
          .from("young_people")
          .select("id, first_name, last_name, focus_id, placement_type")
          .or(`first_name.ilike.${term},last_name.ilike.${term},focus_id.ilike.${term}`)
          .eq("draft", false)
          .limit(6),

        // Tasks — search title + description
        supabase
          .from("tasks")
          .select("id, title, status, young_person_id")
          .or(`title.ilike.${term},description.ilike.${term}`)
          .not("status", "in", '("archived","ARCHIVED")')
          .limit(5),

        // Missing episodes — search case_id + location
        supabase
          .from("missing_episodes")
          .select("id, case_id, status, last_known_location")
          .or(`case_id.ilike.${term},last_known_location.ilike.${term}`)
          .limit(4),

        // Chronology entries — search summary + observation
        supabase
          .from("chronology_entries")
          .select("id, summary, entry_date, young_person_id")
          .or(`summary.ilike.${term},observation.ilike.${term}`)
          .order("entry_date", { ascending: false })
          .limit(4),

        // Risk assessments — search recommendations
        supabase
          .from("risk_assessments")
          .select("id, risk_level, assessment_date, young_person_id")
          .or(`risk_level.ilike.${term},recommendations.ilike.${term}`)
          .order("assessment_date", { ascending: false })
          .limit(4),
      ]);

      const all: SearchResult[] = [];

      (ypRes.data || []).forEach((yp) => {
        all.push({
          id: yp.id,
          label: `${yp.first_name} ${yp.last_name || ""}`.trim(),
          sublabel: [yp.focus_id, yp.placement_type].filter(Boolean).join(" · "),
          group: "young_people",
          route: `/young-people/${yp.id}`,
        });
      });

      (taskRes.data || []).forEach((t) => {
        all.push({
          id: t.id,
          label: t.title,
          sublabel: `Status: ${t.status}`,
          group: "tasks",
          route: `/tasks/${t.id}`,
        });
      });

      (missingRes.data || []).forEach((m) => {
        all.push({
          id: m.id,
          label: m.case_id || `Episode ${m.id.slice(0, 8)}`,
          sublabel: [m.status, m.last_known_location].filter(Boolean).join(" · "),
          group: "missing",
          route: `/missing-episodes/${m.id}`,
        });
      });

      (chronRes.data || []).forEach((c) => {
        all.push({
          id: c.id,
          label: c.summary || "Chronology entry",
          sublabel: c.entry_date,
          group: "chronology",
          route: `/chronology/${c.id}`,
        });
      });

      (riskRes.data || []).forEach((r) => {
        all.push({
          id: r.id,
          label: `Risk Assessment — ${r.risk_level}`,
          sublabel: r.assessment_date,
          group: "risk",
          route: `/risk-assessments/${r.id}`,
        });
      });

      setResults(all);
    } catch (err) {
      console.error("Global search error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    search(query);
  }, [query, search]);

  return { results, loading };
}

// ── Group metadata ────────────────────────────────────────────────────────────

const GROUP_META = {
  young_people: { label: "Young People", icon: <Users className="h-3.5 w-3.5" /> },
  tasks: { label: "Tasks", icon: <CheckSquare className="h-3.5 w-3.5" /> },
  missing: { label: "Missing Episodes", icon: <AlertTriangle className="h-3.5 w-3.5" /> },
  chronology: { label: "Chronology", icon: <BookOpen className="h-3.5 w-3.5" /> },
  risk: { label: "Risk Assessments", icon: <Heart className="h-3.5 w-3.5" /> },
};

type GroupKey = keyof typeof GROUP_META;

// ── Main Component ────────────────────────────────────────────────────────────

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 250);
  const { results, loading } = useGlobalSearch(debouncedQuery);

  // Reset query when dialog closes
  useEffect(() => {
    if (!open) setQuery("");
  }, [open]);

  const handleSelect = (route: string) => {
    onOpenChange(false);
    navigate(route);
  };

  // Group results
  const grouped = results.reduce<Partial<Record<GroupKey, SearchResult[]>>>((acc, r) => {
    if (!acc[r.group]) acc[r.group] = [];
    acc[r.group]!.push(r);
    return acc;
  }, {});

  const groupOrder: GroupKey[] = ["young_people", "tasks", "missing", "chronology", "risk"];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput
        placeholder="Search young people, tasks, episodes, chronology…"
        value={query}
        onValueChange={setQuery}
      />
      <CommandList>
        {loading && (
          <div className="py-6 text-center text-sm text-muted-foreground">Searching…</div>
        )}

        {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
          <CommandEmpty>No results found for "{debouncedQuery}"</CommandEmpty>
        )}

        {!loading && debouncedQuery.length < 2 && (
          <CommandEmpty>
            <span className="text-muted-foreground text-sm">
              Type at least 2 characters to search
            </span>
          </CommandEmpty>
        )}

        {!loading &&
          groupOrder.map((group, idx) => {
            const items = grouped[group];
            if (!items || items.length === 0) return null;
            const meta = GROUP_META[group];

            return (
              <span key={group}>
                {idx > 0 && <CommandSeparator />}
                <CommandGroup
                  heading={
                    <span className="flex items-center gap-1.5">
                      {meta.icon}
                      {meta.label}
                    </span>
                  }
                >
                  {items.map((item) => (
                    <CommandItem
                      key={item.id}
                      value={`${group}-${item.id}-${item.label}`}
                      onSelect={() => handleSelect(item.route)}
                      className="flex flex-col items-start gap-0.5 py-2.5"
                    >
                      <span className="font-medium text-sm">{item.label}</span>
                      {item.sublabel && (
                        <span className="text-xs text-muted-foreground">{item.sublabel}</span>
                      )}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </span>
            );
          })}
      </CommandList>
    </CommandDialog>
  );
}
