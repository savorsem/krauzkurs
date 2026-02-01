
import React, { useState, useRef, useEffect } from 'react';
import { ArenaScenario, ChatMessage } from '../types';
import { createArenaSession, sendMessageToGemini, evaluateArenaBattle } from '../services/geminiService';
import { Chat } from '@google/genai';

const SCENARIOS: ArenaScenario[] = [
    {
        id: 's1',
        title: 'Продай ручку',
        difficulty: 'Easy',
        clientRole: 'Скептичный предприниматель, у которого уже есть дорогая ручка Parker. Он торопится.',
        objective: 'Убедить клиента рассмотреть твою ручку как запасной вариант или подарок.',
        initialMessage: 'Молодой человек, у меня встреча через 2 минуты. Что у вас?'
    },
    {
        id: 's2',
        title: 'Отработка "Дорого"',
        difficulty: 'Medium',
        clientRole: 'Экономный закупщик, который ищет самое дешевое решение. Не видит ценности в качестве.',
        objective: 'Обосновать высокую цену через долгосрочную выгоду.',
        initialMessage: 'Я видел ваше предложение. Цены космос. У конкурентов на 30% дешевле.'
    },
    {
        id: 's3',
        title: 'Холодный звонок',
        difficulty: 'Hard',
        clientRole: 'Раздраженный директор, которого постоянно отвлекают звонками. Хочет бросить трубку.',
        objective: 'Зацепить внимание за 30 секунд и назначить встречу.',
        initialMessage: 'Алло? Кто это? Откуда у вас мой номер?'
    }
];

