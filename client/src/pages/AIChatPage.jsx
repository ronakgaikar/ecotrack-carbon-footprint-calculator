// src/pages/AIChatPage.jsx
// Full-page EcoBot chat interface powered by Google Gemini AI

import { useState, useEffect, useRef } from 'react';
import {
  Leaf,
  Send,
  Trash2,
  Copy,
  Check,
  Loader2,
  MessageSquare,
} from 'lucide-react';
import { chatWithEcoBot } from '../utils/api';

// ─── Sidebar question categories ────────────────────────────────────────────
const QUESTION_CATEGORIES = [
  {
    label: 'Carbon Footprint',
    questions: [
      'What is a carbon footprint?',
      'How is CO₂ measured?',
      'What is my biggest source of emissions?',
      'What is net zero?',
    ],
  },
  {
    label: 'Recycling & Waste',
    questions: [
      'How do I recycle plastic?',
      'What items cannot be recycled?',
      'What is e-waste recycling?',
      'How does recycling reduce emissions?',
    ],
  },
  {
    label: 'Energy Efficiency',
    questions: [
      'How can I reduce my electricity use?',
      'What is renewable energy?',
      'How do solar panels work?',
      'What is phantom standby power?',
    ],
  },
  {
    label: 'Transportation',
    questions: [
      'How do I reduce transport emissions?',
      'Are electric vehicles better?',
      'What is the impact of flying?',
      'How does public transport help?',
    ],
  },
  {
    label: 'Sustainable Goals (SDGs)',
    questions: [
      'What are the 17 UN SDGs?',
      'What is SDG 13 Climate Action?',
      'How can I support SDG 12 Responsible Consumption?',
      'What is SDG 7 Affordable & Clean Energy?',
    ],
  },
  {
    label: 'Circular Economy',
    questions: [
      'What is circular economy?',
      'What is the difference between linear and circular economy?',
      'How can I participate in circular economy?',
      'What is the 4R hierarchy?',
    ],
  },
];

