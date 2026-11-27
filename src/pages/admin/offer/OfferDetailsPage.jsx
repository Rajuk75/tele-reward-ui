import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getOfferById } from '../../../services/AppService';
import { showSuccess, showError } from '../../../components/Toastify/Toast';
import { CopyIcon, CheckIcon, ChevronRightIcon } from '../../../components/common/Icons';
import BackButton from '../../../components/common/BackButton';
import { dateTime, display } from '../../../components/common/detailFormat';
import OfferSectionEditor from './components/OfferSectionEditor';
import { Card, Detail, Metric, Metadata } from '../../../components/common/DetailSections';


const secondary = 'inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50';
const money = value => '₹' + Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const statusStyles = { active: 'bg-emerald-50 text-emerald-800', paused: 'bg-amber-50 text-amber-800', expired: 'bg-rose-50 text-rose-800' };

function CopyButton({ value, label, iconOnly = false }) {
    const [copied, setCopied] = useState(false);
    async function copy() {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            showSuccess(`${label} copied`);
        } catch { showError('Clipboard access failed. Copy the link manually.'); }
    }
    const caption = copied ? 'Copied' : `Copy ${label.toLowerCase()}`;
    return <button type="button" onClick={copy} onBlur={() => setCopied(false)}
        title={iconOnly ? caption : undefined}
        className={iconOnly ? 'inline-grid size-8 shrink-0 place-items-center rounded-lg border border-slate-300 bg-white text-slate-700 hover:bg-slate-50' : secondary}>
        {copied ? <CheckIcon /> : <CopyIcon />}<span className={iconOnly ? 'sr-only' : undefined}>{caption}</span>
    </button>;
}

function ConfiguredFields({ items }) {
    return items?.length ? <ul className="space-y-2">{items.map((item, i) => <li key={item._id || i}>
        {typeof item === 'string' ? item : <>{item.order != null && `${item.order}. `}{item.label} ({item.type})
            {item.isRequired != null && (item.isRequired ? ' · Required' : ' · Optional')}
        </>}
    </li>)}</ul> : 'None';
}

const eventColumns = 'grid grid-cols-2 gap-x-3 gap-y-2 @min-[30rem]:grid-cols-[minmax(0,1.5fr)_minmax(0,1.1fr)_minmax(0,.8fr)_minmax(0,1fr)_minmax(0,1fr)]';

function EventValue({ label, children }) {
    return <span className="min-w-0">
        <span className="block text-xs text-slate-500 @min-[30rem]:sr-only">{label}</span>
        {display(children)}
    </span>;
}

function Events({ events, action }) {
    return <Card title="Event details" action={<div className="flex items-center gap-2"><span className="text-xs text-slate-500">{events.length} linked</span>{action}</div>}>
        {events.length ? <div className="@container">
            <div aria-hidden="true" className={`${eventColumns} hidden border-b border-slate-200 pb-2 text-xs font-medium text-slate-500 @min-[30rem]:grid`}>
                <span>Event name</span><span>Event key</span><span>Conversion cap</span>
                <span>Advertiser payout</span><span>User payout</span>
            </div>
            <ol className="divide-y divide-slate-200">{events.map((row, index) => {
                const event = row.campaignEventId || {};
                return <li key={row._id || index}>
                    <details className="group">
                        <summary className={`${eventColumns} cursor-pointer list-none items-start rounded py-3 text-sm tabular-nums hover:bg-slate-50 [&::-webkit-details-marker]:hidden`}>
                            <span className="col-span-2 flex items-start gap-1 font-semibold @min-[30rem]:col-span-1">
                                <ChevronRightIcon className="mt-1 shrink-0 group-open:rotate-90" />
                                {event.order ?? index + 1}. {event.name || row.eventName || 'Milestone'}
                            </span>
                            <EventValue label="Event key">{event.eventKey}</EventValue>
                            <EventValue label="Conversion cap">{event.cap}</EventValue>
                            <EventValue label="Advertiser payout">{money(event.advertiserPayout)}</EventValue>
                            <EventValue label="User payout">{money(row.userPayout)}</EventValue>
                        </summary>
                        <div className="space-y-3 border-t border-slate-100 bg-slate-50 p-3">
                            <dl className="space-y-3">
                                <Detail label="Status">{event.status}</Detail>
                                <Detail label="Event steps">{event.steps}</Detail>
                                <Detail label="Proof required">{event.proofRequired}</Detail>
                                <Detail label="Proof instructions">{event.proofInstructions}</Detail>
                                <Detail label="Proof fields"><ConfiguredFields items={event.proofs} /></Detail>
                                {event.postbackParam && <Detail label="Postback parameter">{event.postbackParam}</Detail>}
                            </dl>
                            <Metadata record={row}>
                                <Detail label="Event created">{dateTime(event.createdAt)}</Detail>
                                <Detail label="Event updated">{dateTime(event.updatedAt)}</Detail>
                            </Metadata>
                        </div>
                    </details>
                </li>;
            })}</ol>
        </div> : <p className="text-sm text-slate-500">No events linked to this offer.</p>}
    </Card>;
}

