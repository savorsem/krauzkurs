
import React, { useState, useRef, useEffect } from 'react';
import { generateSpartanAvatar } from '../services/geminiService';
import { telegram } from '../services/telegramService';
import { Button } from './Button';
import { UserProgress } from '../types';

interface AuthProps {
  onLogin: (data: any) => void;
  existingUsers?: UserProgress[];
}

type AuthStep = 'AUTH_FORM' | 'IDENTITY' | 'SCANNING' | 'CUSTOMIZATION' | 'FINALIZING';

const ARMOR_STYLES = [
  { id: 'Classic Bronze', label: 'Легионер', icon: '🏺', desc: 'Стандартная пехотная броня.' }, 
  { id: 'Midnight Stealth', label: 'Тень', icon: '🌑', desc: 'Легкая броня для разведки.' }, 
  { id: 'Golden God', label: 'Командир', icon: '👑', desc: 'Элитная церемониальная броня.' }, 
  { id: 'Futuristic Chrome', label: 'Кибер', icon: '🦾', desc: 'Экспериментальный экзоскелет.' }
];

export const Auth: React.FC<AuthProps> = ({ onLogin, existingUsers = [] }) => {
  const [step, setStep] = useState<AuthStep>('AUTH_FORM');
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  
  // Credentials
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // User Profile Data (for Registration)
  const [realName, setRealName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [armorStyle, setArmorStyle] = useState(ARMOR_STYLES[0].id);
  
  // UI State
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [isShake, setIsShake] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-fill username if available from Telegram
  useEffect(() => {
      if (telegram.isAvailable && telegram.user?.username && step === 'AUTH_FORM' && !username) {
          setUsername(telegram.user.username);
      }
      if (telegram.isAvailable && telegram.user && !realName) {
           setRealName(`${telegram.user.first_name} ${telegram.user.last_name || ''}`.trim());
      }
  }, []);

  // Validation Helpers
  const handleError = (field: string, msg: string) => {
    setErrors(prev => ({ ...prev, [field]: msg }));
    setIsShake(true);
    telegram.haptic('error');
    setTimeout(() => setIsShake(false), 500);
  };

  // Step Handlers
  const handleAuthSubmit = () => {
    setErrors({});
    const cleanUsername = username.trim().replace('@', '');
    const cleanPassword = password.trim();

    if (!cleanUsername) { handleError('username', 'Требуется идентификатор'); return; }
    if (!cleanPassword) { handleError('password', 'Требуется код доступа'); return; }

    // 1. ADMIN CHECK (Hardcoded)
    if (cleanUsername === 'admin' && cleanPassword === '55555sa5') {
        telegram.haptic('success');
        onLogin({
            role: 'ADMIN',
            name: 'Commander',
            telegramUsername: 'admin',
            isRegistration: false,
            avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=1F2128&color=fff',
            armorStyle: 'Golden God' 
        });
        return;
    }

    if (isRegisterMode) {
        // REGISTRATION FLOW
        const userExists = existingUsers.some(u => u.telegramUsername?.toLowerCase() === cleanUsername.toLowerCase());
        if (userExists) {
            handleError('username', 'Боец уже в системе');
            return;
        }
        if (cleanPassword.length < 4) {
             handleError('password', 'Слабый код (минимум 4 знака)');
             return;
        }

        telegram.haptic('light');
        setStep('IDENTITY');
    } else {
        // LOGIN FLOW
        const user = existingUsers.find(u => u.telegramUsername?.toLowerCase() === cleanUsername.toLowerCase());
        
        if (!user) {
            handleError('username', 'Боец не найден. Вступить в ряды?');
            return;
        }
        
        if (user.password !== cleanPassword) {
            handleError('password', 'Неверный код доступа');
            return;
        }

        telegram.haptic('success');
        onLogin({ ...user, isRegistration: false });
    }
  };

  const handleIdentitySubmit = () => {
    if (!realName.trim()) { handleError('name', 'Позывной обязателен'); return; }
    if (!selectedImage) { handleError('photo', 'Требуется биометрия'); return; }
    
    setStep('SCANNING');
    telegram.haptic('success');
    setLoadingText('СКАНИРОВАНИЕ БИОМЕТРИИ...');
    // Mock Scan Duration
    setTimeout(() => {
        telegram.haptic('medium');
        setStep('CUSTOMIZATION');
    }, 3000);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { handleError('photo', 'Файл слишком большой (Макс 5MB)'); return; }
      const reader = new FileReader();
      reader.onloadend = () => { 
          setSelectedImage(reader.result as string); 
          setErrors(prev => ({...prev, photo: ''}));
          telegram.haptic('selection');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalize = async () => {
    setStep('FINALIZING');
    telegram.haptic('heavy');
    const loadingMessages = ['КОВКА БРОНИ...', 'СИНХРОНИЗАЦИЯ НЕЙРОСЕТИ...', 'УСТАНОВКА СВЯЗИ СО ШТАБОМ...'];
    
    let msgIdx = 0;
    const interval = setInterval(() => {
        setLoadingText(loadingMessages[msgIdx % loadingMessages.length]);
        msgIdx++;
    }, 1500);

    try {
        const base64Data = selectedImage!.split(',')[1];
        const avatarUrl = await generateSpartanAvatar(base64Data, 1, armorStyle);
        
        clearInterval(interval);
        telegram.haptic('success');
        
        // Registration Complete
        onLogin({ 
            role: 'STUDENT', 
            name: realName, 
            telegramUsername: username.trim().replace('@', ''),
            password: password.trim(),
            originalPhoto: base64Data, 
            avatarUrl, 
            armorStyle,
            isRegistration: true
        });
    } catch (e) { 
        clearInterval(interval);
        handleError('global', 'Ошибка связи. Повторите попытку.'); 
        setStep('CUSTOMIZATION'); 
    }
  };

  // --- RENDERERS ---

  const renderAuthForm = () => (
    <div className={`space-y-8 w-full animate-fade-in ${isShake ? 'animate-shake' : ''}`}>
       {/* Brand Header */}
       <div className="text-center relative pt-4">
           {/* Purple/Blue circle backdrop */}
           <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-b from-[#4A3D8D] to-[#2D2A4A] rounded-full opacity-60"></div>
               {/* Shield Icon Replacement */}
               <div className="relative z-10 w-16 h-16 bg-[#131419] border border-white/10 rounded-xl flex items-center justify-center shadow-2xl">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M20 2L5 8.5V17.5C5 25.1 11.4 33.2 20 38C28.6 33.2 35 25.1 35 17.5V8.5L20 2Z" fill="#2A2D35" stroke="white" strokeWidth="1.5"/>
                        <path d="M20 10L12 14V18C12 23 15.5 28.5 20 32C24.5 28.5 28 23 28 18V14L20 10Z" fill="#FF4B4B"/>
                        <path d="M20 10L28 14V18C28 23 24.5 28.5 20 32V10Z" fill="#F9FAFB" opacity="0.8"/>
                    </svg>
               </div>
               
               {/* Krauz Academy Overlap Text */}
               <div className="absolute -right-16 top-1/2 -translate-y-1/2 whitespace-nowrap">
                   <span className="text-lg font-black text-[#A5B4FC] tracking-tighter drop-shadow-lg">KRAUZ ACADEMY</span>
               </div>
           </div>

           <div className="mt-4">
               <h1 className="text-2xl font-black text-white tracking-tighter flex items-center justify-center gap-1">
                   SALES<span className="text-[#6C5DD3]">PRO</span>
               </h1>
               <p className="text-slate-500 font-bold text-[8px] uppercase tracking-[0.4em]">Spartan Edition</p>
           </div>
       </div>

       {/* Mode Toggle */}
       <div className="bg-[#131419]/60 p-1 rounded-xl flex border border-white/5 relative mx-2">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#4A3D8D]/80 rounded-lg transition-all duration-300 shadow-lg ${isRegisterMode ? 'left-[calc(50%+2px)]' : 'left-1'}`}
          ></div>
          <button 
             onClick={() => { setIsRegisterMode(false); setErrors({}); }} 
             className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${!isRegisterMode ? 'text-white' : 'text-slate-500'}`}
          >
             вход
          </button>
          <button 
             onClick={() => { setIsRegisterMode(true); setErrors({}); }} 
             className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${isRegisterMode ? 'text-white' : 'text-slate-500'}`}
          >
             вступить
          </button>
       </div>

       {/* Form Fields */}
       <div className="space-y-4 px-2">
           <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${errors.username ? 'text-red-500' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
               </div>
               <input 
                 value={username} 
                 onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_@]/g, ''))} 
                 className={`w-full bg-[#131419]/80 border ${errors.username ? 'border-red-500/50' : 'border-white/5'} rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 outline-none focus:border-[#6C5DD3]/50 transition-all`}
                 placeholder="Telegram Username"
               />
           </div>

           <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <svg className={`h-5 w-5 ${errors.password ? 'text-red-500' : 'text-slate-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
               </div>
               <input 
                 type="password"
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 className={`w-full bg-[#131419]/80 border ${errors.password ? 'border-red-500/50' : 'border-white/5'} rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-600 outline-none focus:border-[#6C5DD3]/50 transition-all`}
                 placeholder="Код доступа"
               />
           </div>
           
           {(errors.username || errors.password) && (
               <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-2 mx-2">
                   <span className="text-red-500">⚠️</span>
                   <p className="text-red-400 text-xs font-bold">{errors.username || errors.password}</p>
               </div>
           )}
       </div>

       <div className="px-2">
           <button 
                onClick={handleAuthSubmit} 
                className="w-full bg-[#2B4E99] text-white rounded-2xl py-4 px-6 font-black text-xs uppercase tracking-widest shadow-xl shadow-[#2B4E99]/20 hover:bg-[#345DB3] active:scale-95 transition-all flex items-center justify-center gap-3"
           >
              {isRegisterMode ? 'ИНИЦИАЛИЗАЦИЯ' : 'ДОСТУП К ТЕРМИНАЛУ'} 
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
              </svg>
           </button>
       </div>
    </div>
  );

  const renderIdentity = () => (
      <div className={`space-y-8 w-full animate-slide-in ${isShake ? 'animate-shake' : ''}`}>
           <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">ИДЕНТИФИКАЦИЯ</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Установка нейросвязи</p>
          </div>

          <div className="space-y-4">
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block">Позывной (Отображаемое имя)</label>
                  <input 
                    value={realName} 
                    onChange={e => setRealName(e.target.value)} 
                    className={`w-full bg-[#131419] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white text-lg font-bold text-center outline-none focus:border-[#6C5DD3] transition-colors`}
                    placeholder="Например: Maverick"
                  />
              </div>

              <div 
                onClick={() => fileInputRef.current?.click()} 
                className={`
                    w-48 h-48 mx-auto rounded-full bg-[#131419] relative cursor-pointer overflow-hidden group transition-all duration-300
                    border-2 border-dashed ${errors.photo ? 'border-red-500' : 'border-white/20 hover:border-[#6C5DD3]'}
                `}
              >
                  {selectedImage ? (
                      <>
                        <img src={selectedImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                            <span className="text-white font-bold text-xs uppercase">Изменить</span>
                        </div>
                      </>
                  ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                             <span className="text-2xl">📸</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Загрузить фото</span>
                      </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  
                  {/* Decorative scanner rings */}
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-75"></div>
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-50"></div>
              </div>
          </div>
          
          <div className="flex gap-3 pt-4">
              <button onClick={() => setStep('AUTH_FORM')} className="px-6 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-xs uppercase hover:bg-white/10 transition-colors">Назад</button>
              <Button fullWidth onClick={handleIdentitySubmit} className="!rounded-2xl">ПОДТВЕРДИТЬ ЛИЧНОСТЬ</Button>
          </div>
      </div>
  );

  const renderScanning = () => (
      <div className="text-center animate-fade-in w-full py-10">
           <div className="relative w-56 h-56 mx-auto mb-10">
                {/* Image Background */}
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#1F2128] relative z-10">
                     {selectedImage && <img src={selectedImage} className="w-full h-full object-cover filter grayscale contrast-125" />}
                </div>
                
                {/* Face ID Scanner Overlay */}
                <div className="absolute inset-0 rounded-full z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[#6C5DD3]/20"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#6C5DD3] shadow-[0_0_20px_#6C5DD3] animate-scan-vertical"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-[#6C5DD3]/50 rounded-lg opacity-50 animate-ping-slow"></div>
                </div>

                {/* Outer Rotating Rings */}
                <div className="absolute -inset-4 border border-dashed border-[#6C5DD3]/30 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-8 border border-white/5 rounded-full"></div>
           </div>

           <h3 className="text-xl font-black text-white mb-2">{loadingText}</h3>
           <p className="text-[#6C5DD3] font-mono text-xs tracking-widest animate-pulse">
               ID: {Date.now().toString().slice(-8)} • СОВПАДЕНИЕ: 99.9%
           </p>
           
           <style>{`
             @keyframes scan-vertical { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } } 
             .animate-scan-vertical { animation: scan-vertical 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
             .animate-spin-slow { animation: spin 10s linear infinite; }
             .animate-ping-slow { animation: ping 3s cubic-bezier(0, 0, 0.2, 1) infinite; }
           `}</style>
      </div>
  );

  const renderCustomization = () => (
      <div className="space-y-6 w-full animate-slide-in">
           <div className="text-center mb-6">
              <h2 className="text-xl font-black text-white">ВЫБОР ЭКИПИРОВКИ</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Выберите стиль боевого аватара</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
              {ARMOR_STYLES.map(style => {
                  const isSelected = armorStyle === style.id;
                  return (
                    <button 
                        key={style.id} 
                        onClick={() => { setArmorStyle(style.id); telegram.haptic('selection'); }} 
                        className={`
                            relative p-4 rounded-2xl border text-left transition-all duration-300 overflow-hidden group
                            ${isSelected 
                                ? 'bg-[#6C5DD3] border-[#6C5DD3] shadow-lg shadow-[#6C5DD3]/30 transform scale-105 z-10' 
                                : 'bg-[#131419] border-white/5 hover:border-white/20 hover:bg-[#1A1C24]'}
                        `}
                    >
                        <div className="flex justify-between items-start mb-3">
                            <span className="text-2xl">{style.icon}</span>
                            {isSelected && <div className="w-2 h-2 bg-white rounded-full shadow-[0_0_8px_white] animate-pulse"></div>}
                        </div>
                        <div className={`font-black text-xs uppercase mb-1 ${isSelected ? 'text-white' : 'text-slate-300'}`}>{style.label}</div>
                        <div className={`text-[9px] font-medium leading-tight ${isSelected ? 'text-white/80' : 'text-slate-600'}`}>{style.desc}</div>
                        
                        {/* Background sheen effect */}
                        {isSelected && <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-transparent pointer-events-none"></div>}
                    </button>
                  );
              })}
          </div>

          <div className="pt-4">
            <Button fullWidth onClick={handleFinalize} className="!rounded-2xl !py-4 shadow-xl shadow-[#6C5DD3]/20" icon="⚡">
                НАЧАТЬ ГЕНЕРАЦИЮ
            </Button>
          </div>
      </div>
  );

  const renderFinalizing = () => (
    <div className="text-center w-full animate-fade-in py-16">
        <div className="w-32 h-32 mx-auto mb-10 relative">
            <div className="absolute inset-0 bg-[#6C5DD3] rounded-full blur-[40px] opacity-20 animate-pulse"></div>
            
            {/* Spinning Rings */}
            <div className="absolute inset-0 border-4 border-[#1F2128] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#6C5DD3] border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            <div className="absolute inset-2 border-2 border-t-white/50 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin-reverse opacity-50"></div>
            
            <div className="absolute inset-0 flex items-center justify-center text-3xl animate-bounce">⚙️</div>
        </div>
        <h3 className="text-xl font-bold text-white mb-3 tracking-tight">{loadingText}</h3>
        <div className="w-48 h-1 bg-[#1F2128] mx-auto rounded-full overflow-hidden">
            <div className="h-full bg-[#6C5DD3] w-1/2 animate-progress"></div>
        </div>
        <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-widest">Нейросеть активна</p>
        <style>{`
            .animate-spin-reverse { animation: spin 2s linear infinite reverse; }
            @keyframes progress { 0% { width: 0%; } 50% { width: 70%; } 100% { width: 100%; } }
            .animate-progress { animation: progress 3s ease-in-out infinite; }
        `}</style>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F1115] relative overflow-hidden font-sans">
         {/* Cinematic Background Elements */}
         <div className="fixed inset-0 bg-[linear-gradient(to_bottom,#0F1115_0%,#131419_100%)] z-0"></div>
         <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_0%,_rgba(108,93,211,0.15),_transparent_70%)] pointer-events-none z-0"></div>
         
         {/* Grid Floor */}
         <div className="fixed bottom-0 left-0 w-full h-[30vh] bg-[linear-gradient(to_top,#0F1115_0%,transparent_100%)] z-10"></div>
         {/* Updated Background Grid for better contrast matching screenshot */}
         <div className="fixed inset-0 opacity-[0.05] z-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

         {/* Main Card */}
         <div className="w-full max-w-sm relative z-20">
             <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                 {/* Top sheen */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                 
                 {/* Step Content */}
                 {step === 'AUTH_FORM' && renderAuthForm()}
                 {step === 'IDENTITY' && renderIdentity()}
                 {step === 'SCANNING' && renderScanning()}
                 {step === 'CUSTOMIZATION' && renderCustomization()}
                 {step === 'FINALIZING' && renderFinalizing()}
             </div>
             
             {/* Footer copyright matching screenshot exactly */}
             <div className="text-center mt-8 opacity-40">
                 <p className="text-[9px] text-white uppercase tracking-[0.4em] font-medium">SPARTAN SALES OS V4.0</p>
             </div>
         </div>
    </div>
  );
};
