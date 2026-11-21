import React, { useState, useRef, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import {
    PlusIcon,
    LayersIcon,
    MoreVerticalIcon,
    ChevronRightIcon,
    CheckIcon,
    CloseIcon
} from '../../../components/common/Icons';
import { useQueryState } from '../../../hooks/useQueryState';

// Custom Hooks
import { useOffers } from './hooks/useOffers';

// Sub-components & Modals
import OfferStats from './components/OfferStats';
import OfferToolbar from './components/OfferToolbar';
import OfferCreateModal from './components/OfferCreateModal';
import OfferExpandedRow from './components/OfferExpandedRow';
import DeleteOfferModal from './components/DeleteOfferModal';

// Reusable DataTable
import DataTable from '../../../components/common/table/DataTable';
import ActionDropdown from '../../../components/common/table/ActionDropdown';

function OfferThumbnail({ src, name }) {
    const [failed, setFailed] = useState(false);

    if (!src || failed) {
        return (
            <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200/80 flex items-center justify-center text-slate-500 flex-shrink-0">
                <LayersIcon size={14} strokeWidth={1.8} />
            </div>
        );
    }

    return (
        <img
            src={src}
            alt={name || ''}
            className="w-8 h-8 rounded-lg object-cover flex-shrink-0 bg-slate-100 border border-slate-200/80"
            onError={() => setFailed(true)}
        />
    );
}

function StatusPill({ status, isActive }) {
    const st = (status || (isActive ? 'active' : 'inactive')).toLowerCase();

    if (st === 'active') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/60 capitalize">
                Active
            </span>
        );
    }
    if (st === 'paused') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200/60 capitalize">
                Paused
            </span>
        );
    }
    if (st === 'expired') {
        return (
            <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-rose-50 text-rose-700 border border-rose-200/60 capitalize">
                Expired
            </span>
        );
    }
    return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/80 capitalize">
            Inactive
        </span>
    );
}

