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

  return (
    <div className="swot-feasibility-container">
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
  );
}
