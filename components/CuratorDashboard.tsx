import React from 'react';
import { Button } from './Button';

// Mock data for homework submissions
const PENDING_HOMEWORKS = [
  { id: '1', student: 'Иван Петров', lesson: 'Типы клиентов', date: '12:00 Сегодня', content: 'Аналитический тип: любит цифры, факты. Драйвер: ценит время, результат...' },
  { id: '2', student: 'Анна Сидорова', lesson: 'Холодные звонки', date: '09:30 Вчера', content: 'Скрипт: "Здравствуйте, Иван Иванович! Звоню по рекомендации..."' },
  { id: '3', student: 'Макс Волков', lesson: 'Работа с возражениями', date: '18:45 Вчера', content: 'На возражение "дорого" я отвечу ценностью продукта...' },
];

export const CuratorDashboard: React.FC = () => {
  return (
    <div className="p-6 bg-[#0F1115] min-h-full pb-32 max-w-2xl mx-auto animate-fade-in text-white">
      <header className="mb-8">
        <div className="inline-block px-3 py-1 bg-[#6C5DD3]/20 text-[#6C5DD3] border border-[#6C5DD3]/30 rounded-full text-xs font-black tracking-wider mb-2">
          КУРАТОР
        </div>
        <h1 className="text-3xl font-black text-white">Проверка заданий</h1>
        <p className="text-slate-400 mt-2 text-sm font-medium">3 задания ожидают вашей проверки</p>
      </header>

      <div className="space-y-6">
        {PENDING_HOMEWORKS.map((hw) => (
          <div key={hw.id} className="bg-[#1F2128] p-6 rounded-[2rem] shadow-lg border border-white/5 hover:border-[#6C5DD3]/30 transition-all">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-white text-lg">{hw.student}</h3>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mt-1">{hw.lesson}</p>
              </div>
              <span className="text-[10px] font-black bg-white/5 text-slate-400 px-3 py-1.5 rounded-lg border border-white/5">{hw.date}</span>
            </div>
            
            <div className="bg-black/30 p-4 rounded-xl mb-6 border border-white/5">
              <p className="text-slate-300 italic text-sm leading-relaxed">"{hw.content}"</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 text-xs bg-white/5 border-white/10 text-white hover:bg-white/10">
                На доработку
              </Button>
              <Button variant="primary" className="flex-1 text-xs bg-[#00B050] hover:bg-[#00B050]/90 shadow-[#00B050]/20 border-transparent">
                Принять
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};