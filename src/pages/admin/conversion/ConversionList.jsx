import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getConversions, getConversionRevenue, 
} from '../../../services/AppService';
import { showNotification } from '../../../components/Toastify/Toast';
import { useThemeClasses } from '../../../context/ThemeContext';
import { 
    Pagination, PageHeader, StatusBadge, InfoCard, TableWrapper, LoadingRows, EmptyState,
    CampaignSearchDropdown, UserSearchDropdown, Sel, Inp, FilterDropdown, MiniStatCard
} from '../common/AdminUI';
import TableComponent from '../common/TableComponent';
import {
    FiX, FiUser, FiMail, FiPhone, FiClock, FiCalendar, FiRefreshCw, FiExternalLink, FiDownload,
    FiTrendingUp, FiArrowUpRight, FiPieChart, FiCheckCircle
} from 'react-icons/fi';
import ConversionDetailModal from './ConversionDetailModal';

const STATUS_META = {
    partially_completed: 'Partially Completed',
    clicked:          'Clicked',
    pending:          'Pending',
    in_progress:      'In Progress',
    pending_approval: 'Awaiting Approval',
    completed:        'Completed',
    rejected:         'Rejected',
    fraud:            'Fraud',
};

const APPROVAL_BADGE = {
    auto_approved:    { label: 'Auto',    cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20' },
    approved:         { label: 'Approved',cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20' },
    pending_approval: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 ring-amber-500/20' },
    pending_proof:    { label: 'Awaiting Proof', cls: 'bg-amber-500/15 text-amber-400 ring-amber-500/20' },
    pending_review:   { label: 'Review Needed', cls: 'bg-orange-500/15 text-orange-400 ring-orange-500/20' },
    rejected:         { label: 'Rejected',cls: 'bg-red-500/15 text-red-400 ring-red-500/20' },
};

const fmt = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const inr = (v) => {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
};

/* ── Main Component ────────────────────────────────────────────────────────── */

export default function ConversionList() {
    const queryClient  = useQueryClient();
    const tc           = useThemeClasses();

    const [page,             setPage]             = useState(1);
    const [limit,            setLimit]            = useState(20);
    const [status,           setStatus]           = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null);
    const [selectedUser,     setSelectedUser]     = useState(null);
    const [selectedId,       setSelectedId]       = useState(null);
    const [startDate,        setStartDate]        = useState('');
    const [endDate,          setEndDate]          = useState('');

    const { data, isLoading, isError } = useQuery({
        queryKey: ['admin-conversions', page, limit, status, startDate, endDate, selectedCampaign?._id, selectedUser?._id],
        queryFn: () =>
            getConversions({
                page,
                limit,
                status:     status                  || undefined,
                campaignId: selectedCampaign?._id   || undefined,
                userId:     selectedUser?._id       || undefined,
                startDate:  startDate               || undefined,
                endDate:    endDate                 || undefined,
            })
                .then((r) => r.data?.data),
        keepPreviousData: true,
    });

    const { data: revData } = useQuery({
        queryKey: ['admin-conversion-revenue'],
        queryFn: () => getConversionRevenue().then((r) => r.data?.data),
        staleTime: 30_000,
    });

    const conversions = data?.conversions ?? [];
    const pagination  = data?.pagination  ?? {};
    const rev         = revData?.summary  ?? {};

    const clearAll = () => {
        setStartDate('');
        setEndDate('');
        setStatus('');
        setSelectedCampaign(null);
        setSelectedUser(null);
        setPage(1);
    };

    const handleExport = () => {
        if (!conversions.length) {
            showNotification('No data to export', 'info');
            return;
        }

        const headers = ['Click ID', 'User Name', 'User Email', 'Campaign', 'Offer', 'User Reward', 'Adv Payout', 'Status', 'Click IP', 'Event', 'Click Date', 'Conv Date'];
        
        const rows = conversions.map(c => [
            c.clickId,
            c.userId?.name || '—',
            c.userId?.email || '—',
            c.campaignId?.name || '—',
            c.offerId?.offerName || '—',
            inr(c.userRewardINR),
            inr(c.advertiserAmount),
            c.status,
            c.ipAddress || '—',
            c.completedEvent || 'Initial Click',
            fmt(c.clickedAt),
            c.conversionDate ? fmt(c.conversionDate) : '—'
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `conversions_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showNotification('Excel file exported!', 'success');
    };

    const columns = [
        {
            header: 'User / Payout A/C',
            className: 'px-6',
            render: (c) => (
                <div className="flex flex-col gap-1">
                    {c.payoutAccount ? (
                        <div className="bg-emerald-50 dark:bg-emerald-950/40 p-1.5 rounded-lg border border-emerald-200 dark:border-emerald-800">
                            <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-wider block">
                                {c.payoutType || 'UPI'} Payout:
                            </span>
                            <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-100 select-all">
                                {c.payoutAccount}
                            </span>
                            {c.payoutHolderName && (
                                <span className="text-[10px] text-slate-500 dark:text-slate-400 block">
                                    {c.payoutHolderName} {c.payoutIfsc ? `(${c.payoutIfsc})` : ''}
                                </span>
                            )}
                        </div>
                    ) : (
                        <>
                            <span className={`flex items-center gap-1.5 text-xs font-bold ${tc.text}`}>
                                <FiUser size={11} className="opacity-50 shrink-0" />
                                {c.userId?.name || 'Anonymous User'}
                            </span>
                            <span className={`flex items-center gap-1.5 text-[10px] font-medium ${tc.textMuted}`}>
                                <FiMail size={10} className="opacity-50 shrink-0" />
                                {c.userId?.email || '—'}
                            </span>
                            {c.userId?.phone && (
                                <span className={`flex items-center gap-1.5 text-[10px] font-medium ${tc.textMuted}`}>
                                    <FiPhone size={10} className="opacity-50 shrink-0" />
                                    {c.userId.phone}
                                </span>
                            )}
                        </>
                    )}
                </div>
            )
        },
        {
            header: 'Click ID',
            className: 'px-6',
            render: (c) => <span className={`text-[10px] font-mono break-all max-w-[120px] inline-block ${tc.textMuted}`}>{c.clickId}</span>
        },
        {
            header: 'Campaign / Task',
            className: 'px-6',
            render: (c) => (
                <div className="max-w-[200px]">
                    <p className={`text-xs font-bold truncate ${tc.text}`}>
                        {c.campaignId?.name || c.offerId?.offerName || '—'}
                    </p>
                    <p className={`text-[10px] mt-0.5 truncate font-medium ${tc.textMuted}`}>
                        {c.campaignId?.category || 'Task'}
                    </p>
                </div>
            )
        },
        {
            header: 'Financials',
            align: 'right',
            className: 'px-6',
            render: (c) => (
                <div className="text-right">
                    <p className="text-xs font-black text-emerald-500">₹{inr(c.userRewardINR)}</p>
                    <p className={`text-[10px] font-medium ${tc.textMuted}`}>Adv: ₹{inr(c.advertiserAmount)}</p>
                </div>
            )
        },
        {
            header: 'Conversion Status',
            align: 'center',
            className: 'px-6',
            render: (c) => (
                <div className="flex flex-col items-center gap-1">
                    <StatusBadge status={c.status} labelMap={STATUS_META} />
                    {c.postbackReceived && <span className="text-[9px] text-emerald-500 font-bold">Postback ✓</span>}
                </div>
            )
        },
        {
            header: 'Click IP',
            className: 'px-6',
            render: (c) => (
                <div className="flex flex-col gap-0.5">
                    <span className={`text-xs font-bold truncate max-w-[120px] ${tc.text}`}>{c.ipAddress || '—'}</span>
                    <span className={`text-[10px] font-medium opacity-50 truncate max-w-[120px] ${tc.text}`}>
                        {c.completedEvent || 'Initial Click'}
                    </span>
                </div>
            )
        },
        {
            header: 'Proof Status',
            align: 'center',
            className: 'px-6',
            render: (c) => {
                const latest = c.completedEvents?.[c.completedEvents.length - 1];
                return latest ? (
                    <StatusBadge status={latest.approvalStatus} />
                ) : <span className="text-[10px] opacity-30">—</span>;
            }
        },
        {
            header: 'Date & Time',
            className: 'px-6',
            render: (c) => (
                <div className="text-[10px] font-medium">
                    <p className={tc.textMuted}>{fmt(c.clickedAt)}</p>
                    {c.conversionDate && <p className="text-emerald-500 mt-0.5">{fmt(c.conversionDate)}</p>}
                </div>
            )
        },
        {
            header: 'Actions',
            align: 'center',
            className: 'px-6',
            render: (c) => (
                <div className="flex items-center justify-center gap-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); setSelectedId(c._id); }}
                        className={`p-2 rounded-lg transition border ${
                            tc.isDark ? 'bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:border-white' : 'bg-white border-slate-200 text-slate-500 hover:text-black hover:border-black'
                        }`}
                        title="View Full Details"
                    >
                        <FiExternalLink size={14} />
                    </button>
                </div>
            )
        }
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

            <UserSearchDropdown
                selectedUser={selectedUser}
                onSelect={(u) => { setSelectedUser(u); setPage(1); }}
                onClear={() => { setSelectedUser(null); setPage(1); }}
                tc={tc}
            />

            <CampaignSearchDropdown
                selectedCampaign={selectedCampaign}
                onSelect={(c) => { setSelectedCampaign(c); setPage(1); }}
                onClear={() => { setSelectedCampaign(null); setPage(1); }}
                tc={tc}
            />

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

            <button
                onClick={handleExport}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
            >
                <FiDownload size={14} /> Export
            </button>

            <div className="ml-auto flex items-center gap-3">
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
                    title="Conversions" 
                    subtitle="Track and manage user offer completions" 
                />

                {revData && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        <MiniStatCard 
                            label="Adv. Revenue" 
                            value={`₹${inr(rev.totalAdvertiserRevenue)}`} 
                            Icon={FiTrendingUp}
                            colorClass="text-blue-500"
                            isGolden={true}
                        />
                        <MiniStatCard 
                            label="User Payouts" 
                            value={`₹${inr(rev.totalUserPayouts)}`} 
                            Icon={FiArrowUpRight}
                            colorClass="text-emerald-500"
                            isEmerald={true}
                        />
                        <MiniStatCard 
                            label="Net Margin" 
                            value={`₹${inr(rev.totalMargin)}`} 
                            Icon={FiPieChart}
                            colorClass="text-indigo-500"
                            isGolden={true}
                        />
                        <MiniStatCard 
                            label="Conversions" 
                            value={rev.totalConversions ?? 0} 
                            Icon={FiCheckCircle}
                            colorClass="text-emerald-500"
                            isEmerald={true}
                        />
                    </div>
                )}

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
                        <EmptyState message="Failed to load conversions." />
                    ) : conversions.length === 0 ? (
                        <EmptyState message="No tracking records match your filters." />
                    ) : (
                        <TableComponent
                            columns={columns}
                            data={conversions}
                            onRowClick={(c) => setSelectedId(c._id)}
                            rowHoverClass="cursor-pointer"
                        />
                    )}
                </TableWrapper>

                {selectedId && (
                    <ConversionDetailModal 
                        trackingId={selectedId} 
                        onClose={() => setSelectedId(null)} 
                    />
                )}
            </div>
        </div>
    );
}