
import React, { useState, useRef, useEffect } from 'react';
import { UserRole } from '../types';
import { generateSpartanAvatar } from '../services/geminiService';
import { Logger } from '../services/logger';

interface AuthProps {
  onLogin: (data: any) => void;
}

type AuthStep = 'LOGIN_CHOICE' | 'INSTA_LOGIN' | 'ONBOARDING_INFO' | 'ONBOARDING_PHOTO' | 'ONBOARDING_STYLE' | 'GENERATING';

const ARMOR_STYLES = [{ id: 'Classic Bronze', label: 'Классика', icon: '🏺' }, { id: 'Midnight Stealth', label: 'Полночь', icon: '🌑' }, { id: 'Golden God', label: 'Золотой Бог', icon: '👑' }, { id: 'Futuristic Chrome', label: 'Кибер', icon: '🦾' }];
const BACKGROUND_STYLES = [{ id: 'Ancient Battlefield', label: 'Поле битвы', icon: '⚔️' }, { id: 'Temple of Olympus', label: 'Храм', icon: '🏛️' }, { id: 'Stormy Peak', label: 'Буря', icon: '⚡' }, { id: 'Volcanic Gates', label: 'Вулкан', icon: '🔥' }];

export const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [step, setStep] = useState<AuthStep>('LOGIN_CHOICE');
  const [instagramUser, setInstagramUser] = useState('');
  const [realName, setRealName] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [armorStyle, setArmorStyle] = useState(ARMOR_STYLES[0].id);
  const [backgroundStyle, setBackgroundStyle] = useState(BACKGROUND_STYLES[0].id);
  const [error, setError] = useState('');
  const [loadingText, setLoadingText] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleInstagramLogin = () => setStep('INSTA_LOGIN');
  const submitInstaLogin = () => { if (!instagramUser.trim()) { setError('Введите имя'); return; } setStep('ONBOARDING_INFO'); };
  const submitUserInfo = () => { if (!realName.trim()) { setError('Представьтесь'); return; } setStep('ONBOARDING_PHOTO'); };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setSelectedImage(reader.result as string); setStep('ONBOARDING_STYLE'); };
      reader.readAsDataURL(file);
    }
  };

  const handleFinalize = async () => {
    if (!selectedImage) return;
    setStep('GENERATING');
    setLoadingText('Создание 3D аватара...');
    try {
        const base64Data = selectedImage.split(',')[1];
        const avatarUrl = await generateSpartanAvatar(base64Data, 1, armorStyle, backgroundStyle);
        onLogin({ role: 'STUDENT', name: realName, instagram: instagramUser, originalPhoto: base64Data, avatarUrl, armorStyle, backgroundStyle });
    } catch (e) { setError('Error'); setStep('ONBOARDING_STYLE'); }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-[#F2F4F6]">
         <div className="w-full max-w-sm bg-white p-8 rounded-[2.5rem] shadow-soft relative">
             {step === 'LOGIN_CHOICE' && (
                <div className="text-center mb-8 mt-4">
                    <div className="w-20 h-20 bg-[#1A1A1A] rounded-[1.5rem] mx-auto mb-4 flex items-center justify-center text-4xl shadow-lg">🛡️</div>
                    <h1 className="text-2xl font-black text-[#1A1A1A]">SalesPro</h1>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mt-1">Elite Academy</p>
                </div>
             )}
             
             {step === 'LOGIN_CHOICE' && (
                <div className="space-y-4">
                    <button onClick={handleInstagramLogin} className="w-full bg-[#1A1A1A] text-white p-4 rounded-2xl font-bold">Войти через Instagram</button>
                    <button onClick={() => onLogin({role: 'ADMIN', name: 'Admin'})} className="w-full text-slate-400 text-xs font-bold py-2">Вход для администраторов</button>
                </div>
             )}

             {step === 'INSTA_LOGIN' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-center">Instagram Login</h3>
                    <input value={instagramUser} onChange={e => setInstagramUser(e.target.value)} placeholder="@username" className="w-full bg-[#F2F4F6] rounded-xl p-4 text-center font-bold outline-none" />
                    <button onClick={submitInstaLogin} className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-bold">Далее</button>
                </div>
             )}

             {step === 'ONBOARDING_INFO' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-center">Как вас зовут?</h3>
                    <input value={realName} onChange={e => setRealName(e.target.value)} placeholder="Имя Фамилия" className="w-full bg-[#F2F4F6] rounded-xl p-4 text-center font-bold outline-none" />
                    <button onClick={submitUserInfo} className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-bold">Далее</button>
                </div>
             )}

             {step === 'ONBOARDING_PHOTO' && (
                <div className="space-y-6 text-center">
                    <h3 className="font-bold">Фото профиля</h3>
                    <div onClick={() => fileInputRef.current?.click()} className="w-32 h-32 mx-auto bg-[#F2F4F6] rounded-full flex items-center justify-center cursor-pointer hover:bg-slate-200">
                        <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" className="hidden" />
                        <span className="text-3xl text-slate-400">+</span>
                    </div>
                </div>
             )}
             
             {step === 'ONBOARDING_STYLE' && (
                 <div className="space-y-6">
                     <h3 className="font-bold text-center">Стиль</h3>
                     <div className="grid grid-cols-2 gap-2">
                         {ARMOR_STYLES.map(s => <button key={s.id} onClick={() => setArmorStyle(s.id)} className={`p-3 rounded-xl border ${armorStyle === s.id ? 'bg-[#1A1A1A] text-white border-black' : 'border-slate-100'}`}>{s.icon} <span className="text-[10px] uppercase font-bold block">{s.label}</span></button>)}
                     </div>
                     <button onClick={handleFinalize} className="w-full bg-[#1A1A1A] text-white py-3 rounded-xl font-bold">Создать</button>
                 </div>
             )}

             {step === 'GENERATING' && (
                 <div className="text-center py-10">
                     <div className="w-12 h-12 border-4 border-[#1A1A1A] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                     <p className="font-bold text-sm">{loadingText}</p>
                 </div>
             )}
         </div>
    </div>
  );
};
