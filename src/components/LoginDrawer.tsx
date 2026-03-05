import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X, User, ShieldCheck, ShieldAlert, Building2 } from 'lucide-react';

interface LoginDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LoginDrawer: React.FC<LoginDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();

  const handlePanelAccess = (path: string, role: string) => {
    // Set mock credentials for the demo
    localStorage.setItem('userId', 'mock-user-id');
    localStorage.setItem('userRole', role);
    navigate(path);
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100]"
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black text-indigo-600 uppercase tracking-widest mb-1">Ambiente de testes - Giba</h2>
                <h3 className="text-xl font-black text-slate-900">Acesso Rápido</h3>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-slate-100 rounded-xl text-slate-400 transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <p className="text-slate-500 text-sm mb-6">Selecione o painel que deseja acessar para demonstração:</p>
              
              <button 
                onClick={() => handlePanelAccess('/dashboard', 'USER')} 
                className="w-full p-4 flex items-center gap-4 text-blue-700 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all group border border-blue-100"
              >
                <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
                  <User size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1">Painel do Usuário</p>
                  <p className="text-xs text-blue-600/70 font-bold uppercase tracking-wider">Visualização do Cliente</p>
                </div>
              </button>

              <button 
                onClick={() => handlePanelAccess('/admin', 'ADMIN')} 
                className="w-full p-4 flex items-center gap-4 text-slate-700 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group border border-slate-200"
              >
                <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
                  <ShieldCheck size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1">Painel do Administrador</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Gestão Total do Sistema</p>
                </div>
              </button>

              <button 
                onClick={() => handlePanelAccess('/moderator', 'MODERATOR')} 
                className="w-full p-4 flex items-center gap-4 text-amber-700 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-all group border border-amber-100"
              >
                <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
                  <ShieldAlert size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1">Painel do Moderador</p>
                  <p className="text-xs text-amber-600/70 font-bold uppercase tracking-wider">Curadoria de Feedbacks</p>
                </div>
              </button>

              <button 
                onClick={() => handlePanelAccess('/company', 'COMPANY')} 
                className="w-full p-4 flex items-center gap-4 text-emerald-700 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-all group border border-emerald-100"
              >
                <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                  <Building2 size={24} />
                </div>
                <div className="text-left">
                  <p className="font-black text-lg leading-none mb-1">Painel da Empresa</p>
                  <p className="text-xs text-emerald-600/70 font-bold uppercase tracking-wider">Insights e Projetos</p>
                </div>
              </button>
            </div>

            <div className="p-6 bg-slate-50 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest text-center">
                Sistema de Demonstração v1.0
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