// ─── Initial greeting message ────────────────────────────────────────────────
const INITIAL_MESSAGE = {
  id: 'init-0',
  role: 'bot',
  text: "Hi! I'm EcoBot 🌿 Your sustainability assistant. Ask me anything about carbon footprints, waste management, recycling, circular economy, or the Sustainable Development Goals! Browse topics on the left or type your question below.",
  timestamp: new Date(),
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Typing Indicator ─────────────────────────────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 mb-4">
      <div className="w-8 h-8 rounded-xl bg-[#294B39] flex items-center justify-center flex-shrink-0">
        <Leaf size={16} className="text-[#A4C52A]" />
      </div>
      <div className="bg-white border border-[#e3ded2] rounded-2xl rounded-bl-none px-4 py-3 shadow-xs flex gap-1.5 items-center">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-[#294B39]/50 rounded-full inline-block animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Copy button with feedback ─────────────────────────────────────────────────
function CopyButton({ text }) {
  const [copied, setCopied] = useState(false);
  const handle = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  };

  return (
    <button
      onClick={handle}
      title={copied ? 'Copied!' : 'Copy response'}
      className="p-1 rounded text-[#41404A]/50 hover:text-[#294B39] hover:bg-[#FAF9F6] transition-colors"
    >
      {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Main Page Component ───────────────────────────────────────────────────────
export default function AIChatPage() {
  const [messages, setMessages] = useState([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);
  const [activeCategoryIndex, setActiveCategoryIndex] = useState(0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── Send message ──────────────────────────────────────────────────────────
  const handleSend = async () => {
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: trimmed,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await chatWithEcoBot(trimmed, conversationHistory);

      const botMsg = {
        id: `bot-${Date.now()}`,
        role: 'bot',
        text: response,
        timestamp: new Date(),
      };

      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'bot', text: response },
      ]);

      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          text: "Sorry, I couldn't reach the AI service right now. Please try again in a moment! 🌿",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // ── Keyboard handler ──────────────────────────────────────────────────────
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // ── Suggested question click ──────────────────────────────────────────────
  const handleSuggestion = (question) => {
    setInput(question);
    textareaRef.current?.focus();
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClear = () => {
    setMessages([INITIAL_MESSAGE]);
    setConversationHistory([]);
    setInput('');
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#41404A]">
      {/* Page Header */}
      <div className="bg-[#294B39] text-[#FAF9F6] py-10 px-5 sm:px-8 border-b border-[#294B39]">
        <div className="max-w-6xl mx-auto space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#FAF9F6]/15 flex items-center justify-center">
              <Leaf size={20} className="text-[#A4C52A]" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              EcoBot – Your Sustainability Assistant
            </h1>
          </div>
          <p className="text-[#FAF9F6]/80 text-sm sm:text-base max-w-2xl leading-relaxed">
            Ask EcoBot about carbon footprints, waste management, recycling, circular economy, and Sustainable Development Goals.
          </p>
        </div>
      </div>

      {/* Main Chat Layout */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex gap-6" style={{ height: 'calc(100vh - 200px)', minHeight: '520px' }}>
        
        {/* ── Topic Sidebar ──────────────────────────────────────────────── */}
        <aside className="hidden lg:flex flex-col w-64 shrink-0 gap-3 overflow-y-auto pr-1">
          <h2 className="text-xs font-bold text-[#41404A]/70 uppercase tracking-wider px-1">
            Browse Topics
          </h2>

          <div className="space-y-2.5">
            {QUESTION_CATEGORIES.map((cat, idx) => (
              <div key={cat.label} className="bg-white rounded-2xl border border-[#e3ded2] overflow-hidden shadow-2xs">
                <button
                  onClick={() => setActiveCategoryIndex(activeCategoryIndex === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 bg-[#FAF9F6] hover:bg-[#f3ede1] text-[#294B39] text-xs font-bold transition-colors"
                >
                  <span>{cat.label}</span>
                  <span className="text-sm font-bold">{activeCategoryIndex === idx ? '−' : '+'}</span>
                </button>
                {activeCategoryIndex === idx && (
                  <div className="flex flex-col gap-1 p-2 bg-white border-t border-[#e3ded2]">
                    {cat.questions.map((q) => (
                      <button
                        key={q}
                        onClick={() => handleSuggestion(q)}
                        className="text-left text-xs text-[#41404A] hover:text-[#294B39] hover:bg-[#FAF9F6] rounded-xl px-2.5 py-1.5 transition-colors leading-relaxed"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </aside>

        {/* ── Main Chat Area ─────────────────────────────────────────────── */}
        <div className="flex-1 flex flex-col bg-white rounded-3xl border border-[#e3ded2] shadow-sm overflow-hidden">
          
          {/* Chat Toolbar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-[#e3ded2] bg-[#FAF9F6] shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#41404A]/75">
              <MessageSquare size={14} className="text-[#294B39]" />
              <span>{messages.length - 1} message{messages.length !== 2 ? 's' : ''} in this conversation</span>
            </div>
            <button
              onClick={handleClear}
              className="flex items-center gap-1.5 text-xs text-[#41404A]/60 hover:text-red-600 transition-colors px-2.5 py-1 rounded-xl hover:bg-red-50"
            >
              <Trash2 size={13} />
              Clear Conversation
            </button>
          </div>

          {/* Message Stream */}
          <div className="flex-1 overflow-y-auto px-5 py-5 space-y-2 bg-[#FAF9F6]/40">
            {messages.map((msg) =>
              msg.role === 'user' ? (
                /* User Message */
                <div key={msg.id} className="flex justify-end mb-4">
                  <div className="max-w-[78%]">
                    <div className="bg-[#294B39] text-[#FAF9F6] rounded-2xl rounded-br-none px-5 py-3 text-sm leading-relaxed whitespace-pre-wrap shadow-xs">
                      {msg.text}
                    </div>
                    <p className="text-[11px] text-[#41404A]/60 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                  </div>
                </div>
              ) : (
                /* Bot Message */
                <div key={msg.id} className="flex items-end gap-3 mb-4">
                  <div className="w-8 h-8 rounded-xl bg-[#294B39] flex items-center justify-center shrink-0">
                    <Leaf size={15} className="text-[#A4C52A]" />
                  </div>
                  <div className="max-w-[78%]">
                    <div className="bg-white border border-[#e3ded2] rounded-2xl rounded-bl-none px-5 py-3 text-sm text-[#41404A] leading-relaxed whitespace-pre-wrap shadow-xs">
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <p className="text-[11px] text-[#41404A]/60">{formatTime(msg.timestamp)}</p>
                      <CopyButton text={msg.text} />
                    </div>
                  </div>
                </div>
              )
            )}

            {isLoading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Mobile Topic Chips */}
          <div className="lg:hidden px-4 py-2 flex gap-2 overflow-x-auto shrink-0 bg-[#FAF9F6] border-t border-[#e3ded2]">
            {QUESTION_CATEGORIES.map((cat) => (
              <button
                key={cat.label}
                onClick={() => handleSuggestion(cat.questions[0])}
                className="shrink-0 text-xs px-3 py-1.5 rounded-xl text-[#294B39] font-medium bg-white border border-[#e3ded2] hover:border-[#294B39]"
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Input Area */}
          <div className="p-4 border-t border-[#e3ded2] bg-white shrink-0">
            {input.length > 400 && (
              <p className={`text-xs mb-1 text-right ${input.length >= 500 ? 'text-red-500' : 'text-[#41404A]/60'}`}>
                {input.length}/500
              </p>
            )}
            <div className="flex items-end gap-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value.slice(0, 500))}
                onKeyDown={handleKeyDown}
                placeholder="Ask EcoBot about carbon emissions, waste, recycling, or the circular economy… (Enter to send)"
                rows={2}
                className="flex-1 resize-none rounded-xl border border-[#e3ded2] px-4 py-2.5 text-sm text-[#41404A] focus:outline-none focus:ring-2 focus:ring-[#294B39] focus:border-transparent max-h-36 overflow-y-auto"
                disabled={isLoading}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="w-11 h-11 rounded-xl bg-[#294B39] hover:bg-[#1d3528] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#FAF9F6] transition-colors shrink-0 shadow-xs"
                title="Send"
              >
                {isLoading ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : (
                  <Send size={17} />
                )}
              </button>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
