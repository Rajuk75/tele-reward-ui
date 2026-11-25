import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronRightIcon } from '../../../components/common/Icons';
import BackButton from '../../../components/common/BackButton';
import { Card, Detail, Metadata, Metric } from '../../../components/common/DetailSections';
import { getCampaignById } from '../../../services/AppService';
import CampaignSectionEditor from './components/CampaignSectionEditor';

const button = 'inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50';
const money = value => '₹' + Number(value ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

function CampaignEvents({ events }) {
    if (!events.length) return <p className="text-sm text-slate-600">No campaign events configured.</p>;
    return <ol className="divide-y divide-slate-100">{events.map((event, index) => <li key={event._id || index}>
        <details className="group py-2">
            <summary className="grid cursor-pointer list-none grid-cols-2 gap-3 rounded py-1 text-sm hover:bg-slate-50 sm:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,.8fr)_minmax(0,1fr)] [&::-webkit-details-marker]:hidden">
                <span className="flex items-center gap-1 font-semibold"><ChevronRightIcon className="shrink-0 group-open:rotate-90" />{event.order ?? index + 1}. {event.name}</span>
                <span><small className="block text-slate-500">Event key</small>{event.eventKey}</span>
                <span><small className="block text-slate-500">Conversion cap</small>{event.cap}</span>
                <span><small className="block text-slate-500">Advertiser payout</small>{money(event.advertiserPayout)}</span>
            </summary>
            <dl className="mt-3 space-y-3 rounded-lg bg-slate-50 p-3">
                <Detail label="Event status">{event.status}</Detail>
                <Detail label="Event steps">{event.steps}</Detail>
                <Detail label="Proof required">{event.proofRequired}</Detail>
                <Detail label="Proof instructions">{event.proofInstructions}</Detail>
                <Detail label="Proof fields">{event.proofs?.length ? <ul>{event.proofs.map((proof, i) => <li key={i}>{proof.label} ({proof.type}) · {proof.isRequired ? 'Required' : 'Optional'}</li>)}</ul> : 'None'}</Detail>
            </dl>
        </details>
    </li>)}</ol>;
}

function CampaignView({ campaign }) {
    const [params, setParams] = useSearchParams();
    const section = params.get('edit');
    const [failedLogo, setFailedLogo] = useState(null);
    const events = campaign.events ?? [];
    function selectSection(next) {
        setParams(prev => {
            const query = new URLSearchParams(prev);
            if (next) query.set('edit', next);
            else query.delete('edit');
            return query;
        }, { replace: true });
    }
    function edit(name, label) {
        if (section === name) return null;
        return <button type="button" aria-label={`Edit ${label}`} className={button} disabled={['basic','settings','events'].includes(section)} onClick={() => selectSection(name)}>Edit</button>;
    }
    function editor() {
        return <CampaignSectionEditor key={section} campaign={campaign} section={section} onClose={() => selectSection(null)} />;
    }
    return <>
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-slate-200 bg-slate-200 md:grid-cols-4">
            <Metric label="Total advertiser payout">{money(events.reduce((sum, e) => sum + Number(e.advertiserPayout || 0), 0))}</Metric>
            <Metric label="Total event cap">{events.reduce((sum, e) => sum + Number(e.cap || 0), 0)}</Metric>
            <Metric label="Campaign events">{events.length}</Metric>
            <Metric label="Approval mode">{campaign.conversionApproval}</Metric>
        </dl>
        <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] lg:items-start">
            <div className="contents lg:flex lg:min-w-0 lg:flex-col lg:gap-5">
                <Card title="Basic details" action={edit('basic','basic details')}>
                    <header className="flex min-w-0 items-start gap-3">
                        <div className="flex shrink-0 flex-col items-center gap-2">
                            {campaign.imageUrl && failedLogo !== campaign.imageUrl
                                ? <img src={campaign.imageUrl} onError={() => setFailedLogo(campaign.imageUrl)} alt={`${campaign.name} logo`} className="size-14 rounded-xl border border-slate-200 object-contain" />
                                : <span className="grid size-14 place-items-center rounded-xl bg-slate-100 font-semibold">{campaign.name?.[0]}</span>}
                            <span className={`rounded-full px-2 py-1 text-xs font-semibold capitalize ${campaign.status === 'active' ? 'bg-emerald-50 text-emerald-800' : 'bg-slate-100 text-slate-600'}`}>{campaign.status}</span>
                        </div>
                        <div className="min-w-0">
                            <h1 className="text-2xl font-semibold tracking-tight">{campaign.name}</h1>
                            <p className="mt-1 whitespace-pre-line text-sm text-slate-600">{campaign.description}</p>
                            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2"><Detail label="Category">{campaign.category}</Detail><Detail label="Model">{campaign.model}</Detail></dl>
                        </div>
                    </header>
                    {section === 'basic' ? editor() : <Metadata record={campaign} />}
                </Card>
                <div className="order-last lg:order-none"><Card title="Event details" action={edit('events','campaign events')}>
                    {section === 'events' ? editor() : <CampaignEvents events={events} />}
                </Card></div>
            </div>
            <Card title="Campaign settings" action={edit('settings','campaign settings')}>
                {section === 'settings' ? editor() : <dl className="grid gap-4 sm:grid-cols-2">
                    <Detail label="Conversion approval">{campaign.conversionApproval}</Detail>
                    <Detail label="Approval required">{campaign.needApproval}</Detail>
                    <Detail label="Block repeat click IP">{campaign.sameClickIpBlock}</Detail>
                    <Detail label="Block repeat conversion IP">{campaign.sameConversionIpBlock}</Detail>
                    <Detail label="Conversion delay enabled">{campaign.conversionDelayEnabled}</Detail>
                    <Detail label="Delay (minutes)">{campaign.conversionDelayMinutes}</Detail>
                    <Detail label="IP whitelist enabled">{campaign.ipWhitelistEnabled}</Detail>
                    <Detail label="Allowed IP addresses">{campaign.ipWhitelist?.join(', ') || 'None'}</Detail>
                    <Detail label="Shaving enabled">{campaign.shaving?.enabled}</Detail>
                    <Detail label="Shaving ratio (%)">{campaign.shaving?.ratio}</Detail>
                </dl>}
            </Card>
        </div>
    </>;
}

export default function CampaignDetailsPage() {
    const { campaignId } = useParams();
    const query = useQuery({
        queryKey: ['campaign-detail', campaignId], queryFn: async () => {
            const response = await getCampaignById(campaignId);
            const record = response.data?.data?.campaign ?? response.data?.data;
            if (!record?._id) throw new Error('Campaign unavailable');
            return record;
        },
    });
    return <div className="mx-auto w-full min-w-0 max-w-6xl space-y-5 px-4 py-5 text-slate-900 [overflow-wrap:anywhere] sm:px-6 sm:py-7 lg:px-8">
        <BackButton to="/admin/campaigns" aria-label="Back to campaigns" />
        {query.data ? <CampaignView key={campaignId} campaign={query.data} /> : <div role="status" className="space-y-3 rounded-xl border border-slate-200 bg-white p-5">
            <p>{query.isError ? 'Unable to load campaign details.' : 'Loading campaign details…'}</p>
            {query.isError && <button className={button} onClick={() => query.refetch()}>Try again</button>}
        </div>}
    </div>;
}
