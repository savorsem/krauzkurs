
import React, { useState, useEffect, useRef } from 'react';
import { Button } from './Button';

interface NotebookProps {
  onAction: (type: 'HABIT' | 'GOAL' | 'GRATITUDE' | 'SUGGESTION') => void;
}

export const Notebook: React.FC<NotebookProps> = ({ onAction }) => {
  const [activeTab, setActiveTab] = useState<'DAILY' | 'GOALS' | 'GRATITUDE' | 'IDEAS'>('DAILY');
  
  // Lazy initialization from LocalStorage to restore drafts
  const [habitText, setHabitText] = useState('');
  const [goalText, setGoalText] = useState(() => localStorage.getItem('notebook_draft_goal') || '');
  const [gratitudeText, setGratitudeText] = useState(() => localStorage.getItem('notebook_draft_gratitude') || '');
  const [ideaText, setIdeaText] = useState(() => localStorage.getItem('notebook_draft_idea') || '');

  // Refs to keep track of current state inside the interval without resetting it
  const stateRef = useRef({ goalText, gratitudeText, ideaText });

  useEffect(() => {
    stateRef.current = { goalText, gratitudeText, ideaText };
  }, [goalText, gratitudeText, ideaText]);

  // Auto-save logic: Runs every 30 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      localStorage.setItem('notebook_draft_goal', stateRef.current.goalText);
      localStorage.setItem('notebook_draft_gratitude', stateRef.current.gratitudeText);
      localStorage.setItem('notebook_draft_idea', stateRef.current.ideaText);
      // Optional: console.log('Auto-saved notebook drafts'); 
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  // Daily Habits List (Mock)
  const [habits, setHabits] = useState([
    { id: 1, text: 'Прочитать 10 страниц по продажам', completed: false },
    { id: 2, text: 'Сделать 5 холодных звонков', completed: false },
    { id: 3, text: 'Медитация / Спорт', completed: false },
  ]);

  const toggleHabit = (id: number) => {
    const habit = habits.find(h => h.id === id);
    if (habit && !habit.completed) {
       onAction('HABIT'); // Award 5 XP
    }
    setHabits(habits.map(h => h.id === id ? { ...h, completed: !h.completed } : h));
  };

  const submitGoal = () => {
    if (!goalText.trim()) return;
    onAction('GOAL'); // Award 10 XP
    localStorage.removeItem('notebook_draft_goal'); // Clear draft on success
    setGoalText('');
  };

  const submitGratitude = () => {
    if (!gratitudeText.trim()) return;
    onAction('GRATITUDE'); // Award 10 XP
    localStorage.removeItem('notebook_draft_gratitude'); // Clear draft on success
    setGratitudeText('');
  };

  const submitIdea = () => {
    if (!ideaText.trim()) return;
    onAction('SUGGESTION'); // Award 50 XP
    localStorage.removeItem('notebook_draft_idea'); // Clear draft on success
    setIdeaText('');
  };

  return (
    <div className="animate-fade-in pb-32">
        <div className="glass-panel p-6 rounded-[2rem] border border-white/5 mb-6 bg-[#1F2128]">
            <header className="mb-6">
                <h2 className="text-2xl font-black text-white">Блокнот Спартанца</h2>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Дисциплина - мать победы</p>
            </header>

            {/* Notebook Tabs */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6">
                {['DAILY', 'GOALS', 'GRATITUDE', 'IDEAS'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab as any)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-colors border ${
                            activeTab === tab 
                            ? 'bg-[#6C5DD3] text-white border-[#6C5DD3]' 
                            : 'bg-transparent text-slate-500 border-slate-700 hover:border-slate-500'
                        }`}
                    >
                        {tab === 'DAILY' ? 'Привычки' : tab === 'GOALS' ? 'Цели' : tab === 'GRATITUDE' ? 'Благодарность' : 'Идеи'}
                    </button>
                ))}
            </div>

            {/* Content Area */}
            <div className="min-h-[300px]">
                {activeTab === 'DAILY' && (
                    <div className="space-y-4">
                        <div className="bg-black/20 p-4 rounded-2xl border border-white/5">
                            <h3 className="text-white font-bold mb-4">Ежедневный Ритуал</h3>
                            <div className="space-y-3">
                                {habits.map(h => (
                                    <div key={h.id} 
                                        onClick={() => toggleHabit(h.id)}
                                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border ${h.completed ? 'bg-[#00B050]/10 border-[#00B050]/30' : 'bg-white/5 border-transparent hover:bg-white/10'}`}
                                    >
                                        <div className={`w-5 h-5 rounded flex items-center justify-center border ${h.completed ? 'bg-[#00B050] border-[#00B050]' : 'border-slate-500'}`}>
                                            {h.completed && <span className="text-white text-xs">✓</span>}
                                        </div>
                                        <span className={`text-sm font-medium ${h.completed ? 'text-white line-through opacity-50' : 'text-slate-300'}`}>{h.text}</span>
                                        {h.completed && <span className="ml-auto text-[#00B050] text-[10px] font-black">+5 XP</span>}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <p className="text-slate-500 text-[10px] text-center mt-4">Выполняй привычки ежедневно для бонуса.</p>
                    </div>
                )}

                {activeTab === 'GOALS' && (
                    <div className="space-y-4 animate-slide-in">
                        <div className="bg-gradient-to-br from-[#D4AF37]/10 to-transparent p-6 rounded-2xl border border-[#D4AF37]/20">
                             <div className="flex justify-between items-start mb-2">
                                <h3 className="text-[#D4AF37] font-black text-lg">Цель на Курс</h3>
                                <span className="text-white font-bold text-2xl">🏆</span>
                             </div>
                             <p className="text-white/80 text-sm italic mb-4">"Нет цели - нет результата. Запиши, что ты сделал сегодня для своей главной цели."</p>
                             
                             <textarea 
                                value={goalText}
                                onChange={(e) => setGoalText(e.target.value)}
                                placeholder="Сегодня я сделал..."
                                className="w-full bg-black/30 text-white p-4 rounded-xl border border-white/10 outline-none h-32 text-sm mb-4 resize-none focus:border-[#D4AF37]/50"
                             />
                             <div className="flex justify-between items-center">
                                 <span className="text-[9px] text-slate-500 uppercase tracking-widest">Автосохранение вкл.</span>
                                 <button onClick={submitGoal} className="px-6 py-3 bg-[#D4AF37] text-black font-black uppercase text-xs rounded-xl hover:bg-[#F4CF57] shadow-lg shadow-[#D4AF37]/20">
                                     Зафиксировать (+10 XP)
                                 </button>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'GRATITUDE' && (
                    <div className="space-y-4 animate-slide-in">
                        <div className="bg-gradient-to-br from-[#6C5DD3]/10 to-transparent p-6 rounded-2xl border border-[#6C5DD3]/20">
                             <h3 className="text-[#6C5DD3] font-black text-lg mb-2">Дневник Благодарности</h3>
                             <p className="text-white/80 text-sm mb-4">Кого или что ты хочешь поблагодарить сегодня?</p>
                             
                             <textarea 
                                value={gratitudeText}
                                onChange={(e) => setGratitudeText(e.target.value)}
                                placeholder="Я благодарен за..."
                                className="w-full bg-black/30 text-white p-4 rounded-xl border border-white/10 outline-none h-32 text-sm mb-4 resize-none focus:border-[#6C5DD3]/50"
                             />
                             <div className="flex justify-between items-center">
                                 <span className="text-[9px] text-slate-500 uppercase tracking-widest">Автосохранение вкл.</span>
                                 <button onClick={submitGratitude} className="px-6 py-3 bg-[#6C5DD3] text-white font-black uppercase text-xs rounded-xl hover:bg-[#7D6EE4] shadow-lg shadow-[#6C5DD3]/20">
                                     Отправить (+10 XP)
                                 </button>
                             </div>
                        </div>
                    </div>
                )}

                {activeTab === 'IDEAS' && (
                    <div className="space-y-4 animate-slide-in">
                         <div className="bg-white/5 p-6 rounded-2xl border border-white/10">
                             <h3 className="text-white font-black text-lg mb-2">Инициатива</h3>
                             <p className="text-slate-400 text-sm mb-4">Есть идея как улучшить курс или приложение? Предлагай.</p>
                             
                             <textarea 
                                value={ideaText}
                                onChange={(e) => setIdeaText(e.target.value)}
                                placeholder="Мое предложение..."
                                className="w-full bg-black/30 text-white p-4 rounded-xl border border-white/10 outline-none h-32 text-sm mb-4 resize-none focus:border-white/20"
                             />
                             <div className="flex justify-between items-center">
                                 <span className="text-[9px] text-slate-500 uppercase tracking-widest">Автосохранение вкл.</span>
                                 <button onClick={submitIdea} className="px-6 py-3 bg-white text-black font-black uppercase text-xs rounded-xl hover:bg-slate-200 shadow-lg">
                                     Внести (+50 XP)
                                 </button>
                             </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};
