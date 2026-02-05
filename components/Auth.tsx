
import React, { useState, useRef, useEffect } from 'react';
import { generateSpartanAvatar } from '../services/geminiService';
import { telegram } from '../services/telegramService';
import { Button } from './Button';
import { UserProgress } from '../types';

interface AuthProps {
  onLogin: (data: any) => void;
  existingUsers?: UserProgress[];
}

type AuthStep = 'AUTH_FORM' | 'IDENTITY' | 'SCANNING' | 'DB_SYNC' | 'CUSTOMIZATION' | 'FINALIZING';

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
  const [syncProgress, setSyncProgress] = useState(0);
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
    if (cleanUsername === 'admin' && cleanPassword === 'admin') {
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

        // Simulate Login Sync
        setStep('DB_SYNC');
        startDbSync(() => {
            telegram.haptic('success');
            onLogin({ ...user, isRegistration: false });
        });
    }
  };

  const startDbSync = (onComplete: () => void) => {
      setSyncProgress(0);
      let progress = 0;
      const interval = setInterval(() => {
          progress += Math.floor(Math.random() * 15) + 5;
          if (progress > 100) progress = 100;
          setSyncProgress(progress);
          
          if (progress < 30) setLoadingText('INITIALIZING UPLINK...');
          else if (progress < 60) setLoadingText('SYNCING NEURAL DATABASE...');
          else if (progress < 90) setLoadingText('DECRYPTING USER PROFILE...');
          else setLoadingText('ACCESS GRANTED');

          if (progress >= 100) {
              clearInterval(interval);
              setTimeout(onComplete, 500);
          }
      }, 200);
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
    const loadingMessages = ['КОВКА БРОНИ...', 'СИНХРОНИЗАЦИЯ НЕЙРОСЕТИ...', 'СОЗДАНИЕ ЛИЧНОГО ДЕЛА...', 'УСТАНОВКА СВЯЗИ СО ШТАБОМ...'];
    
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
           <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
               <div className="absolute inset-0 bg-gradient-to-b from-[#4A3D8D] to-[#2D2A4A] rounded-full opacity-60 animate-pulse-slow"></div>
               <div className="relative z-10 w-20 h-20 bg-[#131419] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl backdrop-blur-md">
                    <span className="text-4xl">⚔️</span>
               </div>
               
               {/* Decorative Lines */}
               <div className="absolute top-1/2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
               <div className="absolute top-0 bottom-0 left-1/2 w-[1px] bg-gradient-to-b from-transparent via-white/20 to-transparent"></div>
           </div>

           <div className="mt-6">
               <h1 className="text-3xl font-black text-white tracking-tighter flex items-center justify-center gap-1">
                   SPARTAN<span className="text-[#6C5DD3]">OS</span>
               </h1>
               <p className="text-slate-500 font-bold text-[9px] uppercase tracking-[0.4em] mt-2">Neural Link Terminal v4.0</p>
           </div>
       </div>

       {/* Mode Toggle */}
       <div className="bg-[#131419]/60 p-1 rounded-2xl flex border border-white/5 relative mx-2 overflow-hidden">
          <div 
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-[#4A3D8D] rounded-xl transition-all duration-300 shadow-lg ${isRegisterMode ? 'left-[calc(50%+2px)]' : 'left-1'}`}
          ></div>
          <button 
             onClick={() => { setIsRegisterMode(false); setErrors({}); }} 
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${!isRegisterMode ? 'text-white' : 'text-slate-500'}`}
          >
             LOGIN
          </button>
          <button 
             onClick={() => { setIsRegisterMode(true); setErrors({}); }} 
             className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest relative z-10 transition-colors ${isRegisterMode ? 'text-white' : 'text-slate-500'}`}
          >
             ENLIST
          </button>
       </div>

       {/* Form Fields */}
       <div className="space-y-4 px-2">
           <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className={`text-lg ${errors.username ? 'text-red-500' : 'text-slate-600'}`}>@</span>
               </div>
               <input 
                 value={username} 
                 onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_@]/g, ''))} 
                 className={`w-full bg-[#0A0B0E] border ${errors.username ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-700 outline-none focus:border-[#6C5DD3] transition-all`}
                 placeholder="Telegram ID"
               />
           </div>

           <div className="relative group">
               <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className={`text-lg ${errors.password ? 'text-red-500' : 'text-slate-600'}`}>🔒</span>
               </div>
               <input 
                 type="password"
                 value={password} 
                 onChange={e => setPassword(e.target.value)} 
                 className={`w-full bg-[#0A0B0E] border ${errors.password ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 pl-12 pr-4 text-white font-bold placeholder:text-slate-700 outline-none focus:border-[#6C5DD3] transition-all`}
                 placeholder="Access Code"
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
                className="w-full bg-gradient-to-r from-[#2B4E99] to-[#4A3D8D] text-white rounded-2xl py-4 px-6 font-black text-xs uppercase tracking-widest shadow-lg shadow-[#2B4E99]/30 hover:shadow-[#2B4E99]/50 active:scale-95 transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
           >
              <span className="relative z-10">{isRegisterMode ? 'INITIATE PROTOCOL' : 'CONNECT TO MAINFRAME'}</span>
              <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
           </button>
       </div>
    </div>
  );

  const renderDbSync = () => (
      <div className="w-full animate-fade-in py-10 px-4">
           <div className="text-center mb-8">
               <h3 className="text-[#00CEFF] font-mono text-sm tracking-widest mb-2 animate-pulse">{loadingText}</h3>
               <div className="text-4xl font-black text-white">{syncProgress}%</div>
           </div>

           {/* Progress Bar */}
           <div className="w-full h-2 bg-[#131419] rounded-full overflow-hidden mb-8 border border-white/5">
               <div 
                  className="h-full bg-[#00CEFF] shadow-[0_0_15px_#00CEFF] transition-all duration-200 ease-out relative" 
                  style={{ width: `${syncProgress}%` }}
               >
                   <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 animate-pulse"></div>
               </div>
           </div>

           {/* Console Log Simulation */}
           <div className="bg-black/40 rounded-xl p-4 font-mono text-[10px] text-slate-400 h-32 overflow-hidden border border-white/5 flex flex-col justify-end">
               <p className="opacity-50">> Establishing secure connection...</p>
               <p className="opacity-60">> Handshake verified.</p>
               {syncProgress > 30 && <p className="opacity-70 text-green-500">> Neural link active.</p>}
               {syncProgress > 60 && <p className="opacity-80 text-[#00CEFF]">> Downloading mission data...</p>}
               {syncProgress > 80 && <p className="opacity-90">> Synchronizing preferences...</p>}
               <p className="animate-pulse">> _</p>
           </div>
      </div>
  );

  const renderIdentity = () => (
      <div className={`space-y-8 w-full animate-slide-in ${isShake ? 'animate-shake' : ''}`}>
           <div className="text-center">
              <h2 className="text-2xl font-black text-white tracking-tight">IDENTITY VERIFICATION</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-2">Required for Neural Link</p>
          </div>

          <div className="space-y-4">
              <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-1.5 block">Callsign</label>
                  <input 
                    value={realName} 
                    onChange={e => setRealName(e.target.value)} 
                    className={`w-full bg-[#131419] border ${errors.name ? 'border-red-500/50' : 'border-white/10'} rounded-2xl py-4 px-6 text-white text-lg font-bold text-center outline-none focus:border-[#6C5DD3] transition-colors`}
                    placeholder="e.g. Maverick"
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
                            <span className="text-white font-bold text-xs uppercase">Retake</span>
                        </div>
                      </>
                  ) : (
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                             <span className="text-2xl">📸</span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Upload Photo</span>
                      </div>
                  )}
                  <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                  
                  {/* Decorative scanner rings */}
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-75"></div>
                  <div className="absolute inset-0 border border-white/5 rounded-full scale-50"></div>
              </div>
          </div>
          
          <div className="flex gap-3 pt-4">
              <button onClick={() => setStep('AUTH_FORM')} className="px-6 py-4 rounded-2xl bg-white/5 text-slate-400 font-bold text-xs uppercase hover:bg-white/10 transition-colors">Back</button>
              <Button fullWidth onClick={handleIdentitySubmit} className="!rounded-2xl">CONFIRM IDENTITY</Button>
          </div>
      </div>
  );

  const renderScanning = () => (
      <div className="text-center animate-fade-in w-full py-10">
           <div className="relative w-56 h-56 mx-auto mb-10">
                <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#1F2128] relative z-10 bg-black">
                     {selectedImage && <img src={selectedImage} className="w-full h-full object-cover filter grayscale contrast-125 opacity-50" />}
                </div>
                
                {/* Face ID Scanner Overlay */}
                <div className="absolute inset-0 rounded-full z-20 overflow-hidden">
                    <div className="absolute inset-0 bg-[#6C5DD3]/10"></div>
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-[#6C5DD3] shadow-[0_0_20px_#6C5DD3] animate-scan-vertical"></div>
                    
                    {/* Data Points */}
                    <div className="absolute top-1/3 left-1/3 w-2 h-2 bg-[#00CEFF] rounded-full animate-ping"></div>
                    <div className="absolute bottom-1/3 right-1/3 w-2 h-2 bg-[#00CEFF] rounded-full animate-ping delay-100"></div>
                    <div className="absolute top-1/4 right-1/4 w-1 h-1 bg-[#00CEFF] rounded-full animate-ping delay-200"></div>
                </div>

                {/* Outer Rotating Rings */}
                <div className="absolute -inset-4 border border-dashed border-[#6C5DD3]/30 rounded-full animate-spin-slow"></div>
                <div className="absolute -inset-8 border border-white/5 rounded-full"></div>
           </div>

           <h3 className="text-xl font-black text-white mb-2">{loadingText}</h3>
           <p className="text-[#6C5DD3] font-mono text-xs tracking-widest animate-pulse">
               ID: {Date.now().toString().slice(-8)} • MATCH: 99.9%
           </p>
           
           <style>{`
             @keyframes scan-vertical { 0% { top: 0%; opacity: 0; } 10% { opacity: 1; } 90% { opacity: 1; } 100% { top: 100%; opacity: 0; } } 
             .animate-scan-vertical { animation: scan-vertical 2s cubic-bezier(0.4, 0, 0.2, 1) infinite; }
             .animate-spin-slow { animation: spin 10s linear infinite; }
           `}</style>
      </div>
  );

  const renderCustomization = () => (
      <div className="space-y-6 w-full animate-slide-in">
           <div className="text-center mb-6">
              <h2 className="text-xl font-black text-white">SELECT LOADOUT</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Choose your combat avatar style</p>
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
                FORGE AVATAR
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
        <p className="text-slate-500 text-[10px] mt-4 uppercase tracking-widest">Neural Link Active</p>
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
         <div className="fixed inset-0 opacity-[0.05] z-0" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

         {/* Main Card */}
         <div className="w-full max-w-sm relative z-20">
             <div className="glass-panel p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative overflow-hidden backdrop-blur-xl">
                 {/* Top sheen */}
                 <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                 
                 {step === 'AUTH_FORM' && renderAuthForm()}
                 {step === 'DB_SYNC' && renderDbSync()}
                 {step === 'IDENTITY' && renderIdentity()}
                 {step === 'SCANNING' && renderScanning()}
                 {step === 'CUSTOMIZATION' && renderCustomization()}
                 {step === 'FINALIZING' && renderFinalizing()}
             </div>
             
             <div className="text-center mt-8 opacity-40">
                 <p className="text-[9px] text-white uppercase tracking-[0.4em] font-medium">SECURE CONNECTION ESTABLISHED</p>
             </div>
         </div>
    </div>
  );
};
