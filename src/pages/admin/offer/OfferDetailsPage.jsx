import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getOfferById } from '../../../services/AppService';
import { showSuccess, showError } from '../../../components/Toastify/Toast';
import {
    LayersIcon,
    CopyIcon,
    CheckIcon,
    DollarIcon,
    ActivityIcon,
    FileTextIcon,
    ShieldIcon,
    LinkIcon,
    TargetIcon,
    CapIcon,
} from '../../../components/common/Icons';

export default function OfferDetailsPage() {
    const { offerId } = useParams();
    const navigate = useNavigate();

    const [offer, setOffer] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedField, setCopiedField] = useState(null);

    useEffect(() => {
        let isMounted = true;
        async function fetchDetails() {
            setIsLoading(true);
            try {
                const response = await getOfferById(offerId);
                if (isMounted) {
                    setOffer(response.data?.data || null);
                }
            } catch (err) {
                console.error('Failed to load offer details:', err);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        }
        if (offerId) {
            fetchDetails();
        }
        return () => {
            isMounted = false;
        };
    }, [offerId]);

    const handleCopy = (text, fieldName) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedField(fieldName);
        showSuccess(`${fieldName} copied to clipboard`);
        setTimeout(() => setCopiedField(null), 2000);
    };

    if (isLoading) {
        return (
            <div className="p-6 md:p-8 space-y-6 max-w-7xl mx-auto animate-pulse">
                <div className="h-6 w-32 bg-slate-200 rounded-md"></div>
                <div className="h-12 w-64 bg-slate-200 rounded-lg"></div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} className="h-28 bg-slate-100 rounded-2xl border border-slate-200"></div>
                    ))}
                </div>
                <div className="h-80 bg-slate-100 rounded-2xl border border-slate-200"></div>
            </div>
        );
    }

    if (!offer) {
        return (
            <div className="p-8 text-center max-w-md mx-auto my-12 bg-white rounded-2xl border border-slate-200 shadow-sm space-y-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold">
                    !
                </div>
                <h2 className="text-base font-bold text-slate-900">Offer Not Found</h2>
                <p className="text-xs text-slate-500">
                    The requested offer could not be loaded or may have been deleted.
                </p>
                <button
                    onClick={() => navigate('/admin/offers')}
                    className="px-4 py-2 text-xs font-semibold bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-colors"
                >
                    Back to Offers List
                </button>
            </div>
        );
    }

    const campaign = offer.campaignId || {};
    const events = Array.isArray(offer.events) ? offer.events : [];
    const totalPayout = events.reduce((sum, e) => sum + Number(e.userPayout || 0), 0);
    const totalCap = events.reduce((sum, e) => sum + Number(e.campaignEventId?.cap || 0), 0);

    const statusBadgeColors = {
        active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        paused: 'bg-amber-50 text-amber-700 border-amber-200',
        inactive: 'bg-slate-100 text-slate-600 border-slate-200',
        expired: 'bg-rose-50 text-rose-700 border-rose-200',
    };

    const taskLink = `${window.location.origin}/task/${offer._id}`;

    return (
        <div className="p-4 sm:p-6 md:p-8 space-y-6 max-w-7xl mx-auto">
            {/* ── Top Bar with Breadcrumb Navigation & Actions ── */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <button
                        onClick={() => navigate('/admin/offers')}
                        className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors mb-2 cursor-pointer"
                    >
                        &larr; Back to Offers
                    </button>
                    <div className="flex flex-wrap items-center gap-2.5">
                        <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">
                            {offer.offerName || 'Untitled Offer'}
                        </h1>
                        <span
                            className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider border ${
                                statusBadgeColors[offer.status] || statusBadgeColors.active
                            }`}
                        >
                            {offer.status || 'Active'}
                        </span>
                        {offer.offerId && (
                            <span className="font-mono text-xs px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md border border-slate-200 font-semibold">
                                ID: {offer.offerId}
                            </span>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => handleCopy(taskLink, 'Task Link')}
                        className="px-3.5 py-2 text-xs font-semibold border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                        {copiedField === 'Task Link' ? <CheckIcon size={14} className="text-emerald-600" /> : <CopyIcon size={14} />}
                        <span>Copy Task Link</span>
                    </button>
                    <button
                        onClick={() => navigate(`/admin/offers/${offer._id}/edit`)}
                        className="px-4 py-2 text-xs font-bold bg-slate-900 text-white hover:bg-slate-800 rounded-xl transition-all shadow-2xs flex items-center gap-1.5 cursor-pointer"
                    >
                        <span>✏️ Edit Offer</span>
                    </button>
                </div>
            </div>

            {/* ── Stat Metric Cards ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <DollarIcon size={14} className="text-emerald-600" /> Total User Payout
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-emerald-700 tracking-tight">
                        &#8377;{totalPayout.toFixed(2)}
                    </p>
                    <p className="text-[10px] text-slate-400">Sum of all active milestones</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <LayersIcon size={14} className="text-blue-600" /> Category & Model
                    </span>
                    <p className="text-base sm:text-lg font-bold text-slate-900 truncate">
                        {offer.category || campaign.category || 'Standard'} &bull; {offer.model || campaign.model || 'CPA'}
                    </p>
                    <p className="text-[10px] text-slate-400">Campaign classification</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <CapIcon size={14} className="text-purple-600" /> Milestone Cap
                    </span>
                    <p className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                        {totalCap > 0 ? totalCap : 'Unlimited'}
                    </p>
                    <p className="text-[10px] text-slate-400">Aggregated conversion limit</p>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1.5">
                        <ActivityIcon size={14} className="text-amber-600" /> Spin Bonus
                    </span>
                    <p className="text-base sm:text-lg font-bold text-slate-900">
                        {offer.spinSettings?.enabled ? (
                            <span className="text-emerald-600 font-bold">Enabled</span>
                        ) : (
                            <span className="text-slate-400 font-normal">Disabled</span>
                        )}
                    </p>
                    <p className="text-[10px] text-slate-400">
                        {offer.spinSettings?.enabled
                            ? `Slices: ${offer.spinSettings.slices?.join(', ') || 'Default'}`
                            : 'No spin wheel active'}
                    </p>
                </div>
            </div>

            {/* ── Main Content Grid ── */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* ── Left Column (2 Cols): Details, Events, Terms ── */}
                <div className="lg:col-span-2 space-y-6">
                    {/* 1. Campaign Information Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <LayersIcon size={14} className="text-slate-700" /> Linked Campaign Details
                            </h2>
                            {campaign._id && (
                                <Link
                                    to={`/admin/campaigns?search=${encodeURIComponent(campaign.name || '')}`}
                                    className="text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                                >
                                    View Campaign &rarr;
                                </Link>
                            )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                                <span className="text-[11px] font-semibold text-slate-400">Campaign Name</span>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">{campaign.name || 'N/A'}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-semibold text-slate-400">Advertiser / Client</span>
                                <p className="text-sm font-bold text-slate-800 mt-0.5">{campaign.advertiser || 'Direct Advertiser'}</p>
                            </div>
                            <div>
                                <span className="text-[11px] font-semibold text-slate-400">Payout Type & Model</span>
                                <p className="text-sm font-medium text-slate-700 mt-0.5">
                                    {campaign.category || 'General'} &bull; {campaign.model || 'CPA'}
                                </p>
                            </div>
                            <div>
                                <span className="text-[11px] font-semibold text-slate-400">Offer Hook / Description</span>
                                <p className="text-sm font-medium text-slate-700 mt-0.5">{offer.comment || '—'}</p>
                            </div>
                        </div>
                    </div>

                    {/* 2. Payout Events / Milestones Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <TargetIcon size={14} className="text-emerald-700" /> Milestone Events & User Payouts ({events.length})
                            </h2>
                            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                                Total: &#8377;{totalPayout.toFixed(2)}
                            </span>
                        </div>

                        {events.length === 0 ? (
                            <p className="text-xs text-slate-400 py-3 text-center">No milestone events configured for this offer.</p>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {events.map((ev, index) => {
                                    const source = ev.campaignEventId || {};
                                    return (
                                        <div key={ev._id || index} className="py-3.5 flex items-center justify-between gap-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-mono font-bold flex items-center justify-center">
                                                        {source.order || index + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-slate-900">
                                                        {source.name || ev.eventName || `Event #${index + 1}`}
                                                    </span>
                                                    {source.postbackParam && (
                                                        <span className="text-[10px] font-mono text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200/60">
                                                            {source.postbackParam}
                                                        </span>
                                                    )}
                                                </div>
                                                {source.steps && (
                                                    <p className="text-xs text-slate-500 pl-7">{source.steps}</p>
                                                )}
                                                {source.advertiserPayout !== undefined && (
                                                    <p className="text-[11px] text-slate-400 pl-7">
                                                        Advertiser Payout: &#8377;{source.advertiserPayout} &bull; Cap: {source.cap || 'Unlimited'}
                                                    </p>
                                                )}
                                            </div>

                                            <div className="text-right shrink-0">
                                                <span className="text-sm sm:text-base font-extrabold text-emerald-700">
                                                    &#8377;{Number(ev.userPayout || 0).toFixed(2)}
                                                </span>
                                                <span className="block text-[10px] text-slate-400 font-medium">User Reward</span>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* 3. Instructions & Terms Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <FileTextIcon size={14} className="text-slate-700" /> Instructions, Steps & Legal Terms
                            </h2>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <span className="text-xs font-bold text-slate-700 block mb-1">
                                    How to Complete Task (Steps)
                                </span>
                                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed font-mono">
                                    {offer.steps || 'No custom steps specified. User will follow default flow.'}
                                </div>
                            </div>

                            <div>
                                <span className="text-xs font-bold text-slate-700 block mb-1">
                                    Offer Terms & Conditions
                                </span>
                                <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                    {offer.termsAndConditions || 'Standard offer terms and platform compliance apply.'}
                                </div>
                            </div>

                            {offer.referTermsAndConditions && (
                                <div>
                                    <span className="text-xs font-bold text-slate-700 block mb-1">
                                        Referral Program Terms
                                    </span>
                                    <div className="p-3.5 bg-slate-50/80 rounded-xl border border-slate-200/80 text-xs text-slate-700 whitespace-pre-line leading-relaxed">
                                        {offer.referTermsAndConditions}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right Column (1 Col): Controls, Spin Bonus & URLs ── */}
                <div className="space-y-6">
                    {/* 1. Settings & Quality Controls Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <ShieldIcon size={14} className="text-slate-700" /> Rules & Controls
                            </h2>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Priority Ranking</span>
                                <span className="font-bold text-slate-900 font-mono">{offer.priority || 1}</span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">One UPI One Time</span>
                                <span className={`font-bold ${offer.oneUpiOneTime !== false ? 'text-emerald-700' : 'text-slate-500'}`}>
                                    {offer.oneUpiOneTime !== false ? 'Enabled (Restricted)' : 'Disabled (Open)'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between py-1 border-b border-slate-100">
                                <span className="text-slate-500 font-medium">Offer Wall Display</span>
                                <span className={`font-bold ${offer.offerDisplay !== false ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {offer.offerDisplay !== false ? 'Visible' : 'Hidden'}
                                </span>
                            </div>

                            {offer.jumperRatio ? (
                                <div className="space-y-1 py-1">
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-500 font-medium">Jumper Redirection</span>
                                        <span className="font-bold text-amber-700">{offer.jumperRatio}%</span>
                                    </div>
                                    {offer.jumperUrl && (
                                        <p className="text-[10px] text-slate-400 truncate">{offer.jumperUrl}</p>
                                    )}
                                </div>
                            ) : null}
                        </div>
                    </div>

                    {/* 2. Gamification / Spin Wheel Card */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-4">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <ActivityIcon size={14} className="text-amber-600" /> Spin & Win Bonus
                            </h2>
                        </div>

                        <div className="space-y-3 text-xs">
                            <div className="flex items-center justify-between">
                                <span className="text-slate-500 font-medium">Wheel Feature</span>
                                <span className={`font-bold ${offer.spinSettings?.enabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                                    {offer.spinSettings?.enabled ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            {offer.spinSettings?.enabled && (
                                <div>
                                    <span className="text-[11px] font-semibold text-slate-400 block mb-1.5">Configured Bonus Slices:</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {(offer.spinSettings.slices || [5, 10, 15, 20, 25]).map((val, i) => (
                                            <span
                                                key={i}
                                                className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-200/80 font-mono font-bold text-xs"
                                            >
                                                &#8377;{val}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* 3. Postback & Tracking Integration */}
                    <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-2xs space-y-3">
                        <div className="border-b border-slate-100 pb-3">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                                <LinkIcon size={14} className="text-blue-600" /> Integration Postback URL
                            </h2>
                        </div>

                        <p className="text-[11px] text-slate-500 leading-relaxed">
                            Pass this server postback URL to the advertiser network to register conversions:
                        </p>

                        <div className="relative">
                            <div className="p-3 bg-slate-900 text-slate-200 rounded-xl text-[11px] font-mono break-all pr-10 border border-slate-800 select-all">
                                {offer.postbackUrl || `${window.location.origin}/postback?cid={clickId}&secret=${offer.postbackSecretKey || ''}&event={event}`}
                            </div>
                            <button
                                onClick={() => handleCopy(offer.postbackUrl || '', 'Postback URL')}
                                className="absolute top-2.5 right-2.5 p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800 transition-colors cursor-pointer"
                                title="Copy Postback URL"
                            >
                                {copiedField === 'Postback URL' ? <CheckIcon size={14} className="text-emerald-400" /> : <CopyIcon size={14} />}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
