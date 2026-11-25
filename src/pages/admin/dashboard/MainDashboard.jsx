import { useQuery } from '@tanstack/react-query';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer,
    AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import {
    FiTarget, FiDollarSign, FiTag, FiClock, FiCreditCard, FiUsers, FiTrendingUp,
} from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { useThemeClasses } from '../../../context/ThemeContext';
import { DashboardStatCard } from './components/StatCard';
import { getDashboardStats } from '../../../services/AppService';

/* ── UI Components ────────────────────────────────────────────────────────── */

const noiseTexture = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`;

function GlassCard({ children, className = '', isDark }) {
    return (
        <div className={`relative rounded-2xl overflow-hidden group transition-all duration-500 ${className} ${
            isDark 
                ? 'bg-white/[0.03] shadow-2xl' 
                : 'bg-white shadow-sm'
        }`}>

            <div className={`relative h-full p-6 rounded-2xl backdrop-blur-md ${
                isDark 
                    ? 'bg-transparent' 
                    : 'bg-white/10'
            }`}>
                {/* Noise Texture Layer */}
                <div 
                    className={`absolute inset-0 pointer-events-none mix-blend-overlay ${isDark ? 'opacity-[0.05]' : 'opacity-[0.2]'}`}
                    style={{ backgroundImage: noiseTexture }}
                />
                <div className="relative z-10 h-full">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ── Dummy Data ───────────────────────────────────────────────────────────── */
const monthlyRevenue = [
    { month: 'Nov', revenue: 28000, payouts: 17500 },
    { month: 'Dec', revenue: 35400, payouts: 22000 },
    { month: 'Jan', revenue: 31200, payouts: 19800 },
    { month: 'Feb', revenue: 42600, payouts: 27000 },
    { month: 'Mar', revenue: 38100, payouts: 24400 },
    { month: 'Apr', revenue: 45231, payouts: 29100 },
];

const conversionTrend = [
    { day: '1',  conv: 38 }, { day: '3',  conv: 55 }, { day: '5',  conv: 47 },
    { day: '7',  conv: 68 }, { day: '9',  conv: 61 }, { day: '11', conv: 79 },
    { day: '13', conv: 84 }, { day: '15', conv: 72 }, { day: '17', conv: 91 },
    { day: '19', conv: 88 }, { day: '21', conv: 95 }, { day: '23', conv: 82 },
    { day: '25', conv: 104 },{ day: '27', conv: 96 }, { day: '30', conv: 112 },
];

const revenueBreakdown = [
    { name: 'Advertiser A', value: 18500 },
    { name: 'Advertiser B', value: 12000 },
    { name: 'Advertiser C', value: 9731  },
    { name: 'Direct',        value: 5000  },
];

const PIE_COLORS = ['#6366f1', '#10b981', '#f59e0b', '#3b82f6'];


const recentConversions = [
    { user: 'Rahul Sharma', offer: 'HDFC CashBack App',  amount: '₹45',  status: 'completed',        time: '2m ago' },
    { user: 'Priya Singh',  offer: 'Amazon Survey',      amount: '₹20',  status: 'pending_approval', time: '8m ago' },
    { user: 'Amit Patel',   offer: 'Groww Invest App',   amount: '₹150', status: 'completed',        time: '15m ago' },
    { user: 'Sneha Roy',    offer: 'Zepto First Order',  amount: '₹30',  status: 'pending_approval', time: '22m ago' },
    { user: 'Karan Mehta',  offer: 'HDFC CashBack App',  amount: '₹45',  status: 'completed',        time: '35m ago' },
];

const STATUS_CLS = {
    completed:        'bg-emerald-100 text-emerald-700',
    pending_approval: 'bg-amber-100 text-amber-700',
    rejected:         'bg-red-100 text-red-700',
};
const STATUS_LBL = {
    completed:        'Completed',
    pending_approval: 'Pending',
    rejected:         'Rejected',
};

/* ── Custom Tooltip ───────────────────────────────────────────────────────── */
function CustomTooltip({ active, payload, label, isDark, prefix = '₹', suffix = '' }) {
    if (!active || !payload?.length) return null;
    return (
        <div className={`rounded-xl px-4 py-3 shadow-xl border text-xs backdrop-blur-xl ${isDark ? 'bg-slate-900/80 border-white/10 text-slate-100' : 'bg-white/90 border-gray-200 text-gray-900'}`}>
            <p className="font-bold mb-2 uppercase tracking-widest text-[9px] opacity-50">{label}</p>
            {payload.map((p) => (
                <div key={p.dataKey} className="flex items-center gap-3 mb-1 last:mb-0">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
                    <div className="flex-1 flex items-center justify-between gap-4">
                        <span className="capitalize font-medium opacity-70">{p.name}</span>
                        <span className="font-black">{prefix}{typeof p.value === 'number' ? p.value.toLocaleString() : p.value}{suffix}</span>
                    </div>
                </div>
            ))}
        </div>
    );
}

/* ── Main ─────────────────────────────────────────────────────────────────── */
export default function MainDashboard() {
    const tc = useThemeClasses();
    const { isDark } = tc;

    const { data: statsData, isLoading } = useQuery({
        queryKey: ['adminDashboardStats'],
        queryFn: () => getDashboardStats()
    });

    const stats = statsData || {};

    const dynamicStatCards = [
        { label: 'Total Campaigns',    value: stats.totalCampaigns || '0',       sub: `+${stats.campaignsThisMonth || 0} this month`,  Icon: FiTarget,     colorClass: 'text-indigo-600', bgClass: 'bg-indigo-50', isGolden: true },
        { label: 'Total Revenue',      value: `₹${(stats.totalRevenue || 0).toLocaleString()}`, sub: 'From settled conversions', Icon: FaRupeeSign, colorClass: 'text-emerald-600', bgClass: 'bg-emerald-50', isEmerald: true },
        { label: 'Active Offers',      value: stats.activeOffers || '0',         sub: `${stats.pausedOffers || 0} paused`,        Icon: FiTag,        colorClass: 'text-amber-600',  bgClass: 'bg-amber-50', isGolden: true },
        { label: 'Pending Approvals',  value: stats.pendingApprovals || '0',     sub: 'Need review',     Icon: FiClock,      colorClass: 'text-orange-600', bgClass: 'bg-orange-50', isGolden: true },
        { label: 'Pending Withdrawals',value: `₹${(stats.pendingWithdrawalsAmount || 0).toLocaleString()}`, sub: `${stats.pendingWithdrawalsCount || 0} requests`, Icon: FiCreditCard, colorClass: 'text-violet-600', bgClass: 'bg-violet-50', isGolden: true },
        { label: 'Total Users',        value: stats.totalUsers || '0',           sub: `+${stats.usersThisWeek || 0} this week`,   Icon: FiUsers,      colorClass: 'text-rose-600',   bgClass: 'bg-rose-50', isGolden: true },
    ];

    return (
        <div className={`min-h-screen ${isDark ? tc.page : 'bg-gradient-to-br from-rose-50/40 via-white to-indigo-50/40'}`}>

            <div className="relative z-10 max-w-full mx-auto space-y-8 p-4 sm:p-6 lg:p-10 xl:px-14">

                {/* Page header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className={`text-3xl font-black tracking-tight drop-shadow-sm ${tc.text}`}>Overview</h1>
                        <p className={`text-xs font-bold uppercase tracking-[0.2em] opacity-40 mt-1 ${tc.text}`}>Analytics Dashboard</p>
                    </div>
                </div>

                {/* ── 6 Stat cards ── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-5">
                    {dynamicStatCards.map((c) => <DashboardStatCard key={c.label} {...c} isLoading={isLoading} />)}
                </div>

                {/* ── Revenue Bar Chart + Donut ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Bar Chart (2/3) */}
                    <GlassCard isDark={isDark} className="lg:col-span-2">
                        <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
                            <div>
                                <h3 className={`text-lg font-black tracking-tight ${tc.text}`}>Revenue Overview</h3>
                                <p className={`text-xs font-bold uppercase tracking-widest opacity-40 mt-1 ${tc.text}`}>Monthly Performance</p>
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full border ${isDark ? 'bg-white/5 border-white/10 text-slate-300' : 'bg-gray-100 border-gray-200 text-gray-600'}`}>
                                Last 6 months
                            </span>
                        </div>
                        <div className="h-64">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={monthlyRevenue} barGap={4} barCategoryGap="30%">
                                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} cursor={{ fill: isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)', radius: 8 }} />
                                    <Bar dataKey="revenue" name="Revenue" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={32} />
                                    <Bar dataKey="payouts"  name="Payouts" fill={isDark ? 'rgba(255,255,255,0.1)' : 'rgba(99,102,241,0.2)'} radius={[4, 4, 0, 0]} maxBarSize={32} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </GlassCard>

                    {/* Donut Chart (1/3) */}
                    <GlassCard isDark={isDark}>
                        <h3 className={`text-lg font-black tracking-tight ${tc.text}`}>Advertisers</h3>
                        <p className={`text-xs font-bold uppercase tracking-widest opacity-40 mt-1 mb-6 ${tc.text}`}>Revenue Share</p>
                        <div className="h-48 relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={revenueBreakdown}
                                        cx="50%" cy="50%"
                                        innerRadius={55} outerRadius={75}
                                        paddingAngle={4} dataKey="value"
                                        stroke="transparent"
                                    >
                                        {revenueBreakdown.map((_, i) => (
                                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip content={<CustomTooltip isDark={isDark} />} />
                                </PieChart>
                            </ResponsiveContainer>
                            {/* Center Info */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className={`text-xs font-black uppercase tracking-tighter opacity-30 ${tc.text}`}>Total</span>
                                <span className={`text-xl font-black ${tc.text}`}>₹45k</span>
                            </div>
                        </div>
                        <div className="space-y-3 mt-6">
                            {revenueBreakdown.map(({ name, value }, i) => (
                                <div key={name} className="flex items-center justify-between group/item cursor-default">
                                    <div className="flex items-center gap-3">
                                        <span className="w-2 h-2 rounded-full transition-transform group-hover/item:scale-125"
                                            style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                                        <span className={`text-[11px] font-bold uppercase tracking-wider opacity-60 ${tc.text}`}>{name}</span>
                                    </div>
                                    <span className={`text-xs font-black ${tc.text}`}>₹{value.toLocaleString()}</span>
                                </div>
                            ))}
                        </div>
                    </GlassCard>
                </div>

                {/* ── Conversion Area Chart ── */}
                <GlassCard isDark={isDark}>
                    <div className="flex flex-wrap items-start justify-between gap-3 mb-8">
                        <div>
                            <h3 className={`text-lg font-black tracking-tight ${tc.text}`}>Conversion Trend</h3>
                            <p className={`text-xs font-bold uppercase tracking-widest opacity-40 mt-1 ${tc.text}`}>Daily Performance Cycle</p>
                        </div>
                        <div className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-500 px-4 py-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/5 shadow-sm shadow-emerald-500/10`}>
                            <FiTrendingUp size={14} className="animate-pulse" />
                            +23.4% Growth
                        </div>
                    </div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={conversionTrend}>
                                <defs>
                                    <linearGradient id="convGrad" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%"  stopColor="#10b981" stopOpacity={isDark ? 0.3 : 0.2} />
                                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} vertical={false} />
                                <XAxis dataKey="day" tick={{ fontSize: 10, fontWeight: 700, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 9, fontWeight: 700, fill: isDark ? 'rgba(255,255,255,0.3)' : 'rgba(0,0,0,0.3)' }} axisLine={false} tickLine={false} />
                                <Tooltip content={<CustomTooltip isDark={isDark} prefix="" suffix=" conv" />} />
                                <Area
                                    type="monotone" dataKey="conv" name="Conversions"
                                    stroke="#10b981" strokeWidth={3}
                                    fill="url(#convGrad)"
                                    dot={false}
                                    activeDot={{ r: 6, fill: '#10b981', stroke: isDark ? '#0f172a' : '#fff', strokeWidth: 2 }}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </GlassCard>

                {/* ── Recent Conversions Table (Glass Styled) ── */}
                <GlassCard isDark={isDark} className="overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className={`text-xl font-black tracking-tight ${tc.text}`}>Recent Activity</h3>
                            <p className={`text-xs font-bold uppercase tracking-widest opacity-40 mt-1 ${tc.text}`}>Live Conversion Stream</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className={`text-[10px] font-black uppercase tracking-widest opacity-60 ${tc.text}`}>Live Sync</span>
                        </div>
                    </div>
                    <div className="overflow-x-auto -mx-6">
                        <table className="w-full min-w-[700px]">
                            <thead>
                                <tr className={`border-b ${isDark ? 'border-white/5' : 'border-black/5'}`}>
                                    <th className={`text-left px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${tc.text}`}>User</th>
                                    <th className={`text-left px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${tc.text}`}>Offer</th>
                                    <th className={`text-right px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${tc.text}`}>Amount</th>
                                    <th className={`text-center px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${tc.text}`}>Status</th>
                                    <th className={`text-right px-8 py-4 text-[10px] font-black uppercase tracking-[0.2em] opacity-40 ${tc.text}`}>Time</th>
                                </tr>
                            </thead>
                            <tbody className={`divide-y ${isDark ? 'divide-white/5' : 'divide-black/5'}`}>
                                {recentConversions.map((c, i) => (
                                    <tr key={i} className="group/row transition-colors hover:bg-white/[0.02]">
                                        <td className={`px-8 py-5 text-sm font-bold ${tc.text}`}>{c.user}</td>
                                        <td className={`px-8 py-5 text-xs font-bold opacity-60 ${tc.text}`}>{c.offer}</td>
                                        <td className={`px-8 py-5 text-right text-sm font-black text-emerald-500`}>{c.amount}</td>
                                        <td className="px-8 py-5 text-center">
                                            <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${STATUS_CLS[c.status] ?? 'bg-gray-100 text-gray-600'}`}>
                                                {STATUS_LBL[c.status] ?? c.status}
                                            </span>
                                        </td>
                                        <td className={`px-8 py-5 text-right text-xs font-bold opacity-40 ${tc.text}`}>{c.time}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </GlassCard>

            </div>
        </div>
    );
}
