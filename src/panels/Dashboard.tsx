'use client';
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion, AnimatePresence } from 'motion/react';
import { useRouter } from 'next/navigation';
import { ChevronRight, CheckCircle2, Star, Zap, Shield, Trophy, Target, PlayCircle, Clock, AlertCircle, ChevronDown, Search, ArrowLeft } from 'lucide-react';
import { fetchDashboardData } from '../services/dashboardService';
import { Header } from '../components/Header';
import { FeedbackCard } from '../components/FeedbackCard';
import { FeedbackFlow } from '../components/FeedbackFlow';
import { BadgesModal } from '../components/BadgesModal';
import { SettingsDrawer } from '../components/SettingsDrawer';
import { clsx } from 'clsx';
import { UserStats } from '../types';
import { playSound } from '../utils/sound';

export const Dashboard = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [initialFeedbackStage, setInitialFeedbackStage] = useState(0);
  const [badgesOpen, setBadgesOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [missionsExpanded, setMissionsExpanded] = useState(false); // Used for flip state now
  const [searchQuery, setSearchQuery] = useState('');
  const [viewAllProjects, setViewAllProjects] = useState(false);
  const [viewFullHistory, setViewFullHistory] = useState(false);
  const [selectedHistoryItem, setSelectedHistoryItem] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboardData'],
    queryFn: fetchDashboardData,
  });

  const updateUserMutation = useMutation({
    mutationFn: async (updatedData: Partial<UserStats>) => {
      const userId = localStorage.getItem('userId');
      const response = await fetch(`/api/user/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to update profile');
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dashboardData'] });
    },
  });

  const prevUserRef = React.useRef<UserStats | null>(null);

  React.useEffect(() => {
    if (data?.user) {
      const prevUser = prevUserRef.current;
      if (prevUser) {
        if (data.user.level > prevUser.level) playSound('levelUp');
        if (data.user.points > prevUser.points) playSound('points');
        if (data.user.achievements.length > prevUser.achievements.length) playSound('badge');
      }
      prevUserRef.current = data.user;
    }
  }, [data?.user]);

  const handleLogout = () => {
    router.push('/');
  };

  const userRole = localStorage.getItem('userRole');

  const handleStartFeedback = (project: any) => {
    setSelectedProject(project.name);
    setSelectedProjectId(project.id);
    
    let stage = 0;
    if (project.progress >= 75) stage = 3;
    else if (project.progress >= 50) stage = 2;
    
    if (project.progress === 100) stage = 4;

    setInitialFeedbackStage(stage);
    setFeedbackOpen(true);
    playSound('click');
  };

  const handleContinueJourney = () => {
    // setShowWelcome(false); // User requested to keep welcome visible
    const projectsSection = document.getElementById('active-projects');
    if (projectsSection) {
      projectsSection.scrollIntoView({ behavior: 'smooth' });
    }
    playSound('click');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error || !data) return <div className="p-10 text-red-500">Error loading data.</div>;

  const { user, activeProjects = [], history = [] } = data || {};

  // Filter projects based on search
  const filteredProjects = activeProjects?.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.description.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 animate-in fade-in duration-500">
        
        <Header 
          user={user} 
          onLogout={handleLogout} 
          onOpenSettings={() => setSettingsOpen(true)}
          onSearch={setSearchQuery}
        >
          {userRole === 'MODERATOR' && (
            <button 
              onClick={() => router.push('/admin')}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-200"
            >
              <Shield size={16} /> Moderation
            </button>
          )}
        </Header>

        {/* Welcome Section - Compact & Integrated Missions */}
        <AnimatePresence>
          {showWelcome && !searchQuery && !viewAllProjects && !viewFullHistory && (
            <motion.section 
              initial={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="relative overflow-visible rounded-3xl bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-xl shadow-blue-200 perspective-1000"
            >
              <div className="p-6 md:p-8 flex flex-col md:flex-row gap-8 items-start md:items-center relative z-10">
                
                {/* Left: Welcome & Stats */}
                <div className="flex-1 space-y-4">
                  <div>
                    <h1 className="text-2xl md:text-3xl font-bold mb-2">
                      Hello, {user.name.split(' ')[0]}! 👋
                    </h1>
                    <p className="text-blue-100 text-sm md:text-base max-w-lg">
                      You need <span className="font-bold text-white">{user.nextLevelPoints - user.points} XP</span> for the next level.
                      Continue your journey by completing missions!
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    <button 
                      onClick={handleContinueJourney}
                      className="px-5 py-2.5 bg-white text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all shadow-lg shadow-blue-900/20 flex items-center gap-2"
                    >
                      Continue Journey <ChevronRight size={16} />
                    </button>
                    <button 
                      onClick={() => setBadgesOpen(true)}
                      className="px-5 py-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-md rounded-xl font-semibold text-sm transition-all border border-white/20"
                    >
                      Achievements
                    </button>
                  </div>
                </div>

                {/* Right: Missions Summary (Flippable) */}
                <div className="w-full md:w-96 h-48 relative perspective-1000 group">
                  <motion.div
                    initial={false}
                    animate={{ rotateY: missionsExpanded ? 180 : 0 }}
                    transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                    className="w-full h-full relative preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                  >
                    {/* Front Side */}
                    <div className="absolute inset-0 backface-hidden bg-white/10 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden flex flex-col">
                      <div 
                        className="p-4 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => setMissionsExpanded(true)}
                      >
                        <div className="flex items-center gap-2">
                          <Target className="text-yellow-300" size={20} />
                          <span className="font-bold text-sm">Season Missions</span>
                        </div>
                        <ChevronRight size={16} />
                      </div>
                      
                      <div className="px-4 pb-4 space-y-3 flex-1 overflow-hidden">
                        {user.missions?.slice(0, 2).map((mission) => (
                          <div key={mission.id} className="bg-white/10 rounded-lg p-3 flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{mission.title}</p>
                              <p className="text-xs text-yellow-300 font-bold">+{mission.points} XP</p>
                            </div>
                            {mission.completed ? <CheckCircle2 size={16} className="text-green-400" /> : <div className="w-4 h-4 rounded-full border-2 border-white/20" />}
                          </div>
                        ))}
                        <button 
                          className="w-full py-1 text-xs font-medium text-blue-200 hover:text-white transition-colors text-center"
                          onClick={() => setMissionsExpanded(true)}
                        >
                          View all missions
                        </button>
                      </div>
                    </div>

                    {/* Back Side */}
                    <div 
                      className="absolute inset-0 backface-hidden bg-white text-slate-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
                      style={{ transform: 'rotateY(180deg)' }}
                    >
                      <div className="p-3 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                        <h3 className="font-bold text-sm flex items-center gap-2">
                          <Target size={16} className="text-blue-500" />
                          All Missions
                        </h3>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setMissionsExpanded(false); }}
                          className="p-1 hover:bg-slate-200 rounded-full transition-colors"
                        >
                          <ArrowLeft size={16} className="text-slate-500" />
                        </button>
                      </div>
                      <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                        {user.missions?.map((mission) => (
                          <div key={mission.id} className={clsx(
                            "p-3 rounded-lg border flex items-center justify-between gap-3 transition-colors",
                            mission.completed ? "bg-green-50 border-green-100" : "bg-white border-slate-100 hover:border-blue-200"
                          )}>
                            <div className="flex-1">
                              <p className={clsx("text-xs font-bold", mission.completed ? "text-green-700" : "text-slate-700")}>{mission.title}</p>
                              <p className="text-[10px] text-slate-400">{mission.description}</p>
                            </div>
                            <div className="text-right">
                              <span className={clsx("text-xs font-bold block", mission.completed ? "text-green-600" : "text-blue-600")}>+{mission.points} XP</span>
                              {mission.completed && <span className="text-[10px] font-bold text-green-500 uppercase">Done</span>}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
              
              {/* Decorative Background Elements */}
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-500/30 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />
            </motion.section>
          )}
        </AnimatePresence>

        {/* Active Projects */}
        <section id="active-projects" className={clsx(
          "transition-all duration-500", 
          !showWelcome && !searchQuery && !viewAllProjects && !viewFullHistory && "ring-4 ring-blue-100 rounded-3xl p-6 -m-6 bg-white/50",
          (viewFullHistory) && "hidden"
        )}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
              {viewAllProjects && (
                <button onClick={() => setViewAllProjects(false)} className="mr-2 p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <ArrowLeft size={24} className="text-slate-500" />
                </button>
              )}
              {searchQuery ? (
                <>
                  <Search className="text-blue-500" />
                  Results for "{searchQuery}"
                </>
              ) : (
                "Active Projects"
              )}
            </h2>
            {!searchQuery && !viewAllProjects && (
              <button onClick={() => setViewAllProjects(true)} className="text-sm font-medium text-blue-600 hover:underline">View all</button>
            )}
          </div>
          
          {filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {filteredProjects.map((project, idx) => (
                <div key={project.id} onClick={() => handleStartFeedback(project)} className="cursor-pointer">
                  <FeedbackCard project={project} idx={idx} />
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">No projects found.</p>
            </div>
          )}
        </section>

        {!searchQuery && !viewAllProjects && !viewFullHistory && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            {/* History */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your History</h2>
                <button onClick={() => setViewFullHistory(true)} className="text-slate-400 hover:text-slate-600">
                  <ChevronRight size={20} />
                </button>
              </div>
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="divide-y divide-slate-50">
                  {history.slice(0, 5).map((item) => (
                    <div 
                      key={item.id} 
                      className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                      onClick={() => setSelectedHistoryItem(selectedHistoryItem === item.id ? null : item.id)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={clsx(
                            "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                            item.status === 'Completed' ? "bg-green-50 text-green-600" :
                            item.status === 'In Review' ? "bg-yellow-50 text-yellow-600" :
                            "bg-slate-100 text-slate-400"
                          )}>
                            {item.status === 'Completed' && <CheckCircle2 size={24} />}
                            {item.status === 'In Review' && <Clock size={24} />}
                            {item.status === 'Pending' && <PlayCircle size={24} />}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.projectName}</p>
                            <p className="text-xs text-slate-400">{item.date}</p>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span className={clsx(
                            "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                            item.status === 'Completed' ? "bg-green-100 text-green-700" :
                            item.status === 'In Review' ? "bg-yellow-100 text-yellow-700" :
                            "bg-slate-100 text-slate-500"
                          )}>
                            {item.status}
                          </span>
                          {item.progress < 100 && item.progress > 0 && (
                            <span className="text-[10px] text-slate-400 font-medium">{item.progress}% complete</span>
                          )}
                        </div>
                      </div>
                      
                      <AnimatePresence>
                        {selectedHistoryItem === item.id && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 space-y-2">
                              <p><span className="font-bold text-slate-700">Feedback:</span> {item.description || "No description available."}</p>
                              <p><span className="font-bold text-slate-700">Points earned:</span> +{item.points || 0} XP</p>
                              {item.status === 'Completed' && <p className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={14} /> Verified by team</p>}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Gamification Status */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-800 tracking-tight">Your Journey</h2>
              </div>
              <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 space-y-8">
                <div className="flex items-center gap-8">
                  <div className="relative group cursor-pointer" onClick={() => setBadgesOpen(true)}>
                    <div className="absolute -inset-2 bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-500"></div>
                    <div className="relative w-24 h-24 bg-white rounded-full flex flex-col items-center justify-center border-4 border-slate-50 shadow-inner">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-br from-blue-600 to-indigo-600">
                        {user.points}
                      </span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">points</span>
                    </div>
                  </div>

                  <div className="flex-1 space-y-4">
                    <div className="flex justify-between items-end">
                      <div>
                        <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">Next Level</p>
                        <p className="text-lg font-bold text-slate-800">Level {user.level + 1}</p>
                      </div>
                      <span className="text-sm font-bold text-blue-600">{user.nextLevelPoints - user.points} XP left</span>
                    </div>
                    <div className="h-4 bg-slate-100 rounded-full overflow-hidden shadow-inner">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-blue-500 to-indigo-600"
                        initial={{ width: 0 }}
                        animate={{ width: `${(user.points / user.nextLevelPoints) * 100}%` }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-700">Recent Achievements</h3>
                    <button onClick={() => setBadgesOpen(true)} className="text-xs font-bold text-blue-600 hover:underline uppercase tracking-wider">View all</button>
                  </div>
                  <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
                    {user.achievements.slice(0, 4).map((ach) => (
                      <div key={ach.id} className="flex flex-col items-center gap-2 min-w-[80px]">
                        <div className={clsx(
                          "w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm transition-transform hover:scale-110 border-2",
                          ach.unlocked ? "bg-white border-slate-100" : "bg-slate-50 border-slate-100 opacity-50 grayscale"
                        )}>
                          {ach.icon === 'Star' && <Star size={28} className={ach.color} />}
                          {ach.icon === 'Zap' && <Zap size={28} className={ach.color} />}
                          {ach.icon === 'Shield' && <Shield size={28} className={ach.color} />}
                          {ach.icon === 'Trophy' && <Trophy size={28} className={ach.color} />}
                          {ach.icon === 'Target' && <Target size={28} className={ach.color} />}
                        </div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter text-center leading-tight">{ach.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}

        {/* Full History View */}
        {viewFullHistory && (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
                <button onClick={() => setViewFullHistory(false)} className="mr-2 p-1 hover:bg-slate-200 rounded-full transition-colors">
                  <ArrowLeft size={24} className="text-slate-500" />
                </button>
                Full History
              </h2>
            </div>
            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
              <div className="divide-y divide-slate-50">
                {history.map((item) => (
                  <div 
                    key={item.id} 
                    className="p-5 hover:bg-slate-50 transition-colors group cursor-pointer"
                    onClick={() => setSelectedHistoryItem(selectedHistoryItem === item.id ? null : item.id)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={clsx(
                          "w-12 h-12 rounded-2xl flex items-center justify-center transition-colors",
                          item.status === 'Completed' ? "bg-green-50 text-green-600" :
                          item.status === 'In Review' ? "bg-yellow-50 text-yellow-600" :
                          "bg-slate-100 text-slate-400"
                        )}>
                          {item.status === 'Completed' && <CheckCircle2 size={24} />}
                          {item.status === 'In Review' && <Clock size={24} />}
                          {item.status === 'Pending' && <PlayCircle size={24} />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{item.projectName}</p>
                          <p className="text-xs text-slate-400">{item.date}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1">
                        <span className={clsx(
                          "px-3 py-1 text-[10px] font-bold rounded-full uppercase tracking-wider",
                          item.status === 'Completed' ? "bg-green-100 text-green-700" :
                          item.status === 'In Review' ? "bg-yellow-100 text-yellow-700" :
                          "bg-slate-100 text-slate-500"
                        )}>
                          {item.status}
                        </span>
                        {item.progress < 100 && item.progress > 0 && (
                          <span className="text-[10px] text-slate-400 font-medium">{item.progress}% complete</span>
                        )}
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {selectedHistoryItem === item.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-4 pt-4 border-t border-slate-100 text-sm text-slate-500 space-y-2">
                            <p><span className="font-bold text-slate-700">Feedback:</span> {item.description || "No description available."}</p>
                            <p><span className="font-bold text-slate-700">Points earned:</span> +{item.points || 0} XP</p>
                            {item.status === 'Completed' && <p className="text-green-600 font-medium flex items-center gap-1"><CheckCircle2 size={14} /> Verified by team</p>}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Modals */}
        <FeedbackFlow 
          isOpen={feedbackOpen} 
          onClose={() => setFeedbackOpen(false)} 
          projectName={selectedProject} 
          projectId={selectedProjectId}
          initialStage={initialFeedbackStage}
        />
        
        <BadgesModal 
          isOpen={badgesOpen} 
          onClose={() => setBadgesOpen(false)} 
          achievements={user.achievements} 
        />

        <SettingsDrawer
          isOpen={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          user={user}
          onUpdateUser={async (data) => {
            await updateUserMutation.mutateAsync(data);
          }}
        />
      </div>
    </div>
  );
};
