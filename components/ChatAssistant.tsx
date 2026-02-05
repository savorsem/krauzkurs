
import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage } from '../types';
import { createChatSession, sendMessageToGemini } from '../services/geminiService';
import { Chat } from '@google/genai';

interface ChatAssistantProps {
  history: ChatMessage[];
  onUpdateHistory: (newHistory: ChatMessage[]) => void;
  systemInstruction: string;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ history, onUpdateHistory, systemInstruction }) => {
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatSession, setChatSession] = useState<Chat | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only initialize session if it doesn't exist
    if (!chatSession) {
        const session = createChatSession(systemInstruction, history);
        setChatSession(session);
    }
  }, [chatSession, systemInstruction]); // Removed history dependency to prevent infinite session recreation

  useEffect(() => { 
    if (history.length === 0) {
      const initialMsg: ChatMessage = { id: 'welcome', role: 'model', text: 'Привет, боец! Я твой AI-командир. Готов к разбору полетов?', timestamp: new Date().toISOString() };
      onUpdateHistory([initialMsg]);
    }
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); 
  }, [history, isLoading, onUpdateHistory]);

  const handleSend = async () => {
    if (!inputText.trim() || !chatSession) return;
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', text: inputText, timestamp: new Date().toISOString() };
    const updatedHistory = [...history, userMsg];
    onUpdateHistory(updatedHistory);
    setInputText('');
    setIsLoading(true);
    const responseText = await sendMessageToGemini(chatSession, userMsg.text);
    const modelMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'model', text: responseText, timestamp: new Date().toISOString() };
    onUpdateHistory([...updatedHistory, modelMsg]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#0F1115] max-w-2xl mx-auto w-full animate-fade-in min-h-screen">
      {/* Header */}
      <div className="px-6 py-6 flex items-center justify-between sticky top-0 z-10 bg-[#0F1115]/80 backdrop-blur-md border-b border-white/5">
        <div>
           <h1 className="text-2xl font-black text-white">Штаб</h1>
           <p className="text-[#6C5DD3] text-[10px] font-black uppercase tracking-widest">AI Commander</p>
        </div>
        <div className="w-10 h-10 bg-white/5 border border-white/10 rounded-full flex items-center justify-center shadow-lg text-xl text-white">🫡</div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-6 pb-32">
        {history.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-slide-in`}>
            {msg.role === 'model' && (
                <div className="w-8 h-8 rounded-full bg-[#1F2128] border border-white/10 flex-shrink-0 mr-3 flex items-center justify-center text-slate-400 text-[10px]">CMD</div>
            )}
            <div className={`max-w-[85%] p-5 text-sm font-medium leading-relaxed shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-[#6C5DD3] text-white rounded-[20px] rounded-tr-sm shadow-[#6C5DD3]/20' 
                  : 'bg-[#1F2128] text-slate-200 border border-white/5 rounded-[20px] rounded-tl-sm'
              }`}>
              {msg.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start animate-fade-in">
             <div className="w-8 h-8 rounded-full bg-[#1F2128] mr-3"></div>
             <div className="bg-[#1F2128] border border-white/5 px-6 py-4 rounded-[20px] rounded-tl-sm shadow-sm flex gap-1.5 items-center">
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-100"></span>
                 <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce delay-200"></span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-5 fixed bottom-24 left-0 right-0 max-w-2xl mx-auto z-20">
        <div className="bg-[#1F2128] border border-white/10 p-2 rounded-[2rem] shadow-xl flex items-center gap-2 pr-2 backdrop-blur-md">
          <input
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Запросить инструктаж..."
            className="flex-1 bg-transparent text-white p-4 pl-6 focus:outline-none placeholder:text-slate-500 text-sm font-bold"
          />
          <button onClick={handleSend} disabled={!inputText.trim() || isLoading} className="w-12 h-12 bg-[#6C5DD3] rounded-full text-white flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-30 disabled:scale-100 shadow-lg shadow-[#6C5DD3]/20">
            ↑
          </button>
        </div>
      </div>
    </div>
  );
};
