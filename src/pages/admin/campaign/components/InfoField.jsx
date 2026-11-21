import { useThemeClasses } from '../../../../context/ThemeContext';

export default function InfoField({ label, value }) {
    const tc = useThemeClasses();
    return (
        <div>
            <p className={`text-[10px] uppercase tracking-widest font-black mb-1.5 ${tc.textMuted}`}>{label}</p>
            <p className={`text-sm font-bold ${tc.textSub}`}>{value}</p>
        </div>
    );
}
