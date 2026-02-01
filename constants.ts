
import { Module, CalendarEvent, EventType } from './types';

export const COURSE_MODULES: Module[] = [
  {
    id: 'm1',
    title: 'Модуль 1: Спартанский Отбор',
    description: 'Философия элиты. Здесь слабые отсеются, а сильные начнут путь.',
    minLevel: 1,
    category: 'GENERAL',
    imageUrl: 'https://picsum.photos/id/1/400/200',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', // Sample Video
    pdfUrl: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf', // Sample PDF
    lessons: [
      {
        id: 'l1-1',
        title: 'Кто управляет миром?',
        description: 'Узнай, почему продавцы — это элита бизнеса, и как этот навык открывает любые двери в мире больших денег.',
        content: `Если ты думаешь, что деньгами управляют производители или директора — ты ошибаешься.
        Спойлер: Деньгами управляют те, кто умеет продавать.`,
        xpReward: 100,
        homeworkType: 'VIDEO',
        homeworkTask: 'Запишите видео-визитку (30-60 сек): почему вы достойны войти в элиту продаж?',
        aiGradingInstruction: 'Проверь видео. Человек должен говорить уверенно, смотреть в камеру. Речь должна быть о продажах или амбициях. Если человек мямлит или молчит - не принимай.'
      },
      {
        id: 'l1-2',
        title: 'Кодекс Воина Продаж',
        description: 'Фундаментальные принципы чести и дисциплины. Кодекс, который отличает профессионала от любителя.',
        content: `Менеджер по продажам — это не "продавец". Это человек, который помогает принять решение.`,
        xpReward: 100,
        homeworkType: 'TEXT',
        homeworkTask: 'Напишите эссе (100 слов): "Моя миссия как продавца".',
        aiGradingInstruction: 'Проверь текст. Должно быть минимум 3 предложения. Смысл должен быть про ответственность, помощь клиенту и честность. Если текст бессмысленный - отклони.'
      }
    ]
  },
  {
    id: 'm2',
    title: 'Модуль 2: Арсенал Воина',
    description: 'Психология противника и стратегия боя (Воронка).',
    minLevel: 2,
    category: 'TACTICS',
    imageUrl: 'https://picsum.photos/id/20/400/200',
    videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    pdfUrl: '#',
    lessons: [
      {
        id: 'l2-1',
        title: 'Разведка: Типы клиентов',
        description: 'Классификация психотипов клиентов. Как мгновенно считывать собеседника и выбирать правильную тактику общения.',
        content: 'В бою важно знать врага в лицо. Мы разберем 4 типа личности.',
        xpReward: 150,
        homeworkType: 'TEXT',
        homeworkTask: 'Проанализируйте 3 своих последних диалога: с какими типами вы общались?',
        aiGradingInstruction: 'Пользователь должен упомянуть типы клиентов (Аналитик, Драйвер и т.д.) и привести примеры.'
      },
      {
        id: 'l2-2',
        title: 'Карта Битвы: Воронка',
        description: 'Пошаговая стратегия ведения сделки: от первого контакта до закрытия. Твоя карта боевых действий.',
        content: 'Воронка продаж — это твой план наступления.',
        xpReward: 150,
        homeworkType: 'PHOTO',
        homeworkTask: 'Нарисуйте свою воронку на листе бумаги, сфотографируйте и отправьте.',
        aiGradingInstruction: 'На фото должна быть схема или рисунок воронки. Если фото размыто или там нет схемы - отклони.'
      }
    ]
  }
];

// Helper to create dates relative to today
const today = new Date();
const addDays = (days: number) => {
  const date = new Date(today);
  date.setDate(today.getDate() + days);
  return date;
};

export const MOCK_EVENTS: CalendarEvent[] = [
  {
    id: 'e1',
    title: 'Сбор Эшелона: Старт',
    description: 'Общий сбор всех десяток. Инструктаж от командира.',
    date: addDays(1),
    type: EventType.WEBINAR,
    durationMinutes: 60
  },
  {
    id: 'e2',
    title: 'Дедлайн: Визитка Воина',
    description: 'Сдача ДЗ по 1 модулю.',
    date: addDays(3),
    type: EventType.HOMEWORK,
    durationMinutes: 0
  }
];
