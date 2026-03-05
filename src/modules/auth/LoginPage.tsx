import React from 'react';
import { useNavigate } from 'react-router-dom';
import { User, ShieldCheck, ShieldAlert, Building2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();

  const handlePanelAccess = (path: string, role: string) => {
    // Set mock credentials for the demo
    localStorage.setItem('userId', 'mock-user-id');
    localStorage.setItem('userRole', role);
    navigate(path);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white border rounded-3xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Ambiente de testes - Giba</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Acesso ao Sistema</h1>
          <p className="text-slate-500 text-sm mt-2">Escolha o painel que deseja visualizar</p>
        </div>
        
        <div className="space-y-4">
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
      </div>
    </div>
  );
};
