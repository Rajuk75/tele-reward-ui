import { useEffect, useRef, useState } from 'react';
import { useThemeClasses } from '../../../../context/ThemeContext';
import { CampaignSearchDropdown } from '../../common/AdminUI';
import { button, payoutStatuses, title } from '../utils/reportFormat';

const trackingStatuses = ['clicked', 'pending', 'in_progress', 'partially_completed', 'pending_approval', 'completed', 'rejected', 'fraud', 'scrubbed'];
const payoutTypes = ['offer_completion', 'offer_referral', 'user_referral', 'registration_bonus', 'manual_bonus', 'spin_bonus'];
const input = 'block min-w-0 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900';
const emptyFilters = { search: '', status: '', type: '', startDate: '', endDate: '', campaign: null };

export default function ReportFilters({ tab, onApply }) {
    const tc = useThemeClasses();
    const [draft, setDraft] = useState(emptyFilters);
    const [reset, setReset] = useState(0);
    const searchTimer = useRef(null);
    useEffect(() => () => clearTimeout(searchTimer.current), []);
    function change(field, value) {
        clearTimeout(searchTimer.current);
        const next = { ...draft, [field]: value };
        setDraft(next);
        if (next.endDate && next.startDate > next.endDate) return;
        const params = { search: next.search.trim(), status: next.status, type: next.type,
            campaignId: next.campaign?._id };
        if (next.startDate) params.startDate = new Date(next.startDate + 'T00:00:00').toISOString();
        if (next.endDate) params.endDate = new Date(next.endDate + 'T23:59:59.999').toISOString();
        if (field === 'search' && value) searchTimer.current = setTimeout(() => onApply(params), 300);
        else onApply(params);
    }
    function clear() {
        clearTimeout(searchTimer.current);
        setDraft(emptyFilters);
        setReset(n => n + 1);
        onApply({});
    }
    return <section className="@container rounded-xl border border-slate-200 bg-white p-4" aria-label="Report filters">
        <div className="grid items-end gap-3 @sm:grid-cols-2 @3xl:grid-cols-3 @6xl:grid-cols-[1.2fr_1.5fr_1fr_1fr_1fr_auto]">
            {tab !== 'payouts' && <div className="min-w-0 text-xs font-medium [&>div]:w-full [&_.absolute]:min-w-full">
                <span>Campaign</span>
                <CampaignSearchDropdown key={reset} selectedCampaign={draft.campaign} onSelect={c => change('campaign', c)} onClear={() => change('campaign', null)} tc={tc} />
            </div>}
            <label className="min-w-0 flex-auto text-xs font-medium">Search<input type="search" className={input} value={draft.search} maxLength={200} onChange={e => change('search', e.target.value)}
                placeholder={tab === 'payouts' ? 'Recipient, account, click ID or UTR' : tab === 'clicks' ? 'Click ID, account, source or IP' : 'Click ID, account or event'} /></label>
            <label className="text-xs font-medium">Status<select aria-label="Status" className={input} value={draft.status} onChange={e => change('status', e.target.value)}>
                <option value="">All statuses</option>{(tab === 'payouts' ? payoutStatuses : trackingStatuses).map(s => <option key={s} value={s}>{title(s)}</option>)}
            </select></label>
            {tab === 'payouts' && <label className="text-xs font-medium">Payout type<select aria-label="Payout type" className={input} value={draft.type} onChange={e => change('type', e.target.value)}>
                <option value="">All types</option>{payoutTypes.map(t => <option key={t} value={t}>{title(t)}</option>)}
            </select></label>}
            <label className="text-xs font-medium">From<input type="date" className={input} value={draft.startDate} max={draft.endDate || undefined} onChange={e => change('startDate', e.target.value)} /></label>
            <label className="text-xs font-medium">To<input type="date" className={input} value={draft.endDate} min={draft.startDate || undefined} onChange={e => change('endDate', e.target.value)} /></label>
            <button type="button" className={button} onClick={clear}>Clear</button>
        </div>
        {draft.endDate && draft.startDate > draft.endDate && <p role="alert" className="mt-2 text-sm text-red-700">Choose an end date on or after the start date.</p>}
    </section>;
}
