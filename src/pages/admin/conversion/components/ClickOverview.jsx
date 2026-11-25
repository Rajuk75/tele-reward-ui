import { FiMousePointer, FiLink, FiUsers, FiCheckCircle } from 'react-icons/fi';
import { Metric } from '../../../../components/common/DetailSections';
import { grid } from '../utils/reportFormat';

export default function ClickOverview({ summary }) {
    if (!summary) return null;
    return <dl className={grid}>
            <Metric label="Total clicks" icon={FiMousePointer}>{summary.total}</Metric>
            <Metric label="Direct clicks" icon={FiLink}>{summary.total - summary.referral}</Metric>
            <Metric label="Referral clicks" icon={FiUsers}>{summary.referral}</Metric>
            <Metric label="Completed clicks" icon={FiCheckCircle}>{summary.completed}</Metric>
        </dl>;
}
