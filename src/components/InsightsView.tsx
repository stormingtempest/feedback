import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, X } from 'lucide-react';

export interface Insight {
  id: string;
  date: string;
  type: 'Overview' | 'Projects' | 'Campaigns' | 'Feedbacks';
  keyword: string;
  summary: string;
  details: string;
  recommendations: string[];
  importantForCompany: string;
}

interface InsightsViewProps {
  insights: Insight[];
  onGenerate: (filters: { areas: string[], subFilters: any }) => void;
  isGenerating: boolean;
  projects: any[];
  campaigns: any[];
  insightCount: number;
}

export const InsightsView = ({ insights, onGenerate, isGenerating, projects, campaigns, insightCount }: InsightsViewProps) => {
  const [filter, setFilter] = React.useState<string>('All');
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [selectedInsight, setSelectedInsight] = React.useState<Insight | null>(null);
  const [selectedAreas, setSelectedAreas] = React.useState<string[]>(['All']);
  const [subFilters, setSubFilters] = React.useState<any>({
      projectsActiveOnly: true,
      campaignsActiveOnly: true,
      specificProject: '',
      specificCampaign: ''
  });
  
  const limitReached = insightCount >= 10;

  const toggleArea = (area: string) => {
    if (area === 'All') {
      setSelectedAreas(['All']);
    } else {
      const newAreas = selectedAreas.filter(a => a !== 'All');
      if (newAreas.includes(area)) {
        setSelectedAreas(newAreas.filter(a => a !== area).length === 0 ? ['All'] : newAreas.filter(a => a !== area));
      } else {
        setSelectedAreas([...newAreas, area]);
      }
    }
  };

  const filteredInsights = insights.filter(i => 
    (filter === 'All' || i.type === filter) &&
    (i.keyword.toLowerCase().includes(searchTerm.toLowerCase()) || i.summary.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 mb-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-black text-slate-900">AI Insights Generator</h2>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${limitReached ? 'bg-rose-100 text-rose-700' : 'bg-indigo-100 text-indigo-700'}`}>
                    {insightCount} / 10 generated today
                </span>
            </div>
            <div className="flex items-center gap-2">
                <input 
                    type="text" 
                    placeholder="Search insights..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 outline-none"
                />
                <button 
                onClick={() => onGenerate({ areas: selectedAreas, subFilters })} 
                disabled={isGenerating || limitReached} 
                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50"
                >
                <Sparkles size={16} /> {isGenerating ? 'Generating...' : 'Generate'}
                </button>
            </div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
            {['All', 'Overview', 'Projects', 'Campaigns', 'Feedbacks'].map(area => (
                <button
                    key={area}
                    onClick={() => toggleArea(area)}
                    className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${selectedAreas.includes(area) ? 'bg-indigo-100 text-indigo-700 border border-indigo-300' : 'bg-slate-50 text-slate-600 border border-slate-200 hover:bg-slate-100'}`}
                >
                    {selectedAreas.includes(area) && <div className="w-1.5 h-1.5 rounded-full bg-indigo-600" />}
                    {area}
                </button>
            ))}
        </div>
        
        {/* Sub-filters */}
        <div className="flex flex-wrap gap-4 pt-4 border-t border-slate-100">
            {selectedAreas.includes('Projects') && (
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={subFilters.projectsActiveOnly} onChange={(e) => setSubFilters({...subFilters, projectsActiveOnly: e.target.checked})} />
                    Active Projects Only
                </label>
            )}
            {selectedAreas.includes('Campaigns') && (
                <label className="flex items-center gap-2 text-sm font-bold text-slate-700">
                    <input type="checkbox" checked={subFilters.campaignsActiveOnly} onChange={(e) => setSubFilters({...subFilters, campaignsActiveOnly: e.target.checked})} />
                    Active Campaigns Only
                </label>
            )}
            {selectedAreas.includes('Feedbacks') && (
                <>
                    <select className="text-sm font-bold text-slate-700 border border-slate-200 rounded-lg p-1" value={subFilters.specificProject} onChange={(e) => setSubFilters({...subFilters, specificProject: e.target.value})}>
                        <option value="">All Projects</option>
                        {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <select className="text-sm font-bold text-slate-700 border border-slate-200 rounded-lg p-1" value={subFilters.specificCampaign} onChange={(e) => setSubFilters({...subFilters, specificCampaign: e.target.value})}>
                        <option value="">All Campaigns</option>
                        {campaigns.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                </>
            )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredInsights.map(insight => (
          <div 
            key={insight.id}
            onClick={() => setSelectedInsight(insight)}
            className="bg-white p-6 rounded-3xl border border-slate-200 hover:border-indigo-300 transition-all cursor-pointer group shadow-sm hover:shadow-md"
          >
            <div className="flex justify-between items-start mb-4">
              <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">{insight.type}</span>
              <span className="text-xs font-bold text-slate-400 flex items-center gap-1"><Calendar size={12} /> {insight.date}</span>
            </div>
            <h3 className="text-lg font-black text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">{insight.keyword}</h3>
            <p className="text-sm text-slate-600 font-medium mb-4">{insight.summary}</p>
            <div className="text-[10px] font-bold text-indigo-700 bg-indigo-50 p-2 rounded-lg">
                Important: {insight.importantForCompany}
            </div>
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
              <div className="bg-indigo-50 p-4 rounded-2xl">
                <h4 className="font-black text-indigo-900 mb-1">Why this matters</h4>
                <p className="text-indigo-700 text-sm">{selectedInsight.importantForCompany}</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};
