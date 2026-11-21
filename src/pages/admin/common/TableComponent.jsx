import React from 'react';
import { useThemeClasses } from '../../../context/ThemeContext';

export default function TableComponent({
    columns,
    data,
    keyExtractor = (row, i) => row._id || i,
    expandedRowId = null,
    onRowClick = undefined,
    renderExpandedRow = undefined,
    tableClassName = undefined,
    headerClassName = undefined,
    tbodyClassName = undefined,
    rowClassName = undefined,
    wrapperClassName = undefined
}) {
    const tc = useThemeClasses();
    const { isDark } = tc;

    const finalWrapperClass = wrapperClassName || "w-full";
    const finalTableClass = tableClassName || "w-full text-left border-collapse min-w-[700px]";
    const finalHeaderClass = headerClassName || `text-[11px] uppercase tracking-wider font-bold ${tc.tableHead} border-b ${tc.border}`;
    const finalTbodyClass = tbodyClassName || "";
    return (
        <div className={finalWrapperClass}>
            <table className={finalTableClass}>
                <thead>
                    <tr className={finalHeaderClass}>
                        {columns.map((col, i) => (
                            <th
                                key={col.key || i}
                                className={`py-3.5 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : 'text-left'} ${col.className || 'px-6'}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className={finalTbodyClass}>
                    {data.map((row, i) => {
                        const rowKey = keyExtractor(row, i);
                        const isOpen = expandedRowId === rowKey;
                        
                        const defaultRowClass = `
                            transition-colors duration-150 
                            ${tc.rowHover} 
                            ${i % 2 === 0 ? tc.rowEven : tc.rowOdd} 
                            ${tc.text}
                        `;
                        const dynamicRowClass = typeof rowClassName === 'function' ? rowClassName(row, i, isOpen) : (rowClassName || defaultRowClass);

                        return (
                            <React.Fragment key={rowKey}>
                                <tr
                                    onClick={() => onRowClick && onRowClick(rowKey)}
                                    className={`${dynamicRowClass} ${onRowClick ? 'cursor-pointer hover:bg-gray-50/50 dark:hover:bg-slate-800/50' : ''}`}
                                >
                                    {columns.map((col, j) => (
                                        <td
                                            key={col.key || j}
                                            className={`py-4 ${col.align === 'center' ? 'text-center' : col.align === 'right' ? 'text-right' : ''} ${col.cellClassName || 'px-6'}`}
                                        >
                                            {col.render ? col.render(row, isOpen, i) : row[col.key]}
                                        </td>
                                    ))}
                                </tr>
                                {isOpen && renderExpandedRow && (
                                    <tr key={`${rowKey}-exp`}>
                                        <td colSpan={columns.length} className="p-0 border-b-2 border-gray-300 border-l-4 border-l-black">
                                            {renderExpandedRow(row)}
                                        </td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                </tbody>
            </table>
        </div>
    );
}
