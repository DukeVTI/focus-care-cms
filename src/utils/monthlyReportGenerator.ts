import { format, differenceInMinutes } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { generateReportHTML, downloadHTMLReport } from "./reportGenerator";

interface MonthlyReportData {
  youngPerson: any;
  chronologyEntries: any[];
  riskAssessments: any[];
  safeguardingRisks: any[];
  missingEpisodes: any[];
  keyworkSessions: any[];
  tasks: any[];
  contacts: any[];
}

export const fetchMonthlyReportData = async (
  youngPersonId: string,
  dateFrom: Date,
  dateTo: Date
): Promise<MonthlyReportData> => {
  const dateFromStr = format(dateFrom, 'yyyy-MM-dd');
  const dateToStr = format(dateTo, 'yyyy-MM-dd');

  // Fetch young person
  const { data: youngPerson } = await supabase
    .from('young_people')
    .select('*')
    .eq('id', youngPersonId)
    .single();

  // Fetch chronology entries
  const { data: chronologyEntries } = await supabase
    .from('chronology_entries')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .gte('entry_date', dateFromStr)
    .lte('entry_date', dateToStr)
    .order('entry_date', { ascending: false });

  // Fetch risk assessments
  const { data: riskAssessments } = await supabase
    .from('risk_assessments')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .gte('assessment_date', dateFromStr)
    .lte('assessment_date', dateToStr)
    .order('assessment_date', { ascending: false });

  // Fetch safeguarding risks
  const { data: safeguardingRisks } = await supabase
    .from('safeguarding_risks')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .eq('is_active', true)
    .order('date_added', { ascending: false });

  // Fetch missing episodes
  const { data: missingEpisodes } = await supabase
    .from('missing_episodes')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .gte('missing_from', dateFromStr)
    .lte('missing_from', dateToStr)
    .order('missing_from', { ascending: false });

  // Fetch keywork sessions
  const { data: keyworkSessions } = await supabase
    .from('keywork_sessions')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .gte('session_date', dateFromStr)
    .lte('session_date', dateToStr)
    .order('session_date', { ascending: false });

  // Fetch tasks
  const { data: tasks } = await supabase
    .from('tasks')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .order('created_at', { ascending: false });

  // Fetch contacts
  const { data: contacts } = await supabase
    .from('young_person_contacts')
    .select('*')
    .eq('young_person_id', youngPersonId)
    .order('is_primary', { ascending: false });

  return {
    youngPerson: youngPerson || {},
    chronologyEntries: chronologyEntries || [],
    riskAssessments: riskAssessments || [],
    safeguardingRisks: safeguardingRisks || [],
    missingEpisodes: missingEpisodes || [],
    keyworkSessions: keyworkSessions || [],
    tasks: tasks || [],
    contacts: contacts || [],
  };
};

