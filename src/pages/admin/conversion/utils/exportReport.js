import { getTrackingClicks } from '../../../../services/clickReportApi';
import { getConversions, getPayouts } from '../../../../services/AppService';
import { tabs, title, recipient, date, earned } from './reportFormat';

export default async function exportReport(tab, filters) {
    const { default: writeWorkbook } = await import('write-excel-file');
    const fetchRows = { conversions: getConversions, clicks: getTrackingClicks, payouts: getPayouts }[tab];
    const headers = tab === 'payouts'
        ? ['Recipient', 'Account', 'Type', 'Offer', 'Event', 'Amount (INR)', 'Status', 'Created', 'Paid at', 'UTR']
        : ['Click ID', 'Recipient', 'Email', 'Campaign', 'Offer', 'Status', 'Click IP', 'Clicked at',
            ...(tab === 'clicks' ? ['Traffic source'] : ['User earned (INR)', 'Advertiser revenue (INR)', 'Latest event', 'Conversion activity'])];
    const sheet = [headers.map(value => ({ value, fontWeight: 'bold' }))];
    let pages = 1;
    const seen = new Set();
    for (let page = 1; page <= pages; page++) {
        const { data } = (await fetchRows({ ...filters, page, limit: 100 })).data;
        if (page === 1) pages = data.pagination.totalPages;
        for (const row of data[tab]) {
            if (seen.has(row._id)) continue;
            seen.add(row._id);
            const values = tab === 'payouts'
                ? [recipient(row), row.payoutAccount, title(row.type), row.offerId?.offerName, row.eventName, row.amount / 100,
                    title(row.status), date(row.createdAt), date(row.paidAt), row.utr]
                : [row.clickId, recipient(row), row.userId?.email, row.campaignId?.name, row.offerId?.offerName,
                    title(row.status), row.ipAddress, date(row.clickedAt), ...(tab === 'clicks' ? [row.urlParams?.source]
                        : [earned(row) / 100, row.milestones?.length ? (row.advertiserAmount ?? 0) / 100 : row.advertiserAmount,
                            row.completedEvents?.at(-1)?.eventName, date(row.reportedAt)])];
            sheet.push(values.map(value => typeof value === 'number'
                ? { type: Number, value, format: '#,##0.00' }
                : { type: String, value: String(value ?? '') }));
        }
    }
    await writeWorkbook(sheet, { sheet: tabs[tab], stickyRowsCount: 1,
        columns: headers.map(header => ({ width: header === 'Click ID' ? 40 : 25 })), fileName: tab + '.xlsx' });
}
