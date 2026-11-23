import React from 'react';
import { PlusIcon, CloseIcon, ShieldIcon } from '../../../../../components/common/Icons';

export default function Step4QualityPostback({ form, onChange }) {
    const handleAddInput = () => {
        const next = [...(form.inputs || []), { label: '', type: 'text', order: (form.inputs?.length || 0) + 1 }];
        onChange('inputs', next);
    };

    const handleRemoveInput = (idx) => {
        const next = form.inputs.filter((_, i) => i !== idx);
        onChange('inputs', next);
    };

    const handleInputChange = (idx, field, val) => {
        const next = [...form.inputs];
        next[idx] = { ...next[idx], [field]: val };
        onChange('inputs', next);
    };

    return (
        <div className="space-y-5">
            {/* 1. Quality & Visibility Toggles */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center gap-1.5">
                    <ShieldIcon size={14} className="text-slate-700" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Rules & Visibility
                    </h4>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* One UPI Limit */}
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                        <input
                            type="checkbox"
                            checked={!!form.oneUpiOneTime}
                            onChange={(e) => onChange('oneUpiOneTime', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900">Block Duplicate UPI</span>
                    </label>

                    {/* Show in Public App */}
                    <label className="flex items-center gap-3 p-3 rounded-lg bg-white border border-slate-200 cursor-pointer hover:border-slate-300 transition-colors">
                        <input
                            type="checkbox"
                            checked={!!form.offerDisplay}
                            onChange={(e) => onChange('offerDisplay', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span className="text-xs font-bold text-slate-900">Show in App / Web</span>
                    </label>
                </div>
            </div>

            {/* 2. Jumper Traffic Redirection */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Traffic Jumper & Rerouting
                    </h4>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                            type="checkbox"
                            checked={!!form.jumperEnabled}
                            onChange={(e) => onChange('jumperEnabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span>Enable Jumper</span>
                    </label>
                </div>

                {form.jumperEnabled && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                        <div>
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                Jumper Ratio (%)
                            </label>
                            <input
                                type="number"
                                min="1"
                                max="100"
                                value={form.jumperRatio || ''}
                                onChange={(e) => onChange('jumperRatio', e.target.value)}
                                placeholder="e.g. 20"
                                className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900"
                            />
                        </div>

                        <div className="sm:col-span-2">
                            <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block mb-1">
                                Alternate Jumper URL
                            </label>
                            <input
                                type="text"
                                value={form.jumperUrl || ''}
                                onChange={(e) => onChange('jumperUrl', e.target.value)}
                                placeholder="https://alternate-destination.com/click"
                                className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900"
                            />
                        </div>
                    </div>
                )}
            </div>

            {/* 3. Lucky Spin Wheel Config */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <span>🎡 Lucky Spin & Win Bonus</span>
                    </h4>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                            type="checkbox"
                            checked={!!form.spinEnabled}
                            onChange={(e) => onChange('spinEnabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span>Enable Spin Wheel</span>
                    </label>
                </div>

                {form.spinEnabled && (
                    <div className="pt-1 space-y-2">
                        <label className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                            Bonus Slices Amounts (₹, comma-separated)
                        </label>
                        <input
                            type="text"
                            value={form.spinSlicesText ?? '5, 10, 15, 20, 25'}
                            onChange={(e) => {
                                const txt = e.target.value;
                                onChange('spinSlicesText', txt);
                                const parsed = txt.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n) && n > 0);
                                onChange('spinSlices', parsed.length ? parsed : [5, 10, 15, 20, 25]);
                            }}
                            placeholder="e.g. 5, 10, 15, 20, 25"
                            className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 font-mono"
                        />
                        <p className="text-[11px] font-medium text-slate-500">
                            Users will see these reward amounts on the lucky wheel slices when starting this offer.
                        </p>
                    </div>
                )}
            </div>

            {/* 4. Custom User Input Fields */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Custom User Fields
                    </h4>

                    <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-800">
                        <input
                            type="checkbox"
                            checked={!!form.inputEnabled}
                            onChange={(e) => onChange('inputEnabled', e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900 cursor-pointer"
                        />
                        <span>Enable Custom Fields</span>
                    </label>
                </div>

                {form.inputEnabled && (
                    <div className="space-y-2.5 pt-2">
                        {(form.inputs || []).map((inp, idx) => (
                            <div key={idx} className="flex items-center gap-2 p-2.5 rounded-lg bg-white border border-slate-200">
                                <span className="text-[11px] font-bold text-slate-400 font-mono w-6 text-center">
                                    #{idx + 1}
                                </span>
                                <input
                                    type="text"
                                    value={inp.label}
                                    onChange={(e) => handleInputChange(idx, 'label', e.target.value)}
                                    placeholder="Field label (e.g. PhonePe Number)"
                                    className="flex-1 px-3 py-1.5 text-xs font-medium rounded border border-slate-200 focus:outline-none focus:border-slate-400"
                                />
                                <select
                                    value={inp.type}
                                    onChange={(e) => handleInputChange(idx, 'type', e.target.value)}
                                    className="px-2.5 py-1.5 text-xs font-medium rounded border border-slate-200 bg-white"
                                >
                                    <option value="text">Text</option>
                                    <option value="number">Number</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => handleRemoveInput(idx)}
                                    className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors"
                                    title="Remove field"
                                >
                                    <CloseIcon size={14} />
                                </button>
                            </div>
                        ))}

                        <button
                            type="button"
                            onClick={handleAddInput}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-dashed border-slate-300 rounded-lg hover:border-slate-400 hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            <PlusIcon size={12} />
                            <span>Add Custom Field</span>
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
