import { useState } from 'react';
import { FiDownload } from 'react-icons/fi';
import DataTable from '../../../../components/common/table/DataTable';
import { ChevronRightIcon } from '../../../../components/common/Icons';
import { tabs, recipient, title, button } from '../utils/reportFormat';
import ReportFilters from './ReportFilters';
import exportReport from '../utils/exportReport';

export default function ReportTable(props) {
    const { tab, useReport, Overview, makeColumns, Details } = props;
    const [filters, setFilters] = useState({});
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [expanded, setExpanded] = useState(null);
    const [exporting, setExporting] = useState(false);
    const [exportError, setExportError] = useState('');
    async function download() {
        setExporting(true);
        setExportError('');
        try {
            await exportReport(tab, filters);
        } catch {
            setExportError('Excel export failed. Please try again.');
        } finally {
            setExporting(false);
        }
    }
    const query = useReport({ ...filters, page, limit });
    const rows = query.data?.[tab] ?? [];
    const paging = query.data?.pagination ?? {};
    const toggle = id => setExpanded(old => old === id ? null : id);
    const first = {
        header: tab === 'payouts' ? 'Recipient' : 'Click ID',
        cellClassName: 'min-w-52',
        render: (r, open) => <button type="button" aria-expanded={open} onClick={() => toggle(r._id)} className="flex w-full items-start gap-2 text-left text-sm font-semibold">
            <ChevronRightIcon className={`mt-0.5 shrink-0 ${open ? 'rotate-90' : ''}`} /><span className="min-w-0 whitespace-normal [overflow-wrap:anywhere]">{tab === 'payouts' ? recipient(r) : r.clickId}</span>
        </button>,
    };
    const status = { header: 'Status', render: r => <span className="whitespace-nowrap rounded-md bg-slate-100 px-2 py-1 font-medium">{title(r.status)}</span> };
    const columns = makeColumns(first, status);

    return <div className="min-w-0 space-y-4">
        <Overview summary={query.data?.summary} />
        <ReportFilters tab={tab} onApply={params => { setFilters(params); setExpanded(null); setPage(1); }} />
        <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="font-semibold">{tabs[tab]} <span className="text-sm font-normal text-slate-600">({paging.total ?? 0})</span></h2>
            <button className={button + ' inline-flex items-center gap-2'} disabled={!rows.length || exporting} onClick={download}>
                <FiDownload aria-hidden="true" />{exporting ? 'Exporting…' : 'Export to Excel'}
            </button>
        </div>
        {exportError && <p role="alert" className="text-sm text-red-700">{exportError}</p>}
        {query.isError ? <div role="alert" className="rounded-xl border bg-white p-5 text-sm">Unable to load {tab}. <button className="underline" onClick={() => query.refetch()}>Try again</button></div>
            : <DataTable className="@container [&_table]:min-w-[68rem] [&_th]:whitespace-nowrap" columns={columns} data={rows} isLoading={query.isLoading} emptyMessage={`No matching ${tab}.`}
                expandedRowId={expanded} onRowClick={toggle} renderExpandedRow={row => <Details row={row} tab={tab} onClose={() => setExpanded(null)} />}
                pagination={{ ...paging, page, pageSize: limit, onPageChange: next => { setPage(next); setExpanded(null); },
                    onPageSizeChange: size => { setLimit(size); setPage(1); setExpanded(null); } }} />}
    </div>;
}
