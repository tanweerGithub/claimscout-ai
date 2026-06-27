import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertTriangle, User, ShieldAlert, Zap, Loader, Mic } from 'lucide-react';
import { askAgent } from '../utils/gemini';
import { formatMarkdown } from '../utils/markdown';

const getMockResponse = (text, persona, currentIdea, documents) => {
  const query = text.toLowerCase();
  const ideaTitle = currentIdea.title || "your project";
  
  if (persona === 'griller') {
    if (query.includes('overlap') || query.includes('us-1049283') || query.includes('patent') || query.includes('doc1') || query.includes('doc2')) {
      return `[DEMO ANSWER: VC CRITIC] Looking at US-1049283-B2 (Ultrasonic Obstacle Avoidance), they claim an array of 8+ transceivers overriding pilot inputs. If ${ideaTitle} ever integrates ultrasonic sensors, you'll hit a direct infringement. For now, you claim micro-LiDAR + optical flow, which is technically safe, but how do you prove your optical flow works in heavy dust? GeoNav struggles there, and they have $10M in funding.`;
    }
    if (query.includes('sensor') || query.includes('bom') || query.includes('hardware') || query.includes('cost')) {
      return `[DEMO ANSWER: VC CRITIC] Your BOM is under $150. That's cheap, but it tells me your reliability is low. SkyAvoid SA-Pulse uses a $3,200 FPGA-accelerated LiDAR. Customers in defense or mining don't care about a $100 price difference if your cheaper sensors fail and crash a $50,000 drone. How does ${ideaTitle} guarantee 99.9% collision avoidance reliability?`;
    }
    if (query.includes('skyavoid') || query.includes('competitor') || query.includes('geonav') || query.includes('doc3') || query.includes('doc4')) {
      return `[DEMO ANSWER: VC CRITIC] SkyAvoid has active CAN bus integrations and solid-state LiDAR. GeoNav has stereo vision visual SLAM. If your system is software-only, what stops them from adding a lightweight software update and wiping out your USP overnight? You need defensive patents, and you don't have any listed in your workspace.`;
    }
    return `[DEMO ANSWER: VC CRITIC] That's a soft answer. I'm looking at your reference library. None of these competitor files (like SkyAvoid or GeoNav) show a software-only edge-AI fusion stack for low-light. But how do you plan to acquire users? If your tech is just 'open-source modules', you have no moat. Convince me otherwise.`;
  } else {
    // Co-pilot
    if (query.includes('workaround') || query.includes('bypass') || query.includes('avoid') || query.includes('infringement')) {
      return `[DEMO ANSWER: CO-PILOT] To bypass US-1049283-B2, we must avoid any threshold-based 'ultrasonic' roll/pitch overrides. Our design is perfect because we rely on LiDAR distance matrices and infrared optical flow. I recommend documenting our software-defined vector field calculation in our PRD to prove our math is distinct from their microcontroller loop.`;
    }
    if (query.includes('design') || query.includes('architecture') || query.includes('sensor') || query.includes('hardware')) {
      return `[DEMO ANSWER: CO-PILOT] For ${ideaTitle}, we should fuse: 1) A low-cost single-point LiDAR pointing forward. 2) A bottom-facing optical flow camera with infrared LED illumination. This lets the drone hold its position in complete darkness or high dust, filling the exact gap in competitor tech (like GeoNav, which fails in dark tunnels).`;
    }
    if (query.includes('pitch') || query.includes('slides') || query.includes('deck') || query.includes('present')) {
      return `[DEMO ANSWER: CO-PILOT] I've generated a 6-slide Pitch Deck for you under the 'Pitch & PRD' tab! Focus your pitch on the $150 Bill of Materials (BOM) advantage and legal safety. Let's make sure the slides clearly demarcate our software advantages over SkyAvoid's custom FPGA hardware.`;
    }
    return `[DEMO ANSWER: CO-PILOT] That's a great engineering vector. For ${ideaTitle}, we can leverage lightweight neural networks running directly on standard ARM microcontrollers. This bypasses expensive FPGAs while keeping our sensor fusion pipeline fast. What aspect of the design should we draft next?`;
  }
};

