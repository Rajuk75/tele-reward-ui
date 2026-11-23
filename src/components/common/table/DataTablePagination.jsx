import React from 'react';

/**
 * DataTablePagination - Minimalist Shadcn-style pagination bar.
 */
export default function DataTablePagination({
    page = 1,
    totalPages = 1,
    pageSize = 15,
    total = 0,
    onPageChange,
    onPageSizeChange,
    className = '',
}) {
    if (!total || totalPages < 1) return null;

    const from = (page - 1) * pageSize + 1;
    const to = Math.min(page * pageSize, total);

    // Calculate visible page buttons (e.g. 1, 2, ..., total)
    const getPageNumbers = () => {
        if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
        if (page <= 4) return [1, 2, 3, 4, 5, '…', totalPages];
        if (page >= totalPages - 3) return [1, '…', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        return [1, '…', page - 1, page, page + 1, '…', totalPages];
    };

    const pages = getPageNumbers();

    return (
        <div className={`flex flex-wrap items-center justify-between gap-4 py-3 px-1 select-none ${className}`}>
            {/* Left: Summary & Page Size */}
            <div className="flex items-center gap-3 text-xs text-slate-700 font-medium">
                <span>
                    Showing <span className="font-bold text-slate-900">{from}</span> to{' '}
                    <span className="font-bold text-slate-900">{to}</span> of{' '}
                    <span className="font-bold text-slate-900">{total.toLocaleString()}</span> results
                </span>

                {onPageSizeChange && (
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-300">
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                onPageSizeChange(Number(e.target.value));
                            }}
                            className="h-8 rounded-md border border-slate-300 bg-white px-2 text-xs font-semibold text-slate-800 shadow-2xs hover:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400 cursor-pointer"
                        >
                            {[10, 15, 25, 50].map((s) => (
                                <option key={s} value={s}>{s} / page</option>
                            ))}
                        </select>
                    </div>
                )}
            </div>

            {/* Right: Page Buttons */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page <= 1}
                    className="h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                    Previous
                </button>

                <div className="flex items-center gap-1 px-1">
                    {pages.map((p, i) =>
                        p === '…' ? (
                            <span key={`dots-${i}`} className="w-7 text-center text-xs font-bold text-slate-600">…</span>
                        ) : (
                            <button
                                key={p}
                                onClick={() => onPageChange(p)}
                                className={`w-8 h-8 rounded-md text-xs font-semibold transition-colors cursor-pointer flex items-center justify-center ${
                                    p === page
                                        ? 'bg-slate-900 text-white shadow-xs font-bold'
                                        : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                                }`}
                            >
                                {p}
                            </button>
                        )
                    )}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page >= totalPages}
                    className="h-8 px-2.5 rounded-md border border-slate-300 bg-white text-xs font-semibold text-slate-800 shadow-2xs hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                    Next
                </button>
            </div>
        </div>
    );
}
