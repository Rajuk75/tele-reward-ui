import { createContext, useContext, useEffect } from 'react';

const ThemeContext = createContext({ isDark: false });

export function ThemeProvider({ children }) {
    useEffect(() => {
        // Enforce soft slate light theme across the application
        document.documentElement.classList.remove('dark');
        localStorage.removeItem('adminTheme');
    }, []);

    return (
        <ThemeContext.Provider value={{ isDark: false }}>
            {children}
        </ThemeContext.Provider>
    );
}

export const useTheme = () => useContext(ThemeContext);

/**
 * Single, clean Soft Slate & Indigo theme palette for all admin components.
 */
export function useThemeClasses() {
    return {
        isDark:       false,
        page:         'bg-slate-50 text-gray-900',
        card:         'bg-white border border-gray-200/80 shadow-sm shadow-slate-100',
        cardHover:    'hover:border-gray-300 hover:shadow-md transition-all',
        text:         'text-gray-900',
        textMuted:    'text-gray-500',
        textSub:      'text-gray-600',
        border:       'border-gray-200',
        divider:      'divide-gray-200',
        input:        'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:border-indigo-500 focus:bg-white focus:ring-0',
        select:       'bg-white border-gray-300 text-gray-900 focus:border-indigo-500 focus:ring-0',
        tableHead:    'bg-indigo-600 text-white font-bold',
        rowEven:      'bg-white',
        rowOdd:       'bg-slate-50/70',
        rowHover:     'hover:bg-slate-100/70 transition-colors',
        sidebarBg:    'bg-white border-gray-200',
        headerBg:     'bg-white/90 border-gray-200',
        tooltip:      { backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', color: '#0f172a', fontSize: '12px' },
        gridLine:     '#f1f5f9',
        axisColor:    '#94a3b8',
        btnPrimary:   'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/30',
        btnOutline:   'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50',
        btnDanger:    'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100',
        btnSuccess:   'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100',
        badge: {
            active:   'bg-emerald-50 text-emerald-700 border border-emerald-200',
            inactive: 'bg-gray-100 text-gray-600 border border-gray-200',
            pending:  'bg-amber-50 text-amber-700 border border-amber-200',
            error:    'bg-red-50 text-red-700 border border-red-200',
            info:     'bg-blue-50 text-blue-700 border border-blue-200',
            orange:   'bg-orange-50 text-orange-700 border border-orange-200',
            violet:   'bg-violet-50 text-violet-700 border border-violet-200',
            rose:     'bg-rose-50 text-rose-700 border border-rose-200',
        },
    };
}
