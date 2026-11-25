import { FiShare2, FiCheckCircle, FiMousePointer, FiTrendingUp } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { Metric } from '../../../../components/common/DetailSections';

export default function ReferralStats({ stats, isLoading }) {
    return (
        <dl className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
            <Metric label="Total referrers" icon={FiShare2} isLoading={isLoading}>
                {Number(stats?.total ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Active links" icon={FiCheckCircle} isLoading={isLoading}>
                {Number(stats?.active ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Total clicks" icon={FiMousePointer} isLoading={isLoading}>
                {Number(stats?.clicks ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Conversions" icon={FiTrendingUp} isLoading={isLoading}>
                {Number(stats?.conversions ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Partner earnings" icon={FaRupeeSign} isLoading={isLoading}>
                {`₹${stats?.earningsINR ?? '0.00'}`}
            </Metric>
        </dl>
    );
}
