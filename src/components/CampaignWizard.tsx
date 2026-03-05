'use client';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Megaphone, 
  BrainCircuit, 
  Mic, 
  Plus, 
  Trash2, 
  Star, 
  Trophy, 
  Target, 
  MessageSquare, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Sparkles,
  Type,
  ListChecks,
  Image as ImageIcon,
  X,
  Wand2,
  Volume2,
  FileAudio,
  Loader2,
  Quote,
  Square
} from 'lucide-react';
import { clsx } from 'clsx';
import { GoogleGenAI } from "@google/genai";
import { api as axios } from '@/lib/axios-client';
import { fetchDashboardData } from '../services/dashboardService';
import OpenAI from 'openai';

const BADGE_ICONS = [
  '🏆', '🥇', '🥈', '🥉', '⭐', '🌟', '✨', '🔥', '💎', '👑', 
  '🚀', '🎯', '🎨', '🎮', '🎧', '💻', '📱', '🔋', '💡', '🛠️',
  '🛡️', '⚔️', '🏹', '🔮', '🧪', '🧬', '🌍', '🌈', '🍀', '🍕'
];

const QUESTION_STYLES = [
  { id: 'rating', label: 'Rating (Stars)', icon: Star },
  { id: 'text', label: 'Text Feedback', icon: Type },
  { id: 'choice', label: 'Multiple Choice', icon: ListChecks },
];

interface Question {
  id: string;
  text: string;
  style: string;
  points: number;
  options?: string[];
}

interface Mission {
  id: string;
  title: string;
  description: string;
  points: number;
}

interface CampaignWizardProps {
  projectId: string;
  onClose: () => void;
  onSave: (campaignData: any) => void;
}

