import DateTimeCell from '../../../components/common/table/DateTimeCell';
import useConversions from './hooks/useConversions';
import ReportTable from './ReportTable';
import ConversionOverview from './ConversionOverview';
import { recipient, earned, money } from './reportFormat';
import TrackingDetails from './TrackingDetails';

function columns(first, status) {
    return [first, { header: 'User / account', render: recipient },
        { header: 'Campaign / offer', render: r => <>{r.campaignId?.name}<small className="block">{r.offerId?.offerName}</small></> },
        { header: 'User earned', render: r => money(earned(r)) }, { header: 'Latest event', render: r => r.completedEvents?.at(-1)?.eventName || '—' },
        status, { header: 'Conversion activity', render: r => <DateTimeCell value={r.reportedAt} /> },
    ];
}

export default function ConversionList() {
    return <ReportTable tab="conversions" useReport={useConversions} Overview={ConversionOverview} makeColumns={columns} Details={TrackingDetails} />;
}
