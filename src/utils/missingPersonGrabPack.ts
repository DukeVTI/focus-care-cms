import { format } from "date-fns";

interface YoungPersonData {
  first_name: string;
  last_name: string;
  focus_id: string;
  date_of_birth: string;
  age: number;
  gender?: string;
  ethnicity?: string;
  nationality?: string;
  placement_address?: string;
  placement_road_name?: string;
  placement_postcode?: string;
  placement_type?: string;
  placing_authority?: string;
  residing_local_authority?: string;
  social_worker_name?: string;
  social_worker_phone?: string;
  social_worker_email?: string;
  known_risks?: string[];
  medical_conditions?: string[];
  mental_health_support?: boolean;
  photo_url?: string;
}

interface ContactData {
  contact_name: string;
  relationship?: string;
  phone?: string;
  is_emergency?: boolean;
}

interface MissingEpisodeData {
  case_id: string;
  missing_from: string;
  returned_at?: string;
  missing_reason?: string;
  last_known_location?: string;
}

export const generateMissingPersonGrabPackHTML = (
  youngPerson: YoungPersonData,
  contacts: ContactData[],
  recentEpisodes: MissingEpisodeData[]
): string => {
  const formatReason = (reason: string) => {
    const reasons: Record<string, string> = {
      argument: "Argument / Family Conflict",
      not_returning: "Not Returning to Placement",
      friends_family: "Going to Friends/Family",
      exploitation: "Possible Exploitation Concern",
      substance: "Substance Misuse Episode",
      mental_health: "Mental Health / Emotional Distress",
      other: "Other",
    };
    return reasons[reason] || reason;
  };

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
    }
    .header {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: white;
      padding: 30px;
      border-radius: 8px;
      margin-bottom: 30px;
      text-align: center;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
    }
    .header p {
      margin: 5px 0;
      opacity: 0.9;
    }
    .alert {
      background: #fef2f2;
      border-left: 4px solid #ef4444;
      padding: 15px;
      margin-bottom: 20px;
      border-radius: 4px;
    }
    .section {
      background: white;
      border: 1px solid #e5e7eb;
      border-radius: 8px;
      padding: 20px;
      margin-bottom: 20px;
    }
    .section h2 {
      color: #f97316;
      margin-top: 0;
      border-bottom: 2px solid #f97316;
      padding-bottom: 10px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 15px;
    }
    .info-item {
      margin-bottom: 10px;
    }
    .info-label {
      font-weight: bold;
      color: #6b7280;
      font-size: 12px;
      text-transform: uppercase;
    }
    .info-value {
      color: #111827;
      font-size: 14px;
    }
    .risk-badge {
      display: inline-block;
      background: #fee2e2;
      color: #991b1b;
      padding: 4px 12px;
      border-radius: 12px;
      font-size: 12px;
      margin: 4px;
    }
    .contact-card {
      background: #f9fafb;
      padding: 15px;
      border-radius: 6px;
      margin-bottom: 10px;
    }
    .episode-card {
      background: #fef3c7;
      border-left: 4px solid #f59e0b;
      padding: 15px;
      margin-bottom: 10px;
      border-radius: 4px;
    }
    .footer {
      text-align: center;
      color: #6b7280;
      font-size: 12px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #e5e7eb;
    }
    @media print {
      body { padding: 0; }
      .section { page-break-inside: avoid; }
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>🚨 MISSING PERSON GRAB PACK</h1>
    <p><strong>${youngPerson.first_name} ${youngPerson.last_name}</strong></p>
    <p>Focus ID: ${youngPerson.focus_id}</p>
    <p>Generated: ${format(new Date(), "PPpp")}</p>
  </div>

  <div class="alert">
    <strong>⚠️ URGENT:</strong> This document contains sensitive information for police and emergency services use only.
    Handle with care and in accordance with data protection regulations.
  </div>

  <div class="section">
    <h2>Young Person Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Full Name</div>
        <div class="info-value">${youngPerson.first_name} ${youngPerson.last_name}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Focus ID</div>
        <div class="info-value">${youngPerson.focus_id}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Date of Birth</div>
        <div class="info-value">${youngPerson.date_of_birth ? format(new Date(youngPerson.date_of_birth), "PPP") : "N/A"} (Age: ${youngPerson.age})</div>
      </div>
      <div class="info-item">
        <div class="info-label">Gender</div>
        <div class="info-value">${youngPerson.gender || "Not specified"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Ethnicity</div>
        <div class="info-value">${youngPerson.ethnicity || "Not specified"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Nationality</div>
        <div class="info-value">${youngPerson.nationality || "Not specified"}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Placement Details</h2>
    <div class="info-grid">
      <div class="info-item">
        <div class="info-label">Placement Address</div>
        <div class="info-value">
          ${youngPerson.placement_address || "N/A"}<br>
          ${youngPerson.placement_road_name || ""}<br>
          ${youngPerson.placement_postcode || ""}
        </div>
      </div>
      <div class="info-item">
        <div class="info-label">Placement Type</div>
        <div class="info-value">${youngPerson.placement_type || "N/A"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Placing Authority</div>
        <div class="info-value">${youngPerson.placing_authority || "N/A"}</div>
      </div>
      <div class="info-item">
        <div class="info-label">Residing Authority</div>
        <div class="info-value">${youngPerson.residing_local_authority || "N/A"}</div>
      </div>
    </div>
  </div>

  <div class="section">
    <h2>Key Contacts</h2>
    ${contacts.length > 0 ? contacts.map(contact => `
      <div class="contact-card">
        <strong>${contact.contact_name}</strong>
        ${contact.is_emergency ? '<span style="color: #dc2626; font-weight: bold;"> (Emergency Contact)</span>' : ""}
        <div style="margin-top: 5px;">
          ${contact.relationship ? `<div><strong>Relationship:</strong> ${contact.relationship}</div>` : ""}
          ${contact.phone ? `<div><strong>Phone:</strong> ${contact.phone}</div>` : ""}
        </div>
      </div>
    `).join("") : "<p>No contacts recorded</p>"}
    
    ${youngPerson.social_worker_name ? `
      <div class="contact-card">
        <strong>Social Worker: ${youngPerson.social_worker_name}</strong>
        <div style="margin-top: 5px;">
          ${youngPerson.social_worker_phone ? `<div><strong>Phone:</strong> ${youngPerson.social_worker_phone}</div>` : ""}
          ${youngPerson.social_worker_email ? `<div><strong>Email:</strong> ${youngPerson.social_worker_email}</div>` : ""}
        </div>
      </div>
    ` : ""}
  </div>

  <div class="section">
    <h2>Health & Vulnerabilities</h2>
    ${youngPerson.medical_conditions && youngPerson.medical_conditions.length > 0 ? `
      <div class="info-item">
        <div class="info-label">Medical Conditions</div>
        <div class="info-value">${youngPerson.medical_conditions.join(", ")}</div>
      </div>
    ` : ""}
    ${youngPerson.mental_health_support ? `
      <div class="info-item">
        <div class="info-label">Mental Health Support</div>
        <div class="info-value">Currently receiving mental health support</div>
      </div>
    ` : ""}
    ${youngPerson.known_risks && youngPerson.known_risks.length > 0 ? `
      <div class="info-item" style="margin-top: 15px;">
        <div class="info-label">Known Risks</div>
        <div>
          ${youngPerson.known_risks.map(risk => `<span class="risk-badge">${risk}</span>`).join("")}
        </div>
      </div>
    ` : ""}
  </div>

  ${recentEpisodes.length > 0 ? `
    <div class="section">
      <h2>Recent Missing Episodes History</h2>
      ${recentEpisodes.map(episode => `
        <div class="episode-card">
          <strong>Case: ${episode.case_id}</strong>
          <div style="margin-top: 8px;">
            <div><strong>Missing From:</strong> ${format(new Date(episode.missing_from), "PPpp")}</div>
            ${episode.returned_at ? `<div><strong>Returned:</strong> ${format(new Date(episode.returned_at), "PPpp")}</div>` : '<div style="color: #dc2626;"><strong>Status:</strong> Still Missing</div>'}
            ${episode.missing_reason ? `<div><strong>Reason:</strong> ${formatReason(episode.missing_reason)}</div>` : ""}
            ${episode.last_known_location ? `<div><strong>Last Known Location:</strong> ${episode.last_known_location}</div>` : ""}
          </div>
        </div>
      `).join("")}
    </div>
  ` : ""}

  <div class="footer">
    <p>This document was generated by NextGen Care Support System</p>
    <p>For police and emergency services use only - Handle in accordance with GDPR and data protection regulations</p>
  </div>
</body>
</html>
  `;
};

export const downloadMissingPersonGrabPack = (
  youngPerson: YoungPersonData,
  contacts: ContactData[],
  recentEpisodes: MissingEpisodeData[]
) => {
  const html = generateMissingPersonGrabPackHTML(youngPerson, contacts, recentEpisodes);
  
  const blob = new Blob([html], { type: "text/html" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `Missing_Person_Grab_Pack_${youngPerson.focus_id}_${format(new Date(), "yyyy-MM-dd")}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
