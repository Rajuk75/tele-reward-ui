import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateCampaign } from '../../../../services/AppService';
import Step1Basic from './createCampaign/Step1Basic';
import Step2Events from './createCampaign/Step2Events';
import Step3ConversionSettings from './createCampaign/Step3ConversionSettings';

const input = 'mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm';
const field = 'block text-sm font-medium text-slate-700';

function EventOptions({ event, change }) {
    const proofs = event.proofs || [];
    function editProof(index, patch) {
        change('proofs', proofs.map((proof, i) => i === index ? { ...proof, ...patch } : proof));
    }
    return <div className="space-y-3">
        <label className={field}>Event status<select className={input} value={event.status ?? 'active'} onChange={e => change('status', e.target.value)}>
            <option value="active">Active</option><option value="inactive">Inactive</option>
        </select></label>
        <label className={field}>Event steps<textarea className={input} rows={2} value={event.steps ?? ''} onChange={e => change('steps', e.target.value)} /></label>
        <label className={field}><input type="checkbox" checked={!!event.proofRequired} onChange={e => change('proofRequired', e.target.checked)} /> Require proof</label>
        {event.proofRequired && <>
            <label className={field}>Proof instructions<textarea className={input} value={event.proofInstructions ?? ''} onChange={e => change('proofInstructions', e.target.value)} /></label>
            {proofs.map((proof, i) => <div key={i} className="grid gap-2 rounded-lg border border-slate-200 p-3 sm:grid-cols-2">
                <label className={field}>Proof label<input required className={input} value={proof.label} onChange={e => editProof(i, { label: e.target.value })} /></label>
                <label className={field}>Proof type<select className={input} value={proof.type} onChange={e => editProof(i, { type: e.target.value })}>
                    <option value="image">Image</option><option value="text">Text</option><option value="pdf">PDF</option>
                </select></label>
                <label className={field}><input type="checkbox" checked={proof.isRequired !== false} onChange={e => editProof(i, { isRequired: e.target.checked })} /> Required</label>
                <button type="button" className="text-sm underline" onClick={() => change('proofs', proofs.filter((_, index) => index !== i))}>Remove proof field</button>
            </div>)}
            <button type="button" className="text-sm underline" onClick={() => change('proofs', [...proofs, { label: '', type: 'image', isRequired: true }])}>Add proof field</button>
        </>}
    </div>;
}

function payloadFor(section, form) {
    if (section === 'basic') {
        const { name, imageUrl, campaignUrl, category, model, status, description, previewUrl } = form;
        if (!name?.trim() || !imageUrl?.trim() || !campaignUrl?.trim()) throw new Error('Enter the campaign name, logo URL and destination URL.');
        return { campaign: { name: name.trim(), imageUrl: imageUrl.trim(), campaignUrl: campaignUrl.trim(), category, model, status, description, previewUrl } };
    }
    if (section === 'settings') {
        const { conversionApproval, needApproval, sameClickIpBlock, sameConversionIpBlock, conversionDelayEnabled, ipWhitelistEnabled, shaving } = form;
        const ipWhitelist = form.ipText.split(/[\s,]+/).filter(Boolean);
        if (ipWhitelistEnabled && !ipWhitelist.length) throw new Error('Enter at least one allowed IP address.');
        return { campaign: { conversionApproval, needApproval, sameClickIpBlock, sameConversionIpBlock, conversionDelayEnabled,
            conversionDelayMinutes: form.conversionDelayMinutes ? Number(form.conversionDelayMinutes) : null,
            ipWhitelistEnabled, ipWhitelist, shaving: { enabled: !!shaving?.enabled, ratio: Number(shaving?.ratio ?? 0) } } };
    }
    const events = form.events.map((event, index) => ({
        _id: event._id, name: event.name.trim(), eventKey: (event.eventKey?.trim() || event.name.trim()).toLowerCase(),
        order: index + 1, cap: Number(event.cap), advertiserPayout: Number(event.advertiserPayout),
        steps: event.steps, status: event.status ?? 'active', proofRequired: !!event.proofRequired,
        proofInstructions: event.proofInstructions, proofs: event.proofs || [],
    }));
    if (!events.length || events.some(e => !e.name) || new Set(events.map(e => e.eventKey)).size !== events.length) {
        throw new Error('Each event needs a name and a distinct postback key.');
    }
    return { events };
}

