import React from 'react';

/**
 * Parses double asterisks **bold** in a string and returns React nodes
 */
export function parseBold(text) {
  if (!text) return "";
  const parts = text.split(/\*\*([^*]+)\*\*/g);
  return parts.map((part, i) => {
    // Odd indices represent content inside the ** tags
    if (i % 2 === 1) {
      return <strong key={i} style={{ color: 'var(--text-primary)', fontWeight: '700' }}>{part}</strong>;
    }
    return part;
  });
}

/**
 * Formats a block of text into structured React elements (headers, bullets, paragraphs, bold)
 */
export function formatMarkdown(text) {
  if (!text) return "";
  
  const lines = text.split('\n');
  return lines.map((line, idx) => {
    const cleanLine = line.trim();
    
    // Headings
    if (cleanLine.startsWith('### ')) {
      return (
        <h4 key={idx} style={{ marginTop: '14px', marginBottom: '6px', color: 'var(--text-primary)', fontSize: '14px', fontWeight: '600' }}>
          {parseBold(cleanLine.substring(4))}
        </h4>
      );
    }
    if (cleanLine.startsWith('## ')) {
      return (
        <h3 key={idx} style={{ marginTop: '18px', marginBottom: '8px', color: 'var(--text-primary)', fontSize: '16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '4px' }}>
          {parseBold(cleanLine.substring(3))}
        </h3>
      );
    }
    if (cleanLine.startsWith('# ')) {
      return (
        <h2 key={idx} style={{ marginTop: '22px', marginBottom: '10px', color: 'var(--text-primary)', fontSize: '18px', fontWeight: '700' }}>
          {parseBold(cleanLine.substring(2))}
        </h2>
      );
    }
    
    // Bullets / List Items
    if (cleanLine.startsWith('- ') || cleanLine.startsWith('* ')) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '8px', paddingLeft: '8px', margin: '6px 0', fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-blue)', flexShrink: 0 }}>•</span>
          <span style={{ flex: 1 }}>{parseBold(cleanLine.substring(2))}</span>
        </div>
      );
    }

    // Numbered Lists
    const numberedMatch = cleanLine.match(/^(\d+)\.\s(.*)/);
    if (numberedMatch) {
      return (
        <div key={idx} style={{ display: 'flex', gap: '8px', paddingLeft: '8px', margin: '6px 0', fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
          <span style={{ color: 'var(--accent-cyan)', fontWeight: '600', flexShrink: 0 }}>{numberedMatch[1]}.</span>
          <span style={{ flex: 1 }}>{parseBold(numberedMatch[2])}</span>
        </div>
      );
    }

    if (cleanLine === "") {
      return <div key={idx} style={{ height: '6px' }} />;
    }

    // Default Paragraph line
    return (
      <p key={idx} style={{ margin: '6px 0', fontSize: '13px', lineHeight: 1.5, color: 'var(--text-secondary)' }}>
        {parseBold(line)}
      </p>
    );
  });
}
