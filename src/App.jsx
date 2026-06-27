import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Sparkles, 
  Map, 
  ShieldAlert, 
  Presentation, 
  BarChart3, 
  Key, 
  HelpCircle,
  RefreshCw,
  X,
  Plus,
  Loader
} from 'lucide-react';
import './App.css';

// Subcomponents
import DocumentLibrary from './components/DocumentLibrary';
import LandscapeMap from './components/LandscapeMap';
import RiskEvaluator from './components/RiskEvaluator';
import PitchGenerator from './components/PitchGenerator';
import SwotCanvas from './components/SwotCanvas';
import AgentChat from './components/AgentChat';
import ErrorBoundary from './components/ErrorBoundary';

// Mock Utilities
import { 
  mockIdea, 
  mockDocuments, 
  mockLandscapeData, 
  mockRiskAssessment, 
  mockSwot, 
  mockSlides 
} from './utils/mockData';

// Local Workspace Simulator
import { 
  simulateLandscape, 
  simulateRisks, 
  simulateSwot, 
  simulateSlides, 
  simulatePrd 
} from './utils/simulator';

// API Utilities
import {
  generateLandscape,
  generateRiskAssessment,
  generateSwotAndFeasibility,
  generatePitchAndPrd
} from './utils/gemini';

const defaultPrd = `# Product Requirement Document (PRD) - Project AeroShield

## 1. Executive Summary
Project AeroShield is an autonomous navigation and collision avoidance payload designed for micro-UAVs operating in GPS-denied, light-restricted, and high-dust environments (such as mine shafts, caves, and collapsed buildings). 

## 2. Product Objectives
- Deliver highly reliable collision avoidance under $150 Bill of Materials (BOM).
- Operate in zero-light conditions without active GPS signals.
- Dodge existing competitor patents (specifically US-1049283-B2 and SkyAvoid Inc.).

## 3. Core Technical Specifications
- Sensor Suite: 1x PMW3901 Optical Flow sensor, 2x VL53L1X Time-of-Flight micro-LiDAR rangefinders.
- Core Processor: STMicroelectronics STM32F4 (ARM Cortex-M4) running at 168MHz.
- Frequency: Obstacle query frequency >= 50Hz.
- Avoidance Radius: 3.5 meters dynamic buffer zone.
- Weight constraint: Payload total weight < 40g including chassis.

## 4. Competitive Workarounds & Compliance
- Bypass US-1049283-B2: Replaces patented radial ultrasonic transceiver arrays with a dual micro-LiDAR configuration fused with active infrared visual odometry.
- Bypass SkyAvoid SA-Pulse: Avoids patented FPGA-based spatial clustering hardware by implementing lightweight software-only clustering algorithms on general-purpose microcontrollers.
`;