function OfferView({ offer }) {
    const campaign = typeof offer.campaignId === 'string' ? { _id: offer.campaignId } : offer.campaignId || {};
    const events = Array.isArray(offer.events) ? offer.events : [];
    const total = offer.totalPayout ?? events.reduce((sum, row) => sum + Number(row.userPayout || 0), 0);
    const cap = offer.totalCap ?? events.reduce((sum, row) => sum + Number(row.campaignEventId?.cap || 0), 0);
    const taskUrl = offer.taskUrl || `${window.location.origin}/task/${offer.offerId || offer._id}`;
    const [failedLogo, setFailedLogo] = useState(null);

    const [editing, setEditing] = useState(null);
    function editButton(section, label) {
        return <button type="button" aria-label={`Edit ${label}`} disabled={!!editing} onClick={() => setEditing(section)}
            className={`${secondary} disabled:opacity-50`}>Edit</button>;
    }
    function editor(section) {
        return <OfferSectionEditor section={section} offer={offer} onClose={() => setEditing(null)} />;
    }
    const showCampaignLogo = campaign.imageUrl && failedLogo !== campaign.imageUrl;

    return <>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-4">
            <Metric label="Total user payout">{money(total)}</Metric>
            <Metric label="Total event cap">{cap}</Metric>
            <Metric label="Current installs">{offer.currentInstalls}</Metric>
            <Metric label="Linked events">{events.length}</Metric>
        </dl>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
                <section className="space-y-5 rounded-2xl border border-slate-200 bg-white p-4 sm:p-6">
                    <header className="flex flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 basis-72 items-start gap-4">
                            <div className="flex shrink-0 flex-col items-center gap-2">
                                {showCampaignLogo
                                    ? <img src={campaign.imageUrl} alt={`${campaign.name || 'Campaign'} logo`} onError={() => setFailedLogo(campaign.imageUrl)}
                                        className="size-14 shrink-0 rounded-xl border border-slate-200 object-contain sm:size-16" />
                                    : <span aria-hidden="true" className="grid size-14 shrink-0 place-items-center rounded-xl bg-slate-100 text-xl font-semibold">{offer.offerName?.[0] || '—'}</span>}
                                <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${statusStyles[offer.status] || 'bg-slate-100 text-slate-700'}`}>{offer.status || 'Unknown'}</span>
                            </div>
                            <div className="min-w-0">
                                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{offer.offerName || 'Untitled offer'}</h1>
                                <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{offer.comment}</p>
                                <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
                                    <Detail label="Category">{display(offer.category || campaign.category)}</Detail>
                                    <Detail label="Model">{display(offer.model || campaign.model)}</Detail>
                                </dl>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CopyButton value={taskUrl} label="Task link" iconOnly />
                            {editing !== 'basic' && editButton('basic', 'basic details')}
                        </div>
                    </header>
                    {editing === 'basic' ? editor('basic') : <>
                    {offer.backgroundImage && <img src={offer.backgroundImage} alt="Offer banner" className="max-h-56 w-full rounded-lg object-contain" />}
                    <dl className="space-y-3 border-t border-slate-100 pt-4">
                        <Detail label="Completion steps">{offer.steps}</Detail>
                        <Detail label="Reward journey">{offer.journeySteps?.length ? offer.journeySteps.join(' → ') : 'Auto (from events)'}</Detail>
                        <Detail label="Offer terms">{offer.termsAndConditions}</Detail>
                        <Detail label="Referral terms">{offer.referTermsAndConditions}</Detail>
                    </dl>
                    </>}
                </section>
                <div className="order-last lg:order-none">{editing === 'events' ? <Card title="Event details">{editor('events')}</Card>
                    : <Events events={events} action={editButton('events', 'event details')} />}</div>
            </div>
            <Card title="Offer settings" action={editing !== 'settings' && editButton('settings', 'offer settings')}>
                {editing === 'settings' ? editor('settings') : <>
                <dl className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Offer type">{offer.type}</Detail>
                    <Detail label="Priority">{offer.priority}</Detail>
                    <Detail label="One UPI per completion">{offer.oneUpiOneTime}</Detail>
                    <Detail label="Active">{offer.isActive}</Detail>
                    <Detail label="Spin enabled">{Boolean(offer.spinSettings?.enabled)}</Detail>
                    <Detail label="Spin amounts">{offer.spinSettings?.enabled && offer.spinSettings?.slices?.length ? offer.spinSettings.slices.map(money).join(', ') : 'No'}</Detail>
                    <Detail label="Custom input fields"><ConfiguredFields items={offer.inputs} /></Detail>
                </dl>
                <h3 className="border-t border-slate-100 pt-4 text-sm font-semibold">Tracking and redirection</h3>
                <dl className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Traffic jumper enabled">{offer.jumperEnabled}</Detail>
                    <Detail label="Jumper ratio (%)">{offer.jumperRatio}</Detail>
                    <Detail label="Jumper destination">{offer.jumperUrl && <CopyButton value={offer.jumperUrl} label="Jumper destination" />}</Detail>
                    <Detail label="Jumper clicks">{offer.jumperClickCount}</Detail>
                </dl>
                {offer.postbackUrl && <CopyButton value={offer.postbackUrl} label="Postback URL" />}
                <Metadata record={offer}>
                    <Detail label="Banner image">{offer.backgroundImage && <CopyButton value={offer.backgroundImage} label="Banner URL" />}</Detail>
                </Metadata>
                </>}
            </Card>
        </div>
        <Card title="Campaign details" action={campaign._id && <Link className="text-sm font-medium underline underline-offset-4" to={`/admin/campaigns/${campaign._id}`}>View campaign</Link>}>
            <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Campaign name"><span className="flex items-center gap-3">
                    {showCampaignLogo && <img src={campaign.imageUrl} alt={`${campaign.name || 'Campaign'} logo`}
                        onError={() => setFailedLogo(campaign.imageUrl)}
                        className="size-12 shrink-0 rounded-lg border border-slate-200 object-contain" />}
                    {display(campaign.name)}
                </span></Detail>
                <Detail label="Status">{campaign.status}</Detail>
                {offer.category && campaign.category && campaign.category !== offer.category && <Detail label="Campaign category">{campaign.category}</Detail>}
                {offer.model && campaign.model && campaign.model !== offer.model && <Detail label="Campaign model">{campaign.model}</Detail>}
                {campaign.description && <Detail label="Description">{campaign.description}</Detail>}
                {campaign.advertiser && <Detail label="Advertiser">{campaign.advertiser}</Detail>}
                {campaign.previewUrl && <Detail label="Preview URL"><CopyButton value={campaign.previewUrl} label="Preview URL" /></Detail>}
            </dl>
            <h3 className="border-t border-slate-100 pt-4 text-sm font-semibold">Conversion and traffic rules</h3>
            <dl className="grid gap-4 sm:grid-cols-2">
                <Detail label="Conversion approval">{campaign.conversionApproval}</Detail>
                <Detail label="Approval required">{campaign.needApproval}</Detail>
                <Detail label="Block repeat click IP">{campaign.sameClickIpBlock}</Detail>
                <Detail label="Block repeat conversion IP">{campaign.sameConversionIpBlock}</Detail>
                <Detail label="Conversion delay enabled">{campaign.conversionDelayEnabled}</Detail>
                <Detail label="Delay (minutes)">{campaign.conversionDelayMinutes}</Detail>
                <Detail label="IP whitelist enabled">{campaign.ipWhitelistEnabled}</Detail>
                <Detail label="Whitelisted IPs">{campaign.ipWhitelist?.join(', ') || 'None'}</Detail>
                <Detail label="Shaving enabled">{campaign.shaving?.enabled}</Detail>
                <Detail label="Shaving ratio (%)">{campaign.shaving?.ratio}</Detail>
            </dl>
            <Metadata record={campaign} />
        </Card>
    </>;
}

export default function OfferDetailsPage() {
    const { offerId } = useParams();
    const detail = useQuery({ queryKey: ['offer-details', offerId], queryFn: async () => {
        const response = await getOfferById(offerId);
        const record = response.data?.data;
        if (!record?._id) throw new Error('Offer unavailable');
        return record;
    } });
    return <main className="mx-auto w-full min-w-0 max-w-6xl space-y-5 px-4 py-5 text-slate-900 [overflow-wrap:anywhere] sm:px-6 sm:py-7 lg:px-8">
        <nav aria-label="Offer navigation">
            <BackButton />
        </nav>
        {detail.data ? <OfferView key={offerId} offer={detail.data} /> : <div role="status" className="space-y-3 rounded-2xl border border-slate-200 bg-white p-6">
            <h1 className="text-lg font-semibold">{detail.isError ? 'Unable to load offer details' : 'Loading offer details…'}</h1>
            {detail.isError && <button className={secondary} onClick={() => detail.refetch()}>Try again</button>}
        </div>}
    </main>;
}
