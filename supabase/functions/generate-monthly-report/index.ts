import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Environment variables
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type MonthWindow = {
  monthStart: string;
  nextMonthStart: string;
  monthLabel: string;
};

type ReportMetrics = {
  task_success_rate: number;
  night_checks: number;
  crisis_events: number;
};

type YoungPerson = {
  id: string;
  first_name: string;
  last_name: string;
};

type TaskRow = {
  id: string;
  title: string;
  status: string | null;
  importance: string | null;
  due_date: string | null;
  created_at: string | null;
};

type ChronologyRow = {
  id: string;
  summary: string | null;
  observation: string | null;
  category: string | null;
  entry_date: string | null;
  significance: string | null;
  created_at: string | null;
};

type MissingEpisodeRow = {
  id: string;
  status: string | null;
  case_id: string | null;
  missing_from: string | null;
  returned_at: string | null;
  manager_approved: boolean | null;
  created_at: string | null;
};

type RiskAssessmentRow = {
  id: string;
  assessment_date: string | null;
  risk_level: string | null;
  risk_score: number | null;
  follow_up_needed: boolean | null;
  created_at: string | null;
};

type MoodEntryRow = {
  id: string;
  mood_date: string | null;
  mood_score: number | null;
  mood_label: string | null;
  notes: string | null;
  created_at: string | null;
};

const getMonthWindow = (): MonthWindow => {
  const now = new Date();
  const targetMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
  const nextMonth = new Date(Date.UTC(targetMonth.getUTCFullYear(), targetMonth.getUTCMonth() + 1, 1));

  return {
    monthStart: targetMonth.toISOString().slice(0, 10),
    nextMonthStart: nextMonth.toISOString().slice(0, 10),
    monthLabel: targetMonth.toLocaleString("en-GB", { month: "long", year: "numeric", timeZone: "UTC" }),
  };
};

const lower = (value: string | null | undefined) => (value || "").toLowerCase();

const isCompletedTask = (status: string | null | undefined) => {
  const normalized = lower(status);
  return ["completed", "done"].includes(normalized);
};

const isActiveRisk = (riskLevel: string | null | undefined) => {
  const normalized = lower(riskLevel);
  return ["high", "critical"].includes(normalized);
};

const summarizeTasks = (tasks: TaskRow[]) => {
  const completedTasks = tasks.filter((task) => isCompletedTask(task.status));
  const openTasks = tasks.filter((task) => !isCompletedTask(task.status));
  const overdueTasks = tasks.filter((task) => task.due_date && new Date(task.due_date) < new Date());

  const taskSuccessRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  return {
    completedTasks,
    openTasks,
    overdueTasks,
    taskSuccessRate,
  };
};

const buildReportContent = (params: {
  monthLabel: string;
  firstName: string;
  lastName: string;
  metrics: ReportMetrics;
  completedTaskCount: number;
  openTaskCount: number;
  overdueTaskCount: number;
  chronologyCount: number;
  activeRiskCount: number;
  missingEpisodeCount: number;
  moodAverage: number | null;
}) => {
  const moodSentence =
    params.moodAverage === null
      ? "No mood entries were recorded this month."
      : `The average mood score for the month was ${params.moodAverage.toFixed(1)} out of 5.`;

  return [
    `Monthly summary for ${params.firstName} ${params.lastName} - ${params.monthLabel}.`,
    `During this period, ${params.completedTaskCount} of ${params.completedTaskCount + params.openTaskCount} tasks were completed, with ${params.overdueTaskCount} overdue items requiring follow-up. The record also includes ${params.chronologyCount} chronology entries, showing ongoing professional contact and oversight.`,
    `Safeguarding monitoring recorded ${params.activeRiskCount} active high-risk assessments and ${params.missingEpisodeCount} missing-episode records. ${moodSentence} Overall task success rate: ${params.metrics.task_success_rate}%.`,
  ].join("\n\n");
};

const buildSmartGoals = (params: {
  overdueTaskCount: number;
  activeRiskCount: number;
  missingEpisodeCount: number;
  moodAverage: number | null;
}) => {
  const goals = [
    {
      goal: "Maintain consistent weekly support contact and record at least one meaningful chronology entry each week.",
      target_date: null,
    },
  ];

  if (params.overdueTaskCount > 0) {
    goals.push({
      goal: `Close out ${params.overdueTaskCount} overdue task${params.overdueTaskCount === 1 ? "" : "s"} and confirm follow-up actions are complete.`,
      target_date: null,
    });
  }

  if (params.activeRiskCount > 0 || params.missingEpisodeCount > 0) {
    goals.push({
      goal: "Review current safeguarding risks and update the safety plan with the team before the next reporting period.",
      target_date: null,
    });
  }

  if (params.moodAverage !== null && params.moodAverage < 3) {
    goals.push({
      goal: "Strengthen emotional wellbeing support by tracking mood more regularly and capturing triggers and protective factors.",
      target_date: null,
    });
  }

  while (goals.length < 3) {
    goals.push({
      goal: "Capture and review progress with the young person before the next monthly report cycle.",
      target_date: null,
    });
  }

  return goals.slice(0, 3);
};

