import React from 'react';
import { LogOut, Search, Trophy, Settings, Star, Shield, Target, Sparkles } from 'lucide-react';
import { UserStats } from '../types';
import { clsx } from 'clsx';

interface HeaderProps {
  user: UserStats;
  onLogout?: () => void;
  onOpenSettings?: () => void;
  onSearch?: (query: string) => void;
  children?: React.ReactNode;
}

export const Header = ({ user, onLogout, onOpenSettings, onSearch, children }: HeaderProps) => {
  const progressPercentage = (user.points / user.nextLevelPoints) * 100;
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercentage / 100) * circumference;

  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 pt-4 md:pt-0">
      <div className="flex items-center gap-5 w-full md:w-auto">
        <div className="relative shrink-0">
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden shadow-2xl border-4 border-white ring-4 ring-blue-50">
            <img 
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.avatarSeed || user.name}`} 
              alt="User Avatar"
              className="w-full h-full object-cover"
            />
          </div>
          
          {/* Level Badge */}
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-br from-blue-600 to-indigo-600 text-white text-xs md:text-sm font-black w-8 h-8 md:w-10 md:h-10 flex items-center justify-center rounded-full border-4 border-white shadow-lg z-10">
            {user.level}
          </div>

          {/* Progress Circle */}
          <svg className="absolute -inset-2 w-[80px] h-[80px] md:w-[96px] md:h-[96px] -rotate-90 pointer-events-none">
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              className="text-slate-100"
            />
            <circle
              cx="50%"
              cy="50%"
              r={radius}
              stroke="currentColor"
              strokeWidth="3"
              fill="transparent"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="text-blue-500 transition-all duration-1000 ease-out"
            />
          </svg>
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between md:justify-start gap-3">
            <h1 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">{user.name}</h1>
            <div className="flex md:hidden gap-2">
              <button 
                onClick={onOpenSettings}
                className="p-2 bg-slate-50 text-slate-500 rounded-full hover:bg-slate-100 transition-colors"
              >
                <Settings size={18} />
              </button>
              <button 
                onClick={onLogout}
                className="p-2 bg-red-50 text-red-500 rounded-full hover:bg-red-100 transition-colors"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mt-1">
            <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-full border border-indigo-100">
              {user.levelTitle}
            </span>
            <span className="text-xs font-medium text-slate-400">
              {user.points} / {user.nextLevelPoints} XP
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2">
          {children}
          <button 
            onClick={onOpenSettings}
            className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm"
            title="Settings"
          >
            <Settings size={20} />
          </button>
          <button 
            onClick={onLogout}
            className="p-3 bg-white border border-slate-200 text-slate-500 rounded-xl hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-all shadow-sm"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4 w-full md:w-auto">
        <div className="relative flex-1 md:w-64 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Search projects..." 
            onChange={(e) => onSearch?.(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all shadow-sm"
          />
        </div>
        
        <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-orange-200 transform rotate-3 hover:rotate-0 transition-transform">
            <Trophy size={20} className="fill-white" />
          </div>
          <div>
            <p className="text-xs font-black text-slate-800 uppercase tracking-tighter">Feedback Hub</p>
            <p className="text-[10px] font-bold text-slate-400">TempestLabs</p>
          </div>
        </div>
      </div>
    </header>
  );
};
