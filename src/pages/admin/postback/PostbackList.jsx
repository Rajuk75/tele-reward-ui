import { useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPostbackLogs } from '../../../services/AppService';
import DataTable from '../../../components/common/table/DataTable';
import DateTimeCell from '../../../components/common/table/DateTimeCell';
import { ChevronRightIcon } from '../../../components/common/Icons';

const labels = {
    success: 'Success', pending_approval: 'Pending approval', pending_proof: 'Pending proof',
    click_not_found: 'Click not found', inactive_offer: 'Inactive offer', not_found: 'Not found',
    duplicate: 'Duplicate', invalid_secret: 'Invalid secret', ip_not_whitelisted: 'IP blocked',
    fraud_timing: 'Fraud: timing', fraud_device: 'Fraud: device', fraud_ip_block: 'Fraud: IP match',
    out_of_order: 'Out of order', error: 'Error',
};
const input = 'mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
const button = 'rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium hover:bg-slate-50';

export default function PostbackList() {
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [search, setSearch] = useState('');
    const [clickId, setClickId] = useState('');
    const [status, setStatus] = useState('');
    const [start, setStart] = useState('');
    const [end, setEnd] = useState('');
    const [expanded, setExpanded] = useState(null);
    useEffect(() => {
        if (search.trim() === clickId) return;
        const timer = setTimeout(() => { setClickId(search.trim()); setPage(1); setExpanded(null); }, 300);
        return () => clearTimeout(timer);
    }, [search, clickId]);

    const invalid = Boolean(start && end && start > end);
    const query = useQuery({
        queryKey: ['admin-postback-logs', page, limit, status, clickId, start, end],
        enabled: !invalid,
        queryFn: async () => (await getPostbackLogs({ page, limit, status, clickId,
            startDate: start && new Date(start + 'T00:00:00').toISOString(),
            endDate: end && new Date(end + 'T23:59:59.999').toISOString(),
        })).data.data,
    });
    function update(setter, value) {
        setter(value);
        setPage(1);
        setExpanded(null);
    }
    function clear() {
        setSearch(''); setClickId(''); setStatus(''); setStart(''); setEnd(''); setPage(1); setExpanded(null);
    }
    const toggle = id => setExpanded(current => current === id ? null : id);
    const columns = [
        { header: 'Click ID', cellClassName: 'min-w-52', render: (row, open) => <button type="button" aria-expanded={open} onClick={() => toggle(row._id)} className="flex items-start gap-2 text-left font-semibold">
            <ChevronRightIcon className={open ? 'shrink-0 rotate-90' : 'shrink-0'} /><span className="max-w-72 [overflow-wrap:anywhere]">{row.clickId || 'Unknown click'}</span>
        </button> },
        { header: 'User', render: row => <>{row.userId?.name || '—'}<small className="block text-slate-600">{row.userId?.email}</small></> },
        { header: 'Offer', render: row => row.offerId?.offerName || '—' },
        { header: 'Status', render: row => <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 font-medium">{labels[row.status] || row.status || '—'}</span> },
        { header: 'IP address', render: row => row.ipAddress || '—' },
        { header: 'Received at', render: row => <DateTimeCell value={row.createdAt} /> },
    ];
    return <section className="space-y-4">
        <div className="grid items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 text-xs font-medium sm:grid-cols-2 xl:grid-cols-[2fr_1.5fr_1fr_1fr_auto]">
            <label>Click ID<input type="search" className={input} placeholder="Search click ID" maxLength={200} value={search} onChange={e => setSearch(e.target.value)} /></label>
            <label>Status<select className={input} value={status} onChange={e => update(setStatus, e.target.value)}>
                <option value="">All statuses</option>{Object.entries(labels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select></label>
            <label>From<input type="date" className={input} value={start} max={end || undefined} onChange={e => update(setStart, e.target.value)} /></label>
            <label>To<input type="date" className={input} value={end} min={start || undefined} onChange={e => update(setEnd, e.target.value)} /></label>
            <button className={button} onClick={clear}>Clear</button>
        </div>
        {invalid ? <p role="alert">Choose an end date on or after the start date.</p> : query.isError
            ? <p role="alert">Unable to load postback logs. <button className={button} onClick={() => query.refetch()}>Try again</button></p>
            : <><h2 className="font-semibold">Logs {query.data && <span className="text-sm font-normal text-slate-600">({query.data.pagination.total})</span>}</h2>
                <DataTable className="@container [&_table]:min-w-[62rem] [&_th]:whitespace-nowrap" columns={columns} data={query.data?.logs}
                    isLoading={query.isLoading} emptyMessage="No postbacks match your filters." expandedRowId={expanded} onRowClick={toggle}
                    renderExpandedRow={row => <dl className="sticky left-0 grid w-[100cqw] max-w-full gap-4 bg-slate-50 p-5 text-sm [overflow-wrap:anywhere] sm:grid-cols-2">
                        <div><dt className="font-semibold">Notes</dt><dd className="whitespace-pre-wrap">{row.notes || 'No notes recorded.'}</dd></div>
                        <div><dt className="font-semibold">User phone</dt><dd>{row.userId?.phone || '—'}</dd></div>
                    </dl>} pagination={{ ...query.data?.pagination, page, pageSize: limit, onPageChange: value => { setPage(value); setExpanded(null); },
                        onPageSizeChange: value => update(setLimit, value) }} />
            </>}
    </section>;
}
