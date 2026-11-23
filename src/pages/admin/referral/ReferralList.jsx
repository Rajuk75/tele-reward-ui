import React from 'react';
import { 
    FiCopy, 
    FiCheck, 
    FiTrash2, 
    FiPauseCircle, 
    FiPlayCircle,
    FiUser,
    FiMail,
    FiPhone,
    FiLayers
} from 'react-icons/fi';

// Custom Hook
import { useReferrals } from './hooks/useReferrals';

// Sub-components & Modals
import ReferralStats from './components/ReferralStats';
import ReferralToolbar from './components/ReferralToolbar';
import CreateReferralModal from './components/CreateReferralModal';
import CreatePartnerModal from './components/CreatePartnerModal';
import DeleteReferralModal from './components/DeleteReferralModal';

// Reusable DataTable
import DataTable from '../../../components/common/table/DataTable';

function StatusText({ status }) {
    const st = (status || 'active').toLowerCase();
    if (st === 'active') {
        return (
            <span className="font-bold text-xs text-emerald-600 capitalize">
                Active
            </span>
        );
    }
    if (st === 'paused') {
        return (
            <span className="font-bold text-xs text-amber-600 capitalize">
                Paused
            </span>
        );
    }
    return (
        <span className="font-bold text-xs text-rose-600 capitalize">
            Expired
        </span>
    );
}

