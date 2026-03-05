'use client';
import React from 'react';
import { motion } from 'motion/react';
import { Star, MessageSquarePlus, CheckCircle2, PlayCircle } from 'lucide-react';
import { Project } from '../types';

interface FeedbackCardProps {
  project: Project;
  idx?: number;
  onClick?: () => void;
}

export const FeedbackCard: React.FC<FeedbackCardProps> = ({ project, idx = 0, onClick }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.1 }}
      whileHover={{ y: -5, scale: 1.02 }}
      onClick={onClick}
      className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden flex flex-col h-full"
    >
      <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
        <Star 
          size={80} 
          className={project.progress === 100 ? "text-yellow-500 fill-yellow-500 rotate-12" : "text-blue-500 rotate-12"} 
        />
      </div>
      
      <div className="flex items-center gap-4 mb-4 relative z-10">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center text-blue-600 shadow-inner border border-blue-100">
          <img 
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${project.name}`} 
            alt={project.name}
            className="w-8 h-8 rounded-lg"
          />
        </div>
        <div>
          <h3 className="font-bold text-slate-800 line-clamp-1">{project.name}</h3>
          <p className="text-xs text-slate-400 font-medium">{project.companyName}</p>
        </div>
      </div>
      
      <p className="text-sm text-slate-500 mb-6 line-clamp-2 flex-grow relative z-10">
        {project.description}
      </p>
      
      <div className="space-y-2 mb-6 relative z-10">
        <div className="flex justify-between text-[10px] font-bold uppercase text-slate-400 tracking-wider">
          <span>Progress</span>
          <span>{project.progress}%</span>
        </div>
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div 
            className={project.progress === 100 ? "h-full bg-green-500 rounded-full" : "h-full bg-blue-500 rounded-full"} 
            style={{ width: `${project.progress}%` }} 
          />
        </div>
      </div>
      
      <button 
        className={`w-full py-3 font-bold rounded-xl transition-all flex items-center justify-center gap-2 relative z-10 group-hover:shadow-lg ${
          project.progress === 100 
            ? "bg-green-50 text-green-600 hover:bg-green-600 hover:text-white group-hover:shadow-green-200" 
            : "bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white group-hover:shadow-blue-200"
        }`}
      >
        {project.progress === 100 ? (
          <>
            <CheckCircle2 size={18} />
            Completed
          </>
        ) : project.progress > 0 ? (
          <>
            <PlayCircle size={18} />
            Continue
          </>
        ) : (
          <>
            <MessageSquarePlus size={18} />
            Give Feedback
          </>
        )}
      </button>
    </motion.div>
  );
};
