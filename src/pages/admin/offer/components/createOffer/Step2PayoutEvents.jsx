import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignById } from '../../../../../services/AppService';
import { ActivityIcon, ShieldIcon } from '../../../../../components/common/Icons';

export default function Step2PayoutEvents({ form, onChange }) {
    const { data: campaignDetail } = useQuery({
        queryKey: ['campaign-detail', form.campaignId],
        queryFn: () =>
            form.campaignId
                ? getCampaignById(form.campaignId).then((r) => r.data?.data?.campaign ?? r.data?.data)
                : null,
        enabled: !!form.campaignId,
    });

    const events = Array.isArray(form.events) ? form.events : [];

    const handleToggleSelected = (index, val) => {
        const next = [...events];
        next[index] = { ...next[index], selected: val };
        onChange('events', next);
    };

    const handlePayoutChange = (index, val) => {
        const next = [...events];
        next[index] = { ...next[index], payout: val };
        onChange('events', next);
    };

    const totalUserPayout = events
        .filter((e) => e.selected)
        .reduce((sum, e) => sum + (Number(e.payout) || 0), 0);

    const totalAdvPayout = campaignDetail?.totalAdvertiserPayout ?? 0;
    const totalMargin = totalAdvPayout - totalUserPayout;

    return (
        <div className="space-y-4">
            {/* Header info bar */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Payout Summary
                    </h4>
                    <p className="text-[11px] text-slate-500">
                        Set user reward for each event.
                    </p>
                </div>

                <div className="flex items-center gap-3 text-xs">
                    <div className="text-right">
                        <span className="text-[10px] font-bold text-slate-400 block uppercase">Total User Payout</span>
                        <span className="font-mono font-bold text-slate-900">₹{totalUserPayout.toFixed(2)}</span>
                    </div>
                    {totalAdvPayout > 0 && (
                        <div className="text-right pl-3 border-l border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 block uppercase">Net Profit Margin</span>
                            <span className={`font-mono font-bold ${totalMargin >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                {totalMargin >= 0 ? `+₹${totalMargin.toFixed(2)}` : `-₹${Math.abs(totalMargin).toFixed(2)}`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Events list */}
            {events.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-500 rounded-xl bg-slate-50 border border-dashed border-slate-300">
                    No conversion events found for this campaign. Please ensure the campaign has at least one event.
                </div>
            ) : (
                <div className="space-y-3">
                    {events.map((ev, i) => {
                        const campEvt = campaignDetail?.events?.find((e) => e._id === ev.campaignEventId);
                        const advPayout = campEvt?.advertiserPayout ?? 0;
                        const userPayoutNum = Number(ev.payout) || 0;
                        const eventMargin = advPayout - userPayoutNum;

                        return (
                            <div
                                key={ev.campaignEventId}
                                className={`p-4 rounded-xl border transition-all ${
                                    ev.selected
                                        ? 'bg-white border-slate-300 shadow-2xs'
                                        : 'bg-slate-50/60 border-slate-200 opacity-60'
                                }`}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                    {/* Left side: Checkbox + Event info */}
                                    <div className="flex items-start gap-3 min-w-0">
                                        <input
                                            type="checkbox"
                                            aria-label={`Include ${ev.eventName}`}
                                            checked={!!ev.selected}
                                            onChange={(e) => handleToggleSelected(i, e.target.checked)}
                                            className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                                        />

                                        <div className="min-w-0">
                                            <div className="flex items-center gap-2">
                                                <span className="w-5 h-5 rounded bg-slate-100 text-slate-800 text-[10px] font-bold font-mono flex items-center justify-center">
                                                    {String(ev.order || i + 1).padStart(2, '0')}
                                                </span>
                                                <p className="text-xs font-bold text-slate-900 truncate">
                                                    {ev.eventName || `Event ${i + 1}`}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px] text-slate-500">
                                                {campEvt?.cap && (
                                                    <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                                                        <ActivityIcon size={11} />
                                                        Cap: {campEvt.cap}
                                                    </span>
                                                )}

                                                <span className="font-semibold text-slate-600 font-mono">
                                                    Advertiser: ₹{advPayout.toFixed(2)}
                                                </span>

                                                {campEvt?.proofRequired && (
                                                    <span className="inline-flex items-center gap-1 font-bold text-amber-800 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                                                        <ShieldIcon size={11} />
                                                        Proof Required
                                                    </span>
                                                )}
                                            </div>

                                            {campEvt?.proofInstructions && (
                                                <p className="mt-2 text-[11px] text-amber-900 bg-amber-50/60 p-2 rounded border border-amber-100 leading-relaxed">
                                                    <strong>Proof Instructions:</strong> {campEvt.proofInstructions}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Right side: User Payout input */}
                                    {ev.selected && (
                                        <div className="sm:text-right sm:w-36 sm:shrink-0 min-w-0 pl-7 sm:pl-0">
                                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                                User Payout (₹) <span className="text-rose-500">*</span>
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    inputMode="decimal"
                                                    pattern="([0-9]+(\.[0-9]{0,2})?|\.[0-9]{1,2})"
                                                    aria-label={`User payout for ${ev.eventName}`}
                                                    value={ev.payout}
                                                    onChange={(e) => handlePayoutChange(i, e.target.value)}
                                                    placeholder="0.00"
                                                    className="w-full px-3 py-1.5 text-xs font-mono font-bold text-slate-900 rounded-lg bg-white border border-slate-300 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 text-right"
                                                />
                                            </div>

                                            {userPayoutNum > 0 && (
                                                <div className="mt-1 text-[11px] font-semibold">
                                                    {eventMargin >= 0 ? (
                                                        <span className="text-emerald-600 font-mono">
                                                            Margin: +₹{eventMargin.toFixed(2)}
                                                        </span>
                                                    ) : (
                                                        <span className="text-rose-600 font-mono">
                                                            Loss: -₹{Math.abs(eventMargin).toFixed(2)}
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
