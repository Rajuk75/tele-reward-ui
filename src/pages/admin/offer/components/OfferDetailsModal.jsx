import React, { useEffect, useRef } from 'react';
import { CloseIcon, LayersIcon } from '../../../../components/common/Icons';
import { useOfferDetails } from '../hooks/useOfferDetails';
import Step2PayoutEvents from './createOffer/Step2PayoutEvents';
import Step4QualityPostback from './createOffer/Step4QualityPostback';

const inputClass = 'mt-1 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900';
const sectionClass = 'space-y-3 rounded-xl border border-slate-200 bg-white p-4';
const headingClass = 'text-sm font-bold text-slate-900';
const buttonClass = 'rounded-lg border border-slate-300 px-4 py-2 text-xs font-semibold hover:bg-slate-100';

function Field({ label, value, onChange, multiline, options, type = 'text' }) {
    let control;
    if (!onChange) {
        control = <span className="mt-1 block whitespace-pre-line break-words text-xs font-medium text-slate-900">{value ?? '—'}</span>;
    } else if (options) {
        control = <select className={inputClass} value={value ?? ''} onChange={e => onChange(e.target.value)}>
            {options.map(option => <option key={option}>{option}</option>)}
        </select>;
    } else if (multiline) {
        control = <textarea className={inputClass} rows={3} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    } else {
        control = <input className={inputClass} type={type} min={type === 'number' ? 1 : undefined} value={value ?? ''} onChange={e => onChange(e.target.value)} />;
    }
    return <label className="block min-w-0 text-xs font-semibold text-slate-500">{label}{control}</label>;
}

