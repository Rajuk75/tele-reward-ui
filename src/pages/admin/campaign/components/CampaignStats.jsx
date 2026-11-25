import { FiLayers, FiActivity, FiTrendingUp, FiPauseCircle } from 'react-icons/fi';
import { Metric } from '../../../../components/common/DetailSections';

export default function CampaignStats({ total = 0, campaigns = [], isLoading = false }) {
    const activeCount = campaigns.filter((c) => c.status === 'active').length;
    const pausedCount = campaigns.filter((c) => c.status === 'paused' || c.status === 'inactive').length;
    const totalCount = total || campaigns.length;
    const totalEvents = campaigns.reduce((sum, c) => sum + (Array.isArray(c.events) ? c.events.length : 0), 0);

    return (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Total campaigns" icon={FiLayers} isLoading={isLoading}>
                {Number(totalCount).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Active campaigns" icon={FiActivity} isLoading={isLoading}>
                {Number(activeCount).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Paused / Inactive" icon={FiPauseCircle} isLoading={isLoading}>
                {Number(pausedCount).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Configured events" icon={FiTrendingUp} isLoading={isLoading}>
                {Number(totalEvents).toLocaleString('en-IN')}
            </Metric>
        </dl>
    );
}
