import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { getCampaignById, updateOffer } from '../../../../services/AppService';
import { buildForm } from '../hooks/useOfferDetails';
import Step3Instructions from './createOffer/Step3Instructions';
import Step4QualityPostback from './createOffer/Step4QualityPostback';

const control = 'mt-1 block w-full min-w-0 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 focus:border-slate-600';
const labelStyle = 'block min-w-0 text-sm font-medium text-slate-700';

function basicPayload(form) {
    if (!form.offerName?.trim() || !form.comment?.trim() || !form.termsAndConditions?.trim()) {
        throw new Error('Enter an offer name, description and offer terms.');
    }
    return { offer: {
        offerName: form.offerName.trim(), comment: form.comment.trim(), steps: form.steps ?? '',
        journeySteps: (form.journeyStepsText || '').split(',').map((s) => s.trim()).filter(Boolean),
        termsAndConditions: form.termsAndConditions.trim(), referTermsAndConditions: form.referTermsAndConditions ?? '',
        backgroundImage: form.backgroundImage ?? '',
    } };
}

function settingsPayload(form) {
    const priority = Number(form.priority);
    if (!Number.isInteger(priority) || priority < 1 || priority > 999) throw new Error('Priority must be a whole number from 1 to 999.');
    const ratio = Number(form.jumperRatio);
    if (form.jumperEnabled) {
        if (!Number.isFinite(ratio) || ratio < 1 || ratio > 100) throw new Error('Enter a jumper ratio between 1 and 100.');
        if (!URL.canParse(form.jumperUrl) || !['http:', 'https:'].includes(new URL(form.jumperUrl).protocol)) throw new Error('Enter an HTTP or HTTPS jumper destination.');
    }
    const amounts = form.spinSlicesText.split(',').map(value => value.trim());
    if (form.spinEnabled && (amounts.length < 2 || amounts.some(value => !value || !Number.isFinite(Number(value)) || Number(value) < 0))) {
        throw new Error('Enter at least two non-negative spin amounts, separated by commas.');
    }
    const inputs = form.inputEnabled ? form.inputs || [] : [];
    if (form.inputEnabled && (!inputs.length || inputs.some(input => !input.label?.trim()))) throw new Error('Add a label for each custom field or disable custom fields.');
    return { offer: {
        status: form.status, priority, oneUpiOneTime: !!form.oneUpiOneTime, offerDisplay: !!form.offerDisplay,
        jumperEnabled: !!form.jumperEnabled, jumperRatio: form.jumperEnabled ? ratio : null,
        jumperUrl: form.jumperEnabled ? form.jumperUrl.trim() : null,
        spinSettings: { enabled: form.spinEnabled, slices: form.spinEnabled ? amounts.map(Number) : form.spinSlices },
        inputs: inputs.map((input, index) => ({ ...input, label: input.label.trim(), order: index + 1 })),
    } };
}

function EventFields({ rows, onChange }) {
    function changeRow(index, patch) {
        onChange(rows.map((row, i) => i === index ? { ...row, ...patch } : row));
    }
    return <div className="divide-y divide-slate-100">
        {rows.length === 0 && <p className="text-sm text-slate-600">No eligible campaign events available.</p>}
        {rows.map((row, index) => <div key={row.campaignEventId || index} className="grid items-center gap-3 py-3 sm:grid-cols-[minmax(0,1fr)_8rem]">
            <label className="flex items-start gap-2 text-sm font-medium">
                <input type="checkbox" checked={row.selected} onChange={e => changeRow(index, { selected: e.target.checked })} className="mt-1" />
                {row.order}. {row.eventName}
            </label>
            {row.selected && <label className={labelStyle}>User payout (₹)
                <input aria-label={`User payout for ${row.eventName}`} type="text" inputMode="decimal" required pattern="([0-9]+(\.[0-9]{0,2})?|\.[0-9]{1,2})"
                    className={control} value={row.payout} onChange={e => changeRow(index, { payout: e.target.value })} />
            </label>}
        </div>)}
    </div>;
}

