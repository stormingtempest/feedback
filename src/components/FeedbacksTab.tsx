'use client';
import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, AlertCircle, MessageSquare, Award, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';

export const FeedbacksTab = ({ company }: { company: any }) => {
  const [filter, setFilter] = useState('all'); // all, pending
  const [searchTerm, setSearchTerm] = useState('');

  const allFeedbacks = company.projects?.flatMap((p: any) => p.campaigns?.flatMap((c: any) => c.feedbacks || []) || []) || [];
  
  const filteredFeedbacks = allFeedbacks.filter((fb: any) => {
    const matchesFilter = filter === 'all' || (filter === 'pending' && !fb.companyResponse);
    const matchesSearch = fb.description?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          fb.category?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  return (
    <motion.div key="feedbacks" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-slate-800">Feedback Management</h2>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
                type="text" 
                placeholder="Search feedbacks..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <button onClick={() => setFilter('all')} className={clsx("px-4 py-2 rounded-xl font-bold", filter === 'all' ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200")}>All</button>
          <button onClick={() => setFilter('pending')} className={clsx("px-4 py-2 rounded-xl font-bold", filter === 'pending' ? "bg-indigo-600 text-white" : "bg-white text-slate-600 border border-slate-200")}>Pending Response</button>
        </div>
      </div>
      
      <div className="space-y-4">
        {filteredFeedbacks.map((fb: any) => (
          <div key={fb.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 flex gap-4 items-start">
            {fb.moderatorAlert && (
              <div className="p-2 bg-rose-50 text-rose-600 rounded-xl">
                <AlertCircle size={20} />
              </div>
            )}
            <div className="flex-1">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-bold text-slate-400 uppercase">{fb.category}</span>
                <span className="text-xs font-bold text-indigo-600">{fb.internalRating || 'No Rating'}</span>
              </div>
              <p className="text-slate-700 mb-4">{fb.description}</p>
              <div className="flex gap-2">
                <button className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                  <MessageSquare size={14} /> Respond
                </button>
                <button className="flex items-center gap-2 px-3 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-bold">
                  <Award size={14} /> Assign Points
                </button>
                <button className="p-1 text-slate-400 hover:text-rose-600">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};
