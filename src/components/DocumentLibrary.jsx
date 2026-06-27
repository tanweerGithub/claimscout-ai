import React, { useState } from 'react';
import { FileText, Link, ShieldAlert, Plus, Trash2, Search, Sparkles, Loader } from 'lucide-react';
import { callGemini } from '../utils/gemini';

export default function DocumentLibrary({ 
  documents, 
  setDocuments, 
  currentIdea, 
  setCurrentIdea,
  apiKey,
  onGenerateAll, // Callback to trigger full regeneration of graphs/slides based on new library
  showToast
}) {
  const [ideaTitle, setIdeaTitle] = useState(currentIdea.title);
  const [ideaDesc, setIdeaDesc] = useState(currentIdea.description);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);

  const notify = (title, message, type = 'info', diagnostic = null) => {
    if (showToast) {
      showToast({ title, message, type, diagnostic });
    } else {
      alert(`${title}: ${message}`);
    }
  };

  const handleUpdateIdea = (e) => {
    e.preventDefault();
    setCurrentIdea({
      title: ideaTitle,
      description: ideaDesc
    });
  };

  // Simulates uploading local files (reading as text)
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    files.forEach((file, index) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newDoc = {
          id: `uploaded_${Date.now()}_${index}`,
          type: file.name.endsWith('.pdf') ? 'patent' : 'competitor',
          title: file.name.replace(/\.[^/.]+$/, ""),
          author: "Uploaded File",
          year: new Date().getFullYear().toString(),
          summary: event.target.result.slice(0, 150) + "...",
          content: event.target.result
        };
        setDocuments(prev => [...prev, newDoc]);
      };
      reader.readAsText(file);
    });
  };

  // Agentic search/importing: Queries USPTO/arXiv using Gemini API
  const handleAgenticSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!apiKey) {
      notify("API Key Required", "Please enter a Gemini API Key in Settings (top-right) to search and generate custom documents dynamically.", "info");
      return;
    }

    setIsSearching(true);
    try {
      const prompt = `You are a Patent & Research database crawler. The user wants to search and retrieve a highly realistic competitor patent or research paper matching the topic: "${searchQuery}".
      Generate a realistic, detailed document representing an existing competitor patent or publication in this space.
      
      Your output must be a single JSON object matching this structure EXACTLY (no additional text, wrappers or formatting):
      {
        "type": "patent" or "competitor",
        "title": "[Title of the patent/paper, e.g. US-1094827-B1: Dynamic Grid Balancer]",
        "author": "[Inventor or corporate author, e.g. GridSolutions Inc.]",
        "year": "[Year of release between 2018 and 2025]",
        "summary": "[1-2 sentence overview of what the document covers]",
        "content": "[1 paragraph of detailed technical description including specific claims, design specs, or architectural flows that might overlap with the user's technology]"
      }`;

      const contents = [{ role: "user", parts: [{ text: prompt }] }];
      const parsedDoc = await callGemini(apiKey, contents, true);
      
      const newDoc = {
        id: 'agent_' + Date.now(),
        ...parsedDoc
      };

      setDocuments(prev => [...prev, newDoc]);
      setSearchQuery('');
      notify("Import Success", `Successfully imported document: ${parsedDoc.title}`, "success");
    } catch (error) {
      console.error(error);
      let diag = null;
      if (error.message && error.message.includes("Failed to fetch")) {
        diag = "This is typically caused by adblockers (e.g. Brave Shields, uBlock Origin) blocking client-side requests to generativeai.googleapis.com. Try disabling your shields or network firewall.";
      }
      notify("Import Failed", "Failed to fetch matching document. Check your API key or connection.", "error", diag);
    } finally {
      setIsSearching(false);
    }
  };

  // Agentic URL Scraper: Simulates reading a competitor site and digesting it using Gemini API
  const handleUrlScrape = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    if (!apiKey) {
      notify("API Key Required", "Please enter a Gemini API Key in Settings (top-right) to scrape competitor sites.", "info");
      return;
    }

    setIsImportingUrl(true);
    try {
      const prompt = `You are a competitor intelligence agent. The user wants to analyze a competitor website: "${importUrl}".
      Simulate crawling this competitor's product specifications, features, and pricing structure.
      
      Generate a single JSON object representing this competitor's product profile matching this structure EXACTLY:
      {
        "type": "competitor",
        "title": "[Competitor Brand & Product Name, e.g. GridSense Pro]",
        "author": "[Parent Company name, derived from URL]",
        "year": "2024",
        "summary": "[1-2 sentence product pitch and overview]",
        "content": "[Detailed description of their technology stack, key features, pricing estimation, and architectural components, highlighting their strengths and weaknesses]"
      }`;

      const contents = [{ role: "user", parts: [{ text: prompt }] }];
      const parsedDoc = await callGemini(apiKey, contents, true);

      const newDoc = {
        id: 'scraped_' + Date.now(),
        ...parsedDoc
      };

      setDocuments(prev => [...prev, newDoc]);
      setImportUrl('');
      notify("Analysis Success", `Successfully analyzed competitor site: ${parsedDoc.title}`, "success");
    } catch (error) {
      console.error(error);
      let diag = null;
      if (error.message && error.message.includes("Failed to fetch")) {
        diag = "This is typically caused by adblockers (e.g. Brave Shields, uBlock Origin) blocking client-side requests to generativeai.googleapis.com. Try disabling your shields or network firewall.";
      }
      notify("Analysis Failed", "Failed to analyze URL. Ensure it starts with http/https and your API Key is valid.", "error", diag);
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleDeleteDoc = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const hasUnsavedChanges = ideaTitle !== currentIdea.title || ideaDesc !== currentIdea.description;

  return (
    <div className="panel panel-left">
      <div className="panel-header">
        <h2>Workspace Setup</h2>
      </div>

      <div className="panel-content">
        {/* Startup Idea Input */}
        <form onSubmit={handleUpdateIdea} style={{ marginBottom: '24px' }}>
          <div className="input-group">
            <label htmlFor="idea-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Startup / Idea Title</span>
              {ideaTitle !== currentIdea.title && <span className="unsaved-hint">* Unsaved</span>}
            </label>
            <input 
              id="idea-title"
              type="text" 
              className={`input-text ${ideaTitle !== currentIdea.title ? 'unsaved-input' : ''}`}
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              placeholder="e.g. Project AeroShield" 
              required
            />
          </div>
          
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="idea-desc" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>Core Technical Summary</span>
              {ideaDesc !== currentIdea.description && <span className="unsaved-hint">* Unsaved</span>}
            </label>
            <textarea 
              id="idea-desc"
              className={`textarea-custom ${ideaDesc !== currentIdea.description ? 'unsaved-input' : ''}`}
              value={ideaDesc}
              onChange={(e) => setIdeaDesc(e.target.value)}
              placeholder="Explain how it works, what sensors/algorithms are used, and the target application."
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn"
            style={{ 
              width: '100%', 
              justifyContent: 'center',
              background: hasUnsavedChanges ? 'var(--accent-amber)' : 'rgba(255,255,255,0.03)',
              borderColor: hasUnsavedChanges ? 'var(--accent-amber)' : 'rgba(255,255,255,0.08)',
              color: hasUnsavedChanges ? '#070a13' : 'var(--text-muted)',
              fontWeight: hasUnsavedChanges ? '700' : '500',
              cursor: hasUnsavedChanges ? 'pointer' : 'default',
              boxShadow: hasUnsavedChanges ? '0 4px 12px rgba(245, 158, 11, 0.25)' : 'none'
            }}
            disabled={!hasUnsavedChanges}
          >
            {hasUnsavedChanges ? '⚠️ Save Unsaved Changes' : 'Idea Saved & Up to Date'}
          </button>
        </form>

        <div className="doc-section-title">Upload & Scraping</div>

        {/* Drag & Drop simulated file upload */}
        <div style={{ marginBottom: '12px' }}>
          <label className="upload-card" style={{ display: 'block' }}>
            <FileText size={20} style={{ display: 'block', margin: '0 auto 8px' }} />
            <p>Upload Text/PDF Reference(s)</p>
            <input 
              type="file" 
              accept=".txt,.md,.pdf" 
              multiple
              onChange={handleFileUpload} 
              style={{ display: 'none' }} 
            />
          </label>
        </div>

        {/* Competitor URL Input */}
        <form onSubmit={handleUrlScrape} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="url" 
              className="input-text" 
              style={{ margin: 0 }}
              value={importUrl}
              onChange={(e) => setImportUrl(e.target.value)}
              placeholder="Scrape Competitor URL..."
            />
            <button type="submit" className="btn btn-icon" disabled={isImportingUrl}>
              {isImportingUrl ? <Loader size={14} className="loader" /> : <Link size={14} />}
            </button>
          </div>
        </form>

        {/* Dynamic patent/paper agentic lookup */}
        <form onSubmit={handleAgenticSearch} style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', gap: '6px' }}>
            <input 
              type="text" 
              className="input-text" 
              style={{ margin: 0 }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Patents (USPTO/arXiv)..."
            />
            <button type="submit" className="btn btn-icon" disabled={isSearching}>
              {isSearching ? <Loader size={14} className="loader" /> : <Search size={14} />}
            </button>
          </div>
        </form>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '20px 0 10px 0' }}>
          <div className="doc-section-title" style={{ margin: 0 }}>Reference Library ({documents.length})</div>
          {documents.length > 0 && (
            <button 
              type="button"
              className="btn" 
              onClick={() => setDocuments([])}
              style={{ 
                padding: '2px 8px', 
                fontSize: '10.5px', 
                height: 'auto', 
                background: 'none', 
                border: '1px solid rgba(244, 63, 94, 0.3)', 
                color: 'var(--accent-rose)', 
                boxShadow: 'none',
                cursor: 'pointer'
              }}
              title="Remove all documents from workspace"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Document List */}
        <div className="doc-list">
          {documents.map((doc) => (
            <div key={doc.id} className="doc-item">
              <div className="doc-info">
                <FileText size={16} className="text-secondary" style={{ flexShrink: 0 }} />
                <div className="doc-meta">
                  <div className="doc-title" title={doc.title}>{doc.title}</div>
                  <div className="doc-sub">
                    <span className={`doc-type-badge ${doc.type}`}>{doc.type}</span>
                    <span>{doc.year}</span>
                  </div>
                </div>
              </div>
              <button 
                className="doc-delete-btn" 
                onClick={() => handleDeleteDoc(doc.id)}
                title="Remove Document"
              >
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>

        <button 
          className="btn" 
          onClick={onGenerateAll} 
          style={{ 
            marginTop: '24px', 
            width: '100%', 
            justifyContent: 'center',
            background: 'rgba(6, 182, 212, 0.05)',
            borderColor: 'rgba(6, 182, 212, 0.2)',
            color: 'var(--accent-cyan)'
          }}
        >
          <Sparkles size={14} style={{ marginRight: '6px' }} />
          Regenerate Landscape
        </button>
      </div>
    </div>
  );
}
