'use client';
import React from 'react';
import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface OverviewCardProps {
  label: string;
  stat: string | number;
  icon: LucideIcon;
  color: string;
  onClick: () => void;
}

export const OverviewCard: React.FC<OverviewCardProps> = ({ label, stat, icon: Icon, color, onClick }) => {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 cursor-pointer hover:shadow-md transition-all"
    >
      <div className="flex items-center justify-between mb-4">
        <span className="text-slate-500 font-bold uppercase tracking-wider text-xs">{label}</span>
        <div className={color}>
          <Icon size={24} />
        </div>
      </div>
      <div className="text-4xl font-black text-slate-900">{stat}</div>
    </motion.div>
  );
};
