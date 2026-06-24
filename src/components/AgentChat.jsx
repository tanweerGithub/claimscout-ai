import React, { useState, useRef, useEffect } from 'react';
import { Send, Sparkles, AlertTriangle, User, ShieldAlert, Zap, Loader } from 'lucide-react';
import { askAgent } from '../utils/gemini';

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
  const messagesEndRef = useRef(null);

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
      // Prompt user to enter API key if not present, and give a simulated reply
      setTimeout(() => {
        const botMsg = {
          id: 'msg_bot_' + Date.now(),
          sender: 'agent',
          text: `[SYSTEM: DEMO MODE] I see your question! Please add your Gemini API Key in the settings modal (top-right gear icon) to get live, context-aware answers generated from your reference library. Otherwise, I can only run in demo mode.`
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
              <div className="chat-bubble-text">{msg.text}</div>
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
              placeholder={`Ask ${chatPersona === 'copilot' ? 'Co-Pilot' : 'VC Critic'}...`}
              disabled={isLoading}
            />
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
