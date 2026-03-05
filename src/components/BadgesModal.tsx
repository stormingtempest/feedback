'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Lock, Star, Zap, Shield, Trophy, Target } from 'lucide-react';
import { Achievement } from '../types';
import { clsx } from 'clsx';

interface BadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
}

export const BadgesModal = ({ isOpen, onClose, achievements }: BadgesModalProps) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white w-full max-w-4xl max-h-[80vh] rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          <div className="p-6 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Achievements Gallery</h2>
              <p className="text-slate-500">Collect all badges to become a Legend.</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
              <X size={24} className="text-slate-400" />
            </button>
          </div>
          
          <div className="p-8 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-slate-50/50">
            {achievements.map((ach) => (
              <div 
                key={ach.id} 
                className={clsx(
                  "relative p-6 rounded-2xl border-2 flex flex-col items-center text-center gap-4 transition-all hover:scale-105",
                  ach.unlocked 
                    ? "bg-white border-slate-100 shadow-sm" 
                    : "bg-slate-100 border-slate-200 opacity-70 grayscale"
                )}
              >
                <div className={clsx(
                  "w-20 h-20 rounded-full flex items-center justify-center shadow-inner mb-2",
                  ach.unlocked ? "bg-white" : "bg-slate-200"
                )}>
                  {ach.icon === 'Star' && <Star size={40} className={ach.color} />}
                  {ach.icon === 'Zap' && <Zap size={40} className={ach.color} />}
                  {ach.icon === 'Shield' && <Shield size={40} className={ach.color} />}
                  {ach.icon === 'Trophy' && <Trophy size={40} className={ach.color} />}
                  {ach.icon === 'Target' && <Target size={40} className={ach.color} />}
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-800">{ach.label}</h3>
                  <p className="text-xs text-slate-500 mt-1">{ach.description}</p>
                </div>

                {!ach.unlocked && (
                  <div className="absolute top-4 right-4 text-slate-400">
                    <Lock size={16} />
                  </div>
                )}
                
                {ach.unlocked && (
                  <div className="absolute -top-2 -right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-1 rounded-full shadow-md">
                    UNLOCKED
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