export const CampaignWizard = ({ projectId, onClose, onSave }: CampaignWizardProps) => {
  const [step, setStep] = useState(1);
  const [useAI, setUseAI] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Campaign State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [voiceInput, setVoiceInput] = useState('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [badge, setBadge] = useState({ icon: '🏆', name: '', message: '' });
  const [missions, setMissions] = useState<Mission[]>([]);
  const [responseBonus, setResponseBonus] = useState(50);
  const [justification, setJustification] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [generationStep, setGenerationStep] = useState(0);
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);

  const getAISettings = () => {
    try {
      return JSON.parse(localStorage.getItem('ai_settings') || '{}');
    } catch (e) {
      return {};
    }
  };

  const handleAISuggest = async (targetStep?: number) => {
    const settings = getAISettings();
    
    if (settings.aiEnabled === false) {
      alert('AI features are currently disabled in settings.');
      return;
    }

    if (!voiceInput && !name && step === 1) {
      alert('Please provide some context or a name first.');
      return;
    }

    setIsGenerating(true);
    setGenerationStep(1);
    try {
      const apiKey = settings.apiKey || process.env.GEMINI_API_KEY || '';
      const modelName = settings.apiModel || 'gpt-5-mini';
      
      // Fetch dashboard context
      const dashboardData = await fetchDashboardData();
      const context = `
        Company Context:
        Active Projects: ${JSON.stringify(dashboardData.activeProjects)}
        Recent Feedback History: ${JSON.stringify(dashboardData.history.slice(0, 5))}
        
        Current Campaign Context:
        Project Name: "${name || 'New Project'}"
        User Input/Transcript: "${voiceInput}"
        Current Step: ${targetStep || step}
      `;

      let prompt = `Act as a Gamification Expert. Based on the following company and campaign context, generate content for the campaign.
        Context: ${context}
      `;

      if (targetStep === 1 || !targetStep) {
        prompt += `\nGenerate Campaign Name and Description. Return JSON: {"name": "string", "description": "string"}`;
      } else if (targetStep === 2) {
        prompt += `\nGenerate 5 questions (styles: rating, text, choice). Return JSON: {"questions": [{ "text": "string", "style": "rating|text|choice", "points": number, "options": ["string"] }]}`;
      } else if (targetStep === 3) {
        prompt += `\nGenerate a badge (name, message, icon). Return JSON: {"badge": { "name": "string", "message": "string", "icon": "emoji" }}`;
      } else if (targetStep === 4) {
        prompt += `\nGenerate 5 missions (title, description, points). Return JSON: {"missions": [{ "title": "string", "description": "string", "points": number }]}`;
      } else if (targetStep === 5) {
        prompt += `\nGenerate a response bonus (25-500). Return JSON: {"responseBonus": number}`;
      }
      
      let responseText: string;

      if (modelName.startsWith('gpt')) {
        const openai = new OpenAI({
          apiKey: settings.openaiApiKey || process.env.OPENAI_API_KEY || '',
          dangerouslyAllowBrowser: true,
        });
        
        const response = await openai.chat.completions.create({
          model: modelName,
          messages: [
            { role: "system", content: "Act as a Gamification Expert. Return ONLY a JSON object." },
            { role: "user", content: prompt }
          ],
        });
        responseText = response.choices[0].message.content || '{}';
      } else {
        const aiClient = new GoogleGenAI({ apiKey });
        const response = await aiClient.models.generateContent({
          model: modelName,
          contents: prompt,
          config: { responseMimeType: "application/json" }
        });
        responseText = response.text || '{}';
      }

      setGenerationStep(3);
      const data = JSON.parse(responseText);
      
      setGenerationStep(4);
      
      if (data.name) setName(data.name);
      if (data.description) setDescription(data.description);
      if (data.questions) setQuestions(data.questions.map((q: any) => ({ ...q, id: Math.random().toString(36).substr(2, 9) })));
      if (data.badge) setBadge({ ...badge, ...data.badge });
      if (data.missions) setMissions(data.missions.map((m: any) => ({ ...m, id: Math.random().toString(36).substr(2, 9) })));
      if (data.responseBonus) setResponseBonus(data.responseBonus);
      
      setGenerationStep(5);
    } catch (error: any) {
      console.error('AI Generation failed:', error);
      let errorMessage = 'AI failed to generate suggestions.';
      
      if (error.status === 404 || (error.message && error.message.includes('404'))) {
        errorMessage = 'The selected model was not found. Please check your AI model configuration in Settings and ensure the model name is correct.';
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      alert(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerationStep(0);
    }
  };

  const handleAudioTranscription = async (file: File) => {
    const settings = getAISettings();
    const apiKey = settings.apiKey || process.env.OPENAI_WHISPER_API_KEY;
    
    if (!apiKey) {
      alert('Please configure an API Key in settings to use transcription.');
      return;
    }

    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('model', 'whisper-1');

      const response = await axios.post('https://api.openai.com/v1/audio/transcriptions', formData, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.text) {
        setVoiceInput(prev => prev + (prev ? ' ' : '') + response.data.text);
      }
    } catch (error) {
      console.error('Transcription failed:', error);
      alert('Failed to transcribe audio. Please check your API key.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], 'recording.webm', { type: 'audio/webm' });
        await handleAudioTranscription(audioFile);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Error accessing microphone:', err);
      alert('Microphone access denied or not available.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const addQuestion = () => {
    const newQuestion: Question = {
      id: Math.random().toString(36).substr(2, 9),
      text: '',
      style: 'rating',
      points: 50
    };
    setQuestions([...questions, newQuestion]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, updates: Partial<Question>) => {
    setQuestions(questions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  const addMission = () => {
    const newMission: Mission = {
      id: Math.random().toString(36).substr(2, 9),
      title: '',
      description: '',
      points: 100
    };
    setMissions([...missions, newMission]);
  };

  const removeMission = (id: string) => {
    setMissions(missions.filter(m => m.id !== id));
  };

  const updateMission = (id: string, updates: Partial<Mission>) => {
    setMissions(missions.map(m => m.id === id ? { ...m, ...updates } : m));
  };

  const handleFinalSave = () => {
    const campaignData = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      description,
      questions,
      badge,
      missions,
      responseBonus,
      projectId,
      status: 'Active',
      progress: 0,
      feedbacks: []
    };

    onSave(campaignData);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-slate-900/60 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-[40px] shadow-2xl w-full max-w-5xl h-[85vh] flex flex-col overflow-hidden border border-white/20"
      >
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <Megaphone size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Campaign Wizard</h2>
              <p className="text-slate-500 font-medium text-sm">Step {step} of 5: {
                step === 1 ? 'Concept & AI' :
                step === 2 ? 'Questions & Points' :
                step === 3 ? 'Rewards & Badges' :
                step === 4 ? 'Missions' : 'Final Polish'
              }</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full transition-colors text-slate-400">
            <X size={24} />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="h-1.5 w-full bg-slate-100 flex relative">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className={clsx("h-full flex-1 transition-all duration-500", i <= step ? "bg-indigo-600" : "bg-transparent")} />
          ))}
          {justification && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-4 right-8 z-50 max-w-xs bg-indigo-900 text-white p-3 rounded-2xl shadow-xl text-[10px] font-medium leading-relaxed border border-indigo-700/50 flex gap-2 items-start"
            >
              <Quote size={14} className="text-indigo-400 shrink-0" />
              <div>
                <span className="block font-black text-indigo-300 uppercase tracking-widest mb-1">AI Justification</span>
                {justification}
              </div>
              <button onClick={() => setJustification('')} className="text-indigo-400 hover:text-white">
                <X size={12} />
              </button>
            </motion.div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar relative">
          {isGenerating && (
            <div className="absolute inset-0 z-50 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center">
              <div className="w-24 h-24 border-8 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-8"></div>
              <h3 className="text-3xl font-black text-slate-900 mb-4">Building your campaign!</h3>
              <div className="space-y-3 w-full max-w-md">
                {[
                  "Analyzing your briefing...",
                  "Creating engaging questions...",
                  "Designing the perfect badge...",
                  "Setting up missions...",
                  "Finalizing campaign..."
                ].map((stepText, idx) => (
                  <div key={idx} className={clsx("flex items-center gap-3 p-4 rounded-xl border", idx < generationStep ? "bg-emerald-50 border-emerald-200 text-emerald-700" : idx === generationStep ? "bg-indigo-50 border-indigo-200 text-indigo-700 font-bold" : "bg-slate-50 border-slate-100 text-slate-400")}>
                    {idx < generationStep ? <Check size={20} /> : idx === generationStep ? <Loader2 size={20} className="animate-spin" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-200" />}
                    {stepText}
                  </div>
                ))}
              </div>
            </div>
          )}
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div 
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="flex items-center justify-between p-6 bg-indigo-50 rounded-3xl border border-indigo-100">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white rounded-2xl text-indigo-600 shadow-sm">
                      <BrainCircuit size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-indigo-900">AI Assistance</h3>
                      <p className="text-indigo-700/70 text-sm">Let AI help you build the perfect campaign structure.</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUseAI(!useAI)}
                    className={clsx(
                      "w-14 h-8 rounded-full transition-all relative",
                      useAI ? "bg-indigo-600" : "bg-slate-300"
                    )}
                  >
                    <div className={clsx("absolute top-1 w-6 h-6 bg-white rounded-full transition-all", useAI ? "left-7" : "left-1")} />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Campaign Name</label>
                    <input 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all text-lg font-bold"
                      placeholder="e.g., Customer Satisfaction Survey Q1"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Description</label>
                    <textarea 
                      value={description}
                      onChange={e => setDescription(e.target.value)}
                      rows={3}
                      className="w-full p-5 rounded-2xl border-2 border-slate-100 focus:border-indigo-500 outline-none transition-all font-medium"
                      placeholder="What is the goal of this campaign?"
                    />
                  </div>

                  {useAI && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <label className="block text-sm font-black text-slate-700 uppercase tracking-wider flex items-center gap-2">
                          <Mic size={18} className="text-indigo-500" /> 
                          Voice Briefing or Text Context
                        </label>
                        <div className="flex gap-2">
                          <button
                            onClick={isRecording ? stopRecording : startRecording}
                            className={clsx(
                              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm",
                              isRecording 
                                ? "bg-rose-500 text-white animate-pulse" 
                                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
                            )}
                          >
                            {isRecording ? <Square size={14} fill="currentColor" /> : <Mic size={14} />}
                            {isRecording ? 'Stop Recording' : 'Record Audio'}
                          </button>
                          <input 
                            type="file" 
                            id="audio-upload" 
                            accept="audio/*" 
                            className="hidden" 
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) handleAudioTranscription(file);
                            }}
                          />
                          <label 
                            htmlFor="audio-upload" 
                            className={clsx(
                              "flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:bg-slate-50 cursor-pointer transition-all",
                              (isTranscribing || isRecording) && "opacity-50 pointer-events-none"
                            )}
                          >
                            {isTranscribing ? <Loader2 size={14} className="animate-spin" /> : <FileAudio size={14} />}
                            {isTranscribing ? 'Transcribing...' : 'Upload Audio'}
                          </label>
                        </div>
                      </div>
                      <div className="relative">
                        <textarea 
                          value={voiceInput}
                          onChange={e => setVoiceInput(e.target.value)}
                          rows={4}
                          className="w-full p-5 rounded-2xl border-2 border-indigo-100 bg-indigo-50/30 focus:border-indigo-500 outline-none transition-all font-medium italic"
                          placeholder="Ex: 'I want a campaign to test the new checkout flow. I need to know about speed, ease of use, and if they liked the new design. Give them a 'Speedster' badge.'"
                        />
                        <div className="absolute bottom-4 right-4 flex gap-2">
                          <button 
                            onClick={() => handleAISuggest()}
                            disabled={isGenerating}
                            className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center gap-2 disabled:opacity-50"
                          >
                            {isGenerating ? <Wand2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                            {isGenerating ? 'Generating Full Plan...' : 'Generate Campaign'}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div 
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-slate-900">Configure Questions</h3>
                    <button 
                      onClick={() => handleAISuggest(2)}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      AI Suggest Questions
                    </button>
                  </div>
                  <button onClick={addQuestion} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    <Plus size={18} /> Add Question
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {questions.map((q, idx) => (
                    <div key={q.id} className="bg-slate-50 p-6 rounded-3xl border border-slate-200 relative group">
                      <button 
                        onClick={() => removeQuestion(q.id)}
                        className="absolute -top-2 -right-2 p-2 bg-white text-rose-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-1 flex items-center justify-center">
                          <span className="w-10 h-10 bg-white rounded-xl flex items-center justify-center font-black text-slate-400 border border-slate-100">{idx + 1}</span>
                        </div>
                        
                        <div className="lg:col-span-6">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Question Text</label>
                          <input 
                            value={q.text}
                            onChange={e => updateQuestion(q.id, { text: e.target.value })}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-bold"
                            placeholder="What do you want to ask?"
                          />
                        </div>

                        <div className="lg:col-span-3">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Style</label>
                          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
                            {QUESTION_STYLES.map(style => (
                              <button
                                key={style.id}
                                onClick={() => updateQuestion(q.id, { style: style.id })}
                                className={clsx(
                                  "flex-1 p-2 rounded-lg transition-all",
                                  q.style === style.id ? "bg-indigo-600 text-white" : "text-slate-400 hover:bg-slate-50"
                                )}
                                title={style.label}
                              >
                                <style.icon size={18} className="mx-auto" />
                              </button>
                            ))}
                          </div>
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Points (20-100)</label>
                          <input 
                            type="number"
                            min={20}
                            max={100}
                            value={q.points}
                            onChange={e => updateQuestion(q.id, { points: Math.min(100, Math.max(20, parseInt(e.target.value) || 0)) })}
                            className="w-full p-3 rounded-xl border border-slate-200 focus:border-indigo-500 outline-none font-black text-center"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {questions.length === 0 && (
                    <div className="text-center py-12 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">No questions added yet. Click "Add Question" to start.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div 
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="bg-gradient-to-br from-yellow-50 to-orange-50 p-8 rounded-[40px] border border-yellow-100 flex flex-col items-center text-center relative">
                  <button 
                    onClick={() => handleAISuggest(3)}
                    disabled={isGenerating}
                    className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white text-indigo-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    AI Suggest Badge
                  </button>
                  <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-6xl shadow-xl mb-6 border-8 border-yellow-200">
                    {badge.icon}
                  </div>
                  <h3 className="text-2xl font-black text-slate-900 mb-2">Campaign Badge</h3>
                  <p className="text-slate-500 font-medium mb-8">Users will earn this badge upon completion.</p>
                  
                  <div className="grid grid-cols-6 sm:grid-cols-10 gap-3 mb-8">
                    {BADGE_ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setBadge({ ...badge, icon })}
                        className={clsx(
                          "w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all",
                          badge.icon === icon ? "bg-yellow-400 shadow-lg scale-110" : "bg-white hover:bg-yellow-100"
                        )}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>

                  <div className="w-full space-y-4 text-left">
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Badge Name</label>
                      <input 
                        value={badge.name}
                        onChange={e => setBadge({ ...badge, name: e.target.value })}
                        className="w-full p-4 rounded-2xl border-2 border-white focus:border-yellow-400 outline-none transition-all font-bold"
                        placeholder="e.g., Master Reviewer"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-slate-700 mb-2 uppercase tracking-wider">Effect Message</label>
                      <input 
                        value={badge.message}
                        onChange={e => setBadge({ ...badge, message: e.target.value })}
                        className="w-full p-4 rounded-2xl border-2 border-white focus:border-yellow-400 outline-none transition-all font-medium"
                        placeholder="e.g., You've unlocked the secrets of the platform!"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div 
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="flex justify-between items-center mb-8">
                  <div className="flex items-center gap-4">
                    <h3 className="text-xl font-black text-slate-900">Specific Missions</h3>
                    <button 
                      onClick={() => handleAISuggest(4)}
                      disabled={isGenerating}
                      className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 text-indigo-600 rounded-lg font-bold text-xs hover:bg-indigo-100 transition-all disabled:opacity-50"
                    >
                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                      AI Suggest Missions
                    </button>
                  </div>
                  <button onClick={addMission} className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl font-bold hover:bg-slate-800 transition-colors">
                    <Plus size={18} /> Add Mission
                  </button>
                </div>

                <div className="grid grid-cols-1 gap-6">
                  {missions.map((m, idx) => (
                    <div key={m.id} className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 relative group">
                      <button 
                        onClick={() => removeMission(m.id)}
                        className="absolute -top-2 -right-2 p-2 bg-white text-rose-500 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-rose-100"
                      >
                        <Trash2 size={16} />
                      </button>
                      
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        <div className="lg:col-span-1 flex items-center justify-center">
                          <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm">
                            <Target size={20} />
                          </div>
                        </div>
                        
                        <div className="lg:col-span-4">
                          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Mission Title</label>
                          <input 
                            value={m.title}
                            onChange={e => updateMission(m.id, { title: e.target.value })}
                            className="w-full p-3 rounded-xl border border-indigo-100 focus:border-indigo-500 outline-none font-bold"
                            placeholder="What should they do?"
                          />
                        </div>

                        <div className="lg:col-span-5">
                          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">Description</label>
                          <input 
                            value={m.description}
                            onChange={e => updateMission(m.id, { description: e.target.value })}
                            className="w-full p-3 rounded-xl border border-indigo-100 focus:border-indigo-500 outline-none font-medium"
                            placeholder="Details about the task..."
                          />
                        </div>

                        <div className="lg:col-span-2">
                          <label className="block text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-1">XP Points</label>
                          <input 
                            type="number"
                            value={m.points}
                            onChange={e => updateMission(m.id, { points: parseInt(e.target.value) || 0 })}
                            className="w-full p-3 rounded-xl border border-indigo-100 focus:border-indigo-500 outline-none font-black text-center text-indigo-600"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {missions.length === 0 && (
                    <div className="text-center py-12 bg-white rounded-3xl border-2 border-dashed border-slate-200">
                      <p className="text-slate-400 font-bold">No missions added yet. These are optional but increase engagement.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {step === 5 && (
              <motion.div 
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto space-y-8"
              >
                <div className="bg-emerald-50 p-8 rounded-[40px] border border-emerald-100 relative">
                  <button 
                    onClick={() => handleAISuggest(5)}
                    disabled={isGenerating}
                    className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 bg-white text-emerald-600 rounded-lg font-bold text-xs hover:bg-slate-50 transition-all shadow-sm border border-slate-100 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                    AI Suggest Bonus
                  </button>
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-4 bg-white rounded-2xl text-emerald-600 shadow-sm">
                      <MessageSquare size={32} />
                    </div>
                    <div>
                      <h3 className="text-2xl font-black text-slate-900">Response Bonus</h3>
                      <p className="text-slate-500 font-medium">Extra points users get when you respond to their feedback.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center gap-6">
                      <input 
                        type="range"
                        min={25}
                        max={500}
                        step={25}
                        value={responseBonus}
                        onChange={e => setResponseBonus(parseInt(e.target.value))}
                        className="flex-1 h-3 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                      />
                      <div className="w-24 p-4 bg-white rounded-2xl border-2 border-emerald-200 text-center">
                        <span className="text-xl font-black text-emerald-600">{responseBonus}</span>
                        <span className="block text-[10px] font-bold text-slate-400 uppercase">XP</span>
                      </div>
                    </div>
                    <p className="text-xs text-slate-400 font-bold text-center uppercase tracking-widest">Range: 25 - 500 XP</p>
                  </div>
                </div>

                <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-2xl">
                  <h3 className="text-xl font-black mb-6 flex items-center gap-2">
                    <Check className="text-emerald-400" /> Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Campaign</span>
                      <p className="font-bold text-lg">{name || 'Untitled Campaign'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Questions</span>
                      <p className="font-bold text-lg">{questions.length}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Badge</span>
                      <p className="font-bold text-lg">{badge.icon} {badge.name || 'No Name'}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Missions</span>
                      <p className="font-bold text-lg">{missions.length}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <button 
            onClick={() => setStep(Math.max(1, step - 1))}
            disabled={step === 1}
            className="flex items-center gap-2 px-6 py-3 text-slate-600 font-bold hover:bg-slate-200 rounded-2xl transition-all disabled:opacity-30"
          >
            <ChevronLeft size={20} /> Previous
          </button>
          
          <div className="flex gap-4">
            {step < 5 ? (
              <button 
                onClick={() => setStep(step + 1)}
                className="flex items-center gap-2 px-8 py-3 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Next Step <ChevronRight size={20} />
              </button>
            ) : (
              <button 
                onClick={handleFinalSave}
                className="flex items-center gap-2 px-10 py-3 bg-emerald-600 text-white rounded-2xl font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-200"
              >
                <Trophy size={20} /> Launch Campaign
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
};
