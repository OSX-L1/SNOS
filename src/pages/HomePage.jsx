import React from 'react';
import { Icons } from '../components/Icons.jsx';

export const HomePage = ({ setActiveTab, config, onInstall, theme }) => (
    <div className="flex flex-col items-center justify-center h-full pt-32 p-8 text-center fade-in pb-32">
        <div className="relative mb-8 group flex justify-center">
            {/* New Modern SVG Logo */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform transition-transform duration-500 hover:scale-105 drop-shadow-[0_12px_24px_rgba(244,63,94,0.2)]">
                <defs>
                    <linearGradient id="sunGlowHome" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#FF3366" />
                        <stop offset="50%" stopColor="#FF6B00" />
                        <stop offset="100%" stopColor="#FFA800" />
                    </linearGradient>
                    <linearGradient id="slatGradientHome" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                        <stop offset="0%" stopColor="#0F172A" />
                        <stop offset="100%" stopColor="#1E293B" />
                    </linearGradient>
                </defs>
                <circle cx="78" cy="42" r="30" fill="url(#sunGlowHome)" />
                <rect x="18" y="32" width="52" height="9" rx="4.5" fill="url(#slatGradientHome)" />
                <rect x="18" y="48" width="84" height="9" rx="4.5" fill="url(#slatGradientHome)" />
                <rect x="36" y="64" width="66" height="9" rx="4.5" fill="url(#slatGradientHome)" />
                <rect x="50" y="80" width="52" height="9" rx="4.5" fill="url(#slatGradientHome)" />
                <circle cx="23" cy="84.5" r="4.5" fill="#FF6B00" />
            </svg>
        </div>
        
        <h2 className={`text-3xl font-bold mb-3 tracking-tight ${theme.textMain}`}>Sunny Blind System</h2>
        <p className={`${theme.textSub} mb-10 max-w-xs leading-relaxed text-sm font-medium mx-auto`}>
          ระบบจัดการร้านม่านครบวงจร<br/>คำนวณราคา เช็คสต็อก ออกใบเสนอราคา
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs mx-auto">
            <button onClick={() => setActiveTab('calculator')} className={`${theme.btnPrimary} px-8 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all flex justify-center items-center gap-3 hover:-translate-y-1 shadow-lg`}>
                <Icons.Calculator size={22} /> เริ่มคำนวณราคา
            </button>
            <button onClick={onInstall} className={`${theme.btnSecondary} px-8 py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-all flex justify-center items-center gap-3 hover:-translate-y-1`}>
                <Icons.Smartphone size={22} className={theme.icon} /> ติดตั้งแอปพลิเคชัน
            </button>
        </div>
    </div>
);
