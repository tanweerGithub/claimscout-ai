import React, { useState } from 'react';
import { Target, Shield, HelpCircle, AlertTriangle, Cpu, X, ChevronUp, ChevronDown } from 'lucide-react';

export default function LandscapeMap({ landscapeData }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedWhiteSpace, setSelectedWhiteSpace] = useState(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const handleNodeClick = (node) => {
    setSelectedWhiteSpace(null);
    setSelectedNode(node);
    setIsExpanded(true);
  };

  const handleWhiteSpaceClick = (ws) => {
    setSelectedNode(null);
    setSelectedWhiteSpace(ws);
    setIsExpanded(true);
  };

  const getRelationColorClass = (type) => {
    switch (type) {
      case 'high-risk': return 'text-rose';
      case 'medium-risk': return 'text-amber';
      case 'low-risk': return 'text-emerald';
      case 'competitor': return 'text-blue';
      case 'tech': return 'text-cyan';
      default: return 'text-secondary';
    }
  };

  const safeNodes = Array.isArray(landscapeData?.nodes) ? landscapeData.nodes : [];
  const safeLinks = Array.isArray(landscapeData?.links) ? landscapeData.links : [];
  const safeWhiteSpaces = Array.isArray(landscapeData?.whiteSpaces) ? landscapeData.whiteSpaces : [];

  // Find all links connected to the selected node
  const getConnectedLinks = (nodeId) => {
    if (!nodeId) return [];
    return safeLinks.filter(
      link => link.source === nodeId || link.target === nodeId
    );
  };

  const connectedLinks = selectedNode ? getConnectedLinks(selectedNode.id) : [];

  return (
    <div className="landscape-container">
      {/* SVG Interactive Canvas */}
      <div className="map-viewport">
        <svg viewBox="0 0 800 500" className="map-svg">
          <defs>
            <radialGradient id="coreGradient" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
              <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
            </radialGradient>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Axis Guidelines */}
          <g className="map-axis-lines" opacity="0.25">
            {/* Y Axis line */}
            <line x1="80" y1="40" x2="80" y2="430" stroke="var(--text-secondary)" strokeWidth="1.5" />
            <path d="M76 50 L80 40 L84 50 Z" fill="var(--text-secondary)" />
            
            {/* X Axis line */}
            <line x1="80" y1="430" x2="760" y2="430" stroke="var(--text-secondary)" strokeWidth="1.5" />
            <path d="M750 426 L760 430 L750 434 Z" fill="var(--text-secondary)" />
          </g>

          {/* Axis Labels */}
          <g className="map-axis-labels" pointerEvents="none" style={{ userSelect: 'none' }}>
            {/* X Axis Title */}
            <text 
              x="420" 
              y="450" 
              textAnchor="middle" 
              style={{
                fontSize: '9.5px',
                fontWeight: '600',
                fill: 'var(--text-muted)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
            >
              Technical Focus: Hardware / Architecture (Left) ↔ Software / Algorithm (Right)
            </text>

            {/* Y Axis Title */}
            <text 
              x="52" 
              y="235" 
              textAnchor="middle" 
              style={{
                fontSize: '9.5px',
                fontWeight: '600',
                fill: 'var(--text-muted)',
                letterSpacing: '1px',
                textTransform: 'uppercase'
              }}
              transform="rotate(-90, 52, 235)"
            >
              Market Focus: Consumer / Product (Bottom) ↔ Enterprise / Industrial (Top)
            </text>
          </g>

          {/* Draw Links/Edges */}
          {safeLinks.map((link, idx) => {
            const sourceNode = safeNodes.find(n => n.id === link.source);
            const targetNode = safeNodes.find(n => n.id === link.target);
            if (!sourceNode || !targetNode || 
                typeof sourceNode.x !== 'number' || typeof sourceNode.y !== 'number' ||
                typeof targetNode.x !== 'number' || typeof targetNode.y !== 'number') return null;

            const isSelectedLink = selectedNode && 
              (link.source === selectedNode.id || link.target === selectedNode.id);

            return (
              <line
                key={`link-${idx}`}
                x1={sourceNode.x}
                y1={sourceNode.y}
                x2={targetNode.x}
                y2={targetNode.y}
                className={`map-link ${link.type}`}
                strokeWidth={isSelectedLink ? 2.5 : 1}
                opacity={selectedNode ? (isSelectedLink ? 0.9 : 0.15) : 0.4}
                style={{
                  strokeDasharray: isSelectedLink ? 'none' : '4, 4',
                }}
              />
            );
          })}

          {/* Draw White Space Opportunity Regions */}
          {safeWhiteSpaces.map((ws) => {
            if (!ws || typeof ws.x !== 'number' || typeof ws.y !== 'number') return null;
            const isSelected = selectedWhiteSpace && selectedWhiteSpace.id === ws.id;
            return (
              <g 
                key={ws.id} 
                className="whitespace-indicator"
                transform={`translate(${ws.x}, ${ws.y})`}
                onClick={() => handleWhiteSpaceClick(ws)}
              >
                <circle 
                  r={isSelected ? 32 : 24} 
                  style={{
                    fill: isSelected ? 'rgba(6, 182, 212, 0.2)' : 'rgba(6, 182, 212, 0.06)',
                    stroke: 'var(--accent-cyan)',
                    strokeWidth: isSelected ? 2 : 1.5,
                  }} 
                />
                {/* Text Outline for legibility */}
                <text 
                  dy=".3em" 
                  style={{
                    fontSize: isSelected ? '13px' : '11px',
                    fontWeight: 700,
                    fill: 'none',
                    stroke: '#070a13',
                    strokeWidth: 3,
                    strokeLinejoin: 'round',
                    textAnchor: 'middle',
                    cursor: 'pointer'
                  }}
                >
                  GAP
                </text>
                {/* Main Text */}
                <text 
                  dy=".3em" 
                  style={{
                    fontSize: isSelected ? '13px' : '11px',
                    fontWeight: 700,
                    fill: 'var(--accent-cyan)',
                    textAnchor: 'middle',
                    cursor: 'pointer'
                  }}
                >
                  GAP
                </text>
              </g>
            );
          })}

          {/* Draw Nodes */}
          {safeNodes.map((node) => {
            if (!node || typeof node.x !== 'number' || typeof node.y !== 'number') return null;
            const isSelected = selectedNode && selectedNode.id === node.id;
            const isConnected = selectedNode && (
              node.id === selectedNode.id || 
              connectedLinks.some(l => l.source === node.id || l.target === node.id)
            );
            
            let strokeColor = 'rgba(255,255,255,0.2)';
            let fill = 'rgba(15, 23, 42, 0.6)';
            
            if (node.type === 'core') {
              strokeColor = 'var(--accent-blue)';
              fill = 'url(#coreGradient)';
            } else if (node.type === 'patent') {
              strokeColor = 'var(--accent-purple)';
              fill = '#1e1b4b';
            } else if (node.type === 'competitor') {
              strokeColor = 'var(--accent-amber)';
              fill = '#2d1d05';
            } else if (node.type === 'tech') {
              strokeColor = 'var(--accent-cyan)';
              fill = '#032d30';
            }

            return (
              <g
                key={node.id}
                className={`node ${node.type}`}
                onClick={() => handleNodeClick(node)}
                opacity={selectedNode ? (isConnected ? 1 : 0.25) : 1}
              >
                <circle
                  cx={node.x}
                  cy={node.y}
                  r={node.r}
                  stroke={strokeColor}
                  strokeWidth={isSelected ? 3 : 1.5}
                  fill={fill}
                  filter={isSelected ? 'url(#glow)' : ''}
                  style={{
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                />
                {/* Text Outline/Halo for legibility */}
                <text
                  x={node.x}
                  y={node.y + node.r + 14}
                  className="node-label-shadow"
                  style={{
                    fontSize: isSelected ? '11.5px' : '9.5px',
                    fontWeight: isSelected ? '700' : '500',
                    fill: 'none',
                    stroke: '#070a13',
                    strokeWidth: 4,
                    strokeLinejoin: 'round',
                    textAnchor: 'middle',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {node.label}
                </text>
                {/* Main Text */}
                <text
                  x={node.x}
                  y={node.y + node.r + 14}
                  className="node-label"
                  style={{
                    fontSize: isSelected ? '11.5px' : '9.5px',
                    fontWeight: isSelected ? '700' : '500',
                    fill: isSelected ? 'var(--text-primary)' : 'var(--text-secondary)',
                    textAnchor: 'middle',
                    pointerEvents: 'none',
                    userSelect: 'none'
                  }}
                >
                  {node.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail Pane (Bottom Drawer) */}
      <div 
        className={`landscape-details ${isExpanded ? 'expanded' : ''}`}
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* Drawer Header (Always Visible) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '40px', gap: '20px' }}>
          {/* Left Column: Title / Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }}>
            {selectedNode ? (
              <>
                <span className={`doc-type-badge ${selectedNode.type}`} style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '10.5px' }}>{selectedNode.type}</span>
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '14.5px', textTransform: 'none', fontWeight: '600' }}>{selectedNode.label}</h3>
              </>
            ) : selectedWhiteSpace ? (
              <>
                <Cpu size={16} className="text-cyan" />
                <h3 style={{ margin: 0, color: 'var(--accent-cyan)', fontSize: '14.5px', textTransform: 'none', fontWeight: '600' }}>White Space: {selectedWhiteSpace.title}</h3>
              </>
            ) : (
              <>
                <Target size={15} className="text-blue" />
                <h3 style={{ margin: 0, color: 'var(--text-primary)', fontSize: '13.5px', textTransform: 'none', fontWeight: '600' }}>Interactive Tech Landscape</h3>
              </>
            )}
          </div>

          {/* Center Column: One-line preview summary */}
          <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: '12.5px', color: 'var(--text-secondary)' }}>
            {selectedNode ? (
              connectedLinks.length > 0 
                ? `Maps to ${connectedLinks.length} claim overlaps in the current tech landscape. Click to inspect.`
                : "No claim overlaps mapped."
            ) : selectedWhiteSpace ? (
              selectedWhiteSpace.description
            ) : (
              "Click any patent, competitor, or core node to map overlaps, or select GAP regions."
            )}
          </div>

          {/* Right Column: Expand/Collapse controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
            {(selectedNode || selectedWhiteSpace) && (
              <button 
                onClick={() => {
                  setSelectedNode(null);
                  setSelectedWhiteSpace(null);
                  setIsExpanded(false);
                }} 
                className="btn btn-icon"
                style={{ height: '26px', width: '26px', padding: 0, background: 'rgba(255,255,255,0.05)', border: 'none', cursor: 'pointer' }}
                title="Clear Selection"
              >
                <X size={12} />
              </button>
            )}
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="btn btn-icon"
              style={{ height: '26px', width: '26px', padding: 0, border: 'none', cursor: 'pointer' }}
              title={isExpanded ? "Collapse Details" : "Expand Details"}
            >
              {isExpanded ? <ChevronDown size={14} /> : <ChevronUp size={14} />}
            </button>
          </div>
        </div>

        {/* Drawer Body (Visible when expanded) */}
        {isExpanded && (
          <div 
            style={{ 
              marginTop: '16px', 
              borderTop: '1px solid rgba(255,255,255,0.05)', 
              paddingTop: '16px', 
              overflowY: 'auto',
              flex: 1
            }}
            onClick={(e) => e.stopPropagation()} // Prevent collapse when clicking details content
          >
            {selectedNode ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 2fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Claims & Relation Alignment
                  </h4>
                  {connectedLinks.length > 0 ? (
                    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', paddingLeft: 0, margin: 0 }}>
                      {connectedLinks.map((link, idx) => {
                        const sourceNode = safeNodes.find(n => n.id === link.source);
                        const targetNode = safeNodes.find(n => n.id === link.target);
                        if (!sourceNode || !targetNode) return null;
                        const relatedNode = sourceNode.id === selectedNode.id ? targetNode : sourceNode;
                        
                        return (
                          <li key={idx} style={{ fontSize: '12.5px', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            <span className="text-muted">→</span>
                            <span style={{ fontWeight: '500' }}>{relatedNode.label}</span>
                            <span className="text-muted">:</span>
                            <span className={getRelationColorClass(link.type)} style={{ fontWeight: '600' }}>
                              {link.relation}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  ) : (
                    <p style={{ fontStyle: 'italic', fontSize: '12px', margin: 0, color: 'var(--text-muted)' }}>
                      No direct claim connections mapped.
                    </p>
                  )}
                </div>
                <div>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Claim Details
                  </h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0, color: 'var(--text-secondary)' }}>
                    This patent or entity represents a key node in the technology space. It positions your startup on coordinates 
                    X={selectedNode.x} and Y={selectedNode.y}, overlapping with {connectedLinks.length} mapped entities.
                  </p>
                </div>
              </div>
            ) : selectedWhiteSpace ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 2fr', gap: '24px' }}>
                <div>
                  <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Whitespace Analysis
                  </h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0, color: 'var(--text-secondary)' }}>
                    <strong>Coordinates:</strong> X={selectedWhiteSpace.x}, Y={selectedWhiteSpace.y}<br />
                    This gap marks a distinct technical area that is currently unpopulated by patent filings or active competitors, representing a high-potential market opportunity.
                  </p>
                </div>
                <div>
                  <h4 style={{ fontSize: '11px', color: 'var(--accent-cyan)', textTransform: 'uppercase', marginBottom: '8px', letterSpacing: '0.5px' }}>
                    Opportunity Description
                  </h4>
                  <p style={{ fontSize: '13px', lineHeight: 1.5, margin: 0, color: 'var(--text-primary)' }}>
                    {selectedWhiteSpace.description}
                  </p>
                </div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <h5 style={{ margin: '0 0 6px 0', color: 'var(--accent-blue)', fontSize: '12px', fontWeight: '600' }}>Core Tech (Blue)</h5>
                  <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Represents your core technical solution and internal claim coordinates based on your workspace setup.
                  </p>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 6px 0', color: 'var(--accent-purple)', fontSize: '12px', fontWeight: '600' }}>Patent Landscape (Purple)</h5>
                  <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Shows published patent citations and prior art parsed from your uploaded reference documents.
                  </p>
                </div>
                <div>
                  <h5 style={{ margin: '0 0 6px 0', color: 'var(--accent-amber)', fontSize: '12px', fontWeight: '600' }}>Competitor/Whitespace (Amber/Cyan)</h5>
                  <p style={{ fontSize: '12px', margin: 0, color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    Competitor listings map active prior systems, and GAP nodes mark open product white spaces.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
