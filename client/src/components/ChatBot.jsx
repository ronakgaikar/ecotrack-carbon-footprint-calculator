// src/components/ChatBot.jsx
// Floating AI chatbot powered by EcoBot (Google Gemini)

import { useState, useEffect, useRef } from 'react';
import {
  MessageCircle,
  X,
  Send,
  Trash2,
  Leaf,
  Loader2,
} from 'lucide-react';
import { chatWithEcoBot } from '../utils/api';

// ─── Initial greeting ──────────────────────────────────────────────────────
const INITIAL_BOT_MESSAGE = {
  id: 'init-0',
  role: 'bot',
  text: "Hi! I'm EcoBot 🌿 Your sustainability assistant. Ask me anything about carbon footprints, recycling, circular economy, or the Sustainable Development Goals!",
  timestamp: new Date(),
};

// ─── Suggested questions ───────────────────────────────────────────────────
const SUGGESTED_QUESTIONS = [
  'What is a carbon footprint?',
  'How can I reduce my electricity use?',
  'What is circular economy?',
  'How do I recycle plastic?',
  'What are the SDGs?',
  'How does recycling help the environment?',
];

// ─── Helpers ───────────────────────────────────────────────────────────────
const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

// ─── Typing indicator (three bouncing dots) ────────────────────────────────
function TypingIndicator() {
  return (
    <div className="flex items-end gap-2 mb-3">
      <div className="w-7 h-7 rounded-full bg-[#294B39] flex items-center justify-center flex-shrink-0">
        <Leaf size={14} className="text-[#FAF9F6]" />
      </div>
      <div className="bg-[#FAF9F6] border border-[#e3ded2] rounded-2xl rounded-bl-none px-4 py-3 flex gap-1 items-center shadow-xs">
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

// ─── Main component ────────────────────────────────────────────────────────
export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([INITIAL_BOT_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState([]);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isLoading, isOpen]);

  // Focus textarea when chat opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => textareaRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // ── Open / close ──────────────────────────────────────────────────────────
  const handleToggle = () => {
    setIsOpen((prev) => !prev);
  };

  // ── Clear chat ────────────────────────────────────────────────────────────
  const handleClear = () => {
    setMessages([INITIAL_BOT_MESSAGE]);
    setConversationHistory([]);
    setInput('');
  };

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

      // Update conversation history for context
      setConversationHistory((prev) => [
        ...prev,
        { role: 'user', text: trimmed },
        { role: 'bot', text: response },
      ]);

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`,
          role: 'bot',
          text: "Sorry, I couldn't connect right now. Please try again in a moment! 🌿",
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
    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const showSuggestions = messages.length <= 1;

  return (
    <>
      {/* ── Chat Window ───────────────────────────────────────────────────── */}
      <div
        className={`fixed bottom-24 right-6 z-50 flex flex-col
          w-[350px] sm:w-[380px] h-[520px]
          bg-[#FAF9F6] rounded-2xl shadow-xl border border-[#e3ded2]
          transition-all duration-300 ease-in-out origin-bottom-right
          ${isOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}
        aria-hidden={!isOpen}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 bg-[#294B39] rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#FAF9F6]/15 flex items-center justify-center">
              <Leaf size={16} className="text-[#A4C52A]" />
            </div>
            <div>
              <p className="text-[#FAF9F6] font-bold text-sm leading-none">EcoBot</p>
              <p className="text-[#FAF9F6]/70 text-xs mt-0.5">Sustainability Assistant</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={handleClear}
              title="Clear chat"
              className="p-1.5 rounded-lg hover:bg-[#FAF9F6]/15 transition-colors text-[#FAF9F6]/80 hover:text-[#FAF9F6]"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={handleToggle}
              title="Close chat"
              className="p-1.5 rounded-lg hover:bg-[#FAF9F6]/15 transition-colors text-[#FAF9F6]/80 hover:text-[#FAF9F6]"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages area */}
        <div className="flex-1 overflow-y-auto px-4 py-3.5 space-y-1 bg-[#FAF9F6]/60">
          {messages.map((msg) =>
            msg.role === 'user' ? (
              // User message — right aligned, forest green
              <div key={msg.id} className="flex justify-end mb-3">
                <div className="max-w-[82%]">
                  <div className="bg-[#294B39] text-[#FAF9F6] rounded-2xl rounded-br-none px-4 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-xs">
                    {msg.text}
                  </div>
                  <p className="text-[11px] text-[#41404A]/60 mt-1 text-right">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            ) : (
              // Bot message — left aligned, clean off-white card
              <div key={msg.id} className="flex items-end gap-2 mb-3">
                <div className="w-7 h-7 rounded-xl bg-[#294B39] flex items-center justify-center flex-shrink-0">
                  <Leaf size={14} className="text-[#A4C52A]" />
                </div>
                <div className="max-w-[82%]">
                  <div className="bg-white border border-[#e3ded2] rounded-2xl rounded-bl-none px-4 py-2.5 text-sm text-[#41404A] leading-relaxed whitespace-pre-wrap shadow-xs">
                    {msg.text}
                  </div>
                  <p className="text-[11px] text-[#41404A]/60 mt-1">{formatTime(msg.timestamp)}</p>
                </div>
              </div>
            )
          )}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          {/* Scroll anchor */}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggested questions */}
        {showSuggestions && !isLoading && (
          <div className="px-3 pb-2.5 pt-1.5 flex flex-wrap gap-1.5 bg-[#FAF9F6] border-t border-[#e3ded2] flex-shrink-0">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                onClick={() => handleSuggestion(q)}
                className="text-xs bg-white border border-[#e3ded2] text-[#294B39] font-medium rounded-xl px-2.5 py-1 hover:border-[#294B39] hover:bg-[#FAF9F6] transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        )}

        {/* Input row */}
        <div className="px-3 py-2.5 border-t border-[#e3ded2] bg-white rounded-b-2xl flex-shrink-0">
          {input.length > 400 && (
            <p className={`text-xs mb-1 text-right ${input.length >= 500 ? 'text-red-500' : 'text-[#41404A]/60'}`}>
              {input.length}/500
            </p>
          )}
          <div className="flex items-end gap-2">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={handleKeyDown}
              placeholder="Ask EcoBot a question…"
              rows={1}
              className="flex-1 resize-none rounded-xl border border-[#e3ded2] px-3 py-2 text-sm text-[#41404A] focus:outline-none focus:ring-2 focus:ring-[#294B39] focus:border-transparent max-h-28 overflow-y-auto"
              style={{ minHeight: '38px' }}
              disabled={isLoading}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="w-9 h-9 rounded-xl bg-[#294B39] hover:bg-[#1d3528] disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center text-[#FAF9F6] transition-colors flex-shrink-0 shadow-xs"
              title="Send message"
            >
              {isLoading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Send size={15} />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ── Floating Button ────────────────────────────────────────────────── */}
      <button
        onClick={handleToggle}
        aria-label="Open EcoBot chat"
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-md
          flex items-center justify-center text-[#FAF9F6] transition-all duration-300
          ${isOpen ? 'bg-[#41404A] hover:bg-[#294B39]' : 'bg-[#294B39] hover:bg-[#1d3528] hover:scale-105'}`}
      >
        {isOpen ? <X size={22} /> : <MessageCircle size={22} />}
      </button>
    </>
  );
}
