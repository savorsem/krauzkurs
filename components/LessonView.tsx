
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Lesson, Module } from '../types';
import { checkHomeworkWithAI } from '../services/geminiService';
import { telegram } from '../services/telegramService';
import { Logger } from '../services/logger';

// Robust ESM export handling for ReactPlayer
const VideoPlayer = (ReactPlayer as any).default || ReactPlayer;

interface LessonViewProps {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: (lessonId: string, bonusXp: number) => void;
  onBack: () => void;
  parentModule?: Module;
  onAskQuestion: (question: string) => void;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  isCompleted, 
  onComplete, 
  parentModule,
}) => {
  const [inputText, setInputText] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<'LIKE' | 'DISLIKE' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedFile(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const calculateHomeworkBonus = () => {
    let bonus = 0;
    const now = new Date();
    
    // Check for deadline if present
    if (lesson.deadline) {
        const deadline = new Date(lesson.deadline);
        if (now <= deadline) {
            bonus += 50; // "Speed of Action" Bonus
        }
    } else {
        // Mock logic: submissions within 24h of "opening"
        bonus += 10; 
    }
    
    return bonus;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // Validation
    if (lesson.homeworkType === 'TEXT') {
        if (!inputText.trim()) {
            telegram.haptic('error');
            return;
        }
    } else {
        if (!selectedFile) {
            telegram.haptic('error');
            return;
        }
    }

    setIsSubmitting(true);
    setFeedback(null);
    setUserRating(null); // Reset rating on new submission

    const contentToSend = lesson.homeworkType === 'TEXT' ? inputText : (selectedFile || '');
    const result = await checkHomeworkWithAI(contentToSend, lesson.homeworkType, lesson.aiGradingInstruction);

    setIsSubmitting(false);
    if (result.passed) {
        const bonus = calculateHomeworkBonus();
        telegram.haptic('success');
        onComplete(lesson.id, bonus);
        setFeedback(result.feedback);
    } else {
        telegram.haptic('error');
        setFeedback(result.feedback);
    }
  };

  const handleRateFeedback = (rating: 'LIKE' | 'DISLIKE') => {
      setUserRating(rating);
      telegram.haptic('selection');
      Logger.info('AI_GRADING_FEEDBACK', {
          lessonId: lesson.id,
          rating,
          feedbackText: feedback
      });
  };

  const getDifficultyConfig = (diff: string) => {
      switch(diff) {
          case 'Easy': return {
              color: 'text-green-400',
              bg: 'bg-green-500/10',
              border: 'border-green-500/30',
              icon: '🟢',
              label: 'НОВОБРАНЕЦ'
          };
          case 'Medium': return {
              color: 'text-yellow-400',
              bg: 'bg-yellow-500/10',
              border: 'border-yellow-500/30',
              icon: '🟡',
              label: 'ВОИН'
          };
          case 'Hard': return {
              color: 'text-red-400',
              bg: 'bg-red-500/10',
              border: 'border-red-500/30',
              icon: '🔴',
              label: 'СПАРТАНЕЦ'
          };
          default: return {
              color: 'text-slate-400',
              bg: 'bg-slate-400/10',
              border: 'border-slate-400/30',
              icon: '⚪',
              label: 'ОБЫЧНЫЙ'
          };
      }
  };

  const diffConfig = getDifficultyConfig(lesson.difficulty);

  return (
    <div className="flex flex-col min-h-screen pb-32 w-full animate-slide-in relative pt-12 text-white">
      <div className="px-5">
        <div className="flex items-start justify-between gap-4 mb-2">
            <h2 className="text-3xl font-black leading-none">{lesson.title}</h2>
        </div>
        
        {/* Difficulty & Meta Tags */}
        <div className="flex flex-wrap items-center gap-2 mb-8">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${diffConfig.bg} ${diffConfig.border}`}>
                <span className="text-xs">{diffConfig.icon}</span>
                <span className={`text-[10px] font-black uppercase tracking-widest ${diffConfig.color}`}>
                    {diffConfig.label} ({lesson.difficulty})
                </span>
            </div>

            <span className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-[#D4AF37] flex items-center gap-1">
                <span>🏆</span> {lesson.xpReward} XP
            </span>
            
            {lesson.deadline && (
                <span className="bg-red-500/10 border border-red-500/20 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-red-400 flex items-center gap-1">
                    <span>⏳</span> {new Date(lesson.deadline).toLocaleDateString()}
                </span>
            )}
        </div>
        
        {/* VIDEO PLAYER SECTION */}
        {lesson.videoUrl && (
             <div className="mb-8 rounded-[1.5rem] overflow-hidden border border-white/10 shadow-2xl relative bg-black aspect-video group">
                 <VideoPlayer 
                    url={lesson.videoUrl} 
                    width="100%" 
                    height="100%" 
                    controls 
                    light={true}
                    playIcon={
                        <div className="w-16 h-16 rounded-full bg-[#6C5DD3]/90 flex items-center justify-center backdrop-blur-md shadow-[0_0_30px_rgba(108,93,211,0.5)] group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white ml-1">
                                <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                            </svg>
                        </div>
                    }
                 />
                 <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/10">
                     <span className="text-[10px] font-black uppercase tracking-widest text-white">Видео-брифинг</span>
                 </div>
             </div>
        )}

        <div className="glass-panel p-6 rounded-[2rem] bg-[#1F2128]/80 border border-white/5 mb-8 backdrop-blur-md">
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {lesson.content}
            </div>
        </div>

        {!isCompleted ? (
            <div className="bg-[#131419]/90 rounded-[2.5rem] p-8 border border-white/5 shadow-2xl relative overflow-hidden group backdrop-blur-md">
                <div className="absolute top-0 right-0 p-8 opacity-5 text-9xl group-hover:scale-110 transition-transform duration-700 pointer-events-none">📝</div>
                <div className="relative z-10">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <span className="text-[#6C5DD3]">⚡</span> БОЕВАЯ ЗАДАЧА
                    </h3>
                    <p className="text-slate-400 text-sm mb-6 italic bg-white/5 p-4 rounded-xl border-l-2 border-[#6C5DD3]">
                        "{lesson.homeworkTask}"
                    </p>
                    
                    {lesson.homeworkType === 'TEXT' ? (
                        <textarea value={inputText} onChange={e => setInputText(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 h-32 outline-none mb-6 focus:border-[#6C5DD3] transition-colors font-medium text-sm" placeholder="Введите отчет..." />
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center mb-6 hover:border-[#6C5DD3] hover:bg-[#6C5DD3]/5 transition-all cursor-pointer group/upload">
                            <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover/upload:scale-110 transition-transform">
                                <span className="text-xl">📎</span>
                            </div>
                            <span className="text-slate-500 text-xs font-bold uppercase tracking-widest group-hover/upload:text-white transition-colors">
                                {selectedFile ? 'ФАЙЛ ЗАГРУЖЕН' : 'ПРИКРЕПИТЬ МАТЕРИАЛ'}
                            </span>
                        </div>
                    )}

                    {feedback && (
                        <div className="mb-6 animate-fade-in">
                            <div className="p-4 bg-white/5 rounded-2xl text-sm italic border-l-4 border-[#D4AF37] mb-2">
                                {feedback}
                            </div>
                            <div className="flex items-center gap-3 justify-end">
                                <span className="text-[10px] font-bold text-slate-500 uppercase">Оценка корректна?</span>
                                <button 
                                    onClick={() => handleRateFeedback('LIKE')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${userRating === 'LIKE' ? 'bg-green-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                >
                                    👍
                                </button>
                                <button 
                                    onClick={() => handleRateFeedback('DISLIKE')}
                                    className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${userRating === 'DISLIKE' ? 'bg-red-500 text-white' : 'bg-white/5 text-slate-400 hover:bg-white/10'}`}
                                >
                                    👎
                                </button>
                            </div>
                        </div>
                    )}

                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-slate-200 disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-2">
                        {isSubmitting && <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>}
                        {isSubmitting ? 'АНАЛИЗ...' : 'ЗАВЕРШИТЬ МИССИЮ'}
                    </button>
                </div>
            </div>
        ) : (
            <div className="text-center p-8 bg-[#00B050]/10 border border-[#00B050]/20 rounded-[2.5rem] animate-scale-in backdrop-blur-md">
                <div className="text-4xl mb-3 animate-bounce">🛡️</div>
                <h3 className="text-xl font-black text-[#00B050] uppercase tracking-widest">МИССИЯ ВЫПОЛНЕНА</h3>
                {feedback && <div className="mt-4 p-4 bg-black/20 rounded-xl text-slate-300 text-sm italic border border-[#00B050]/10">"{feedback}"</div>}
            </div>
        )}
      </div>
    </div>
  );
};
