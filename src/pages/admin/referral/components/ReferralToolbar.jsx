import React from 'react';
import { FiSearch, FiX, FiUserPlus, FiPlus } from 'react-icons/fi';

export default function ReferralToolbar({
    search,
    onSearchChange,
    status,
    onStatusChange,
    onClearFilters,
    hasActiveFilters,
    onAddPartnerClick,
    onCreateReferralClick,
}) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Filters */}
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
                {/* Search */}
                <div className="relative flex-1 sm:max-w-xs min-w-[200px]">
                    <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search partner, code, or account..."
                        className="w-full pl-8 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors shadow-2xs"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 cursor-pointer"
                        >
                            <FiX size={12} />
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <select
                    value={status}
                    onChange={(e) => onStatusChange(e.target.value)}
                    className="px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="paused">Paused</option>
                    <option value="expired">Expired</option>
                </select>

                {/* Clear filters */}
                {hasActiveFilters && (
                    <button
                        type="button"
                        onClick={onClearFilters}
                        className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                        Clear filters
                    </button>
                )}
            </div>

            {/* Action Buttons: 1. Add Partner, 2. Create Referral Link */}
            <div className="flex items-center gap-2 self-end sm:self-auto">
                <button
                    type="button"
                    onClick={onAddPartnerClick}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 hover:text-slate-900 transition-colors cursor-pointer shadow-2xs"
                >
                    <FiUserPlus size={14} className="text-slate-700" />
                    <span>Add Partner</span>
                </button>

                <button
                    type="button"
                    onClick={onCreateReferralClick}
                    className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                >
                    <FiPlus size={14} />
                    <span>Create Referral Link</span>
                </button>
            </div>
        </div>
    );
}
