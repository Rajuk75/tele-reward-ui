import DateTimeCell from '../../../../components/common/table/DateTimeCell';
import useClicks from '../hooks/useClicks';
import ReportTable from './ReportTable';
import ClickOverview from './ClickOverview';
import { recipient } from '../utils/reportFormat';
import TrackingDetails from './TrackingDetails';

function columns(first, status) {
    return [first, { header: 'User / account', render: recipient },
        { header: 'Campaign / offer', render: r => <>{r.campaignId?.name}<small className="block">{r.offerId?.offerName}</small></> },
        { header: 'Click IP', render: r => r.ipAddress || '—' }, { header: 'Source', render: r => r.urlParams?.source || '—' },
        status, { header: 'Clicked at', render: r => <DateTimeCell value={r.clickedAt} /> },
    ];
}

export default function ClickList() {
    return <ReportTable tab="clicks" useReport={useClicks} Overview={ClickOverview} makeColumns={columns} Details={TrackingDetails} />;
}
