import { FiUsers, FiCheckCircle, FiUserX } from 'react-icons/fi';
import { Metric } from '../../../../components/common/DetailSections';

export default function UserStats({ stats, isLoading }) {
    return (
        <dl className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <Metric label="Total users" icon={FiUsers} isLoading={isLoading}>
                {Number(stats?.total ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Active users" icon={FiCheckCircle} isLoading={isLoading}>
                {Number(stats?.active ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Inactive users" icon={FiUserX} isLoading={isLoading}>
                {Number(stats?.inactive ?? 0).toLocaleString('en-IN')}
            </Metric>
        </dl>
    );
}
