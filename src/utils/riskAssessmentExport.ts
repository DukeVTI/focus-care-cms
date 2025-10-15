import { format } from "date-fns";

export interface RiskAssessmentExport {
  id: string;
  young_person_id: string;
  young_person_name: string;
  focus_id: string;
  assessment_date: string;
  assessed_by: string;
  assessor_name: string;
  risk_level: string;
  risk_score: number;
  section_scores: any;
  recommendations: string;
  follow_up_needed: boolean;
  created_at: string;
}

const DEFAULT_SECTIONS = [
  { key: "safety_missing", label: "Safety & Missing Episodes" },
  { key: "mental_health", label: "Mental Health & Wellbeing" },
  { key: "substance_use", label: "Substance Use" },
  { key: "peer_relationships", label: "Peer/Relationship Risks" },
  { key: "education", label: "Education/Attendance Risks" },
  { key: "online_safety", label: "Online/Social Media Risks" },
  { key: "environmental", label: "Environmental/Family Factors" },
  { key: "other", label: "Other Identified Risks" }
];

export function exportRiskAssessmentsToCSV(assessments: RiskAssessmentExport[]): void {
  // Build CSV header
  const headers = [
    "Assessment ID",
    "Young Person",
    "FOCUS ID",
    "Assessment Date",
    "Assessor",
    "Risk Level",
    "Total Score",
    ...DEFAULT_SECTIONS.map(s => s.label + " Score"),
    ...DEFAULT_SECTIONS.map(s => s.label + " Notes"),
    "Recommendations",
    "Follow-up Needed",
    "Created At"
  ];

  // Build CSV rows
  const rows = assessments.map(assessment => {
    const sectionScores = assessment.section_scores || {};
    
    const sectionScoreValues = DEFAULT_SECTIONS.map(section => {
      const data = sectionScores[section.key];
      return data?.score ?? "";
    });

    const sectionNotes = DEFAULT_SECTIONS.map(section => {
      const data = sectionScores[section.key];
      return data?.notes ? `"${data.notes.replace(/"/g, '""')}"` : "";
    });

    return [
      assessment.id,
      `"${assessment.young_person_name}"`,
      assessment.focus_id || "",
      format(new Date(assessment.assessment_date), "yyyy-MM-dd"),
      `"${assessment.assessor_name}"`,
      assessment.risk_level,
      assessment.risk_score,
      ...sectionScoreValues,
      ...sectionNotes,
      assessment.recommendations ? `"${assessment.recommendations.replace(/"/g, '""')}"` : "",
      assessment.follow_up_needed ? "Yes" : "No",
      format(new Date(assessment.created_at), "yyyy-MM-dd HH:mm:ss")
    ].join(",");
  });

  // Combine header and rows
  const csv = [headers.join(","), ...rows].join("\n");

  // Create download
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", `risk-assessments-${format(new Date(), "yyyy-MM-dd")}.csv`);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function parseCSVImport(csvText: string): any[] {
  const lines = csvText.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map(h => h.trim());
  const assessments = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const assessment: any = {};

    headers.forEach((header, index) => {
      const value = values[index];
      
      // Map CSV columns to assessment fields
      if (header === "FOCUS ID") {
        assessment.focus_id = value;
      } else if (header === "Assessment Date") {
        assessment.assessment_date = value;
      } else if (header === "Risk Level") {
        assessment.risk_level = value;
      } else if (header === "Total Score") {
        assessment.risk_score = parseInt(value) || 0;
      } else if (header === "Recommendations") {
        assessment.recommendations = value;
      } else if (header === "Follow-up Needed") {
        assessment.follow_up_needed = value.toLowerCase() === "yes";
      } else if (header.includes("Score")) {
        // Section scores
        const sectionKey = getSectionKeyFromLabel(header.replace(" Score", ""));
        if (sectionKey) {
          if (!assessment.section_scores) assessment.section_scores = {};
          if (!assessment.section_scores[sectionKey]) {
            assessment.section_scores[sectionKey] = {};
          }
          assessment.section_scores[sectionKey].score = parseInt(value) || 0;
        }
      } else if (header.includes("Notes")) {
        // Section notes
        const sectionKey = getSectionKeyFromLabel(header.replace(" Notes", ""));
        if (sectionKey) {
          if (!assessment.section_scores) assessment.section_scores = {};
          if (!assessment.section_scores[sectionKey]) {
            assessment.section_scores[sectionKey] = {};
          }
          assessment.section_scores[sectionKey].notes = value;
        }
      }
    });

    assessments.push(assessment);
  }

  return assessments;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      values.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  
  values.push(current.trim());
  return values;
}

function getSectionKeyFromLabel(label: string): string | null {
  const section = DEFAULT_SECTIONS.find(s => s.label === label);
  return section ? section.key : null;
}