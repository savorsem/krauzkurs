
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Lesson, Module } from '../types';
import { checkHomeworkWithAI } from '../services/geminiService';
import { telegram } from '../services/telegramService';

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
    setIsSubmitting(true);
    setFeedback(null);

    const contentToSend = lesson.homeworkType === 'TEXT' ? inputText : selectedFile!;
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

  return (
    <div className="flex flex-col min-h-screen pb-32 w-full animate-slide-in relative pt-12 text-white">
      <div className="px-5">
        <h2 className="text-3xl font-black mb-2">{lesson.title}</h2>
        <div className="flex items-center gap-3 mb-8">
            <span className="bg-white/5 border border-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-[#D4AF37]">
                Target: {lesson.xpReward} XP
            </span>
            {lesson.deadline && (
                <span className="bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest text-red-400">
                    Deadline: {new Date(lesson.deadline).toLocaleDateString()}
                </span>
            )}
        </div>

        <div className="glass-panel p-6 rounded-[2rem] bg-[#1F2128] border border-white/5 mb-8">
            <div className="prose prose-invert max-w-none text-slate-300 leading-relaxed whitespace-pre-line text-sm">
                {lesson.content}
            </div>
        </div>

        {!isCompleted ? (
            <div className="bg-[#131419] rounded-[2.5rem] p-8 border border-white/5">
                <h3 className="text-lg font-bold mb-4">MISSION TASK</h3>
                <p className="text-slate-500 text-sm mb-6 italic">"{lesson.homeworkTask}"</p>
                
                {lesson.homeworkType === 'TEXT' ? (
                    <textarea value={inputText} onChange={e => setInputText(e.target.value)} className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 h-32 outline-none mb-6" placeholder="Report content..." />
                ) : (
                    <div onClick={() => fileInputRef.current?.click()} className="w-full h-32 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center mb-6 hover:border-[#6C5DD3] transition-colors cursor-pointer">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                        <span className="text-slate-500 text-xs font-bold uppercase tracking-widest">{selectedFile ? 'FILE CAPTURED' : 'UPLOAD EVIDENCE'}</span>
                    </div>
                )}

                {feedback && <div className="p-4 bg-white/5 rounded-2xl mb-6 text-sm italic border-l-4 border-[#D4AF37]">{feedback}</div>}

                <button onClick={handleSubmit} disabled={isSubmitting} className="w-full py-5 bg-white text-black rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl hover:bg-slate-200 disabled:opacity-50">
                    {isSubmitting ? 'ANALYZING...' : 'FINISH MISSION'}
                </button>
            </div>
        ) : (
            <div className="text-center p-8 bg-[#00B050]/10 border border-[#00B050]/20 rounded-[2.5rem]">
                <div className="text-4xl mb-3">🛡️</div>
                <h3 className="text-xl font-black text-[#00B050] uppercase">ACCOMPLISHED</h3>
            </div>
        )}
      </div>
    </div>
  );
};
