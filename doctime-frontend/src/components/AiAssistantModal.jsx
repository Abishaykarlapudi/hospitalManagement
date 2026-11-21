import React, { useState } from "react";
import { Bot, Send, Sparkles, BookOpen, AlertCircle, X, ChevronDown, CheckCircle } from "lucide-react";
import aiService from "../services/aiService";

export function AiAssistantModal({ isOpen, onClose, patientContext }) {
  const [activeTab, setActiveTab] = useState("chat"); // 'chat', 'explain', 'prep'
  const [query, setQuery] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: "Hello! I am DocTime's AI Health Assistant powered by Gemini. How can I assist your health and visit preparation today?",
    },
  ]);
  const [loading, setLoading] = useState(false);

  // Term Explainer
  const [termInput, setTermInput] = useState("");
  const [termExplanation, setTermExplanation] = useState(null);
  const [explaining, setExplaining] = useState(false);

  // Appointment prep
  const [prepSpec, setPrepSpec] = useState("General Physician");
  const [prepDate, setPrepDate] = useState(new Date().toISOString().split("T")[0]);
  const [prepOutput, setPrepOutput] = useState(null);
  const [prepping, setPrepping] = useState(false);

  if (!isOpen) return null;

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!query.trim() || loading) return;

    const userMsg = query.trim();
    setMessages((prev) => [...prev, { sender: "user", text: userMsg }]);
    setQuery("");
    setLoading(true);

    try {
      const res = await aiService.chatAssistant(
        userMsg,
        patientContext ? `Name: ${patientContext.pa_name}, Age: ${patientContext.pa_age}` : ""
      );
      setMessages((prev) => [...prev, { sender: "ai", text: res.reply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "I encountered an error connecting to the AI assistant. " + err.message,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleExplain = async (e) => {
    e.preventDefault();
    if (!termInput.trim() || explaining) return;
    setExplaining(true);
    setTermExplanation(null);
    try {
      const res = await aiService.explainTerm(termInput.trim());
      setTermExplanation(res.explanation);
    } catch (err) {
      setTermExplanation("Failed to explain term: " + err.message);
    } finally {
      setExplaining(false);
    }
  };

  const handleGeneratePrep = async (e) => {
    e.preventDefault();
    if (prepping) return;
    setPrepping(true);
    setPrepOutput(null);
    try {
      const res = await aiService.getAppointmentPrep(prepSpec, prepDate, "Morning Consultation");
      setPrepOutput(res.suggestions);
    } catch (err) {
      setPrepOutput("Failed to fetch appointment checklist: " + err.message);
    } finally {
      setPrepping(false);
    }
  };

  return (
    <div className="glass-modal-backdrop" onClick={onClose}>
      <div className="glass-modal-container ai-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="glass-modal-header">
          <div className="ai-header-title">
            <div className="ai-avatar-badge">
              <Bot size={22} color="#06b6d4" />
            </div>
            <div>
              <h3>Smart Patient Assistant</h3>
              <p className="ai-sub-tag">Gemini 1.5 Flash • Spring Boot Backend</p>
            </div>
          </div>
          <button className="glass-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Tab switch */}
        <div className="ai-tabs">
          <button
            className={`ai-tab-btn ${activeTab === "chat" ? "active" : ""}`}
            onClick={() => setActiveTab("chat")}
          >
            <Sparkles size={16} />
            <span>Health Assistant</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === "explain" ? "active" : ""}`}
            onClick={() => setActiveTab("explain")}
          >
            <BookOpen size={16} />
            <span>Medical Term Explainer</span>
          </button>
          <button
            className={`ai-tab-btn ${activeTab === "prep" ? "active" : ""}`}
            onClick={() => setActiveTab("prep")}
          >
            <CheckCircle size={16} />
            <span>Appointment Prep</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="ai-tab-body">
          {activeTab === "chat" && (
            <div className="ai-chat-view">
              <div className="ai-chat-stream">
                {messages.map((m, idx) => (
                  <div key={idx} className={`ai-message-bubble ${m.sender}`}>
                    <div className="bubble-content">{m.text}</div>
                  </div>
                ))}
                {loading && (
                  <div className="ai-message-bubble ai">
                    <div className="bubble-content pulse">Analyzing with Gemini AI...</div>
                  </div>
                )}
              </div>
              <form onSubmit={handleSendMessage} className="ai-chat-input-bar">
                <input
                  type="text"
                  placeholder="Ask a health inquiry, symptom guidance, or lifestyle question..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
                <button type="submit" disabled={loading || !query.trim()} className="ai-send-btn">
                  <Send size={18} />
                </button>
              </form>
            </div>
          )}

          {activeTab === "explain" && (
            <div className="ai-explainer-view">
              <p className="explainer-desc">
                Decode complex medical terms, diagnosis words, or lab tests into plain English.
              </p>
              <form onSubmit={handleExplain} className="term-form">
                <input
                  type="text"
                  placeholder="e.g. Hypertension, Dyspnea, Echocardiogram, HbA1c..."
                  value={termInput}
                  onChange={(e) => setTermInput(e.target.value)}
                />
                <button type="submit" disabled={explaining || !termInput.trim()} className="glass-btn primary">
                  {explaining ? "Explaining..." : "Explain Term"}
                </button>
              </form>

              {termExplanation && (
                <div className="ai-result-box">
                  <h4>Plain Language Explanation:</h4>
                  <div className="markdown-render">{termExplanation}</div>
                </div>
              )}
            </div>
          )}

          {activeTab === "prep" && (
            <div className="ai-prep-view">
              <p className="explainer-desc">
                Get an AI-generated checklist of documents, fasting rules, and questions for your doctor visit.
              </p>
              <form onSubmit={handleGeneratePrep} className="prep-form-grid">
                <div>
                  <label>Specialization</label>
                  <select value={prepSpec} onChange={(e) => setPrepSpec(e.target.value)}>
                    <option value="General Physician">General Physician</option>
                    <option value="Cardiologist">Cardiologist (Heart)</option>
                    <option value="Dermatologist">Dermatologist (Skin)</option>
                    <option value="Neurologist">Neurologist</option>
                    <option value="Pediatrician">Pediatrician (Child)</option>
                    <option value="Orthopedic">Orthopedic (Bones/Joints)</option>
                    <option value="Endocrinologist">Endocrinologist (Diabetes/Thyroid)</option>
                  </select>
                </div>
                <div>
                  <label>Consultation Date</label>
                  <input
                    type="date"
                    value={prepDate}
                    onChange={(e) => setPrepDate(e.target.value)}
                  />
                </div>
                <button type="submit" disabled={prepping} className="glass-btn primary full-width">
                  {prepping ? "Preparing Checklist..." : "Generate AI Preparation Guide"}
                </button>
              </form>

              {prepOutput && (
                <div className="ai-result-box">
                  <h4>Pre-Visit Recommendations:</h4>
                  <div className="markdown-render">{prepOutput}</div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mandatory Safety Notice */}
        <div className="ai-disclaimer-banner">
          <AlertCircle size={14} color="#f59e0b" />
          <span>
            <strong>Medical Notice:</strong> AI does not independently diagnose diseases or prescribe medication.
          </span>
        </div>
      </div>
    </div>
  );
}

export default AiAssistantModal;
