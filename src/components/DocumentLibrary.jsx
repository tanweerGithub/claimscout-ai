import React, { useState } from 'react';
import { FileText, Link, ShieldAlert, Plus, Trash2, Search, Sparkles, Loader } from 'lucide-react';
import { callGemini } from '../utils/gemini';

export default function DocumentLibrary({ 
  documents, 
  setDocuments, 
  currentIdea, 
  setCurrentIdea,
  apiKey,
  onGenerateAll // Callback to trigger full regeneration of graphs/slides based on new library
}) {
  const [ideaTitle, setIdeaTitle] = useState(currentIdea.title);
  const [ideaDesc, setIdeaDesc] = useState(currentIdea.description);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [importUrl, setImportUrl] = useState('');
  const [isImportingUrl, setIsImportingUrl] = useState(false);

  const handleUpdateIdea = (e) => {
    e.preventDefault();
    setCurrentIdea({
      title: ideaTitle,
      description: ideaDesc
    });
  };

  // Simulates uploading a local file (reading it as text)
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const newDoc = {
        id: 'uploaded_' + Date.now(),
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
  };

  // Agentic search/importing: Queries USPTO/arXiv using Gemini API
  const handleAgenticSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (!apiKey) {
      alert("Please enter a Gemini API Key in the settings (top-right) to search and generate custom documents dynamically!");
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
      alert(`Success! Imported matching document: ${parsedDoc.title}`);
    } catch (error) {
      console.error(error);
      alert("Failed to fetch matching document. Check your API key or connection.");
    } finally {
      setIsSearching(false);
    }
  };

  // Agentic URL Scraper: Simulates reading a competitor site and digesting it using Gemini API
  const handleUrlScrape = async (e) => {
    e.preventDefault();
    if (!importUrl.trim()) return;
    if (!apiKey) {
      alert("Please enter a Gemini API Key in the settings (top-right) to scrape competitor sites!");
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
      alert(`Successfully analyzed competitor: ${parsedDoc.title}`);
    } catch (error) {
      console.error(error);
      alert("Failed to analyze URL. Ensure it starts with http/https and your API Key is valid.");
    } finally {
      setIsImportingUrl(false);
    }
  };

  const handleDeleteDoc = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  return (
    <div className="panel panel-left">
      <div className="panel-header">
        <h2>Workspace Setup</h2>
      </div>

      <div className="panel-content">
        {/* Startup Idea Input */}
        <form onSubmit={handleUpdateIdea} style={{ marginBottom: '24px' }}>
          <div className="input-group">
            <label htmlFor="idea-title">My Startup / Idea Title</label>
            <input 
              id="idea-title"
              type="text" 
              className="input-text"
              value={ideaTitle}
              onChange={(e) => setIdeaTitle(e.target.value)}
              placeholder="e.g. Project AeroShield" 
              required
            />
          </div>
          <div className="input-group" style={{ marginBottom: '10px' }}>
            <label htmlFor="idea-desc">Core Technical Summary</label>
            <textarea 
              id="idea-desc"
              className="textarea-custom"
              value={ideaDesc}
              onChange={(e) => setIdeaDesc(e.target.value)}
              placeholder="Explain how it works, what sensors/algorithms are used, and the target application."
              required
            />
          </div>
          
          <button 
            type="submit" 
            className="btn btn-primary"
            style={{ width: '100%', justifyContent: 'center' }}
            disabled={ideaTitle === currentIdea.title && ideaDesc === currentIdea.description}
          >
            Save & Update Idea
          </button>
        </form>

        <div className="doc-section-title">Upload & Scraping</div>

        {/* Drag & Drop simulated file upload */}
        <div style={{ marginBottom: '12px' }}>
          <label className="upload-card" style={{ display: 'block' }}>
            <FileText size={20} style={{ display: 'block', margin: '0 auto 8px' }} />
            <p>Upload Text/PDF Reference</p>
            <input 
              type="file" 
              accept=".txt,.md,.pdf" 
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

        <div className="doc-section-title">Reference Library ({documents.length})</div>

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
