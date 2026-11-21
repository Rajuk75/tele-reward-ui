import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { searchUsers, searchCampaigns, searchOffers } from '../../../services/AppService';
import { useThemeClasses } from '../../../context/ThemeContext';
import { 
    FiTrendingUp, FiSearch, FiUser, FiX, FiLayers, FiRefreshCw, FiDollarSign,
    FiMousePointer, FiAlertTriangle, FiCheckCircle, FiClock
} from 'react-icons/fi';

/* ── Pagination ──────────────────────────────────────────────────────────── */

function getPageNumbers(current, total) {
    if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
    if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
    return [1, '…', current - 1, current, current + 1, '…', total];
}

export function Pagination({ page, totalPages, onPageChange, pageSize, onPageSizeChange, total, className = '' }) {
    const tc = useThemeClasses();

    if (!totalPages || totalPages < 1) return null;

    const pages = getPageNumbers(page, totalPages);

    return (
        <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
            {/* Left: page size + total count */}
            <div className="flex items-center gap-3">
                {onPageSizeChange && (
                    <select
                        value={pageSize}
                        onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
                        className={`border rounded-xl px-3 py-1.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition ${tc.select}`}
                    >
                        {[10, 15, 25, 50].map((s) => (
                            <option key={s} value={s}>{s} / page</option>
                        ))}
                    </select>
                )}
                {total != null && (
                    <span className={`text-xs ${tc.textMuted}`}>{total.toLocaleString()} total</span>
                )}
            </div>

            {/* Right: page buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-40 disabled:cursor-not-allowed ${tc.btnOutline}`}
                >
                    ←
                </button>

                {pages.map((p, i) =>
                    p === '…' ? (
                        <span key={`ellipsis-${i}`} className={`w-8 text-center text-xs ${tc.textMuted}`}>…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                                p === page
                                    ? 'bg-indigo-600 text-white shadow-sm'
                                    : tc.btnOutline
                            }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition disabled:opacity-40 disabled:cursor-not-allowed ${tc.btnOutline}`}
                >
                    →
                </button>
            </div>
        </div>
    );
}

/* ── TableWrapper — horizontal scroll + responsive ───────────────────────── */
export function TableWrapper({ children, toolbar, footer, className = '' }) {
    const tc = useThemeClasses();
    return (
        <div className={`overflow-hidden rounded-2xl border shadow-sm ${tc.card} ${className}`}>
            {toolbar && (
                <div className={`px-7 py-5 border-b ${tc.border} ${tc.isDark ? 'bg-white/5' : 'bg-gray-50/40'}`}>
                    {toolbar}
                </div>
            )}
            <div className="overflow-x-auto">
                {children}
            </div>
            {footer && (
                <div className={`px-7 py-4 border-t ${tc.border} ${tc.isDark ? 'bg-white/5' : 'bg-gray-50/40'}`}>
                    {footer}
                </div>
            )}
        </div>
    );
}

/* ── PageHeader ────────────────────────────────────────────────────────────── */
export function PageHeader({ title, subtitle, action }) {
    const tc = useThemeClasses();
    return (
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div>
                <h1 className={`text-2xl font-bold ${tc.text}`}>{title}</h1>
                {subtitle && <p className={`text-sm mt-0.5 ${tc.textMuted}`}>{subtitle}</p>}
            </div>
            {action}
        </div>
    );
}

/* ── StatusBadge ────────────────────────────────────────────────────────────── */
export function StatusBadge({ status, labelMap = {} }) {
    const tc = useThemeClasses();
    const colorMap = {
        active:           tc.badge.active,
        inactive:         tc.badge.inactive,
        paused:           tc.badge.pending,
        expired:          tc.badge.error,
        completed:        tc.badge.active,
        pending:          tc.badge.pending,
        pending_approval: tc.badge.orange,
        rejected:         tc.badge.error,
        fraud:            tc.badge.rose,
        clicked:          tc.badge.info,
        partially_completed: tc.badge.info,
        in_progress:      tc.badge.info,
        approved:         tc.badge.active,
        processing:       tc.badge.info,
        pending_proof:    tc.badge.pending,
        pending_review:   tc.badge.orange,
    };
    const label = labelMap[status] ?? status?.replace(/_/g, ' ');
    return (
        <span className={`px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wide ${colorMap[status] ?? tc.badge.inactive}`}>
            {label}
        </span>
    );
}

/* ── LoadingRows ────────────────────────────────────────────────────────────── */
export function LoadingRows({ rows = 5, cols = 4 }) {
    const tc = useThemeClasses();
    return (
        <div className={`overflow-hidden rounded-2xl border ${tc.card}`}>
            {Array.from({ length: rows }).map((_, i) => (
                <div key={i} className={`flex gap-4 px-5 py-4 border-b ${tc.border} last:border-0`}>
                    {Array.from({ length: cols }).map((__, j) => (
                        <div key={j} className={`h-4 rounded-lg flex-1 animate-pulse ${tc.isDark ? 'bg-slate-700' : 'bg-gray-200'}`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

/* ── EmptyState ─────────────────────────────────────────────────────────────── */
export function EmptyState({ message, action }) {
    const tc = useThemeClasses();
    return (
        <div className={`flex flex-col items-center justify-center py-20 rounded-2xl border ${tc.card}`}>
            <p className={`text-sm ${tc.textMuted} mb-3`}>{message}</p>
            {action}
        </div>
    );
}

/* ── SquareCard (Icon-based Glass Card) ─────────────────────────────────── */
export function SquareCard({ label, value, Icon, accentColor }) {
    const tc = useThemeClasses();
    return (
        <div className={`relative p-[1px] rounded-2xl overflow-hidden ${
            tc.isDark ? 'bg-white/10' : 'bg-gradient-to-r from-slate-500/10 via-slate-500/5 to-slate-500/10'
        }`}>
            <div className={`relative overflow-hidden rounded-2xl p-4 backdrop-blur-[20px] h-full ${
                tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-white shadow-sm'
            }`}>
                {/* Glass Reflection */}
                {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />}
                
                {/* Noise Texture Layer */}
                {tc.isDark && (
                    <div 
                        className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                )}
                
                <div className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                        <div className={`p-2.5 rounded-xl flex items-center justify-center ${accentColor} bg-opacity-20 backdrop-blur-md border border-white/10`}>
                            <Icon size={20} className="text-white/90" />
                        </div>
                    </div>
                    <p className={`text-2xl font-black leading-none ${tc.text}`}>{value}</p>
                    <p className={`text-[10px] font-black uppercase tracking-wider opacity-60 mt-1 truncate ${tc.text}`}>{label}</p>
                </div>
            </div>
        </div>
    );
}

/* ── InfoCard (Minimalist Glass Card) ──────────────────────────────────────── */
export function InfoCard({ label, value, color = '' }) {
    const tc = useThemeClasses();
    return (
        <div className={`relative p-[1px] rounded-xl overflow-hidden ${
            tc.isDark ? 'bg-white/10' : 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 shadow-sm'
        }`}>
            <div className={`relative overflow-hidden rounded-xl p-4 backdrop-blur-[20px] h-full ${
                tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-white shadow-sm'
            } ${color || tc.text}`}>
                {/* Glass Reflection */}
                {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />}

                {/* Noise Texture Layer */}
                {tc.isDark && (
                    <div 
                        className="absolute inset-0 opacity-[0.1] pointer-events-none mix-blend-overlay"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                )}
                
                <div className="relative z-10">
                    <p className={`text-[10px] uppercase font-black tracking-widest opacity-60`}>{label}</p>
                    <p className={`text-lg font-black mt-1`}>{value}</p>
                </div>
            </div>
        </div>
    );
}

/* ── MiniStatCard (Premium Glass Card) ───────────────────────── */
export function MiniStatCard({ label, value, Icon, colorClass = "text-indigo-500", isGolden, isEmerald }) {
    const tc = useThemeClasses();
    return (
        <div className={`relative rounded-2xl overflow-hidden group transition-all duration-500 min-h-[140px] h-full ${
            tc.isDark ? 'bg-white/[0.01]' : (
                isGolden ? 'bg-amber-50/50' : 
                isEmerald ? 'bg-emerald-50/50' : 
                'bg-white'
            ) + ' shadow-sm border ' + (
                isGolden ? 'border-amber-100' :
                isEmerald ? 'border-emerald-100' :
                'border-gray-100'
            )
        }`}>
            {isGolden && (
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-amber-200/5 pointer-events-none" />
            )}
            {isEmerald && (
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-200/5 pointer-events-none" />
            )}
            
            <div className={`relative h-full px-6 py-5 rounded-2xl backdrop-blur-md flex flex-col justify-between`}>
                <div 
                    className={`absolute inset-0 pointer-events-none mix-blend-overlay ${tc.isDark ? (isGolden || isEmerald ? 'opacity-[0.08]' : 'opacity-[0.05]') : 'opacity-[0.2]'}`}
                    style={{ 
                        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                        backgroundColor: tc.isDark ? (
                            isGolden ? 'rgba(251, 191, 36, 0.05)' : 
                            isEmerald ? 'rgba(16, 185, 129, 0.05)' : 
                            'transparent'
                        ) : 'transparent'
                    }}
                />

                <div className="relative z-10 flex items-stretch justify-between h-full">
                    <div className="flex flex-col justify-between h-full">
                        <p className={`text-[9px] font-black uppercase tracking-[0.2em] opacity-50 ${tc.text}`}>
                            {label}
                        </p>
                        <p className={`text-2xl font-black tracking-tight mt-auto pb-2 ${tc.text}`}>
                            {value}
                        </p>
                    </div>
                    {Icon && (
                        <div className="w-10 h-10 shrink-0 flex items-center justify-center transition-all duration-500 group-hover:scale-110">
                            <Icon className={`${tc.isDark ? 'text-indigo-400' : colorClass} filter drop-shadow-[0_0_8px_rgba(99,102,241,0.2)]`} size={24} />
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

/* ── BalanceCard ─────────────────────────────────────────────────────────── */
export function BalanceCard({ title, items, onRefresh, isLoading, tc }) {
    return (
        <div className={`rounded-2xl border p-4 shadow-sm ${tc.card}`}>
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <FiDollarSign className="text-indigo-500" size={16} />
                    <h3 className={`text-xs font-bold uppercase tracking-wider ${tc.text}`}>{title}</h3>
                </div>
                {onRefresh && (
                    <button onClick={onRefresh} className={`p-1.5 rounded-lg transition-colors ${isLoading ? 'animate-spin' : ''} ${tc.btnOutline}`}>
                        <FiRefreshCw size={12} />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 gap-4">
                {items.map((item, idx) => (
                    <div key={idx}>
                        <p className={`text-[10px] font-medium uppercase ${item.labelColor}`}>{item.label}</p>
                        <p className={`text-lg font-bold ${item.color}`}>{item.value ?? '0'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ── Search Dropdowns ────────────────────────────────────────────────────── */

export function UserSearchDropdown({ selectedUser, onSelect, onClear, tc, placeholder = "Search User..." }) {
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const { data: results = [] } = useQuery({
        queryKey: ['user-search-dropdown', debounced],
        queryFn: () => searchUsers(debounced).then((r) => r.data?.data?.users ?? []),
        enabled: open && debounced.length >= 1,
    });

    if (selectedUser) {
        return (
            <div className="w-full sm:w-80 md:w-96">
                <div className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-bold ${tc.isDark ? 'bg-emerald-600/20 border-emerald-500/40 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                    <span className="truncate">{selectedUser.name}</span>
                    <button onClick={onClear} className="text-red-500 hover:scale-110 transition-transform shrink-0"><FiX size={16} /></button>
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative w-full sm:w-80 md:w-96">
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-xs font-medium group transition-all duration-200 ${tc.input} focus-within:ring-2 focus-within:ring-emerald-500/20`}>
                <FiUser size={14} className="opacity-40 group-focus-within:text-emerald-500" />
                <input
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    className="bg-transparent outline-none w-full"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FiX size={14} />
                    </button>
                )}
            </div>
            {open && debounced.length >= 1 && (
                <div className={`absolute top-full left-0 mt-2 min-w-[320px] md:min-w-[500px] lg:min-w-[650px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${tc.card} border-${tc.border}`}>
                    <div className="max-h-72 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="p-6 text-center text-[10px] opacity-50 italic">No users found</div>
                        ) : (
                            results.map(u => (
                                <button 
                                    key={u._id} 
                                    onClick={() => { onSelect(u); setOpen(false); setQuery(''); }} 
                                    className={`w-full text-left px-5 py-4 text-xs font-bold border-b last:border-0 ${tc.border} hover:bg-emerald-500/10 dark:hover:bg-emerald-500/20 transition-all`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                                            <span className={`${tc.text} truncate`}>{u.name || 'N/A'}</span>
                                            <span className="opacity-20 shrink-0">||</span>
                                            <span className={`font-medium opacity-50 truncate`}>{u.phone || 'No Phone'}</span>
                                            <span className="opacity-20 shrink-0">||</span>
                                            <span className={`font-medium opacity-50 truncate`}>{u.email || 'No Email'}</span>
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export function CampaignSearchDropdown({ selectedCampaign, onSelect, onClear, tc, placeholder = "Search Campaign..." }) {
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const { data: results = [] } = useQuery({
        queryKey: ['campaign-search-dropdown', debounced],
        queryFn: () => searchCampaigns(debounced).then((r) => r.data?.data?.campaigns ?? []),
        enabled: open && debounced.length >= 1,
    });

    if (selectedCampaign) {
        return (
            <div className="w-full sm:w-80 md:w-96">
                <div className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-bold ${tc.isDark ? 'bg-orange-600/20 border-orange-500/40 text-orange-300' : 'bg-orange-50 border-orange-200 text-orange-700'}`}>
                    <span className="truncate">{selectedCampaign.name}</span>
                    <button onClick={onClear} className="text-red-500 hover:scale-110 transition-transform shrink-0"><FiX size={16} /></button>
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative w-full sm:w-80 md:w-96">
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-xs font-medium group transition-all duration-200 ${tc.input} focus-within:ring-2 focus-within:ring-orange-500/20`}>
                <FiLayers size={14} className="opacity-40 group-focus-within:text-orange-500" />
                <input
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    className="bg-transparent outline-none w-full"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FiX size={14} />
                    </button>
                )}
            </div>
            {open && debounced.length >= 1 && (
                <div className={`absolute top-full left-0 mt-2 min-w-[320px] md:min-w-[500px] lg:min-w-[650px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${tc.card} border-${tc.border}`}>
                    <div className="max-h-72 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="p-6 text-center text-[10px] opacity-50 italic">No campaigns match your search</div>
                        ) : (
                            results.map(c => (
                                <button 
                                    key={c._id} 
                                    onClick={() => { onSelect(c); setOpen(false); setQuery(''); }} 
                                    className={`w-full text-left px-5 py-4 text-xs font-bold border-b last:border-0 ${tc.border} hover:bg-orange-500/10 dark:hover:bg-orange-500/20 transition-all`}
                                >
                                    <div className="flex items-center justify-between gap-4">
                                        <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                                            <span className={`${tc.text} truncate`}>{c.name}</span>
                                            <span className="opacity-20 shrink-0">||</span>
                                            <span className="opacity-50 font-medium uppercase tracking-wider text-[10px]">{c.category || 'N/A'}</span>
                                            <span className="opacity-20 shrink-0">||</span>
                                            <span className="opacity-50 font-medium">{c.model || 'N/A'}</span>
                                            {c.events?.length > 0 && (
                                                <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${tc.isDark ? 'bg-orange-500/20 text-orange-400' : 'bg-orange-100 text-orange-600'}`}>
                                                    {c.events.length} {c.events.length === 1 ? 'Event' : 'Events'}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
export function OfferSearchDropdown({ selectedOffer, onSelect, onClear, tc: providedTc, placeholder = "Search Offer..." }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    const [query, setQuery] = useState('');
    const [debounced, setDebounced] = useState('');
    const [open, setOpen] = useState(false);
    const wrapRef = useRef(null);

    useEffect(() => {
        const t = setTimeout(() => setDebounced(query), 300);
        return () => clearTimeout(t);
    }, [query]);

    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const { data: results = [] } = useQuery({
        queryKey: ['offer-search-dropdown', debounced],
        queryFn: () => searchOffers(debounced).then((r) => r.data?.data?.offers ?? []),
        enabled: open && debounced.length >= 1,
    });

    if (selectedOffer) {
        return (
            <div className="w-full sm:w-80">
                <div className={`flex items-center justify-between gap-2 px-4 py-2.5 rounded-xl border text-[11px] font-bold ${tc.isDark ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' : 'bg-indigo-50 border-indigo-200 text-indigo-700'}`}>
                    <span className="truncate">{selectedOffer.offerName}</span>
                    <button onClick={onClear} className="text-red-500 hover:scale-110 transition-transform shrink-0"><FiX size={16} /></button>
                </div>
            </div>
        );
    }

    return (
        <div ref={wrapRef} className="relative w-full sm:w-80">
            <div className={`flex items-center gap-2 border rounded-xl px-4 py-2.5 text-xs font-medium group transition-all duration-200 ${tc.input} focus-within:ring-2 focus-within:ring-indigo-500/20`}>
                <FiSearch size={14} className="opacity-40 group-focus-within:text-indigo-500" />
                <input
                    type="text"
                    value={query}
                    placeholder={placeholder}
                    onChange={(e) => { setQuery(e.target.value); setOpen(true); }}
                    onFocus={() => setOpen(true)}
                    className="bg-transparent outline-none w-full"
                />
                {query && (
                    <button onClick={() => { setQuery(''); setOpen(false); }} className="text-gray-400 hover:text-red-500 transition-colors">
                        <FiX size={14} />
                    </button>
                )}
            </div>
            {open && debounced.length >= 1 && (
                <div className={`absolute top-full left-0 mt-2 min-w-[320px] md:min-w-[450px] lg:min-w-[550px] rounded-2xl border shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${tc.card} border-${tc.border}`}>
                    <div className="max-h-72 overflow-y-auto">
                        {results.length === 0 ? (
                            <div className="p-6 text-center text-[10px] opacity-50 italic">No offers match your search</div>
                        ) : (
                            results.map(o => (
                                <button 
                                    key={o._id} 
                                    onClick={() => { onSelect(o); setOpen(false); setQuery(''); }} 
                                    className={`w-full text-left px-5 py-4 text-xs font-bold border-b last:border-0 ${tc.border} hover:bg-indigo-500/10 dark:hover:bg-indigo-500/20 transition-all flex items-center justify-between gap-4`}
                                >
                                    <div className="flex items-center gap-2 whitespace-nowrap overflow-hidden">
                                        <span className={`${tc.text} truncate`}>{o.offerName}</span>
                                        {o.campaignId?.name && (
                                            <>
                                                <span className="opacity-20 shrink-0">||</span>
                                                <span className="opacity-50 font-medium truncate">{o.campaignId.name}</span>
                                            </>
                                        )}
                                        {o.events?.length > 0 && (
                                            <span className={`shrink-0 px-1.5 py-0.5 rounded-md text-[9px] font-bold ${tc.isDark ? 'bg-indigo-500/20 text-indigo-400' : 'bg-indigo-100 text-indigo-600'}`}>
                                                {o.events.length} {o.events.length === 1 ? 'Event' : 'Events'}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Toggle Switch ──────────────────────────────────────────────────────────── */
export function Toggle({ checked, onChange, label, tc: providedTc }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    return (
        <label 
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => onChange(!checked)}
        >
            <div 
                className={`w-10 h-5 rounded-full relative transition-all duration-300 ${
                    checked ? 'bg-indigo-500' : (tc.isDark ? 'bg-slate-700' : 'bg-gray-200')
                }`}
            >
                <div className={`absolute top-1 left-1 w-3 h-3 rounded-full bg-white transition-all duration-300 transform ${
                    checked ? 'translate-x-5' : 'translate-x-0'
                }`} />
            </div>
            {label && (
                <span className={`text-xs font-semibold select-none ${tc.text} opacity-70 group-hover:opacity-100 transition-opacity`}>
                    {label}
                </span>
            )}
        </label>
    );
}

export function FilterDropdown({ options, value, onChange, placeholder = "Select...", tc: providedTc, className = "" }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);
    const selectedOption = options.find(o => o.value === value);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center justify-between w-full border-2 rounded-xl px-4 py-2.5 text-sm font-bold transition-all outline-none focus:ring-4 focus:ring-indigo-500/10 ${
                    isOpen ? 'border-indigo-500 shadow-lg' : tc.border
                } ${tc.card} ${tc.text}`}
            >
                <span className={selectedOption ? tc.text : tc.textMuted}>
                    {selectedOption ? selectedOption.label : placeholder}
                </span>
                <FiLayers className={`transition-transform duration-200 ${isOpen ? 'rotate-180 text-indigo-500' : tc.textMuted}`} size={14} />
            </button>

            {isOpen && (
                <div className={`absolute z-50 top-full left-0 w-full mt-2 rounded-xl border-2 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${tc.card} ${tc.border}`}>
                    <div className="max-h-60 overflow-y-auto py-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center w-full px-4 py-2.5 text-sm font-bold transition-colors text-left ${
                                    value === opt.value 
                                        ? 'bg-indigo-600 text-white' 
                                        : `${tc.text} hover:bg-indigo-500/10`
                                }`}
                            >
                                {opt.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

/* ── Form Components ───────────────────────────────────────────────────────── */

export function FormField({ label, hint, children, tc: providedTc, required, className = "" }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    return (
        <div className={`w-full ${className}`}>
            {label && (
                <label className={`block text-[11px] font-bold uppercase tracking-tight mb-1 ${tc.textMuted}`}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
            )}
            {children}
            {hint && <p className={`text-[10px] mt-1 ${tc.textMuted} italic`}>{hint}</p>}
        </div>
    );
}

export function Inp({ tc: providedTc, className = "", ...props }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    return (
        <input 
            className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${tc.input} ${className}`} 
            onWheel={(e) => e.target.type === 'number' && e.target.blur()}
            {...props} 
        />
    );
}

export function Sel({ tc: providedTc, children, className = "", ...props }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    return (
        <select 
            className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all ${tc.select} ${className}`} 
            {...props}
        >
            {children}
        </select>
    );
}

export function TextArea({ tc: providedTc, className = "", ...props }) {
    const internalTc = useThemeClasses();
    const tc = providedTc || internalTc;
    return (
        <textarea 
            className={`w-full border-2 rounded-xl px-4 py-2.5 text-sm outline-none transition-all resize-none ${tc.input} ${className}`} 
            {...props} 
        />
    );
}

