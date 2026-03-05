'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { User, ShieldCheck, ShieldAlert, Building2 } from 'lucide-react';

const CREDENTIALS: Record<string, { username: string; password: string }> = {
  USER:      { username: 'EuSouOGiba',  password: 'user'      },
  ADMIN:     { username: 'admin',        password: 'admin'     },
  MODERATOR: { username: 'moderador',    password: 'moderador' },
  COMPANY:   { username: 'empresa1',     password: 'empresa1'  },
};

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handlePanelAccess = async (path: string, role: string) => {
    setLoading(role);
    setError(null);
    try {
      const creds = CREDENTIALS[role];
      const res = await fetch('/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: creds.username, password: creds.password }),
      });
      const data = await res.json();
      if (data.success) {
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userRole', data.role);
        router.push(path);
      } else {
        setError(data.message || 'Login failed');
      }
    } catch {
      setError('Connection error');
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="p-8 bg-white border rounded-3xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <h2 className="text-sm font-black text-indigo-600 uppercase tracking-widest mb-2">Ambiente de testes - Giba</h2>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Acesso ao Sistema</h1>
          <p className="text-slate-500 text-sm mt-2">Escolha o painel que deseja visualizar</p>
        </div>
        
        {error && <p className="text-red-500 text-sm text-center font-bold mb-2">{error}</p>}

        <div className="space-y-4">
          <button
            onClick={() => handlePanelAccess('/dashboard', 'USER')}
            disabled={!!loading}
            className="w-full p-4 flex items-center gap-4 text-blue-700 bg-blue-50 rounded-2xl hover:bg-blue-100 transition-all group border border-blue-100 disabled:opacity-60"
          >
            <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-200 group-hover:scale-110 transition-transform">
              <User size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-lg leading-none mb-1">Painel do Usuário</p>
              <p className="text-xs text-blue-600/70 font-bold uppercase tracking-wider">{loading === 'USER' ? 'Entrando...' : 'Visualização do Cliente'}</p>
            </div>
          </button>

          <button
            onClick={() => handlePanelAccess('/admin', 'ADMIN')}
            disabled={!!loading}
            className="w-full p-4 flex items-center gap-4 text-slate-700 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all group border border-slate-200 disabled:opacity-60"
          >
            <div className="w-12 h-12 bg-slate-900 text-white rounded-xl flex items-center justify-center shadow-lg shadow-slate-200 group-hover:scale-110 transition-transform">
              <ShieldCheck size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-lg leading-none mb-1">Painel do Administrador</p>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">{loading === 'ADMIN' ? 'Entrando...' : 'Gestão Total do Sistema'}</p>
            </div>
          </button>

          <button
            onClick={() => handlePanelAccess('/moderator', 'MODERATOR')}
            disabled={!!loading}
            className="w-full p-4 flex items-center gap-4 text-amber-700 bg-amber-50 rounded-2xl hover:bg-amber-100 transition-all group border border-amber-100 disabled:opacity-60"
          >
            <div className="w-12 h-12 bg-amber-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-amber-200 group-hover:scale-110 transition-transform">
              <ShieldAlert size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-lg leading-none mb-1">Painel do Moderador</p>
              <p className="text-xs text-amber-600/70 font-bold uppercase tracking-wider">{loading === 'MODERATOR' ? 'Entrando...' : 'Curadoria de Feedbacks'}</p>
            </div>
          </button>

          <button
            onClick={() => handlePanelAccess('/company', 'COMPANY')}
            disabled={!!loading}
            className="w-full p-4 flex items-center gap-4 text-emerald-700 bg-emerald-50 rounded-2xl hover:bg-emerald-100 transition-all group border border-emerald-100 disabled:opacity-60"
          >
            <div className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
              <Building2 size={24} />
            </div>
            <div className="text-left">
              <p className="font-black text-lg leading-none mb-1">Painel da Empresa</p>
              <p className="text-xs text-emerald-600/70 font-bold uppercase tracking-wider">{loading === 'COMPANY' ? 'Entrando...' : 'Insights e Projetos'}</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};
