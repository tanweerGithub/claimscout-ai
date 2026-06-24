import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function RiskEvaluator({ riskData }) {
  const getRiskIcon = (severity) => {
    switch (severity) {
      case 'high':
        return <AlertCircle size={20} className="text-rose" />;
      case 'medium':
        return <AlertTriangle size={20} className="text-amber" />;
      case 'low':
      default:
        return <CheckCircle2 size={20} className="text-emerald" />;
    }
  };

  const getMeterColor = (percent) => {
    if (percent >= 70) return 'var(--accent-rose)';
    if (percent >= 40) return 'var(--accent-amber)';
    return 'var(--accent-emerald)';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={20} className="text-blue" />
          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '600' }}>Patent Claims Compliance & Overlap Assessment</h3>
        </div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
          {riskData.filter(r => r.severity === 'high').length} High Risks • {riskData.filter(r => r.severity === 'medium').length} Medium Risks
        </div>
      </div>

      <div className="risk-grid">
        {riskData.map((risk) => (
          <div key={risk.id} className={`risk-card ${risk.severity}-risk`}>
            
            {/* Header */}
            <div className="risk-card-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {getRiskIcon(risk.severity)}
                <h3 className="text-primary">{risk.documentTitle}</h3>
              </div>
              <span className={`risk-badge ${risk.severity}`}>{risk.overlapStatus}</span>
            </div>

            {/* Overlap progress bar */}
            <div className="overlap-meter-container">
              <span className="overlap-label">Claim Overlap: {risk.overlapPercent}%</span>
              <div className="overlap-track">
                <div 
                  className="overlap-fill" 
                  style={{ 
                    width: `${risk.overlapPercent}%`,
                    background: getMeterColor(risk.overlapPercent)
                  }}
                />
              </div>
            </div>

            {/* Side-by-Side Comparison */}
            <div className="risk-comparison">
              <div className="comparison-box">
                <h4>Patented Claim / Tech Specification</h4>
                <p>{risk.claimText}</p>
              </div>
              <div className="comparison-box">
                <h4>Our Proposed Architecture</h4>
                <p>{risk.ourImplementation}</p>
              </div>
            </div>

            {/* Mitigation / Workaround recommendation */}
            <div className="risk-mitigation">
              <h4>Compliance Workaround Design Strategy</h4>
              <p>{risk.mitigation}</p>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
