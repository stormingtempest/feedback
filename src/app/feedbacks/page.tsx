'use client';
import dynamic from 'next/dynamic';
const FeedbackList = dynamic(() => import('@/panels/FeedbackList').then((m) => ({ default: m.FeedbackList })), { ssr: false });
export default function Feedbacks() { return <FeedbackList />; }
