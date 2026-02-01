
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
  { id: 'Classic Bronze', label: 'Legionnaire', icon: '🏺', desc: 'Standard issue.' }, 
  { id: 'Midnight Stealth', label: 'Shadow Ops', icon: '🌑', desc: 'For covert missions.' }, 
  { id: 'Golden God', label: 'Commander', icon: '👑', desc: 'Elite status only.' }, 
  { id: 'Futuristic Chrome', label: 'Cyber', icon: '🦾', desc: 'Advanced tech.' }
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

    if (!cleanUsername) { handleError('username', 'Username required'); return; }
    if (!cleanPassword) { handleError('password', 'Password required'); return; }

    // 1. ADMIN CHECK (Hardcoded)
    if (cleanUsername === 'admin' && cleanPassword === '55555sa5') {
        telegram.haptic('success');
        onLogin({
            role: 'ADMIN',
            name: 'Commander',
            telegramUsername: 'admin',
            isRegistration: false,
            // Mock data for admin to skip generation
            avatarUrl: 'https://ui-avatars.com/api/?name=Admin&background=1F2128&color=fff',
            armorStyle: 'Golden God' 
        });
        return;
    }

    if (isRegisterMode) {
        // REGISTRATION FLOW
        const userExists = existingUsers.some(u => u.telegramUsername?.toLowerCase() === cleanUsername.toLowerCase());
        if (userExists) {
            handleError('username', 'Username already taken');
            return;
        }
        if (cleanPassword.length < 4) {
             handleError('password', 'Password too short');
             return;
        }

        telegram.haptic('light');
        setStep('IDENTITY');
    } else {
        // LOGIN FLOW
        const user = existingUsers.find(u => u.telegramUsername?.toLowerCase() === cleanUsername.toLowerCase());
        
        if (!user) {
            handleError('username', 'User not found. Register?');
            return;
        }
        
        // Simple string comparison for prototype (In real app, hash this!)
        if (user.password !== cleanPassword) {
            handleError('password', 'Invalid Password');
            return;
        }

        telegram.haptic('success');
        // Log in immediately with stored data
        onLogin({
            ...user,
            isRegistration: false
        });
    }
  };

  const handleIdentitySubmit = () => {
    if (!realName.trim()) { handleError('name', 'Name Required'); return; }
    if (!selectedImage) { handleError('photo', 'Photo Required'); return; }
    
    setStep('SCANNING');
    telegram.haptic('success');
    setLoadingText('ANALYZING BIOMETRICS...');
    // Mock Scan Duration
    setTimeout(() => {
        telegram.haptic('medium');
        setStep('CUSTOMIZATION');
    }, 2500);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { handleError('photo', 'File too large (Max 5MB)'); return; }
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
    const loadingMessages = ['FORGING ARMOR...', 'SYNCING NEURAL LINK...', 'ESTABLISHING COMMS...'];
    
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
            password: password.trim(), // Storing password locally
            originalPhoto: base64Data, 
            avatarUrl, 
            armorStyle,
            isRegistration: true
        });
    } catch (e) { 
        clearInterval(interval);
        handleError('global', 'Connection failed. Try again.'); 
        setStep('CUSTOMIZATION'); 
    }
  };

  // --- RENDERERS ---

  const renderAuthForm = () => (
    <div className={`space-y-6 w-full max-w-xs mx-auto animate-fade-in ${isShake ? 'animate-shake' : ''}`}>
       <div className="text-center mb-8">
           <div className="w-20 h-20 bg-[#6C5DD3] rounded-2xl mx-auto flex items-center justify-center text-4xl shadow-[0_0_20px_rgba(108,93,211,0.5)] mb-4">
             🛡️
           </div>
           <h1 className="text-3xl font-black text-white tracking-tight">SALES<span className="text-[#6C5DD3]">PRO</span></h1>
           <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.3em]">{isRegisterMode ? 'ENLISTMENT' : 'ACCESS TERMINAL'}</p>
       </div>

       <div className="space-y-4">
           {/* Username Input */}
           <div className="group">
              <label className="text-[10px] font-bold text-[#6C5DD3] uppercase ml-1 mb-1 block">Telegram Nickname</label>
              <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-bold">@</span>
                  <input 
                    value={username} 
                    onChange={e => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))} 
                    className={`w-full bg-[#131419] border ${errors.username ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 pl-9 pr-4 text-white font-bold outline-none focus:border-[#6C5DD3] transition-colors`}
                    placeholder="username"
                  />
              </div>
              {errors.username && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.username}</p>}
          </div>

          {/* Password Input */}
          <div className="group">
              <label className="text-[10px] font-bold text-[#6C5DD3] uppercase ml-1 mb-1 block">Password</label>
              <input 
                type="password"
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                className={`w-full bg-[#131419] border ${errors.password ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-[#6C5DD3] transition-colors`}
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-500 text-[10px] font-bold mt-1 ml-1">{errors.password}</p>}
          </div>
       </div>

       <div className="pt-4 space-y-3">
          <Button fullWidth onClick={handleAuthSubmit} icon={isRegisterMode ? "📝" : "⚡"}>
              {isRegisterMode ? 'CREATE PROFILE' : 'LOGIN'}
          </Button>
          
          <button 
            onClick={() => { setIsRegisterMode(!isRegisterMode); setErrors({}); }}
            className="w-full text-center text-xs font-bold text-slate-500 uppercase tracking-widest hover:text-white transition-colors"
          >
              {isRegisterMode ? 'Already have an account? Login' : 'New recruit? Register'}
          </button>
       </div>
    </div>
  );

  const renderIdentity = () => (
      <div className={`space-y-6 w-full animate-slide-in ${isShake ? 'animate-shake' : ''}`}>
           <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-white">BIOMETRICS</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Setup User Profile</p>
          </div>

          <div className="group">
              <label className="text-[10px] font-bold text-[#6C5DD3] uppercase ml-1 mb-1 block">Callsign (Real Name)</label>
              <input 
                value={realName} 
                onChange={e => setRealName(e.target.value)} 
                className={`w-full bg-[#131419] border ${errors.name ? 'border-red-500' : 'border-white/10'} rounded-xl py-4 px-4 text-white font-bold outline-none focus:border-[#6C5DD3] transition-colors text-center`}
                placeholder="Ex. Alex Mercer"
              />
          </div>

          <div 
            onClick={() => fileInputRef.current?.click()} 
            className={`w-40 h-40 mx-auto rounded-full bg-[#131419] border-2 border-dashed ${errors.photo ? 'border-red-500' : 'border-white/20'} hover:border-[#6C5DD3] flex items-center justify-center cursor-pointer relative overflow-hidden transition-all group`}
          >
              {selectedImage ? (
                  <img src={selectedImage} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
              ) : (
                  <div className="text-center">
                      <span className="text-3xl block mb-2 opacity-50">📸</span>
                      <span className="text-[9px] font-bold text-slate-500 uppercase">Tap to Upload</span>
                  </div>
              )}
              <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
          </div>
          {errors.photo && <p className="text-red-500 text-[10px] font-bold text-center">{errors.photo}</p>}

          <Button fullWidth onClick={handleIdentitySubmit} className="mt-8">SCAN & VERIFY</Button>
          <button onClick={() => setStep('AUTH_FORM')} className="w-full text-center text-xs font-bold text-slate-500 mt-4">Back</button>
      </div>
  );

  const renderScanning = () => (
      <div className="text-center animate-fade-in w-full">
           <div className="relative w-48 h-48 mx-auto mb-8">
                {selectedImage && <img src={selectedImage} className="w-full h-full rounded-full object-cover opacity-50 grayscale" />}
                <div className="absolute inset-0 bg-gradient-to-b from-[#6C5DD3]/0 via-[#6C5DD3]/50 to-[#6C5DD3]/0 h-[20%] w-full animate-scanline border-b-2 border-[#6C5DD3] shadow-[0_0_20px_#6C5DD3]"></div>
                <div className="absolute inset-0 border-4 border-[#6C5DD3]/20 rounded-full border-t-[#6C5DD3] animate-spin"></div>
           </div>
           <h3 className="text-xl font-black text-white animate-pulse">{loadingText}</h3>
           <p className="text-[#6C5DD3] font-mono text-xs mt-2">ID: {Date.now().toString().slice(-8)}</p>
           <style>{`@keyframes scanline { 0% { top: 0; } 100% { top: 100%; } } .animate-scanline { animation: scanline 1.5s linear infinite; }`}</style>
      </div>
  );

  const renderCustomization = () => (
      <div className="space-y-6 w-full animate-slide-in">
           <div className="text-center mb-6">
              <h2 className="text-xl font-black text-white">SELECT GEAR</h2>
              <p className="text-slate-500 text-xs uppercase tracking-widest mt-1">Choose your combat skin</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
              {ARMOR_STYLES.map(style => (
                  <button 
                    key={style.id} 
                    onClick={() => { setArmorStyle(style.id); telegram.haptic('selection'); }} 
                    className={`p-4 rounded-2xl border transition-all text-left relative overflow-hidden group
                        ${armorStyle === style.id ? 'bg-[#6C5DD3] border-[#6C5DD3] text-white shadow-lg shadow-[#6C5DD3]/30' : 'bg-[#131419] border-white/10 text-slate-400 hover:border-white/30'}
                    `}
                  >
                      <div className="text-2xl mb-2">{style.icon}</div>
                      <div className="font-bold text-xs uppercase mb-1">{style.label}</div>
                      <div className={`text-[9px] font-medium leading-tight ${armorStyle === style.id ? 'text-white/70' : 'text-slate-600'}`}>{style.desc}</div>
                      {armorStyle === style.id && <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full shadow-[0_0_5px_white]"></div>}
                  </button>
              ))}
          </div>

          <Button fullWidth onClick={handleFinalize} className="mt-6" icon="⚡">INITIATE GENERATION</Button>
      </div>
  );

  const renderFinalizing = () => (
    <div className="text-center w-full animate-fade-in py-10">
        <div className="w-24 h-24 mx-auto mb-8 relative">
            <div className="absolute inset-0 border-4 border-[#1F2128] rounded-full"></div>
            <div className="absolute inset-0 border-4 border-t-[#6C5DD3] rounded-full animate-spin"></div>
            <div className="absolute inset-0 flex items-center justify-center text-2xl animate-pulse">⚙️</div>
        </div>
        <h3 className="text-lg font-bold text-white mb-2">{loadingText}</h3>
        <p className="text-slate-500 text-xs">Utilizing Neural AI Cluster. Please wait.</p>
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#0F1115] relative overflow-hidden">
         {/* Background Elements */}
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_0%,_rgba(108,93,211,0.15),_transparent_70%)] pointer-events-none"></div>
         <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#FFAB7B]/5 rounded-full blur-[100px] pointer-events-none"></div>
         
         <div className="w-full max-w-sm relative z-10">
             {/* Steps */}
             {step === 'AUTH_FORM' && renderAuthForm()}
             {step === 'IDENTITY' && renderIdentity()}
             {step === 'SCANNING' && renderScanning()}
             {step === 'CUSTOMIZATION' && renderCustomization()}
             {step === 'FINALIZING' && renderFinalizing()}
         </div>
    </div>
  );
};
