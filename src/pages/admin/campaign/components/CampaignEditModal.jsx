import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCampaignById, updateCampaign } from '../../../../services/AppService';
import { useThemeClasses } from '../../../../context/ThemeContext';
import { FiPlus, FiTrash2, FiSave, FiX, FiDollarSign } from 'react-icons/fi';
import { Toggle, FormField, Inp, Sel, TextArea } from '../../common/AdminUI';

const OBJECTIVES = ['CPA', 'CPD', 'CPG', 'CPI', 'CPL', 'CPR', 'CPRT', 'CPS', 'CPT', 'CPV'];
const CATEGORIES  = ['business', 'education', 'entertainment', 'fantasy', 'finance', 'food', 'gaming', 'loan', 'news', 'photography', 'productivity', 'shopping', 'travel'];
const EMPTY_EVENT = { name: '', objective: 'CPI', cap: 1000, payout: 0, order: 1, steps: '', proofRequired: false, proofInstructions: '', proofs: [{ label: '', type: 'image', isRequired: true }] };

export default function CampaignEditModal({ campaignId, onClose }) {
    const queryClient    = useQueryClient();
    const tc             = useThemeClasses();

    const [form, setForm] = useState(null);

    // Disable body scroll when modal is open
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, []);

    const { data, isLoading } = useQuery({
        queryKey: ['campaign-edit', campaignId],
        queryFn:  () => getCampaignById(campaignId).then((r) => r.data?.data?.campaign ?? r.data?.data),
        enabled: !!campaignId,
    });

    useEffect(() => {
        if (!data) return;
        setForm({
            name:                   data.name                   ?? '',
            imageUrl:               data.imageUrl               ?? '',
            previewUrl:             data.previewUrl             ?? '',
            description:            data.description            ?? '',
            campaignUrl:            data.campaignUrl            ?? '',
            category:               data.category               ?? 'business',
            model:                  data.model                  ?? 'CPI',
            status:                 data.status                 ?? 'active',
            events:                 (data.events ?? []).map((ev) => ({
                _id:               ev._id,
                eventKey:          ev.eventKey ?? ev.name?.trim().toLowerCase(),
                name:              ev.name              ?? '',
                objective:         ev.objective         ?? 'CPI',
                cap:               ev.cap               ?? 1000,
                payout:            ev.advertiserPayout  ?? ev.payout ?? 0,
                order:             ev.order             ?? 1,
                steps:             ev.steps             ?? '',
                proofRequired:     ev.proofRequired     ?? false,
                proofInstructions: ev.proofInstructions ?? '',
                proofs:            ev.proofs            ?? [{ label: '', type: 'image', isRequired: true }],
            })),
            conversionApproval:     data.conversionApproval     ?? 'automatic',
            needApproval:           data.needApproval           ?? false,
            sameClickIpBlock:       data.sameClickIpBlock       ?? true,
            sameConversionIpBlock:  data.sameConversionIpBlock  ?? true,
            conversionDelayEnabled: data.conversionDelayEnabled ?? false,
            conversionDelayMinutes: data.conversionDelayMinutes ?? null,
            ipWhitelistEnabled:     data.ipWhitelistEnabled     ?? false,
            ipWhitelist:            (data.ipWhitelist ?? []).join(', '),
            shavingEnabled:         data.shaving?.enabled        ?? false,
            scrubbingRatio:         data.shaving?.ratio          ?? 0,
        });
    }, [data]);

    const mutation = useMutation({
        mutationFn: (payload) => updateCampaign(campaignId, payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            onClose();
        },
    });

    const set = (field) => (e) => {
        const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setForm((f) => ({ ...f, [field]: val }));
    };

    const setEvent = (i, field, val) =>
        setForm((f) => {
            const events = [...f.events];
            events[i] = { ...events[i], [field]: val };
            return { ...f, events };
        });

    const addEvent    = () => setForm((f) => ({ ...f, events: [...f.events, { ...EMPTY_EVENT, order: f.events.length + 1 }] }));
    const removeEvent = (i) => setForm((f) => ({ ...f, events: f.events.filter((_, idx) => idx !== i).map((e, idx) => ({ ...e, order: idx + 1 })) }));

    const handleSubmit = (e) => {
        e.preventDefault();
        mutation.mutate({
            ...form,
            events: form.events.map((ev) => ({
                ...ev,
                cap:               Number(ev.cap),
                payout:            Number(ev.payout),
                order:             Number(ev.order),
                proofRequired:     ev.proofRequired     || false,
                proofInstructions: ev.proofRequired ? (ev.proofInstructions || '') : '',
                proofs:            ev.proofRequired ? ev.proofs.filter(p => p.label.trim()) : [],
            })),
            ipWhitelist: form.ipWhitelistEnabled ? form.ipWhitelist.split(',').map((s) => s.trim()).filter(Boolean) : [],
            conversionDelayMinutes: form.conversionDelayEnabled ? Number(form.conversionDelayMinutes || 3) : null,
            shaving: {
                enabled: form.shavingEnabled,
                ratio:   Number(form.scrubbingRatio || 0)
            }
        });
    };

    if (!campaignId) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60">
            <div className="absolute inset-0" onClick={onClose} />
            
            <div className={`relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-sm border ${tc.border} overflow-hidden ${tc.isDark ? tc.card : 'bg-slate-100'}`}>
                {/* Global Noise Texture */}
                {!tc.isDark && (
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply"
                        style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                    />
                )}

                {/* Header */}
                <div className={`relative z-10 flex items-center justify-between px-6 py-4 border-b ${tc.border} ${tc.isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500 border border-indigo-500/10">
                            <FiSave size={22} />
                        </div>
                        <div>
                            <h2 className={`text-lg font-black tracking-tight ${tc.text}`}>Edit Campaign</h2>
                            <p className={`text-[10px] font-bold uppercase tracking-widest opacity-50 ${tc.text}`}>{data?.name || '...'}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className={`p-2 rounded-lg transition hover:bg-black/5 dark:hover:bg-white/10 ${tc.textMuted}`}>
                        <FiX size={20} />
                    </button>
                </div>

                {isLoading || !form ? (
                    <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-20 gap-4">
                        <div className="w-10 h-10 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
                        <p className={`text-sm font-black uppercase tracking-widest opacity-40 ${tc.text}`}>Hydrating Form Data...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="relative z-10 flex-1 overflow-y-auto p-6 space-y-8">
                        
                        {/* General Information Card */}
                        <div className={`relative p-[1px] rounded-2xl overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-indigo-100/40 border border-indigo-200/40'}`}>
                            <div className={`relative p-6 rounded-2xl ${tc.isDark ? 'bg-black/20' : 'bg-white'}`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-6 opacity-40 ${tc.text}`}>General Identity</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                                    <FormField label="Campaign Title" tc={tc}>
                                        <Inp value={form.name} onChange={set('name')} required tc={tc} />
                                    </FormField>
                                    <FormField label="Lifecycle Status" tc={tc}>
                                        <Sel value={form.status} onChange={set('status')} tc={tc}>
                                            <option value="active">Active</option>
                                            <option value="inactive">Inactive</option>
                                        </Sel>
                                    </FormField>
                                    <FormField label="Market Category" tc={tc}>
                                        <Sel value={form.category} onChange={set('category')} tc={tc}>
                                            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                                        </Sel>
                                    </FormField>
                                    <FormField label="Primary Model" tc={tc}>
                                        <Sel value={form.model} onChange={set('model')} tc={tc}>
                                            {OBJECTIVES.map((o) => <option key={o}>{o}</option>)}
                                        </Sel>
                                    </FormField>
                                    <div className="md:col-span-2">
                                        <FormField label="Creative Image (URL)" tc={tc}>
                                            <Inp value={form.imageUrl} onChange={set('imageUrl')} required tc={tc} />
                                        </FormField>
                                    </div>
                                    <div className="md:col-span-2">
                                        <FormField label="Internal Description & Notes" tc={tc}>
                                            <TextArea
                                                value={form.description}
                                                onChange={set('description')}
                                                placeholder="Internal notes about advertiser terms…"
                                                rows={3}
                                                className={`w-full rounded-xl p-4 text-xs font-bold leading-relaxed outline-none transition resize-none ${tc.input} border-slate-200 dark:border-white/5 focus:ring-2 focus:ring-indigo-500`}
                                            />
                                        </FormField>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tracking URL Card */}
                        <div className={`relative p-[1px] rounded-2xl overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-purple-100/40 border border-purple-200/40'}`}>
                            <div className={`relative p-6 rounded-2xl ${tc.isDark ? 'bg-black/20' : 'bg-white'}`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-6 opacity-40 ${tc.text}`}>Tracking Configuration</h3>
                                <div className="space-y-6">
                                    <FormField label="Destination Advertiser URL" tc={tc}>
                                        <Inp value={form.campaignUrl} onChange={set('campaignUrl')} required tc={tc} className="font-mono text-[10px] tracking-tight bg-slate-50 dark:bg-black/20" />
                                    </FormField>
                                    <FormField label="Preview Landing URL" tc={tc}>
                                        <Inp value={form.previewUrl} onChange={set('previewUrl')} tc={tc} className="font-mono text-[10px] tracking-tight bg-slate-50 dark:bg-black/20" />
                                    </FormField>
                                </div>
                            </div>
                        </div>

                        {/* Events Card */}
                        <div className={`relative p-[1px] rounded-2xl overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-emerald-100/40 border border-emerald-200/40'}`}>
                            <div className={`relative p-6 rounded-2xl ${tc.isDark ? 'bg-black/20' : 'bg-white'}`}>
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${tc.text}`}>Conversion Milestones</h3>
                                    <button type="button" onClick={addEvent} className="px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-emerald-500 hover:text-white transition-all shadow-sm">
                                        <FiPlus size={14} /> Add Event
                                    </button>
                                </div>

                                <div className="space-y-6">
                                    {form.events.map((ev, i) => (
                                        <div key={i} className={`relative p-6 rounded-2xl border-2 border-dashed transition-colors ${tc.isDark ? 'border-white/5 bg-white/5' : 'border-slate-200 bg-slate-50/30'}`}>
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="flex items-center gap-3">
                                                    <span className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 flex items-center justify-center text-[10px] font-black border border-emerald-500/10">#{ev.order}</span>
                                                    <span className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${tc.text}`}>Event Configuration</span>
                                                </div>
                                                {form.events.length > 1 && (
                                                    <button type="button" onClick={() => removeEvent(i)} className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors">
                                                        <FiTrash2 size={16} />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                                <FormField label="Event Title" tc={tc}>
                                                    <Inp value={ev.name} onChange={(e) => setEvent(i, 'name', e.target.value)} required tc={tc} />
                                                </FormField>
                                                <FormField label="Postback event key" tc={tc}>
                                                    <Inp value={ev.eventKey ?? ''} onChange={e => setEvent(i, 'eventKey', e.target.value)} tc={tc} />
                                                </FormField>
                                                <FormField label="Objective" tc={tc}>
                                                    <Sel value={ev.objective} onChange={(e) => setEvent(i, 'objective', e.target.value)} tc={tc}>
                                                        {OBJECTIVES.map((o) => <option key={o}>{o}</option>)}
                                                    </Sel>
                                                </FormField>
                                                <FormField label="Payout (₹)" tc={tc}>
                                                    <Inp type="number" step="0.01" value={ev.payout} onChange={(e) => setEvent(i, 'payout', e.target.value)} required tc={tc} />
                                                </FormField>
                                                <FormField label="Daily Cap" tc={tc}>
                                                    <Inp type="number" value={ev.cap} onChange={(e) => setEvent(i, 'cap', e.target.value)} required tc={tc} />
                                                </FormField>
                                            </div>

                                            <div className="mt-6">
                                                <FormField label="Technical Event Instructions" tc={tc}>
                                                    <TextArea
                                                        value={ev.steps}
                                                        onChange={(e) => setEvent(i, 'steps', e.target.value)}
                                                        placeholder="Describe trigger steps…"
                                                        rows={2}
                                                        className={`w-full rounded-xl p-4 text-[10px] font-bold outline-none transition resize-none ${tc.input} border-slate-200 dark:border-white/5 focus:ring-1 focus:ring-emerald-500`}
                                                    />
                                                </FormField>
                                            </div>

                                            <div className={`mt-6 rounded-2xl border-2 border-dashed p-6 transition-all ${tc.isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50/50 border-amber-200/50'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <Toggle
                                                        checked={ev.proofRequired}
                                                        onChange={(v) => setEvent(i, 'proofRequired', v)}
                                                        label="Require User Verification (Proofs)"
                                                        tc={tc}
                                                    />
                                                    {ev.proofRequired && <span className="text-[9px] font-black uppercase tracking-widest text-amber-600 animate-pulse">Manual Audit Required</span>}
                                                </div>

                                                {ev.proofRequired && (
                                                    <div className="space-y-6 mt-6 animate-in fade-in slide-in-from-top-4 duration-500">
                                                        <FormField label="Global Instructions for Proof Upload" tc={tc} labelClass="text-amber-700">
                                                            <TextArea
                                                                value={ev.proofInstructions}
                                                                onChange={(e) => setEvent(i, 'proofInstructions', e.target.value)}
                                                                placeholder="e.g. Please upload the following documents…"
                                                                rows={2}
                                                                className={`w-full rounded-xl p-4 text-[10px] font-bold outline-none transition resize-none ${tc.input} border-amber-200/50 focus:ring-2 focus:ring-amber-500`}
                                                            />
                                                        </FormField>
                                                        <div className="space-y-4">
                                                            <p className={`text-[10px] font-black uppercase tracking-widest opacity-40 ${tc.text}`}>Document Checklist</p>
                                                            <div className="space-y-3">
                                                                {ev.proofs.map((p, pi) => (
                                                                    <div key={pi} className={`flex items-start gap-4 p-4 rounded-xl border border-dashed transition-all ${tc.isDark ? 'bg-black/20 border-white/10' : 'bg-white border-amber-200'}`}>
                                                                        <div className="flex-1 grid grid-cols-2 gap-4">
                                                                            <Inp 
                                                                                value={p.label} 
                                                                                onChange={(e) => {
                                                                                    const newProofs = [...ev.proofs];
                                                                                    newProofs[pi].label = e.target.value;
                                                                                    setEvent(i, 'proofs', newProofs);
                                                                                }}
                                                                                placeholder="Label (e.g. KYC Screenshot)" 
                                                                                tc={tc}
                                                                                className="text-[10px] font-bold h-10 px-4"
                                                                            />
                                                                            <Sel 
                                                                                value={p.type} 
                                                                                onChange={(e) => {
                                                                                    const newProofs = [...ev.proofs];
                                                                                    newProofs[pi].type = e.target.value;
                                                                                    setEvent(i, 'proofs', newProofs);
                                                                                }}
                                                                                tc={tc}
                                                                                className="text-[10px] font-black uppercase tracking-widest h-10 px-4"
                                                                            >
                                                                                <option value="image">Image / Screenshot</option>
                                                                                <option value="text">Text / TXN ID</option>
                                                                                <option value="pdf">PDF Document</option>
                                                                            </Sel>
                                                                            <div className="col-span-2">
                                                                                <Toggle 
                                                                                    checked={p.isRequired}
                                                                                    onChange={(v) => {
                                                                                        const newProofs = [...ev.proofs];
                                                                                        newProofs[pi].isRequired = v;
                                                                                        setEvent(i, 'proofs', newProofs);
                                                                                    }}
                                                                                    label="Mandatory Requirement"
                                                                                    tc={tc}
                                                                                />
                                                                            </div>
                                                                        </div>
                                                                        <button 
                                                                            type="button" 
                                                                            onClick={() => {
                                                                                const newProofs = ev.proofs.filter((_, idx) => idx !== pi);
                                                                                setEvent(i, 'proofs', newProofs);
                                                                            }}
                                                                            className="p-2 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
                                                                        >
                                                                            <FiTrash2 size={16} />
                                                                        </button>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                            <button 
                                                                type="button" 
                                                                onClick={() => {
                                                                    const newProofs = [...ev.proofs, { label: '', type: 'image', isRequired: true }];
                                                                    setEvent(i, 'proofs', newProofs);
                                                                }}
                                                                className="w-full py-3 rounded-xl border border-dashed border-indigo-300 text-indigo-600 text-[10px] font-black uppercase tracking-widest hover:bg-indigo-50 transition-all active:scale-[0.98]"
                                                            >
                                                                + Add Document Requirement
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Controls & Fraud Card */}
                        <div className={`relative p-[1px] rounded-2xl overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-zinc-100/40 border border-zinc-200/50'}`}>
                            <div className={`relative p-6 rounded-2xl ${tc.isDark ? 'bg-black/20' : 'bg-white'}`}>
                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-8 opacity-40 ${tc.text}`}>Automation & Governance</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                                    <div className="space-y-8">
                                        <FormField label="Approval Type" tc={tc}>
                                            <Sel value={form.conversionApproval} onChange={set('conversionApproval')} tc={tc}>
                                                <option value="automatic">Automatic</option>
                                                <option value="manual">Manual</option>
                                            </Sel>
                                        </FormField>
                                        <div className="space-y-4">
                                            <Toggle checked={form.needApproval} onChange={(v) => setForm(f => ({ ...f, needApproval: v }))} label="Admin Review Required" tc={tc} />
                                            <Toggle checked={form.sameClickIpBlock} onChange={(v) => setForm(f => ({ ...f, sameClickIpBlock: v }))} label="Block Duplicate Click IP" tc={tc} />
                                            <Toggle checked={form.sameConversionIpBlock} onChange={(v) => setForm(f => ({ ...f, sameConversionIpBlock: v }))} label="Block Duplicate Conv. IP" tc={tc} />
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-6 rounded-2xl border-2 border-dashed border-slate-200 dark:border-white/5 bg-slate-50/50 dark:bg-black/10">
                                            <Toggle checked={form.conversionDelayEnabled} onChange={(v) => setForm(f => ({ ...f, conversionDelayEnabled: v }))} label="Enable Conversion Delay" tc={tc} />
                                            {form.conversionDelayEnabled && (
                                                <div className="mt-6 animate-in slide-in-from-right-4 duration-500">
                                                    <FormField label="Minutes" tc={tc}>
                                                        <Sel value={form.conversionDelayMinutes ?? 3} onChange={set('conversionDelayMinutes')} tc={tc}>
                                                            {[3, 5, 10, 15, 30, 60].map((m) => <option key={m} value={m}>{m} min</option>)}
                                                        </Sel>
                                                    </FormField>
                                                </div>
                                            )}
                                        </div>

                                        <div className="p-6 rounded-2xl border-2 border-dashed border-red-200/50 dark:border-red-500/10 bg-red-50/30 dark:bg-red-500/5">
                                            <h4 className={`text-[10px] font-black uppercase tracking-widest text-red-600 mb-4 flex items-center gap-2`}>
                                                <FiDollarSign size={14} /> Profit Optimization (Shaving)
                                            </h4>
                                            <div className="space-y-6">
                                                <Toggle 
                                                    checked={form.shavingEnabled} 
                                                    onChange={(v) => setForm(f => ({ ...f, shavingEnabled: v }))} 
                                                    label="Enable Campaign Shaving" 
                                                    tc={tc} 
                                                />
                                                {form.shavingEnabled && (
                                                    <div className="animate-in slide-in-from-right-4 duration-500">
                                                        <FormField label="Scrubbing Ratio (%)" tc={tc}>
                                                            <Inp 
                                                                type="number" 
                                                                min="0" 
                                                                max="100" 
                                                                value={form.scrubbingRatio} 
                                                                onChange={set('scrubbingRatio')} 
                                                                placeholder="e.g. 20" 
                                                                tc={tc} 
                                                            />
                                                            <p className="mt-2 text-[9px] font-bold text-red-600 opacity-60 uppercase tracking-widest">Override global settings and scrub this % of conversions for this campaign.</p>
                                                        </FormField>
                                                    </div>
                                                )}
                                                {!form.shavingEnabled && (
                                                    <p className="text-[9px] font-bold opacity-40 uppercase tracking-widest italic leading-relaxed">When disabled, this campaign will follow the global shaving rules set in App Settings.</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                )}

                {/* Footer */}
                <div className={`relative z-10 px-8 py-5 border-t flex justify-end items-center gap-4 ${tc.border} ${tc.isDark ? 'bg-white/5' : 'bg-white/50'}`}>
                    <button type="button" onClick={onClose} className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest border ${tc.border} hover:bg-black/5 dark:hover:bg-white/5 transition active:scale-95`}>Cancel</button>
                    <button
                        onClick={handleSubmit}
                        disabled={mutation.isPending || !form}
                        className="px-10 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black uppercase tracking-widest transition shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50"
                    >
                        {mutation.isPending ? 'Syncing...' : 'Save Updates'}
                    </button>
                </div>
            </div>
        </div>
    );
}

