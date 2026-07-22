import React from 'react';

export const SplashScreen = ({ theme }) => {
    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${theme?.bgApp || 'bg-white'} fade-in`}>
            <div className="relative flex flex-col items-center animate-pulse">
                {/* โลโก้ Modern Abstract Geometric (Sun + Blinds) */}
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                    <circle cx="60" cy="60" r="50" fill="url(#sun-gradient)" />
                    <rect x="25" y="40" width="70" height="8" rx="4" fill="#1e293b" />
                    <rect x="15" y="55" width="80" height="8" rx="4" fill="#1e293b" />
                    <rect x="35" y="70" width="60" height="8" rx="4" fill="#1e293b" />
                    <defs>
                        <linearGradient id="sun-gradient" x1="20" y1="20" x2="100" y2="100" gradientUnits="userSpaceOnUse">
                            <stop stopColor="#f43f5e" />
                            <stop offset="1" stopColor="#f97316" />
                        </linearGradient>
                    </defs>
                </svg>
                
                <h1 className={`text-2xl font-bold tracking-widest ${theme?.textMain || 'text-slate-800'}`}>SUNNY</h1>
                <p className={`text-xs mt-2 tracking-widest uppercase ${theme?.textSub || 'text-slate-500'}`}>Blind System</p>
                
                {/* จุดโหลดดิ้ง 3 จุด */}
                <div className="flex gap-2 mt-8">
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                </div>
            </div>
        </div>
    );
};
