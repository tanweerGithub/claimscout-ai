import React, { useState } from 'react';
import { Target, Shield, HelpCircle, AlertTriangle, Cpu } from 'lucide-react';

export default function LandscapeMap({ landscapeData }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedWhiteSpace, setSelectedWhiteSpace] = useState(null);

  const handleNodeClick = (node) => {
    setSelectedWhiteSpace(null);
    setSelectedNode(node);
  };

  const handleWhiteSpaceClick = (ws) => {
    setSelectedNode(null);
    setSelectedWhiteSpace(ws);
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

  // Find all links connected to the selected node
  const getConnectedLinks = (nodeId) => {
    if (!nodeId) return [];
    return landscapeData.links.filter(
      link => link.source === nodeId || link.target === nodeId
    );
  };

  const connectedLinks = selectedNode ? getConnectedLinks(selectedNode.id) : [];

  return (
    <div className="landscape-container">
      {/* SVG Interactive Canvas */}
      <div className="map-viewport">
        <svg viewBox="0 0 500 400" className="map-svg">
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

          {/* Draw Links/Edges */}
          {landscapeData.links.map((link, idx) => {
            const sourceNode = landscapeData.nodes.find(n => n.id === link.source);
            const targetNode = landscapeData.nodes.find(n => n.id === link.target);
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
          {landscapeData.whiteSpaces.map((ws) => {
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
          {landscapeData.nodes.map((node) => {
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

      {/* Detail Pane */}
      <div className="landscape-details">
        {selectedNode ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span className={`doc-type-badge ${selectedNode.type}`}>{selectedNode.type}</span>
              <h3 style={{ margin: 0, color: 'var(--text-primary)' }}>{selectedNode.label}</h3>
            </div>
            
            {connectedLinks.length > 0 ? (
              <div style={{ marginTop: '10px' }}>
                <h4 style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '4px' }}>
                  Landscape Relations:
                </h4>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {connectedLinks.map((link, idx) => {
                    const sourceNode = landscapeData.nodes.find(n => n.id === link.source);
                    const targetNode = landscapeData.nodes.find(n => n.id === link.target);
                    const relatedNode = sourceNode.id === selectedNode.id ? targetNode : sourceNode;
                    
                    return (
                      <li key={idx} style={{ fontSize: '12.5px', display: 'flex', gap: '6px' }}>
                        <span className="text-muted">→</span>
                        <span>{relatedNode.label} : </span>
                        <span className={getRelationColorClass(link.type)} style={{ fontWeight: '500' }}>
                          {link.relation}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ) : (
              <p style={{ fontStyle: 'italic', fontSize: '12px' }}>Click other nodes to map overlaps and dependencies.</p>
            )}
          </div>
        ) : selectedWhiteSpace ? (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Cpu size={16} className="text-cyan" />
              <h3 style={{ margin: 0 }}>White Space Opportunity: {selectedWhiteSpace.title}</h3>
            </div>
            <p>{selectedWhiteSpace.description}</p>
          </div>
        ) : (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <Target size={16} className="text-blue" />
              <h3 style={{ margin: 0 }}>Interactive Tech Landscape</h3>
            </div>
            <p>
              Click any node on the graph (Patents in <span className="text-purple" style={{ fontWeight: 600 }}>purple</span>, Competitors in <span className="text-amber" style={{ fontWeight: 600 }}>amber</span>, Core in <span className="text-blue" style={{ fontWeight: 600 }}>blue</span>) to discover overlapping claims, architectural alignment, or select <span className="text-cyan" style={{ fontWeight: 600 }}>GAP</span> regions to view market white spaces.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
