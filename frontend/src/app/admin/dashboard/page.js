'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import axiosInstance from '@/api/axios';
import { Bot, Users, Plus, Trash2, Edit, Shield, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState('agents');
  const [agents, setAgents] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState(null);
  const [newAgent, setNewAgent] = useState({ name: '', description: '', model: '' });
  const [appLoading, setAppLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await Promise.all([fetchAgents(), fetchUsers()]);
      setAppLoading(false);
    };
    init();
  }, []);

  const fetchAgents = async () => {
    try {
      const res = await axiosInstance.get('/agen-management/all');
      setAgents(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchUsers = async () => {
    try {
      const res = await axiosInstance.get('/admin/users');
      setUsers(res.data);
    } catch (err) { console.error(err); }
  };

  const handleSubmitAgent = async (e) => {
    e.preventDefault();
    try {
      if (editingAgent) {
        await axiosInstance.patch(`/agen-management/${editingAgent.id}`, { agentName: newAgent.name });
      } else {
        await axiosInstance.post('/agen-management/create', newAgent);
      }
      fetchAgents();
      setShowModal(false);
      setEditingAgent(null);
      setNewAgent({ name: '', description: '', model: '' });
    } catch (err) { console.error(err); }
  };

  const deleteAgent = async (id) => {
    if (window.confirm('Are you sure?')) {
      try {
        await axiosInstance.delete(`/agen-management/${id}`);
        fetchAgents();
      } catch (err) { console.error(err); }
    }
  };

  if (appLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-black">
        <div className="loading-spinner w-12 h-12"></div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-bg text-text font-sans selection:bg-primary/30 antialiased overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-black/40 border-r border-white/5 flex flex-col transition-all duration-500 backdrop-blur-3xl relative z-20">
        {/* Sidebar Background Glow */}
        <div className="absolute top-0 left-0 w-full h-32 bg-primary/5 blur-3xl rounded-full opacity-50 pointer-events-none" />
        
        <div className="p-8 relative">
          <h2 className="text-2xl font-bold tracking-tighter text-white flex items-center gap-2 group cursor-default">
            <Shield size={24} className="text-primary transition-transform duration-500 group-hover:rotate-[360deg]" />
            Jaysea<span className="text-primary">Admin</span>
          </h2>
          <p className="text-[10px] text-text-muted mt-1 uppercase tracking-[0.2em] font-bold opacity-40">Intelligence Hub</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 mt-4 relative">
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
              activeTab === 'agents' ? 'bg-white/[0.06] text-white shadow-sm' : 'text-text-muted hover:bg-white/[0.03]'
            }`} 
            onClick={() => setActiveTab('agents')}
          >
            <Bot size={20} className={activeTab === 'agents' ? 'text-primary' : 'group-hover:text-primary transition-colors'} /> 
            <span className={`font-semibold text-sm ${activeTab === 'agents' ? '' : 'font-medium'}`}>Agents</span>
            {activeTab === 'agents' && (
              <motion.div layoutId="admin-nav-indicator" className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
            )}
          </button>
          
          <button 
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group relative ${
              activeTab === 'users' ? 'bg-white/[0.06] text-white shadow-sm' : 'text-text-muted hover:bg-white/[0.03]'
            }`} 
            onClick={() => setActiveTab('users')}
          >
            <Users size={20} className={activeTab === 'users' ? 'text-primary' : 'group-hover:text-primary transition-colors'} /> 
            <span className={`font-semibold text-sm ${activeTab === 'users' ? '' : 'font-medium'}`}>Users</span>
            {activeTab === 'users' && (
              <motion.div layoutId="admin-nav-indicator" className="absolute left-0 w-1 h-5 bg-primary rounded-r-full" />
            )}
          </button>
        </nav>

        <div className="p-6 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shadow-inner ring-1 ring-primary/20">
              A
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate leading-none mb-1">Super Admin</p>
              <p className="text-[10px] text-text-muted truncate uppercase tracking-tighter opacity-70">Control Panel</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden bg-bg relative px-2">
        {/* Global radiance effects */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.03] blur-[150px] -z-10 rounded-full" />
        <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-primary/[0.02] blur-[150px] -z-10 rounded-full" />

        <header className="h-20 flex items-center justify-between px-10 bg-bg/40 backdrop-blur-xl border-b border-white/[0.04] sticky top-0 z-10 transition-all duration-500">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold text-white tracking-tighter">
              {activeTab === 'agents' ? 'Agent Management' : 'System Users'}
            </h1>
            <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-medium opacity-50">
              Master Administration Control
            </p>
          </div>
          
          {activeTab === 'agents' && (
            <button 
              className="btn btn-primary px-5 py-2.5 rounded-xl flex items-center gap-2 group" 
              onClick={() => { setEditingAgent(null); setNewAgent({ name: '', description: '', model: '' }); setShowModal(true); }}
            >
              <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
              <span className="text-xs font-bold uppercase tracking-wider">Add New Agent</span>
            </button>
          )}
        </header>

        <section className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-[1400px] mx-auto">
            <motion.div 
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card overflow-hidden shadow-2xl shadow-black/50"
            >
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                      {activeTab === 'agents' ? (
                        <>
                          <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Identity</th>
                          <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Architecture</th>
                          <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60 text-right">Operations</th>
                        </>
                      ) : (
                        <>
                          <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Subject</th>
                          <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Communication</th>
                          <th className="px-8 py-5 text-[11px] font-bold text-text-muted uppercase tracking-[0.2em] opacity-60">Privilege</th>
                        </>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.02]">
                    {activeTab === 'agents' ? (
                      agents.map(agent => (
                        <tr key={agent.id} className="hover:bg-white/[0.03] transition-all duration-300 group">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-primary/5 border border-primary/10 flex items-center justify-center text-primary">
                                <Bot size={16} />
                              </div>
                              <span className="font-semibold text-white tracking-tight">{agent.agentName || agent.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5">
                            <span className="text-[13px] text-text-muted leading-relaxed opacity-80">{agent.model}</span>
                          </td>
                          <td className="px-8 py-5 text-right">
                            <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-2 group-hover:translate-x-0">
                              <button 
                                onClick={() => { setEditingAgent(agent); setNewAgent({ name: agent.agentName || agent.name, description: agent.description, model: agent.model }); setShowModal(true); }}
                                className="p-2.5 bg-white/[0.04] hover:bg-white/[0.08] hover:text-primary rounded-xl transition-all"
                              >
                                <Edit size={14} />
                              </button>
                              <button 
                                onClick={() => deleteAgent(agent.id || agent._id)}
                                className="p-2.5 bg-white/[0.04] hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      users.map(u => (
                        <tr key={u.id || u._id} className="hover:bg-white/[0.03] transition-all duration-300">
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center text-secondary shadow-inner border border-white/5">
                                <User size={16} />
                              </div>
                              <span className="font-semibold text-white tracking-tight">{u.name}</span>
                            </div>
                          </td>
                          <td className="px-8 py-5 text-[13px] text-text-muted opacity-80 font-normal">{u.email}</td>
                          <td className="px-8 py-5">
                            <span className="px-3 py-1 rounded-full bg-primary/5 border border-primary/20 text-primary text-[10px] font-bold uppercase tracking-wider shadow-sm">
                              {u.role}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </section>
      </main>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-6 z-[100]">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="glass-card w-full max-w-[480px] p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] border-white/[0.08]"
            >
              <div className="mb-8">
                <h2 className="text-3xl font-bold text-white tracking-tighter">
                  {editingAgent ? 'Edit Intelligence' : 'Deploy New Agent'}
                </h2>
                <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] font-bold mt-1 opacity-50">Configuration Console</p>
              </div>
              
              <form onSubmit={handleSubmitAgent} className="space-y-6">
                <div className="space-y-1.5">
                  <label className="input-label">Public Name</label>
                  <input 
                    className="input-field"
                    value={newAgent.name} 
                    onChange={(e) => setNewAgent({...newAgent, name: e.target.value})} 
                    required 
                    placeholder="e.g. Nexus-7 Intelligence"
                  />
                </div>
                {!editingAgent && (
                  <>
                    <div className="space-y-1.5">
                      <label className="input-label">Logic Model</label>
                      <input 
                        className="input-field"
                        value={newAgent.model} 
                        onChange={(e) => setNewAgent({...newAgent, model: e.target.value})} 
                        required 
                        placeholder="e.g. gpt-4-o"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="input-label">Agent Capability Brief</label>
                      <textarea 
                        className="input-field min-h-[120px] py-4 resize-none"
                        value={newAgent.description} 
                        onChange={(e) => setNewAgent({...newAgent, description: e.target.value})} 
                        required 
                        placeholder="Define the primary functions and constraints of this intelligence..."
                      />
                    </div>
                  </>
                )}
                <div className="flex gap-4 pt-4">
                  <button 
                    type="button" 
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-6 py-3.5 rounded-2xl border border-white/[0.06] bg-white/[0.02] text-white/50 text-sm font-semibold hover:bg-white/5 hover:text-white transition-all"
                  >
                    Cancel
                  </button>
                  <button type="submit" className="flex-1 btn btn-primary py-3.5">
                    {editingAgent ? 'Save Changes' : 'Initialize Agent'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
