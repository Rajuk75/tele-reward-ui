import { FiLayers, FiActivity, FiGlobe } from 'react-icons/fi';
import { FaRupeeSign } from 'react-icons/fa';
import { Metric } from '../../../../components/common/DetailSections';

export default function OfferStats({ stats, isLoading }) {
    return (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Total offers" icon={FiLayers} isLoading={isLoading}>
                {Number(stats?.total ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Active offers" icon={FiActivity} isLoading={isLoading}>
                {Number(stats?.active ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Public visible" icon={FiGlobe} isLoading={isLoading}>
                {Number(stats?.visible ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Avg user payout" icon={FaRupeeSign} isLoading={isLoading}>
                {`₹${stats?.avgPayout ?? 0}`}
            </Metric>
        </dl>
    );
}
