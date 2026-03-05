'use client';
import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, MessageSquare, Filter, Star, Send, AlertCircle, User, Trophy, ChevronDown, Search } from 'lucide-react';
import { clsx } from 'clsx';

interface Feedback {
  id: string;
  userId: string;
  userName?: string; // Added for display
  userAvatar?: string; // Added for display
  title?: string; // Added per user request
  internalRating: number;
  internalTags: string[];
  description: string;
  createdAt: string;
  status: 'pending' | 'approved' | 'excluded';
  moderatorComment?: string;
  companyResponse?: string;
  projectName?: string;
  campaignName?: string;
}

export const ModeratedFeedbacksTab = ({ feedbacks, onRespond }: { feedbacks: Feedback[], onRespond: (id: string, response: string, bonusPoints: number) => void }) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'excluded'>('all');
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [campaignFilter, setCampaignFilter] = useState<string>('all');
  const [ratingFilter, setRatingFilter] = useState<number | 'all'>('all');
  
  const [response, setResponse] = useState<Record<string, string>>({});
  const [bonusPoints, setBonusPoints] = useState<Record<string, number>>({});
  const [respondingId, setRespondingId] = useState<string | null>(null);

  // Extract unique projects and campaigns for filters
  const projects = useMemo(() => Array.from(new Set(feedbacks.map(f => f.projectName).filter(Boolean))), [feedbacks]);
  const campaigns = useMemo(() => Array.from(new Set(feedbacks.map(f => f.campaignName).filter(Boolean))), [feedbacks]);

  const filtered = feedbacks.filter(f => {
    if (statusFilter !== 'all' && f.status !== statusFilter) return false;
    if (projectFilter !== 'all' && f.projectName !== projectFilter) return false;
    if (campaignFilter !== 'all' && f.campaignName !== campaignFilter) return false;
    if (ratingFilter !== 'all' && f.internalRating !== ratingFilter) return false;
    return true;
  });

  const handleSendResponse = (id: string) => {
    onRespond(id, response[id] || '', bonusPoints[id] || 0);
    setRespondingId(null);
    // Optional: Clear response after sending
    // setResponse(prev => ({ ...prev, [id]: '' }));
    // setBonusPoints(prev => ({ ...prev, [id]: 0 }));
  };

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-slate-100 rounded-2xl text-slate-600">
            <MessageSquare size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Feedbacks</h4>
            <p className="text-3xl font-black text-slate-900">{feedbacks.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-2xl text-indigo-600">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Moderated</h4>
            <p className="text-3xl font-black text-indigo-600">{feedbacks.filter(f => f.status !== 'pending').length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex items-center gap-4">
          <div className="p-4 bg-rose-50 rounded-2xl text-rose-600">
            <XCircle size={24} />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Excluded</h4>
            <p className="text-3xl font-black text-rose-600">{feedbacks.filter(f => f.status === 'excluded').length}</p>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
            <Filter size={16} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase">Filters:</span>
          </div>
          
          {/* Status Filter */}
          <div className="flex bg-slate-100 p-1 rounded-xl">
            {(['all', 'approved', 'excluded'] as const).map(f => (
              <button 
                key={f}
                onClick={() => setStatusFilter(f)}
                className={clsx(
                  "px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all",
                  statusFilter === f ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                )}
              >
                {f}
              </button>
            ))}
          </div>

          {/* Project Filter */}
          <div className="relative">
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Projects</option>
              {projects.map(p => <option key={p} value={p as string}>{p}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Campaign Filter */}
          <div className="relative">
            <select 
              value={campaignFilter}
              onChange={(e) => setCampaignFilter(e.target.value)}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Campaigns</option>
              {campaigns.map(c => <option key={c} value={c as string}>{c}</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>

          {/* Rating Filter */}
          <div className="relative">
            <select 
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className="appearance-none pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            >
              <option value="all">All Ratings</option>
              {[5, 4, 3, 2, 1].map(r => <option key={r} value={r}>{r} Stars</option>)}
            </select>
            <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Feedback List */}
      <div className="space-y-6">
        {filtered.length > 0 ? (
          filtered.map(f => (
            <motion.div 
              key={f.id} 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 md:p-8 rounded-[32px] shadow-sm border border-slate-200 hover:shadow-md transition-shadow relative overflow-hidden"
            >
              {/* Status Badge */}
              <div className={clsx(
                "absolute top-0 right-0 px-6 py-2 rounded-bl-3xl text-xs font-black uppercase tracking-wider",
                f.status === 'approved' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
              )}>
                {f.status}
              </div>

              <div className="flex flex-col md:flex-row gap-8">
                {/* User Info Column */}
                <div className="md:w-1/4 flex flex-col gap-4 border-b md:border-b-0 md:border-r border-slate-100 pb-6 md:pb-0 md:pr-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-50 to-blue-50 flex items-center justify-center text-indigo-600 shadow-inner border border-indigo-100">
                      {f.userAvatar ? (
                        <img src={f.userAvatar} alt={f.userName} className="w-full h-full object-cover rounded-2xl" />
                      ) : (
                        <span className="text-2xl font-black">{f.userId.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-lg">{f.userName || `User ${f.userId}`}</h3>
                      <p className="text-xs text-slate-400 font-medium">{f.createdAt}</p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Project</span>
                      <span className="text-sm font-bold text-slate-700 block truncate">{f.projectName || 'Unknown Project'}</span>
                    </div>
                    <div className="px-3 py-2 bg-slate-50 rounded-xl border border-slate-100">
                      <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Campaign</span>
                      <span className="text-sm font-bold text-slate-700 block truncate">{f.campaignName || 'Unknown Campaign'}</span>
                    </div>
                  </div>
                </div>

                {/* Content Column */}
                <div className="flex-1 space-y-6">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{f.title || 'Feedback Submission'}</h3>
                    <p className="text-slate-600 leading-relaxed text-lg">"{f.description}"</p>
                  </div>

                  {/* Moderator Section */}
                  <div className="bg-indigo-50/50 p-5 rounded-2xl border border-indigo-100 flex flex-col sm:flex-row gap-6">
                    <div className="min-w-[120px]">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-2">Moderator Rating</span>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star key={star} size={18} className={star <= f.internalRating ? "fill-yellow-400 text-yellow-400" : "text-indigo-200"} />
                        ))}
                      </div>
                    </div>
                    <div className="flex-1 border-t sm:border-t-0 sm:border-l border-indigo-100 pt-4 sm:pt-0 sm:pl-6">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block mb-1">Moderator Note</span>
                      <p className="text-sm text-indigo-900 font-medium italic">"{f.moderatorComment || 'No comment provided.'}"</p>
                      {f.internalTags && f.internalTags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {f.internalTags.map(tag => (
                            <span key={tag} className="px-2 py-1 bg-white text-indigo-600 rounded-md text-[10px] font-bold border border-indigo-100 shadow-sm">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Company Response Section */}
                  {f.status === 'approved' && (
                    <div className="pt-4">
                      {f.companyResponse ? (
                        <div className="bg-emerald-50 p-5 rounded-2xl border border-emerald-100">
                          <div className="flex items-center gap-2 mb-2">
                            <CheckCircle2 size={16} className="text-emerald-600" />
                            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">Company Responded</span>
                          </div>
                          <p className="text-emerald-900 font-medium">"{f.companyResponse}"</p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {!respondingId ? (
                            <button 
                              onClick={() => setRespondingId(f.id)}
                              className="flex items-center gap-2 text-indigo-600 font-bold text-sm hover:text-indigo-800 transition-colors"
                            >
                              <MessageSquare size={16} /> Reply & Award Points
                            </button>
                          ) : respondingId === f.id && (
                            <motion.div 
                              initial={{ opacity: 0, height: 0 }} 
                              animate={{ opacity: 1, height: 'auto' }}
                              className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-4"
                            >
                              <div className="flex justify-between items-center">
                                <h4 className="font-bold text-slate-800">Your Response</h4>
                                <button onClick={() => setRespondingId(null)} className="text-slate-400 hover:text-slate-600"><XCircle size={18} /></button>
                              </div>
                              
                              <textarea 
                                value={response[f.id] || ''}
                                onChange={e => setResponse({...response, [f.id]: e.target.value})}
                                className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-32"
                                placeholder="Write a response to the user..."
                              />
                              
                              <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-200">
                                <div className="p-2 bg-yellow-100 text-yellow-600 rounded-lg">
                                  <Trophy size={20} />
                                </div>
                                <div className="flex-1">
                                  <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Bonus Points Award</label>
                                  <input 
                                    type="number" 
                                    min="0"
                                    max="1000"
                                    step="50"
                                    value={bonusPoints[f.id] || 0}
                                    onChange={e => setBonusPoints({...bonusPoints, [f.id]: parseInt(e.target.value) || 0})}
                                    className="w-full font-black text-slate-900 outline-none"
                                    placeholder="0"
                                  />
                                </div>
                                <div className="text-sm font-bold text-slate-400">XP</div>
                              </div>

                              <div className="flex justify-end">
                                <button 
                                  onClick={() => handleSendResponse(f.id)}
                                  disabled={!response[f.id]}
                                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <Send size={18} /> Send Response & Award {bonusPoints[f.id] || 0} XP
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-20 bg-white rounded-[32px] border border-dashed border-slate-200">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Search size={32} />
            </div>
            <p className="text-slate-400 font-bold">No moderated feedbacks found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
