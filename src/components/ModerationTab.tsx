'use client';
import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api as axios } from '@/lib/axios-client';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, XCircle, Clock, MessageSquareWarning, Search, Filter, Lock, Star, Tag, Image as ImageIcon, Video, ChevronDown, Check, ShieldAlert } from 'lucide-react';
import { clsx } from 'clsx';

const INTERNAL_TAGS = [
  'Bug Crítico',
  'Alta Prioridade',
  'Dado duplicado',
  'Usuário Confiável',
  'Requer investigação',
  'Outros'
];

export const ModerationTab = ({ organizations }: { organizations: any[] }) => {
  const queryClient = useQueryClient();
  const [modTab, setModTab] = useState('pending');
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>('all');
  const [showAutoApproveModal, setShowAutoApproveModal] = useState(false);
  const [autoApprovePassword, setAutoApprovePassword] = useState('');
  const [autoApproveReason, setAutoApproveReason] = useState('');
  
  const [approvingFeedbackId, setApprovingFeedbackId] = useState<string | null>(null);
  const [internalRating, setInternalRating] = useState<number>(0);
  const [internalTags, setInternalTags] = useState<string[]>([]);
  const [internalComment, setInternalComment] = useState('');
  const [internalOtherJustification, setInternalOtherJustification] = useState('');

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['adminFeedbacks'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/feedbacks');
      return res.data;
    }
  });

  const moderateFeedbackMutation = useMutation({
    mutationFn: async (data: any) => axios.put(`/api/admin/feedbacks/${data.id}/moderate`, data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['adminFeedbacks'] }); 
      queryClient.invalidateQueries({ queryKey: ['adminStats'] }); 
      setApprovingFeedbackId(null);
      resetInternalForm();
    }
  });

  const updateOrgMutation = useMutation({
    mutationFn: async ({ id, autoApprove }: { id: string, autoApprove: boolean }) => axios.put(`/api/admin/organizations/${id}`, { autoApprove }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] });
      setShowAutoApproveModal(false);
      setAutoApprovePassword('');
      setAutoApproveReason('');
    }
  });

  const resetInternalForm = () => {
    setInternalRating(0);
    setInternalTags([]);
    setInternalComment('');
    setInternalOtherJustification('');
  };

  const filteredFeedbacks = useMemo(() => {
    let filtered = feedbacks;
    if (selectedCompanyId !== 'all') {
      filtered = filtered.filter((f: any) => f.companyId === selectedCompanyId);
    }
    return filtered.filter((f: any) => f.status === modTab);
  }, [feedbacks, selectedCompanyId, modTab]);

  const stats = useMemo(() => {
    let base = feedbacks;
    if (selectedCompanyId !== 'all') {
      base = base.filter((f: any) => f.companyId === selectedCompanyId);
    }
    return {
      pending: base.filter((f: any) => f.status === 'pending').length,
      approved: base.filter((f: any) => f.status === 'approved').length,
      rejected: base.filter((f: any) => f.status === 'rejected').length,
      total: base.length
    };
  }, [feedbacks, selectedCompanyId]);

  const selectedCompany = organizations.find(o => o.id === selectedCompanyId);

  const handleToggleAutoApprove = () => {
    setShowAutoApproveModal(true);
  };

  const confirmAutoApproveToggle = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedCompany) {
      updateOrgMutation.mutate({ id: selectedCompany.id, autoApprove: !selectedCompany.autoApprove });
    }
  };

  const toggleTag = (tag: string) => {
    setInternalTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const submitApproval = (feedbackId: string) => {
    moderateFeedbackMutation.mutate({
      id: feedbackId,
      status: 'Approved',
      internalRating,
      internalTags,
      internalComment,
      internalOtherJustification: internalTags.includes('Outros') ? internalOtherJustification : null
    });
  };

  return (
    <div className="flex flex-col h-full bg-slate-50/50">
      <div className="p-6 md:p-8 border-b border-slate-200 bg-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Moderation</h2>
            <p className="text-slate-500 font-medium mt-1">Review and manage user feedback.</p>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <select
                value={selectedCompanyId}
                onChange={(e) => setSelectedCompanyId(e.target.value)}
                className="pl-10 pr-8 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none font-bold text-slate-700 appearance-none cursor-pointer"
              >
                <option value="all">Global (All Companies)</option>
                {organizations?.map(org => (
                  <option key={org.id} value={org.id}>{org.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>

            {selectedCompanyId !== 'all' && selectedCompany && (
              <button
                onClick={handleToggleAutoApprove}
                className={clsx(
                  "flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold transition-all border",
                  selectedCompany.autoApprove 
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100" 
                    : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                )}
              >
                <Lock size={16} className={selectedCompany.autoApprove ? "text-emerald-500" : "text-slate-400"} />
                Auto Approve: {selectedCompany.autoApprove ? 'ON' : 'OFF'}
              </button>
            )}
          </div>
        </div>

        {selectedCompanyId !== 'all' && (
          <div className="mb-6 inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-sm font-bold border border-indigo-100">
            <Filter size={14} /> Filtered by: {selectedCompany?.name}
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-amber-50 p-6 rounded-2xl border border-amber-100 text-center">
            <div className="text-4xl font-black text-amber-600">{stats.pending}</div>
            <div className="text-xs font-bold text-amber-600/70 uppercase tracking-widest mt-2">Pending</div>
          </div>
          <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100 text-center">
            <div className="text-4xl font-black text-emerald-600">{stats.approved}</div>
            <div className="text-xs font-bold text-emerald-600/70 uppercase tracking-widest mt-2">Approved</div>
          </div>
          <div className="bg-rose-50 p-6 rounded-2xl border border-rose-100 text-center">
            <div className="text-4xl font-black text-rose-600">{stats.rejected}</div>
            <div className="text-xs font-bold text-rose-600/70 uppercase tracking-widest mt-2">Rejected</div>
          </div>
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 text-center shadow-lg shadow-slate-900/20">
            <div className="text-4xl font-black text-white">{stats.total}</div>
            <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mt-2">Total</div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3">
          {[
            { id: 'pending', label: `Pending (${stats.pending})`, icon: Clock },
            { id: 'approved', label: `Approved (${stats.approved})`, icon: CheckCircle2 },
            { id: 'rejected', label: `Rejected (${stats.rejected})`, icon: XCircle }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => { setModTab(tab.id); setApprovingFeedbackId(null); }}
              className={clsx(
                "flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all",
                modTab === tab.id
                  ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              )}
            >
              <tab.icon size={18} />
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 flex-1 overflow-y-auto">
        {filteredFeedbacks?.length > 0 ? (
          <div className="space-y-6 max-w-4xl mx-auto">
            {filteredFeedbacks.map((fb: any) => (
              <div key={fb.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col gap-6 hover:shadow-md transition-shadow">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-500 font-black text-xl shrink-0">
                      {fb.user.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-lg">{fb.user}</h4>
                      <p className="text-sm text-slate-500 font-medium mt-1">
                        <span className="font-bold text-slate-700">{fb.companyName}</span> • {fb.project} • {fb.date}
                      </p>
                    </div>
                  </div>
                  <span className={clsx(
                    "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider self-start",
                    fb.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    fb.status === 'rejected' ? 'bg-rose-100 text-rose-700' :
                    'bg-amber-100 text-amber-700'
                  )}>
                    {fb.status}
                  </span>
                </div>

                {/* Ratings Display */}
                {fb.ratings && Object.keys(fb.ratings).length > 0 && (
                  <div className="flex flex-wrap gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                    {Object.entries(fb.ratings).map(([key, val]: any) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-500 uppercase">{key}:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} className={star <= val ? "fill-yellow-400 text-yellow-400" : "text-slate-300"} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100">
                  <p className="text-base text-slate-700 font-medium leading-relaxed whitespace-pre-wrap">
                    "{fb.content}"
                  </p>
                </div>

                {/* Media Display */}
                {(fb.files?.length > 0 || fb.link) && (
                  <div className="flex flex-wrap gap-4">
                    {fb.files?.map((file: string, idx: number) => (
                      <a key={idx} href={file} target="_blank" rel="noreferrer" className="relative group block w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                        <img src={file} alt="attachment" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <ImageIcon className="text-white" size={24} />
                        </div>
                      </a>
                    ))}
                    {fb.link && (
                      <a href={fb.link} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 w-24 h-24 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 transition-colors text-slate-600">
                        <Video size={24} />
                        <span className="text-xs font-bold">Video</span>
                      </a>
                    )}
                  </div>
                )}
                
                {modTab === 'pending' && approvingFeedbackId !== fb.id && (
                  <div className="flex gap-4 pt-4 border-t border-slate-100">
                    <button 
                      onClick={() => { setApprovingFeedbackId(fb.id); resetInternalForm(); }}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-emerald-50 text-emerald-600 hover:bg-emerald-500 hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <CheckCircle2 size={18} /> Approve
                    </button>
                    <button 
                      onClick={() => moderateFeedbackMutation.mutate({ id: fb.id, status: 'Rejected' })}
                      className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-rose-50 text-rose-600 hover:bg-rose-500 hover:text-white rounded-xl text-sm font-bold transition-all shadow-sm"
                    >
                      <XCircle size={18} /> Reject
                    </button>
                  </div>
                )}

                {/* Internal Qualification Form */}
                {approvingFeedbackId === fb.id && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-6 border-t border-slate-100 space-y-6"
                  >
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 flex items-center gap-2">
                        <ShieldAlert size={18} className="text-indigo-500" />
                        Internal Qualification
                      </h5>
                      <button onClick={() => setApprovingFeedbackId(null)} className="text-slate-400 hover:text-slate-600">
                        <XCircle size={20} />
                      </button>
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Internal Rating</label>
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setInternalRating(star)} className="focus:outline-none hover:scale-110 transition-transform">
                              <Star size={28} className={star <= internalRating ? "fill-yellow-400 text-yellow-400" : "text-slate-200"} />
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Tags</label>
                        <div className="flex flex-wrap gap-2">
                          {INTERNAL_TAGS.map(tag => (
                            <button
                              key={tag}
                              onClick={() => toggleTag(tag)}
                              className={clsx(
                                "px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border",
                                internalTags.includes(tag)
                                  ? "bg-indigo-100 border-indigo-200 text-indigo-700"
                                  : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                              )}
                            >
                              {tag}
                            </button>
                          ))}
                        </div>
                      </div>

                      {internalTags.includes('Outros') && (
                        <div>
                          <label className="block text-sm font-bold text-slate-700 mb-2">Justification for "Outros"</label>
                          <input
                            type="text"
                            value={internalOtherJustification}
                            onChange={e => setInternalOtherJustification(e.target.value)}
                            className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="Please specify..."
                          />
                        </div>
                      )}

                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Internal Comment</label>
                        <textarea
                          value={internalComment}
                          onChange={e => setInternalComment(e.target.value)}
                          className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none h-24"
                          placeholder="Why did you give this qualification? This helps the company prioritize."
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4">
                        <button 
                          onClick={() => setApprovingFeedbackId(null)}
                          className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                        >
                          Cancel
                        </button>
                        <button 
                          onClick={() => submitApproval(fb.id)}
                          disabled={internalRating === 0 || (internalTags.includes('Outros') && !internalOtherJustification)}
                          className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-700 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Check size={18} /> Confirm Approval
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                {/* Display Internal Quals if already approved */}
                {fb.status === 'approved' && fb.internalRating && (
                  <div className="mt-4 pt-4 border-t border-slate-100 bg-indigo-50/50 rounded-2xl p-4">
                    <h5 className="font-bold text-indigo-900 text-sm mb-3 flex items-center gap-2">
                      <ShieldAlert size={16} /> Internal Qualification
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 uppercase">Rating:</span>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star key={star} size={14} className={star <= fb.internalRating ? "fill-yellow-400 text-yellow-400" : "text-indigo-200"} />
                          ))}
                        </div>
                      </div>
                      {fb.internalTags?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {fb.internalTags.map((tag: string) => (
                            <span key={tag} className="px-2 py-1 bg-indigo-100 text-indigo-700 rounded-md text-xs font-bold">
                              {tag} {tag === 'Outros' && fb.internalOtherJustification ? `(${fb.internalOtherJustification})` : ''}
                            </span>
                          ))}
                        </div>
                      )}
                      {fb.internalComment && (
                        <p className="text-sm text-indigo-800 italic">"{fb.internalComment}"</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-300 max-w-4xl mx-auto">
            <MessageSquareWarning size={64} className="mx-auto text-slate-200 mb-6" />
            <p className="text-lg text-slate-500 font-bold">No feedbacks found in this category.</p>
            <p className="text-sm text-slate-400 font-medium mt-2">Check back later for new submissions.</p>
          </div>
        )}
      </div>

      {/* Auto Approve Modal */}
      {showAutoApproveModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
                <Lock className="text-indigo-500" /> Security Verification
              </h3>
              <button onClick={() => setShowAutoApproveModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={confirmAutoApproveToggle} className="p-6 space-y-4">
              <p className="text-sm text-slate-600 mb-4">
                You are about to turn {selectedCompany?.autoApprove ? <strong className="text-rose-600">OFF</strong> : <strong className="text-emerald-600">ON</strong>} automatic approval for <strong>{selectedCompany?.name}</strong>.
                Please provide your password and a reason for this change.
              </p>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required
                  value={autoApprovePassword}
                  onChange={e => setAutoApprovePassword(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="••••••••"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Reason</label>
                <input 
                  type="text" 
                  required
                  value={autoApproveReason}
                  onChange={e => setAutoApproveReason(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  placeholder="Company requested..."
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowAutoApproveModal(false)}
                  className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md"
                >
                  Confirm Change
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
