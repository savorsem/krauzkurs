
import React, { useState, useRef } from 'react';
import ReactPlayer from 'react-player';
import { Lesson, Module } from '../types';
import { checkHomeworkWithAI } from '../services/geminiService';

interface LessonViewProps {
  lesson: Lesson;
  isCompleted: boolean;
  onComplete: (lessonId: string) => void;
  onBack: () => void;
  parentModule?: Module;
}

export const LessonView: React.FC<LessonViewProps> = ({ 
  lesson, 
  isCompleted, 
  onComplete, 
  onBack, 
  parentModule 
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
      reader.onloadend = () => {
        setSelectedFile(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    if (lesson.homeworkType === 'TEXT' && !inputText.trim()) return;
    if ((lesson.homeworkType === 'PHOTO' || lesson.homeworkType === 'VIDEO' || lesson.homeworkType === 'FILE') && !selectedFile) return;

    setIsSubmitting(true);
    setFeedback(null);

    const contentToSend = lesson.homeworkType === 'TEXT' ? inputText : selectedFile!;
    const result = await checkHomeworkWithAI(contentToSend, lesson.homeworkType, lesson.aiGradingInstruction);

    setIsSubmitting(false);
    if (result.passed) {
        onComplete(lesson.id);
        setFeedback(result.feedback);
    } else {
        setFeedback(result.feedback);
    }
  };

  const hasVideo = !!parentModule?.videoUrl;
  
  const isSubmitDisabled = isSubmitting || (lesson.homeworkType === 'TEXT' ? !inputText.trim() : !selectedFile);

  return (
    <div className="flex flex-col min-h-screen pb-32 w-full animate-slide-in">
      {/* GLASS HEADER */}
      <div className="sticky top-0 z-30 px-5 py-4 flex items-center justify-between glass border-b-0 rounded-b-[2rem] mb-6 shadow-sm">
        <button onClick={onBack} className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-[#1A1A1A] shadow-soft active:scale-95 transition-transform">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
             <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
           </svg>
        </button>
        <div className="flex flex-col items-center">
             <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Урок</span>
             <span className="text-xs font-bold text-[#1A1A1A] max-w-[150px] truncate">{lesson.title}</span>
        </div>
        <div className="w-10"></div>
      </div>

      <div className="px-5">
        {/* VIDEO PLAYER */}
        {hasVideo && (
            <div className="mb-8 shadow-2xl rounded-[1.5rem] overflow-hidden border border-white/20">
                 <div className="player-wrapper">
                  <ReactPlayer className="react-player" url={parentModule.videoUrl} width="100%" height="100%" controls light={true} 
                    playIcon={
                      <div className="w-16 h-16 bg-white/90 backdrop-blur rounded-full flex items-center justify-center pl-1 text-[#1A1A1A] shadow-xl hover:scale-110 transition-transform">
                         <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                            <path fillRule="evenodd" d="M4.5 5.653c0-1.426 1.529-2.33 2.779-1.643l11.54 6.348c1.295.712 1.295 2.573 0 3.285L7.28 19.991c-1.25.687-2.779-.217-2.779-1.643V5.653z" clipRule="evenodd" />
                         </svg>
                      </div>
                    }
                  />
                </div>
            </div>
        )}

        {/* CONTENT CARD */}
        <div className="glass p-6 md:p-8 rounded-[2rem] shadow-soft mb-6">
            <div className="flex items-center gap-3 mb-5">
               <span className="bg-[#1A1A1A] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-lg">
                 +{lesson.xpReward} XP
               </span>
               {isCompleted && <span className="text-[#00B050] text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                   <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3"><path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" /></svg>
                   Выполнено
               </span>}
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-[#1A1A1A] mb-4 leading-tight tracking-tight">{lesson.title}</h2>
            <p className="text-slate-500 text-sm font-medium mb-6 leading-relaxed">{lesson.description}</p>
            <div className="w-full h-px bg-slate-200 mb-6"></div>
            <div className="prose prose-slate max-w-none text-[#1A1A1A] leading-7 font-medium whitespace-pre-line text-sm md:text-base">
                {lesson.content}
            </div>
        </div>

        {/* HOMEWORK SECTION */}
        {!isCompleted ? (
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
                <div className="absolute inset-0 bg-[#1A1A1A]"></div>
                <div className="relative z-10 p-6 md:p-8 text-white">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-2xl border border-white/10">
                            {lesson.homeworkType === 'VIDEO' ? '📹' : lesson.homeworkType === 'PHOTO' ? '📸' : lesson.homeworkType === 'FILE' ? '📄' : '✍️'}
                        </div>
                        <div>
                        <h3 className="font-bold text-lg leading-tight">Боевая задача</h3>
                        <p className="text-white/40 text-[10px] font-black uppercase tracking-widest mt-1">Отчет командованию</p>
                        </div>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 mb-6">
                         <p className="text-white/90 text-sm italic leading-relaxed">"{lesson.homeworkTask}"</p>
                    </div>
                    
                    {lesson.homeworkType === 'TEXT' ? (
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            placeholder="Ваш ответ..."
                            className="w-full bg-black/30 text-white p-4 rounded-2xl border border-white/10 focus:border-[#4B6BFB] outline-none h-40 mb-6 resize-none text-sm placeholder:text-white/20 transition-colors"
                        />
                    ) : (
                        <div onClick={() => fileInputRef.current?.click()} className={`w-full h-32 mb-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center cursor-pointer transition-colors ${selectedFile ? 'border-[#00B050] bg-[#00B050]/10' : 'border-white/20 hover:border-white/40 bg-white/5'}`}>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                onChange={handleFileChange} 
                                accept={lesson.homeworkType === 'VIDEO' ? "video/*" : lesson.homeworkType === 'FILE' ? "application/pdf" : "image/*"} 
                                className="hidden" 
                            />
                            {selectedFile ? (
                                <div className="flex flex-col items-center">
                                    <span className="text-[#00B050] text-2xl mb-2">✓</span>
                                    <span className="text-[#00B050] font-bold text-xs">
                                        {lesson.homeworkType === 'FILE' ? 'PDF загружен' : 'Материал загружен'}
                                    </span>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center">
                                    <span className="text-white/40 text-2xl mb-2">+</span>
                                    <span className="text-white/40 text-xs uppercase font-bold tracking-wide">
                                        {lesson.homeworkType === 'FILE' ? 'Загрузить PDF' : 'Загрузить файл'}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {feedback && (
                        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl animate-fade-in">
                            <p className="text-red-400 text-[10px] font-black uppercase tracking-widest mb-1">Вердикт</p>
                            <p className="text-white text-sm leading-relaxed">{feedback}</p>
                        </div>
                    )}

                    <button 
                        onClick={handleSubmit} 
                        disabled={isSubmitDisabled} 
                        className="w-full py-4 bg-white text-black rounded-xl font-black text-xs uppercase tracking-[0.15em] hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    >
                        {isSubmitting ? 'Анализ...' : 'Отправить задание'}
                    </button>
                </div>
            </div>
        ) : (
            <div className="bg-[#E8F7F0] rounded-[2.5rem] p-8 text-center border border-[#00B050]/20 mb-8 animate-fade-in">
                <div className="w-12 h-12 bg-[#00B050] text-white rounded-full flex items-center justify-center text-xl mx-auto mb-3 shadow-lg shadow-green-500/30">✓</div>
                <p className="text-[#00B050] font-black text-lg uppercase tracking-widest">Принято</p>
                {feedback && <p className="text-[#00B050] text-sm mt-3 opacity-80 leading-relaxed font-medium">{feedback}</p>}
            </div>
        )}
      </div>
    </div>
  );
};
