'use client';
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { X, MessageSquarePlus, Bug, ThumbsUp, Lightbulb, HelpCircle, Paperclip, Building2 } from 'lucide-react';
import { clsx } from 'clsx';
import { api } from '@/lib/axios-client';
import { Project, UserFeedbackCard } from '../types';

interface ProjectDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: Project | null;
  onGiveFeedback: () => void;
}

const CATEGORY_CONFIG = {
  bug:        { label: 'Bug',        icon: Bug,          bg: 'bg-red-50',    text: 'text-red-600',    border: 'border-red-200' },
  praise:     { label: 'Praise',     icon: ThumbsUp,     bg: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-200' },
  suggestion: { label: 'Suggestion', icon: Lightbulb,    bg: 'bg-yellow-50', text: 'text-yellow-600', border: 'border-yellow-200' },
  question:   { label: 'Question',   icon: HelpCircle,   bg: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-200' },
};

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  Pending:  { label: 'In Review',    bg: 'bg-yellow-100', text: 'text-yellow-700' },
  Approved: { label: 'Visible',      bg: 'bg-green-100',  text: 'text-green-700' },
  Rejected: { label: 'Not Approved', bg: 'bg-red-100',    text: 'text-red-700' },
};

function FeedbackItem({ item }: { item: UserFeedbackCard }) {
  const cat = CATEGORY_CONFIG[item.category] ?? CATEGORY_CONFIG.question;
  const Icon = cat.icon;
  const status = STATUS_CONFIG[item.moderationStatus] ?? STATUS_CONFIG.Pending;
  const date = new Date(item.createdAt).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className={clsx('rounded-2xl border p-5 bg-white space-y-3', cat.border)}>
      <div className="flex items-start justify-between gap-3">
        <div className={clsx('flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold', cat.bg, cat.text)}>
          <Icon size={12} />
          {cat.label}
        </div>
        <span className={clsx('px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', status.bg, status.text)}>
          {status.label}
        </span>
      </div>

      <p className="text-sm text-slate-600 line-clamp-3">{item.description}</p>

      <div className="flex items-center justify-between text-xs text-slate-400">
        <span>{date}</span>
        {item.files.length > 0 && (
          <span className="flex items-center gap-1 text-slate-500">
            <Paperclip size={12} />
            {item.files.length} file{item.files.length > 1 ? 's' : ''}
          </span>
        )}
      </div>

      {item.moderationStatus === 'Approved' && item.companyResponse && (
        <div className="border-t border-slate-100 pt-3">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">Company Response</p>
          <p className="text-sm text-slate-600">{item.companyResponse}</p>
        </div>
      )}
    </div>
  );
}

export const ProjectDetailModal: React.FC<ProjectDetailModalProps> = ({ isOpen, onClose, project, onGiveFeedback }) => {
  const { data: feedbacks, isLoading } = useQuery<UserFeedbackCard[]>({
    queryKey: ['feedbacks', project?.id],
    queryFn: async () => {
      const res = await api.get<UserFeedbackCard[]>(`/api/feedback?campaignId=${project!.id}`);
      return res.data;
    },
    enabled: isOpen && !!project?.id,
  });

  return (
    <AnimatePresence>
      {isOpen && project && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-stretch justify-end"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="w-full max-w-xl bg-slate-50 flex flex-col h-full overflow-hidden shadow-2xl"
          >
            {/* Header */}
            <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} className="text-slate-500" />
              </button>
              <div className="flex-1 min-w-0">
                <h2 className="font-bold text-slate-800 truncate">{project.name}</h2>
                <p className="text-xs text-slate-400 flex items-center gap-1">
                  <Building2 size={11} />
                  {project.companyName}
                </p>
              </div>
              <button
                onClick={onGiveFeedback}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
              >
                <MessageSquarePlus size={16} />
                Give Feedback
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Campaign description */}
              {project.description && (
                <div className="bg-white rounded-2xl border border-slate-100 p-5">
                  <p className="text-sm text-slate-500">{project.description}</p>
                </div>
              )}

              {/* Feedbacks section */}
              <div>
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Your Feedbacks</h3>

                {isLoading && (
                  <div className="flex justify-center py-12">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                      className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full"
                    />
                  </div>
                )}

                {!isLoading && feedbacks?.length === 0 && (
                  <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                    <MessageSquarePlus size={32} className="mx-auto text-slate-300 mb-3" />
                    <p className="font-medium text-slate-400">You haven&apos;t given feedback yet</p>
                    <p className="text-sm text-slate-300 mt-1">Be the first to share your thoughts!</p>
                  </div>
                )}

                {!isLoading && feedbacks && feedbacks.length > 0 && (
                  <div className="grid grid-cols-1 gap-4">
                    {feedbacks.map((fb) => (
                      <FeedbackItem key={fb.id} item={fb} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
