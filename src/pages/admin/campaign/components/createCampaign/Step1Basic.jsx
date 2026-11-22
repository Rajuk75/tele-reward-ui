import React from 'react';

const CATEGORIES = [
    'finance', 'gaming', 'shopping', 'business', 'education', 
    'entertainment', 'fantasy', 'food', 'loan', 'news', 
    'photography', 'productivity', 'travel'
];

const OBJECTIVES = ['CPI', 'CPA', 'CPL', 'CPR', 'CPS', 'CPD', 'CPG', 'CPRT', 'CPT', 'CPV'];

export default function Step1Basic({ form, onChange }) {
    const macros = ['{click_id}', '{user_id}', '{device_id}', '{gaid}', '{source}'];

    const insertMacro = (macro) => {
        const current = form.campaignUrl || '';
        onChange('campaignUrl', current + macro);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* Campaign Name & Status */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="md:col-span-2">
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Campaign Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => onChange('name', e.target.value)}
                        placeholder="e.g. Angel One Demat Account CPI"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    />
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Initial Status
                    </label>
                    <select
                        value={form.status}
                        onChange={(e) => onChange('status', e.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
            </div>

            {/* Category & Model */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Market Category
                    </label>
                    <select
                        value={form.category || ''}
                        onChange={(e) => onChange('category', e.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm capitalize text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    >
                        <option value="" disabled>Select Category</option>
                        {CATEGORIES.map((cat) => (
                            <option key={cat} value={cat} className="capitalize">
                                {cat}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Primary Pricing Model
                    </label>
                    <select
                        value={form.model || ''}
                        onChange={(e) => onChange('model', e.target.value)}
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    >
                        <option value="" disabled>Select Pricing Model</option>
                        {OBJECTIVES.map((mod) => (
                            <option key={mod} value={mod}>
                                {mod}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <label className="block text-xs font-medium text-slate-700">
                Campaign image URL *
                <input type="url" required value={form.imageUrl}
                    onChange={e => onChange('imageUrl', e.target.value)}
                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm" />
            </label>

            {/* Destination Tracking URL */}
            <div className="space-y-2 border-t border-slate-100 pt-5">
                <label className="block text-xs font-medium text-slate-700">
                    Advertiser Destination URL <span className="text-red-500">*</span>
                </label>
                <input
                    type="url"
                    required
                    value={form.campaignUrl}
                    onChange={(e) => onChange('campaignUrl', e.target.value)}
                    placeholder="https://track.advertiser.com/click?cid={click_id}&aff_sub={user_id}"
                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 font-mono text-xs text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                />

                {/* Macro helper pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="mr-1 text-[11px] font-medium text-slate-500">Insert macro</span>
                    {macros.map((m) => (
                        <button
                            key={m}
                            type="button"
                            onClick={() => insertMacro(m)}
                            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 font-mono text-[11px] text-slate-600 transition-colors hover:border-slate-300 hover:bg-white"
                        >
                            {m}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
