import React from 'react';
import { useThemeClasses } from '../../../context/ThemeContext';

export function DashboardStatCard({ label, value, sub, Icon, colorClass = 'text-indigo-600', bgClass = 'bg-indigo-50', isLoading, isGolden, isEmerald }) {
    const tc = useThemeClasses();
    const { isDark } = tc;

    const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

    return (
        <div className={`relative rounded-2xl overflow-hidden group transition-all duration-500 h-full min-h-[160px] ${
            isDark 
                ? 'bg-white/[0.01]' 
                : 'bg-white shadow-sm border border-gray-100'
        }`}>

            {isGolden && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-200/5 pointer-events-none" />
            )}
            {isEmerald && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-200/5 pointer-events-none" />
            )}

            <div className={`relative flex flex-col justify-between h-full px-6 py-5 rounded-2xl backdrop-blur-md ${
                isDark 
                    ? 'bg-transparent' 
                    : 'bg-white/10'
            }`}>
                <div 
                    className={`absolute inset-0 pointer-events-none mix-blend-overlay ${isDark ? (isGolden || isEmerald ? 'opacity-[0.08]' : 'opacity-[0.05]') : 'opacity-[0.2]'}`}
                    style={{ 
                        backgroundImage: noiseTexture,
                        backgroundColor: isDark ? (
                            isGolden ? 'rgba(251, 191, 36, 0.05)' : 
                            isEmerald ? 'rgba(16, 185, 129, 0.05)' : 
                            'transparent'
                        ) : 'transparent'
                    }}
                />

                {/* Top: Icon Container */}
                <div className="relative z-10 w-10 h-10 shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110 mb-4">
                    <div className={`absolute inset-0 rounded-xl ${isDark ? (isGolden ? 'bg-amber-500/10' : isEmerald ? 'bg-emerald-500/10' : 'bg-indigo-500/10') : 'bg-black/5'} backdrop-blur-md`} />
                    <Icon className={`${isDark ? (isGolden ? 'text-amber-400' : isEmerald ? 'text-emerald-400' : 'text-indigo-400') : colorClass} relative z-20 transition-colors duration-500 filter drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]`} size={22} />
                </div>

                {/* Bottom: Content */}
                <div className="relative z-10 flex-1 min-w-0 flex flex-col justify-end">
                    <div>
                        {isLoading ? (
                            <div className="space-y-4">
                                <div className={`h-2.5 w-16 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                                <div className={`h-8 w-32 rounded animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
                            </div>
                        ) : (
                            <>
                                <p className={`text-[9px] font-black uppercase tracking-[0.2em] mb-1 opacity-50 ${tc.text}`}>
                                    {label}
                                </p>
                                <p className={`text-2xl font-black leading-tight tracking-tight ${tc.text}`}>
                                    {value}
                                </p>
                            </>
                        )}
                    </div>

                    {sub && !isLoading && (
                        <div className="flex items-center gap-2 mt-3">
                            <span className={`w-1.5 h-1.5 rounded-full ${isEmerald ? 'bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.5)]' : 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'} animate-pulse`} />
                            <p className={`text-[9px] ${isEmerald ? 'text-indigo-500' : 'text-emerald-500'} font-black uppercase tracking-widest opacity-80 whitespace-nowrap`}>
                                {sub}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
