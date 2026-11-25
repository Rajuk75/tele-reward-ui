import { FiCalendar, FiClock } from 'react-icons/fi';

const calendar = new Intl.DateTimeFormat('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
const clock = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });

export default function DateTimeCell({ value }) {
    const timestamp = value == null || value === '' ? null : new Date(value);
    if (!timestamp || Number.isNaN(timestamp.getTime())) return <span>—</span>;

    return <time dateTime={timestamp.toISOString()} className="inline-flex flex-col gap-1 whitespace-nowrap text-xs leading-4 tabular-nums">
        <span className="flex items-center gap-1.5 font-medium text-slate-800">
            <FiCalendar aria-hidden="true" className="text-slate-500" />{calendar.format(timestamp)}
        </span>
        <span className="flex items-center gap-1.5 text-slate-600">
            <FiClock aria-hidden="true" />{clock.format(timestamp)}
        </span>
    </time>;
}
