import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Megaphone, Plus, BarChart3, LogOut, Download, FileText, BrainCircuit, Settings, ChevronRight, Star, ArrowLeft, FolderKanban, AlertCircle, Info, Clock, Tag, ChevronDown, User, Sparkles, Wand2, LayoutDashboard, PieChart as PieChartIcon, Target, MessageSquare, Shield } from 'lucide-react';
import { OverviewCard } from '../components/OverviewCard';
import { ModeratedFeedbacksTab } from '../components/ModeratedFeedbacksTab';
import { CampaignWizard } from '../components/CampaignWizard';
import { CampaignDetail } from '../components/CampaignDetail';
import { InsightsView } from '../components/InsightsView';
import { generateText } from '../services/openaiService';
import { useNavigate } from 'react-router-dom';
import { clsx } from 'clsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { IS_MOCK } from '../config/env';
import { mockCompanyData } from '../services/mockData';

export const CompanyPanel = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview'); // overview, projects, insights, settings
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [selectedCampaign, setSelectedCampaign] = useState<any>(null);

  const userId = localStorage.getItem('userId');

  const { data, isLoading } = useQuery({
    queryKey: ['companyDashboard'],
    queryFn: async () => {
      if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockCompanyData;
      }
      const res = await axios.get('api/company/dashboard', {
        headers: { 'x-user-id': userId }
      });
      return res.data;
    },
    enabled: !!userId || IS_MOCK
  });

  const [explanationModal, setExplanationModal] = useState<{ title: string, content: string } | null>(null);
  const [showNewProjectModal, setShowNewProjectModal] = useState(false);
  const [showNewCampaignModal, setShowNewCampaignModal] = useState(false);
  const [showCampaignWizard, setShowCampaignWizard] = useState(false);
  const [showAIWizard, setShowAIWizard] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'profile' | 'ai'>('profile');
  const [showUserMenu, setShowUserMenu] = useState(false);

  const { data: insightsData, isLoading: isLoadingInsights, refetch: fetchInsights } = useQuery({
    queryKey: ['companyInsights'],
    queryFn: async () => {
      if (IS_MOCK) {
        return {
          insights: [
            { id: '1', date: '2026-03-05', type: 'Overview', keyword: 'Engagement Spike', summary: 'Overall platform engagement increased by 15% this week.', details: 'The recent campaign launch drove significant activity in the feedback module.', recommendations: ['Maintain current campaign pace', 'Analyze specific feedback topics'], priority: 'High', title: 'Engagement Spike', description: 'Overall platform engagement increased by 15% this week.' },
            { id: '2', date: '2026-03-04', type: 'Projects', keyword: 'Checkout Flow', summary: 'Users are struggling with the new checkout flow.', details: 'Feedback indicates confusion during the payment step.', recommendations: ['Simplify payment form', 'Add tooltips for clarity'], priority: 'Medium', title: 'Checkout Flow', description: 'Users are struggling with the new checkout flow.' }
          ]
        };
      }
      const res = await axios.post('api/company/insights', { forceRegenerate: false }, {
        headers: { 'x-user-id': userId }
      });
      return res.data;
    },
    enabled: activeTab === 'insights'
  });

  const createProjectMutation = useMutation({
    mutationFn: async (data: { name: string, description: string }) => {
      return axios.post('/api/company/projects', data, {
        headers: { 'x-user-id': userId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyDashboard'] });
      setShowNewProjectModal(false);
    }
  });

  const createCampaignMutation = useMutation({
    mutationFn: async (campaignData: any) => {
      if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        return { data: { success: true } };
      }
      return axios.post('api/api.php', { ...campaignData, action: 'createCampaign' }, {
        headers: { 'x-user-id': userId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyDashboard'] });
      setShowCampaignWizard(false);
      alert('Campaign created successfully!');
    }
  });

  const updateSettingsMutation = useMutation({
    mutationFn: async (settingsData: any) => {
      return axios.put('/api/company/settings', settingsData, {
        headers: { 'x-user-id': userId }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companyDashboard'] });
      alert('Settings updated successfully!');
    }
  });

  const [insightCount, setInsightCount] = useState(() => {
    const stored = localStorage.getItem('insight_count');
    if (stored) {
      const { count, date } = JSON.parse(stored);
      if (date === new Date().toDateString()) return count;
    }
    return 0;
  });

  const generateInsightsMutation = useMutation({
    mutationFn: async (filters: { areas: string[], subFilters: any }) => {
      if (insightCount >= 10) {
        throw new Error('Daily limit of 10 insights reached.');
      }

      const { areas, subFilters } = filters;
      const settings = JSON.parse(localStorage.getItem('ai_settings') || '{}');
      
      if (settings.aiEnabled === false) {
        throw new Error('AI features are disabled in settings.');
      }

      // If we have custom settings, use them to generate insights on the frontend
      if (settings.apiKey) {
        const modelName = settings.apiModel === 'custom' ? settings.customModel : (settings.apiModel || 'gpt-5');
        
        // Prepare context from company data - PASSING FULL DATA
        const context = JSON.stringify(data || {});
        
        const prompt = `
          Analyze the following company data (Overview, Projects, Campaigns, Feedbacks) for these areas: ${areas.join(', ')}.
          Sub-filters: ${JSON.stringify(subFilters)}
          Provide 3-5 actionable insights.
          Data: ${context}
          
          Return ONLY a JSON object with this structure:
          {
            "insights": [
              {
                "title": "string",
                "description": "string",
                "priority": "High|Medium|Low",
                "category": "Overview|Projects|Campaigns|Feedbacks",
                "importantForCompany": "string",
                "recommendations": ["string"]
              }
            ]
          }
        `;

        const responseText = await generateText(prompt, modelName);
        return JSON.parse(responseText || '{"insights": []}');
      }

      // Fallback to API or mock
      if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 2000));
        return {
          insights: [
            { id: `mock-${Date.now()}-1`, date: new Date().toISOString().split('T')[0], type: 'Projects', title: 'Improve Mobile UX', description: 'Users report crashes on login.', recommendations: ['Fix login API', 'Add error logging'], importantForCompany: 'Critical for user retention' },
            { id: `mock-${Date.now()}-2`, date: new Date().toISOString().split('T')[0], type: 'Overview', title: 'Feature Request: Dark Mode', description: 'Many users are asking for a dark theme.', recommendations: ['Implement theme switcher'], importantForCompany: 'Enhances accessibility and user experience' }
          ]
        };
      }

      const res = await axios.post('/api/company/insights', { forceRegenerate: true, areas, subFilters }, {
        headers: { 'x-user-id': userId }
      });
      return res.data;
    },
    onSuccess: (newData) => {
      const newCount = insightCount + 1;
      setInsightCount(newCount);
      localStorage.setItem('insight_count', JSON.stringify({ count: newCount, date: new Date().toDateString() }));

      queryClient.setQueryData(['companyInsights'], (oldData: any) => {
        const oldInsights = oldData?.insights || [];
        return {
          ...oldData,
          insights: [...oldInsights, ...newData.insights]
        };
      });
    },
    onError: (error: any) => {
      alert(error.message || 'Failed to generate insights');
    }
  });

  const handleLogout = () => {
    navigate('/');
  };

  const handleExportCSV = () => {
    if (!data?.company) return;
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Project,Campaign,User,Rating,Tags,Comment,Date\n";
    
    data.company.projects?.forEach((p: any) => {
      p.campaigns?.forEach((c: any) => {
        c.feedbacks?.forEach((f: any) => {
          const row = [
            p.name,
            c.name,
            f.userId,
            f.internalRating || '',
            (f.internalTags || []).join(';'),
            `"${(f.description || '').replace(/"/g, '""')}"`,
            f.createdAt
          ].join(",");
          csvContent += row + "\n";
        });
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "feedbacks_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportPDF = () => {
    if (!data?.company) return;
    
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text(`${data.company.name} - Feedback Report`, 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 30);
    
    const tableData: any[] = [];
    
    data.company.projects?.forEach((p: any) => {
      p.campaigns?.forEach((c: any) => {
        c.feedbacks?.forEach((f: any) => {
          tableData.push([
            p.name,
            c.name,
            f.internalRating || 'N/A',
            (f.internalTags || []).join(', '),
            f.description || ''
          ]);
        });
      });
    });

    (doc as any).autoTable({
      startY: 40,
      head: [['Project', 'Campaign', 'Rating', 'Tags', 'Feedback']],
      body: tableData,
      styles: { fontSize: 8 },
      columnStyles: {
        4: { cellWidth: 80 }
      }
    });

    doc.save('feedbacks_report.pdf');
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Loading...</div>;
  }

  if (!data?.company) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50">Company not found or unauthorized.</div>;
  }

  const { company, stats } = data as any;

  const ratingDistribution = [
    { name: '1 Star', value: 0 },
    { name: '2 Stars', value: 0 },
    { name: '3 Stars', value: 0 },
    { name: '4 Stars', value: 0 },
    { name: '5 Stars', value: 0 },
  ];

  let totalRating = 0;
  let ratingCount = 0;

  company.projects.forEach((p: any) => {
    p.campaigns.forEach((c: any) => {
      c.feedbacks.forEach((f: any) => {
        if (f.internalRating) {
          ratingDistribution[f.internalRating - 1].value += 1;
          totalRating += f.internalRating;
          ratingCount += 1;
        }
      });
    });
  });

  const avgRating = ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 'N/A';
  const COLORS = ['#ef4444', '#f97316', '#eab308', '#84cc16', '#22c55e'];

  const getChartData = (data: any[], type: 'line' | 'pie' | 'bar') => {
    if (data && data.length > 0) return data;
    
    // Visual Fallback Data
    if (type === 'line') return [
      { date: 'Day 1', avg: 3.5 }, { date: 'Day 5', avg: 3.8 }, { date: 'Day 10', avg: 4.2 }, 
      { date: 'Day 15', avg: 4.0 }, { date: 'Day 20', avg: 4.5 }, { date: 'Day 25', avg: 4.3 }, { date: 'Day 30', avg: 4.8 }
    ];
    if (type === 'pie') return [
      { name: 'Bug', value: 30 }, { name: 'Feature', value: 45 }, { name: 'Usability', value: 25 }
    ];
    if (type === 'bar') return [
      { name: 'UI/UX', avg: 4.2 }, { name: 'Performance', avg: 3.5 }, { name: 'Features', avg: 4.8 }, { name: 'Bugs', avg: 2.1 }
    ];
    return [];
  };

  const showExplanation = (type: string) => {
    const explanations: Record<string, { title: string, content: string }> = {
      unanswered: {
        title: 'Unanswered Feedback',
        content: 'This metric tracks the number of user feedback items that are still awaiting a response from your team. A high number here can lead to user frustration. Aim to keep this close to zero to demonstrate active engagement.'
      },
      avgResponse: {
        title: 'Average Response Time',
        content: 'This calculates the average time elapsed between a user submitting feedback and your team providing a response. Lower times indicate a more agile and customer-centric support process.'
      },
      directives: {
        title: 'Directives & Tags',
        content: 'Directives are specific classifications or tags assigned to feedback by moderators or your AI analysis. They help categorize issues (e.g., "Critical", "UI", "Suggestion") so you can prioritize your roadmap effectively.'
      }
    };
    setExplanationModal(explanations[type]);
  };

  // ... (rest of component)

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* Explanation Modal */}
      <AnimatePresence>
        {explanationModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6" onClick={() => setExplanationModal(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-8 rounded-3xl w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-black text-slate-900">{explanationModal.title}</h3>
                <button onClick={() => setExplanationModal(null)} className="p-1 hover:bg-slate-100 rounded-full text-slate-400"><LogOut size={20} /></button>
              </div>
              <p className="text-slate-600 leading-relaxed">{explanationModal.content}</p>
              <button onClick={() => setExplanationModal(null)} className="mt-6 w-full py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700">Got it</button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {showSettingsModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6" onClick={() => setShowSettingsModal(false)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white rounded-3xl w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
              <div className="flex border-b border-slate-100">
                <button 
                  onClick={() => setSettingsTab('profile')} 
                  className={clsx("flex-1 py-6 font-bold text-center transition-colors border-b-2", settingsTab === 'profile' ? "text-indigo-600 border-indigo-600 bg-indigo-50/50" : "text-slate-500 border-transparent hover:bg-slate-50")}
                >
                  Company Profile
                </button>
                <button 
                  onClick={() => setSettingsTab('ai')} 
                  className={clsx("flex-1 py-6 font-bold text-center transition-colors border-b-2", settingsTab === 'ai' ? "text-indigo-600 border-indigo-600 bg-indigo-50/50" : "text-slate-500 border-transparent hover:bg-slate-50")}
                >
                  AI & Insights
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto custom-scrollbar">
                {settingsTab === 'profile' && (
                  <div className="space-y-8">
                    <div className="flex items-center gap-6 mb-8">
                      <div className="w-24 h-24 bg-slate-100 rounded-2xl flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-300">
                        {data?.company?.logoUrl ? <img src={data.company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" /> : <Building2 size={40} />}
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-slate-900">Company Identity</h3>
                        <p className="text-slate-500">Manage your company's public profile and branding.</p>
                      </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateSettingsMutation.mutate({
                            name: formData.get('name'),
                            logoUrl: formData.get('logoUrl')
                        });
                    }} className="space-y-6 max-w-2xl">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company Name</label>
                            <input name="name" defaultValue={data?.company?.name} className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Logo URL</label>
                            <input name="logoUrl" defaultValue={data?.company?.logoUrl} placeholder="https://..." className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" />
                            <p className="text-xs text-slate-400 mt-2">Recommended size: 200x200px (Square)</p>
                        </div>
                        <div className="pt-4">
                          <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">Save Changes</button>
                        </div>
                    </form>
                  </div>
                )}

                {settingsTab === 'ai' && (
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-indigo-50 to-white p-6 rounded-2xl border border-indigo-100 mb-8">
                      <div className="flex items-start gap-4">
                        <div className="p-3 bg-indigo-100 text-indigo-600 rounded-xl">
                          <BrainCircuit size={24} />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-indigo-900 mb-1">AI Context Configuration</h3>
                          <p className="text-indigo-700/80 text-sm mb-4">Configure how our AI understands your business to generate better insights.</p>
                          <button type="button" onClick={() => { setShowAIWizard(true); setShowSettingsModal(false); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition-colors shadow-sm">
                              Open Configuration Wizard
                          </button>
                        </div>
                      </div>
                    </div>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        const aiSettings = {
                            aiEnabled: formData.get('aiEnabled') === 'on',
                            aiProvider: formData.get('aiProvider'),
                            apiKey: formData.get('apiKey'),
                            apiModel: formData.get('apiModel'),
                            customModel: formData.get('customModel')
                        };
                        
                        // Save to localStorage for testing as requested
                        localStorage.setItem('ai_settings', JSON.stringify(aiSettings));
                        
                        updateSettingsMutation.mutate(aiSettings);
                    }} className="space-y-8 max-w-2xl">
                        <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
                            <div>
                                <h4 className="font-bold text-slate-900">Enable AI Features</h4>
                                <p className="text-xs text-slate-500">Enable AI insights and campaign generation assistance.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input 
                                    type="checkbox" 
                                    name="aiEnabled" 
                                    defaultChecked={JSON.parse(localStorage.getItem('ai_settings') || '{}').aiEnabled ?? true} 
                                    className="sr-only peer" 
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>

                        <div>
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2"><Settings size={18} /> Provider Settings</h3>
                            <div className="flex gap-4 mb-6">
                                <label className="flex-1 cursor-pointer group">
                                    <input type="radio" name="aiProvider" value="openai" defaultChecked={(JSON.parse(localStorage.getItem('ai_settings') || '{}').aiProvider || data?.company?.aiProvider) === 'openai'} className="peer sr-only" />
                                    <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-emerald-500 peer-checked:bg-emerald-50 peer-checked:text-emerald-700 font-bold text-center transition-all group-hover:border-slate-300">OpenAI</div>
                                </label>
                                <label className="flex-1 cursor-pointer group">
                                    <input type="radio" name="aiProvider" value="gemini" defaultChecked={(JSON.parse(localStorage.getItem('ai_settings') || '{}').aiProvider || data?.company?.aiProvider) === 'gemini'} className="peer sr-only" />
                                    <div className="p-4 rounded-xl border-2 border-slate-200 peer-checked:border-blue-500 peer-checked:bg-blue-50 peer-checked:text-blue-700 font-bold text-center transition-all group-hover:border-slate-300">Gemini</div>
                                </label>
                            </div>
                            
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-700 mb-2">API Key</label>
                                    <input 
                                        name="apiKey" 
                                        type="password" 
                                        defaultValue={JSON.parse(localStorage.getItem('ai_settings') || '{}').apiKey || data?.company?.apiKey} 
                                        placeholder="sk-..." 
                                        className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                                    />
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Model Selection</label>
                                        <select 
                                            name="apiModel" 
                                            defaultValue={JSON.parse(localStorage.getItem('ai_settings') || '{}').apiModel || data?.company?.apiModel} 
                                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-white"
                                        >
                                            <option value="">Select a model...</option>
                                            <option value="gpt-4o">GPT-4o</option>
                                            <option value="gpt-4-turbo">GPT-4 Turbo</option>
                                            <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                                            <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                                            <option value="custom">Custom Model</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-bold text-slate-700 mb-2">Custom Model Name</label>
                                        <input 
                                            name="customModel" 
                                            defaultValue={JSON.parse(localStorage.getItem('ai_settings') || '{}').customModel} 
                                            placeholder="e.g. gemini-2.0-flash-exp" 
                                            className="w-full p-4 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4 border-t border-slate-100">
                            <button type="submit" className="px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200">Save API Configuration</button>
                        </div>
                    </form>
                  </div>
                )}
              </div>
              
              <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end">
                <button onClick={() => setShowSettingsModal(false)} className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-200 rounded-xl transition-colors">Close</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
                {company.logoUrl ? <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-xl" /> : <Building2 size={24} />}
              </div>
              <span className="font-black text-xl tracking-tight text-slate-900">{company.name}</span>
            </div>

            <div className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
              {[
                { id: 'overview', label: 'Overview', icon: BarChart3 },
                { id: 'projects', label: 'Projects', icon: FolderKanban },
                { id: 'campaigns', label: 'Campaigns', icon: Megaphone },
                { id: 'moderated', label: 'Moderated', icon: Shield },
                { id: 'insights', label: 'Insights', icon: BrainCircuit },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={clsx(
                    "flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all",
                    activeTab === item.id 
                      ? "bg-white text-indigo-600 shadow-sm" 
                      : "text-slate-500 hover:text-slate-700 hover:bg-slate-200/50"
                  )}
                >
                  <item.icon size={16} />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-2 pr-4 border-r border-slate-200">
              <button onClick={handleExportCSV} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Export CSV">
                <Download size={20} />
              </button>
              <button onClick={handleExportPDF} className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all" title="Export PDF">
                <FileText size={20} />
              </button>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 p-1.5 pr-3 hover:bg-slate-100 rounded-xl transition-all border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 bg-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                  <User size={18} />
                </div>
                <div className="text-left hidden sm:block">
                  <div className="text-xs font-black text-slate-900 leading-none mb-1">Company Admin</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Settings & Profile</div>
                </div>
                <ChevronDown size={14} className={clsx("text-slate-400 transition-transform", showUserMenu && "rotate-180")} />
              </button>

              <AnimatePresence>
                {showUserMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowUserMenu(false)} />
                    <motion.div 
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50"
                    >
                      <button 
                        onClick={() => { setShowSettingsModal(true); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <Settings size={18} className="text-slate-400" />
                        Company Settings
                      </button>
                      <button 
                        onClick={() => { setShowAIWizard(true); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-emerald-600 hover:bg-emerald-50 transition-colors"
                      >
                        <BrainCircuit size={18} />
                        AI Context Wizard
                      </button>
                      <div className="h-px bg-slate-100 my-2" />
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-rose-600 hover:bg-rose-50 transition-colors"
                      >
                        <LogOut size={18} />
                        Sign Out
                      </button>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </nav>

      {/* Campaign Wizard */}
      {showCampaignWizard && selectedProject && (
        <CampaignWizard 
          projectId={selectedProject.id}
          onClose={() => setShowCampaignWizard(false)}
          onSave={(data) => createCampaignMutation.mutate(data)}
        />
      )}
      <AnimatePresence>
        {showNewProjectModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-8 rounded-3xl w-full max-w-md">
              <h2 className="text-2xl font-black mb-6">New Project</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createProjectMutation.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Project Name</label>
                  <input name="name" required className="w-full p-4 rounded-xl border border-slate-200" placeholder="e.g., Mobile App Launch" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea name="description" rows={3} className="w-full p-4 rounded-xl border border-slate-200" placeholder="What is this project about?" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowNewProjectModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Create Project</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Campaign Modal */}
      <AnimatePresence>
        {showNewCampaignModal && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-6">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-8 rounded-3xl w-full max-w-md">
              <h2 className="text-2xl font-black mb-6">New Campaign</h2>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                createCampaignMutation.mutate({
                  name: formData.get('name') as string,
                  description: formData.get('description') as string,
                  projectId: selectedProject.id
                });
              }} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Campaign Name</label>
                  <input name="name" required className="w-full p-4 rounded-xl border border-slate-200" placeholder="e.g., Q1 User Survey" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">Description</label>
                  <textarea name="description" rows={3} className="w-full p-4 rounded-xl border border-slate-200" placeholder="What is this campaign about?" />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowNewCampaignModal(false)} className="flex-1 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-colors">Create Campaign</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6 md:p-10">
        <div className="mb-8">
          <h1 className="text-2xl font-black tracking-tight capitalize">{activeTab}</h1>
        </div>
        <AnimatePresence mode="wait">
          {activeTab === 'overview' && (
            <motion.div key="overview" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="space-y-8 max-w-6xl mx-auto">
              
              {/* 6-Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Navigation Cards */}
                <OverviewCard label="Total Projects" stat={stats.totalProjects} icon={FolderKanban} color="text-indigo-500" onClick={() => setActiveTab('projects')} />
                <OverviewCard label="Total Campaigns" stat={stats.totalCampaigns} icon={Megaphone} color="text-blue-500" onClick={() => setActiveTab('projects')} />
                <OverviewCard label="Total Feedbacks" stat={stats.totalFeedbacks} icon={BarChart3} color="text-emerald-500" onClick={() => setActiveTab('moderated')} />
                
                {/* Status/Explanation Cards */}
                <div onClick={() => showExplanation('unanswered')} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-rose-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <AlertCircle size={24} />
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-full text-slate-400 group-hover:bg-rose-50 group-hover:text-rose-500 transition-colors">
                      <Info size={16} />
                    </div>
                  </div>
                  <div className="text-4xl font-black text-rose-600 mb-1">{stats.statusMetrics.unanswered}</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Unanswered</div>
                </div>

                <div onClick={() => showExplanation('avgResponse')} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-indigo-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <Clock size={24} />
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-full text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                      <Info size={16} />
                    </div>
                  </div>
                  <div className="text-4xl font-black text-indigo-600 mb-1">{stats.statusMetrics.averageResponseTime}h</div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Avg Response Time</div>
                </div>

                <div onClick={() => showExplanation('directives')} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md hover:border-emerald-200 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl group-hover:scale-110 transition-transform">
                      <Tag size={24} />
                    </div>
                    <div className="p-1.5 bg-slate-50 rounded-full text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-500 transition-colors">
                      <Info size={16} />
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-2 min-h-[40px] content-start">
                    {Object.entries(stats.statusMetrics.directives).length > 0 ? (
                      Object.entries(stats.statusMetrics.directives).slice(0, 3).map(([status, count]: any) => (
                        <span key={status} className="px-2 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">{status}: {count}</span>
                      ))
                    ) : (
                      <span className="text-slate-400 text-sm italic">No directives yet</span>
                    )}
                  </div>
                  <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">Directives</div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 1. Evolution of Averages */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Rating Evolution (30 Days)</h3>
                    {Object.keys(stats.evolution).length === 0 && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Simulated Data</span>}
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={getChartData(Object.entries(stats.evolution).map(([date, data]: any) => ({ date, avg: data.sum / data.count })), 'line')}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 5]} />
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Line type="monotone" dataKey="avg" stroke="#4f46e5" strokeWidth={3} dot={{ r: 4, fill: '#4f46e5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 2. Distribution by Type */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Feedback Distribution</h3>
                    {Object.keys(stats.typeDistribution).length === 0 && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Simulated Data</span>}
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie 
                          data={getChartData(Object.entries(stats.typeDistribution).map(([name, value]) => ({ name, value })), 'pie')} 
                          innerRadius={60} 
                          outerRadius={80} 
                          paddingAngle={5} 
                          dataKey="value"
                        >
                          {getChartData(Object.entries(stats.typeDistribution), 'pie').map((_: any, index: number) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                        </Pie>
                        <RechartsTooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 3. Measures by Category */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-bold text-slate-800">Category Performance</h3>
                    {Object.keys(stats.categoryMeasures).length === 0 && <span className="text-xs font-bold bg-slate-100 text-slate-500 px-2 py-1 rounded">Simulated Data</span>}
                  </div>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={getChartData(Object.entries(stats.categoryMeasures).map(([name, data]: any) => ({ name, avg: data.sum / data.count })), 'bar')}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10 }} />
                        <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12 }} domain={[0, 5]} />
                        <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                        <Bar dataKey="avg" fill="#10b981" radius={[6, 6, 0, 0]} barSize={40} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* 4. Top Users */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
                  <h3 className="text-lg font-bold text-slate-800 mb-6">Top Contributors</h3>
                  <div className="space-y-4 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                    {stats.topUsers?.length > 0 ? (
                      stats.topUsers.map(([userId, count]: any, index: number) => (
                        <div key={userId} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center font-black text-sm">
                              {index + 1}
                            </div>
                            <div>
                              <span className="font-bold text-slate-700 block text-sm">User {userId.slice(0, 6)}...</span>
                              <span className="text-xs text-slate-400 font-medium">Rank #{index + 1}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="font-black text-indigo-600 text-lg">{count}</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase">Feedbacks</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-10 text-slate-400 italic">
                        No active contributors yet.
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div key="projects" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              {selectedCampaign ? (
                <CampaignDetail 
                  campaign={selectedCampaign} 
                  onBack={() => setSelectedCampaign(null)} 
                />
              ) : !selectedProject ? (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">Your Projects</h2>
                    <button onClick={() => setShowNewProjectModal(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-sm">
                      <Plus size={18} /> New Project
                    </button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.projects?.map((project: any) => (
                      <div key={project.id} onClick={() => setSelectedProject(project)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <FolderKanban size={24} />
                          </div>
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-bold">{project.campaigns.length} Campaigns</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-2">{project.name}</h3>
                        <p className="text-slate-500 text-sm line-clamp-2 mb-4">{project.description || 'No description provided.'}</p>
                        <div className="flex items-center justify-between text-sm font-bold text-indigo-600">
                          View Details <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <button onClick={() => setSelectedProject(null)} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold transition-colors">
                      <ArrowLeft size={20} /> Back to Projects
                    </button>
                    <div className="flex gap-2">
                      <button onClick={handleExportCSV} className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-bold transition-colors shadow-sm text-sm">
                        <Download size={16} /> Export Project CSV
                      </button>
                      <button onClick={() => setShowCampaignWizard(true)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 font-bold transition-colors shadow-sm">
                        <Plus size={18} /> New Campaign
                      </button>
                    </div>
                  </div>
                  <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200 mb-8">
                    <h2 className="text-3xl font-black text-slate-900 mb-2">{selectedProject.name}</h2>
                    <p className="text-slate-500 text-lg mb-6">{selectedProject.description}</p>
                    <div className="grid grid-cols-3 gap-6">
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Campaigns</div>
                            <div className="text-3xl font-black text-slate-800">{selectedProject.campaigns.length}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Total Feedbacks</div>
                            <div className="text-3xl font-black text-slate-800">{selectedProject.campaigns.reduce((acc: number, c: any) => acc + c.feedbacks.length, 0)}</div>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Avg Rating</div>
                            <div className="text-3xl font-black text-slate-800">4.2</div>
                        </div>
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-slate-800 mb-6">Campaigns</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {selectedProject.campaigns.map((campaign: any) => (
                      <div key={campaign.id} onClick={() => setSelectedCampaign(campaign)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-6">
                          <h4 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            <Megaphone className="text-indigo-500" size={20} /> {campaign.name}
                          </h4>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">{campaign.status}</span>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-6">
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Feedbacks</div>
                            <div className="text-2xl font-black text-slate-800">{campaign.feedbacks.length}</div>
                          </div>
                          <div className="bg-slate-50 p-4 rounded-2xl">
                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Progress</div>
                            <div className="text-2xl font-black text-slate-800">{campaign.progress}%</div>
                          </div>
                        </div>
                        <div className="flex items-center justify-between text-sm font-bold text-indigo-600">
                          View Campaign Details <ChevronRight size={16} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'campaigns' && (
            <motion.div key="campaigns" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              {selectedCampaign ? (
                <CampaignDetail 
                  campaign={selectedCampaign} 
                  onBack={() => setSelectedCampaign(null)} 
                />
              ) : (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-slate-800">All Campaigns</h2>
                    <div className="flex gap-2">
                      <select className="p-2 rounded-xl border border-slate-200 text-sm font-bold">
                        <option>All Status</option>
                        <option>Active</option>
                        <option>Draft</option>
                        <option>Closed</option>
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {company.projects.flatMap((p: any) => p.campaigns).map((campaign: any) => (
                      <div key={campaign.id} onClick={() => setSelectedCampaign(campaign)} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 hover:border-indigo-200 transition-all cursor-pointer group">
                        <div className="flex justify-between items-center mb-4">
                          <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl group-hover:scale-110 transition-transform">
                            <Megaphone size={24} />
                          </div>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold uppercase tracking-wider">{campaign.status}</span>
                        </div>
                        <h3 className="text-xl font-bold text-slate-900 mb-1">{campaign.name}</h3>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">Project: {company.projects.find((p: any) => p.campaigns.some((c: any) => c.id === campaign.id))?.name}</p>
                        
                        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
                          <div className="flex items-center gap-2">
                            <MessageSquare size={14} className="text-slate-400" />
                            <span className="text-sm font-bold text-slate-600">{campaign.feedbacks.length}</span>
                          </div>
                          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm">
                            Details <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )}
          {activeTab === 'insights' && (
            <motion.div key="insights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="max-w-6xl mx-auto">
              {isLoadingInsights ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
                </div>
              ) : (
                <InsightsView
                  isGenerating={generateInsightsMutation.isPending}
                  onGenerate={(filters) => generateInsightsMutation.mutate(filters)}
                  projects={data?.company?.projects || []}
                  campaigns={data?.company?.projects?.flatMap((p: any) => p.campaigns || []) || []}
                  insightCount={insightCount}
                  insights={(insightsData?.insights || []).map((i: any, index: number) => ({
                    id: i.id || `${Date.now()}-${index}`,
                    date: i.date || '2026-03-05',
                    type: (['Overview', 'Projects', 'Campaigns', 'Feedbacks'].includes(i.category) ? i.category : 'Overview') as any,
                    keyword: i.title || 'Insight',
                    summary: i.description || '',
                    details: i.description || '',
                    recommendations: i.recommendations || [],
                    importantForCompany: i.importantForCompany || 'Strategic priority'
                  }))}
                />
              )}
            </motion.div>
          )}
          {activeTab === 'moderated' && (
            <motion.div key="moderated" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
              <ModeratedFeedbacksTab 
                feedbacks={data.company.projects.flatMap((p: any) => p.campaigns.flatMap((c: any) => c.feedbacks.map((f: any) => ({
                    ...f,
                    status: f.status || 'approved',
                    moderatorComment: f.moderatorComment || 'Great feedback, very detailed.',
                    projectName: p.name,
                    campaignName: c.name,
                    userName: f.userId === 'u1' ? 'Alice Johnson' : 'Bob Smith', // Mock names
                    userAvatar: f.userId === 'u1' ? 'https://i.pravatar.cc/150?u=a' : 'https://i.pravatar.cc/150?u=b',
                    title: f.description.substring(0, 30) + (f.description.length > 30 ? '...' : ''), // Derive title from description
                    internalRating: f.internalRating || 4,
                    internalTags: f.internalTags || ['Usability']
                }))))}
                onRespond={(id, response, bonusPoints) => {
                  // In a real app, this would be a mutation
                  console.log('Responding to', id, response, 'Bonus:', bonusPoints);
                  alert(`Response sent! +${bonusPoints} XP awarded to user.`);
                  // Optimistic update for mock
                  const feedback = data.company.projects
                    .flatMap((p: any) => p.campaigns)
                    .flatMap((c: any) => c.feedbacks)
                    .find((f: any) => f.id === id);
                  if (feedback) {
                    feedback.companyResponse = response;
                    queryClient.invalidateQueries({ queryKey: ['companyDashboard'] });
                  }
                }}
              />
            </motion.div>
          )}



          {showAIWizard && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-6" onClick={() => setShowAIWizard(false)}>
                <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="bg-white p-8 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-black flex items-center gap-3 text-emerald-600">
                            <BrainCircuit size={28} /> AI Context Wizard
                        </h2>
                        <button onClick={() => setShowAIWizard(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-500">
                            <LogOut size={20} />
                        </button>
                    </div>
                    
                    <p className="text-slate-600 mb-8">
                        Provide context about your company to help the AI generate more relevant and actionable insights.
                        The more details you provide, the better the recommendations will be.
                    </p>

                    <form onSubmit={(e) => {
                        e.preventDefault();
                        const formData = new FormData(e.currentTarget);
                        updateSettingsMutation.mutate({
                            aiContext: formData.get('aiContext'),
                            aiGoals: formData.get('aiGoals')
                        });
                        setShowAIWizard(false);
                    }} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Company Context</label>
                            <p className="text-xs text-slate-500 mb-2">Describe what your company does, your target audience, and your unique value proposition.</p>
                            <textarea 
                                name="aiContext" 
                                defaultValue={data?.company?.aiContext} 
                                rows={6} 
                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                                placeholder="e.g., We are a SaaS company providing project management tools for creative agencies..."
                            ></textarea>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-700 mb-2">Strategic Goals</label>
                            <p className="text-xs text-slate-500 mb-2">What are your main objectives for the next quarter? (e.g., Improve retention, Increase user engagement)</p>
                            <textarea 
                                name="aiGoals" 
                                defaultValue={data?.company?.aiGoals} 
                                rows={4} 
                                className="w-full p-4 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition-all resize-none"
                                placeholder="e.g., Reduce churn by 5%, Launch mobile app feature..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                            <button type="button" onClick={() => setShowAIWizard(false)} className="px-6 py-3 text-slate-600 font-bold hover:bg-slate-50 rounded-xl transition-colors">Cancel</button>
                            <button type="submit" className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200">Save Context</button>
                        </div>
                    </form>
                </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
