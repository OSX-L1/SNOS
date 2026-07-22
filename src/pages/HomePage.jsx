import React from 'react';
import { Icons } from '../components/Icons.jsx';

export const HomePage = ({ setActiveTab, config, onInstall, theme }) => (
    <div className="flex flex-col items-center justify-center h-full pt-32 p-8 text-center fade-in pb-32">
        <div className="relative mb-8 group flex justify-center">
            {/* โลโก้ Modern SVG แบบเดียวกับ Splash Screen */}
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="transform transition-transform duration-500 hover:scale-105 drop-shadow-xl">
                <circle cx="60" cy="60" r="50" fill="url(#sun-gradient-home)" />
                <rect x="25" y="40" width="70" height="8" rx="4" fill="#1e293b" />
                <rect x="15" y="55" width="80" height="8" rx="4" fill="#1e293b" />
                <rect x="35" y="70" width="60" height="8" rx="4" fill="#1e293b" />
                <defs>
                    <linearGradient id="sun-gradient-home" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#f43f5e" />
                        <stop offset="1" stopColor="#f97316" />
                    </linearGradient>
                </defs>
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