export default function CampaignSectionEditor({ campaign, section, onClose }) {
    const client = useQueryClient();
    const [form, setForm] = useState(() => ({ ...campaign, events: campaign.events ?? [], ipText: campaign.ipWhitelist?.join('\n') ?? '' }));
    const [error, setError] = useState('');
    const save = useMutation({
        mutationFn: payload => updateCampaign(campaign._id, payload),
        onSuccess: response => {
            const data = response.data?.data;
            const saved = data?.campaign ?? data;
            const key = ['campaign-detail', campaign._id];
            if (saved?._id === campaign._id) client.setQueryData(key, saved);
            client.invalidateQueries({ queryKey: key });
            client.invalidateQueries({ queryKey: ['offer-details'] });
            client.invalidateQueries({ queryKey: ['campaigns-available'] });
            onClose();
        },
    });
    function change(name, value) {
        setForm(previous => ({ ...previous, [name]: value }));
        setError('');
    }
    function submit(e) {
        e.preventDefault();
        if (save.isPending) return;
        try { save.mutate(payloadFor(section, form)); }
        catch (err) { setError(err.message); }
    }
    return <form onSubmit={submit} className="space-y-4">
        <fieldset disabled={save.isPending} className="min-w-0 space-y-4">
            {section === 'basic' && <>
                <Step1Basic form={form} onChange={change} />
                <label className={field}>Description<textarea className={input} value={form.description ?? ''} onChange={e => change('description', e.target.value)} /></label>
                <label className={field}>Preview URL<input type="url" className={input} value={form.previewUrl ?? ''} onChange={e => change('previewUrl', e.target.value)} /></label>
            </>}
            {section === 'events' && <Step2Events form={form} onChange={change} renderEventDetails={(event, update) => <EventOptions event={event} change={update} />} />}
            {section === 'settings' && <>
                <Step3ConversionSettings form={form} onChange={change} />
                <label className={field}><input type="checkbox" checked={!!form.needApproval} onChange={e => change('needApproval', e.target.checked)} /> Require approval</label>
                <label className={field}><input type="checkbox" checked={!!form.conversionDelayEnabled} onChange={e => change('conversionDelayEnabled', e.target.checked)} /> Enable conversion delay</label>
                {form.conversionDelayEnabled && <label className={field}>Delay in minutes<select required className={input} value={form.conversionDelayMinutes ?? ''} onChange={e => change('conversionDelayMinutes', e.target.value)}>
                    <option value="">Select delay</option>{[3,5,10,15,30,60].map(m => <option key={m}>{m}</option>)}
                </select></label>}
                <label className={field}><input type="checkbox" checked={!!form.ipWhitelistEnabled} onChange={e => change('ipWhitelistEnabled', e.target.checked)} /> Enable IP whitelist</label>
                {form.ipWhitelistEnabled && <label className={field}>Allowed IP addresses (one per line)<textarea required className={input} value={form.ipText} onChange={e => change('ipText', e.target.value)} /></label>}
                <label className={field}><input type="checkbox" checked={!!form.shaving?.enabled} onChange={e => change('shaving', { ...form.shaving, enabled: e.target.checked })} /> Enable shaving</label>
                {form.shaving?.enabled && <label className={field}>Shaving ratio (%)<input required type="number" min="0" max="100" step="any" className={input} value={form.shaving.ratio ?? 0} onChange={e => change('shaving', { ...form.shaving, ratio: e.target.value })} /></label>}
            </>}
        </fieldset>
        {(error || save.isError) && <p role="alert" className="text-sm text-rose-700">{error || save.error?.message || 'Unable to save changes.'}</p>}
        <div className="flex justify-end gap-2 border-t border-slate-200 pt-3">
            <button type="button" disabled={save.isPending} onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Cancel</button>
            <button disabled={save.isPending} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{save.isPending ? 'Saving…' : 'Save changes'}</button>
        </div>
    </form>;
}