function OfferActionMenu({ offer, actions, onExpand }) {
    return (
        <ActionDropdown>
            {({ close }) => (
                <>
                    <button
                        type="button"
                        onClick={() => {
                            close();
                            onExpand();
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        View Details
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            close();
                            actions.goToBanner(offer._id);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        Manage Banner
                    </button>

                    <button
                        type="button"
                        onClick={() => {
                            close();
                            actions.handleToggleStatus(offer);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        {offer.status === 'active' ? 'Pause Offer' : 'Activate Offer'}
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                        type="button"
                        onClick={() => {
                            close();
                            actions.setDeleteTarget(offer);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        Delete Deal
                    </button>
                </>
            )}
        </ActionDropdown>
    );
}

export default function OfferPage() {
    const offersState = useOffers();
    const actions = offersState;
    const { modal, step, openModal, closeModal, setStep } = useQueryState();

    const {
        offers,
        pagination,
        stats,
        isLoading,
        isError,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        status,
        setStatus,
        clearFilters,
    } = offersState;

    const [expandedRowId, setExpandedRowId] = useState(null);

    const handleRowClick = (rowId) => {
        setExpandedRowId((prev) => (prev === rowId ? null : rowId));
    };

    const hasActiveFilters = Boolean(search || status);

    const columns = [
        {
            header: 'Offer',
            className: 'w-[26%]',
            render: (o, isExpanded) => {
                const imgSrc = o.campaignId?.imageUrl || o.backgroundImage;
                return (
                    <div className="flex items-center gap-2.5">
                        <span
                            className={`inline-flex items-center justify-center w-5 h-5 rounded-md transition-all duration-200 shrink-0 ${
                                isExpanded
                                    ? 'rotate-90 bg-slate-900 text-white shadow-2xs'
                                    : 'text-slate-400 group-hover:text-slate-700 hover:bg-slate-100'
                            }`}
                            title={isExpanded ? 'Collapse' : 'Expand'}
                        >
                            <ChevronRightIcon size={12} strokeWidth={2.5} />
                        </span>
                        <OfferThumbnail src={imgSrc} name={o.offerName} />
                        <div className="min-w-0">
                            <span className="font-semibold text-slate-900 truncate text-xs block">
                                {o.offerName}
                            </span>
                            <span className="text-[11px] text-slate-400 truncate block">
                                {o.campaignId?.name || 'Unlinked'}
                            </span>
                        </div>
                    </div>
                );
            },
        },
        {
            header: 'Payout',
            className: 'w-[12%]',
            render: (o) => (
                <span className="font-bold text-xs text-emerald-600 font-mono">
                    ₹{(o.totalPayout ?? 0).toFixed(2)}
                </span>
            ),
        },
        {
            header: 'Events',
            className: 'w-[9%]',
            align: 'center',
            render: (o) => (
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200/80">
                    {o.eventCount ?? o.events?.length ?? 0}
                </span>
            ),
        },
        {
            header: 'Installs / Cap',
            className: 'w-[15%]',
            align: 'center',
            render: (o) => {
                const current = o.currentInstalls ?? 0;
                const total = o.totalCap ?? 0;
                const percent = total > 0 ? Math.min((current / total) * 100, 100) : 0;

                return (
                    <div className="flex flex-col items-center gap-1 min-w-[90px] mx-auto">
                        <span className="text-xs font-semibold text-slate-800 font-mono">
                            {current} <span className="text-slate-400 font-normal">/ {total || '∞'}</span>
                        </span>
                        {total > 0 && (
                            <div className="w-full max-w-[80px] h-1 rounded-full bg-slate-100 overflow-hidden">
                                <div
                                    className="h-full bg-slate-900 rounded-full transition-all duration-300"
                                    style={{ width: `${percent}%` }}
                                />
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Priority',
            className: 'w-[8%]',
            align: 'center',
            render: (o) => (
                <span className="text-xs font-bold text-slate-700 font-mono">
                    {o.priority ?? 1}
                </span>
            ),
        },
        {
            header: 'Status',
            className: 'w-[10%]',
            align: 'center',
            render: (o) => <StatusPill status={o.status} isActive={o.isActive} />,
        },
        {
            header: 'Public App',
            className: 'w-[11%]',
            align: 'center',
            render: (o) => (
                <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        o.offerDisplay
                            ? 'bg-slate-100 text-slate-800 border border-slate-200'
                            : 'bg-slate-50 text-slate-400 border border-slate-200/60'
                    }`}
                >
                    {o.offerDisplay ? 'Visible' : 'Hidden'}
                </span>
            ),
        },
        {
            header: 'Actions',
            className: 'w-[9%]',
            align: 'right',
            render: (o) => (
                <OfferActionMenu
                    offer={o}
                    actions={actions}
                    onExpand={() => handleRowClick(o._id)}
                />
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6 lg:p-8 xl:px-10">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Offers & Deals
                        </h1>
                        <p className="text-xs text-slate-500 mt-1">
                            User-facing reward campaigns live in the Telegram application.
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => openModal('create-offer', { step: 1 })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs self-start sm:self-auto"
                    >
                        <PlusIcon size={14} />
                        <span>New Offer</span>
                    </button>
                </div>

                {/* Top Summary Stats */}
                <OfferStats stats={stats} isLoading={isLoading} />

                {/* Toolbar (Search, Filter, Actions) */}
                <OfferToolbar
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                    onCreateClick={() => openModal('create-offer', { step: 1 })}
                />

                {/* Offers Table */}
                <DataTable
                    columns={columns}
                    data={offers}
                    isLoading={isLoading}
                    emptyMessage={
                        isError
                            ? 'Failed to load offers. Please try refreshing.'
                            : 'No offers found matching your filters.'
                    }
                    keyExtractor={(row) => row._id}
                    expandedRowId={expandedRowId}
                    onRowClick={handleRowClick}
                    renderExpandedRow={(row) => <OfferExpandedRow offer={row} />}
                    pagination={{
                        page,
                        totalPages: pagination.totalPages ?? Math.max(1, Math.ceil((pagination.total || offers.length || 1) / limit)),
                        pageSize: limit,
                        total: pagination.total ?? offers.length ?? 0,
                        onPageChange: setPage,
                        onPageSizeChange: setLimit,
                    }}
                />
            </div>

            {/* Create Wizard Modal */}
            {modal === 'create-offer' && (
                <OfferCreateModal
                    onClose={() => { closeModal(); offersState.refetch(); }}
                    currentStep={step}
                    onStepChange={setStep}
                />
            )}

            {/* Delete Warning Modal */}
            {actions.deleteTarget && (
                <DeleteOfferModal
                    offer={actions.deleteTarget}
                    onConfirm={() => actions.handleDelete(actions.deleteTarget._id)}
                    onCancel={() => actions.setDeleteTarget(null)}
                    isDeleting={actions.isDeleting}
                />
            )}
        </div>
    );
}
