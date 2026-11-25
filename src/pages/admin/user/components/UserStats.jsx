import { FiUsers, FiCheckCircle, FiShield, FiUser } from 'react-icons/fi';
import { Metric } from '../../../../components/common/DetailSections';

export default function UserStats({ stats, isLoading }) {
    return (
        <dl className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Metric label="Total users" icon={FiUsers} isLoading={isLoading}>
                {Number(stats?.total ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Active accounts" icon={FiCheckCircle} isLoading={isLoading}>
                {Number(stats?.active ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Administrators" icon={FiShield} isLoading={isLoading}>
                {Number(stats?.admins ?? 0).toLocaleString('en-IN')}
            </Metric>
            <Metric label="Standard users" icon={FiUser} isLoading={isLoading}>
                {Number(stats?.standardUsers ?? 0).toLocaleString('en-IN')}
            </Metric>
        </dl>
    );
}
