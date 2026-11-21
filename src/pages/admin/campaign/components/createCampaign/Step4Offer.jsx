import React from 'react';
import { FiCheck } from 'react-icons/fi';

export default function Step4Offer({ form, onChange }) {
    const totalAdvertiserPayout = (form.events || []).reduce(
        (sum, e) => sum + (Number(e.payout) || 0),
        0
    );
    const userPayout = Number(form.userPayout) || 0;
    const margin = totalAdvertiserPayout - userPayout;

    const togglePlatform = (platform) => {
        const current = form.platforms || ['telegram'];
        if (current.includes(platform)) {
            if (current.length > 1) {
                onChange('platforms', current.filter((p) => p !== platform));
            }
        } else {
            onChange('platforms', [...current, platform]);
        }
    };

    const isPlatformActive = (platform) => (form.platforms || ['telegram']).includes(platform);

    return (
        <div className="space-y-5 animate-in fade-in duration-200">
            {/* Master Toggle */}
            <div className="flex items-center justify-between gap-5 rounded-xl border border-slate-200 bg-slate-50/50 p-4">
                <div>
                    <p className="text-sm font-semibold text-slate-900">
                        Publish as Live Offer for Users
                    </p>
                    <p className="mt-0.5 text-xs leading-5 text-slate-500">
                        Automatically creates a user-facing offer linked to this campaign.
                    </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input
                        type="checkbox"
                        checked={form.autoCreateOffer}
                        onChange={(e) => onChange('autoCreateOffer', e.target.checked)}
                        className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
            </div>

            {form.autoCreateOffer ? (
                <div className="space-y-4 pt-1">
                    {/* Simple Margin Summary */}
                    <div className="grid grid-cols-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-center">
                        <div>
                            <span className="block text-[11px] text-slate-500">Advertiser pays</span>
                            <span className="text-sm font-semibold text-slate-900">₹{totalAdvertiserPayout.toLocaleString('en-IN')}</span>
                        </div>
                        <div className="border-x border-slate-200">
                            <span className="block text-[11px] font-medium text-indigo-600">User gets</span>
                            <span className="text-sm font-semibold text-indigo-600">₹{userPayout.toLocaleString('en-IN')}</span>
                        </div>
                        <div>
                            <span className="block text-[11px] font-medium text-emerald-600">Your margin</span>
                            <span className={`text-sm font-semibold ${margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                ₹{margin.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>

                    {/* User Reward Input */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                            User Reward / Payout (₹) <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="number"
                            min="0"
                            step="0.01"
                            required={form.autoCreateOffer}
                            value={form.userPayout}
                            onChange={(e) => onChange('userPayout', e.target.value)}
                            placeholder="e.g. 100"
                            className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                        />
                    </div>

                    {/* Distribution Platforms */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                            Distribution Platforms
                        </label>
                        <div className="grid grid-cols-3 gap-2.5">
                            <button
                                type="button"
                                onClick={() => togglePlatform('telegram')}
                                className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                    isPlatformActive('telegram')
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                Telegram Bot
                                {isPlatformActive('telegram') && <FiCheck className="text-indigo-600" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => togglePlatform('app')}
                                className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                    isPlatformActive('app')
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                Mobile App
                                {isPlatformActive('app') && <FiCheck className="text-indigo-600" />}
                            </button>

                            <button
                                type="button"
                                onClick={() => togglePlatform('web')}
                                className={`flex h-10 items-center justify-center gap-1.5 rounded-lg border px-3 text-xs font-semibold transition-colors ${
                                    isPlatformActive('web')
                                        ? 'bg-indigo-50 border-indigo-300 text-indigo-700'
                                        : 'bg-white border-gray-200 text-gray-500 hover:border-gray-300'
                                }`}
                            >
                                Website
                                {isPlatformActive('web') && <FiCheck className="text-indigo-600" />}
                            </button>
                        </div>
                    </div>

                    {/* Task Instructions */}
                    <div>
                        <label className="mb-1.5 block text-xs font-medium text-slate-700">
                            User Instructions (Optional)
                        </label>
                        <textarea
                            rows={3}
                            value={form.offerSteps}
                            onChange={(e) => onChange('offerSteps', e.target.value)}
                            placeholder="1. Download and install app&#10;2. Register with mobile number"
                            className="w-full resize-none rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                        />
                    </div>
                </div>
            ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-6 text-center text-xs text-slate-500">
                    Offer auto-creation is disabled. Only the Campaign will be created.
                </div>
            )}
        </div>
    );
}
