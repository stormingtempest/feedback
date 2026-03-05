'use client';
import React, { useState, useEffect } from 'react';
import { ShieldCheck, Building2, Plus, Users, Search, LogOut, FolderKanban, UserCog, ShieldAlert, MessageSquareWarning, CheckCircle2, XCircle, Clock, MoreVertical, GripHorizontal, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { clsx } from 'clsx';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { IS_MOCK } from '../config/env';
import { mockAdminData, mockOrganizations } from '../services/mockData';

import { ModerationTab } from '../components/ModerationTab';

const initialCards = [
  { id: 'organizations', label: 'Organizations', icon: Building2, stat: '0', subtext: 'Registered', color: 'text-blue-500', bg: 'bg-blue-50' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, stat: '0', subtext: 'Active', color: 'text-indigo-500', bg: 'bg-indigo-50' },
  { id: 'users', label: 'Users', icon: Users, stat: '0', subtext: 'Total', color: 'text-emerald-500', bg: 'bg-emerald-50' },
  { id: 'managers', label: 'Managers', icon: UserCog, stat: '0', subtext: 'Active', color: 'text-purple-500', bg: 'bg-purple-50' },
  { id: 'moderators', label: 'Moderators', icon: ShieldAlert, stat: '0', subtext: 'Active', color: 'text-pink-500', bg: 'bg-pink-50' },
  { id: 'moderation', label: 'Moderation', icon: MessageSquareWarning, stat: '0', subtext: 'Pending', color: 'text-amber-500', bg: 'bg-amber-50' },
];

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [modTab, setModTab] = useState('pending');
  const router = useRouter();
  const queryClient = useQueryClient();

  const [cardsOrder, setCardsOrder] = useState(() => {
    const userRole = localStorage.getItem('userRole') || 'ADMIN';
    if (userRole === 'MODERATOR') {
      return ['moderation', 'user_dashboard'];
    }
    const savedOrder = localStorage.getItem('adminCardsOrder');
    if (savedOrder) {
      try {
        return JSON.parse(savedOrder);
      } catch (e) {
        return initialCards.map(c => c.id);
      }
    }
    return initialCards.map(c => c.id);
  });

  // Force update cards order if role changes (e.g. after login)
  useEffect(() => {
    const userRole = localStorage.getItem('userRole') || 'ADMIN';
    if (userRole === 'MODERATOR') {
      setCardsOrder(['moderation', 'user_dashboard']);
    }
  }, []);

  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  const [showOrgModal, setShowOrgModal] = useState(false);
  const [newOrgData, setNewOrgData] = useState({ name: '', managerName: '', managerEmail: '', managerPassword: '' });

  // --- API Queries ---
  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockAdminData;
      }
      const res = await axios.get('api/admin/stats');
      return res.data;
    }
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['adminOrganizations'],
    queryFn: async () => {
      if (IS_MOCK) {
        await new Promise(resolve => setTimeout(resolve, 500));
        return mockOrganizations;
      }
      const res = await axios.get('api/admin/organizations');
      return res.data;
    },
    enabled: activeTab === 'organizations' || activeTab === 'moderation' || IS_MOCK
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['adminProjects'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/projects');
      return res.data;
    },
    enabled: activeTab === 'projects'
  });

  const { data: usersList = [] } = useQuery({
    queryKey: ['adminUsers'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/users');
      return res.data;
    },
    enabled: ['users', 'managers', 'moderators'].includes(activeTab || '')
  });

  const { data: feedbacks = [] } = useQuery({
    queryKey: ['adminFeedbacks'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/feedbacks');
      return res.data;
    },
    enabled: activeTab === 'moderation'
  });

  // --- Mutations ---
  const createOrgMutation = useMutation({
    mutationFn: async (data: any) => axios.post('/api/admin/organizations', data),
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ['adminOrganizations'] }); 
      queryClient.invalidateQueries({ queryKey: ['adminStats'] }); 
      setShowOrgModal(false);
      setNewOrgData({ name: '', managerName: '', managerEmail: '', managerPassword: '' });
    }
  });

  const createProjectMutation = useMutation({
    mutationFn: async ({ name, companyId }: { name: string, companyId: string }) => axios.post('/api/admin/projects', { name, companyId }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminProjects'] }); queryClient.invalidateQueries({ queryKey: ['adminStats'] }); }
  });

  const updateUserMutation = useMutation({
    mutationFn: async ({ id, role, status }: { id: string, role?: string, status?: string }) => axios.put(`/api/admin/users/${id}`, { role, status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminUsers'] }); queryClient.invalidateQueries({ queryKey: ['adminStats'] }); }
  });

  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => axios.put(`/api/admin/projects/${id}`, { status }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['adminProjects'] })
  });

  const moderateFeedbackMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => axios.put(`/api/admin/feedbacks/${id}/moderate`, { status }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['adminFeedbacks'] }); queryClient.invalidateQueries({ queryKey: ['adminStats'] }); }
  });

  // --- Handlers ---
  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIdx(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === index) return;
    
    const newOrder = [...cardsOrder];
    const draggedId = newOrder[draggedIdx];
    newOrder.splice(draggedIdx, 1);
    newOrder.splice(index, 0, draggedId);
    
    setDraggedIdx(index);
    setCardsOrder(newOrder);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
    localStorage.setItem('adminCardsOrder', JSON.stringify(cardsOrder));
  };

  const handleLogout = () => {
    router.push('/');
  };

  const handleCreateOrg = () => {
    setShowOrgModal(true);
  };

  const submitNewOrg = (e: React.FormEvent) => {
    e.preventDefault();
    createOrgMutation.mutate(newOrgData);
  };

  const handleCreateProject = () => {
    if (organizations.length === 0) {
      alert('You need to create an organization first.');
      return;
    }
    const name = prompt('Enter project name:');
    if (name) {
      // For simplicity, assign to the first organization
      createProjectMutation.mutate({ name, companyId: organizations[0].id });
    }
  };

  // Prepare cards with stats
  const userRole = localStorage.getItem('userRole') || 'ADMIN';
  
  let visibleCards = cardsOrder;
  if (userRole === 'MODERATOR') {
    visibleCards = ['moderation', 'user_dashboard'];
  }

  const cards = visibleCards.map((id: string) => {
    if (id === 'user_dashboard') {
      return { id: 'user_dashboard', label: 'User Area', icon: Users, stat: 'Go', subtext: 'To Dashboard', color: 'text-indigo-500', bg: 'bg-indigo-50' };
    }
    const baseCard = initialCards.find(c => c.id === id);
    if (!baseCard) return null;

    let stat = '0';
    if (stats) {
      if (id === 'organizations') stat = stats.organizations.toString();
      if (id === 'projects') stat = stats.projects.toString();
      if (id === 'users') stat = stats.users.toString();
      if (id === 'managers') stat = stats.managers.toString();
      if (id === 'moderators') stat = stats.moderators.toString();
      if (id === 'moderation') stat = stats.moderation.pending.toString();
    }
    return { ...baseCard, stat };
  }).filter(Boolean);

  const moderationStats = stats?.moderation || { pending: 0, approved: 0, rejected: 0, total: 0 };
  const filteredFeedbacks = feedbacks?.filter((f: any) => f.status === modTab) || [];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
      <AnimatePresence mode="wait">
        {!activeTab ? (
          <motion.div 
            key="dashboard"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="p-6 md:p-10 max-w-7xl mx-auto"
          >
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-slate-900 text-white rounded-2xl shadow-lg shadow-slate-900/20">
                  <ShieldCheck size={32} />
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight">{userRole === 'MODERATOR' ? 'Moderator Dashboard' : 'Admin Dashboard'}</h1>
                  <p className="text-slate-500 font-medium">Drag cards to reorder your priorities</p>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-bold shadow-sm"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {cards.map((card, idx) => (
                <motion.div
                  layout
                  key={card.id}
                  draggable
                  onDragStart={(e: any) => handleDragStart(e, idx)}
                  onDragOver={(e: any) => handleDragOver(e, idx)}
                  onDragEnd={handleDragEnd}
                  onClick={() => {
                    if (card.id === 'user_dashboard') {
                      router.push('/dashboard');
                    } else {
                      setActiveTab(card.id);
                    }
                  }}
                  className={clsx(
                    "bg-white p-6 rounded-[32px] shadow-sm border-2 border-transparent hover:border-indigo-100 hover:shadow-xl transition-all cursor-pointer group relative overflow-hidden",
                    draggedIdx === idx ? "opacity-50 scale-95" : "opacity-100"
                  )}
                >
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing">
                    <GripHorizontal className="text-slate-300 hover:text-slate-500" size={24} />
                  </div>
                  
                  <div className="flex flex-col h-full">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${card.bg} ${card.color}`}>
                      <card.icon size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">{card.label}</h3>
                    <div className="mt-auto flex items-baseline gap-2">
                      <span className="text-5xl font-black tracking-tighter">{card.stat}</span>
                      <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1.5">{card.subtext}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="detail-view"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.3 }}
            className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen flex flex-col"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => setActiveTab(null)} 
                  className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm group"
                >
                  <ArrowLeft size={24} className="text-slate-500 group-hover:text-slate-900 transition-colors" />
                </button>
                <div>
                  <h1 className="text-3xl font-black capitalize tracking-tight flex items-center gap-3">
                    {cards.find(c => c.id === activeTab)?.label}
                  </h1>
                </div>
              </div>
              <button 
                onClick={handleLogout} 
                className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 transition-all font-bold shadow-sm"
              >
                <LogOut size={18} /> Logout
              </button>
            </div>

            <div className="flex-1 bg-white rounded-[32px] shadow-xl border border-slate-200 overflow-hidden flex flex-col">
              
              {/* Organizations Tab */}
              {activeTab === 'organizations' && (
                <>
                  <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">Registered Organizations</h2>
                      <p className="text-sm text-slate-500 font-medium">Manage all companies using the platform.</p>
                    </div>
                    <button onClick={handleCreateOrg} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-md w-full md:w-auto justify-center">
                      <Plus size={18} /> New Organization
                    </button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Organization</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Manager</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Projects</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 md:px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {organizations?.map((org: any) => (
                          <tr key={org.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
                                  <Building2 size={20} />
                                </div>
                                <span className="font-bold text-slate-900 text-base">{org.name}</span>
                              </div>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-slate-600 font-medium text-base">
                              {org.manager}
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-slate-600 font-bold text-base">
                              {org.projects}
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <span className={clsx(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                org.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                              )}>
                                {org.status}
                              </span>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-right">
                              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                                <MoreVertical size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Projects Tab */}
              {activeTab === 'projects' && (
                <>
                  <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">All Projects</h2>
                      <p className="text-sm text-slate-500 font-medium">Overview of all active and past campaigns.</p>
                    </div>
                    <button onClick={handleCreateProject} className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors font-bold shadow-md w-full md:w-auto justify-center">
                      <Plus size={18} /> New Project
                    </button>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Project Name</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Organization</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Manager</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 md:px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {projects?.map((proj: any) => (
                          <tr key={proj.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <span className="font-bold text-slate-900 text-base">{proj.name}</span>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-slate-500 font-medium">
                              {proj.org}
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-slate-500 font-medium">
                              {proj.manager}
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <span className={clsx(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                proj.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              )}>
                                {proj.status}
                              </span>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-right">
                              <button 
                                onClick={() => updateProjectMutation.mutate({ id: proj.id, status: proj.status === 'Active' ? 'Closed' : 'Active' })}
                                className="text-sm font-bold text-rose-500 hover:text-rose-700 mr-4"
                              >
                                {proj.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                              <button className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors">
                                <MoreVertical size={20} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Users, Managers, Moderators Tabs */}
              {['users', 'managers', 'moderators'].includes(activeTab) && (
                <>
                  <div className="p-6 md:p-8 border-b border-slate-100 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-slate-50/50">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 capitalize">{activeTab} Directory</h2>
                      <p className="text-sm text-slate-500 font-medium">Manage roles and access permissions.</p>
                    </div>
                    <div className="relative w-full md:w-auto">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                      <input 
                        type="text" 
                        placeholder={`Search ${activeTab}...`}
                        className="w-full md:w-80 pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto flex-1">
                    <table className="w-full">
                      <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">User</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Role</th>
                          <th className="px-6 md:px-8 py-5 text-left text-xs font-bold text-slate-400 uppercase tracking-widest">Status</th>
                          <th className="px-6 md:px-8 py-5 text-right text-xs font-bold text-slate-400 uppercase tracking-widest">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {usersList?.filter((u: any) => 
                          activeTab === 'users' ? true : 
                          activeTab === 'managers' ? u.role === 'MANAGER' : 
                          u.role === 'MODERATOR'
                        ).map((user: any) => (
                          <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600 font-black text-lg shadow-inner">
                                  {user.name.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-slate-900 text-base">{user.name}</p>
                                  <p className="text-sm text-slate-500 font-medium">{user.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <span className="text-base font-bold text-slate-700">{user.role}</span>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap">
                              <span className={clsx(
                                "px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider",
                                user.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                              )}>
                                {user.status}
                              </span>
                            </td>
                            <td className="px-6 md:px-8 py-5 whitespace-nowrap text-right">
                              <button 
                                onClick={() => {
                                  const newRole = prompt('Enter new role (USER, MANAGER, MODERATOR, ADMIN):', user.role);
                                  if (newRole) updateUserMutation.mutate({ id: user.id, role: newRole.toUpperCase() });
                                }}
                                className="text-sm font-bold text-indigo-600 hover:text-indigo-800 mr-6"
                              >
                                Edit Role
                              </button>
                              <button 
                                onClick={() => updateUserMutation.mutate({ id: user.id, status: user.status === 'Active' ? 'Inactive' : 'Active' })}
                                className="text-sm font-bold text-rose-500 hover:text-rose-700"
                              >
                                {user.status === 'Active' ? 'Deactivate' : 'Activate'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}

              {/* Moderation Tab */}
              {activeTab === 'moderation' && (
                <ModerationTab organizations={organizations} />
              )}

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* New Organization Modal */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-900">New Organization</h3>
              <button onClick={() => setShowOrgModal(false)} className="text-slate-400 hover:text-slate-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={submitNewOrg} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1">Organization Name</label>
                <input 
                  type="text" 
                  required
                  value={newOrgData.name}
                  onChange={e => setNewOrgData({...newOrgData, name: e.target.value})}
                  className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                  placeholder="e.g. Acme Corp"
                />
              </div>
              <div className="pt-4 border-t border-slate-100">
                <h4 className="text-sm font-bold text-slate-900 mb-3">Manager Details</h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Name</label>
                    <input 
                      type="text" 
                      required
                      value={newOrgData.managerName}
                      onChange={e => setNewOrgData({...newOrgData, managerName: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="Manager Name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Email</label>
                    <input 
                      type="email" 
                      required
                      value={newOrgData.managerEmail}
                      onChange={e => setNewOrgData({...newOrgData, managerEmail: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="manager@acme.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 mb-1">Password</label>
                    <input 
                      type="password" 
                      required
                      value={newOrgData.managerPassword}
                      onChange={e => setNewOrgData({...newOrgData, managerPassword: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setShowOrgModal(false)}
                  className="px-5 py-2 text-slate-600 font-bold hover:bg-slate-50 rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 shadow-md"
                >
                  Create Organization
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};
