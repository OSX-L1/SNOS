import React from 'react';

export const SplashScreen = ({ theme }) => {
    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center ${theme?.bgApp || 'bg-white'} fade-in overflow-hidden`}>
            {/* Ambient Background Glow Effect */}
            <div className="absolute w-80 h-80 bg-gradient-to-tr from-rose-500/15 via-orange-400/10 to-amber-300/15 rounded-full blur-3xl pointer-events-none animate-pulse"></div>

            <div className="relative flex flex-col items-center z-10">
                {/* Modern Architectural Blind Logo */}
                <div className="relative mb-6">
                    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="drop-shadow-[0_12px_24px_rgba(244,63,94,0.25)]">
                        <defs>
                            <linearGradient id="sunGlow" x1="0" y1="0" x2="120" y2="120" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#FF3366" />
                                <stop offset="50%" stopColor="#FF6B00" />
                                <stop offset="100%" stopColor="#FFA800" />
                            </linearGradient>
                            <linearGradient id="slatGradient" x1="0" y1="0" x2="120" y2="0" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#0F172A" />
                                <stop offset="100%" stopColor="#1E293B" />
                            </linearGradient>
                            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                                <feGaussianBlur stdDeviation="5" result="blur" />
                                <feComposite in="SourceGraphic" in2="blur" operator="over" />
                            </filter>
                        </defs>

                        {/* Sun Disc */}
                        <circle cx="78" cy="42" r="30" fill="url(#sunGlow)" filter="url(#glow)" className="animate-pulse" />

                        {/* Geometric S-Curve Blind Slats */}
                        <rect x="18" y="32" width="52" height="9" rx="4.5" fill="url(#slatGradient)" />
                        <rect x="18" y="48" width="84" height="9" rx="4.5" fill="url(#slatGradient)" />
                        <rect x="36" y="64" width="66" height="9" rx="4.5" fill="url(#slatGradient)" />
                        <rect x="50" y="80" width="52" height="9" rx="4.5" fill="url(#slatGradient)" />

                        {/* Modern Accent Dot */}
                        <circle cx="23" cy="84.5" r="4.5" fill="#FF6B00" />
                    </svg>
                </div>

                {/* Brand Titles */}
                <div className="text-center space-y-1">
                    <h1 className="text-2xl font-black tracking-[0.25em] text-slate-800 uppercase font-sans">
                        SUNNY
                    </h1>
                    <p className="text-[10px] font-bold tracking-[0.35em] text-rose-500 uppercase">
                        BLIND SYSTEM
                    </p>
                </div>

                {/* Minimalist Line Progress Loader */}
                <div className="w-28 h-1 bg-slate-100 rounded-full mt-10 overflow-hidden relative border border-slate-200/50">
                    <div className="absolute inset-y-0 left-0 bg-gradient-to-r from-rose-500 to-amber-500 rounded-full w-full animate-[loading_1.6s_ease-in-out_infinite]"></div>
                </div>
            </div>

            <style>{`
                @keyframes loading {
                    0% { transform: translateX(-100%); }
                    50% { transform: translateX(0%); }
                    100% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
};
