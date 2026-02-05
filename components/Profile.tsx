import React, { useState } from 'react';
import { UserProgress, CalendarEvent, ThemeConfig, NotificationSettings, ShopItem, NewsItem } from '../types';
import { telegram } from '../services/telegramService';
import { generateSpartanAvatar } from '../services/geminiService';
import { Button } from './Button';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface ProfileProps {
  userProgress: UserProgress;
  onLogout: () => void;
  allUsers: UserProgress[];
  onUpdateUser: (updatedUser: Partial<UserProgress>) => void;
  events: CalendarEvent[];
  onReferral: () => void;
  onShareStory: () => void;
  isSettingsOpen: boolean; 
  theme?: ThemeConfig;
  onClose?: () => void;
}

// --- MOCK DATA FOR SHOP & NEWS ---
const SHOP_ITEMS: ShopItem[] = [
    { id: 'armor_stealth', type: 'ARMOR', name: 'Броня "Тень"', description: 'Для скрытных операций.', price: 500, value: 'Midnight Stealth', imageUrl: '🌑' },
    { id: 'armor_gold', type: 'ARMOR', name: 'Золотой Легат', description: 'Церемониальная броня.', price: 2000, value: 'Golden God', imageUrl: '👑' },
    { id: 'armor_cyber', type: 'ARMOR', name: 'Кибер-Спартанец', description: 'Технологии будущего.', price: 1500, value: 'Futuristic Chrome', imageUrl: '🦾' },
    { id: 'theme_red', type: 'THEME', name: 'Красная Ярость', description: 'Агрессивный стиль интерфейса.', price: 300, value: '#EF4444', imageUrl: '🔴' },
    { id: 'theme_blue', type: 'THEME', name: 'Холодный Разум', description: 'Спокойный синий акцент.', price: 300, value: '#3B82F6', imageUrl: '🔵' },
];

const NEWS_ITEMS: NewsItem[] = [
    { id: 'n2', type: 'EVENT', title: 'Турнир Продаж', date: 'Вчера', content: 'Топ-3 бойца по XP получат доступ к закрытому чату с кураторами.' },
    { id: 'n3', type: 'ALERT', title: 'Технические работы', date: '3 дня назад', content: 'Связь с сервером восстановлена. Прогресс синхронизирован.' },
];

const ARMOR_OPTIONS = [
  { id: 'Classic Bronze', label: 'Легионер', icon: '🏺' }, 
  { id: 'Midnight Stealth', label: 'Тень', icon: '🌑' }, 
  { id: 'Golden God', label: 'Командир', icon: '👑' }, 
  { id: 'Futuristic Chrome', label: 'Кибер', icon: '🦾' }
];

const BACKGROUND_OPTIONS = [
  { id: 'Ancient Battlefield', label: 'Поле Битвы', icon: '⚔️' },
  { id: 'Temple of Olympus', label: 'Олимп', icon: '🏛️' },
  { id: 'Stormy Peak', label: 'Шторм', icon: '⚡' },
  { id: 'Volcanic Gates', label: 'Вулкан', icon: '🔥' },
  { id: 'Sci-Fi Command Center', label: 'Штаб', icon: '🖥️' },
  { id: 'Training Grounds', label: 'Арена', icon: '🏋️' },
  { id: 'Nebula Vista', label: 'Космос', icon: '🌌' },
];

interface ModalProps {
    title: string;
    children: React.ReactNode;
    onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ title, children, onClose }) => (
    <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center animate-fade-in">
        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose}></div>
        <div className="bg-[#1F2128] w-full max-w-lg h-[85vh] sm:h-auto sm:max-h-[80vh] sm:rounded-[2rem] rounded-t-[2.5rem] p-6 flex flex-col relative z-10 animate-slide-in border border-white/10 shadow-2xl">
            <div className="w-12 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden"></div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-white">{title}</h2>
                <button onClick={onClose} className="w-8 h-8 bg-white/5 rounded-full flex items-center justify-center text-slate-400 hover:text-white">✕</button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4">
                {children}
            </div>
        </div>
    </div>
);

