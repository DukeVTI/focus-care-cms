import { format } from "date-fns";

export const generateChronologyPDF = (entries: any[], youngPerson?: any) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Chronology Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          padding: 40px;
          color: #333;
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #ff6b35;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #ff6b35;
          margin: 0;
          font-size: 28px;
        }
        .header p {
          margin: 5px 0;
          color: #666;
        }
        .meta-info {
          background: #f5f5f5;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 30px;
        }
        .entry {
          border-left: 4px solid #ff6b35;
          padding: 20px;
          margin-bottom: 25px;
          background: #fafafa;
          page-break-inside: avoid;
        }
        .entry-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
          border-bottom: 1px solid #ddd;
          padding-bottom: 10px;
        }
        .entry-date {
          font-weight: bold;
          color: #ff6b35;
          font-size: 16px;
        }
        .entry-meta {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 15px;
          font-size: 14px;
        }
        .meta-item {
          display: flex;
          gap: 5px;
        }
        .meta-label {
          font-weight: bold;
          color: #666;
        }
        .summary {
          font-size: 16px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
        }
        .details {
          line-height: 1.6;
          white-space: pre-wrap;
        }
        .tags {
          margin-top: 15px;
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .tag {
          background: #ff6b35;
          color: white;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 12px;
        }
        .badge {
          display: inline-block;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .badge-high { background: #fee; color: #c00; }
        .badge-medium { background: #ffa; color: #660; }
        .badge-low { background: #efe; color: #060; }
        .badge-flagged { background: #ffd700; color: #333; margin-left: 10px; }
        .footer {
          margin-top: 40px;
          text-align: center;
          color: #999;
          font-size: 12px;
          border-top: 1px solid #ddd;
          padding-top: 20px;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>NextGen Care Support</h1>
        <p>Chronology Report</p>
        ${youngPerson ? `<p><strong>${youngPerson.first_name} ${youngPerson.last_name || ''}</strong> (${youngPerson.focus_id || ''})</p>` : ''}
        <p>Generated: ${format(new Date(), "PPP 'at' p")}</p>
      </div>

      ${entries.length === 0 ? '<p>No chronology entries found.</p>' : entries.map(entry => `
        <div class="entry">
          <div class="entry-header">
            <div class="entry-date">
              ${format(new Date(entry.entry_date), "EEEE, MMMM d, yyyy")} at ${entry.entry_time}
            </div>
            ${entry.significance ? `<span class="badge badge-${entry.significance.toLowerCase()}">${entry.significance}</span>` : ''}
            ${entry.flagged_for_report ? '<span class="badge badge-flagged">★ Flagged for Report</span>' : ''}
          </div>

          <div class="entry-meta">
            ${entry.category ? `<div class="meta-item"><span class="meta-label">Category:</span><span>${entry.category}</span></div>` : ''}
            ${entry.entry_type ? `<div class="meta-item"><span class="meta-label">Type:</span><span>${entry.entry_type}</span></div>` : ''}
            ${entry.author_name ? `<div class="meta-item"><span class="meta-label">Author:</span><span>${entry.author_name}</span></div>` : ''}
            ${entry.young_people ? `<div class="meta-item"><span class="meta-label">Young Person:</span><span>${entry.young_people.first_name} ${entry.young_people.last_name || ''}</span></div>` : ''}
          </div>

          ${entry.summary ? `<div class="summary">${entry.summary}</div>` : ''}
          
          <div class="details">${entry.observation || ''}</div>

          ${entry.tags && entry.tags.length > 0 ? `
            <div class="tags">
              ${entry.tags.map((tag: string) => `<span class="tag">${tag}</span>`).join('')}
            </div>
          ` : ''}
        </div>
      `).join('')}

      <div class="footer">
        <p>NextGen Care Support - Confidential Document</p>
        <p>This report contains sensitive information and should be handled accordingly.</p>
      </div>
    </body>
    </html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `chronology-report-${format(new Date(), 'yyyy-MM-dd')}.html`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
