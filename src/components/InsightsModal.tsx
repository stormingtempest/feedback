'use client';
import React from 'react';
import { motion } from 'motion/react';
import { X, Sparkles, Filter, Calendar } from 'lucide-react';

export interface Insight {
  id: string;
  date: string;
  type: 'Overview' | 'Projects' | 'Campaigns' | 'Feedbacks';
  keyword: string;
  summary: string;
  details: string;
  recommendations: string[];
}

interface InsightsModalProps {
  isOpen: boolean;
  onClose: () => void;
  insights: Insight[];
}

export const InsightsModal = ({ isOpen, onClose, insights }: InsightsModalProps) => {
  const [filter, setFilter] = React.useState<string>('All');
  const [selectedInsight, setSelectedInsight] = React.useState<Insight | null>(null);

  if (!isOpen) return null;

  const filteredInsights = filter === 'All' ? insights : insights.filter(i => i.type === filter);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl h-[80vh] flex flex-col overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
            <Sparkles className="text-indigo-500" /> Business Insights
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 flex gap-2">
          {['All', 'Overview', 'Projects', 'Campaigns', 'Feedbacks'].map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl font-bold text-sm transition-all ${filter === f ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            >
              {f}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 md:grid-cols-2 gap-6 custom-scrollbar">
          {filteredInsights.map(insight => (
            <div 
              key={insight.id}
              onClick={() => setSelectedInsight(insight)}
              className="bg-slate-50 p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-[10px] font-black uppercase tracking-widest">{insight.type}</span>
                <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Calendar size={12} /> {insight.date}</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{insight.keyword}</h3>
              <p className="text-sm text-slate-600 font-medium">{insight.summary}</p>
            </div>
          ))}
        </div>

        {selectedInsight && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-[40px] p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-black text-slate-900">{selectedInsight.keyword}</h3>
                <button onClick={() => setSelectedInsight(null)} className="p-2 hover:bg-slate-100 rounded-full"><X size={20} /></button>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-slate-900 mb-2">Detailed Analysis</h4>
                  <p className="text-slate-600">{selectedInsight.details}</p>
                </div>
                <div>
                  <h4 className="font-black text-slate-900 mb-2">Recommendations</h4>
                  <ul className="list-disc list-inside text-slate-600 space-y-1">
                    {selectedInsight.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}
                  </ul>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </motion.div>
    </div>
  );
};
