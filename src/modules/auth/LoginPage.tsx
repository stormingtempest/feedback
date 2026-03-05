'use client';
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2 } from 'lucide-react';

type OAuthProvider = 'discord' | 'google';

function openOAuthPopup(url: string): Window | null {
  const width = 500;
  const height = 650;
  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;
  return window.open(url, 'oauth_popup', `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`);
}

function roleToPath(role: string): string {
  switch (role) {
    case 'ADMIN': return '/admin';
    case 'MODERATOR': return '/moderator';
    case 'COMPANY': return '/company';
    default: return '/dashboard';
  }
}

export const LoginPage: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<OAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOAuthSuccess = useCallback((userId: string, role: string) => {
    localStorage.setItem('userId', userId);
    localStorage.setItem('userRole', role);
    router.push(roleToPath(role));
  }, [router]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type !== 'OAUTH_AUTH_SUCCESS') return;
      const { userId, role } = event.data;
      if (userId) {
        setLoading(null);
        handleOAuthSuccess(decodeURIComponent(userId), decodeURIComponent(role || 'USER'));
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleOAuthSuccess]);

  const handleLogin = async (provider: OAuthProvider) => {
    setLoading(provider);
    setError(null);
    try {
      const res = await fetch(`/api/auth/${provider}/url`);
      const data = await res.json();
      if (!data.url) throw new Error('Could not get authorization URL');
      const popup = openOAuthPopup(data.url);
      if (!popup) throw new Error('Popup bloqueado. Habilite popups para este site.');

      const timer = setInterval(() => {
        if (popup.closed) {
          clearInterval(timer);
          setLoading(null);
        }
      }, 500);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Erro de conexão');
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-8 pb-6 text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-200">
            <MessageSquare className="text-white" size={32} />
          </div>
          <h1 className="text-3xl font-black text-slate-900">Feedback Hub</h1>
          <p className="text-slate-500 text-sm mt-2">Entre com sua conta para continuar</p>
        </div>

        <div className="px-8 pb-8 space-y-3">
          {error && (
            <p className="text-red-500 text-sm text-center font-medium bg-red-50 rounded-xl py-2 px-3">
              {error}
            </p>
          )}

          {/* Discord */}
          <button
            onClick={() => handleLogin('discord')}
            disabled={!!loading}
            className="w-full flex items-center gap-3 px-5 py-3.5 bg-[#5865F2] hover:bg-[#4752c4] text-white font-bold rounded-2xl transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:shadow-indigo-200 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading === 'discord' ? (
              <Loader2 size={20} className="animate-spin flex-shrink-0" />
            ) : (
              <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 flex-shrink-0">
                <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057c.002.022.015.045.032.058a19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
              </svg>
            )}
            <span className="flex-1 text-left">
              {loading === 'discord' ? 'Aguardando...' : 'Entrar com Discord'}
            </span>
          </button>

          {/* Google */}
          <button
            onClick={() => handleLogin('google')}
            disabled={!!loading}
            className="w-full flex items-center gap-3 px-5 py-3.5 bg-white hover:bg-slate-50 text-slate-800 font-bold rounded-2xl transition-all border-2 border-slate-200 hover:border-slate-300 shadow-sm disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading === 'google' ? (
              <Loader2 size={20} className="animate-spin flex-shrink-0 text-slate-500" />
            ) : (
              <svg viewBox="0 0 24 24" className="w-5 h-5 flex-shrink-0">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            <span className="flex-1 text-left">
              {loading === 'google' ? 'Aguardando...' : 'Entrar com Google'}
            </span>
          </button>

          <p className="text-center text-xs text-slate-400 pt-2">
            Ao entrar, você concorda com nossos termos de uso.
          </p>
        </div>
      </div>
    </div>
  );
};
