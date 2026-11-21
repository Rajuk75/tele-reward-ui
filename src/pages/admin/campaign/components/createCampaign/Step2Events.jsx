import React from 'react';
import { FiPlus, FiTrash2 } from 'react-icons/fi';

const OBJECTIVES = ['CPI', 'CPA', 'CPL', 'CPR', 'CPS', 'CPD', 'CPG', 'CPRT', 'CPT', 'CPV'];

export default function Step2Events({ form, onChange }) {
    const events = form.events || [];

    const updateEvent = (index, field, value) => {
        const updated = [...events];
        updated[index] = { ...updated[index], [field]: value };
        onChange('events', updated);
    };

    const addEvent = () => {
        const nextOrder = events.length + 1;
        onChange('events', [
            ...events,
            { name: '', objective: 'CPI', payout: '', order: nextOrder }
        ]);
    };

    const removeEvent = (index) => {
        if (events.length <= 1) return;
        const filtered = events.filter((_, i) => i !== index).map((e, idx) => ({ ...e, order: idx + 1 }));
        onChange('events', filtered);
    };

    const totalPayout = events.reduce((sum, e) => sum + (Number(e.payout) || 0), 0);

    return (
        <div className="space-y-4 animate-in fade-in duration-200">
            {/* Simple Top Bar */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <span className="text-xs font-medium text-slate-700">Conversion milestones</span>
                <span className="text-xs font-medium text-slate-500">
                    Total payout <strong className="ml-1 font-semibold text-slate-900">₹{totalPayout.toLocaleString('en-IN')}</strong>
                </span>
            </div>

            {/* Event List */}
            <div className="space-y-3">
                {events.map((ev, idx) => (
                    <div
                        key={idx}
                        className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/40 p-4"
                    >
                        <div className="flex items-center justify-between">
                            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                                Event #{ev.order || idx + 1}
                            </span>
                            {events.length > 1 && (
                                <button
                                    type="button"
                                    onClick={() => removeEvent(idx)}
                                    aria-label={`Remove event ${idx + 1}`}
                                    className="grid size-7 place-items-center rounded-md text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                    title="Remove event"
                                >
                                    <FiTrash2 size={14} />
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            {/* Event Title */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Event Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={ev.name}
                                    onChange={(e) => updateEvent(idx, 'name', e.target.value)}
                                    placeholder="e.g. App Install"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                                />
                            </div>

                            <label className="text-xs font-medium text-slate-700">
                                Postback event key
                                <input value={ev.eventKey ?? ''} placeholder={ev.name.trim().toLowerCase() || 'install'}
                                    onChange={e => updateEvent(idx, 'eventKey', e.target.value)}
                                    className="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3" />
                            </label>

                            {/* Objective / Model */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Objective
                                </label>
                                <select
                                    value={ev.objective}
                                    onChange={(e) => updateEvent(idx, 'objective', e.target.value)}
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                                >
                                    {OBJECTIVES.map((obj) => (
                                        <option key={obj} value={obj}>
                                            {obj}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Advertiser Payout (₹) */}
                            <div>
                                <label className="mb-1.5 block text-xs font-medium text-slate-700">
                                    Advertiser Payout (₹) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    required
                                    value={ev.payout}
                                    onChange={(e) => updateEvent(idx, 'payout', e.target.value)}
                                    placeholder="150"
                                    className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-900 shadow-sm outline-none transition placeholder:text-slate-400 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100"
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add More Events */}
            {events.length < 5 && (
                <button
                    type="button"
                    onClick={addEvent}
                    className="flex h-10 w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-slate-300 bg-slate-50/60 text-xs font-semibold text-slate-600 transition-colors hover:border-indigo-400 hover:bg-indigo-50/50 hover:text-indigo-700"
                >
                    <FiPlus size={14} />
                    Add Another Event
                </button>
            )}
        </div>
    );
}
