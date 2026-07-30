'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Plus, MessageSquare, Trash2, LogOut, User, Send, Edit2, Check, X, ChevronDown, Sparkles, Bot, Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axios';
import { motion, AnimatePresence } from 'framer-motion';

export default function DashboardPage() {
  const { user, logout } = useAuth();
  const [instances, setInstances] = useState([]);
  const [agents, setAgents] = useState([]);
  const [selectedInstance, setSelectedInstance] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [appLoading, setAppLoading] = useState(true);
  const [selectedAgentId, setSelectedAgentId] = useState('');
  const [editingInstanceId, setEditingInstanceId] = useState(null);
  const [editName, setEditName] = useState('');
  const messagesEndRef = useRef(null);
  const [isModelDropdownOpen, setIsModelDropdownOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchInstances(), fetchAgents()]);
      setAppLoading(false);
    };
    init();
  }, []);

  useEffect(() => {
    if (agents.length > 0 && !selectedAgentId) {
      setSelectedAgentId(agents[0].id || agents[0]._id);
    }
  }, [agents, selectedAgentId]);

  useEffect(() => {
    if (selectedInstance) {
      fetchMessages(selectedInstance.id);
    } else {
      setMessages([]);
    }
  }, [selectedInstance]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [messages]);

  const fetchInstances = async () => {
    try {
      const res = await axiosInstance.get('/instances/all-instances');
      const normalizedData = res.data.map(inst => ({
        ...inst,
        id: inst.id || inst._id
      }));
      setInstances(normalizedData);
    } catch (err) { console.error(err); }
  };

  const deleteInstance = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this chat?')) return;
    try {
      await axiosInstance.delete(`/instances/${id}`);
      fetchInstances();
      if (selectedInstance?.id === id) setSelectedInstance(null);
    } catch (err) {
      console.error('Failed to delete instance', err);
    }
  };

  const updateInstance = async (id, e) => {
    if (e) e.stopPropagation();
    if (!editName.trim()) {
      setEditingInstanceId(null);
      return;
    }
    try {
      await axiosInstance.patch(`/instances/${id}`, { name: editName });
      fetchInstances();
      setEditingInstanceId(null);
      if (selectedInstance?.id === id) {
        setSelectedInstance({ ...selectedInstance, name: editName });
      }
    } catch (err) {
      console.error('Failed to update instance', err);
    }
  };

  const fetchAgents = async () => {
    try {
      const res = await axiosInstance.get('/agen-management/all');
      setAgents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchMessages = async (id) => {
    console.log('message id ' , id);
    if (!id) return;
    try {
      const res = await axiosInstance.get(`/messages/${id}`);

      console.log('agent response ' , res.data )
      // Only update if we have actual messages from server 
      // or if we are not in the middle of a local message transition
      if (res.data && (res.data.length > 0 || messages.length === 0)) {
        setMessages(res.data);
      }
    } catch (err) { 
      // Silently fail polling errors to avoid UI disruption
      console.error('Polling error:', err.message); 
    }
  };

  // Polling for live updates
  useEffect(() => {
    let interval;
    if (selectedInstance?.id) {
      interval = setInterval(() => {
        fetchMessages(selectedInstance.id);
      }, 3000); // Poll every 3 seconds
    }
    return () => clearInterval(interval);
  }, [selectedInstance]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const currentInput = input;
    setInput('');
    setLoading(true);

    try {
      let instanceId = selectedInstance?.id || selectedInstance?._id;
      let agentId = selectedAgentId || selectedInstance?.agentId || agents[0]?.id || agents[0]?._id;

      if (!agentId) {
        throw new Error('No agent selected or available');
      }

      if (!instanceId) {
        // Auto-Naming Logic: First 5 words, max 30 chars
        const words = currentInput.trim().split(/\s+/);
        const namePreview = words.slice(0, 5).join(' ');
        const finalName = namePreview.length > 30 ? namePreview.substring(0, 27) + '...' : namePreview;

        const res = await axiosInstance.post('/instances/create', { 
          name: finalName || `New Chat ${new Date().toLocaleTimeString()}`, 
          agentId 
        });
        instanceId = res.data.id || res.data._id; // Fallback for _id
        const newInstance = { ...res.data, id: instanceId };
        
        // Prevent useEffect from clearing messages right away
        setInstances([newInstance, ...instances]);
        setSelectedInstance(newInstance);
      }

      const userMessage = { 
        role: 'user', 
        content: currentInput, 
        id: 'temp-' + Date.now()
      };
      setMessages(prev => [...prev, userMessage]);

      const formData = new FormData();
      formData.append('role', 'USER');
      formData.append('agentId', agentId);
      formData.append('content', currentInput);
      formData.append('instanceId', instanceId);

      await axiosInstance.post('/messages/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  if (appLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg text-text font-sans selection:bg-primary/30 overflow-hidden">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden"
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside className={`fixed md:relative w-64 h-full bg-black/40 border-r border-white/5 flex flex-col transition-transform duration-500 backdrop-blur-3xl z-50 ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
      }`}>
        <div className="flex md:hidden absolute top-3 right-3 z-50">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
              setIsSidebarOpen(false);
            }}
            aria-label="Close sidebar"
            className="p-3 rounded-full bg-black/30 hover:bg-black/50 transition-colors text-text-muted"
          >
            <X size={20} />
          </button>
        </div>
        <div className="p-5">
          <button 
            className="w-full flex items-center gap-3 px-4 py-3 bg-white/[0.03] border border-white/[0.08] rounded-xl hover:bg-white/[0.06] hover:scale-[1.02] active:scale-[0.98] transition-all group"
            onClick={() => setSelectedInstance(null)}
          >
            <Plus size={18} className="text-primary group-hover:rotate-90 transition-transform duration-300" /> 
            <span className="text-xs font-semibold uppercase tracking-wider">New Chat</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 space-y-1.5 custom-scrollbar">
          {instances.map((instance) => (
            <div
              key={instance.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-300 group relative ${
                selectedInstance?.id === instance.id ? 'bg-white/[0.06] shadow-sm' : 'hover:bg-white/[0.03]'
              }`}
              onClick={() => {
                setSelectedInstance(instance);
                setIsSidebarOpen(false);
              }}
            >
              <MessageSquare size={16} className={selectedInstance?.id === instance.id ? 'text-primary' : 'text-text-muted'} />
              
              {editingInstanceId === instance.id ? (
                <div className="flex-1 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                  <input 
                    className="flex-1 bg-white/10 border border-white/10 rounded-lg px-2 py-1 text-sm outline-none focus:border-primary/50"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') updateInstance(instance.id);
                      if (e.key === 'Escape') setEditingInstanceId(null);
                    }}
                  />
                </div>
              ) : (
                <>
                  <span className={`flex-1 text-sm truncate ${selectedInstance?.id === instance.id ? 'font-medium text-white' : 'text-text-muted'}`}>
                    {instance.name}
                  </span>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingInstanceId(instance.id);
                        setEditName(instance.name);
                      }}
                      className="p-1 hover:text-primary transition-colors"
                    >
                      <Edit2 size={13} />
                    </button>
                    <button 
                      onClick={(e) => deleteInstance(instance.id, e)}
                      className="p-1 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </>
              )}
              {selectedInstance?.id === instance.id && (
                <motion.div layoutId="sidebar-active" className="absolute left-0 w-1 h-4 bg-primary rounded-r-full" />
              )}
            </div>
          ))}
        </div>

        {editingInstanceId && (
          <div className="absolute bottom-20 left-3 right-3 p-3 bg-black/80 border border-white/10 rounded-xl backdrop-blur-md flex gap-2 z-50">
            <button
              type="button"
              onClick={() => updateInstance(editingInstanceId)}
              className="flex-1 px-3 py-2 bg-primary text-black rounded-lg text-xs font-semibold hover:bg-primary/90 transition-colors"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setEditingInstanceId(null)}
              className="flex-1 px-3 py-2 bg-white/10 text-text-muted rounded-lg text-xs hover:bg-white/20 transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        <div className="p-5 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold shadow-inner ring-1 ring-primary/20">
              {user?.name?.charAt(0)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-none mb-1">{user?.name}</p>
              <p className="text-[10px] text-text-muted truncate uppercase tracking-tighter opacity-70">{user?.email}</p>
            </div>
            <button onClick={logout} className="p-2 text-text-muted hover:text-red-400 transition-colors">
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col bg-bg relative min-w-0">
        <header className="h-16 flex items-center px-4 md:px-8 border-b border-white/[0.04] bg-bg/40 backdrop-blur-xl sticky top-0 z-10 justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 -ml-2 text-text-muted hover:text-white md:hidden"
            >
              <Menu size={20} />
            </button>
            <div className="flex flex-col">
              <h2 className="text-sm font-bold text-white tracking-tight">
                {selectedInstance ? selectedInstance.name : 'New Session'}
              </h2>
              <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-medium opacity-50">
                Jaysea Intelligence
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-[10px] font-bold text-primary uppercase tracking-widest leading-none">AI Live</span>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-10">
          <div className="max-w-2xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.length === 0 ? (
                <motion.div 
                  key="hero-section"
                  initial={{ opacity: 0, y: 20 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  exit={{ opacity: 0, y: -20 }}
                  className="flex-1 flex flex-col items-center justify-center text-center py-10 md:py-20 relative"
                >
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 md:w-64 h-48 md:h-64 bg-primary/5 rounded-full blur-[100px] animate-pulse -z-10" />
                  
                  <motion.div 
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    className="w-20 h-20 md:w-24 md:h-24 glass-card flex items-center justify-center mb-6 md:mb-10 relative group cursor-default"
                  >
                    <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    <Bot size={44} className="relative text-primary transition-transform duration-500" />
                  </motion.div>
                  
                  <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-none antialiased px-4">
                    How can I <span className="text-primary">help?</span>
                  </h1>
                  
                  <p className="text-text-muted text-sm md:text-lg font-light max-w-lg leading-relaxed opacity-80 uppercase tracking-[0.2em] text-[11px] md:text-[13px] px-6">
                    Access the Jaysea Neural Engine <br className="hidden md:block" />
                    for high-level reasoning and creative logic.
                  </p>
                </motion.div>
              ) : (
                <div key="messages-list" className="space-y-8">
                  {messages.map((msg, idx) => {
                    const isUser = msg.role?.toLowerCase() === 'user';
                    
                    // Simple Markdown Formatter
                    const renderMarkdown = (text) => {
                      if (!text) return null;
                      const blocks = text.split('\n');
                      return blocks.map((block, i) => {
                        if (!block.trim()) return <div key={i} className="h-2" />;
                        
                        // Handle Bolding **text** or __text__
                        let formatted = block
                          .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                          .replace(/__(.*?)__/g, '<b>$1</b>');
                        
                        // Handle Italics *text* or _text_
                        formatted = formatted
                          .replace(/\*(.*?)\*/g, '<i>$1</i>')
                          .replace(/_(.*?)_/g, '<i>$1</i>');
                        
                        // Handle Inline Code `text`
                        formatted = formatted.replace(/`(.*?)`/g, '<code>$1</code>');
                        
                        return (
                          <p key={i} dangerouslySetInnerHTML={{ __html: formatted }} />
                        );
                      });
                    };

                    return (
                      <motion.div 
                        key={msg.id || idx} 
                        initial={{ opacity: 0, y: 12, scale: 0.98 }} 
                        animate={{ opacity: 1, y: 0, scale: 1 }} 
                        className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex gap-4 max-w-[85%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                          {/* Avatar */}
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-[10px] font-bold border transition-all duration-500 scale-90 ${
                            isUser 
                              ? 'bg-white/5 text-white/40 border-white/10' 
                              : 'bg-primary text-white border-primary shadow-lg shadow-primary/20 shadow-glow'
                          }`}>
                            {isUser ? <User size={14} /> : <Bot size={14} />}
                          </div>
                          
                          {/* Message Bubble */}
                          <div className={`p-4 md:p-5 rounded-2xl text-[14px] leading-relaxed relative markdown-content ${
                            isUser 
                              ? 'bg-primary/10 text-white border border-primary/20 rounded-tr-none' 
                              : 'bg-white/[0.03] text-white/90 border border-white/[0.06] rounded-tl-none backdrop-blur-md shadow-xl'
                          }`}>
                            {renderMarkdown(msg.content)}
                            
                            {/* Subtle Time/Role indicator */}
                            <div className={`absolute -bottom-5 ${isUser ? 'right-0' : 'left-0'} text-[9px] uppercase tracking-widest font-bold opacity-20 whitespace-nowrap`}>
                              {isUser ? 'Neural Command' : 'Intelligence Engine'}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                  
                  {/* Enhanced Typing Indicator */}
                  {loading && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex justify-start mb-6"
                    >
                      <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center border border-primary/20 scale-90">
                          <Bot size={14} className="text-primary animate-pulse" />
                        </div>
                        <div className="bg-white/[0.03] border border-white/[0.06] p-4 rounded-2xl rounded-tl-none flex items-center gap-1.5 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <span className="w-1.5 h-1.5 bg-primary/80 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </div>
                    </motion.div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <footer className="p-4 md:p-12 relative bg-gradient-to-t from-bg via-bg/95 to-transparent backdrop-blur-sm z-30">
          <div className="max-w-2xl mx-auto relative group">
            <form 
              onSubmit={handleSendMessage}
              className="glass-card p-4 md:p-5 focus-within:ring-2 focus-within:ring-primary/20 transition-all duration-700 relative overflow-visible"
            >
              <div className="flex flex-col gap-4">
                {/* Model Selector Header */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsModelDropdownOpen(!isModelDropdownOpen)}
                    className="model-badge group/badge"
                  >
                    <Bot size={12} className="group-hover/badge:rotate-12 transition-transform" />
                    <span>{agents.find(a => (a.id || a._id) === selectedAgentId)?.agentName || 'Select Intelligence'}</span>
                    <ChevronDown size={12} className={`transition-transform duration-300 ${isModelDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  <AnimatePresence>
                    {isModelDropdownOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        className="absolute bottom-full left-0 mb-3 w-64 glass-dropdown z-50 p-2 border border-white/[0.08]"
                        onMouseLeave={() => setIsModelDropdownOpen(false)}
                      >
                        <div className="max-h-60 overflow-y-auto custom-scrollbar p-1">
                          <p className="text-[9px] uppercase tracking-[0.2em] font-bold text-text-muted px-3 py-2 mb-1 opacity-50 border-b border-white/5">Available Intelligence Models</p>
                          {agents.map(agent => (
                            <button
                              key={agent.id || agent._id}
                              type="button"
                              onClick={() => {
                                setSelectedAgentId(agent.id || agent._id);
                                setIsModelDropdownOpen(false);
                              }}
                              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-left group ${
                                (agent.id || agent._id) === selectedAgentId 
                                  ? 'bg-primary/10 text-primary' 
                                  : 'text-text-muted hover:bg-white/[0.03] hover:text-white'
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg border transition-colors ${
                                (agent.id || agent._id) === selectedAgentId ? 'border-primary/20 bg-primary/5' : 'border-white/5 bg-white/5 group-hover:border-white/10'
                              }`}>
                                <Sparkles size={14} />
                              </div>
                              <div className="flex flex-col">
                                <span className="text-[13px] font-semibold tracking-tight">{agent.agentName}</span>
                                <span className="text-[10px] opacity-40 uppercase tracking-tighter">Premium Logic</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Main Input Area */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-white/[0.02] border border-white/[0.04] rounded-2xl flex items-center px-4 focus-within:border-primary/30 focus-within:bg-white/[0.04] transition-all duration-500">
                    <input 
                      type="text" 
                      placeholder="Type your command..." 
                      value={input} 
                      onChange={(e) => setInput(e.target.value)} 
                      className="flex-1 bg-transparent border-none outline-none text-white text-[15px] py-4 placeholder:text-white/10 font-normal tracking-tight"
                    />
                  </div>
                  <button 
                    type="submit" 
                    disabled={!input.trim() || loading}
                    className="p-4 bg-primary text-white rounded-2xl hover:bg-primary-hover hover:scale-105 active:scale-95 disabled:opacity-10 transition-all shadow-[0_12px_24px_-8px_rgba(16,163,127,0.4)] relative group/send"
                  >
                    <Send size={22} className="group-hover/send:translate-x-0.5 group-hover/send:-translate-y-0.5 transition-transform" />
                  </button>
                </div>
              </div>
            </form>
            <p className="text-[10px] text-center text-text-muted mt-6 uppercase tracking-[0.4em] font-medium opacity-20 hover:opacity-40 transition-opacity cursor-default">
              Powered by Jaysea Neural Engine • 2026
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
