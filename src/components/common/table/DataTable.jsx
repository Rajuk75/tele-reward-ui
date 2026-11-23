import React from 'react';
import DataTablePagination from './DataTablePagination';

/**
 * DataTable - Minimal, modern Shadcn-style data table.
 * Zero rainbow colors, subtle borders, high readability.
 */
export default function DataTable({
    columns,
    data = [],
    isLoading = false,
    emptyMessage = 'No records found',
    keyExtractor = (row, i) => row._id || i,
    expandedRowId = null,
    onRowClick = undefined,
    renderExpandedRow = undefined,
    className = '',
    pagination = null,
}) {
    return (
        <div className={`w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${className}`}>
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm border-collapse min-w-[750px]">
                    <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-700 select-none">
                            {columns.map((col, i) => (
                                <th
                                    key={col.key || i}
                                    className={`py-3.5 px-6 ${
                                        col.align === 'center'
                                            ? 'text-center'
                                            : col.align === 'right'
                                            ? 'text-right'
                                            : 'text-left'
                                    } ${col.className || ''}`}
                                >
                                    {col.header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-slate-800">
                        {isLoading ? (
                            Array.from({ length: 6 }).map((_, rIdx) => (
                                <tr key={`skeleton-${rIdx}`} className="animate-pulse">
                                    {columns.map((col, cIdx) => (
                                        <td key={`skel-col-${cIdx}`} className="px-4 py-3.5">
                                            <div className="h-4 bg-slate-200 rounded-md w-3/4"></div>
                                        </td>
                                    ))}
                                </tr>
                            ))
                        ) : data.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-600">
                                    <p className="text-sm font-semibold">{emptyMessage}</p>
                                </td>
                            </tr>
                        ) : (
                            data.map((row, i) => {
                                const rowKey = keyExtractor(row, i);
                                const isExpanded = expandedRowId === rowKey;

                                return (
                                    <React.Fragment key={rowKey}>
                                        <tr
                                            onClick={(e) => {
                                                if (
                                                    e.target.closest('button') ||
                                                    e.target.closest('a') ||
                                                    e.target.closest('input') ||
                                                    e.target.closest('select') ||
                                                    e.target.closest('[role="menu"]')
                                                ) {
                                                    return;
                                                }
                                                onRowClick && onRowClick(rowKey);
                                            }}
                                            className={`transition-colors duration-150 group ${
                                                onRowClick ? 'cursor-pointer' : ''
                                            } ${isExpanded ? 'bg-slate-100 font-medium' : 'bg-white hover:bg-slate-50/70'}`}
                                        >
                                            {columns.map((col, j) => (
                                                <td
                                                    key={col.key || j}
                                                    className={`py-3.5 px-6 text-xs font-normal align-middle ${
                                                        col.align === 'center'
                                                            ? 'text-center'
                                                            : col.align === 'right'
                                                            ? 'text-right'
                                                            : 'text-left'
                                                    } ${col.cellClassName || ''}`}
                                                >
                                                    {col.render ? col.render(row, isExpanded, i) : row[col.key]}
                                                </td>
                                            ))}
                                        </tr>
                                        {isExpanded && renderExpandedRow && (
                                            <tr key={`${rowKey}-expanded`}>
                                                <td
                                                    colSpan={columns.length}
                                                    className="p-0 border-b-2 border-slate-300 bg-slate-100/70"
                                                >
                                                    {renderExpandedRow(row)}
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            {/* Built-in Bottom Pagination Footer */}
            {pagination && (
                <div className="border-t border-slate-200 bg-white px-5 sm:px-6 py-2">
                    <DataTablePagination {...pagination} />
                </div>
            )}
        </div>
    );
}
