'use client';
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Bug, ThumbsUp, Lightbulb, HelpCircle, Mic, Square, Upload, Star, CheckCircle2, ChevronRight, ChevronLeft, Image as ImageIcon, Link as LinkIcon, Info } from 'lucide-react';
import { clsx } from 'clsx';
import axios from 'axios';
import { mockCompanyData } from '../services/mockData';

import { playSound } from '../utils/sound';

interface FeedbackFlowProps {
  isOpen: boolean;
  onClose: () => void;
  projectName: string;
  projectId: string;
  initialStage?: number;
}

const CATEGORIES = [
  { id: 'bug', label: 'Bug', icon: Bug, color: 'text-red-500', bg: 'bg-red-50', border: 'border-red-200' },
  { id: 'praise', label: 'Praise', icon: ThumbsUp, color: 'text-green-500', bg: 'bg-green-50', border: 'border-green-200' },
  { id: 'suggestion', label: 'Suggestion', icon: Lightbulb, color: 'text-yellow-500', bg: 'bg-yellow-50', border: 'border-yellow-200' },
  { id: 'question', label: 'Question', icon: HelpCircle, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-200' },
];

const RATINGS = [
  { id: 'ui', label: 'User Interface', tooltip: 'Visual appeal and layout' },
  { id: 'ux', label: 'User Experience', tooltip: 'Ease of use and flow' },
  { id: 'performance', label: 'Performance', tooltip: 'Speed and responsiveness' },
  { id: 'features', label: 'Features', tooltip: 'Functionality and utility' },
];

export const FeedbackFlow = ({ isOpen, onClose, projectName, projectId, initialStage = 0 }: FeedbackFlowProps) => {
  const [stage, setStage] = useState(initialStage);
  const [direction, setDirection] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [audioText, setAudioText] = useState('');
  const [permissionStatus, setPermissionStatus] = useState<PermissionState | 'prompt' | 'denied' | 'granted'>('prompt');
  const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
  const audioChunksRef = React.useRef<Blob[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [feedbackData, setFeedbackData] = useState({
    category: '',
    description: '',
    ratings: {} as Record<string, number>,
    textAnswers: {} as Record<string, string>,
    files: [] as File[],
    link: ''
  });

  // Find campaign questions if available
  const campaign = mockCompanyData.company.projects
    .find(p => p.id === projectId || p.name === projectName)
    ?.campaigns.find(c => c.status === 'Active');
  
  const questions = campaign?.questions || [];
  const hasCustomQuestions = questions.length > 0;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      const validFiles: File[] = [];
      const MAX_SIZE = 5 * 1024 * 1024; // 5MB
      const WARN_SIZE = 2 * 1024 * 1024; // 2MB

      newFiles.forEach((file: File) => {
        if (file.size > MAX_SIZE) {
          alert(`The file ${file.name} is too large (limit 5MB). Please resize.`);
        } else {
          if (file.size > WARN_SIZE) {
            alert(`The file ${file.name} is large (>2MB). We recommend resizing for faster upload.`);
          }
          validFiles.push(file);
        }
      });

      setFeedbackData(prev => ({
        ...prev,
        files: [...prev.files, ...validFiles].slice(0, 3) // Limit to 3 files
      }));
    }
  };

  const removeFile = (index: number) => {
    setFeedbackData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index)
    }));
  };

  // Check permission on mount
  useEffect(() => {
    if (navigator.permissions && navigator.permissions.query) {
      navigator.permissions.query({ name: 'microphone' as PermissionName })
        .then((permissionStatus) => {
          setPermissionStatus(permissionStatus.state);
          permissionStatus.onchange = () => {
            setPermissionStatus(permissionStatus.state);
          };
        })
        .catch(() => {
          // Fallback for browsers that don't support query
          setPermissionStatus('prompt');
        });
    }
  }, []);

  // Reset state when opening
  useEffect(() => {
    if (isOpen) {
      setStage(initialStage);
      setFeedbackData({
        category: '',
        description: '',
        ratings: {},
        textAnswers: {},
        files: [],
        link: ''
      });
      setAudioText('');
      setIsRecording(false);
      setIsTranscribing(false);
    }
  }, [isOpen, initialStage]);

  const nextStage = () => {
    playSound('success');
    setDirection(1);
    setStage((prev) => prev + 1);
  };

  const prevStage = () => {
    playSound('click');
    setDirection(-1);
    setStage((prev) => prev - 1);
  };

  const handleCategorySelect = (id: string) => {
    setFeedbackData(prev => ({ ...prev, category: id }));
    nextStage();
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      setPermissionStatus('granted');
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribe(audioBlob);
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      playSound('click');
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermissionStatus('denied');
      alert('Error accessing the microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      playSound('click');
    }
  };

  const handleTranscribe = async (audioBlob: Blob) => {
    setIsTranscribing(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');

      const response = await fetch('/api/feedback/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const text = data.text;

      if (text) {
        setAudioText((prev) => prev + (prev ? ' ' : '') + text);
        
        if (hasCustomQuestions && questions[stage]?.style === 'text') {
          handleTextAnswer(questions[stage].id, (feedbackData.textAnswers[questions[stage].id] || '') + (feedbackData.textAnswers[questions[stage].id] ? ' ' : '') + text);
        } else {
          setFeedbackData(prev => ({ 
            ...prev, 
            description: prev.description + (prev.description ? ' ' : '') + text 
          }));
        }
        playSound('success');
      }
    } catch (error) {
      console.error('Transcription error:', error);
      alert('Transcription error. Try again.');
    } finally {
      setIsTranscribing(false);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleRating = (id: string, value: number) => {
    setFeedbackData(prev => ({
      ...prev,
      ratings: { ...prev.ratings, [id]: value }
    }));
  };

  const handleTextAnswer = (id: string, value: string) => {
    setFeedbackData(prev => ({
      ...prev,
      textAnswers: { ...prev.textAnswers, [id]: value }
    }));
  };

  const handleFinish = async () => {
    setIsSubmitting(true);
    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const formData = new FormData();
      formData.append('userId', userId);
      formData.append('campaignId', projectId);
      formData.append('category', feedbackData.category);
      formData.append('description', feedbackData.description);
      formData.append('link', feedbackData.link);
      formData.append('ratings', JSON.stringify(feedbackData.ratings));
      formData.append('textAnswers', JSON.stringify(feedbackData.textAnswers));
      
      feedbackData.files.forEach(file => {
        formData.append('files', file);
      });

      await axios.post('/api/feedback', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      playSound('taskComplete');
      nextStage(); // Go to success screen
      setTimeout(() => {
        onClose();
        setIsSubmitting(false);
      }, 3000);
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Error submitting feedback. Try again.');
      setIsSubmitting(false);
    }
  };

  const variants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction > 0 ? 45 : -45,
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1,
      rotateY: 0,
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0,
      rotateY: direction < 0 ? 45 : -45,
    }),
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/90 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[700px] relative perspective-1000">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-white z-10">
          <div>
            <h2 className="text-xl font-bold text-slate-800">{projectName}</h2>
            <div className="flex items-center gap-2 text-sm text-slate-500">
              <span>Step {stage + 1} of {hasCustomQuestions ? questions.length + 2 : 5}</span>
              <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${((stage + 1) / (hasCustomQuestions ? questions.length + 2 : 5)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-400" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 relative overflow-hidden bg-slate-50/50">
          <AnimatePresence initial={false} custom={direction} mode="wait">
            
            {/* Custom Questions Flow */}
            {hasCustomQuestions ? (
              <>
                {stage < questions.length ? (
                  <motion.div
                    key={`q-${questions[stage].id}`}
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 p-8 flex flex-col gap-6"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">Question {stage + 1}</h3>
                      <p className="text-slate-500">{questions[stage].text}</p>
                    </div>

                    <div className="flex-1 flex flex-col justify-center gap-6 max-w-md mx-auto w-full">
                      {questions[stage].style === 'rating' ? (
                        <div className="flex justify-center gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRating(questions[stage].id, star)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star
                                size={32}
                                className={clsx(
                                  star <= (feedbackData.ratings[questions[stage].id] || 0)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-slate-200"
                                )}
                              />
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-4">
                          <textarea
                            value={feedbackData.textAnswers[questions[stage].id] || ''}
                            onChange={(e) => handleTextAnswer(questions[stage].id, e.target.value)}
                            placeholder="Type your answer here..."
                            className="w-full p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none h-40"
                          />
                          <div className="flex flex-col items-center justify-center gap-4">
                            <button
                              onClick={() => {
                                if (isRecording) {
                                  stopRecording();
                                } else {
                                  startRecording();
                                }
                              }}
                              disabled={isTranscribing || permissionStatus === 'denied'}
                              className={clsx(
                                "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                                isRecording 
                                  ? "bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg" 
                                  : isTranscribing
                                    ? "bg-slate-100 text-slate-400 cursor-wait"
                                    : permissionStatus === 'denied'
                                      ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                              )}
                            >
                              {isTranscribing ? (
                                <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                              ) : isRecording ? (
                                <Square size={20} fill="currentColor" />
                              ) : (
                                <Mic size={20} />
                              )}
                              
                              {isTranscribing 
                                ? "Transcribing..." 
                                : isRecording 
                                  ? "Stop Recording" 
                                  : permissionStatus === 'denied'
                                    ? "Microphone Blocked"
                                    : "Record Audio (Whisper)"}
                            </button>
                            
                            {permissionStatus === 'denied' && (
                              <p className="text-xs text-red-500 max-w-xs text-center">
                                Microphone access was denied. Please enable it in your browser settings to use this feature.
                              </p>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between">
                      <button onClick={prevStage} disabled={stage === 0} className="p-3 rounded-full hover:bg-slate-200 text-slate-500 disabled:opacity-50">
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={nextStage}
                        disabled={questions[stage].style === 'rating' ? !feedbackData.ratings[questions[stage].id] : !feedbackData.textAnswers[questions[stage].id]}
                        className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      >
                        Next <ChevronRight size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : stage === questions.length ? (
                  // Proof Stage for Custom Flow
                  <motion.div
                    key="stage-proof"
                    custom={direction}
                    variants={variants}
                    initial="enter"
                    animate="center"
                    exit="exit"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="absolute inset-0 p-8 flex flex-col gap-6"
                  >
                    <div className="text-center space-y-2">
                      <h3 className="text-2xl font-bold text-slate-800">Proof (Optional)</h3>
                      <p className="text-slate-500">Add screenshots or links to support your feedback.</p>
                    </div>

                    <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                      >
                        <input 
                          type="file" 
                          ref={fileInputRef} 
                          onChange={handleFileChange} 
                          className="hidden" 
                          multiple 
                          accept="image/png, image/jpeg"
                        />
                        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                          <ImageIcon size={32} />
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-slate-700">Add Screenshots</p>
                          <p className="text-xs text-slate-400">Up to 3 images (PNG, JPG - Max 5MB)</p>
                        </div>
                      </div>

                      {feedbackData.files.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                          {feedbackData.files.map((file, index) => (
                            <div key={index} className="relative group shrink-0">
                              <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                                <img 
                                  src={URL.createObjectURL(file)} 
                                  alt="preview" 
                                  className="w-full h-full object-cover" 
                                />
                              </div>
                              <button 
                                onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={12} />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                          <LinkIcon size={16} /> Video Link (YouTube/Loom)
                        </label>
                        <input
                          type="url"
                          placeholder="https://..."
                          value={feedbackData.link}
                          onChange={(e) => setFeedbackData(prev => ({ ...prev, link: e.target.value }))}
                          className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <button onClick={prevStage} className="p-3 rounded-full hover:bg-slate-200 text-slate-500">
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={handleFinish}
                        disabled={isSubmitting}
                        className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                      >
                        {isSubmitting ? 'Submitting...' : 'Finish Feedback'} <CheckCircle2 size={20} />
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  // Success Stage for Custom Flow
                  <motion.div
                    key="stage-success"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                      className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
                    >
                      <CheckCircle2 size={64} />
                    </motion.div>
                    <h2 className="text-3xl font-black text-slate-800 mb-2">Feedback Sent!</h2>
                    <p className="text-slate-500 text-center max-w-xs mb-8">
                      You earned <span className="font-bold text-blue-600">+{campaign?.responseBonus || 150} points</span>. 
                      Your feedback will be reviewed and you can earn extra bonuses!
                    </p>
                    {campaign?.badge && (
                      <div className="flex items-center gap-3 bg-yellow-50 p-4 rounded-xl border border-yellow-100 mb-6">
                        <div className="text-3xl">{campaign.badge.icon}</div>
                        <div className="text-left">
                          <p className="font-bold text-yellow-800 text-sm">Badge Unlocked!</p>
                          <p className="font-black text-yellow-900">{campaign.badge.name}</p>
                        </div>
                      </div>
                    )}
                    <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
                      <motion.div 
                        className="h-full bg-green-500"
                        initial={{ width: 0 }}
                        animate={{ width: "100%" }}
                        transition={{ duration: 1.5, ease: "circOut" }}
                      />
                    </div>
                    <p className="text-xs text-slate-400 mt-2">Progress 100%</p>
                  </motion.div>
                )}
              </>
            ) : (
              // Standard Flow (Stages 0-4)
              <>
                {/* Stage 0: Category */}
                {stage === 0 && (
              <motion.div
                key="stage0"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 p-8 flex flex-col items-center justify-center gap-8"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">What type of feedback?</h3>
                  <p className="text-slate-500">Choose a category to start.</p>
                </div>
                <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className={clsx(
                        "flex flex-col items-center justify-center gap-3 p-6 rounded-2xl border-2 transition-all hover:scale-105 active:scale-95",
                        cat.bg, cat.border, "hover:shadow-lg"
                      )}
                    >
                      <cat.icon size={32} className={cat.color} />
                      <span className={clsx("font-bold", cat.color)}>{cat.label}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Stage 1: Description */}
            {stage === 1 && (
              <motion.div
                key="stage1"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 p-8 flex flex-col gap-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">Tell us more</h3>
                  <p className="text-slate-500">Describe your experience or record an audio.</p>
                </div>
                
                <div className="flex-1 flex flex-col gap-4">
                  <textarea
                    value={feedbackData.description}
                    onChange={(e) => setFeedbackData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Type your feedback here..."
                    className="w-full flex-1 p-4 rounded-2xl border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all resize-none"
                  />
                  
                  <div className="flex flex-col items-center justify-center gap-4">
                    <button
                      onClick={toggleRecording}
                      disabled={isTranscribing || permissionStatus === 'denied'}
                      className={clsx(
                        "flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all",
                        isRecording 
                          ? "bg-red-500 text-white animate-pulse shadow-red-200 shadow-lg" 
                          : isTranscribing
                            ? "bg-slate-100 text-slate-400 cursor-wait"
                            : permissionStatus === 'denied'
                              ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                      )}
                    >
                      {isTranscribing ? (
                        <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                      ) : isRecording ? (
                        <Square size={20} fill="currentColor" />
                      ) : (
                        <Mic size={20} />
                      )}
                      
                      {isTranscribing 
                        ? "Transcribing..." 
                        : isRecording 
                          ? "Stop Recording" 
                          : permissionStatus === 'denied'
                            ? "Microphone Blocked"
                            : "Record Audio (Whisper)"}
                    </button>
                    
                    {permissionStatus === 'denied' && (
                      <p className="text-xs text-red-500 max-w-xs text-center">
                        Microphone access was denied. Please enable it in your browser settings to use this feature.
                      </p>
                    )}
                  </div>
                  {audioText && (
                    <div className="p-3 bg-slate-100 rounded-xl text-xs text-slate-500 italic">
                      Transcription: "{audioText}"
                    </div>
                  )}
                </div>

                <div className="flex justify-between">
                  <button onClick={prevStage} className="p-3 rounded-full hover:bg-slate-200 text-slate-500">
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextStage} 
                    disabled={!feedbackData.description}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 2: Ratings */}
            {stage === 2 && (
              <motion.div
                key="stage2"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 p-8 flex flex-col gap-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">Rate your Experience</h3>
                  <p className="text-slate-500">Give ratings for the following aspects.</p>
                </div>

                <div className="flex-1 flex flex-col justify-center gap-6 max-w-md mx-auto w-full">
                  {RATINGS.map((rating) => (
                    <div key={rating.id} className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{rating.label}</span>
                        <div className="group relative">
                          <Info size={14} className="text-slate-400 cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-1 bg-slate-800 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                            {rating.tooltip}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(rating.id, star)}
                            className="focus:outline-none transition-transform hover:scale-110"
                          >
                            <Star
                              size={28}
                              className={clsx(
                                star <= (feedbackData.ratings[rating.id] || 0)
                                  ? "fill-yellow-400 text-yellow-400"
                                  : "text-slate-200"
                              )}
                            />
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-between">
                  <button onClick={prevStage} className="p-3 rounded-full hover:bg-slate-200 text-slate-500">
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={nextStage}
                    disabled={Object.keys(feedbackData.ratings).length < RATINGS.length}
                    className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-full font-bold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    Next <ChevronRight size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 3: Proof */}
            {stage === 3 && (
              <motion.div
                key="stage3"
                custom={direction}
                variants={variants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
                className="absolute inset-0 p-8 flex flex-col gap-6"
              >
                <div className="text-center space-y-2">
                  <h3 className="text-2xl font-bold text-slate-800">Proof</h3>
                  <p className="text-slate-500">Send screenshots or links (optional, but worth points!).</p>
                </div>

                <div className="flex-1 flex flex-col gap-6 max-w-md mx-auto w-full">
                  <div 
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-slate-200 rounded-2xl p-8 flex flex-col items-center justify-center gap-4 hover:bg-slate-50 transition-colors cursor-pointer group"
                  >
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileChange} 
                      className="hidden" 
                      multiple 
                      accept="image/png, image/jpeg"
                    />
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                      <ImageIcon size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-slate-700">Add Screenshots</p>
                      <p className="text-xs text-slate-400">Up to 3 images (PNG, JPG - Max 5MB)</p>
                    </div>
                  </div>

                  {feedbackData.files.length > 0 && (
                    <div className="flex gap-2 overflow-x-auto pb-2">
                      {feedbackData.files.map((file, index) => (
                        <div key={index} className="relative group shrink-0">
                          <div className="w-20 h-20 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                            <img 
                              src={URL.createObjectURL(file)} 
                              alt="preview" 
                              className="w-full h-full object-cover" 
                            />
                          </div>
                          <button 
                            onClick={(e) => { e.stopPropagation(); removeFile(index); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X size={12} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                      <LinkIcon size={16} /> Video Link (YouTube/Loom)
                    </label>
                    <input
                      type="url"
                      placeholder="https://..."
                      value={feedbackData.link}
                      onChange={(e) => setFeedbackData(prev => ({ ...prev, link: e.target.value }))}
                      className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="flex justify-between">
                  <button onClick={prevStage} className="p-3 rounded-full hover:bg-slate-200 text-slate-500">
                    <ChevronLeft size={24} />
                  </button>
                  <button 
                    onClick={handleFinish}
                    disabled={isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-wait"
                  >
                    {isSubmitting ? 'Submitting...' : 'Finish Feedback'} <CheckCircle2 size={20} />
                  </button>
                </div>
              </motion.div>
            )}

            {/* Stage 4: Success */}
            {stage === 4 && (
              <motion.div
                key="stage4"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="absolute inset-0 flex flex-col items-center justify-center bg-white z-20"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                  className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-6"
                >
                  <CheckCircle2 size={64} />
                </motion.div>
                <h2 className="text-3xl font-black text-slate-800 mb-2">Feedback Sent!</h2>
                <p className="text-slate-500 text-center max-w-xs mb-8">
                  You earned <span className="font-bold text-blue-600">+150 points</span>. 
                  Your feedback will be reviewed and you can earn extra bonuses!
                </p>
                <div className="w-full max-w-xs bg-slate-100 rounded-full h-2 overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500"
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.5, ease: "circOut" }}
                  />
                </div>
                <p className="text-xs text-slate-400 mt-2">Progress 100%</p>
              </motion.div>
            )}
              </>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};