export default function AgentChat({ 
  messages, 
  setMessages, 
  documents, 
  currentIdea, 
  apiKey,
  chatPersona,
  setChatPersona
}) {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const rec = new SpeechRecognition();
      rec.continuous = false; // Stops listening when user pauses
      rec.interimResults = false;
      rec.lang = 'en-US';

      rec.onstart = () => {
        setIsListening(true);
      };

      rec.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInputText(prev => {
          const space = prev.trim() ? ' ' : '';
          return prev + space + transcript;
        });
      };

      rec.onerror = (event) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      rec.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = rec;
    }
  }, []);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Speech recognition is not supported in this browser. Try Chrome or Safari.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      try {
        recognitionRef.current.start();
      } catch (err) {
        console.error("Recognition start error:", err);
      }
    }
  };

  // Auto-scroll messages list
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSendMessage = async (textToSend) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    // Append user message
    const userMsg = {
      id: 'msg_' + Date.now(),
      sender: 'user',
      text: text
    };
    
    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInputText('');
    setIsLoading(true);

    if (!apiKey) {
      // Respond with a context-aware mock response in Demo Mode
      setTimeout(() => {
        const botMsg = {
          id: 'msg_bot_' + Date.now(),
          sender: 'agent',
          text: getMockResponse(text, chatPersona, currentIdea, documents)
        };
        setMessages(prev => [...prev, botMsg]);
        setIsLoading(false);
      }, 1000);
      return;
    }

    try {
      // Gather chat history (excluding system info messages)
      const chatHistory = [...messages, userMsg].filter(m => !m.text.includes('[SYSTEM:'));
      
      const reply = await askAgent(apiKey, chatHistory, documents, currentIdea, chatPersona);
      
      const botMsg = {
        id: 'msg_bot_' + Date.now(),
        sender: 'agent',
        text: reply
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error) {
      console.error(error);
      const botMsg = {
        id: 'msg_bot_' + Date.now(),
        sender: 'agent',
        text: `Error communicating with Gemini: ${error.message}. Please check your API key or try again.`
      };
      setMessages(prev => [...prev, botMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    handleSendMessage();
  };

  // Dynamically change suggestions based on active persona
  const getSuggestions = () => {
    if (chatPersona === 'griller') {
      return [
        { text: "Where does US-1049283-B2 directly overlap our idea?", label: "Assess US-1049283-B2 Overlap" },
        { text: "Pretend you are a VC. Grill me on our sensor selection.", label: "VC: Grill Sensor BOM" },
        { text: "Audit our tech stack against SkyAvoid's specs.", label: "Audit vs SkyAvoid Corp" }
      ];
    } else {
      return [
        { text: "Help me brainstorm a technical bypass for US-1049283-B2 (Ultrasonic array).", label: "US-1049283-B2 Workaround" },
        { text: "Propose an open-source software stack to replace expensive FPGA boards.", label: "Bypass SkyAvoid's FPGA" },
        { text: "Draft an Executive Summary introduction slide bullet points.", label: "Draft Intro Slide" }
      ];
    }
  };

  return (
    <div className="agent-chat panel-right panel">
      {/* Header with dual toggles */}
      <div className="panel-header" style={{ flexDirection: 'column', gap: '10px', alignItems: 'stretch' }}>
        <h2>Agent Intelligence</h2>
        <div className="chat-persona-tabs">
          <button 
            className={`persona-tab copilot ${chatPersona === 'copilot' ? 'active' : ''}`}
            onClick={() => setChatPersona('copilot')}
          >
            <Zap size={13} />
            Co-Pilot
          </button>
          <button 
            className={`persona-tab griller ${chatPersona === 'griller' ? 'active' : ''}`}
            onClick={() => setChatPersona('griller')}
          >
            <ShieldAlert size={13} />
            VC Critic
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="panel-content" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div className="chat-messages">
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`chat-bubble ${msg.sender} ${msg.sender === 'agent' ? (chatPersona === 'copilot' ? 'copilot-theme' : 'griller-theme') : ''}`}
            >
              <span className="bubble-sender">
                {msg.sender === 'user' ? 'Founder' : (chatPersona === 'copilot' ? 'ClaimScout Co-Pilot' : 'VC Critic')}
              </span>
              <div className="chat-bubble-text">{formatMarkdown(msg.text)}</div>
            </div>
          ))}
          {isLoading && (
            <div className={`chat-bubble agent ${chatPersona === 'copilot' ? 'copilot-theme' : 'griller-theme'}`}>
              <span className="bubble-sender">
                {chatPersona === 'copilot' ? 'ClaimScout Co-Pilot' : 'VC Critic'}
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 0' }}>
                <Loader size={12} className="loader" />
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analyzing references...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input and suggestions */}
        <div style={{ marginTop: '12px' }}>
          <div className="suggested-prompts">
            {getSuggestions().map((suggestion, idx) => (
              <button 
                key={idx} 
                className="suggested-prompt-btn"
                onClick={() => handleSendMessage(suggestion.text)}
                disabled={isLoading}
              >
                {suggestion.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="chat-input-area">
            <input 
              type="text" 
              className="chat-input"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={isListening ? "Listening... Speak now..." : `Ask ${chatPersona === 'copilot' ? 'Co-Pilot' : 'VC Critic'}...`}
              disabled={isLoading}
            />
            
            <button
              type="button"
              onClick={toggleListening}
              className={`chat-mic-btn ${isListening ? 'listening' : ''}`}
              style={{
                background: 'none',
                border: 'none',
                color: isListening ? 'var(--accent-rose)' : 'var(--text-secondary)',
                cursor: 'pointer',
                padding: '6px 8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '2px'
              }}
              title={isListening ? "Stop Listening" : "Voice Input (Dictate)"}
            >
              {isListening ? (
                <div className="pulse-mic" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Mic size={16} />
                  <span className="pulse-ring"></span>
                </div>
              ) : (
                <Mic size={16} />
              )}
            </button>

            <button 
              type="submit" 
              className="chat-send-btn" 
              disabled={isLoading || !inputText.trim()}
            >
              <Send size={15} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
