
import React, { useState } from 'react';
import { CalendarEvent, EventType } from '../types';
import { MOCK_EVENTS } from '../constants';

interface CalendarViewProps {
    externalEvents?: CalendarEvent[];
    isDark?: boolean;
}

const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
const getFirstDayOfMonth = (year: number, month: number) => {
  let day = new Date(year, month, 1).getDay();
  return day === 0 ? 6 : day - 1;
};

const formatTime = (date: Date | string) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
};

export const CalendarView: React.FC<CalendarViewProps> = ({ externalEvents, isDark = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = getDaysInMonth(year, month);
  const firstDay = getFirstDayOfMonth(year, month);

  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  const monthNames = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'];

  const allEvents = externalEvents && externalEvents.length > 0 ? externalEvents : MOCK_EVENTS;

  const getEventsForDay = (day: number) => {
    return allEvents.filter(e => {
      const d = typeof e.date === 'string' ? new Date(e.date) : e.date;
      return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
    });
  };

  const selectedEvents = selectedDate 
    ? allEvents.filter(e => {
        const d = typeof e.date === 'string' ? new Date(e.date) : e.date;
        return d.getDate() === selectedDate.getDate() && d.getMonth() === selectedDate.getMonth() && d.getFullYear() === selectedDate.getFullYear();
      })
    : [];

  const getEventTypeColor = (type: EventType) => {
    switch(type) {
      case EventType.WEBINAR: return 'bg-[#6C5DD3]';
      case EventType.HOMEWORK: return 'bg-[#D4AF37]';
      default: return 'bg-slate-400';
    }
  };

  return (
    <div className={`flex flex-col h-full animate-fade-in ${isDark ? 'text-white' : 'text-slate-900'}`}>
        {/* Sync Status Badge */}
        {externalEvents && externalEvents.length > 0 && (
            <div className="flex justify-center mb-4">
                <span className="px-3 py-1 bg-[#D4AF37]/10 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.2em] rounded-full border border-[#D4AF37]/20">
                   ✓ Синхронизировано со Штабом
                </span>
            </div>
        )}

        {/* Calendar Card */}
        <div className={`p-5 rounded-[2.5rem] mb-8 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100 shadow-sm'}`}>
            <div className="flex items-center justify-between mb-6">
                <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-3 text-slate-500 hover:text-[#6C5DD3] transition-colors">←</button>
                <span className="text-sm font-black uppercase tracking-widest">{monthNames[month]} {year}</span>
                <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-3 text-slate-500 hover:text-[#6C5DD3] transition-colors">→</button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2 text-center text-slate-500 text-[9px] font-black uppercase tracking-widest opacity-50">
                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(d => <div key={d}>{d}</div>)}
            </div>
            
            <div className="grid grid-cols-7 gap-1">
            {blanks.map(x => <div key={`blank-${x}`} className="aspect-square"></div>)}
            {days.map(day => {
                const dayEvents = getEventsForDay(day);
                const isSelected = selectedDate?.getDate() === day && selectedDate?.getMonth() === month;
                const isToday = new Date().getDate() === day && new Date().getMonth() === month && new Date().getFullYear() === year;

                return (
                <div key={day} onClick={() => setSelectedDate(new Date(year, month, day))}
                    className={`aspect-square rounded-[1rem] flex flex-col items-center justify-center relative cursor-pointer transition-all
                    ${isSelected ? 'bg-[#6C5DD3] text-white shadow-lg shadow-[#6C5DD3]/30 scale-105 z-10' : isDark ? 'hover:bg-white/10' : 'hover:bg-slate-50'}
                    ${isToday && !isSelected ? 'border-2 border-[#D4AF37] text-[#D4AF37]' : ''}
                    `}
                >
                    <span className="text-xs font-bold">{day}</span>
                    <div className="flex gap-0.5 mt-1 h-1">
                        {dayEvents.map(ev => (<div key={ev.id} className={`w-1 h-1 rounded-full ${getEventTypeColor(ev.type)}`}></div>))}
                    </div>
                </div>
                );
            })}
            </div>
        </div>

        {/* Events list */}
        <div className="space-y-4 px-1">
            {selectedEvents.length === 0 ? (
                <div className={`text-center py-8 rounded-[2rem] border-2 border-dashed ${isDark ? 'border-white/5 text-slate-600' : 'border-slate-100 text-slate-400'}`}>
                    <p className="font-bold text-xs uppercase tracking-widest">Боевых задач нет</p>
                </div>
            ) : (
                selectedEvents.map(event => (
                    <div key={event.id} className={`p-5 rounded-[2rem] flex items-center gap-4 border ${isDark ? 'bg-white/5 border-white/5' : 'bg-white border-slate-100'}`}>
                        <div className={`w-12 h-12 rounded-2xl ${getEventTypeColor(event.type)} flex items-center justify-center text-white text-xl shadow-lg opacity-80`}>
                            {event.type === EventType.WEBINAR ? '📹' : '📝'}
                        </div>
                        <div className="flex-1">
                            <div className="flex justify-between items-start">
                                <h4 className="font-bold text-sm leading-tight">{event.title}</h4>
                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-lg ${isDark ? 'bg-white/5 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>{formatTime(event.date)}</span>
                            </div>
                            <p className={`text-[10px] font-medium mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{event.description}</p>
                        </div>
                    </div>
                ))
            )}
        </div>
    </div>
  );
};