export default function ReferralList() {
    const {
        referrals,
        pagination,
        stats,
        partners,
        offers,
        isLoading,
        isError,
        isLoadingPartners,
        isLoadingOffers,

        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        status,
        setStatus,
        clearFilters,
        hasActiveFilters,

        isCreateReferralOpen,
        setIsCreateReferralOpen,
        isCreatePartnerOpen,
        setIsCreatePartnerOpen,
        deleteTarget,
        setDeleteTarget,

        isDeleting,
        isSubmittingReferral,
        isSubmittingPartner,
        copiedCode,

        handleDelete,
        handleToggleStatus,
        handleCreateReferral,
        handleCreatePartner,
        copyToClipboard,
    } = useReferrals();

    // Table Columns Configuration
    const columns = [
        {
            header: 'Partner Details',
            className: 'w-[25%]',
            render: (row) => {
                const partner = row.partner || row.partnerId;
                const name = partner?.name || 'Unknown Partner';
                const category = partner?.category || 'affiliate';
                const email = partner?.email || '-';
                const phone = partner?.phone || null;

                return (
                    <div className="flex flex-col gap-0.5 py-0.5 min-w-0">
                        {/* # Category above name */}
                        <span className="text-[10px] font-medium text-slate-500">
                            #{category.toLowerCase()}
                        </span>

                        {/* Name with User Icon */}
                        <div className="flex items-center gap-1.5">
                            <FiUser size={12} className="text-slate-600 shrink-0" />
                            <span className="font-bold text-slate-900 text-xs truncate max-w-[180px]" title={name}>
                                {name}
                            </span>
                        </div>

                        {/* Email with Email Icon */}
                        <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                            <FiMail size={11} className="text-slate-500 shrink-0" />
                            <span className="truncate max-w-[180px]" title={email}>
                                {email}
                            </span>
                        </div>

                        {/* Mobile with Phone Icon */}
                        {phone && (
                            <div className="flex items-center gap-1.5 text-[11px] font-medium text-slate-600">
                                <FiPhone size={11} className="text-slate-500 shrink-0" />
                                <span className="font-mono text-slate-700">
                                    {phone}
                                </span>
                            </div>
                        )}
                    </div>
                );
            },
        },
        {
            header: 'Offer Details',
            className: 'w-[20%]',
            render: (row) => {
                const offer = row.offer;
                const offerName = offer?.offerName || 'Unknown Offer';
                const campaignName = offer?.campaignId?.name || (typeof offer?.campaignId === 'string' ? offer.campaignId : '') || 'General Campaign';

                return (
                    <div className="flex flex-col gap-1 py-0.5 min-w-0">
                        {/* Offer Name with Icon */}
                        <div className="flex items-center gap-1.5">
                            <FiLayers size={13} className="text-slate-700 shrink-0" />
                            <span className="font-bold text-slate-900 text-xs truncate max-w-[190px]" title={offerName}>
                                {offerName}
                            </span>
                        </div>

                        {/* Campaign Name */}
                        <span className="text-[11px] font-medium text-slate-600 truncate max-w-[190px] pl-5" title={campaignName}>
                            {campaignName}
                        </span>
                    </div>
                );
            },
        },
        {
            header: 'Referral Link',
            className: 'w-[22%]',
            render: (row) => {
                const isCopied = copiedCode === row.referralCode;
                const shareUrl = row.shareUrl || `https://t.me/share/url?url=${row.referralCode}`;

                return (
                    <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-300 truncate max-w-[130px]" title={row.referralCode}>
                            {row.referralCode}
                        </span>
                        <button
                            type="button"
                            onClick={() => copyToClipboard(shareUrl, row.referralCode)}
                            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                isCopied
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-300'
                                    : 'text-slate-700 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
                            }`}
                            title="Copy Referral Link"
                        >
                            {isCopied ? <FiCheck size={13} className="text-emerald-700 stroke-[2.5]" /> : <FiCopy size={13} />}
                        </button>
                    </div>
                );
            },
        },
        {
            header: 'Split %',
            className: 'w-[10%]',
            align: 'center',
            render: (row) => {
                const referrerPct = row.referrerPercent ?? 30;
                const refereePct = 100 - referrerPct;
                return (
                    <div className="flex flex-col items-center gap-0.5 font-mono">
                        <span className="text-xs font-bold text-slate-900">
                            {referrerPct}% <span className="text-slate-500 font-semibold text-[11px]">/ {refereePct}%</span>
                        </span>
                        <span className="text-[10px] font-semibold text-slate-600 font-sans">Partner / User</span>
                    </div>
                );
            },
        },
        {
            header: 'Clicks',
            className: 'w-[7%]',
            align: 'center',
            render: (row) => (
                <span className="font-mono text-xs font-bold text-slate-900">
                    {(row.totalClicks || 0).toLocaleString()}
                </span>
            ),
        },
        {
            header: 'Conversions',
            className: 'w-[8%]',
            align: 'center',
            render: (row) => (
                <span className="font-mono text-xs font-bold text-slate-900">
                    {(row.totalConversions || 0).toLocaleString()}
                </span>
            ),
        },
        {
            header: 'Status',
            className: 'w-[8%]',
            align: 'center',
            render: (row) => <StatusText status={row.status} />,
        },
        {
            header: 'Actions',
            className: 'w-[8%]',
            align: 'right',
            render: (row) => (
                <div className="flex items-center justify-end gap-1">
                    <button
                        type="button"
                        onClick={() => handleToggleStatus(row)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                            row.status === 'active'
                                ? 'text-amber-700 border-amber-300 hover:bg-amber-50'
                                : 'text-emerald-700 border-emerald-300 hover:bg-emerald-50'
                        }`}
                        title={row.status === 'active' ? 'Pause link' : 'Activate link'}
                    >
                        {row.status === 'active' ? <FiPauseCircle size={15} /> : <FiPlayCircle size={15} />}
                    </button>
                    <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="p-1.5 text-rose-600 hover:text-rose-800 hover:bg-rose-50 border border-transparent hover:border-rose-300 rounded-lg transition-colors cursor-pointer"
                        title="Delete referral link"
                    >
                        <FiTrash2 size={15} />
                    </button>
                </div>
            ),
        },
    ];

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900">
            <div className="max-w-[1600px] mx-auto space-y-6 p-4 sm:p-6 lg:p-8 xl:px-10">
                {/* Page Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                            Manage Partner & Referrers
                        </h1>
                        <p className="text-xs font-medium text-slate-600 mt-1">
                            Affiliate partners, referral links, custom commission split, and attribution stats.
                        </p>
                    </div>
                </div>

                {/* Top Summary Stats */}
                <ReferralStats stats={stats} isLoading={isLoading} />

                {/* Toolbar (Search, Filter, Actions) */}
                <ReferralToolbar
                    search={search}
                    onSearchChange={setSearch}
                    status={status}
                    onStatusChange={setStatus}
                    onClearFilters={clearFilters}
                    hasActiveFilters={hasActiveFilters}
                    onAddPartnerClick={() => setIsCreatePartnerOpen(true)}
                    onCreateReferralClick={() => setIsCreateReferralOpen(true)}
                />

                {/* Referrals Data Table */}
                <DataTable
                    columns={columns}
                    data={referrals}
                    isLoading={isLoading}
                    emptyMessage={
                        isError
                            ? 'Failed to load referral links. Please try refreshing.'
                            : 'No referral links found matching your filters.'
                    }
                    keyExtractor={(row) => row.id || row._id}
                    pagination={{
                        page,
                        totalPages: pagination.totalPages ?? Math.max(1, Math.ceil((pagination.total || referrals.length || 1) / limit)),
                        pageSize: limit,
                        total: pagination.total ?? referrals.length ?? 0,
                        onPageChange: setPage,
                        onPageSizeChange: setLimit,
                    }}
                />
            </div>

            {/* Create Referral Modal */}
            <CreateReferralModal
                isOpen={isCreateReferralOpen}
                onClose={() => setIsCreateReferralOpen(false)}
                onSubmit={handleCreateReferral}
                isSubmitting={isSubmittingReferral}
                partners={partners}
                isLoadingPartners={isLoadingPartners}
                offers={offers}
                isLoadingOffers={isLoadingOffers}
                onOpenPartnerModal={() => setIsCreatePartnerOpen(true)}
            />

            {/* Create Partner Modal */}
            <CreatePartnerModal
                isOpen={isCreatePartnerOpen}
                onClose={() => setIsCreatePartnerOpen(false)}
                onSubmit={handleCreatePartner}
                isSubmitting={isSubmittingPartner}
            />

            {/* Delete Referral Confirmation Modal */}
            <DeleteReferralModal
                referral={deleteTarget}
                onConfirm={() => handleDelete(deleteTarget?.id || deleteTarget?._id)}
                onCancel={() => setDeleteTarget(null)}
                isDeleting={isDeleting}
            />
        </div>
    );
}
