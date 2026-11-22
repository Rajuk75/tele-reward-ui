import React from 'react';
import {
    LinkIcon,
    TargetIcon,
    ActivityIcon,
    ShieldIcon,
    ArrowUpRightIcon
} from '../../../../components/common/Icons';

export default function OfferExpandedRow({ offer: o }) {
    const events = Array.isArray(o.events) ? o.events : [];

    return (
        <div
            className="px-6 py-4 bg-slate-100/70 select-text text-slate-900"
            onClick={(e) => e.stopPropagation()}
        >
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start divide-y lg:divide-y-0 lg:divide-x divide-slate-200">
                {/* 1. DETAILS & CONTENT */}
                <div className="lg:col-span-5 space-y-2.5">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <LinkIcon size={14} className="text-slate-700" />
                        <span>DETAILS & CONTENT</span>
                    </div>

                    <div>
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                            Payout Hook Summary
                        </span>
                        <p className="text-xs text-slate-800 leading-relaxed font-medium mt-0.5">
                            {o.comment || 'No summary provided.'}
                        </p>
                    </div>

                    {o.steps && (
                        <div className="pt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Completion Steps
                            </span>
                            <p className="text-xs text-slate-700 leading-relaxed font-normal mt-0.5 whitespace-pre-line">
                                {o.steps}
                            </p>
                        </div>
                    )}

                    {o.termsAndConditions && (
                        <div className="pt-1">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                                Terms & Conditions
                            </span>
                            <p className="text-xs text-slate-600 leading-relaxed font-normal mt-0.5 line-clamp-3" title={o.termsAndConditions}>
                                {o.termsAndConditions}
                            </p>
                        </div>
                    )}

                    {o.backgroundImage && (
                        <div className="pt-1 flex items-center gap-3">
                            <span className="text-[11px] font-medium text-slate-500">Banner</span>
                            <a
                                href={o.backgroundImage}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-xs font-semibold text-slate-800 hover:text-emerald-700 hover:underline"
                            >
                                <span>View banner</span>
                                <ArrowUpRightIcon size={12} />
                            </a>
                        </div>
                    )}
                </div>

                {/* 2. USER PAYOUTS & EVENTS */}
                <div className="lg:col-span-3 lg:pl-6 space-y-2 pt-4 lg:pt-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <TargetIcon size={14} className="text-slate-700" />
                        <span>USER PAYOUTS ({events.length})</span>
                    </div>

                    {events.length > 0 ? (
                        <div className="space-y-3 pt-0.5">
                            {events.map((ev, idx) => (
                                <div key={ev._id || idx} className="space-y-1">
                                    <p className="text-xs font-bold text-slate-900 truncate" title={ev.campaignEventId?.name || ev.eventName}>
                                        {ev.campaignEventId?.name || ev.eventName || `Milestone ${idx + 1}`}
                                    </p>
                                    <div className="flex items-center gap-1.5 text-xs font-medium text-slate-600">
                                        <ActivityIcon size={12} className="text-slate-500 shrink-0" />
                                        <span>Order: <strong className="text-slate-900 font-semibold">{ev.campaignEventId?.order ?? ev.order ?? idx + 1}</strong></span>
                                    </div>
                                    <p className="text-xs font-bold text-emerald-600">
                                        ₹{(ev.userPayout ?? ev.payout ?? 0).toFixed(2)}{' '}
                                        <span className="text-[11px] font-normal text-slate-500">user reward</span>
                                    </p>
                                    <p className="text-xs text-slate-600">
                                        Advertiser payout {ev.campaignEventId?.advertiserPayout == null
                                            ? '—' : `₹${ev.campaignEventId.advertiserPayout.toFixed(2)}`}
                                    </p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic pt-1">No payout events configured.</p>
                    )}
                </div>

                {/* 3. RULES & CONFIGURATION */}
                <div className="lg:col-span-4 lg:pl-6 space-y-2 pt-4 lg:pt-0">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                        <ShieldIcon size={14} className="text-slate-700" />
                        <span>QUALITY & CALLBACK RULES</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-1 text-xs">
                        {/* Left sub-column */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">One UPI Limit</span>
                                <strong className="text-slate-900 font-bold">{o.oneUpiOneTime ? 'Enabled' : 'Disabled'}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Public App</span>
                                <strong className="text-slate-900 font-bold">{o.offerDisplay ? 'Visible' : 'Hidden'}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Jumper</span>
                                <strong className="text-slate-900 font-bold">
                                    {o.jumperEnabled ? `${o.jumperRatio ?? 0}%` : 'Disabled'}
                                </strong>
                            </div>
                        </div>

                        {/* Right sub-column with vertical separator */}
                        <div className="space-y-2 pl-4 border-l border-slate-200">
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Priority</span>
                                <strong className="text-slate-900 font-bold">{o.priority ?? 1}</strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Inputs</span>
                                <strong className="text-slate-900 font-bold">
                                    {o.inputEnabled ? `${o.inputs?.length || 0} fields` : 'None'}
                                </strong>
                            </div>
                            <div className="flex items-center justify-between gap-2">
                                <span className="text-slate-500 font-medium whitespace-nowrap">Status</span>
                                <strong className="text-slate-900 font-bold capitalize">{o.status || 'Active'}</strong>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
