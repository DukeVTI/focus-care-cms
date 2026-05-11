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

    // Determine the month we are reporting on (usually the previous month)
    const now = new Date();
    const targetMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const targetMonthStr = targetMonth.toISOString().split('T')[0];

    // 2. Fetch active young people
    const { data: youngPeople, error: ypError } = await supabase
      .from('young_people')
      .select('id, first_name, last_name, user_id');
      
    if (ypError) throw ypError;

    const results = [];

    // 3. For each young person, generate a report
    for (const yp of youngPeople) {
      console.log(`Generating report for ${yp.first_name} ${yp.last_name}...`);

      // TODO: Aggregate Data (Tasks, Chronology, Health, Missing Episodes)
      // This is a placeholder for the aggregation logic
      const utilization_metrics = {
        task_success_rate: 85,
        night_checks: 30,
        crisis_events: 0
      };

      // 4. Construct prompt for LLM
      const prompt = `
        You are a professional social worker writing a monthly summary report for a young person named ${yp.first_name} ${yp.last_name}.
        Review the following aggregated data for the previous month:
        - Task Success Rate: ${utilization_metrics.task_success_rate}%
        - Night Checks Completed: ${utilization_metrics.night_checks}
        - Crisis Events: ${utilization_metrics.crisis_events}
        
        Write a supportive, professional, and encouraging 3-paragraph letter addressed to the young person summarizing their progress.
      `;

      // 5. Call Gemini API (Mocked for now)
      let aiDraftContent = `Dear ${yp.first_name},\n\nThis is a mock AI-generated draft summarizing your fantastic progress this month. You have achieved an 85% success rate on your tasks! Keep up the good work.\n\nBest regards,\nYour Support Team`;
      
      if (GEMINI_API_KEY) {
        // Implement actual Gemini fetch here
        console.log("Gemini API key found, but using mock implementation for scaffold.");
      }

      // 6. Save to database
      const { error: insertError } = await supabase
        .from('monthly_reports')
        .upsert({
          young_person_id: yp.id,
          report_month: targetMonthStr,
          status: 'draft',
          utilization_metrics,
          ai_draft_content: aiDraftContent,
        }, {
          onConflict: 'young_person_id, report_month'
        });

      if (insertError) {
        console.error(`Failed to save report for ${yp.id}:`, insertError);
      } else {
        results.push({ id: yp.id, status: 'success' });
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
