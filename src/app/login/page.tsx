'use client';
import dynamic from 'next/dynamic';
const LoginPage = dynamic(() => import('@/modules/auth/LoginPage').then((m) => ({ default: m.LoginPage })), { ssr: false });
export default function Login() { return <LoginPage />; }