export default function OfferSectionEditor({ section, offer, onClose }) {
    const client = useQueryClient();
    const [form, setForm] = useState(() => buildForm(offer));
    const [editedEvents, setEditedEvents] = useState(null);
    const [error, setError] = useState('');
    const [uploading, setUploading] = useState(false);
    const campaign = useQuery({
        queryKey: ['campaign-detail', form.campaignId],
        queryFn: async () => {
            const response = await getCampaignById(form.campaignId);
            return response.data.data.campaign ?? response.data.data;
        },
        enabled: section === 'events' && !!form.campaignId,
    });
    const rows = editedEvents ?? buildForm(offer, campaign.data).events;
    const save = useMutation({
        mutationFn: payload => updateOffer(offer._id, payload),
        onSuccess: response => {
            const key = ['offer-details', offer._id];
            const updated = response.data?.data;
            if (updated?._id === offer._id) client.setQueryData(key, updated);
            client.invalidateQueries({ queryKey: key });
            client.invalidateQueries({ queryKey: ['offers'] });
            onClose();
        },
    });
    function change(field, value) {
        setForm(previous => ({ ...previous, [field]: value }));
        setError('');
    }
    const waiting = section === 'events' && !campaign.data && !!form.campaignId;
    function submit(e) {
        e.preventDefault();
        if (waiting || uploading || save.isPending) return;
        setError('');
        try {
            if (section === 'events') {
                const selected = rows.filter(row => row.selected);
                if (!selected.length) throw new Error('Select at least one event.');
                if (selected.some(row => !row.campaignEventId || row.payout === '' || !Number.isFinite(Number(row.payout)) || Number(row.payout) < 0)) {
                    throw new Error('Each selected event needs a valid campaign event and a non-negative user payout.');
                }
                save.mutate({ events: selected.map(row => ({ campaignEventId: row.campaignEventId, userPayout: Number(row.payout) })) });
            } else {
                save.mutate(section === 'basic' ? basicPayload(form) : settingsPayload(form));
            }
        } catch (err) { setError(err.message); }
    }
    return <form onSubmit={submit} className="min-w-0 space-y-4">
        <fieldset disabled={save.isPending} className="min-w-0 space-y-4">
            {section === 'basic' && <>
                <label className={labelStyle}>Offer name<input required className={control} value={form.offerName ?? ''} onChange={e => change('offerName', e.target.value)} /></label>
                <label className={labelStyle}>Description<input required className={control} value={form.comment ?? ''} onChange={e => change('comment', e.target.value)} /></label>
                <Step3Instructions form={form} onChange={change} onUploadingChange={setUploading} />
            </>}
            {section === 'settings' && <>
                <div className="grid gap-3 sm:grid-cols-2">
                    <label className={labelStyle}>Offer status<select className={control} value={form.status} onChange={e => change('status', e.target.value)}>
                        <option value="active">Active</option><option value="inactive">Inactive</option>
                        <option value="paused">Paused</option><option value="expired">Expired</option>
                    </select></label>
                    <label className={labelStyle}>Display priority<input type="number" required min="1" max="999" className={control} value={form.priority ?? 1} onChange={e => change('priority', e.target.value)} /></label>
                </div>
                <Step4QualityPostback form={form} onChange={change} />
            </>}
            {section === 'events' && (waiting
                ? <p role="status" className="text-sm">{campaign.isError ? <>Unable to load campaign events. <button type="button" className="underline" onClick={() => campaign.refetch()}>Try again</button></> : 'Loading campaign events…'}</p>
                : <EventFields rows={rows} onChange={value => { setEditedEvents(value); setError(''); }} />)}
        </fieldset>
        {(error || save.isError) && <p role="alert" className="text-sm text-rose-700">{error || save.error?.message || 'Unable to save changes.'}</p>}
        <div className="flex flex-wrap justify-end gap-2 border-t border-slate-200 pt-3">
            <button type="button" disabled={save.isPending} onClick={onClose} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold">Cancel</button>
            <button disabled={waiting || uploading || save.isPending} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50">{save.isPending ? 'Saving…' : uploading ? 'Uploading…' : 'Save changes'}</button>
        </div>
    </form>;
}
