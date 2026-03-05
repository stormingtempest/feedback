import { MessageSquare } from 'lucide-react';

export const FeedbackList = () => {
  return (
    <div className="p-10 flex flex-col items-center justify-center h-full space-y-4 text-slate-400">
      <MessageSquare size={64} />
      <h2 className="text-2xl font-bold text-slate-800">Feedback History</h2>
      <p>Detailed history page in development.</p>
    </div>
  );
};
