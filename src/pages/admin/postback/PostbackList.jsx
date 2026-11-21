import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getPostbackLogs } from '../../../services/AppService';
import { useThemeClasses } from '../../../context/ThemeContext';
import { Pagination, PageHeader, StatusBadge, InfoCard, TableWrapper, LoadingRows, EmptyState, Sel, Inp, FilterDropdown, MiniStatCard } from '../common/AdminUI';
import TableComponent from '../common/TableComponent';
import {
    FiRefreshCw, FiSearch, FiUser, FiMail, FiPhone,
    FiHash, FiWifi, FiClock, FiPackage, FiInfo, FiCheckCircle, FiAlertTriangle
} from 'react-icons/fi';

const STATUS_META = {
    success:             'Success',
    pending_approval:    'Pending Approval',
    pending_proof:       'Pending Proof',
    click_not_found:     'Click Not Found',
    duplicate:           'Duplicate',
    invalid_secret:      'Invalid Secret',
    ip_not_whitelisted:  'IP Blocked',
    fraud_timing:        'Fraud: Timing',
    fraud_device:        'Fraud: Device',
    fraud_ip_block:      'Fraud: IP Match',
    out_of_order:        'Out of Order',
    error:               'Error',
};

const STATUS_COLOR = {
    success:             'bg-emerald-500/15 text-emerald-400',
    pending_approval:    'bg-amber-500/15 text-amber-400',
    pending_proof:       'bg-amber-500/15 text-amber-400',
    click_not_found:     'bg-red-500/15 text-red-400',
    duplicate:           'bg-orange-500/15 text-orange-400',
    invalid_secret:      'bg-red-500/15 text-red-400',
    ip_not_whitelisted:  'bg-red-500/15 text-red-400',
    fraud_timing:        'bg-red-600/20 text-red-500',
    fraud_device:        'bg-red-600/20 text-red-500',
    fraud_ip_block:      'bg-red-600/20 text-red-500',
    out_of_order:        'bg-orange-500/15 text-orange-400',
    error:               'bg-slate-500/15 text-slate-400',
};

const fmt = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

