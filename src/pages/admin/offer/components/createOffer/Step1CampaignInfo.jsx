import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getAvailableCampaigns, getCampaignById } from '../../../../../services/AppService';
import { LayersIcon } from '../../../../../components/common/Icons';

export default function Step1CampaignInfo({ form, onChange, prefillCampaignId, onCampaignLoaded }) {
    const { data: availableData, isLoading: loadingCampaigns } = useQuery({
        queryKey: ['campaigns-available'],
        queryFn: () => getAvailableCampaigns().then((r) => r.data?.data?.campaigns ?? []),
    });

    const campaigns = availableData ?? [];

    const { data: campaignDetail, isLoading: loadingDetail } = useQuery({
        queryKey: ['campaign-detail', form.campaignId],
        queryFn: () =>
            form.campaignId
                ? getCampaignById(form.campaignId).then((r) => r.data?.data?.campaign ?? r.data?.data)
                : null,
        enabled: !!form.campaignId,
    });

    useEffect(() => {
        if (campaignDetail) onCampaignLoaded(campaignDetail);
    }, [campaignDetail, onCampaignLoaded]);

    return (
        <div className="space-y-5">
            {/* 1. Campaign Picker */}
            <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    Select Linked Campaign <span className="text-rose-500">*</span>
                </label>
                <select
                    value={form.campaignId}
                    onChange={(e) => onChange('campaignId', e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors shadow-2xs"
                    disabled={loadingCampaigns}
                >
                    <option value="">— Select an available campaign —</option>
                    {campaigns.map((c) => (
                        <option key={c._id} value={c._id}>
                            {c.name} ({c.category || 'General'} · {c.model || 'CPA'})
                        </option>
                    ))}
                    {prefillCampaignId && !campaigns.find((c) => c._id === prefillCampaignId) && campaignDetail && (
                        <option value={campaignDetail._id}>{campaignDetail.name}</option>
                    )}
                </select>
                <p className="mt-1 text-[11px] text-slate-500">
                    Only campaigns without an active offer are displayed.
                </p>
            </div>

            {/* Campaign Live Preview Card */}
            {campaignDetail && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                        {campaignDetail.imageUrl ? (
                            <img
                                src={campaignDetail.imageUrl}
                                alt=""
                                className="w-10 h-10 rounded-lg object-cover bg-white border border-slate-200 shrink-0"
                            />
                        ) : (
                            <div className="w-10 h-10 rounded-lg bg-slate-200 flex items-center justify-center text-slate-600 shrink-0">
                                <LayersIcon size={18} />
                            </div>
                        )}
                        <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-900 truncate">{campaignDetail.name}</p>
                            <p className="text-[11px] text-slate-500 font-medium capitalize mt-0.5">
                                {campaignDetail.category || 'General'} · Model: <span className="uppercase font-semibold text-slate-700">{campaignDetail.model || 'CPI'}</span>
                            </p>
                        </div>
                    </div>

                    <div className="text-right shrink-0">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                            Advertiser Payout
                        </span>
                        <span className="text-xs font-black text-emerald-600 font-mono">
                            ₹{campaignDetail.totalAdvertiserPayout ?? 0}
                        </span>
                    </div>
                </div>
            )}

            {/* 2. Offer Name */}
            <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    Offer Title <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    value={form.offerName || ''}
                    onChange={(e) => onChange('offerName', e.target.value)}
                    placeholder="e.g. PhonePe UPI & Payment App"
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors shadow-2xs"
                />
            </div>

            {/* 3. Payout Comment / Hook */}
            <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    User Payout Hook / Summary <span className="text-rose-500">*</span>
                </label>
                <input
                    type="text"
                    value={form.comment || ''}
                    onChange={(e) => onChange('comment', e.target.value)}
                    placeholder="e.g. Install and register with Aadhaar KYC"
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors shadow-2xs"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                    Short description displayed on deal cards in the user app.
                </p>
            </div>

            {/* 4. Priority & Initial Status */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                        Display Priority
                    </label>
                    <input
                        type="number"
                        min="1"
                        max="999"
                        value={form.priority ?? 1}
                        onChange={(e) => onChange('priority', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-500 transition-colors shadow-2xs"
                    />
                    <p className="mt-1 text-[11px] text-slate-500">
                        Higher number puts the deal higher in the listing.
                    </p>
                </div>

                <div>
                    <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                        Status
                    </label>
                    <select
                        value={form.status || 'active'}
                        onChange={(e) => onChange('status', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 focus:outline-none focus:border-slate-500 transition-colors cursor-pointer shadow-2xs"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="paused">Paused</option>
                        <option value="expired">Expired</option>
                    </select>
                </div>
            </div>
        </div>
    );
}
