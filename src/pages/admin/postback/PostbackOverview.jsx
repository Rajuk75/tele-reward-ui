import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { FiActivity, FiCheckCircle, FiCopy, FiShield, FiAlertCircle } from 'react-icons/fi';
import { getPostbackOverview } from '../../../services/AppService';
import { Metric } from '../../../components/common/DetailSections';

const groups = [
    { name: 'Success', color: '#047857', statuses: ['success'] },
    { name: 'Pending', color: '#a16207', statuses: ['pending_approval', 'pending_proof'] },
    { name: 'Duplicate', color: '#64748b', statuses: ['duplicate'] },
    { name: 'Fraud', color: '#be123c', statuses: ['fraud_timing', 'fraud_device', 'fraud_ip_block'] },
];
const panel = 'min-w-0 rounded-xl border border-slate-200 bg-white p-4 sm:p-5';
const dayLabel = new Intl.DateTimeFormat('en-IN', { month: 'short', day: 'numeric', timeZone: 'UTC' });
const formatDay = value => dayLabel.format(new Date(value));

export default function PostbackOverview() {
    const query = useQuery({ queryKey: ['postback-overview'], queryFn: async () => (await getPostbackOverview()).data.data });
    if (query.isLoading) return <p role="status">Loading postback overview…</p>;
    if (query.isError) return <p role="alert">Unable to load overview. <button className="underline" onClick={() => query.refetch()}>Try again</button></p>;

    const { statuses, days } = query.data;
    const total = Object.values(statuses).reduce((sum, count) => sum + count, 0);
    const outcomes = groups.map(group => ({ ...group, count: group.statuses.reduce((sum, key) => sum + (statuses[key] || 0), 0) }));
    const other = total - outcomes.reduce((sum, group) => sum + group.count, 0);
    outcomes.push({ name: 'Other outcomes', color: '#4338ca', count: other });
    const errors = ['error', 'click_not_found', 'invalid_secret'].reduce((sum, key) => sum + (statuses[key] || 0), 0);

    return <section className="space-y-4">
        <h2 className="text-sm font-medium text-slate-600">Last 7 days · UTC</h2>
        <dl className="grid grid-cols-2 gap-3 xl:grid-cols-5">
            <Metric label="Total postbacks" icon={FiActivity}>{total}</Metric>
            <Metric label="Successful" icon={FiCheckCircle}>{statuses.success || 0}</Metric>
            <Metric label="Duplicate" icon={FiCopy}>{statuses.duplicate || 0}</Metric>
            <Metric label="Fraud" icon={FiShield}>{outcomes[3].count}</Metric>
            <Metric label="Errors" icon={FiAlertCircle}>{errors}</Metric>
        </dl>
        <div className="grid gap-4 lg:grid-cols-2">
            <section className={panel}>
                <h3 className="mb-4 font-semibold">Postbacks by outcome</h3>
                {total ? <div className="flex flex-wrap items-center gap-4">
                    <div className="h-48 min-w-0 flex-[1_1_11rem]">
                        <ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={outcomes.filter(g => g.count)} dataKey="count" nameKey="name" innerRadius="52%" outerRadius="85%">
                            {outcomes.filter(g => g.count).map(g => <Cell key={g.name} fill={g.color} />)}
                        </Pie><Tooltip /></PieChart></ResponsiveContainer>
                    </div>
                    <ul className="flex-[1_1_9rem] space-y-2">{outcomes.map(g => <li key={g.name} className="flex items-center gap-2 text-sm">
                        <span aria-hidden="true" className="size-2 rounded-full" style={{ backgroundColor: g.color }} />{g.name}<strong className="ml-auto">{g.count}</strong>
                    </li>)}</ul>
                </div> : <p className="py-12 text-center text-sm text-slate-600">No postbacks in the last 7 days.</p>}
            </section>
            <section className={panel}>
                <h3 className="mb-4 font-semibold">Daily postbacks</h3>
                <div className="h-52"><ResponsiveContainer width="100%" height="100%"><BarChart data={days} margin={{ left: 0, right: 8 }}>
                    <CartesianGrid vertical={false} stroke="#e2e8f0" /><XAxis dataKey="day" tickFormatter={formatDay} tick={{ fontSize: 11 }} />
                    <YAxis width={32} allowDecimals={false} tick={{ fontSize: 11 }} /><Tooltip labelFormatter={formatDay} />
                    <Bar dataKey="count" name="Postbacks" fill="#475569" maxBarSize={36} radius={[4,4,0,0]} />
                </BarChart></ResponsiveContainer></div>
            </section>
        </div>
    </section>;
}
