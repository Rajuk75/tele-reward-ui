import React from 'react';
import {
    LinkIcon,
    TargetIcon,
    ActivityIcon,
    ShieldIcon
} from '../../../../components/common/Icons';

export default function CampaignExpandedRow({ campaign: c }) {
    const events = Array.isArray(c.events) ? c.events : [];

    return (
        <div
            className="px-6 py-4 bg-slate-100/70 select-text text-slate-900"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* 1. DETAILS & LINKS */}
                <div className="lg:col-span-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <LinkIcon size={14} className="text-slate-700" />
                        <span>DETAILS & LINKS</span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed font-normal">
                        {c.description || 'No description provided.'}
                    </p>

                    <div className="space-y-2 pt-1">
                        {/* Campaign URL */}
                        <div className="flex items-start gap-3">
                            <span className="text-xs font-medium text-slate-500 w-24 shrink-0 pt-0.5">Campaign URL</span>
                            <span className="text-xs font-mono text-slate-800 break-all select-all flex-1" title={c.campaignUrl}>
                                {c.campaignUrl || 'N/A'}
                            </span>
                        </div>

                        {/* Preview link */}
                        <div className="flex items-start gap-3">
                            <span className="text-xs font-medium text-slate-500 w-24 shrink-0 pt-0.5">Preview link</span>
                            {c.previewUrl ? (
                                <a
                                    href={c.previewUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-xs font-mono text-slate-800 hover:text-emerald-700 hover:underline break-all select-all flex-1"
                                    title={c.previewUrl}
                                >
                                    {c.previewUrl}
                                </a>
                            ) : (
                                <span className="text-xs font-mono text-slate-400">N/A</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 2. CONVERSION EVENT */}
                <div className="lg:col-span-3 lg:pl-6 space-y-2 pt-4 lg:pt-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <TargetIcon size={14} className="text-slate-700" />
                        <span>EVENT</span>
                    </div>

                    {events.length > 0 ? (
                        <div className="space-y-3 pt-0.5">
                            {events.map((ev, idx) => (
                                <div key={ev._id || idx} className="space-y-1">
                                    <p className="text-xs font-bold text-slate-900 truncate" title={ev.name}>
                                        {ev.name || `Event ${idx + 1}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                        <ActivityIcon size={12} className="text-slate-500 shrink-0" />
                                        <span>Cap: <strong className="text-slate-900 font-semibold">{ev.cap ?? '—'}</strong></span>
                                    </div>
                                    <p className="text-xs font-bold text-emerald-600">
                                        ₹{(ev.advertiserPayout ?? 0).toFixed(2)}{' '}
                                        <span className="text-[11px] font-normal text-slate-500">payout</span>
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic pt-1">No events configured.</p>
                    )}
                </div>

                {/* 3. FRAUD RULES */}
                <div className="lg:col-span-4 lg:pl-6 space-y-2 pt-4 lg:pt-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <ShieldIcon size={14} className="text-slate-700" />
                        <span>FRAUD RULES</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1 text-xs">
                        {/* Left sub-column */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Same Click IP</span>
                                <strong className="text-slate-900 font-bold">{c.sameClickIpBlock ? 'Blocked' : 'Allowed'}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Same Conv IP</span>
                                <strong className="text-slate-900 font-bold">{c.sameConversionIpBlock ? 'Blocked' : 'Allowed'}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Conv Delay</span>
                                <strong className="text-slate-900 font-bold">{c.conversionDelayEnabled ? `${c.conversionDelayMinutes} min` : 'Instant'}</strong>
                            </div>
                        </div>

                        {/* Right sub-column with vertical separator */}
                        <div className="space-y-2 pl-4 border-l border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">IP Whitelist</span>
                                <strong className="text-slate-900 font-bold">{c.ipWhitelistEnabled ? `${c.ipWhitelist?.length || 0} IPs` : 'Disabled'}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Shaving</span>
                                <strong className="text-slate-900 font-bold">{c.shaving?.enabled ? `${c.shaving.ratio}%` : 'Disabled'}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Approval</span>
                                <strong className="text-slate-900 font-bold capitalize">{c.conversionApproval ?? 'Automatic'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
