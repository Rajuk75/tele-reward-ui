import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getCampaignById } from '../../../../services/AppService';

export function buildForm(offer, campaign) {
    const events = (offer.events || []).map((row, index) => {
        const event = row.campaignEventId;
        return {
            campaignEventId: event?._id || event,
            eventName: event?.name || row.eventName || `Milestone ${index + 1}`,
            order: event?.order ?? row.order ?? index + 1,
            payout: row.userPayout ?? row.payout ?? 0,
            selected: true,
        };
    });
    const linkedIds = new Set(events.map(event => event.campaignEventId));
    for (const event of campaign?.events || []) {
        if (!linkedIds.has(event._id) && !event.isDeleted && event.status === 'active') {
            events.push({ campaignEventId: event._id, eventName: event.name, order: event.order, selected: false, payout: '' });
        }
    }
    const slices = offer.spinSettings?.slices ?? [5, 10, 15, 20, 25];
    return {
        ...offer,
        campaignId: offer.campaignId?._id || offer.campaignId,
        events,
        journeyStepsText: Array.isArray(offer.journeySteps) ? offer.journeySteps.join(', ') : '',
        inputEnabled: !!offer.inputs?.length,
        spinEnabled: !!offer.spinSettings?.enabled,
        spinSlicesText: slices.join(', '),
        spinSlices: slices,
    };
}

export function useOfferDetails(offer) {
    const campaignId = offer.campaignId?._id || offer.campaignId;
    const campaignQuery = useQuery({
        queryKey: ['campaign-detail', campaignId],
        queryFn: async () => {
            const response = await getCampaignById(campaignId);
            return response.data?.data?.campaign ?? response.data?.data;
        },
        enabled: !!campaignId,
    });
    const campaign = campaignQuery.data || offer.campaignId;
    const [preview, setPreview] = useState(null);
    const [draft, setDraft] = useState(null);
    const [error, setError] = useState('');
    const form = draft || preview || buildForm(offer, campaign);

    function startEditing() {
        setError('');
        setDraft(form);
    }

    function changeField(field, value) {
        setDraft(current => ({ ...current, [field]: value }));
        setError('');
    }

    function previewChanges() {
        const selected = draft.events.filter(event => event.selected);
        const slices = draft.spinSlicesText.split(',').map(value => value.trim());
        if (!draft.offerName?.trim()) return setError('Enter an offer name.');
        if (!selected.length) return setError('Select at least one payout event.');
        if (selected.some(event => event.payout === '' || !Number.isFinite(Number(event.payout)) || Number(event.payout) < 0)) {
            return setError('Enter a valid payout for each selected event.');
        }
        if (draft.spinEnabled && (slices.length < 2 || slices.some(value => !value || !Number.isFinite(Number(value)) || Number(value) < 0))) {
            return setError('Enter at least two non-negative spin amounts, separated by commas.');
        }
        setPreview({ ...draft, spinSlices: draft.spinEnabled ? slices.map(Number) : draft.spinSlices });
        setDraft(null);
    }

    function cancelEditing() {
        setDraft(null);
        setError('');
    }

    return {
        form, campaign, editing: !!draft, hasPreview: !!preview, error,
        loadingCampaign: !!campaignId && campaignQuery.isLoading,
        campaignError: campaignQuery.isError, startEditing, changeField, previewChanges, cancelEditing,
    };
}
