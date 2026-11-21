import React, { useState, useRef, useEffect } from 'react';
import { PlusIcon, LayersIcon, MoreVerticalIcon, CalendarIcon, ChevronRightIcon } from '../../../components/common/Icons';
import { useThemeClasses } from '../../../context/ThemeContext';
import { useQueryState } from '../../../hooks/useQueryState';

// Custom Hooks
import { useCampaigns } from './hooks/useCampaigns';

// Sub-components & Modals
import CampaignStats from './components/CampaignStats';
import CampaignToolbar from './components/CampaignToolbar';
import CampaignExpandedRow from './components/CampaignExpandedRow';
import DeleteWarningModal from './components/DeleteWarningModal';
import CampaignCreateModal from './components/CampaignCreateModal';
import CampaignEditModal from './components/CampaignEditModal';

// Reusable DataTable
import DataTable from '../../../components/common/table/DataTable';
import ActionDropdown from '../../../components/common/table/ActionDropdown';

function CampaignThumbnail({ src, name }) {
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

function StatusPill({ status }) {
    const isActive = status === 'active';
    return (
        <span
            className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border ${
                isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/60'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}

function CampaignRowActions({ campaign, actions }) {
    return (
        <ActionDropdown>
            {({ close }) => (
                <>
                    <button
                        type="button"
                        onClick={() => {
                            close();
                            actions.setEditId(campaign._id);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        Edit
                    </button>

                    <div className="my-1 border-t border-slate-100" />

                    <button
                        type="button"
                        onClick={() => {
                            close();
                            actions.setDeleteTarget(campaign);
                        }}
                        className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 cursor-pointer transition-colors"
                    >
                        Delete
                    </button>
                </>
            )}
        </ActionDropdown>
    );
}

export default function CampaignPage() {
    const tc = useThemeClasses();
    const campaignsState = useCampaigns();
    const actions = campaignsState;
    const { modal, step, openModal, closeModal, setStep } = useQueryState();

    const {
        campaigns,
        pagination,
        isLoading,
        isError,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        selectedCampaign,
        setSelectedCampaign,
        clearFilters,
    } = campaignsState;

    const columns = [
        {
            header: 'Campaign',
            className: 'w-[24%]',
            render: (c, isExpanded) => (
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
                    <CampaignThumbnail src={c.imageUrl} name={c.name} />
                    <span className="font-semibold text-slate-900 truncate text-xs">{c.name}</span>
                </div>
            )
        },
        {
            header: 'Category',
            className: 'w-[12%]',
            render: (c) => (
                <span className="capitalize text-slate-600 text-xs font-medium">
                    {c.category}
                </span>
            )
        },
        {
            header: 'Model',
            className: 'w-[9%]',
            align: 'center',
            render: (c) => (
                <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60 uppercase tracking-wider">
                    {c.model || 'CPI'}
                </span>
            )
        },
        {
            header: 'Events',
            className: 'w-[8%]',
            align: 'center',
            render: (c) => (
                <span className="text-xs font-semibold text-slate-700 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200/60">
                    {c.events?.length ?? 0}
                </span>
            )
        },
        {
            header: 'Payout',
            className: 'w-[12%]',
            align: 'right',
            render: (c) => (
                <span className="font-bold text-emerald-600 text-xs">
                    ₹{(c.totalAdvertiserPayout ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
            )
        },
        {
            header: 'Approval',
            className: 'w-[11%]',
            align: 'center',
            render: (c) => (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-[11px] font-medium border border-slate-200 bg-slate-50 text-slate-700">
                    {c.conversionApproval === 'manual' || c.needApproval ? 'Manual' : 'Auto'}
                </span>
            )
        },
        {
            header: 'Created',
            className: 'w-[10%]',
            align: 'center',
            render: (c) => (
                <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <CalendarIcon size={13} className="text-slate-400 shrink-0" />
                    {c.createdAt ? c.createdAt.slice(0, 10) : '—'}
                </span>
            )
        },
        {
            header: 'Status',
            className: 'w-[8%]',
            align: 'center',
            render: (c) => <StatusPill status={c.status} />
        },
        {
            header: 'Actions',
            className: 'w-[6%] pr-6',
            align: 'right',
            render: (c) => <CampaignRowActions campaign={c} actions={actions} />
        }
    ];

    return (
        <div className="w-full text-slate-900">
            <div className="w-full max-w-[1600px] mx-auto space-y-5 p-4 sm:p-6 lg:p-8">
                {/* Clean Minimal Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Campaigns</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                            Manage advertiser deals and direct Telegram tasks · {pagination.total ?? 0} total
                        </p>
                    </div>

                    <button
                        onClick={() => openModal('create-campaign', { step: 1 })}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer self-start sm:self-auto"
                    >
                        <PlusIcon size={14} />
                        New Campaign
                    </button>
                </div>

                {/* Stats Cards Row */}
                <CampaignStats total={pagination.total} campaigns={campaigns} />

                {/* Clean Filters Toolbar */}
                <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-xs">
                    <CampaignToolbar
                        selectedCampaign={selectedCampaign}
                        onSelectCampaign={(c) => { setSelectedCampaign(c); setSearch(''); setPage(1); }}
                        onClearCampaign={() => { setSelectedCampaign(null); setPage(1); }}
                        filterStatus={filterStatus}
                        onChangeStatus={(val) => { setFilterStatus(val); setPage(1); }}
                        filterCategory={filterCategory}
                        onChangeCategory={(val) => { setFilterCategory(val); setPage(1); }}
                        tc={tc}
                    />
                </div>

                {/* Error Banner */}
                {isError && (
                    <div className="p-4 rounded-xl border border-rose-200 bg-rose-50 text-rose-700 text-xs font-medium flex items-center justify-between">
                        <span>Failed to load campaigns. Please verify network or login.</span>
                        <button
                            onClick={clearFilters}
                            className="underline font-semibold hover:text-rose-900"
                        >
                            Reset filters
                        </button>
                    </div>
                )}

                {/* Reusable Data Table with Integrated Bottom Pagination */}
                <DataTable
                    columns={columns}
                    data={campaigns}
                    isLoading={isLoading}
                    emptyMessage="No campaigns found matching your criteria."
                    onRowClick={actions.toggleRow}
                    expandedRowId={actions.expandedId}
                    renderExpandedRow={(c) => <CampaignExpandedRow campaign={c} tc={tc} />}
                    pagination={{
                        page,
                        totalPages: pagination.totalPages ?? 1,
                        pageSize: limit,
                        total: pagination.total ?? 0,
                        onPageChange: setPage,
                        onPageSizeChange: setLimit,
                    }}
                />

                {/* Modals */}
                {actions.editId && (
                    <CampaignEditModal
                        campaignId={actions.editId}
                        onClose={() => { actions.setEditId(null); campaignsState.refetch(); }}
                    />
                )}

                {modal === 'create-campaign' && (
                    <CampaignCreateModal
                        currentStep={step}
                        onStepChange={setStep}
                        onClose={() => { closeModal(); campaignsState.refetch(); }}
                    />
                )}

                {actions.deleteTarget && (
                    <DeleteWarningModal
                        name={actions.deleteTarget.name}
                        isLoading={actions.isDeleting}
                        onConfirm={() => actions.handleDelete(actions.deleteTarget._id)}
                        onCancel={() => actions.setDeleteTarget(null)}
                        tc={tc}
                    />
                )}
            </div>
        </div>
    );
}
