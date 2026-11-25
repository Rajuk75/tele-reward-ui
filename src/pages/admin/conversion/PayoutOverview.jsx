import { FiCheckCircle, FiClock, FiRefreshCw, FiAlertCircle } from 'react-icons/fi';
import { Metric } from '../../../components/common/DetailSections';
import { grid, payoutStatuses, title, money } from './reportFormat';

const payoutIcons = { paid: FiCheckCircle, unpaid: FiClock, processing: FiRefreshCw, failed: FiAlertCircle };

export default function PayoutOverview({ summary }) {
    if (!summary) return null;
    return <dl className={grid}>{payoutStatuses.map(s => <Metric key={s} label={title(s)} icon={payoutIcons[s]}>
            {money(summary?.find(g => g._id === s)?.amountPaise)}</Metric>)}</dl>;
}
