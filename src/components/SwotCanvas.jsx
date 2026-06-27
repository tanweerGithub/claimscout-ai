import React from 'react';
import { Shield, Sparkles, HelpCircle, ThumbsUp, ThumbsDown, Eye, AlertTriangle } from 'lucide-react';

export default function SwotCanvas({ swotData }) {
  // Destructure with default empty object to avoid crashes if swotData is null/undefined
  const { strengths = [], weaknesses = [], opportunities = [], threats = [], feasibility = [] } = swotData || {};

  const getMeterColor = (score) => {
    if (score >= 8) return 'var(--accent-emerald)';
    if (score >= 5.5) return 'var(--accent-blue)';
    return 'var(--accent-rose)';
  };

  const handleDownloadSwotPDF = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    // Calculate an overall feasibility average
    const averageScore = feasibility.length > 0 
      ? (feasibility.reduce((sum, item) => sum + item.score, 0) / feasibility.length * 10).toFixed(0)
      : 'N/A';

    const htmlContent = `
      <html>
        <head>
          <title>SWOT & Technical Feasibility Report</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
              color: #111827;
              padding: 40px;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #06b6d4;
              padding-bottom: 12px;
              margin-bottom: 24px;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            .header h1 { font-size: 24px; margin: 0; color: #0f172a; }
            .score-badge {
              background: rgba(6, 182, 212, 0.1);
              border: 1px solid #06b6d4;
              padding: 6px 12px;
              border-radius: 6px;
              font-weight: 700;
              color: #0891b2;
            }
            .grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 20px;
              margin-bottom: 30px;
            }
            .box {
              border: 1px solid #e5e7eb;
              border-radius: 8px;
              padding: 16px;
            }
            .box h3 { margin-top: 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px; }
            .strengths h3 { color: #059669; }
            .weaknesses h3 { color: #dc2626; }
            .opportunities h3 { color: #0284c7; }
            .threats h3 { color: #d97706; }
            ul { padding-left: 20px; margin: 8px 0 0 0; font-size: 13.5px; }
            li { margin: 6px 0; }
            .feasibility-section {
              background: #f8fafc;
              border: 1px solid #e2e8f0;
              border-radius: 8px;
              padding: 20px;
            }
            .feasibility-section h3 { margin-top: 0; font-size: 16px; color: #1e293b; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; }
            .feasibility-row {
              margin: 12px 0;
              font-size: 13.5px;
            }
            .feasibility-title {
              font-weight: 600;
              color: #0f172a;
            }
            .feasibility-score {
              color: #0284c7;
              font-weight: 700;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>SWOT & Technical Feasibility Report</h1>
            <div class="score-badge">Overall Rating: ${averageScore}/100</div>
          </div>
          
          <div class="grid">
            <div class="box strengths">
              <h3>⚡ Strengths</h3>
              <ul>${strengths.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="box weaknesses">
              <h3>⚠️ Weaknesses</h3>
              <ul>${weaknesses.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="box opportunities">
              <h3>🔍 Opportunities</h3>
              <ul>${opportunities.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
            <div class="box threats">
              <h3>🛡️ Threats</h3>
              <ul>${threats.map(item => `<li>${item}</li>`).join('')}</ul>
            </div>
          </div>

          ${feasibility.length > 0 ? `
            <div class="feasibility-section">
              <h3>Technical Feasibility Breakdown</h3>
              ${feasibility.map(item => `
                <div class="feasibility-row">
                  <span class="feasibility-title">${item.category}</span> - 
                  <span class="feasibility-score">${item.score.toFixed(1)}/10</span>
                  <p style="margin: 4px 0 0 0; color: #475569; font-size: 13px;">${item.notes}</p>
                </div>
              `).join('')}
            </div>
          ` : ''}
          <script>
            window.onload = function() {
              window.print();
              setTimeout(function() { window.close(); }, 500);
            };
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button 
          className="btn" 
          onClick={handleDownloadSwotPDF}
          style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', cursor: 'pointer' }}
        >
          Download SWOT PDF
        </button>
      </div>

      <div className="swot-feasibility-container" style={{ flex: 1, minHeight: 0, marginTop: 0 }}>
        {/* SWOT Grid */}
        <div className="swot-grid">
          {/* Strengths */}
          <div className="swot-box s">
            <div className="swot-box-header">
              <ThumbsUp size={16} className="text-emerald" />
              <h3>Strengths</h3>
            </div>
            <ul className="swot-list">
              {strengths.map((str, idx) => (
                <li key={idx}>{str}</li>
              ))}
            </ul>
          </div>

          {/* Weaknesses */}
          <div className="swot-box w">
            <div className="swot-box-header">
              <ThumbsDown size={16} className="text-rose" />
              <h3>Weaknesses</h3>
            </div>
            <ul className="swot-list">
              {weaknesses.map((weak, idx) => (
                <li key={idx}>{weak}</li>
              ))}
            </ul>
          </div>

          {/* Opportunities */}
          <div className="swot-box o">
            <div className="swot-box-header">
              <Eye size={16} className="text-cyan" />
              <h3>Opportunities</h3>
            </div>
            <ul className="swot-list">
              {opportunities.map((opp, idx) => (
                <li key={idx}>{opp}</li>
              ))}
            </ul>
          </div>

          {/* Threats */}
          <div className="swot-box t">
            <div className="swot-box-header">
              <AlertTriangle size={16} className="text-amber" />
              <h3>Threats</h3>
            </div>
            <ul className="swot-list">
              {threats.map((thr, idx) => (
                <li key={idx}>{thr}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Feasibility Check Panel */}
        <div className="feasibility-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <Shield size={16} className="text-cyan" />
            <h3>Feasibility Breakdown</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4 }}>
            Assessments calculate alignment against reference documents, legal claims, and execution complexity.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '10px' }}>
            {feasibility.map((item, idx) => (
              <div key={idx} className="feasibility-score-card">
                <div className="feasibility-score-row">
                  <span className="feasibility-score-title">{item.category}</span>
                  <span className="feasibility-score-val">{item.score.toFixed(1)}/10</span>
                </div>
                <div className="feasibility-track">
                  <div 
                    className="feasibility-fill"
                    style={{
                      width: `${item.score * 10}%`,
                      background: getMeterColor(item.score)
                    }}
                  />
                </div>
                <p className="feasibility-notes">{item.notes}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