function App() {
  // Global States
  const [apiKey, setApiKey] = useState(localStorage.getItem('claimscout_gemini_key') || '');
  const [showSettings, setShowSettings] = useState(!localStorage.getItem('claimscout_gemini_key'));
  const [tempKey, setTempKey] = useState(apiKey);
  
  const [documents, setDocuments] = useState(mockDocuments);
  const [currentIdea, setCurrentIdea] = useState(mockIdea);
  const [activeTab, setActiveTab] = useState('landscape');
  const [chatPersona, setChatPersona] = useState('copilot');

  // Generated Analyses States
  const [landscapeData, setLandscapeData] = useState(mockLandscapeData);
  const [riskData, setRiskData] = useState(mockRiskAssessment);
  const [swotData, setSwotData] = useState(mockSwot);
  const [slides, setSlides] = useState(mockSlides);
  const [prd, setPrd] = useState(defaultPrd);

  // Loading States
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isDataSynced, setIsDataSynced] = useState(true);

  // Toast / Diagnostics Overlay State
  const [toast, setToast] = useState(null); // { title, message, diagnostic, type }

  const handleResetToDemoData = () => {
    setLandscapeData(mockLandscapeData);
    setRiskData(mockRiskAssessment);
    setSwotData(mockSwot);
    setSlides(mockSlides);
    setPrd(defaultPrd);
    setIsDataSynced(true);
  };

  // Chat message logs
  const [messages, setMessages] = useState([
    { 
      id: 'intro', 
      sender: 'agent', 
      text: "Hello! I am ClaimScout Co-Pilot. I've analyzed your reference library for Project AeroShield. We have 2 competitor profiles and 2 patents loaded. How can I help you design your system or bypass competitor claims?" 
    }
  ]);

  // If documents or ideas change, notify user that reports are out of sync and need regeneration
  useEffect(() => {
    // Skip first load
    if (documents === mockDocuments && currentIdea === mockIdea) return;
    setIsDataSynced(false);
  }, [documents, currentIdea]);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('claimscout_gemini_key', tempKey);
    setApiKey(tempKey);
    setShowSettings(false);
  };

  const handleClearKey = () => {
    localStorage.removeItem('claimscout_gemini_key');
    setApiKey('');
    setTempKey('');
  };

  // Perform full agentic refresh across all modules in parallel
  const handleRegenerateAll = async () => {
    setIsRegenerating(true);

    if (!apiKey) {
      // Run local simulated engine with a short delay for realistic AI feel
      setTimeout(() => {
        try {
          const newLandscape = simulateLandscape(documents, currentIdea);
          const newRisks = simulateRisks(documents, currentIdea);
          const newSwot = simulateSwot(documents, currentIdea);
          const newSlides = simulateSlides(documents, currentIdea);
          const newPrd = simulatePrd(documents, currentIdea);

          setLandscapeData(newLandscape);
          setRiskData(newRisks);
          setSwotData(newSwot);
          setSlides(newSlides);
          setPrd(newPrd);
          setIsDataSynced(true);
          
          setMessages(prev => [
            ...prev, 
            {
              id: 'sync_sim_' + Date.now(),
              sender: 'agent',
              text: `[SYSTEM: WORKSPACE REFRESHED (DEMO MODE)] I have re-analyzed your workspace using the local simulation engine. The Tech Landscape graph, SWOT, Risks, Slides, and PRD are successfully updated. Enter a Gemini API Key in Settings for live LLM analysis.`
            }
          ]);
        } catch (e) {
          console.error(e);
          setToast({
            title: "Simulation Failed",
            message: "Local mock simulation failed to execute.",
            type: "error"
          });
        } finally {
          setIsRegenerating(false);
        }
      }, 1200);
      return;
    }
    try {
      // Fetch all reports in parallel
      const [newLandscape, newRisks, newSwot, newPitch] = await Promise.all([
        generateLandscape(apiKey, documents, currentIdea),
        generateRiskAssessment(apiKey, documents, currentIdea),
        generateSwotAndFeasibility(apiKey, documents, currentIdea),
        generatePitchAndPrd(apiKey, documents, currentIdea)
      ]);

      setLandscapeData(newLandscape);
      setRiskData(newRisks);
      setSwotData(newSwot);
      setSlides(newPitch.slides);
      setPrd(newPitch.prd);
      setIsDataSynced(true);
      
      // Notify chat
      setMessages(prev => [
        ...prev, 
        {
          id: 'sync_' + Date.now(),
          sender: 'agent',
          text: `[SYSTEM: WORKSPACE REFRESHED] I have re-analyzed your workspace using the new specifications. The Tech Landscape, Patent Claims analysis, Slides, SWOT, and PRD have been updated successfully. Toggle the VC Critic to review risks.`
        }
      ]);
    } catch (error) {
      console.error(error);
      let errorTitle = "Synthesis Failed";
      let errorMsg = error.message || "An unexpected error occurred.";
      let diagnostic = null;

      if (errorMsg.includes("Failed to fetch")) {
        errorTitle = "Network Connection Refused";
        errorMsg = "The browser failed to fetch from the Google Generative AI API endpoint.";
        diagnostic = "This is typically caused by:\n• Ad-blockers or privacy extensions (e.g. Brave Shields, uBlock Origin) blocking client-side Google API requests.\n• Network connectivity issues or a proxy/firewall blocking Google AI services.\n• Verify if your key is active and formatted correctly.";
      } else if (errorMsg.includes("API key not valid") || errorMsg.includes("403") || errorMsg.includes("API_KEY_INVALID")) {
        errorTitle = "Invalid API Key";
        errorMsg = "The API key provided was rejected by Google Gemini.";
        diagnostic = "Please review your API key in Settings (top-right) and ensure it has access to Gemini 1.5 Flash.";
      } else if (errorMsg.includes("invalid JSON") || errorMsg.includes("JSON formatting")) {
        errorTitle = "AI Formatting Error";
        errorMsg = "Gemini returned JSON that does not match our design schema.";
        diagnostic = "This is a temporary generation glitch. Please try clicking Sync Workspace again.";
      }

      setToast({
        title: errorTitle,
        message: errorMsg,
        diagnostic: diagnostic,
        rawError: error.message || error.toString(),
        type: "error"
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  // Change chat logs when persona changes
  useEffect(() => {
    if (chatPersona === 'griller') {
      setMessages(prev => [
        ...prev,
        {
          id: 'grill_intro_' + Date.now(),
          sender: 'agent',
          text: `[SYSTEM: VC CRITIC ENGAGED] I am ready. I've audited the IP landscape. Let's talk about why your project might fail. Ask me about patent overlaps or competitor advantages, or select a suggestion below.`
        }
      ]);
    } else {
      setMessages(prev => [
        ...prev,
        {
          id: 'copilot_intro_' + Date.now(),
          sender: 'agent',
          text: `[SYSTEM: CO-PILOT ENGAGED] Back to brainstorming mode. Ask me how to bypass specific patent claims, design software clusters, or draft presentation notes.`
        }
      ]);
    }
  }, [chatPersona]);

  return (
    <div id="root">
      {/* Header Panel */}
      <header className="app-header">
        <div className="logo-section">
          <span className="logo-icon">🔭</span>
          <div className="logo-text">
            <h1>ClaimScout AI</h1>
            <span>Patent & Tech Landscape Analyst</span>
          </div>
        </div>

        {/* Sync / Reload status bar */}
        {!isDataSynced && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(245, 158, 11, 0.08)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-amber)', display: 'inline-block' }} />
            <span className="text-amber" style={{ fontWeight: '500' }}>Workspace changes detected.</span>
            <button onClick={handleRegenerateAll} className="btn btn-primary" style={{ padding: '2px 8px', fontSize: '10.5px', height: 'auto', background: 'var(--accent-amber)', boxShadow: 'none' }}>
              Regenerate
            </button>
          </div>
        )}

        <div className="header-controls">
          {apiKey ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(16, 185, 129, 0.08)', border: '1px solid rgba(16, 185, 129, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-emerald)', display: 'inline-block' }} />
              <span className="text-emerald" style={{ fontWeight: '500' }}>Gemini Active</span>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(244, 63, 94, 0.08)', border: '1px solid rgba(244, 63, 94, 0.2)', padding: '6px 12px', borderRadius: '8px', fontSize: '12px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-rose)', display: 'inline-block' }} />
              <span className="text-rose" style={{ fontWeight: '500' }}>Demo Mode (No API Key)</span>
            </div>
          )}

          <button className="btn btn-icon" onClick={() => setShowSettings(true)} title="Settings">
            <Settings size={18} />
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <main className="app-main">
        {/* Left pane: Reference Library */}
        <DocumentLibrary 
          documents={documents}
          setDocuments={setDocuments}
          currentIdea={currentIdea}
          setCurrentIdea={setCurrentIdea}
          apiKey={apiKey}
          onGenerateAll={handleRegenerateAll}
          showToast={setToast}
        />

        {/* Center pane: Canvas with tabs */}
        <div className="panel panel-center">
          <div className="canvas-tabs-header">
            <div className="tabs-list">
              <button 
                className={`tab-btn ${activeTab === 'landscape' ? 'active' : ''}`}
                onClick={() => setActiveTab('landscape')}
              >
                <Map size={14} />
                Landscape Map
              </button>
              <button 
                className={`tab-btn ${activeTab === 'risk' ? 'active' : ''}`}
                onClick={() => setActiveTab('risk')}
              >
                <ShieldAlert size={14} />
                Risk Evaluator
              </button>
              <button 
                className={`tab-btn ${activeTab === 'pitch' ? 'active' : ''}`}
                onClick={() => setActiveTab('pitch')}
              >
                <Presentation size={14} />
                Pitch & PRD
              </button>
              <button 
                className={`tab-btn ${activeTab === 'swot' ? 'active' : ''}`}
                onClick={() => setActiveTab('swot')}
              >
                <BarChart3 size={14} />
                SWOT Canvas
              </button>
            </div>
            
            {apiKey && (
              <button 
                className="btn" 
                style={{ height: '32px', padding: '0 12px', fontSize: '12px' }}
                onClick={handleRegenerateAll}
                disabled={isRegenerating}
              >
                {isRegenerating ? <RefreshCw size={12} className="loader" /> : <RefreshCw size={12} />}
                Sync Workspace
              </button>
            )}
          </div>

          <div className="panel-content" style={{ position: 'relative', padding: 0, display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* Regenerate Loading Overlay */}
            {isRegenerating && (
              <div className="modal-overlay" style={{ position: 'absolute', background: 'rgba(7, 10, 19, 0.7)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                  <Loader size={32} className="loader" style={{ width: '40px', height: '40px' }} />
                  <p style={{ fontWeight: '600', fontSize: '14px' }}>Re-routing Tech Landscape...</p>
                  <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Gemini is crawling claims and mapping opportunity nodes.</p>
                </div>
              </div>
            )}

            {/* Tab Routing */}
            <ErrorBoundary name="Tech Landscape Map" onReset={handleResetToDemoData}>
              {activeTab === 'landscape' && <LandscapeMap landscapeData={landscapeData} />}
            </ErrorBoundary>

            <ErrorBoundary name="Patent Risk Assessment" onReset={handleResetToDemoData}>
              {activeTab === 'risk' && (
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, width: '100%' }}>
                  <RiskEvaluator riskData={riskData} />
                </div>
              )}
            </ErrorBoundary>

            <ErrorBoundary name="Pitch Deck & PRD" onReset={handleResetToDemoData}>
              {activeTab === 'pitch' && (
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <PitchGenerator 
                    slides={slides} 
                    setSlides={setSlides}
                    prd={prd}
                    setPrd={setPrd}
                    documents={documents}
                    currentIdea={currentIdea}
                    apiKey={apiKey}
                    showToast={setToast}
                  />
                </div>
              )}
            </ErrorBoundary>

            <ErrorBoundary name="SWOT Canvas" onReset={handleResetToDemoData}>
              {activeTab === 'swot' && (
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1, width: '100%' }}>
                  <SwotCanvas swotData={swotData} />
                </div>
              )}
            </ErrorBoundary>
          </div>
        </div>

        {/* Right pane: Chat Intelligence */}
        <AgentChat 
          messages={messages}
          setMessages={setMessages}
          documents={documents}
          currentIdea={currentIdea}
          apiKey={apiKey}
          chatPersona={chatPersona}
          setChatPersona={setChatPersona}
        />
      </main>

      {/* Settings Modal (API Key) */}
      {showSettings && (
        <div className="modal-overlay" onClick={() => setShowSettings(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Key size={18} className="text-cyan" />
                <h2>API Settings</h2>
              </div>
              <button className="modal-close" onClick={() => setShowSettings(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveSettings}>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: '16px' }}>
                To enable live AI generations for the tech landscape map, patent risk scoring, SWOT matrix, and chat agents, provide a Google Gemini API Key.
              </p>
              
              <div className="input-group">
                <label>Gemini API Key</label>
                <input 
                  type="password" 
                  className="input-text"
                  value={tempKey}
                  onChange={(e) => setTempKey(e.target.value)}
                  placeholder="Enter AIzaSy..."
                />
              </div>

              <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '20px', lineHeight: 1.4 }}>
                Don't have a key? You can get a free one from{' '}
                <a 
                  href="https://aistudio.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}
                >
                  Google AI Studio
                </a>.
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                  Save API Key
                </button>
                {apiKey && (
                  <button type="button" className="btn" style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }} onClick={handleClearKey}>
                    Clear Key
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Toast Diagnostics Overlay */}
      {toast && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setToast(null)}>
          <div className="modal-content" style={{ maxWidth: '500px', borderLeft: '4px solid var(--accent-rose)' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '20px' }}>⚠️</span>
                <h2 style={{ margin: 0, fontSize: '16px', color: 'var(--text-primary)', fontWeight: '600' }}>{toast.title}</h2>
              </div>
              <button className="modal-close" onClick={() => setToast(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={{ padding: '4px 0 16px 0' }}>
              <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', lineHeight: 1.5, margin: '0 0 12px 0' }}>
                {toast.message}
              </p>
              {toast.diagnostic && (
                <div style={{
                  background: 'rgba(0,0,0,0.2)',
                  border: '1px solid rgba(255, 255, 255, 0.05)',
                  padding: '12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.6,
                  whiteSpace: 'pre-line',
                  marginBottom: toast.rawError ? '12px' : '0'
                }}>
                  <strong style={{ color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Troubleshooting Diagnostics:</strong>
                  {toast.diagnostic}
                </div>
              )}
              {toast.rawError && (
                <details style={{ cursor: 'pointer', outline: 'none' }}>
                  <summary style={{ fontSize: '12px', color: 'var(--accent-cyan)', fontWeight: '600', userSelect: 'none', padding: '2px 0' }}>
                    Show Raw Error Details
                  </summary>
                  <pre style={{
                    marginTop: '8px',
                    padding: '8px 12px',
                    background: 'rgba(0,0,0,0.35)',
                    border: '1px solid rgba(255,255,255,0.05)',
                    borderRadius: '8px',
                    fontSize: '11px',
                    color: 'var(--accent-rose)',
                    textAlign: 'left',
                    overflowX: 'auto',
                    maxWidth: '100%',
                    fontFamily: 'var(--font-mono)',
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-all',
                    maxHeight: '120px',
                    overflowY: 'auto'
                  }}>
                    {toast.rawError}
                  </pre>
                </details>
              )}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setToast(null)}>
                Acknowledge
              </button>
              {apiKey && (
                <button 
                  className="btn" 
                  style={{ borderColor: 'var(--accent-rose)', color: 'var(--accent-rose)' }} 
                  onClick={() => {
                    handleClearKey();
                    setToast(null);
                    // Run simulated regenerate after a short delay
                    setTimeout(() => {
                      handleRegenerateAll();
                    }, 100);
                  }}
                >
                  Clear Key & Use Demo Mode
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