export const SalesArena: React.FC = () => {
    const [activeScenario, setActiveScenario] = useState<ArenaScenario | null>(null);
    const [chatSession, setChatSession] = useState<Chat | null>(null);
    const [history, setHistory] = useState<ChatMessage[]>([]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [battleResult, setBattleResult] = useState<string | null>(null);
    const [isEvaluating, setIsEvaluating] = useState(false);
    
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [history, isLoading]);

    const startScenario = (scenario: ArenaScenario) => {
        setActiveScenario(scenario);
        const session = createArenaSession(scenario.clientRole, scenario.objective);
        setChatSession(session);
        setHistory([{
            id: 'init',
            role: 'model',
            text: scenario.initialMessage,
            timestamp: new Date().toISOString()
        }]);
        setBattleResult(null);
    };

    const handleSend = async () => {
        if (!inputText.trim() || !chatSession) return;

        const userMsg: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            text: inputText,
            timestamp: new Date().toISOString()
        };

        const updatedHistory = [...history, userMsg];
        setHistory(updatedHistory);
        setInputText('');
        setIsLoading(true);

        const responseText = await sendMessageToGemini(chatSession, userMsg.text);

        const modelMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'model',
            text: responseText,
            timestamp: new Date().toISOString()
        };

        setHistory([...updatedHistory, modelMsg]);
        setIsLoading(false);
    };

    const finishBattle = async () => {
        if (!activeScenario) return;
        setIsEvaluating(true);
        const result = await evaluateArenaBattle(history.map(m => ({role: m.role, text: m.text})), activeScenario.objective);
        setBattleResult(result);
        setIsEvaluating(false);
    };

    if (!activeScenario) {
        return (
            <div className="p-6 pb-32 animate-fade-in max-w-2xl mx-auto">
                <header className="mb-10 pt-4">
                    <h1 className="text-4xl font-black text-white flex items-center gap-3">
                        <span className="text-[#6C5DD3] text-5xl">⚔️</span> АРЕНА
                    </h1>
                    <p className="text-slate-400 mt-2 font-bold text-sm tracking-wide">Симулятор боевых переговоров</p>
                </header>

                <div className="space-y-4">
                    {SCENARIOS.map(sc => (
                        <div 
                            key={sc.id} 
                            onClick={() => startScenario(sc)}
                            className="glass p-6 rounded-[2rem] border border-white/5 hover:border-[#6C5DD3]/50 transition-all cursor-pointer group active:scale-95 gold-glow relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl group-hover:scale-110 transition-transform">🤺</div>
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-3">
                                    <h3 className="text-xl font-black text-white group-hover:text-[#6C5DD3] transition-colors">{sc.title}</h3>
                                    <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest ${
                                        sc.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border border-green-500/20' :
                                        sc.difficulty === 'Medium' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/20' :
                                        'bg-red-500/20 text-red-400 border border-red-500/20'
                                    }`}>
                                        {sc.difficulty}
                                    </span>
                                </div>
                                <p className="text-slate-400 text-sm font-medium mb-6 leading-relaxed">{sc.objective}</p>
                                <div className="flex items-center gap-2 text-xs font-bold text-[#6C5DD3]">
                                    <span>ВСТУПИТЬ В БОЙ</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-4 h-4 group-hover:translate-x-1 transition-transform">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                    </svg>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full bg-[#0F1115] max-w-2xl mx-auto w-full animate-fade-in min-h-screen">
            {/* Header */}
            <div className="px-5 py-4 bg-[#0F1115]/90 backdrop-blur-md border-b border-white/5 flex items-center justify-between sticky top-0 z-20">
                <button 
                    onClick={() => setActiveScenario(null)}
                    className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                </button>
                <div className="text-center">
                    <h2 className="text-white font-bold text-sm">{activeScenario.title}</h2>
                    <div className="flex items-center justify-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></span>
                        <span className="text-[9px] text-red-400 font-black uppercase tracking-widest">LIVE BATTLE</span>
                    </div>
                </div>
                <button 
                    onClick={finishBattle}
                    className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl transition-all"
                >
                    Завершить
                </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 pb-32">
                 <div className="glass p-5 rounded-[1.5rem] border border-white/10 mb-6 bg-gradient-to-br from-white/5 to-transparent">
                    <p className="text-[#D4AF37] text-[10px] uppercase font-black tracking-widest mb-2">Цель миссии</p>
                    <p className="text-slate-200 text-sm font-medium leading-relaxed">{activeScenario.objective}</p>
                 </div>

                 {history.map((msg) => (
                    <div 
                        key={msg.id} 
                        className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}
                    >
                        {msg.role === 'model' && (
                            <div className="w-8 h-8 rounded-2xl bg-white/10 flex-shrink-0 mr-3 flex items-center justify-center font-black text-white text-[10px] border border-white/10">
                                AI
                            </div>
                        )}
                        <div 
                        className={`max-w-[80%] p-5 text-sm font-medium leading-relaxed shadow-lg ${
                            msg.role === 'user' 
                            ? 'bg-[#6C5DD3] text-white rounded-[1.5rem] rounded-tr-sm shadow-[#6C5DD3]/20' 
                            : 'glass text-slate-200 rounded-[1.5rem] rounded-tl-sm border border-white/10'
                        }`}
                        >
                        {msg.text}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start animate-fade-in">
                        <div className="ml-11 glass px-6 py-4 rounded-[1.5rem] rounded-tl-sm border border-white/5 flex gap-1.5 items-center">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="fixed bottom-0 left-0 right-0 p-5 bg-[#0F1115]/80 backdrop-blur-xl border-t border-white/5 z-20">
                <div className="max-w-2xl mx-auto flex gap-3">
                    <input
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        disabled={!!battleResult}
                        placeholder={battleResult ? "Бой окончен" : "Ваш аргумент..."}
                        className="flex-1 bg-white/5 text-white rounded-[1.2rem] px-6 py-4 focus:outline-none focus:ring-2 focus:ring-[#6C5DD3]/50 focus:bg-white/10 border border-white/5 placeholder:text-slate-600 font-bold text-sm transition-all"
                    />
                    <button 
                        onClick={handleSend}
                        disabled={!inputText.trim() || isLoading || !!battleResult}
                        className="w-14 h-14 bg-[#6C5DD3] rounded-[1.2rem] text-white flex items-center justify-center hover:scale-105 active:scale-95 transition-all shadow-lg shadow-[#6C5DD3]/30 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                        </svg>
                    </button>
                </div>
            </div>

            {/* Battle Result Modal */}
            {(battleResult || isEvaluating) && (
                <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-6 animate-fade-in">
                    <div className="bg-[#1F2128] rounded-[2.5rem] p-8 w-full max-w-sm border border-white/10 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
                        {isEvaluating ? (
                            <div className="text-center py-10">
                                <div className="text-6xl animate-bounce mb-6">⚖️</div>
                                <h3 className="text-2xl font-black text-white mb-3">Анализ тактики...</h3>
                                <p className="text-slate-500 text-sm font-bold uppercase tracking-widest">Командир изучает бой</p>
                            </div>
                        ) : (
                            <>
                                <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#6C5DD3] via-[#D4AF37] to-[#6C5DD3]"></div>
                                <div className="text-center mb-6">
                                    <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-1">Вердикт</h3>
                                    <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.3em]">Spartan Report</p>
                                </div>
                                <div className="prose prose-invert prose-sm max-w-none font-medium leading-relaxed whitespace-pre-line text-slate-300 bg-white/5 p-6 rounded-3xl border border-white/5 mb-8 max-h-[50vh] overflow-y-auto custom-scrollbar">
                                    {battleResult}
                                </div>
                                <button 
                                    onClick={() => { setBattleResult(null); setActiveScenario(null); }}
                                    className="w-full bg-white text-black py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-200 transition-colors shadow-xl"
                                >
                                    Вернуться в строй
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
