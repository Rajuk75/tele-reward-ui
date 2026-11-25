import DateTimeCell from '../../../../components/common/table/DateTimeCell';
import LegacyConversionReview from './LegacyConversionReview';
import { Detail } from '../../../../components/common/DetailSections';
import { money, title } from '../utils/reportFormat';

export default function TrackingDetails({ row, tab, onClose }) {
    return <div className="sticky left-0 w-[100cqw] max-w-full space-y-4 bg-slate-50 p-4 sm:p-5 [overflow-wrap:anywhere]">
        <dl className="flex flex-wrap gap-x-6 gap-y-4 [&>*]:flex-[1_1_8rem]">
            <Detail label="Click ID">{row.clickId}</Detail>
            <Detail label="Offer">{row.offerId?.offerName}</Detail>
            <Detail label="Payment method">{row.payoutType}</Detail>
            <Detail label="Click IP">{row.ipAddress}</Detail>
            <Detail label="Clicked at"><DateTimeCell value={row.clickedAt} /></Detail>
            <Detail label="Email">{row.userId?.email}</Detail>
            <Detail label="Referrer earnings">{money(row.earnedReferrerAmountPaise)}</Detail>
        </dl>
        {!!row.milestones?.length && <div><h3 className="mb-2 text-sm font-semibold">Tracked milestones</h3>
            <ul className="divide-y divide-slate-200">{row.milestones.map((m,i) => <li key={m.campaignEventId || i} className="flex flex-wrap items-baseline justify-between gap-2 py-2 text-sm">
                <strong>{m.order}. {m.eventName}</strong><span>{title(m.status)}</span>
                <span>User share {money(m.userSharePaise)}</span><span>Advertiser payout {money(m.advertiserPayoutPaise)}</span>
                {m.completedAt && <DateTimeCell value={m.completedAt} />}
                {m.advertiserTxId && <span>Transaction {m.advertiserTxId}</span>}
                {m.conversionIp && <span>Conversion IP {m.conversionIp}</span>}
            </li>)}</ul></div>}
        {tab === 'conversions' && !row.milestones?.length && <LegacyConversionReview trackingId={row._id} onClose={onClose} />}
    </div>;
}
