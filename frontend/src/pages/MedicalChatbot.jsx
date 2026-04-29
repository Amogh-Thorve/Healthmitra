import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import ReactMarkdown from 'react-markdown';
import {
  Send,
  Bot,
  User,
  Loader2,
  AlertCircle,
  Info,
  Sparkles,
  ShieldCheck,
  Activity,
  Clock3,
  Database,
  Stethoscope
} from 'lucide-react';

const quickPrompts = [
  'What are early symptoms of diabetes?',
  'How can I reduce high blood pressure naturally?',
  'What should I know before taking ibuprofen?',
  'When is fever considered an emergency?'
];

const MedicalChatbot = () => {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I am your HealthMitra Medical Assistant. You can ask me about symptoms, conditions (like diabetes or hypertension), or medications. How can I help you today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);
  const messagesEndRef = useRef(null);
  const nextMessageIdRef = useRef(2);

  const isReady = status?.status === 'ready';
  const sourceCount = messages.reduce((count, msg) => count + (msg.sources?.length || 0), 0);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const response = await axios.get('http://localhost:8000/api/chatbot/status');
        setStatus(response.data);
      } catch (error) {
        console.error("Error checking chatbot status:", error);
      }
    };
    checkStatus();
  }, []);

  const sendQuestion = async (question) => {
    if (!question.trim() || loading) return;

    const userMessageId = nextMessageIdRef.current++;
    const assistantMessageId = nextMessageIdRef.current++;
    const userMessage = {
      id: userMessageId,
      role: 'user',
      content: question,
      timestamp: new Date().toLocaleTimeString()
    };
    const assistantMessage = {
      id: assistantMessageId,
      role: 'assistant',
      content: '',
      sources: [],
      timestamp: new Date().toLocaleTimeString(),
      isStreaming: true
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/api/chatbot/ask/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify({ question })
      });

      if (!response.ok || !response.body) {
        throw new Error('Streaming request failed.');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let currentEvent = '';
      let streamedText = '';
      let finalSources = [];

      const applyAssistantPatch = (patch) => {
        setMessages(prev => prev.map(msg => (
          msg.id === assistantMessageId ? { ...msg, ...patch } : msg
        )));
      };

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const segments = buffer.split('\n\n');
        buffer = segments.pop() || '';

        for (const segment of segments) {
          const lines = segment.split('\n');
          currentEvent = '';
          let data = '';

          for (const line of lines) {
            if (line.startsWith('event:')) {
              currentEvent = line.slice(6).trim();
            } else if (line.startsWith('data:')) {
              data += line.slice(5).replace(/^\s/, '');
            }
          }

          if (!data) continue;

          const payload = JSON.parse(data);

          if (currentEvent === 'sources') {
            finalSources = payload.sources || [];
            applyAssistantPatch({ sources: finalSources });
          } else if (currentEvent === 'token') {
            streamedText += payload.content || '';
            applyAssistantPatch({ content: streamedText, isStreaming: true });
          } else if (currentEvent === 'done') {
            finalSources = payload.sources || finalSources;
            applyAssistantPatch({
              content: streamedText,
              sources: finalSources,
              isStreaming: false
            });
          } else if (currentEvent === 'error') {
            throw new Error(payload.message || 'Streaming failed.');
          }
        }
      }

      setMessages(prev => prev.map(msg => (
        msg.id === assistantMessageId
          ? {
              ...msg,
              content: streamedText || "I'm sorry, I couldn't generate a response.",
              sources: finalSources,
              isStreaming: false
            }
          : msg
      )));
    } catch (error) {
      const errorMessage = {
        id: nextMessageIdRef.current++,
        role: 'assistant',
        content: "I'm having trouble connecting to my local medical engine. Please make sure the backend is running and Ollama is active.",
        timestamp: new Date().toLocaleTimeString(),
        isError: true
      };
      setMessages(prev => {
        const withoutStreaming = prev.filter(msg => msg.id !== assistantMessageId);
        return [...withoutStreaming, errorMessage];
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    await sendQuestion(input);
  };

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 20,
        maxWidth: 1280,
        margin: '0 auto'
      }}
    >
      <div
        className="glass-card glow-teal animate-in"
        style={{
          padding: 0,
          overflow: 'hidden',
          background: 'linear-gradient(135deg, rgba(6,182,212,0.12), rgba(139,92,246,0.12) 58%, rgba(17,24,39,0.92))'
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.65fr) minmax(300px, 0.95fr)',
            gap: 0
          }}
        >
          <div style={{ padding: '28px 28px 24px', position: 'relative' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '7px 12px',
                borderRadius: 999,
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: '#67e8f9',
                background: 'rgba(6,182,212,0.12)',
                border: '1px solid rgba(103,232,249,0.18)',
                marginBottom: 18
              }}
            >
              <Sparkles size={13} />
              Offline Medical Intelligence
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
              <div
                style={{
                  width: 58,
                  height: 58,
                  borderRadius: 18,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, rgba(6,182,212,0.22), rgba(139,92,246,0.3))',
                  color: '#e0f2fe',
                  boxShadow: '0 0 30px rgba(6,182,212,0.12)',
                  flexShrink: 0
                }}
              >
                <Stethoscope size={28} />
              </div>
              <div>
                <h1 style={{ fontSize: 34, lineHeight: 1.05, fontWeight: 800, marginBottom: 10, color: 'var(--text-primary)' }}>
                  Medical Chatbot
                </h1>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text-secondary)', maxWidth: 680 }}>
                  Ask about symptoms, chronic conditions, medicines, and home-care basics using local AI plus a trusted medical knowledge base. Built for private, low-connectivity clinical support.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                gap: 12,
                marginTop: 22
              }}
            >
              <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#67e8f9', marginBottom: 8 }}>
                  <ShieldCheck size={15} />
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Mode</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {isReady ? 'Knowledge Base Ready' : 'Preparing Local Engine'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  RAG + local model workflow
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#a78bfa', marginBottom: 8 }}>
                  <Activity size={15} />
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Messages</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {messages.length} exchange{messages.length === 1 ? '' : 's'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Ongoing consultation thread
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 16, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#34d399', marginBottom: 8 }}>
                  <Database size={15} />
                  <span style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700 }}>Sources</span>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                  {sourceCount} cited source{sourceCount === 1 ? '' : 's'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
                  Grounded in local documents
                </div>
              </div>
            </div>
          </div>

          <div
            style={{
              padding: 24,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.02))',
              borderLeft: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              flexDirection: 'column',
              gap: 14
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12
              }}
            >
              <div>
                <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 6 }}>
                  System Status
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      background: isReady ? '#22c55e' : '#f59e0b',
                      boxShadow: isReady ? '0 0 16px rgba(34,197,94,0.45)' : '0 0 16px rgba(245,158,11,0.4)'
                    }}
                  />
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>
                    {isReady ? 'Offline RAG Active' : 'Initializing Knowledge Base'}
                  </span>
                </div>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 12px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  color: 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 600
                }}
              >
                <Bot size={14} />
                Llama 3.2 Local
              </div>
            </div>

            <div
              style={{
                padding: 16,
                borderRadius: 18,
                background: 'rgba(0,0,0,0.18)',
                border: '1px solid rgba(255,255,255,0.06)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: '#67e8f9' }}>
                <Clock3 size={15} />
                <span style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>Suggested Topics</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {quickPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setInput(prompt);
                      if (!loading) {
                        requestAnimationFrame(() => {
                          const el = document.getElementById('medical-chat-input');
                          el?.focus();
                        });
                      }
                    }}
                    style={{
                      padding: '9px 12px',
                      borderRadius: 12,
                      border: '1px solid rgba(255,255,255,0.08)',
                      background: 'rgba(255,255,255,0.04)',
                      color: 'var(--text-secondary)',
                      fontSize: 12,
                      lineHeight: 1.4,
                      textAlign: 'left'
                    }}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                padding: 14,
                borderRadius: 16,
                background: 'rgba(245,158,11,0.08)',
                border: '1px solid rgba(245,158,11,0.16)'
              }}
            >
              <AlertCircle size={16} color="#fbbf24" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ fontSize: 12, lineHeight: 1.55, color: '#fde68a' }}>
                For information support only. This assistant does not replace a doctor, diagnosis, emergency evaluation, or medication-specific professional advice.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1fr) 320px',
          gap: 20,
          alignItems: 'start'
        }}
      >
        <div
          className="glass-card"
          style={{
            padding: 0,
            overflow: 'hidden',
            minHeight: 'calc(100vh - 270px)',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div
            style={{
              padding: '18px 22px',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: 16,
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 4 }}>
                Consultation Thread
              </h2>
              <p style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Private local conversation with source-grounded medical answers
              </p>
            </div>
            <div
              style={{
                padding: '8px 12px',
                borderRadius: 999,
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
                color: 'var(--text-secondary)',
                fontSize: 12,
                fontWeight: 600
              }}
            >
              {messages.length} messages
            </div>
          </div>

          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              gap: 18,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0))'
            }}
          >
            {messages.map((msg) => (
              <div key={msg.id} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start' }}>
                <div
                  style={{
                    width: 'min(820px, 100%)',
                    display: 'flex',
                    gap: 12,
                    flexDirection: msg.role === 'user' ? 'row-reverse' : 'row',
                    alignItems: 'flex-start'
                  }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      marginTop: 2,
                      color: msg.role === 'user' ? '#dbeafe' : '#e0f2fe',
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.95), rgba(99,102,241,0.95))'
                        : msg.isError
                          ? 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(245,158,11,0.12))'
                          : 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(139,92,246,0.2))',
                      border: msg.role === 'user'
                        ? '1px solid rgba(147,197,253,0.25)'
                        : msg.isError
                          ? '1px solid rgba(239,68,68,0.2)'
                          : '1px solid rgba(103,232,249,0.16)'
                    }}
                  >
                    {msg.role === 'user' ? <User size={18} /> : <Bot size={18} />}
                  </div>

                  <div
                    style={{
                      flex: 1,
                      padding: '16px 18px',
                      borderRadius: 22,
                      background: msg.role === 'user'
                        ? 'linear-gradient(135deg, rgba(59,130,246,0.16), rgba(99,102,241,0.2))'
                        : msg.isError
                          ? 'linear-gradient(135deg, rgba(127,29,29,0.38), rgba(69,10,10,0.25))'
                          : 'rgba(255,255,255,0.04)',
                      border: msg.role === 'user'
                        ? '1px solid rgba(96,165,250,0.18)'
                        : msg.isError
                          ? '1px solid rgba(248,113,113,0.18)'
                          : '1px solid rgba(255,255,255,0.08)',
                      boxShadow: '0 10px 30px rgba(0,0,0,0.16)'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          letterSpacing: '0.08em',
                          textTransform: 'uppercase',
                          color: msg.role === 'user'
                            ? '#93c5fd'
                            : msg.isError
                              ? '#fca5a5'
                              : '#67e8f9'
                        }}
                      >
                        {msg.role === 'user' ? 'You' : msg.isError ? 'System Alert' : 'HealthMitra Assistant'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        {msg.timestamp}
                      </div>
                    </div>

                    <div
                      style={{
                        color: msg.role === 'user' ? '#eaf2ff' : 'var(--text-secondary)',
                        lineHeight: 1.75,
                        fontSize: 14
                      }}
                    >
                      <div className="prose prose-sm max-w-none prose-invert prose-p:my-2 prose-strong:text-white prose-headings:text-white prose-li:text-inherit prose-code:text-cyan-200">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                      {msg.isStreaming && (
                        <span
                          style={{
                            display: 'inline-block',
                            width: 8,
                            height: 18,
                            marginLeft: 3,
                            borderRadius: 999,
                            background: '#67e8f9',
                            verticalAlign: 'middle',
                            animation: 'pulse 1s ease-in-out infinite'
                          }}
                        />
                      )}
                    </div>

                    {msg.sources && msg.sources.length > 0 && (
                      <div
                        style={{
                          marginTop: 14,
                          paddingTop: 14,
                          borderTop: '1px solid rgba(255,255,255,0.08)'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, color: 'var(--text-muted)' }}>
                          <Info size={13} />
                          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                            Referenced Sources
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                          {msg.sources.map((s, i) => (
                            <span
                              key={i}
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                padding: '7px 10px',
                                borderRadius: 999,
                                background: 'rgba(255,255,255,0.04)',
                                border: '1px solid rgba(255,255,255,0.08)',
                                color: '#cbd5e1',
                                fontSize: 11
                              }}
                            >
                              {s.split(/[\\/]/).pop()}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {loading && !messages.some((msg) => msg.isStreaming) && (
              <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                <div style={{ width: 'min(760px, 100%)', display: 'flex', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 14,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#67e8f9',
                      background: 'linear-gradient(135deg, rgba(6,182,212,0.18), rgba(139,92,246,0.2))',
                      border: '1px solid rgba(103,232,249,0.16)'
                    }}
                  >
                    <Bot size={18} />
                  </div>
                  <div
                    style={{
                      padding: '16px 18px',
                      borderRadius: 22,
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 12,
                      color: 'var(--text-secondary)'
                    }}
                  >
                    <Loader2 size={18} className="animate-spin" color="#67e8f9" />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                        Analyzing your question
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                        Searching local context and composing a grounded answer...
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: 20,
              borderTop: '1px solid rgba(255,255,255,0.08)',
              background: 'rgba(255,255,255,0.02)'
            }}
          >
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              {quickPrompts.slice(0, 3).map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => sendQuestion(prompt)}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,0.08)',
                    background: 'rgba(255,255,255,0.04)',
                    color: 'var(--text-secondary)',
                    fontSize: 12
                  }}
                >
                  {prompt}
                </button>
              ))}
            </div>

            <form onSubmit={handleSend} style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
              <div
                style={{
                  flex: 1,
                  padding: '12px 14px',
                  borderRadius: 18,
                  background: 'rgba(0,0,0,0.22)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.02)'
                }}
              >
                <input
                  id="medical-chat-input"
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Describe symptoms, ask about conditions, or check medicine safety..."
                  disabled={loading}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    outline: 'none',
                    color: 'var(--text-primary)',
                    fontSize: 15
                  }}
                />
                <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                  Keep questions specific for better, source-grounded answers.
                </div>
              </div>

              <button
                type="submit"
                disabled={!input.trim() || loading}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 18,
                  border: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  background: !input.trim() || loading
                    ? 'rgba(255,255,255,0.08)'
                    : 'linear-gradient(135deg, #06b6d4, #6366f1)',
                  boxShadow: !input.trim() || loading ? 'none' : '0 10px 24px rgba(6,182,212,0.25)',
                  cursor: !input.trim() || loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? <Loader2 size={19} className="animate-spin" /> : <Send size={18} />}
              </button>
            </form>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div className="glass-card animate-in" style={{ padding: 20 }}>
            <div style={{ fontSize: 12, textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginBottom: 12 }}>
              Quick Guidance
            </div>
            <div style={{ display: 'grid', gap: 10 }}>
              {[
                'Ask one concern at a time for more precise answers.',
                'Include age, symptoms, duration, and known conditions when relevant.',
                'Use this for guidance, not emergency triage or prescriptions.'
              ].map((tip) => (
                <div
                  key={tip}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 14,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    color: 'var(--text-secondary)',
                    fontSize: 13,
                    lineHeight: 1.6
                  }}
                >
                  {tip}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card animate-in" style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <AlertCircle size={16} color="#fbbf24" />
              <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
                Safety Notice
              </h3>
            </div>
            <p style={{ fontSize: 12, lineHeight: 1.7, color: 'var(--text-secondary)' }}>
              Important: This chatbot provides general information from trusted medical sources. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a physician or another qualified health provider with questions about a medical condition.
            </p>
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.35; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default MedicalChatbot;