export const Profile: React.FC<ProfileProps> = ({ 
    userProgress, 
    onLogout, 
    onUpdateUser, 
    onClose,
}) => {
  const [activeModal, setActiveModal] = useState<'NONE' | 'SETTINGS' | 'SHOP' | 'NEWS' | 'CUSTOMIZE'>('NONE');
  
  // Settings State
  const [editName, setEditName] = useState(userProgress.name);
  const [notifState, setNotifState] = useState<NotificationSettings>(userProgress.notifications);

  // Customization State
  const [selectedArmor, setSelectedArmor] = useState(userProgress.armorStyle || 'Classic Bronze');
  const [selectedBg, setSelectedBg] = useState(userProgress.backgroundStyle || 'Ancient Battlefield');
  const [isGenerating, setIsGenerating] = useState(false);

  const statsData = [
      { subject: 'Sales', A: userProgress.stats.skills.sales, fullMark: 100 },
      { subject: 'Tactics', A: userProgress.stats.skills.tactics, fullMark: 100 },
      { subject: 'Psych', A: userProgress.stats.skills.psychology, fullMark: 100 },
      { subject: 'Focus', A: userProgress.stats.skills.discipline, fullMark: 100 },
      { subject: 'Charisma', A: Math.min(100, (userProgress.friendsCount * 10) + 20), fullMark: 100 },
  ];

  const handleSaveSettings = () => {
    onUpdateUser({ 
        name: editName,
        notifications: notifState,
    });
    setActiveModal('NONE');
    telegram.haptic('success');
  };

  const handleBuyItem = (item: ShopItem) => {
      if (userProgress.inventory?.includes(item.id)) {
          if (item.type === 'ARMOR') onUpdateUser({ armorStyle: item.value });
          telegram.haptic('selection');
          return;
      }

      if (userProgress.balance >= item.price) {
          onUpdateUser({
              balance: userProgress.balance - item.price,
              inventory: [...(userProgress.inventory || []), item.id]
          });
          telegram.haptic('success');
      } else {
          telegram.haptic('error');
          alert('Недостаточно средств!');
      }
  };

  const handleRegenerateAvatar = async () => {
      if (!userProgress.originalPhotoBase64) {
          alert("Отсутствует исходное фото. Невозможно обновить аватар.");
          return;
      }
      
      setIsGenerating(true);
      telegram.haptic('medium');

      const newAvatarUrl = await generateSpartanAvatar(
          userProgress.originalPhotoBase64,
          userProgress.level,
          selectedArmor,
          selectedBg
      );

      setIsGenerating(false);

      if (newAvatarUrl) {
          onUpdateUser({
              avatarUrl: newAvatarUrl,
              armorStyle: selectedArmor,
              backgroundStyle: selectedBg
          });
          setActiveModal('NONE');
          telegram.haptic('success');
      } else {
          alert("Ошибка генерации. Попробуйте позже.");
          telegram.haptic('error');
      }
  };

  const renderShop = () => (
      <div className="grid grid-cols-2 gap-3">
          {SHOP_ITEMS.map(item => {
              const isOwned = userProgress.inventory?.includes(item.id);
              const isEquipped = userProgress.armorStyle === item.value;
              
              return (
                <div key={item.id} className={`p-4 rounded-2xl border ${isOwned ? 'bg-[#1F2128] border-white/10' : 'bg-[#131419] border-white/5'} flex flex-col items-center text-center relative overflow-hidden group`}>
                    <div className="text-4xl mb-2 group-hover:scale-110 transition-transform">{item.imageUrl}</div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-[10px] text-slate-500 mb-3 leading-tight">{item.description}</p>
                    
                    <button 
                        onClick={() => handleBuyItem(item)}
                        className={`w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                            ${isEquipped 
                                ? 'bg-green-500/20 text-green-500 border border-green-500/30' 
                                : isOwned 
                                    ? 'bg-white/10 text-white hover:bg-white/20' 
                                    : 'bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20 hover:scale-105'}
                        `}
                    >
                        {isEquipped ? 'ЭКИПИРОВАНО' : isOwned ? 'НАДЕТЬ' : `${item.price} 🪙`}
                    </button>
                </div>
              );
          })}
      </div>
  );

  const renderNews = () => (
      <div className="space-y-4">
          {NEWS_ITEMS.map(news => (
              <div key={news.id} className="bg-white/5 p-5 rounded-2xl border border-white/5 hover:border-white/10 transition-colors">
                  <div className="flex justify-between items-start mb-2">
                      <span className={`text-[9px] font-black uppercase px-2 py-1 rounded ${
                          news.type === 'UPDATE' ? 'bg-blue-500/20 text-blue-400' :
                          news.type === 'EVENT' ? 'bg-[#D4AF37]/20 text-[#D4AF37]' :
                          'bg-red-500/20 text-red-400'
                      }`}>{news.type}</span>
                      <span className="text-[10px] text-slate-500 font-bold">{news.date}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2">{news.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{news.content}</p>
              </div>
          ))}
      </div>
  );

  const renderCustomize = () => (
      <div className="space-y-6">
          <div className="flex justify-center">
              <div className="relative w-40 h-40">
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#6C5DD3] bg-[#1F2128] shadow-[0_0_30px_rgba(108,93,211,0.3)]">
                      <img src={userProgress.avatarUrl} className={`w-full h-full object-cover transition-opacity ${isGenerating ? 'opacity-50' : 'opacity-100'}`} />
                  </div>
                  {isGenerating && (
                      <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-10 h-10 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
                      </div>
                  )}
              </div>
          </div>

          <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Стиль Брони</h3>
              <div className="grid grid-cols-2 gap-2">
                  {ARMOR_OPTIONS.map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => setSelectedArmor(opt.id)}
                        className={`p-3 rounded-xl border flex items-center gap-3 transition-all ${selectedArmor === opt.id ? 'bg-[#6C5DD3] border-[#6C5DD3] text-white shadow-lg' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                          <span className="text-xl">{opt.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                      </button>
                  ))}
              </div>
          </div>

          <div>
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">Окружение</h3>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                  {BACKGROUND_OPTIONS.map(opt => (
                      <button 
                        key={opt.id}
                        onClick={() => setSelectedBg(opt.id)}
                        className={`flex-shrink-0 px-4 py-3 rounded-xl border transition-all ${selectedBg === opt.id ? 'bg-white text-black border-white' : 'bg-white/5 border-white/5 text-slate-400 hover:bg-white/10'}`}
                      >
                          <span className="mr-2">{opt.icon}</span>
                          <span className="text-[10px] font-bold uppercase">{opt.label}</span>
                      </button>
                  ))}
              </div>
          </div>

          <Button fullWidth onClick={handleRegenerateAvatar} disabled={isGenerating} icon={isGenerating ? null : '⚡'}>
              {isGenerating ? 'КОВКА БРОНИ...' : 'ОБНОВИТЬ АВАТАР'}
          </Button>
          
          <p className="text-center text-[9px] text-slate-500 max-w-xs mx-auto">
              *Используется AI для генерации уникального образа на основе вашего исходного фото и уровня.
          </p>
      </div>
  );

  return (
    <div className="min-h-screen bg-[#0F1115] text-white pb-40 animate-fade-in relative font-sans overflow-hidden">
      {/* Dynamic Background */}
      <div className="absolute top-0 left-0 w-full h-[50vh] bg-gradient-to-b from-[#1F2128] to-[#0F1115] z-0 pointer-events-none"></div>
      <div className="absolute top-[-10%] right-[-20%] w-[300px] h-[300px] bg-[#6C5DD3] rounded-full blur-[120px] opacity-20 pointer-events-none animate-pulse-slow"></div>

      {activeModal === 'SHOP' && <Modal title="Арсенал (Магазин)" onClose={() => setActiveModal('NONE')}>{renderShop()}</Modal>}
      {activeModal === 'NEWS' && <Modal title="Сводка Штаба" onClose={() => setActiveModal('NONE')}>{renderNews()}</Modal>}
      {activeModal === 'CUSTOMIZE' && <Modal title="Кастомизация" onClose={() => setActiveModal('NONE')}>{renderCustomize()}</Modal>}
      
      {activeModal === 'SETTINGS' && (
           <Modal title="Настройки Профиля" onClose={() => setActiveModal('NONE')}>
              <div className="space-y-4">
                  <div>
                      <label className="text-[10px] uppercase font-bold text-slate-500 ml-2 mb-1">Позывной</label>
                      <input 
                        value={editName}
                        onChange={e => setEditName(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-2xl p-4 text-white font-bold outline-none focus:border-[#6C5DD3]"
                      />
                  </div>
                  <div className="bg-black/20 rounded-2xl p-4">
                      <div className="flex justify-between items-center mb-4">
                          <span className="text-sm text-white font-bold">Push-уведомления</span>
                          <div onClick={() => setNotifState(p => ({...p, pushEnabled: !p.pushEnabled}))} className={`w-10 h-6 rounded-full relative transition-colors cursor-pointer ${notifState.pushEnabled ? 'bg-[#00B050]' : 'bg-slate-700'}`}>
                              <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifState.pushEnabled ? 'right-1' : 'left-1'}`}></div>
                          </div>
                      </div>
                  </div>
                  <Button fullWidth onClick={handleSaveSettings}>Сохранить</Button>
                  <button onClick={onLogout} className="w-full py-4 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-500/10 rounded-xl transition-colors">Выйти из системы</button>
              </div>
           </Modal>
      )}

      {/* HEADER */}
      <div className="relative z-10 px-6 pt-6 pb-2 flex justify-between items-start">
         <button onClick={onClose} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">←</button>
         <button onClick={() => setActiveModal('SETTINGS')} className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 transition-colors">⚙️</button>
      </div>

      {/* PROFILE CARD */}
      <div className="relative z-10 px-6 mb-8">
          <div className="flex flex-col items-center">
              <div className="relative w-32 h-32 mb-4 group cursor-pointer" onClick={() => setActiveModal('CUSTOMIZE')}>
                  <div className="absolute inset-0 border-2 border-[#D4AF37] rounded-full animate-spin-slow opacity-50"></div>
                  <div className="absolute -inset-2 border border-white/10 rounded-full"></div>
                  <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#0F1115] relative z-10 bg-[#1F2128]">
                      <img src={userProgress.avatarUrl || 'https://via.placeholder.com/150'} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full z-30 backdrop-blur-sm">
                      <span className="text-2xl">🎨</span>
                  </div>
                  <div className="absolute bottom-0 right-0 bg-[#00B050] w-8 h-8 rounded-full border-4 border-[#0F1115] z-20 flex items-center justify-center text-[10px] font-black text-black shadow-lg">
                      {userProgress.level}
                  </div>
              </div>
              
              <h1 className="text-3xl font-black text-white mb-1 tracking-tight">{userProgress.name}</h1>
              <p className="text-[#6C5DD3] text-xs font-bold uppercase tracking-widest mb-6 bg-[#6C5DD3]/10 px-3 py-1 rounded-full border border-[#6C5DD3]/20">
                  {userProgress.role === 'ADMIN' ? 'Commander' : 'Spartan Elite'}
              </p>

              {/* Quick Stats */}
              <div className="flex gap-4 w-full justify-center mb-8">
                  <div className="bg-[#1F2128]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
                      <span className="text-2xl mb-1">⚡</span>
                      <span className="text-lg font-black text-white">{userProgress.xp}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Опыт</span>
                  </div>
                  <div className="bg-[#1F2128]/80 backdrop-blur-md px-5 py-3 rounded-2xl border border-white/10 flex flex-col items-center min-w-[100px]">
                      <span className="text-2xl mb-1">🪙</span>
                      <span className="text-lg font-black text-white">{userProgress.balance}</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Монеты</span>
                  </div>
              </div>
          </div>
      </div>

      {/* ACTIONS GRID */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-8 relative z-10">
          <button 
            onClick={() => setActiveModal('SHOP')}
            className="bg-gradient-to-br from-[#1F2128] to-[#131419] p-5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center hover:border-[#D4AF37]/50 transition-all group relative overflow-hidden"
          >
              <div className="absolute inset-0 bg-[#D4AF37]/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">🛍️</span>
              <span className="text-xs font-black text-white uppercase tracking-widest">Магазин</span>
          </button>
          
          <button 
            onClick={() => setActiveModal('NEWS')}
            className="bg-gradient-to-br from-[#1F2128] to-[#131419] p-5 rounded-[2rem] border border-white/10 flex flex-col items-center justify-center hover:border-blue-500/50 transition-all group relative overflow-hidden"
          >
              <div className="absolute top-3 right-3 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📰</span>
              <span className="text-xs font-black text-white uppercase tracking-widest">Новости</span>
          </button>
      </div>

      {/* SKILLS RADAR */}
      <div className="px-6 mb-8 relative z-10">
          <div className="bg-[#1F2128]/80 backdrop-blur-md rounded-[2.5rem] p-6 border border-white/5">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-black text-white">Боевые Навыки</h3>
                  <span className="text-[10px] text-slate-500 font-bold uppercase">AI Analysis</span>
              </div>
              <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="70%" data={statsData}>
                          <PolarGrid stroke="rgba(255,255,255,0.1)" />
                          <PolarAngleAxis dataKey="subject" tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 'bold' }} />
                          <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                          <Radar name="Skills" dataKey="A" stroke="#6C5DD3" strokeWidth={2} fill="#6C5DD3" fillOpacity={0.3} />
                      </RadarChart>
                  </ResponsiveContainer>
              </div>
          </div>
      </div>

      {/* FRIENDS & STREAK */}
      <div className="px-6 grid grid-cols-2 gap-3 mb-20 relative z-10">
          <div className="bg-[#1F2128] rounded-[2rem] p-5 border border-white/5 relative overflow-hidden group">
              <div className="flex -space-x-2 mb-3">
                  {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-[#1F2128] bg-slate-700 flex items-center justify-center text-[8px]">👤</div>
                  ))}
                  <div className="w-8 h-8 rounded-full border-2 border-[#1F2128] flex items-center justify-center bg-[#2B2D33] text-[9px] font-bold">
                      +{userProgress.friendsCount}
                  </div>
              </div>
              <h3 className="text-white font-bold text-sm">Отряд</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase">{userProgress.friendsCount} бойцов</p>
          </div>

          <div className="bg-[#1F2128] rounded-[2rem] p-5 border border-white/5 relative overflow-hidden group">
              <div className="absolute right-2 top-2 text-4xl opacity-20 group-hover:scale-110 transition-transform">🔥</div>
              <h3 className="text-[#D4AF37] font-bold text-sm mt-8">Серия Побед</h3>
              <p className="text-white text-2xl font-black">{userProgress.stats.notebookEntries.habits} <span className="text-xs text-slate-500 font-normal align-middle">дней</span></p>
          </div>
      </div>

    </div>
  );
};