import React from 'react';
import { PlusIcon } from '../../../../components/common/Icons';

export default function OfferToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    onClearFilters,
    hasActiveFilters,
    onCreateClick,
}) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left side filters */}
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search input */}
                <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search offers or campaigns..."
                        className="w-full px-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition-colors shadow-2xs"
                    />
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-700 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer shadow-2xs"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="paused">Paused</option>
                    <option value="expired">Expired</option>
                </select>

                {/* Clear filters button */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="px-2.5 py-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Right side "+ New Offer" button */}
            <div className="flex items-center gap-2">
                <button
                    type="button"
                    onClick={onCreateClick}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                    <PlusIcon size={14} />
                    <span>New Offer</span>
                </button>
            </div>
        </div>
    );
}
