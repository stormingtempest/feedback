'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, LogOut, MessageSquareWarning, Users, ChevronRight, LayoutDashboard, Bell, Search, User } from 'lucide-react';
import { clsx } from 'clsx';
import { ModerationTab } from '../components/ModerationTab';
import { useQuery } from '@tanstack/react-query';
import { api as axios } from '@/lib/axios-client';

export const ModeratorPanel = () => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const userId = localStorage.getItem('userId');

  const { data: stats } = useQuery({
    queryKey: ['adminStats'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/stats');
      return res.data;
    }
  });

  const { data: organizations = [] } = useQuery({
    queryKey: ['adminOrganizations'],
    queryFn: async () => {
      const res = await axios.get('/api/admin/organizations');
      return res.data;
    }
  });

  const handleLogout = () => {
    localStorage.removeItem('userId');
    localStorage.removeItem('userRole');
    router.push('/');
  };

  const cards = [
    { 
      id: 'moderation', 
      label: 'Moderation Queue', 
      description: 'Review and approve pending feedback from all companies.',
      icon: MessageSquareWarning, 
      stat: stats?.moderation?.pending?.toString() || '0', 
      subtext: 'Pending Items', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50',
      borderColor: 'hover:border-amber-200'
    },
    { 
      id: 'user_dashboard', 
      label: 'User Dashboard', 
      description: 'Switch to your personal dashboard to view your own feedback.',
      icon: LayoutDashboard, 
      stat: 'Switch', 
      subtext: 'Personal Area', 
      color: 'text-indigo-600', 
      bg: 'bg-indigo-50',
      borderColor: 'hover:border-indigo-200'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-40">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-200/30 rounded-full blur-[120px]"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>
      </div>

      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4 group cursor-pointer" onClick={() => setActiveTab(null)}>
            <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-xl shadow-slate-900/20 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div>
              <span className="font-black text-2xl tracking-tighter text-slate-900 block leading-none">Moderator</span>
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.2em]">Control Center</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2 pr-4 border-r border-slate-200">
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors">
                <Search size={20} />
              </button>
              <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative">
                <Bell size={20} />
                {stats?.moderation?.pending > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                )}
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
                  <div className="text-xs font-black text-slate-900 leading-none mb-1">Moderator User</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Active Session</div>
                </div>
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
                        onClick={() => { router.push('/dashboard'); setShowUserMenu(false); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <LayoutDashboard size={18} className="text-slate-400" />
                        User Dashboard
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

      <main className="p-6 md:p-10 max-w-7xl mx-auto">
        {!activeTab ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-10"
          >
            <div className="max-w-4xl mx-auto text-center mb-12">
              <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-4">Welcome back, Moderator</h2>
              <p className="text-slate-500 text-lg font-medium">Choose an area to manage or switch to your personal dashboard.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 max-w-5xl mx-auto">
              {cards.map((card, idx) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  whileHover={{ y: -12 }}
                  onClick={() => {
                    if (card.id === 'user_dashboard') {
                      router.push('/dashboard');
                    } else {
                      setActiveTab(card.id);
                    }
                  }}
                  className={clsx(
                    "bg-white p-12 rounded-[48px] shadow-xl border-2 border-transparent transition-all cursor-pointer group relative overflow-hidden flex flex-col items-center text-center",
                    card.borderColor
                  )}
                >
                  <div className={`w-28 h-28 rounded-[32px] flex items-center justify-center mb-10 ${card.bg} ${card.color} group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-inner border border-white/50`}>
                    <card.icon size={56} />
                  </div>
                  
                  <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">{card.label}</h3>
                  <p className="text-slate-500 font-medium mb-10 max-w-xs leading-relaxed text-lg">{card.description}</p>
                  
                  <div className="w-full pt-10 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-left">
                      <span className="text-5xl font-black text-slate-900 block leading-none mb-2">{card.stat}</span>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em]">{card.subtext}</span>
                    </div>
                    <div className={clsx("w-16 h-16 rounded-2xl flex items-center justify-center transition-all group-hover:translate-x-2 shadow-lg", card.bg, card.color)}>
                      <ChevronRight size={32} />
                    </div>
                  </div>

                  {/* Decorative background element */}
                  <div className={clsx("absolute -right-10 -bottom-10 w-48 h-48 rounded-full opacity-[0.03] transition-transform duration-1000 group-hover:scale-150 group-hover:rotate-12", card.bg)} />
                </motion.div>
              ))}
            </div>

            {/* Quick Stats / Info Footer */}
            <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6 pt-10">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">System Status</span>
                  <span className="text-sm font-black text-slate-700">All Systems Operational</span>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                  <Users size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Companies</span>
                  <span className="text-sm font-black text-slate-700">{organizations.length} Registered</span>
                </div>
              </div>
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-3xl border border-slate-200/60 flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center">
                  <MessageSquareWarning size={24} />
                </div>
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Avg. Response</span>
                  <span className="text-sm font-black text-slate-700">4.2h (Last 24h)</span>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex flex-col gap-8"
          >
            <div className="flex items-center justify-between">
              <button 
                onClick={() => setActiveTab(null)} 
                className="flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 font-bold text-slate-600 transition-all shadow-sm active:scale-95"
              >
                <ChevronRight size={20} className="rotate-180" /> Back to Panel
              </button>
              <div className="text-right">
                <h1 className="text-3xl font-black tracking-tight text-slate-900">Moderation Queue</h1>
                <p className="text-slate-500 font-medium">Reviewing {stats?.moderation?.pending || 0} pending items</p>
              </div>
            </div>

            <div className="bg-white rounded-[40px] shadow-xl border border-slate-200 overflow-hidden min-h-[600px]">
              <ModerationTab organizations={organizations} />
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

