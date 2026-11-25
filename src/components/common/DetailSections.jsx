import { dateTime, display } from './detailFormat';
import { useThemeClasses } from '../../context/ThemeContext';

export function Card({ title, action, children }) {
    const theme = useThemeClasses();
    return <section className={`min-w-0 rounded-2xl ${theme.card}`}>
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-4 sm:px-5">
            <h2 className="text-base font-semibold">{title}</h2>{action}
        </header>
        <div className="space-y-4 p-4 sm:p-5">{children}</div>
    </section>;
}

export function Detail({ label, children }) {
    let content = children;
    if (typeof children === 'boolean') {
        content = children ? 'Yes' : 'No';
    }
    return <div className="min-w-0">
        <dt className="text-xs font-medium text-slate-500">{label}</dt>
        <dd className="mt-1 whitespace-pre-line text-sm leading-relaxed text-slate-800">{content ?? '—'}</dd>
    </div>;
}

export function Metric({ label, children, icon: Icon }) {
    return <div className={`min-w-0 bg-white p-4 sm:p-5 ${Icon ? 'rounded-xl border border-slate-200 shadow-xs' : ''}`}>
        <dt className="flex items-center gap-2 text-xs text-slate-600">
            {Icon && <Icon aria-hidden="true" className="size-7 shrink-0 rounded-lg bg-slate-100 p-1.5 text-slate-700" />}
            {label}
        </dt>
        <dd className="mt-1 text-xl font-semibold tabular-nums">{display(children)}</dd>
    </div>;
}

export function Metadata({ record, children }) {
    return <details className="border-t border-slate-100 pt-3">
        <summary className="cursor-pointer text-sm font-medium text-slate-600">Record details</summary>
        <dl className="mt-4 grid gap-4">
            <Detail label="Created">{dateTime(record.createdAt)}</Detail>
            <Detail label="Updated">{dateTime(record.updatedAt)}</Detail>
            {children}
        </dl>
    </details>;
}