const generateCoreInfoSection = (yp: any, contacts: any[]): string => {
  const primaryContact = contacts.find(c => c.is_primary) || contacts[0];
  
  return `
    <div class="section">
      <h2 class="section-title">1. Core Information</h2>
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Full Name</div>
          <div class="info-value">${yp.first_name} ${yp.last_name || ''}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Focus ID</div>
          <div class="info-value">${yp.focus_id || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Date of Birth</div>
          <div class="info-value">${format(new Date(yp.date_of_birth), 'dd MMM yyyy')} (Age: ${yp.age || 'N/A'})</div>
        </div>
        <div class="info-item">
          <div class="info-label">Gender</div>
          <div class="info-value">${yp.gender || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Placement Address</div>
          <div class="info-value">${yp.placement_address || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Placement Type</div>
          <div class="info-value">${yp.placement_type || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Placing Authority</div>
          <div class="info-value">${yp.placing_authority || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Residing Authority</div>
          <div class="info-value">${yp.residing_local_authority || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Immigration Legal Status</div>
          <div class="info-value">${yp.immigration_legal_status || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Care Legal Status</div>
          <div class="info-value">${yp.care_legal_status || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Time Looked After</div>
          <div class="info-value">${yp.time_looked_after || 'N/A'}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Previous Placement</div>
          <div class="info-value">${yp.previous_placement || 'N/A'}</div>
        </div>
      </div>
      
      ${yp.reason_for_placement ? `
        <div class="subsection-title">Reason for Placement</div>
        <div class="entry-content">${yp.reason_for_placement}${yp.reason_for_placement_notes ? ': ' + yp.reason_for_placement_notes : ''}</div>
      ` : ''}
      
      ${yp.id_type ? `
        <div class="subsection-title">ID Details</div>
        <div class="entry-content">${yp.id_type}: ${yp.id_value || 'N/A'} ${yp.id_details ? '(' + yp.id_details + ')' : ''}</div>
      ` : ''}
      
      ${primaryContact ? `
        <div class="subsection-title">Primary Contact</div>
        <div class="info-grid">
          <div class="info-item">
            <div class="info-label">Name</div>
            <div class="info-value">${primaryContact.contact_name}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Role</div>
            <div class="info-value">${primaryContact.role || primaryContact.relationship || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Phone</div>
            <div class="info-value">${primaryContact.phone || 'N/A'}</div>
          </div>
          <div class="info-item">
            <div class="info-label">Email</div>
            <div class="info-value">${primaryContact.email || 'N/A'}</div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
};

const generateChronologySection = (entries: any[]): string => {
  const flaggedEntries = entries.filter(e => e.flagged_for_report);
  
  const categoryCounts: Record<string, number> = {};
  entries.forEach(e => {
    if (e.category) {
      categoryCounts[e.category] = (categoryCounts[e.category] || 0) + 1;
    }
  });
  
  const positiveCount = entries.filter(e => e.tags?.includes('Positive')).length;
  const incidentCount = entries.filter(e => e.tags?.includes('Incident')).length;
  
  return `
    <div class="section">
      <h2 class="section-title">2. Chronology Summary</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${entries.length}</div>
          <div class="stat-label">Total Entries</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${flaggedEntries.length}</div>
          <div class="stat-label">Flagged Entries</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${positiveCount}</div>
          <div class="stat-label">Positive Events</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${incidentCount}</div>
          <div class="stat-label">Incidents</div>
        </div>
      </div>
      
      ${Object.keys(categoryCounts).length > 0 ? `
        <div class="subsection-title">Entries by Category</div>
        <div class="info-grid">
          ${Object.entries(categoryCounts).map(([cat, count]) => `
            <div class="info-item">
              <div class="info-label">${cat}</div>
              <div class="info-value">${count} entries</div>
            </div>
          `).join('')}
        </div>
      ` : ''}
      
      ${flaggedEntries.length > 0 ? `
        <div class="subsection-title">Flagged Entries for Report</div>
        ${flaggedEntries.map(entry => `
          <div class="entry-card">
            <div class="entry-header">
              <div class="entry-title">${entry.summary || 'No summary'}</div>
              <div class="entry-date">${format(new Date(entry.entry_date + 'T' + entry.entry_time), 'dd MMM yyyy HH:mm')}</div>
            </div>
            ${entry.significance ? `<span class="badge badge-${entry.significance.toLowerCase()}">${entry.significance}</span>` : ''}
            ${entry.category ? `<span class="badge badge-default">${entry.category}</span>` : ''}
            ${entry.tags?.map((tag: string) => `<span class="badge badge-default">${tag}</span>`).join('') || ''}
            <div class="entry-content">${entry.observation}</div>
            ${entry.author_name ? `<div class="entry-date" style="margin-top: 10px;">Author: ${entry.author_name}</div>` : ''}
          </div>
        `).join('')}
      ` : '<p>No flagged entries in this period.</p>'}
    </div>
  `;
};

const generateRiskSection = (assessments: any[]): string => {
  const latest = assessments[0];
  
  if (!latest) {
    return `
      <div class="section">
        <h2 class="section-title">3. Risk Assessment Summary</h2>
        <p>No risk assessments in this period.</p>
      </div>
    `;
  }
  
  const sectionScores = latest.section_scores as any || {};
  
  return `
    <div class="section">
      <h2 class="section-title">3. Risk Assessment Summary</h2>
      
      <div class="info-grid">
        <div class="info-item">
          <div class="info-label">Assessment Date</div>
          <div class="info-value">${format(new Date(latest.assessment_date), 'dd MMM yyyy')}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Total Score</div>
          <div class="info-value">${latest.risk_score}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Risk Level</div>
          <div class="info-value">
            <span class="badge badge-${latest.risk_level.toLowerCase()}">${latest.risk_level}</span>
          </div>
        </div>
        <div class="info-item">
          <div class="info-label">Previous Level</div>
          <div class="info-value">${latest.previous_level || 'N/A'}</div>
        </div>
      </div>
      
      ${Object.keys(sectionScores).length > 0 ? `
        <div class="subsection-title">Domain Scores</div>
        <table>
          <thead>
            <tr>
              <th>Domain</th>
              <th>Score</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${Object.entries(sectionScores).map(([key, data]: [string, any]) => `
              <tr>
                <td>${key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</td>
                <td>${data.score || 0}</td>
                <td>${data.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      ` : ''}
      
      ${latest.risk_factors ? `
        <div class="subsection-title">Risk Factors</div>
        <div class="entry-content">${latest.risk_factors}</div>
      ` : ''}
      
      ${latest.protective_factors ? `
        <div class="subsection-title">Protective Factors</div>
        <div class="entry-content">${latest.protective_factors}</div>
      ` : ''}
      
      ${latest.recommendations ? `
        <div class="subsection-title">Recommendations</div>
        <div class="entry-content">${latest.recommendations}</div>
      ` : ''}
    </div>
  `;
};

const generateSafeguardingSection = (risks: any[]): string => {
  const highRisks = risks.filter(r => r.severity === 'High').length;
  const mediumRisks = risks.filter(r => r.severity === 'Medium').length;
  const lowRisks = risks.filter(r => r.severity === 'Low').length;
  
  return `
    <div class="section">
      <h2 class="section-title">4. Safeguarding Risks Summary</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${risks.length}</div>
          <div class="stat-label">Total Active Risks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${highRisks}</div>
          <div class="stat-label">High Risks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${mediumRisks}</div>
          <div class="stat-label">Medium Risks</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${lowRisks}</div>
          <div class="stat-label">Low Risks</div>
        </div>
      </div>
      
      ${risks.length > 0 ? `
        <div class="subsection-title">Active Risks</div>
        ${risks.map(risk => `
          <div class="entry-card">
            <div class="entry-header">
              <div class="entry-title">${risk.risk_category}</div>
              <span class="badge badge-${risk.severity.toLowerCase()}">${risk.severity}</span>
            </div>
            <div class="entry-date">Identified: ${format(new Date(risk.date_added), 'dd MMM yyyy')}</div>
            <div class="entry-content">${risk.description}</div>
            ${risk.mitigation_plan ? `
              <div class="subsection-title" style="font-size: 13px; margin-top: 10px;">Mitigation Plan</div>
              <div class="entry-content">${risk.mitigation_plan}</div>
            ` : ''}
          </div>
        `).join('')}
      ` : '<p>No active safeguarding risks.</p>'}
    </div>
  `;
};

const generateMissingEpisodesSection = (episodes: any[]): string => {
  const totalMinutes = episodes.reduce((sum, ep) => {
    if (ep.returned_at) {
      return sum + differenceInMinutes(new Date(ep.returned_at), new Date(ep.missing_from));
    }
    return sum;
  }, 0);
  
  const avgDuration = episodes.length > 0 ? Math.round(totalMinutes / episodes.length) : 0;
  
  return `
    <div class="section">
      <h2 class="section-title">5. Missing Episodes Summary</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${episodes.length}</div>
          <div class="stat-label">Total Episodes</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(totalMinutes / 60)}h</div>
          <div class="stat-label">Total Hours Missing</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${Math.round(avgDuration / 60)}h</div>
          <div class="stat-label">Avg Duration</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${episodes.filter(e => e.police_notified).length}</div>
          <div class="stat-label">Police Notified</div>
        </div>
      </div>
      
      ${episodes.length > 0 ? `
        ${episodes.map(ep => `
          <div class="entry-card">
            <div class="entry-header">
              <div class="entry-title">Episode ${ep.case_id || ''}</div>
              <span class="badge badge-${ep.status === 'returned' ? 'low' : 'high'}">${ep.status}</span>
            </div>
            <div class="info-grid">
              <div class="info-item">
                <div class="info-label">Missing From</div>
                <div class="info-value">${format(new Date(ep.missing_from), 'dd MMM yyyy HH:mm')}</div>
              </div>
              ${ep.returned_at ? `
                <div class="info-item">
                  <div class="info-label">Returned At</div>
                  <div class="info-value">${format(new Date(ep.returned_at), 'dd MMM yyyy HH:mm')}</div>
                </div>
              ` : ''}
              ${ep.missing_reason ? `
                <div class="info-item">
                  <div class="info-label">Reason</div>
                  <div class="info-value">${ep.missing_reason}</div>
                </div>
              ` : ''}
              ${ep.last_known_location ? `
                <div class="info-item">
                  <div class="info-label">Last Known Location</div>
                  <div class="info-value">${ep.last_known_location}</div>
                </div>
              ` : ''}
            </div>
            ${ep.risks_encountered ? `
              <div class="subsection-title" style="font-size: 13px; margin-top: 10px;">Risks Encountered</div>
              <div class="entry-content">${ep.risks_encountered}</div>
            ` : ''}
            ${ep.follow_up_actions ? `
              <div class="subsection-title" style="font-size: 13px; margin-top: 10px;">Follow-up Actions</div>
              <div class="entry-content">${ep.follow_up_actions}</div>
            ` : ''}
          </div>
        `).join('')}
      ` : '<p>No missing episodes in this period.</p>'}
    </div>
  `;
};

const generateKeyworkSection = (sessions: any[]): string => {
  const planned = sessions.filter(s => s.session_type === 'planned').length;
  const tasksCreated = sessions.filter(s => s.requires_task).length;
  
  return `
    <div class="section">
      <h2 class="section-title">6. Keywork Sessions Summary</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${sessions.length}</div>
          <div class="stat-label">Total Sessions</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${planned}</div>
          <div class="stat-label">Planned</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${sessions.length - planned}</div>
          <div class="stat-label">Unplanned</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${tasksCreated}</div>
          <div class="stat-label">Tasks Created</div>
        </div>
      </div>
      
      ${sessions.length > 0 ? `
        ${sessions.map(session => `
          <div class="entry-card">
            <div class="entry-header">
              <div class="entry-title">${session.title || session.topic}</div>
              <div class="entry-date">${format(new Date(session.session_date), 'dd MMM yyyy')}</div>
            </div>
            <span class="badge badge-default">${session.session_type}</span>
            ${session.standards_referenced?.map((std: string) => `<span class="badge badge-default">${std}</span>`).join('') || ''}
            ${session.notes ? `<div class="entry-content">${session.notes}</div>` : ''}
            ${session.standards_met && session.standards_met.length > 0 ? `
              <div class="subsection-title" style="font-size: 13px; margin-top: 10px;">Standards Met</div>
              ${session.standards_met.map((std: string) => `<span class="badge badge-low">${std}</span>`).join('')}
            ` : ''}
            ${session.follow_up_required ? `<div class="badge badge-medium" style="margin-top: 10px;">Follow-up Required</div>` : ''}
          </div>
        `).join('')}
      ` : '<p>No keywork sessions in this period.</p>'}
    </div>
  `;
};

const generateTasksSection = (tasks: any[]): string => {
  const open = tasks.filter(t => t.status === 'pending').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const completed = tasks.filter(t => t.status === 'completed').length;
  const overdue = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'completed').length;
  
  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'archived');
  
  return `
    <div class="section">
      <h2 class="section-title">7. Tasks Summary</h2>
      
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value">${open}</div>
          <div class="stat-label">Open</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${inProgress}</div>
          <div class="stat-label">In Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${completed}</div>
          <div class="stat-label">Completed</div>
        </div>
        <div class="stat-card">
          <div class="stat-value">${overdue}</div>
          <div class="stat-label">Overdue</div>
        </div>
      </div>
      
      ${activeTasks.length > 0 ? `
        <div class="subsection-title">Active Tasks</div>
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Due Date</th>
              <th>Importance</th>
              <th>Support Required</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${activeTasks.map(task => {
              const isOverdue = task.due_date && new Date(task.due_date) < new Date();
              return `
                <tr>
                  <td>${task.title}</td>
                  <td>${task.due_date ? format(new Date(task.due_date), 'dd MMM yyyy') : 'N/A'}</td>
                  <td><span class="badge badge-${task.importance === 'high' ? 'high' : task.importance === 'medium' ? 'medium' : 'low'}">${task.importance}</span></td>
                  <td>${task.support_required ? 'Yes' : 'No'}</td>
                  <td>
                    ${isOverdue ? '<span class="badge badge-high">Overdue</span>' : ''}
                    <span class="badge badge-default">${task.status}</span>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      ` : '<p>No active tasks.</p>'}
    </div>
  `;
};

export const generateMonthlyReport = async (
  youngPersonId: string,
  dateFrom: Date,
  dateTo: Date
) => {
  const data = await fetchMonthlyReportData(youngPersonId, dateFrom, dateTo);
  
  const sections = [
    generateCoreInfoSection(data.youngPerson, data.contacts),
    generateChronologySection(data.chronologyEntries),
    generateRiskSection(data.riskAssessments),
    generateSafeguardingSection(data.safeguardingRisks),
    generateMissingEpisodesSection(data.missingEpisodes),
    generateKeyworkSection(data.keyworkSessions),
    generateTasksSection(data.tasks),
  ];
  
  const html = generateReportHTML(
    {
      title: 'Monthly Report',
      youngPersonName: `${data.youngPerson.first_name} ${data.youngPerson.last_name || ''}`,
      focusId: data.youngPerson.focus_id || 'N/A',
      dateRange: { from: dateFrom, to: dateTo },
      generatedDate: new Date(),
    },
    sections
  );
  
  const filename = `monthly-report-${data.youngPerson.focus_id}-${format(dateFrom, 'yyyy-MM-dd')}-to-${format(dateTo, 'yyyy-MM-dd')}.html`;
  downloadHTMLReport(html, filename);
};
