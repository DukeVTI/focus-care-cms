import { format } from "date-fns";

interface ReportHeader {
  title: string;
  youngPersonName: string;
  focusId: string;
  dateRange: { from: Date; to: Date };
  generatedDate: Date;
}

export const generateReportHTML = (header: ReportHeader, sections: string[]): string => {
  const { title, youngPersonName, focusId, dateRange, generatedDate } = header;
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1a1a1a;
          background: white;
          padding: 40px;
        }
        
        .report-header {
          background: linear-gradient(135deg, #ea580c 0%, #fb923c 100%);
          color: white;
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
        }
        
        .report-header h1 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        
        .report-meta {
          display: flex;
          gap: 30px;
          margin-top: 15px;
          font-size: 14px;
          opacity: 0.95;
        }
        
        .report-meta-item {
          display: flex;
          flex-direction: column;
        }
        
        .report-meta-label {
          font-weight: 600;
          margin-bottom: 3px;
        }
        
        .section {
          margin-bottom: 40px;
          page-break-inside: avoid;
        }
        
        .section-title {
          font-size: 20px;
          color: #ea580c;
          border-bottom: 2px solid #ea580c;
          padding-bottom: 8px;
          margin-bottom: 20px;
        }
        
        .subsection-title {
          font-size: 16px;
          color: #374151;
          margin: 20px 0 10px 0;
          font-weight: 600;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
          margin-bottom: 20px;
        }
        
        .info-item {
          padding: 12px;
          background: #f9fafb;
          border-radius: 6px;
        }
        
        .info-label {
          font-size: 12px;
          color: #6b7280;
          font-weight: 600;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        
        .info-value {
          font-size: 14px;
          color: #1f2937;
        }
        
        .entry-card {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          margin-bottom: 15px;
          background: white;
        }
        
        .entry-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .entry-title {
          font-weight: 600;
          font-size: 15px;
        }
        
        .entry-date {
          color: #6b7280;
          font-size: 13px;
        }
        
        .entry-content {
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
        }
        
        .badge {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          margin-right: 6px;
          margin-bottom: 6px;
        }
        
        .badge-high {
          background: #fee2e2;
          color: #991b1b;
        }
        
        .badge-medium {
          background: #fef3c7;
          color: #92400e;
        }
        
        .badge-low {
          background: #d1fae5;
          color: #065f46;
        }
        
        .badge-default {
          background: #e5e7eb;
          color: #374151;
        }
        
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 15px;
          margin: 20px 0;
        }
        
        .stat-card {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 15px;
          text-align: center;
        }
        
        .stat-value {
          font-size: 24px;
          font-weight: 700;
          color: #ea580c;
          margin-bottom: 5px;
        }
        
        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
        }
        
        th {
          background: #f9fafb;
          padding: 10px;
          text-align: left;
          font-size: 13px;
          color: #374151;
          border-bottom: 2px solid #e5e7eb;
        }
        
        td {
          padding: 10px;
          border-bottom: 1px solid #e5e7eb;
          font-size: 14px;
        }
        
        .footer {
          margin-top: 50px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          text-align: center;
          color: #6b7280;
          font-size: 12px;
        }
        
        @media print {
          body {
            padding: 20px;
          }
          
          .section {
            page-break-inside: avoid;
          }
        }
      </style>
    </head>
    <body>
      <div class="report-header">
        <h1>${title}</h1>
        <div class="report-meta">
          <div class="report-meta-item">
            <span class="report-meta-label">Young Person:</span>
            <span>${youngPersonName}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-label">Focus ID:</span>
            <span>${focusId}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-label">Period:</span>
            <span>${format(dateRange.from, 'dd MMM yyyy')} - ${format(dateRange.to, 'dd MMM yyyy')}</span>
          </div>
          <div class="report-meta-item">
            <span class="report-meta-label">Generated:</span>
            <span>${format(generatedDate, 'dd MMM yyyy HH:mm')}</span>
          </div>
        </div>
      </div>
      
      ${sections.join('\n')}
      
      <div class="footer">
        <p>This report was generated by NextGen Care Support Platform</p>
        <p>© ${new Date().getFullYear()} - Confidential Information</p>
      </div>
    </body>
    </html>
  `;
};

export const downloadHTMLReport = (html: string, filename: string) => {
  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
