import React from 'react';
import { Icons } from '../components/Icons.jsx';

export const HomePage = ({ setActiveTab, config, onInstall, theme }) => (
    <div className="flex flex-col items-center justify-center h-full pt-32 p-8 text-center fade-in pb-32">
        <div className="relative mb-8 group">
            <img src={config.logoUrl} alt="Logo" className="relative h-48 w-auto object-contain drop-shadow-xl transform transition-transform duration-500 hover:scale-105" onError={(e) => e.target.style.display = 'none'} />
        </div>
        
        <h2 className={`text-3xl font-bold mb-3 tracking-tight ${theme.textMain}`}>Sunny Blind System</h2>
        <p className={`${theme.textSub} mb-10 max-w-xs leading-relaxed text-sm font-medium`}>
          ระบบจัดการร้านม่านครบวงจร<br/>คำนวณราคา เช็คสต็อก ออกใบเสนอราคา
        </p>
        
        <div className="flex flex-col gap-4 w-full max-w-xs">
            <button onClick={() => setActiveTab('calculator')} className={`${theme.btnPrimary} px-8 py-4 rounded-2xl font-bold text-lg active:scale-95 transition-all flex justify-center items-center gap-3 hover:-translate-y-1 shadow-lg`}><Icons.Calculator size={22} /> เริ่มคำนวณราคา</button>
            <button onClick={onInstall} className={`${theme.btnSecondary} px-8 py-4 rounded-2xl font-bold text-lg shadow-md active:scale-95 transition-all flex justify-center items-center gap-3 hover:-translate-y-1`}><Icons.Smartphone size={22} className={theme.icon} /> ติดตั้งแอปพลิเคชัน</button>
        </div>
    </div>
);
