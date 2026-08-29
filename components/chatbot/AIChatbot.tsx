'use client';

import { useState, useEffect, useRef } from 'react';
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  Zap,
  RotateCcw,
  Minus,
  Maximize2,
  HelpCircle,
  Car,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Station } from '@/lib/types';
import { ChatStationCard } from './ChatStationCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  stations?: Station[];
  suggestedActions?: string[];
  modelUsed?: string;
  timestamp: string;
}

const INITIAL_SUGGESTIONS = [
  '⚡ Fast DC Chargers (>100kW)',
  '🚗 Where to charge BYD (GB/T)?',
  '🆓 Free Charging in Kigali',
  '☕ 24/7 Charging + Coffee',
  '💰 Charging Tariffs & Rates',
  '🏢 How do I list my station as a host?',
];

export function AIChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      content: `👋 **Hi! I'm ChargeBot**, your Kigali EV Guide. Ask me about charging stations, BYD (GB/T) plugs, ultra-fast DC chargers, or tariffs.`,
      suggestedActions: [
        '⚡ Fast DC Chargers (>100kW)',
        '🚗 Where to charge BYD (GB/T)?',
        '🆓 Free Charging in Kigali',
        '💰 Charging Tariffs & Rates',
      ],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeModel, setActiveModel] = useState<string>('Kigali EV AI');
  const [hasUnreadNotification, setHasUnreadNotification] = useState(true);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom of messages
  useEffect(() => {
    if (isOpen && !isMinimized) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, isMinimized, isLoading]);

  // Focus input when chat opens
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 200);
      setHasUnreadNotification(false);
    }
  }, [isOpen, isMinimized]);

  // Listen for global 'ev:open-chat' event (e.g. from Header or buttons)
  useEffect(() => {
    const handleOpenChat = (e: Event) => {
      const customEvent = e as CustomEvent<{ initialQuery?: string }>;
      setIsOpen(true);
      setIsMinimized(false);
      if (customEvent.detail?.initialQuery) {
        handleSendMessage(customEvent.detail.initialQuery);
      }
    };

    window.addEventListener('ev:open-chat', handleOpenChat);
    return () => window.removeEventListener('ev:open-chat', handleOpenChat);
  }, [messages]);

  const handleSendMessage = async (textToSend?: string) => {
    const userText = (textToSend || input).trim();
    if (!userText || isLoading) return;

    const userMessage: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Build conversation history payload for API
      const apiPayload = newMessages
        .filter((m) => m.id !== 'welcome-1' || m.role === 'user')
        .map((m) => ({
          role: m.role,
          content: m.content,
        }));

      // If user is asking first question after welcome message, include user question
      if (apiPayload.length === 0) {
        apiPayload.push({ role: 'user', content: userText });
      }

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiPayload }),
      });

      const data = await res.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: `bot-${Date.now()}`,
          role: 'assistant',
          content: data.message || 'I have found the relevant information for you.',
          stations: data.stations || [],
          suggestedActions: data.suggestedActions || [],
          modelUsed: data.modelUsed,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };

        if (data.modelUsed) {
          setActiveModel(data.modelUsed);
        }

        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: `err-${Date.now()}`,
        role: 'assistant',
        content: `⚠️ Sorry, I encountered an issue connecting to the AI engine. Please try asking your question again.`,
        suggestedActions: ['⚡ Fast DC Chargers (>100kW)', '🚗 Where to charge BYD (GB/T)?'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        role: 'assistant',
        content: `👋 **Chat refreshed!** Ask me anything about Kigali EV chargers, plug standards (GB/T, CCS2), tariffs, or how to register as a host.`,
        suggestedActions: INITIAL_SUGGESTIONS.slice(0, 4),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
  };

  // Simple Markdown Renderer for bold, lists, headers, links
  const renderFormattedContent = (content: string) => {
    const lines = content.split('\n');

    return (
      <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
        {lines.map((line, idx) => {
          // Headers
          if (line.startsWith('### ')) {
            return (
              <h4 key={idx} className="font-bold text-slate-900 text-sm mt-2 mb-1">
                {formatInline(line.replace('### ', ''))}
              </h4>
            );
          }
          if (line.startsWith('## ')) {
            return (
              <h3 key={idx} className="font-bold text-slate-900 text-sm sm:text-base mt-2.5 mb-1">
                {formatInline(line.replace('## ', ''))}
              </h3>
            );
          }
          if (line.startsWith('* ') || line.startsWith('- ')) {
            return (
              <div key={idx} className="flex items-start gap-1.5 ml-1">
                <span className="text-brand-600 font-bold">•</span>
                <p className="flex-1">{formatInline(line.substring(2))}</p>
              </div>
            );
          }
          if (/^\d+\.\s/.test(line)) {
            const numMatch = line.match(/^(\d+)\.\s(.*)/);
            if (numMatch) {
              return (
                <div key={idx} className="flex items-start gap-1.5 ml-1">
                  <span className="font-bold text-brand-600">{numMatch[1]}.</span>
                  <p className="flex-1">{formatInline(numMatch[2])}</p>
                </div>
              );
            }
          }
          if (line.trim() === '') {
            return <div key={idx} className="h-1" />;
          }
          return <p key={idx}>{formatInline(line)}</p>;
        })}
      </div>
    );
  };

  const formatInline = (text: string) => {
    // Process bold (**text**)
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={i} className="font-bold text-slate-900">
            {part.slice(2, -2)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*')) {
        return (
          <em key={i} className="italic text-slate-700">
            {part.slice(1, -1)}
          </em>
        );
      }
      return part;
    });
  };

  return (
    <>
      {/* Floating Action Button (Bottom Right) */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 z-40 flex items-center gap-3">
          {/* Welcome Floating Bubble */}
          {hasUnreadNotification && (
            <div
              onClick={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              className="hidden sm:flex items-center gap-2 rounded-2xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white shadow-xl hover:bg-slate-800 cursor-pointer border border-slate-700 animate-in fade-in slide-in-from-right-4 duration-300"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
              <span>Ask ChargeBot about Kigali chargers!</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setHasUnreadNotification(false);
                }}
                className="ml-1 rounded p-0.5 text-slate-400 hover:text-white"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          )}

          {/* Main FAB */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(true);
              setIsMinimized(false);
            }}
            className="group relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-brand-600 via-brand-500 to-emerald-400 p-3 text-white shadow-xl shadow-brand-600/30 hover:scale-105 hover:shadow-2xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-brand-500/30"
            aria-label="Open Kigali EV AI Chatbot"
          >
            <Bot className="h-7 w-7 text-white transition-transform group-hover:rotate-6" />
            <span className="absolute -top-1 -right-1 flex h-4 w-4">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-4 w-4 rounded-full bg-emerald-500 border-2 border-white" />
            </span>
          </button>
        </div>
      )}

      {/* Floating Chat Modal Window */}
      {isOpen && (
        <div
          className={`fixed z-40 transition-all duration-200 ${
            isMinimized
              ? 'bottom-5 right-5 w-72 h-14'
              : 'bottom-4 right-4 sm:bottom-6 sm:right-6 w-[calc(100vw-32px)] sm:w-[420px] md:w-[440px] h-[85vh] sm:h-[620px] max-h-[85vh]'
          } flex flex-col rounded-3xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in zoom-in-95 duration-150`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-100 bg-slate-900 px-4 py-3 text-white">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-emerald-400 text-white shadow-sm">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-white tracking-tight">
                    ChargeBot
                  </h3>
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-400/40 px-1.5 py-0.2 text-[9px] font-bold text-emerald-300">
                    AI Online
                  </span>
                </div>
                <p className="text-[10px] text-slate-300">
                  Kigali EV Guide • {activeModel.split(' ')[0]}
                </p>
              </div>
            </div>

            {/* Header Control Buttons */}
            <div className="flex items-center gap-1">
              {!isMinimized && (
                <button
                  type="button"
                  onClick={handleResetChat}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                  title="Reset conversation"
                >
                  <RotateCcw className="h-4 w-4" />
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsMinimized(!isMinimized)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title={isMinimized ? 'Expand' : 'Minimize'}
              >
                {isMinimized ? (
                  <Maximize2 className="h-4 w-4" />
                ) : (
                  <Minus className="h-4 w-4" />
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                title="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Main Body (Hidden when minimized) */}
          {!isMinimized && (
            <>
              {/* Message List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/50">
                {messages.map((msg) => {
                  const isBot = msg.role === 'assistant';

                  return (
                    <div
                      key={msg.id}
                      className={`flex gap-2.5 ${isBot ? 'items-start' : 'items-end justify-end'}`}
                    >
                      {isBot && (
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm mt-0.5">
                          <Zap className="h-3.5 w-3.5 fill-current" />
                        </div>
                      )}

                      <div
                        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
                          isBot
                            ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-sm'
                            : 'bg-slate-900 text-white rounded-br-sm'
                        }`}
                      >
                        {/* Text Content */}
                        {renderFormattedContent(msg.content)}

                        {/* Interactive Station Cards in Response */}
                        {msg.stations && msg.stations.length > 0 && (
                          <div className="mt-3 space-y-2 pt-2 border-t border-slate-100">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                              Matching Stations ({msg.stations.length})
                            </span>
                            {msg.stations.map((st) => (
                              <ChatStationCard key={st.id} station={st} />
                            ))}
                          </div>
                        )}

                        {/* Suggested Follow-up Actions */}
                        {msg.suggestedActions && msg.suggestedActions.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-100/80 flex flex-wrap gap-1.5">
                            {msg.suggestedActions.map((action, aIdx) => (
                              <button
                                key={aIdx}
                                type="button"
                                onClick={() => handleSendMessage(action)}
                                className="rounded-xl bg-slate-100 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-200 border border-slate-200/60 px-2.5 py-1 text-[11px] font-medium text-slate-700 transition-colors"
                              >
                                {action}
                              </button>
                            ))}
                          </div>
                        )}

                        <div
                          className={`mt-1.5 text-[9px] text-right ${
                            isBot ? 'text-slate-400' : 'text-slate-400'
                          }`}
                        >
                          {msg.timestamp}
                        </div>
                      </div>
                    </div>
                  );
                })}

                {/* Loading Indicator */}
                {isLoading && (
                  <div className="flex items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
                      <Zap className="h-3.5 w-3.5 fill-current animate-pulse" />
                    </div>
                    <div className="rounded-2xl rounded-tl-sm bg-white border border-slate-200/80 px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full bg-brand-500 animate-bounce" />
                        <span
                          className="h-2 w-2 rounded-full bg-brand-500 animate-bounce"
                          style={{ animationDelay: '0.15s' }}
                        />
                        <span
                          className="h-2 w-2 rounded-full bg-brand-500 animate-bounce"
                          style={{ animationDelay: '0.3s' }}
                        />
                        <span className="ml-1.5 text-xs text-slate-500 font-medium">
                          ChargeBot is analyzing stations...
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Suggestions Row if only 1 message */}
              {messages.length === 1 && (
                <div className="px-4 py-2 bg-slate-100/80 border-t border-slate-200/60">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center gap-1">
                    <Sparkles className="h-3 w-3 text-brand-600" />
                    <span>Popular Questions</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                    {INITIAL_SUGGESTIONS.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendMessage(suggestion)}
                        className="rounded-xl bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-brand-50 hover:text-brand-700 hover:border-brand-300 transition-all"
                      >
                        {suggestion}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input Area */}
              <div className="border-t border-slate-200 bg-white p-3">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-end gap-2"
                >
                  <div className="relative flex-1">
                    <textarea
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={handleKeyDown}
                      maxLength={500}
                      placeholder="Ask about BYD plugs, fast chargers, tariffs..."
                      rows={1}
                      className="w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 max-h-28"
                    />
                    {input.length > 350 && (
                      <span className="absolute bottom-1 right-2 text-[9px] font-medium text-slate-400">
                        {input.length}/500
                      </span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={!input.trim() || isLoading}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-brand-600 text-white shadow-md hover:bg-brand-700 disabled:opacity-40 disabled:hover:bg-brand-600 transition-all"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>

                <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400 px-1">
                  <span>Press Enter to send</span>
                  <span className="flex items-center gap-1 text-brand-600 font-medium">
                    <Zap className="h-3 w-3" /> EV Guardrails Active
                  </span>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
