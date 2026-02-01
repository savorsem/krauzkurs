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
    <div className="p-6 bg-slate-50 min-h-full pb-24 max-w-2xl mx-auto">
      <header className="mb-8">
        <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-bold tracking-wider mb-2">
          КУРАТОР
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900">Проверка заданий</h1>
        <p className="text-slate-500 mt-2">3 задания ожидают вашей проверки</p>
      </header>

      <div className="space-y-6">
        {PENDING_HOMEWORKS.map((hw) => (
          <div key={hw.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-bold text-slate-900 text-lg">{hw.student}</h3>
                <p className="text-sm text-slate-500">{hw.lesson}</p>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-500 px-2 py-1 rounded-lg">{hw.date}</span>
            </div>
            
            <div className="bg-slate-50 p-4 rounded-2xl mb-4 border border-slate-100">
              <p className="text-slate-700 italic text-sm">"{hw.content}"</p>
            </div>

            <div className="flex gap-3">
              <Button variant="secondary" className="flex-1 text-sm border-slate-200">
                На доработку
              </Button>
              <Button variant="primary" className="flex-1 text-sm bg-green-600 hover:bg-green-700 shadow-green-500/20">
                Принять
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};