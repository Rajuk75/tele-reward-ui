import React, { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

export default function Step3Budget({ form, onChange }) {
    const [showAdvanced, setShowAdvanced] = useState(true);

    return (
        <div className="space-y-6 animate-in fade-in duration-200">
            {/* 4 Clean Cap & Budget Boxes */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {/* 1. Daily Conversion Cap */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Daily Conversions Cap
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={form.dailyCap}
                        onChange={(e) => onChange('dailyCap', e.target.value)}
                        placeholder="e.g. 100"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    />
                </div>

                {/* 2. Daily Budget (₹) */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Daily Budget (₹)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.dailyBudget}
                        onChange={(e) => onChange('dailyBudget', e.target.value)}
                        placeholder="e.g. 15000 "
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    />
                </div>

                {/* 3. Total Conversion Cap */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Total Conversions Cap
                    </label>
                    <input
                        type="number"
                        min="0"
                        value={form.totalCap}
                        onChange={(e) => onChange('totalCap', e.target.value)}
                        placeholder="e.g. 1000"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    />
                </div>

                {/* 4. Total Campaign Budget (₹) */}
                <div>
                    <label className="mb-1.5 block text-xs font-medium text-slate-700">
                        Total Campaign Budget (₹)
                    </label>
                    <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={form.totalBudget}
                        onChange={(e) => onChange('totalBudget', e.target.value)}
                        placeholder="e.g. 150000"
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                    />
                </div>
            </div>

            {/* Collapsible Advanced Settings */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                <button
                    type="button"
                    onClick={() => setShowAdvanced(!showAdvanced)}
                    aria-expanded={showAdvanced}
                    className="flex h-11 w-full items-center justify-between bg-slate-50/70 px-4 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-100"
                >
                    <span>Advanced Anti-Fraud Settings</span>
                    {showAdvanced ? <FiChevronUp size={15} /> : <FiChevronDown size={15} />}
                </button>

                {showAdvanced && (
                    <div className="space-y-4 border-t border-slate-200 bg-white p-4 animate-in fade-in duration-150">
                        <div>
                            <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                Conversion Approval
                            </label>
                            <select
                                value={form.conversionApproval}
                                onChange={(e) => onChange('conversionApproval', e.target.value)}
                                className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                            >
                                <option value="automatic">Automatic Instant Approval</option>
                                <option value="manual">Manual Admin Review Required</option>
                            </select>
                        </div>

                        <div className="space-y-2 pt-1">
                            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.sameClickIpBlock}
                                    onChange={(e) => onChange('sameClickIpBlock', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                Block Duplicate Clicks from Same IP
                            </label>

                            <label className="flex cursor-pointer items-center gap-2.5 text-xs text-slate-700">
                                <input
                                    type="checkbox"
                                    checked={form.sameConversionIpBlock}
                                    onChange={(e) => onChange('sameConversionIpBlock', e.target.checked)}
                                    className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                                />
                                Block Multiple Conversions on Same IP
                            </label>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
