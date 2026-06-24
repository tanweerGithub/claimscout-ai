import React, { useState } from 'react';
import { Presentation, FileText, ChevronLeft, ChevronRight, Edit2, Sparkles, Copy, Check, Loader } from 'lucide-react';
import { callGemini } from '../utils/gemini';

export default function PitchGenerator({ 
  slides, 
  setSlides, 
  prd, 
  setPrd, 
  documents, 
  currentIdea, 
  apiKey 
}) {
  const [subTab, setSubTab] = useState('pitch'); // 'pitch' or 'prd'
  const [currentSlideIdx, setCurrentSlideIdx] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);

  // Edit slide form states
  const [slideTitle, setSlideTitle] = useState('');
  const [slideSubtitle, setSlideSubtitle] = useState('');
  const [slideBullets, setSlideBullets] = useState('');

  const currentSlide = slides[currentSlideIdx] || { title: 'No Slides', subtitle: '', bullets: [] };

  const handleStartEdit = () => {
    setSlideTitle(currentSlide.title);
    setSlideSubtitle(currentSlide.subtitle || '');
    setSlideBullets(currentSlide.bullets.join('\n'));
    setIsEditing(true);
  };

  const handleSaveEdit = (e) => {
    e.preventDefault();
    const updatedBullets = slideBullets.split('\n').filter(b => b.trim() !== '');
    
    setSlides(prev => {
      const copy = [...prev];
      copy[currentSlideIdx] = {
        ...copy[currentSlideIdx],
        title: slideTitle,
        subtitle: slideSubtitle,
        bullets: updatedBullets
      };
      return copy;
    });
    setIsEditing(false);
  };

  const handlePrevSlide = () => {
    if (currentSlideIdx > 0) {
      setCurrentSlideIdx(prev => prev - 1);
      setIsEditing(false);
    }
  };

  const handleNextSlide = () => {
    if (currentSlideIdx < slides.length - 1) {
      setCurrentSlideIdx(prev => prev + 1);
      setIsEditing(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(prd);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Agentic compilation of pitch & PRD based on current library
  const handleRegenerate = async () => {
    if (!apiKey) {
      alert("Please enter a Gemini API Key in the settings to generate customized slides!");
      return;
    }
    
    setIsRegenerating(true);
    try {
      const docsContext = documents.map(doc => `Title: ${doc.title}\nContent: ${doc.content}`).join("\n\n");
      const prompt = `Based on the startup idea: "${currentIdea.title} - ${currentIdea.description}" and the references:\n${docsContext}\nGenerate an 7-slide Pitch Deck and a Product Requirement Document (PRD) in JSON. Structure matches exactly:
      {
        "slides": [
          { "id": 1, "title": "Slide Title", "subtitle": "Slide Subtitle", "bullets": ["bullet 1", "bullet 2"] }
        ],
        "prd": "# PRD Title\\n\\n## Section..."
      }`;

      const contents = [{ role: "user", parts: [{ text: prompt }] }];
      const result = await callGemini(apiKey, contents, true);

      setSlides(result.slides);
      setPrd(result.prd);
      setCurrentSlideIdx(0);
      alert("Pitch Deck & PRD successfully compiled from workspace references!");
    } catch (e) {
      console.error(e);
      alert("Failed to compile slides. Try entering a different prompt or check your API key.");
    } finally {
      setIsRegenerating(false);
    }
  };

  // Helper to render markdown headings into simple HTML tags
  const renderPRD = (text) => {
    return text.split('\n').map((line, idx) => {
      if (line.startsWith('# ')) {
        return <h1 key={idx}>{line.replace('# ', '')}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={idx}>{line.replace('## ', '')}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={idx}>{line.replace('### ', '')}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={idx}>{line.replace('- ', '')}</li>;
      }
      if (line.trim() === '') {
        return <div key={idx} style={{ height: '10px' }} />;
      }
      return <p key={idx}>{line}</p>;
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Sub tabs header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.2)', padding: '3px', borderRadius: '8px' }}>
          <button 
            className={`btn ${subTab === 'pitch' ? 'btn-primary' : ''}`}
            onClick={() => setSubTab('pitch')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <Presentation size={14} style={{ marginRight: '6px' }} />
            Pitch Deck
          </button>
          <button 
            className={`btn ${subTab === 'prd' ? 'btn-primary' : ''}`}
            onClick={() => setSubTab('prd')}
            style={{ padding: '6px 12px', fontSize: '12px' }}
          >
            <FileText size={14} style={{ marginRight: '6px' }} />
            PRD Document
          </button>
        </div>

        <div>
          {subTab === 'prd' ? (
            <button className="btn" onClick={handleCopyToClipboard}>
              {isCopied ? <Check size={14} className="text-emerald" /> : <Copy size={14} />}
              {isCopied ? 'Copied!' : 'Copy PRD'}
            </button>
          ) : (
            apiKey && (
              <button className="btn" onClick={handleRegenerate} disabled={isRegenerating}>
                {isRegenerating ? <Loader size={14} className="loader" /> : <Sparkles size={14} />}
                Generate customized Deck & PRD
              </button>
            )
          )}
        </div>
      </div>

      {/* Workspace Area */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {subTab === 'pitch' ? (
          <div className="pitch-container">
            {/* Slide */}
            <div className="slide-deck-viewer">
              <div className="slide-bg-glow" />
              
              <div className="slide-content-grid">
                <div className="slide-left-col">
                  <span className="slide-tag">ClaimScout Deck</span>
                  <h2 className="slide-title">{currentSlide.title}</h2>
                  {currentSlide.subtitle && <p className="slide-subtitle">{currentSlide.subtitle}</p>}
                  <div className="slide-decor-bar" />
                </div>

                <div className="slide-right-col">
                  <div className="slide-bullets">
                    {currentSlide.bullets.map((bullet, idx) => (
                      <div key={idx} className="slide-bullet-item">
                        <ChevronRight size={16} />
                        <p>{bullet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="slide-footer">
                <span className="slide-indicator">Slide {currentSlideIdx + 1} of {slides.length}</span>
                <div className="slide-nav-buttons">
                  <button className="btn btn-icon" onClick={handlePrevSlide} disabled={currentSlideIdx === 0}>
                    <ChevronLeft size={16} />
                  </button>
                  <button className="btn btn-icon" onClick={handleNextSlide} disabled={currentSlideIdx === slides.length - 1}>
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {/* Slide Editor Panel */}
            <div className="slide-editor-panel">
              <h3>Slide Editor</h3>
              {!isEditing ? (
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '14px', lineHeight: 1.4 }}>
                    You can directly edit the content of this slide (Title, Subtitle, and bullet points) to customize your pitch, or regenerate it using AI references.
                  </p>
                  <button className="btn" onClick={handleStartEdit} style={{ width: '100%', justifyContent: 'center' }}>
                    <Edit2 size={13} style={{ marginRight: '6px' }} />
                    Edit Slide Content
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Title</label>
                    <input 
                      type="text" 
                      className="input-text" 
                      value={slideTitle}
                      onChange={(e) => setSlideTitle(e.target.value)}
                      required 
                    />
                  </div>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Subtitle</label>
                    <input 
                      type="text" 
                      className="input-text" 
                      value={slideSubtitle}
                      onChange={(e) => setSlideSubtitle(e.target.value)}
                    />
                  </div>
                  <div className="input-group" style={{ margin: 0 }}>
                    <label>Bullets (one per line)</label>
                    <textarea 
                      className="textarea-custom" 
                      style={{ minHeight: '120px' }}
                      value={slideBullets}
                      onChange={(e) => setSlideBullets(e.target.value)}
                      required
                    />
                  </div>
                  <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                    <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                      Save Changes
                    </button>
                    <button type="button" className="btn" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setIsEditing(false)}>
                      Cancel
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        ) : (
          /* PRD */
          <div className="prd-viewer">
            <div className="prd-content">
              {renderPRD(prd)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
