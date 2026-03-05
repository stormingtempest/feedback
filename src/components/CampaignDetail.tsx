import React from 'react';
import { motion } from 'motion/react';
import { 
  ArrowLeft, 
  Megaphone, 
  Star, 
  Target, 
  Trophy, 
  MessageSquare, 
  CheckCircle2, 
  Clock, 
  ChevronRight,
  Sparkles,
  Award
} from 'lucide-react';
import { clsx } from 'clsx';

interface CampaignDetailProps {
  campaign: any;
  onBack: () => void;
}

export const CampaignDetail = ({ campaign, onBack }: CampaignDetailProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="max-w-6xl mx-auto space-y-8"
    >
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
          <ArrowLeft size={20} /> Back
        </button>
        <div className="flex gap-2">
          <span className={clsx(
            "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
            campaign.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
          )}>
            {campaign.status}
          </span>
        </div>
      </div>

      <div className="bg-white p-8 rounded-[40px] shadow-sm border border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Megaphone size={120} />
        </div>
        
        <div className="relative z-10">
          <h2 className="text-4xl font-black text-slate-900 mb-4">{campaign.name}</h2>
          <p className="text-slate-500 text-lg max-w-2xl mb-8">{campaign.description || 'No description provided.'}</p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Total Feedbacks</div>
              <div className="text-3xl font-black text-slate-900">{campaign.feedbacks?.length || 0}</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Campaign Progress</div>
              <div className="text-3xl font-black text-slate-900">{campaign.progress || 0}%</div>
            </div>
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-100">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Response Bonus</div>
              <div className="text-3xl font-black text-emerald-600">+{campaign.responseBonus || 0} XP</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Questions */}
        <div className="lg:col-span-2 space-y-6">
          <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
            <Star className="text-yellow-500" size={20} /> Questions Configuration
          </h3>
          <div className="space-y-4">
            {campaign.questions?.map((q: any, idx: number) => (
              <div key={q.id} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-200">
                    {idx + 1}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900">{q.text}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{q.style} style</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-indigo-600">+{q.points} XP</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase">per response</div>
                </div>
              </div>
            ))}
            {(!campaign.questions || campaign.questions.length === 0) && (
              <div className="p-10 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 text-center text-slate-400 font-bold">
                No questions configured for this campaign.
              </div>
            )}
          </div>
        </div>

        {/* Badge & Missions */}
        <div className="space-y-8">
          {/* Badge */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Award className="text-orange-500" size={20} /> Reward Badge
            </h3>
            {campaign.badge ? (
              <div className="bg-gradient-to-br from-orange-50 to-yellow-50 p-6 rounded-3xl border border-orange-100 text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-4xl shadow-lg mx-auto mb-4 border-4 border-orange-100">
                  {campaign.badge.icon}
                </div>
                <h4 className="font-black text-slate-900 text-lg">{campaign.badge.name}</h4>
                <p className="text-sm text-slate-600 mt-2 italic">"{campaign.badge.message}"</p>
              </div>
            ) : (
              <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center text-slate-400 font-bold">
                No badge configured.
              </div>
            )}
          </div>

          {/* Missions */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <Target className="text-indigo-500" size={20} /> Specific Missions
            </h3>
            <div className="space-y-3">
              {campaign.missions?.map((m: any) => (
                <div key={m.id} className="bg-indigo-50/50 p-4 rounded-2xl border border-indigo-100">
                  <div className="flex justify-between items-start mb-1">
                    <h5 className="font-bold text-slate-900">{m.title}</h5>
                    <span className="text-xs font-black text-indigo-600">+{m.points} XP</span>
                  </div>
                  <p className="text-xs text-slate-500 font-medium leading-relaxed">{m.description}</p>
                </div>
              ))}
              {(!campaign.missions || campaign.missions.length === 0) && (
                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-200 text-center text-slate-400 font-bold">
                  No missions configured.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