export default function OfferDetailsModal({ offer, onClose }) {
    const dialog = useRef(null);
    const details = useOfferDetails(offer);
    const { form, campaign, editing } = details;
    const selected = form.events.filter(event => event.selected);
    const total = selected.reduce((sum, event) => sum + Number(event.payout || 0), 0);
    const icon = campaign?.imageUrl || campaign?.icon || campaign?.logoUrl;
    const editable = field => editing ? value => details.changeField(field, value) : undefined;

    useEffect(() => {
        const element = dialog.current;
        const overflow = document.body.style.overflow;
        element.showModal();
        document.body.style.overflow = 'hidden';
        return () => {
            element.close();
            document.body.style.overflow = overflow;
        };
    }, []);

    return (
        <dialog ref={dialog} aria-labelledby="offer-details-heading" onCancel={onClose}
            className="fixed inset-0 m-auto max-h-[92vh] w-[min(56rem,94vw)] overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-2xl backdrop:bg-slate-950/60">
            <form className="flex max-h-[92vh] flex-col" onSubmit={event => { event.preventDefault(); details.previewChanges(); }}>
                <header className="flex items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                    <div className="flex min-w-0 items-center gap-3">
                        {icon ? <img src={icon} alt="Campaign icon" className="h-12 w-12 rounded-lg border object-contain" />
                            : <LayersIcon size={24} />}
                        <div className="min-w-0">
                            <p className="text-xs font-semibold text-slate-500">{editing ? 'Edit offer' : 'Offer details'}</p>
                            <h2 id="offer-details-heading" className="break-words text-lg font-bold">{form.offerName || 'Untitled offer'}</h2>
                            <p className="text-xs text-slate-500">{campaign?.name || 'Unlinked campaign'}</p>
                        </div>
                    </div>
                    <button type="button" aria-label="Close offer details" onClick={onClose} className={buttonClass}><CloseIcon size={16} /></button>
                </header>
                <div className="min-h-0 space-y-4 overflow-y-auto bg-slate-50 p-4 [scrollbar-width:thin] [scrollbar-color:#94a3b8_transparent] sm:p-5">
                    {(editing || details.hasPreview) && <p className="rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Local preview. Closing this window discards your changes.</p>}
                    {details.campaignError && <p className="text-xs text-amber-800">Campaign details could not be loaded. Showing the linked offer data.</p>}
                    <section className={sectionClass}>
                        <h3 className={headingClass}>Offer information</h3>
                        <div className="grid gap-3 sm:grid-cols-2">
                            <Field label="Offer name" value={form.offerName} onChange={editable('offerName')} />
                            <Field label="Status" value={form.status} options={['active', 'inactive', 'paused', 'expired']} onChange={editable('status')} />
                            <Field label="Priority" type="number" value={form.priority ?? 1} onChange={editable('priority')} />
                            <Field label="Category / model" value={[form.category, form.model].filter(Boolean).join(' / ') || '—'} />
                        </div>
                        <Field label="Payout summary" value={form.comment} onChange={editable('comment')} />
                        {editing && <Field label="Banner image URL" value={form.backgroundImage} onChange={editable('backgroundImage')} />}
                        {form.backgroundImage && <img src={form.backgroundImage} alt="Offer banner" className="max-h-52 w-full rounded-lg bg-slate-50 object-contain" />}
                    </section>
                    <section className={sectionClass}>
                        <h3 className={headingClass}>Payout events</h3>
                        {editing ? <Step2PayoutEvents form={form} onChange={details.changeField} /> : <>
                            {selected.map(event => {
                                const source = campaign?.events?.find(row => row._id === event.campaignEventId)
                                    || offer.events?.find(row => row.campaignEventId?._id === event.campaignEventId)?.campaignEventId;
                                return <div key={event.campaignEventId} className="flex items-start justify-between gap-3 border-b border-slate-100 pb-2 text-xs">
                                    <div><strong>{event.order}. {event.eventName}</strong>
                                        {source && <p className="mt-1 text-slate-500">Advertiser payout: ₹{source.advertiserPayout ?? 0} · Cap: {source.cap || 'Unlimited'}</p>}
                                    </div>
                                    <span className="font-semibold text-emerald-700">₹{Number(event.payout).toFixed(2)}</span>
                                </div>;
                            })}
                            <p className="text-xs font-semibold">Total user payout: ₹{total.toFixed(2)}</p>
                        </>}
                    </section>
                    <section className={sectionClass}>
                        <h3 className={headingClass}>Instructions and terms</h3>
                        <Field label="Completion steps" multiline value={form.steps} onChange={editable('steps')} />
                        <Field label="Offer terms" multiline value={form.termsAndConditions} onChange={editable('termsAndConditions')} />
                        <Field label="Referral terms" multiline value={form.referTermsAndConditions} onChange={editable('referTermsAndConditions')} />
                    </section>
                    <section className={sectionClass}>
                        <h3 className={headingClass}>Spin and offer settings</h3>
                        {editing ? <Step4QualityPostback form={form} onChange={details.changeField} /> :
                            <div className="grid gap-3 sm:grid-cols-2">
                                <Field label="Spin bonus" value={form.spinEnabled ? 'Enabled' : 'Disabled'} />
                                <Field label="Wheel slices" value={form.spinSlices.map(value => `₹${value}`).join(', ') || 'None'} />
                                <Field label="One UPI per user" value={form.oneUpiOneTime ? 'Enabled' : 'Disabled'} />
                                <Field label="Public visibility" value={form.offerDisplay ? 'Visible' : 'Hidden'} />
                                <Field label="Traffic jumper" value={form.jumperEnabled ? `${form.jumperRatio ?? 0}% · ${form.jumperUrl || '—'}` : 'Disabled'} />
                                <Field label="Custom inputs" value={form.inputEnabled ? form.inputs?.map(input => `${input.label} (${input.type})`).join(', ') : 'Disabled'} />
                            </div>}
                    </section>
                </div>
                <footer className="flex flex-wrap items-center justify-end gap-2 border-t border-slate-200 px-5 py-3">
                    {details.error && <p role="alert" className="mr-auto text-xs text-rose-700">{details.error}</p>}
                    {editing ? <>
                        <button type="button" className={buttonClass} onClick={details.cancelEditing}>Cancel</button>
                        <button type="submit" className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white">Preview changes</button>
                    </> : <button key="edit" type="button" disabled={details.loadingCampaign} onClick={details.startEditing}
                        className="rounded-lg bg-slate-900 px-4 py-2 text-xs font-semibold text-white disabled:opacity-50">Edit offer</button>}
                </footer>
            </form>
        </dialog>
    );
}