export default function PostbackList() {
    const tc = useThemeClasses();

    const [page,      setPage]      = useState(1);
    const [limit,     setLimit]     = useState(20);
    const [status,    setStatus]    = useState('');
    const [clickId,   setClickId]   = useState('');
    const [dClickId,  setDClickId]  = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate,   setEndDate]   = useState('');

    // debounce clickId search
    React.useEffect(() => {
        const t = setTimeout(() => { setDClickId(clickId); setPage(1); }, 400);
        return () => clearTimeout(t);
    }, [clickId]);

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-postback-logs', page, limit, status, dClickId, startDate, endDate],
        queryFn: () =>
            getPostbackLogs({
                page,
                limit,
                status:    status    || undefined,
                clickId:   dClickId  || undefined,
                startDate: startDate || undefined,
                endDate:   endDate   || undefined,
            }).then(r => r.data?.data),
        keepPreviousData: true,
    });

    const logs       = data?.logs       ?? [];
    const pagination = data?.pagination ?? {};

    const clearAll = () => {
        setStatus('');
        setClickId('');
        setDClickId('');
        setStartDate('');
        setEndDate('');
        setPage(1);
    };

    // status counts from current page (decorative — no dedicated summary endpoint)
    const successCount = logs.filter(l => l.status === 'success').length;
    const fraudCount   = logs.filter(l => l.status?.startsWith('fraud')).length;
    const dupCount     = logs.filter(l => l.status === 'duplicate').length;
    const errCount     = logs.filter(l => ['error', 'click_not_found', 'invalid_secret'].includes(l.status)).length;

    const columns = [
        {
            header: 'User',
            className: 'px-6',
            render: (l) => l.userId ? (
                <div className="flex flex-col gap-0.5">
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${tc.text}`}>
                        <FiUser size={11} className="opacity-50 shrink-0" />
                        {l.userId.name || '—'}
                    </span>
                    <span className={`flex items-center gap-1.5 text-[10px] ${tc.textMuted}`}>
                        <FiMail size={10} className="opacity-50 shrink-0" />
                        {l.userId.email || '—'}
                    </span>
                    {l.userId.phone && (
                        <span className={`flex items-center gap-1.5 text-[10px] ${tc.textMuted}`}>
                            <FiPhone size={10} className="opacity-50 shrink-0" />
                            {l.userId.phone}
                        </span>
                    )}
                </div>
            ) : <span className="text-[10px] opacity-30">—</span>
        },
        {
            header: 'Click ID',
            className: 'px-6',
            render: (l) => (
                <div className="flex items-center gap-2">
                    <FiHash size={12} className="opacity-40 shrink-0" />
                    <span className={`text-[11px] font-mono font-bold ${tc.text}`}>{l.clickId || '—'}</span>
                </div>
            )
        },
        {
            header: 'Offer',
            className: 'px-6',
            render: (l) => l.offerId ? (
                <div className="flex items-center gap-2 max-w-[160px]">
                    {l.offerId.iconUrl
                        ? <img src={l.offerId.iconUrl} className="w-7 h-7 rounded-lg object-cover shrink-0" alt="" />
                        : <div className="w-7 h-7 rounded-lg bg-slate-700 flex items-center justify-center shrink-0"><FiPackage size={13} className="opacity-40" /></div>
                    }
                    <span className={`text-[11px] font-bold truncate ${tc.text}`}>{l.offerId.offerName || '—'}</span>
                </div>
            ) : <span className="text-[10px] opacity-30">—</span>
        },
        {
            header: 'Status',
            align: 'center',
            className: 'px-6',
            render: (l) => (
                <div className="flex items-center justify-center gap-2">
                    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-tight ${STATUS_COLOR[l.status] || 'bg-slate-500/15 text-slate-400'}`}>
                        {STATUS_META[l.status] || l.status || '—'}
                    </span>
                    {l.notes && (
                        <div className="group relative">
                            <div className={`p-1 rounded-full border ${tc.border} bg-black/5 dark:bg-white/5 cursor-help ${tc.textMuted}`} title={l.notes}>
                                <FiInfo size={12} />
                            </div>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'IP',
            className: 'px-6',
            render: (l) => (
                <span className={`flex items-center gap-1.5 text-[10px] font-medium ${tc.textMuted}`}>
                    <FiWifi size={11} className="opacity-50" /> {l.ipAddress || '—'}
                </span>
            )
        },
        {
            header: 'Received At',
            className: 'px-6',
            render: (l) => (
                <span className={`flex items-center gap-1.5 text-[10px] font-medium ${tc.textMuted}`}>
                    <FiClock size={11} className="opacity-50" /> {fmt(l.createdAt)}
                </span>
            )
        },
    ];

    const toolbar = (
        <div className="flex flex-wrap items-center gap-3">
            <FilterDropdown
                label="Status"
                value={status}
                onChange={setStatus}
                options={[
                    { value: '', label: 'All Statuses' },
                    ...Object.entries(STATUS_META).map(([k, v]) => ({ value: k, label: v }))
                ]}
                tc={tc}
                className="min-w-[160px]"
            />

            <div className="relative">
                <Inp
                    type="text"
                    value={clickId}
                    placeholder="Search Click ID..."
                    onChange={(e) => setClickId(e.target.value)}
                    tc={tc}
                    className="w-48 pl-10"
                />
                <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={14} />
            </div>

            <div className="flex items-center gap-2">
                <Inp
                    type="date"
                    value={startDate}
                    onChange={(e) => { setStartDate(e.target.value); setPage(1); }}
                    tc={tc}
                    className="w-auto px-3"
                />
                <span className="text-[10px] font-black opacity-30">TO</span>
                <Inp
                    type="date"
                    value={endDate}
                    onChange={(e) => { setEndDate(e.target.value); setPage(1); }}
                    tc={tc}
                    className="w-auto px-3"
                />
            </div>

            <button
                onClick={clearAll}
                className="p-2 rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition"
                title="Reset Filters"
            ><FiRefreshCw size={16} /></button>

            <div className="ml-auto">
                <span className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                    tc.isDark ? 'bg-slate-800 border-slate-700 text-slate-400' : 'bg-white border-slate-200 text-slate-500'
                }`}>
                    {pagination.total ?? 0} Records
                </span>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen ${tc.page} ${
            !tc.isDark ? 'bg-gradient-to-br from-rose-50/40 via-white to-indigo-50/40' : ''
        }`}>
            <div className="max-w-full mx-auto space-y-6 p-4 sm:p-6 lg:p-10 xl:px-14">
                <PageHeader
                    title="Postback Logs"
                    subtitle="S2S advertiser postback audit trail — every callback received is logged here"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <MiniStatCard 
                        label="Success" 
                        value={pagination.total ?? 0} 
                        Icon={FiCheckCircle}
                        colorClass="text-emerald-500"
                        isEmerald={true}
                    />
                    <MiniStatCard 
                        label="Fraud" 
                        value={fraudCount} 
                        Icon={FiAlertTriangle}
                        colorClass="text-red-500"
                        isGolden={true}
                    />
                    <MiniStatCard 
                        label="Duplicate" 
                        value={dupCount} 
                        Icon={FiRefreshCw}
                        colorClass="text-orange-400"
                        isGolden={true}
                    />
                    <MiniStatCard 
                        label="Errors" 
                        value={errCount} 
                        Icon={FiInfo}
                        colorClass="text-slate-400"
                        isGolden={true}
                    />
                </div>

                {/* Postback URL reference */}
                <div className={`mb-6 p-5 rounded-xl border ${tc.border} ${tc.isDark ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <p className={`text-xs font-bold uppercase tracking-widest mb-3 ${tc.textMuted}`}>Postback URL Template</p>
                    <div className="flex flex-wrap gap-4">
                        <div>
                            <p className="text-[10px] font-bold opacity-40 mb-1">Short (preferred)</p>
                            <code className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border select-all ${tc.border} ${tc.isDark ? 'bg-slate-900 text-emerald-400' : 'bg-white text-emerald-700'}`}>
                                https://api.adshamper.com/postback?cid={'{click_id}'}&secret={'{secret}'}&event={'{event}'}
                            </code>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold opacity-40 mb-1">Legacy</p>
                            <code className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border select-all ${tc.border} ${tc.isDark ? 'bg-slate-900 text-slate-400' : 'bg-white text-slate-600'}`}>
                                https://api.adshamper.com/v1/offer/callback/postback?cid={'{click_id}'}&secret={'{secret}'}
                            </code>
                        </div>
                    </div>
                </div>

                <TableWrapper 
                    toolbar={toolbar}
                    footer={
                        <Pagination
                            page={page}
                            totalPages={pagination.totalPages ?? 1}
                            onPageChange={setPage}
                            pageSize={limit}
                            onPageSizeChange={(s) => { setLimit(s); setPage(1); }}
                            total={pagination.total}
                        />
                    }
                >
                    {isLoading ? (
                        <LoadingRows rows={8} cols={7} />
                    ) : isError ? (
                        <EmptyState message="Failed to load postback logs." />
                    ) : logs.length === 0 ? (
                        <EmptyState message="No postback logs match your filters." />
                    ) : (
                        <TableComponent
                            columns={columns}
                            data={logs}
                            rowHoverClass="cursor-default"
                        />
                    )}
                </TableWrapper>
            </div>
        </div>
    );
}
