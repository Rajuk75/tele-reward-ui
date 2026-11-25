import DateTimeCell from '../../../../components/common/table/DateTimeCell';
import usePayouts from '../hooks/usePayouts';
import ReportTable from './ReportTable';
import PayoutOverview from './PayoutOverview';
import { money, title } from '../utils/reportFormat';
import { Detail } from '../../../../components/common/DetailSections';

const fields = 'grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3';

function PayoutDetails({ row }) {
    return <dl className={`${fields} sticky left-0 w-[100cqw] max-w-full bg-slate-50 p-5 [overflow-wrap:anywhere]`}>
        <Detail label="Payment method">{row.payoutType}</Detail><Detail label="IFSC">{row.payoutIfsc}</Detail>
        <Detail label="Click ID">{row.clickId}</Detail><Detail label="Event">{row.eventName}</Detail>
        <Detail label="Transaction reference">{row.payoutTransactionId}</Detail><Detail label="UTR">{row.utr}</Detail>
        <Detail label="Created"><DateTimeCell value={row.createdAt} /></Detail>
        <Detail label="Paid at"><DateTimeCell value={row.paidAt} /></Detail>
        {row.failureReason && <Detail label="Failure reason">{row.failureReason}</Detail>}
        {row.notes && <Detail label="Notes">{row.notes}</Detail>}
    </dl>;
}

function columns(first, status) {
    return [first,
        { header: 'Account', render: r => r.payoutAccount }, { header: 'Type', render: r => title(r.type) },
        { header: 'Offer / event', render: r => <>{r.offerId?.offerName || '—'}<small className="block">{r.eventName}</small></> },
        { header: 'Amount', render: r => money(r.amount) }, status, { header: 'Created', render: r => <DateTimeCell value={r.createdAt} /> },
    ];
}

export default function PayoutList() {
    return <ReportTable tab="payouts" useReport={usePayouts} Overview={PayoutOverview} makeColumns={columns} Details={PayoutDetails} />;
}
