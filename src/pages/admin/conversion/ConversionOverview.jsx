import { useQuery } from '@tanstack/react-query';
import { getConversionRevenue } from '../../../services/AppService';
import { FiBriefcase, FiGift, FiTrendingUp, FiCheckCircle } from 'react-icons/fi';
import { Metric } from '../../../components/common/DetailSections';
import { grid, money } from './reportFormat';

export default function ConversionOverview() {
    const query = useQuery({ queryKey: ['admin-conversion-revenue'], queryFn: async () => (await getConversionRevenue()).data.data.summary });
    if (!query.data) return null;
    const rev = query.data;
    return <section><h2 className="mb-2 text-sm font-semibold text-slate-700">All-time revenue</h2><dl className={grid}>
        <Metric label="Advertiser revenue" icon={FiBriefcase}>{money(rev.totalAdvertiserRevenue)}</Metric>
        <Metric label="User rewards" icon={FiGift}>{money(rev.totalUserPayouts)}</Metric>
        <Metric label="Margin" icon={FiTrendingUp}>{money(rev.totalMargin)}</Metric>
        <Metric label="Conversion events" icon={FiCheckCircle}>{rev.totalConversions}</Metric>
    </dl></section>;
}
