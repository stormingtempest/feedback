'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, useScroll, useSpring } from 'motion/react';
import { 
  Trophy, Zap, CheckCircle, ArrowRight, MessageSquare, Users, BarChart3, 
  XCircle, AlertTriangle, TrendingUp, Play, Star, Shield, HelpCircle, 
  QrCode, Settings, Menu, ChevronUp, Globe, Heart, Sparkles,
  Twitter, Github, Linkedin
} from 'lucide-react';
import { LoginDrawer } from '../components/LoginDrawer';

export const LandingPage = () => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-slate-50 selection:bg-indigo-200 selection:text-indigo-900 overflow-x-hidden font-sans scroll-smooth">
      <LoginDrawer isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />

      {/* Progress Bar */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-indigo-600 origin-left z-[60]"
        style={{ scaleX }}
      />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex justify-between items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 sm:gap-3 cursor-pointer"
            onClick={scrollToTop}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Trophy size={20} />
            </div>
            <div>
              <span className="font-black text-slate-900 text-xl leading-none block tracking-tight">TempestLabs</span>
              <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-[0.2em]">Feedback Hub</span>
            </div>
          </motion.div>
          
          <div className="hidden md:flex items-center gap-10 text-sm font-bold text-slate-600">
            {['Features', 'Gamification', 'Pricing'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`} 
                className="hover:text-indigo-600 transition-all relative group"
              >
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-indigo-600 transition-all group-hover:w-full"></span>
              </a>
            ))}
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoginOpen(true)}
              className="px-8 py-3 bg-slate-900 text-white rounded-2xl hover:bg-slate-800 transition-all font-bold shadow-xl shadow-slate-200"
            >
              Sign In
            </motion.button>
          </div>

          <button 
            onClick={() => setIsLoginOpen(true)}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-200 rounded-xl transition-colors"
          >
            <Menu size={24} />
          </button>
        </div>
      </nav>

      <div className="pt-20"> {/* Spacer for fixed nav */}

      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-24 lg:py-32 grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center lg:text-left"
        >
          <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-50 rounded-full text-indigo-700 text-xs sm:text-sm font-black mb-8 border border-indigo-100 shadow-sm">
            <Zap size={16} className="fill-indigo-600" />
            <span className="uppercase tracking-wider">🔥 Gamification 2.0 Unleashed</span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black text-slate-900 leading-[1.05] mb-8 tracking-tighter">
            Turn feedback into <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-600 bg-[length:200%_auto] animate-gradient">predictable growth</span>.
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 mb-10 max-w-lg mx-auto lg:mx-0 leading-relaxed font-medium">
            Collect, analyze, and activate your user base with AI and strategic gamification. Stop guessing and start growing your product.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center lg:justify-start">
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoginOpen(true)}
              className="px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xl hover:bg-indigo-700 transition-all shadow-2xl shadow-indigo-200 flex items-center justify-center gap-3"
            >
              Start Free Trial <ArrowRight size={24} />
            </motion.button>
            <motion.button 
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 bg-white border-2 border-slate-200 text-slate-900 rounded-[24px] font-black text-xl hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <Play size={24} className="fill-slate-900" /> Watch Demo
            </motion.button>
          </div>
          <div className="mt-12 flex flex-col sm:flex-row items-center gap-6 justify-center lg:justify-start">
            <div className="flex -space-x-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <motion.img 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  key={i} 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i + 20}`} 
                  className="w-12 h-12 rounded-full border-4 border-white bg-slate-100 shadow-lg" 
                  alt={`User ${i}`} 
                />
              ))}
            </div>
            <p className="text-sm text-slate-500 font-bold">
              <span className="text-slate-900 font-black">2,000+ companies</span> trust Feedback Hub
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8, rotate: -2 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1, type: "spring", bounce: 0.4 }}
          className="relative hidden lg:block"
        >
          <div className="absolute -inset-8 bg-gradient-to-br from-indigo-500/30 to-purple-600/30 rounded-[60px] blur-[80px] animate-pulse"></div>
          
          {/* Stylized Video Container */}
          <div className="relative p-1.5 rounded-[48px] bg-gradient-to-br from-slate-200 via-white to-slate-300 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.2)]">
            <div className="relative bg-slate-900 rounded-[42px] overflow-hidden aspect-video border-[6px] border-slate-900 shadow-inner">
              <video 
                autoPlay 
                loop 
                muted 
                playsInline
                className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity duration-700"
              >
                <source src="https://cdn.dribbble.com/uploads/47173/original/df3b62873661a51154a198d5615ce553.mp4?1685645213" type="video/mp4" />
              </video>
              
              {/* Overlay elements */}
              <div className="absolute top-6 left-6 flex gap-2">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
              </div>
            </div>
          </div>

          <motion.div 
            animate={{ y: [0, -15, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -top-10 -right-10 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 z-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-emerald-200">
                <TrendingUp size={28} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">+47% Engagement</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Client Success</p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            animate={{ y: [0, 15, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute -bottom-10 -left-10 bg-white p-6 rounded-[32px] shadow-2xl border border-slate-100 z-10"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-200">
                <Sparkles size={28} />
              </div>
              <div>
                <p className="text-sm font-black text-slate-900">AI Powered</p>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Smart Insights</p>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* 2. The Problem Section */}
      <section className="py-24 sm:py-32 bg-white border-y border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter">You are losing customers and don't know why.</h2>
            <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">The silence of your users is the biggest risk to your business. When they stop talking, they start leaving.</p>
          </motion.div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { title: "Scattered Feedback", desc: "Emails, Slack, WhatsApp... suggestions get lost in the chaos.", icon: XCircle, color: "text-rose-500", bg: "bg-rose-50" },
              { title: "Low Response Rate", desc: "Boring surveys nobody answers. Loss of valuable data.", icon: AlertTriangle, color: "text-amber-500", bg: "bg-amber-50" },
              { title: "Unactionable Data", desc: "Too much data, zero insights. You don't know what to prioritize.", icon: BarChart3, color: "text-orange-500", bg: "bg-orange-50" },
              { title: "Disengaged Users", desc: "Your base doesn't feel heard and ends up abandoning the product.", icon: Users, color: "text-red-500", bg: "bg-red-50" }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -10 }}
                className="bg-slate-50 p-10 rounded-[40px] border border-slate-200 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-500 group"
              >
                <div className={`w-16 h-16 ${item.bg} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500`}>
                    <item.icon className={`${item.color}`} size={32} />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-4">{item.title}</h3>
                <p className="text-slate-500 text-base leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. The Solution Section */}
      <section id="features" className="py-24 sm:py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div 
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="absolute -inset-10 bg-indigo-500/10 rounded-[60px] blur-[100px]"></div>
              <div className="relative p-2 rounded-[48px] bg-white shadow-2xl border border-slate-200 overflow-hidden">
                <img 
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=2426" 
                  alt="Solution Visual" 
                  className="rounded-[40px] hover:scale-105 transition-transform duration-1000"
                  referrerPolicy="no-referrer"
                />
              </div>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="order-1 lg:order-2"
            >
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-10 leading-[1.1] tracking-tighter">
                Feedback Hub organizes the chaos and turns opinion into strategy.
              </h2>
              <div className="space-y-10 mb-12">
                {[
                  { title: "Smart Collection", desc: "Integrated widgets and forms that adapt to user behavior.", icon: MessageSquare },
                  { title: "AI Analysis", desc: "Our AI processes thousands of feedbacks and delivers the top 3 critical action points.", icon: Zap },
                  { title: "Strategic Gamification", desc: "Turn the act of giving feedback into an addictive and rewarding game.", icon: Trophy }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ x: 10 }}
                    className="flex gap-6 group cursor-default"
                  >
                    <div className="w-16 h-16 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-indigo-600 shrink-0 shadow-xl group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-600 transition-all duration-300">
                      <item.icon size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900 mb-2">{item.title}</h3>
                      <p className="text-lg text-slate-600 leading-relaxed font-medium">{item.desc}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginOpen(true)}
                className="w-full sm:w-auto px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl hover:bg-slate-800 transition-all shadow-2xl flex items-center justify-center gap-3"
              >
                See all features <ArrowRight size={24} />
              </motion.button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 4. How it Works Section */}
      <section className="py-24 sm:py-32 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,#4f46e5,transparent_70%)]"></div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-8 tracking-tighter">Up and running in less than 10 minutes.</h2>
            <p className="text-slate-400 text-lg sm:text-xl font-medium leading-relaxed">Simplicity is our core. No complex setups, no headaches. Just results.</p>
          </motion.div>
          <div className="grid sm:grid-cols-3 gap-12 lg:gap-16 relative">
            <div className="hidden lg:block absolute top-1/2 left-1/4 right-1/4 h-1 bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent -translate-y-1/2"></div>
            
            {[
              { step: "01", title: "Configure", desc: "Choose from dozens of ready-made templates or build your own from scratch in seconds.", icon: Settings },
              { step: "02", title: "Collect", desc: "Install our widget, send direct links, or use QR codes at physical touchpoints.", icon: QrCode },
              { step: "03", title: "Grow", desc: "Track AI insights and watch your community engage with the leaderboard.", icon: TrendingUp }
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2, type: "spring", stiffness: 100 }}
                className="relative z-10 flex flex-col items-center text-center group"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-indigo-600 rounded-[32px] flex items-center justify-center text-white shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-10 text-3xl font-black border-2 border-indigo-400 group-hover:rotate-6 transition-transform duration-500">
                  <item.icon size={36} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-black mb-4">{item.step}. {item.title}</h3>
                <p className="text-lg text-slate-400 leading-relaxed font-medium">{item.desc}</p>
              </motion.div>
            ))}
          </div>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6 }}
            className="mt-20 text-center"
          >
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoginOpen(true)}
              className="px-10 py-5 bg-white text-slate-900 rounded-[24px] font-black text-xl hover:bg-slate-100 transition-all inline-flex items-center gap-3 shadow-2xl"
            >
              Get started right now <ArrowRight size={24} />
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* 6. Gamification 2.0 Section */}
      <section id="gamification" className="py-24 sm:py-32 bg-slate-50 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-purple-100 rounded-full text-purple-700 text-xs sm:text-sm font-black mb-8 border border-purple-200 shadow-sm">
                <Star size={16} className="fill-purple-600" />
                <span className="uppercase tracking-wider">Exclusive: Gamification 2.0</span>
              </div>
              <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black text-slate-900 mb-8 leading-[1.1] tracking-tighter">
                Turn users into fierce brand promoters.
              </h2>
              <p className="text-lg sm:text-xl text-slate-600 mb-10 leading-relaxed font-medium">
                Platforms with gamification increase engagement by up to <span className="text-purple-600 font-black">47%</span>. Feedback Hub uses behavioral psychology to keep your users active and loyal.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-12">
                {[
                  { title: "Points System", desc: "Reward every valuable action." },
                  { title: "Public Leaderboard", desc: "Stimulate healthy competition." },
                  { title: "Elite Badges", desc: "Immediate visual recognition." },
                  { title: "Power Levels", desc: "Unlock exclusive benefits." }
                ].map((item, i) => (
                  <motion.div 
                    key={i} 
                    whileHover={{ y: -5, borderColor: '#a855f7' }}
                    className="p-6 bg-white rounded-[24px] border-2 border-slate-100 shadow-sm transition-all duration-300"
                  >
                    <h4 className="font-black text-slate-900 text-lg mb-2">{item.title}</h4>
                    <p className="text-sm text-slate-500 font-medium leading-relaxed">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsLoginOpen(true)}
                className="w-full sm:w-auto px-10 py-5 bg-purple-600 text-white rounded-[24px] font-black text-xl hover:bg-purple-700 transition-all shadow-2xl shadow-purple-200 flex items-center justify-center gap-3"
              >
                Activate gamification <ArrowRight size={24} />
              </motion.button>
            </motion.div>
            <motion.div 
              initial={{ opacity: 0, x: 50, rotate: 2 }}
              whileInView={{ opacity: 1, x: 0, rotate: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="relative hidden lg:block"
            >
              <div className="absolute -inset-10 bg-purple-500/10 rounded-full blur-[100px]"></div>
              <div className="bg-white p-10 rounded-[48px] border border-slate-200 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.15)] relative overflow-hidden">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="font-black text-slate-900 text-2xl">Community Leaderboard</h3>
                  <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                    <Users size={28} />
                  </div>
                </div>
                <div className="space-y-5">
                  {[
                    { name: "Alex Silva", level: "Level 12", points: "4,250", color: "bg-indigo-500" },
                    { name: "Maria Clara", level: "Level 9", points: "3,120", color: "bg-purple-500" },
                    { name: "John Doe", level: "Level 8", points: "2,890", color: "bg-pink-500" }
                  ].map((user, i) => (
                    <motion.div 
                      key={i} 
                      whileHover={{ x: 10 }}
                      className="flex items-center justify-between p-5 bg-slate-50 rounded-[24px] border border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300"
                    >
                      <div className="flex items-center gap-5">
                        <div className={`w-14 h-14 ${user.color} rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg`}>
                          {user.name[0]}
                        </div>
                        <div>
                          <p className="text-lg font-black text-slate-900">{user.name}</p>
                          <p className="text-xs text-slate-500 font-black uppercase tracking-widest">{user.level}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-indigo-600">{user.points}</p>
                        <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">points</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
                <div className="mt-10 pt-10 border-t border-slate-100 flex justify-center">
                  <div className="flex gap-6">
                    {[Trophy, Star, Shield].map((Icon, i) => (
                      <motion.div 
                        key={i}
                        whileHover={{ scale: 1.2, rotate: 12 }}
                        className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-400 shadow-inner border border-slate-100"
                      >
                        <Icon size={32} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 8. Comparison Section */}
      <section className="py-24 sm:py-32 bg-white border-y border-slate-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <h2 className="text-4xl sm:text-5xl font-black text-slate-900 mb-6 tracking-tighter">Why are we the obvious choice?</h2>
            <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">Compare and see why high-growth companies are migrating to Feedback Hub.</p>
          </motion.div>
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-white rounded-[48px] border-2 border-slate-100 overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.1)]"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-900 text-white">
                    <th className="p-8 font-black text-lg uppercase tracking-widest">Feature</th>
                    <th className="p-8 font-black text-center bg-indigo-600 text-lg uppercase tracking-widest">Feedback Hub</th>
                    <th className="p-8 font-black text-center text-lg uppercase tracking-widest">Google Forms</th>
                    <th className="p-8 font-black text-center text-lg uppercase tracking-widest">SurveyMonkey</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {[
                    { feature: "Native Gamification", hub: true, google: false, survey: false },
                    { feature: "Strategic Dashboard", hub: true, google: false, survey: "⚠️" },
                    { feature: "Community Engagement", hub: true, google: false, survey: false },
                    { feature: "AI Sentiment Analysis", hub: true, google: false, survey: true },
                    { feature: "Feedback Widgets", hub: true, google: false, survey: true }
                  ].map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors duration-300">
                      <td className="p-8 text-lg font-black text-slate-700">{row.feature}</td>
                      <td className="p-8 text-center bg-indigo-50/30">
                        {row.hub === true ? <CheckCircle className="inline text-indigo-600" size={32} /> : row.hub}
                      </td>
                      <td className="p-8 text-center">
                        {row.google === false ? <XCircle className="inline text-slate-300" size={32} /> : row.google}
                      </td>
                      <td className="p-8 text-center">
                        {row.survey === true ? <CheckCircle className="inline text-slate-400" size={32} /> : row.survey === false ? <XCircle className="inline text-slate-300" size={32} /> : row.survey}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 9. ROI Section */}
      <section className="py-24 sm:py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-[48px] sm:rounded-[64px] p-10 sm:p-20 lg:p-32 text-white relative overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 right-0 w-1/2 h-full bg-white/5 skew-x-12 translate-x-1/4"></div>
            <div className="relative z-10 grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
              <div>
                <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black mb-10 leading-[1.1] tracking-tighter">What's the cost of ignoring your customers?</h2>
                <p className="text-slate-300 text-lg sm:text-xl mb-12 leading-relaxed font-medium">
                  Losing a single dissatisfied customer can cost up to 5x more than the annual investment in our platform. Don't let churn destroy your profit.
                </p>
                <div className="space-y-8 mb-12">
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform"><TrendingUp size={32} /></div>
                    <p className="font-black text-xl sm:text-2xl">62% increase in response rate in 30 days.</p>
                  </div>
                  <div className="flex items-center gap-6 group">
                    <div className="w-16 h-16 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 group-hover:scale-110 transition-transform"><Users size={32} /></div>
                    <p className="font-black text-xl sm:text-2xl">18% average reduction in Churn Rate.</p>
                  </div>
                </div>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full sm:w-auto px-10 py-5 bg-indigo-600 text-white rounded-[24px] font-black text-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  Calculate my custom ROI <ArrowRight size={24} />
                </motion.button>
              </div>
              <motion.div 
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-slate-800/50 backdrop-blur-md border border-slate-700 rounded-[48px] p-10 sm:p-16 shadow-inner"
              >
                <h3 className="text-2xl sm:text-3xl font-black mb-10 text-center">Loss Simulator</h3>
                <div className="space-y-10">
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">User Base</p>
                      <p className="text-4xl sm:text-5xl font-black text-white">1,000</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 mb-2">Potential Churn</p>
                      <p className="text-4xl sm:text-5xl font-black text-rose-400">10%</p>
                    </div>
                  </div>
                  <div className="h-4 bg-slate-700 rounded-full overflow-hidden shadow-inner">
                    <motion.div 
                      initial={{ width: 0 }}
                      whileInView={{ width: '10%' }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                      className="h-full bg-rose-500 shadow-[0_0_30px_rgba(244,63,94,0.6)]"
                    ></motion.div>
                  </div>
                  <div className="pt-10 border-t border-slate-700 text-center">
                    <p className="text-lg font-bold text-slate-400 mb-3">Estimated Potential Loss</p>
                    <p className="text-5xl sm:text-7xl font-black text-white">$12,500<span className="text-xl sm:text-2xl font-black text-slate-400">/mo</span></p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 10. Pricing Section */}
      <section id="pricing" className="py-24 sm:py-32 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-20"
          >
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 mb-8 tracking-tighter">Plans that grow with you</h2>
            <p className="text-slate-600 text-lg sm:text-xl font-medium leading-relaxed">No hidden fees, no lock-in. Choose the best fit for your current stage and scale with confidence.</p>
          </motion.div>
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              { name: "Starter", price: "197", desc: "For early-stage startups.", features: ["Up to 500 users", "Basic Dashboard", "Customizable Widgets", "Email Support"] },
              { name: "Pro", price: "497", desc: "The favorite for scaling companies.", features: ["Unlimited Users", "Full Gamification", "AI Analysis", "Integration API", "Priority Support"], popular: true },
              { name: "Enterprise", price: "Custom", desc: "For large operations and high demand.", features: ["99.9% SLA", "Account Manager", "Advanced Security", "On-demand Customization", "Team Training"] }
            ].map((plan, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -15 }}
                className={`relative p-10 sm:p-12 rounded-[48px] border-2 transition-all duration-500 ${plan.popular ? 'bg-slate-900 border-slate-900 text-white shadow-[0_40px_100px_-20px_rgba(0,0,0,0.3)] md:scale-110 z-10' : 'bg-white border-slate-100 shadow-xl hover:shadow-2xl hover:border-indigo-100'}`}
              >
                {plan.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 px-8 py-2.5 bg-indigo-600 text-white text-xs font-black uppercase tracking-[0.2em] rounded-full shadow-xl">
                    Most Popular
                  </div>
                )}
                <h3 className={`text-2xl sm:text-3xl font-black mb-2 ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.name}</h3>
                <p className={`text-sm mb-10 font-bold uppercase tracking-widest ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>{plan.desc}</p>
                <div className="mb-10">
                  <span className={`text-5xl sm:text-6xl font-black ${plan.popular ? 'text-white' : 'text-slate-900'}`}>{plan.price !== "Custom" ? `$${plan.price}` : plan.price}</span>
                  {plan.price !== "Custom" && <span className={`font-black text-lg ml-2 ${plan.popular ? 'text-slate-400' : 'text-slate-400'}`}>/mo</span>}
                </div>
                <ul className="space-y-5 mb-12">
                  {plan.features.map((f, j) => (
                    <li key={j} className={`flex items-center gap-4 text-base font-bold ${plan.popular ? 'text-slate-300' : 'text-slate-600'}`}>
                      <CheckCircle size={22} className={plan.popular ? 'text-indigo-400 shrink-0' : 'text-indigo-600 shrink-0'} /> {f}
                    </li>
                  ))}
                </ul>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginOpen(true)}
                  className={`w-full py-6 rounded-[24px] font-black text-xl flex items-center justify-center transition-all ${plan.popular ? 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-2xl shadow-indigo-500/40' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-xl'}`}
                >
                  Subscribe Now
                </motion.button>
              </motion.div>
            ))}
          </div>
          <p className="text-center mt-16 text-slate-400 text-sm font-black uppercase tracking-widest">
            30-day satisfaction guarantee • Cancel anytime
          </p>
        </div>
      </section>

      {/* 11. FAQ Section */}
      <section className="py-24 sm:py-32 bg-slate-50 border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl sm:text-5xl font-black text-slate-900 mb-20 text-center tracking-tighter"
          >
            Frequently Asked Questions
          </motion.h2>
          <div className="space-y-6 mb-20">
            {[
              { q: "Do I need to install anything on my server?", a: "No! Feedback Hub is 100% cloud-based. You just need to copy and paste a line of code on your site or use our direct links." },
              { q: "Does it work with WordPress or other platforms?", a: "Yes! We are compatible with any platform that accepts external scripts, including WordPress, Webflow, Shopify, and native apps." },
              { q: "How does gamification work in practice?", a: "Your users earn points by giving constructive feedback, leveling up, and earning badges. This creates an engagement loop that increases retention." },
              { q: "Can I cancel my subscription at any time?", a: "Absolutely. We don't believe in forced loyalty. If you are not satisfied, you can cancel with one click in the dashboard." }
            ].map((faq, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="p-8 sm:p-10 bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl transition-all duration-300"
              >
                <h4 className="text-xl sm:text-2xl font-black text-slate-900 mb-5 flex items-center gap-4">
                   <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0">
                     <HelpCircle size={24} />
                   </div>
                   {faq.q}
                </h4>
                <p className="text-lg text-slate-600 leading-relaxed font-medium pl-14">{faq.a}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-slate-500 mb-8 text-lg font-bold">Still have questions?</p>
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsLoginOpen(true)}
              className="px-10 py-5 bg-slate-900 text-white rounded-[24px] font-black text-xl hover:bg-slate-800 transition-all inline-flex items-center gap-3 shadow-xl"
            >
              Talk to an expert <ArrowRight size={24} />
            </motion.button>
          </div>
        </div>
      </section>

      {/* 12. Final CTA Section */}
      <section className="py-24 sm:py-40 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="bg-slate-900 p-12 sm:p-24 lg:p-32 text-center relative overflow-hidden shadow-[0_60px_120px_-20px_rgba(0,0,0,0.5)] rounded-[64px] sm:rounded-[80px]"
          >
            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500 animate-gradient bg-[length:200%_auto]"></div>
            
            {/* Background decorative elements */}
            <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/20 rounded-full blur-[120px]"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(79,70,229,0.1)_0%,transparent_70%)]"></div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="relative z-10"
            >
              <h2 className="text-5xl sm:text-7xl lg:text-9xl font-black text-white mb-10 leading-[1] tracking-tighter">
                Start turning opinion <br className="hidden sm:block" /> into growth today.
              </h2>
              <p className="text-xl sm:text-2xl text-slate-400 mb-16 max-w-3xl mx-auto font-medium leading-relaxed">
                Join thousands of companies that have already discovered the power of listening to customers with intelligence. Your journey to predictable growth starts here.
              </p>
              <div className="flex flex-col items-center gap-10">
                <motion.button 
                  whileHover={{ scale: 1.05, y: -5, backgroundColor: '#6366f1' }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsLoginOpen(true)}
                  className="w-full sm:w-auto px-16 sm:px-20 py-8 sm:py-10 bg-indigo-600 text-white rounded-[40px] sm:rounded-[48px] font-black text-3xl sm:text-4xl hover:bg-indigo-500 transition-all shadow-[0_30px_70px_rgba(79,70,229,0.5)] flex items-center justify-center gap-6 group"
                >
                  Start Free Trial <ArrowRight size={40} className="group-hover:translate-x-2 transition-transform" />
                </motion.button>
                <div className="flex flex-wrap justify-center items-center gap-8 sm:gap-16 text-slate-400 font-black text-sm sm:text-base uppercase tracking-[0.3em]">
                  <span className="flex items-center gap-3"><CheckCircle size={20} className="text-indigo-400" /> 14 days free</span>
                  <span className="flex items-center gap-2"><CheckCircle size={20} className="text-indigo-400" /> No credit card</span>
                  <span className="flex items-center gap-2"><CheckCircle size={20} className="text-indigo-400" /> 5 min setup</span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-24 sm:py-32 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-16 sm:gap-20 mb-24">
            <div className="col-span-2">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-indigo-600 rounded-[20px] flex items-center justify-center text-white shadow-2xl shadow-indigo-500/20">
                  <MessageSquare size={32} />
                </div>
                <span className="font-black text-4xl tracking-tighter">Feedback Hub</span>
              </div>
              <p className="text-slate-400 max-w-md leading-relaxed mb-12 text-xl font-medium">
                Global leader in feedback intelligence and B2B gamification. We help companies build products people love through data-driven insights and behavioral psychology.
              </p>
              <div className="flex gap-5">
                {[Twitter, Github, Linkedin, Globe].map((Icon, i) => (
                  <motion.div 
                    whileHover={{ y: -8, backgroundColor: '#4f46e5', color: '#fff', borderColor: '#4f46e5' }}
                    key={i} 
                    className="w-14 h-14 bg-slate-800 rounded-2xl transition-all cursor-pointer flex items-center justify-center text-slate-400 border border-slate-700 shadow-lg"
                  >
                    <Icon size={24} />
                  </motion.div>
                ))}
              </div>
            </div>
            <div>
              <h4 className="font-black mb-10 uppercase tracking-[0.2em] text-xs text-slate-500">Product</h4>
              <ul className="space-y-6 font-bold text-lg">
                <li><a href="#features" className="text-slate-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#gamification" className="text-slate-400 hover:text-white transition-colors">Gamification</a></li>
                <li><a href="#pricing" className="text-slate-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Changelog</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-10 uppercase tracking-[0.2em] text-xs text-slate-500">Company</h4>
              <ul className="space-y-6 font-bold text-lg">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-black mb-10 uppercase tracking-[0.2em] text-xs text-slate-500">Legal</h4>
              <ul className="space-y-6 font-bold text-lg">
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="text-slate-400 hover:text-white transition-colors">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-16 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-10">
            <p className="text-slate-500 font-bold text-lg">© 2024 Feedback Hub. All rights reserved.</p>
            <div className="flex flex-wrap justify-center items-center gap-10">
              <button 
                onClick={() => {
                  localStorage.setItem('userRole', 'MODERATOR');
                  window.location.href = '/moderator';
                }}
                className="text-slate-500 hover:text-indigo-400 font-black text-sm uppercase tracking-[0.2em] transition-colors"
              >
                Moderator Panel (Demo)
              </button>
              <div className="flex items-center gap-3 text-slate-500">
                <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_15px_rgba(16,185,129,0.5)]"></div>
                <span className="text-xs font-black uppercase tracking-[0.2em]">Systems Operational</span>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0, scale: 0.5, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.5, y: 20 }}
            onClick={scrollToTop}
            className="fixed bottom-10 right-10 w-16 h-16 bg-indigo-600 text-white rounded-full shadow-2xl flex items-center justify-center z-50 hover:bg-indigo-700 transition-all active:scale-95 border-4 border-white"
          >
            <ChevronUp size={32} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
    </div>
  );
};
