import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
    Area,
    AreaChart,
    Bar,
    BarChart,
    CartesianGrid,
    Cell,
    Pie,
    PieChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';
import {
    FiCheckCircle,
    FiCreditCard,
    FiGift,
    FiMousePointer,
    FiRefreshCw,
    FiTag,
    FiTarget,
    FiTrendingUp,
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { getDashboardStats } from '../../../services/AppService';
import { Metric } from '../../../components/common/DetailSections';

const panel = 'min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5';
const dayLabel = new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = (value) => (value ? dayLabel.format(new Date(value)) : '');
const currency = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
const moneyFromPaise = (paise) => currency.format(Math.round(Number(paise || 0) / 100));

const PAYOUT_STATUS_META = [
    { key: 'paid', label: 'Paid', color: '#059669' },
    { key: 'unpaid', label: 'Pending', color: '#d97706' },
    { key: 'processing', label: 'Processing', color: '#2563eb' },
    { key: 'failed', label: 'Failed', color: '#e11d48' },
];

const CLICK_STATUS_META = [
    { key: 'completed', label: 'Completed', color: '#059669' },
    { key: 'pending', label: 'Pending', color: '#d97706' },
    { key: 'pending_approval', label: 'Approval', color: '#f59e0b' },
    { key: 'clicked', label: 'Clicked', color: '#6366f1' },
    { key: 'rejected', label: 'Rejected', color: '#e11d48' },
];

const CATEGORY_COLORS = ['#4f46e5', '#059669', '#d97706', '#db2777', '#0284c7', '#7c3aed'];

const ACTIVITY_STATUS_BADGE = {
    completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    pending: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_approval: 'bg-amber-50 text-amber-700 border-amber-200',
    pending_proof: 'bg-amber-50 text-amber-700 border-amber-200',
    clicked: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    rejected: 'bg-rose-50 text-rose-700 border-rose-200',
};

function ChartTooltip({ active, payload, label, isCurrency = false, isDateLabel = false }) {
    if (!active || !payload?.length) return null;
    const heading = isDateLabel && label ? formatDay(label) : label;
    return (
        <div className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs shadow-md">
            {heading && <p className="mb-1.5 font-semibold text-slate-700">{heading}</p>}
            <div className="space-y-1">
                {payload.map((entry) => (
                    <div key={entry.dataKey || entry.name} className="flex items-center justify-between gap-4">
                        <span className="flex items-center gap-1.5 text-slate-600">
                            <span className="size-2 rounded-full" style={{ backgroundColor: entry.color || entry.payload?.color }} />
                            {entry.name}
                        </span>
                        <span className="font-semibold tabular-nums text-slate-900">
                            {isCurrency ? `₹${Number(entry.value || 0).toLocaleString('en-IN')}` : Number(entry.value || 0).toLocaleString('en-IN')}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}

function DonutCard({ title, subtitle, data, emptyMessage, valueFormatter }) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const nonZero = data.filter((item) => item.value > 0);

    return (
        <section className={panel}>
            <div className="mb-4 flex items-baseline justify-between gap-2">
                <div>
                    <h3 className="font-semibold text-slate-900">{title}</h3>
                    {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
                </div>
                <span className="text-xs font-medium tabular-nums text-slate-500">
                    Total: <strong className="text-slate-900">{valueFormatter ? valueFormatter(total) : total.toLocaleString('en-IN')}</strong>
                </span>
            </div>

            {nonZero.length > 0 ? (
                <div className="flex flex-wrap items-center gap-4">
                    <div className="h-48 min-w-0 flex-[1_1_11rem]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={nonZero}
                                    dataKey="value"
                                    nameKey="name"
                                    innerRadius="54%"
                                    outerRadius="86%"
                                    paddingAngle={2}
                                    stroke="transparent"
                                >
                                    {nonZero.map((entry) => (
                                        <Cell key={entry.name} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<ChartTooltip isCurrency={Boolean(valueFormatter)} />} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                    <ul className="flex-[1_1_9rem] space-y-2">
                        {data.map((item) => (
                            <li key={item.name} className="flex items-center gap-2 text-sm">
                                <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="truncate text-slate-700">{item.name}</span>
                                <strong className="ml-auto tabular-nums text-slate-900">
                                    {valueFormatter ? valueFormatter(item.value) : item.value.toLocaleString('en-IN')}
                                </strong>
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p className="py-16 text-center text-sm text-slate-500">{emptyMessage}</p>
            )}
        </section>
    );
}

export default function MainDashboard() {
    const query = useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: async () => (await getDashboardStats()).data.data,
    });

    if (query.isLoading) {
        return (
            <div className="w-full space-y-5 p-4 sm:p-6">
                <div className="h-8 w-48 animate-pulse rounded-lg bg-slate-200" />
                <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white" />
                    ))}
                </div>
            </div>
        );
    }

    if (query.isError) {
        return (
            <div className="w-full p-4 sm:p-6">
                <div role="alert" className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
                    Unable to load dashboard analytics.{' '}
                    <button type="button" onClick={() => query.refetch()} className="font-semibold underline">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    const stats = query.data || {};
    const dailyTrend = stats.dailyTrend || [];
    const topOffers = stats.topOffers || [];
    const recentActivity = stats.recentActivity || [];

    // Payout donut data (count-based with amount tooltip or amount in INR)
    const payoutMap = new Map((stats.payoutStatusStats || []).map((p) => [p._id, p]));
    const payoutDonutData = PAYOUT_STATUS_META.map((meta) => ({
        name: meta.label,
        color: meta.color,
        value: Math.round((payoutMap.get(meta.key)?.amountPaise || 0) / 100),
    }));

    // Click status donut data
    const clickMap = new Map((stats.clickStatusStats || []).map((c) => [c._id, c.count]));
    const clickDonutData = CLICK_STATUS_META.map((meta) => ({
        name: meta.label,
        color: meta.color,
        value: clickMap.get(meta.key) || 0,
    }));

    // Offer category donut data
    const categoryDonutData = (stats.offerCategoryStats || []).map((cat, idx) => ({
        name: cat._id || 'General',
        color: CATEGORY_COLORS[idx % CATEGORY_COLORS.length],
        value: cat.count || 0,
    }));

    const conversionRate = stats.totalClicks > 0
        ? ((stats.completedConversions / stats.totalClicks) * 100).toFixed(1)
        : '0.0';

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="w-full space-y-6 p-4 sm:p-6">
                {/* ── Page Header ── */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 sm:text-2xl">Overview</h1>
                        <p className="text-sm text-slate-500">Real-time platform analytics · Last 14 days</p>
                    </div>
                    <button
                        type="button"
                        onClick={() => query.refetch()}
                        disabled={query.isFetching}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                    >
                        <FiRefreshCw className={query.isFetching ? 'animate-spin' : ''} size={14} />
                        Refresh
                    </button>
                </div>

                {/* ── 8 KPI Metrics (Clean Slate Grid) ── */}
                <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <Metric label="Total revenue" icon={FaRupeeSign}>
                        {moneyFromPaise(stats.totalRevenue)}
                    </Metric>
                    <Metric label="User payouts" icon={FiGift}>
                        {moneyFromPaise(stats.totalUserPayouts)}
                    </Metric>
                    <Metric label="Platform margin" icon={FiTrendingUp}>
                        {moneyFromPaise(stats.totalMargin)}
                    </Metric>
                    <Metric label={`Pending payouts (${stats.pendingPayoutsCount || 0})`} icon={FiCreditCard}>
                        {moneyFromPaise(stats.pendingPayoutsAmount)}
                    </Metric>
                    <Metric label="Total clicks" icon={FiMousePointer}>
                        {Number(stats.totalClicks || 0).toLocaleString('en-IN')}
                    </Metric>
                    <Metric label={`Conversions (${conversionRate}%)`} icon={FiCheckCircle}>
                        {Number(stats.completedConversions || 0).toLocaleString('en-IN')}
                    </Metric>
                    <Metric label="Active offers" icon={FiTag}>
                        {Number(stats.activeOffers || 0).toLocaleString('en-IN')}
                    </Metric>
                    <Metric label="Total campaigns" icon={FiTarget}>
                        {Number(stats.totalCampaigns || 0).toLocaleString('en-IN')}
                    </Metric>
                </dl>

                {/* ── Row 1: Revenue Bar Chart + Payouts Donut ── */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panel} lg:col-span-2`}>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-slate-900">Revenue, Payouts & Margin</h3>
                                <p className="text-xs text-slate-500">Daily financial performance (INR)</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-indigo-600" />Revenue</span>
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-600" />Payouts</span>
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-amber-500" />Margin</span>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={dailyTrend} margin={{ left: 0, right: 8 }}>
                                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis width={42} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v}`} />
                                    <Tooltip content={<ChartTooltip isCurrency isDateLabel />} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#4f46e5" maxBarSize={24} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="payouts" name="Payouts" fill="#059669" maxBarSize={24} radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="margin" name="Margin" fill="#f59e0b" maxBarSize={24} radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <DonutCard
                        title="Payouts by status"
                        subtitle="Amount distribution (INR)"
                        data={payoutDonutData}
                        emptyMessage="No payouts recorded yet."
                        valueFormatter={(val) => `₹${val.toLocaleString('en-IN')}`}
                    />
                </div>

                {/* ── Row 2: Clicks & Conversions Area Chart + Click Status Donut ── */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panel} lg:col-span-2`}>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-slate-900">Clicks & Conversion Trend</h3>
                                <p className="text-xs text-slate-500">14-day traffic and completion velocity</p>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-slate-600">
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-blue-500" />Clicks</span>
                                <span className="flex items-center gap-1.5"><span className="size-2.5 rounded-full bg-emerald-500" />Conversions</span>
                            </div>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={dailyTrend} margin={{ left: 0, right: 8 }}>
                                    <defs>
                                        <linearGradient id="clicksGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.22} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.28} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid vertical={false} stroke="#e2e8f0" />
                                    <XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <YAxis width={36} allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip isDateLabel />} />
                                    <Area type="monotone" dataKey="clicks" name="Clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#clicksGrad)" />
                                    <Area type="monotone" dataKey="conversions" name="Conversions" stroke="#10b981" strokeWidth={2.5} fill="url(#convGrad)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </section>

                    <DonutCard
                        title="Clicks by outcome"
                        subtitle="All-time tracking status"
                        data={clickDonutData}
                        emptyMessage="No clicks tracked yet."
                    />
                </div>

                {/* ── Row 3: Top Offers Bar Chart + Offers by Category Donut ── */}
                <div className="grid gap-4 lg:grid-cols-3">
                    <section className={`${panel} lg:col-span-2`}>
                        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                            <div>
                                <h3 className="font-semibold text-slate-900">Top Performing Offers</h3>
                                <p className="text-xs text-slate-500">Clicks vs completed conversions</p>
                            </div>
                            <Link to="/admin/offers" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                                View all offers &rarr;
                            </Link>
                        </div>
                        {topOffers.length > 0 ? (
                            <div className="h-60">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={topOffers} margin={{ left: 0, right: 8 }}>
                                        <CartesianGrid vertical={false} stroke="#e2e8f0" />
                                        <XAxis
                                            dataKey="name"
                                            tick={{ fontSize: 11, fill: '#64748b' }}
                                            axisLine={false}
                                            tickLine={false}
                                            tickFormatter={(v) => (v.length > 14 ? `${v.slice(0, 14)}…` : v)}
                                        />
                                        <YAxis width={36} allowDecimals={false} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                        <Tooltip content={<ChartTooltip />} />
                                        <Bar dataKey="clicks" name="Clicks" fill="#6366f1" maxBarSize={28} radius={[4, 4, 0, 0]} />
                                        <Bar dataKey="conversions" name="Conversions" fill="#10b981" maxBarSize={28} radius={[4, 4, 0, 0]} />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <p className="py-16 text-center text-sm text-slate-500">No offer traffic recorded yet.</p>
                        )}
                    </section>

                    <DonutCard
                        title="Offers by category"
                        subtitle="Active & paused catalog"
                        data={categoryDonutData}
                        emptyMessage="No offers created yet."
                    />
                </div>

                {/* ── Row 4: Recent Activity Table ── */}
                <section className={panel}>
                    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
                        <div>
                            <h3 className="font-semibold text-slate-900">Recent Activity</h3>
                            <p className="text-xs text-slate-500">Latest user clicks and completions</p>
                        </div>
                        <Link to="/admin/conversions" className="text-xs font-semibold text-indigo-600 hover:text-indigo-800">
                            View full report &rarr;
                        </Link>
                    </div>

                    {recentActivity.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[600px] text-left text-sm">
                                <thead>
                                    <tr className="border-b border-slate-200 text-xs font-medium text-slate-500">
                                        <th className="py-2.5 pr-4">Account</th>
                                        <th className="py-2.5 pr-4">Offer</th>
                                        <th className="py-2.5 pr-4 text-right">Earned</th>
                                        <th className="py-2.5 pr-4 text-center">Status</th>
                                        <th className="py-2.5 text-right">Time</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {recentActivity.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50/70">
                                            <td className="py-3 pr-4 font-medium text-slate-900">
                                                <span>{item.account}</span>
                                                <span className="ml-2 text-xs text-slate-400">{item.payoutType}</span>
                                            </td>
                                            <td className="py-3 pr-4 text-slate-600">{item.offerName}</td>
                                            <td className="py-3 pr-4 text-right font-semibold tabular-nums text-emerald-700">
                                                {moneyFromPaise(item.amountPaise)}
                                            </td>
                                            <td className="py-3 pr-4 text-center">
                                                <span
                                                    className={`inline-block rounded-full border px-2.5 py-0.5 text-[11px] font-medium capitalize ${
                                                        ACTIVITY_STATUS_BADGE[item.status] || 'border-slate-200 bg-slate-100 text-slate-600'
                                                    }`}
                                                >
                                                    {String(item.status || '').replaceAll('_', ' ')}
                                                </span>
                                            </td>
                                            <td className="py-3 text-right text-xs text-slate-500">
                                                {item.createdAt ? new Date(item.createdAt).toLocaleString('en-IN') : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="py-10 text-center text-sm text-slate-500">No recent activity found.</p>
                    )}
                </section>
            </div>
        </div>
    );
}
