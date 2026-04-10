import { createClient } from "https://esm.sh/@supabase/supabase-js@2.75.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    const now = new Date();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    // 1. Escalate missing episodes that have been open > 24 hours
    const { data: missingEpisodes, error: meError } = await supabase
      .from("missing_episodes")
      .select("id, young_person_id, reported_by, missing_from, escalation_level, case_id")
      .eq("status", "missing")
      .lt("missing_from", twentyFourHoursAgo.toISOString());

    if (meError) throw meError;

    let escalatedMissing = 0;
    for (const ep of missingEpisodes || []) {
      if (ep.escalation_level === "standard") {
        await supabase
          .from("missing_episodes")
          .update({
            escalation_level: "high",
            escalated_at: now.toISOString(),
          })
          .eq("id", ep.id);

        // Create alert for the reporter
        await supabase.from("alerts").insert({
          user_id: ep.reported_by,
          young_person_id: ep.young_person_id,
          title: `Missing episode ${ep.case_id || ep.id} auto-escalated to HIGH`,
          message: `This missing episode has been open for over 24 hours and has been automatically escalated.`,
          alert_type: "escalation",
          severity: "critical",
        });

        escalatedMissing++;
      }
    }

    // 2. Flag overdue tasks (past due_date by 24+ hours)
    const { data: overdueTasks, error: taskError } = await supabase
      .from("tasks")
      .select("id, title, assigned_to, young_person_id, due_date")
      .in("status", ["pending", "in-progress"])
      .not("due_date", "is", null)
      .lt("due_date", new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split("T")[0]);

    if (taskError) throw taskError;

    let flaggedTasks = 0;
    for (const task of overdueTasks || []) {
      // Check if we already sent an alert for this task today
      const today = now.toISOString().split("T")[0];
      const { data: existingAlert } = await supabase
        .from("alerts")
        .select("id")
        .eq("alert_type", "overdue_task")
        .eq("user_id", task.assigned_to)
        .like("title", `%${task.id.slice(0, 8)}%`)
        .gte("created_at", `${today}T00:00:00Z`)
        .limit(1);

      if (!existingAlert || existingAlert.length === 0) {
        await supabase.from("alerts").insert({
          user_id: task.assigned_to,
          young_person_id: task.young_person_id,
          title: `Overdue task: ${task.title} (${task.id.slice(0, 8)})`,
          message: `This task was due on ${task.due_date} and is now overdue by more than 24 hours.`,
          alert_type: "overdue_task",
          severity: "high",
          due_date: task.due_date,
        });
        flaggedTasks++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        escalated_missing: escalatedMissing,
        flagged_tasks: flaggedTasks,
        checked_at: now.toISOString(),
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