Deno.serve(async (req) => {
  // Handle CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // 1. Authenticate request (verify cron secret or Bearer token)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing authorization header" }), { status: 401, headers: corsHeaders });
    }

    const { monthStart, nextMonthStart, monthLabel } = getMonthWindow();

    // 2. Fetch active young people
    const { data: youngPeople, error: ypError } = await supabase
      .from("young_people")
      .select("id, first_name, last_name");
      
    if (ypError) throw ypError;

    const results = [];

    // 3. For each young person, generate a report
    for (const yp of youngPeople as YoungPerson[]) {
      console.log(`Generating report for ${yp.first_name} ${yp.last_name}...`);

      const [tasksResult, chronologyResult, missingResult, riskResult, moodResult] = await Promise.all([
        supabase
          .from("tasks")
          .select("id, title, status, importance, due_date, created_at")
          .eq("young_person_id", yp.id)
          .gte("created_at", monthStart)
          .lt("created_at", nextMonthStart),
        supabase
          .from("chronology_entries")
          .select("id, summary, observation, category, entry_date, significance, created_at")
          .eq("young_person_id", yp.id)
          .gte("created_at", monthStart)
          .lt("created_at", nextMonthStart),
        supabase
          .from("missing_episodes")
          .select("id, status, case_id, missing_from, returned_at, manager_approved, created_at")
          .eq("young_person_id", yp.id)
          .gte("created_at", monthStart)
          .lt("created_at", nextMonthStart),
        supabase
          .from("risk_assessments")
          .select("id, assessment_date, risk_level, risk_score, follow_up_needed, created_at")
          .eq("young_person_id", yp.id)
          .gte("assessment_date", monthStart)
          .lt("assessment_date", nextMonthStart),
        supabase
          .from("mood_entries")
          .select("id, mood_date, mood_score, mood_label, notes, created_at")
          .eq("young_person_id", yp.id)
          .gte("mood_date", monthStart)
          .lt("mood_date", nextMonthStart),
      ]);

      const queryErrors = [tasksResult.error, chronologyResult.error, missingResult.error, riskResult.error, moodResult.error].filter(Boolean);
      if (queryErrors.length > 0) {
        throw queryErrors[0];
      }

      const tasks = (tasksResult.data || []) as TaskRow[];
      const chronologyEntries = (chronologyResult.data || []) as ChronologyRow[];
      const missingEpisodes = (missingResult.data || []) as MissingEpisodeRow[];
      const riskAssessments = (riskResult.data || []) as RiskAssessmentRow[];
      const moodEntries = (moodResult.data || []) as MoodEntryRow[];

      const taskSummary = summarizeTasks(tasks);
      const activeRiskCount = riskAssessments.filter((assessment) => isActiveRisk(assessment.risk_level)).length;
      const crisisEvents = activeRiskCount + missingEpisodes.filter((episode) => lower(episode.status) === "missing").length;
      const moodAverage = moodEntries.length > 0
        ? moodEntries.reduce((total, entry) => total + (entry.mood_score || 0), 0) / moodEntries.length
        : null;

      const utilization_metrics: ReportMetrics = {
        task_success_rate: taskSummary.taskSuccessRate,
        night_checks: 0,
        crisis_events: crisisEvents,
      };

      const aiDraftContent = buildReportContent({
        monthLabel,
        firstName: yp.first_name,
        lastName: yp.last_name,
        metrics: utilization_metrics,
        completedTaskCount: taskSummary.completedTasks.length,
        openTaskCount: taskSummary.openTasks.length,
        overdueTaskCount: taskSummary.overdueTasks.length,
        chronologyCount: chronologyEntries.length,
        activeRiskCount,
        missingEpisodeCount: missingEpisodes.length,
        moodAverage,
      });

      const smart_goals = buildSmartGoals({
        overdueTaskCount: taskSummary.overdueTasks.length,
        activeRiskCount,
        missingEpisodeCount: missingEpisodes.length,
        moodAverage,
      });

      if (GEMINI_API_KEY) {
        console.log("GEMINI_API_KEY is configured, but the report generation now uses deterministic aggregation so reports stay available even without the LLM.");
      }

      // 4. Save to database
      const { error: insertError } = await supabase
        .from("monthly_reports")
        .upsert({
          young_person_id: yp.id,
          report_month: monthStart,
          status: "draft",
          utilization_metrics,
          ai_draft_content: aiDraftContent,
          smart_goals,
        }, {
          onConflict: "young_person_id, report_month"
        });

      if (insertError) {
        console.error(`Failed to save report for ${yp.id}:`, insertError);
      } else {
        results.push({
          id: yp.id,
          status: "success",
          report_month: monthStart,
          task_success_rate: utilization_metrics.task_success_rate,
          crises: utilization_metrics.crisis_events,
        });
      }
    }

    return new Response(JSON.stringify({ success: true, processed: results.length, results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error: any) {
    console.error("Error generating reports:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
