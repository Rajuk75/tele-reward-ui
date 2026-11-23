import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createOffer } from '../../../../services/AppService';
import { useQueryState } from '../../../../hooks/useQueryState';
import { showNotification } from '../../../../components/Toastify/Toast';
import { CloseIcon, CheckIcon } from '../../../../components/common/Icons';

import Step1CampaignInfo from './createOffer/Step1CampaignInfo';
import Step2PayoutEvents from './createOffer/Step2PayoutEvents';
import Step3Instructions from './createOffer/Step3Instructions';
import Step4QualityPostback from './createOffer/Step4QualityPostback';

const STEPS = [
    { id: 1, title: 'Campaign & Info', short: 'Basic' },
    { id: 2, title: 'User Payouts', short: 'Payouts' },
    { id: 3, title: 'Instructions & Content', short: 'Content' },
    { id: 4, title: 'Rules & Controls', short: 'Settings' },
];

const INITIAL_FORM = {
    campaignId: '',
    offerName: '',
    comment: '',
    steps: '',
    termsAndConditions: '',
    referTermsAndConditions: '',
    status: 'active',
    oneUpiOneTime: true,
    offerDisplay: true,
    category: '',
    model: '',
    jumperEnabled: false,
    jumperRatio: '',
    jumperUrl: '',
    spinEnabled: false,
    spinSlicesText: '5, 10, 15, 20, 25',
    spinSlices: [5, 10, 15, 20, 25],
    inputEnabled: false,
    inputs: [{ label: '', type: 'text', order: 1 }],
    priority: 1,
    events: [],
    backgroundImage: '',
};

export default function OfferCreateModal({
    onClose,
    currentStep: propStep,
    onStepChange: propSetStep,
    prefillCampaignId,
}) {
    const queryClient = useQueryClient();
    const queryState = useQueryState();

    const requestedStep = Number(propStep !== undefined ? propStep : queryState.step);
    const currentStep = Number.isInteger(requestedStep)
        ? Math.min(Math.max(requestedStep, 1), STEPS.length)
        : 1;
    const setCurrentStep = propSetStep || queryState.setStep;
    const handleClose = onClose || queryState.closeModal;

    const [form, setForm] = useState({ ...INITIAL_FORM, campaignId: prefillCampaignId || '' });

    useEffect(() => {
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = prevOverflow;
        };
    }, []);

    const handleChange = useCallback((field, value) => {
        setForm(prev => field === 'campaignId' && value !== prev.campaignId
            ? { ...prev, campaignId: value, events: [], offerName: '', comment: '', category: '', model: '' }
            : { ...prev, [field]: value });
    }, []);

    const loadCampaignEvents = useCallback(campaign => {
        setForm(prev => {
            if (prev.campaignId !== campaign._id) return prev;
            const previous = new Map(prev.events.map(row => [row.campaignEventId, row]));
            return {
                ...prev, category: campaign.category, model: campaign.model,
                offerName: prev.offerName || campaign.name,
                comment: prev.comment || campaign.description?.slice(0, 80) || 'Complete task to receive reward',
                events: campaign.events.filter(event => event.status === 'active' && !event.isDeleted).map(event => ({
                    campaignEventId: event._id, eventName: event.name, order: event.order, steps: event.steps,
                    payout: previous.get(event._id)?.payout ?? '',
                    selected: previous.get(event._id)?.selected ?? true,
                })),
            };
        });
    }, []);

    const validateStep = (step) => {
        if (step === 1) {
            if (!form.campaignId) {
                showNotification('Please select a linked campaign', 'error');
                return false;
            }
            if (!(form.offerName || '').trim()) {
                showNotification('Offer title is required', 'error');
                return false;
            }
            if (!(form.comment || '').trim()) {
                showNotification('User payout hook summary is required', 'error');
                return false;
            }
        }
        if (step === 2) {
            const selectedEvents = (form.events || []).filter((e) => e.selected);
            if (selectedEvents.length === 0) {
                showNotification('At least one event must be selected', 'error');
                return false;
            }
            for (let i = 0; i < selectedEvents.length; i++) {
                const ev = selectedEvents[i];
                if (ev.payout === '' || Number(ev.payout) < 0) {
                    showNotification(`Please enter a valid payout for "${ev.eventName || 'Event'}"`, 'error');
                    return false;
                }
            }
        }
        if (step === 3) {
            if (!(form.termsAndConditions || '').trim()) {
                showNotification('Terms & Conditions are required', 'error');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(currentStep + 1);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const mutation = useMutation({
        mutationFn: (payload) => createOffer(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['offers'] });
            queryClient.invalidateQueries({ queryKey: ['campaigns-available'] });
            handleClose();
        },
    });

    const handleSubmit = (e) => {
        if (e) e.preventDefault();
        if (!validateStep(1) || !validateStep(2) || !validateStep(3)) return;

        const { events: rawEvents, ...offerFields } = form;

        const payload = {
            offer: {
                ...offerFields,
                spinSettings: {
                    enabled: !!form.spinEnabled,
                    slices: form.spinSlices && form.spinSlices.length ? form.spinSlices : [5, 10, 15, 20, 25]
                },
                inputs: form.inputEnabled
                    ? (form.inputs || [])
                          .filter((inp) => (inp.label || '').trim())
                          .map((inp, idx) => ({ ...inp, order: idx + 1 }))
                    : [],
                jumperRatio: form.jumperEnabled && form.jumperRatio ? Number(form.jumperRatio) : null,
                jumperUrl: form.jumperEnabled && form.jumperUrl ? form.jumperUrl : null,
            },
            events: (rawEvents || [])
                .filter((ev) => ev.selected)
                .map((ev) => ({
                    campaignEventId: ev.campaignEventId,
                    userPayout: Number(ev.payout),
                })),
        };

        mutation.mutate(payload);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div
                className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header with Title & Step Indicator */}
                <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm font-bold text-slate-900 tracking-tight">Create New Offer</h2>
                            <span className="text-[11px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                                Step {currentStep} of {STEPS.length}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                            {STEPS[currentStep - 1]?.title}
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={handleClose}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-200/60 transition-colors cursor-pointer"
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                {/* Stepper Progress Bar */}
                <div className="px-6 py-2.5 bg-slate-100/60 border-b border-slate-200/80">
                    <div className="grid grid-cols-4 gap-2">
                        {STEPS.map((s) => {
                            const isDone = s.id < currentStep;
                            const isCurrent = s.id === currentStep;

                            return (
                                <button
                                    key={s.id}
                                    type="button"
                                    onClick={() => {
                                        if (s.id < currentStep) setCurrentStep(s.id);
                                    }}
                                    disabled={s.id > currentStep}
                                    className={`flex items-center gap-2 py-1 text-left transition-all ${
                                        isCurrent
                                            ? 'text-slate-950 font-bold'
                                            : isDone
                                            ? 'text-slate-700 hover:text-slate-900 cursor-pointer font-medium'
                                            : 'text-slate-400 opacity-60 cursor-not-allowed'
                                    }`}
                                >
                                    <span
                                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono shrink-0 transition-all ${
                                            isDone
                                                ? 'bg-slate-900 text-white'
                                                : isCurrent
                                                ? 'border-2 border-slate-900 text-slate-900 font-bold'
                                                : 'border border-slate-300 text-slate-400'
                                        }`}
                                    >
                                        {isDone ? <CheckIcon size={10} /> : s.id}
                                    </span>
                                    <span className="text-[11px] truncate hidden sm:inline">{s.short}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Step Body */}
                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {currentStep === 1 && (
                        <Step1CampaignInfo onCampaignLoaded={loadCampaignEvents}
                            form={form}
                            onChange={handleChange}
                            prefillCampaignId={prefillCampaignId}
                        />
                    )}
                    {currentStep === 2 && (
                        <Step2PayoutEvents
                            form={form}
                            onChange={handleChange}
                        />
                    )}
                    {currentStep === 3 && (
                        <Step3Instructions
                            form={form}
                            onChange={handleChange}
                        />
                    )}
                    {currentStep === 4 && (
                        <Step4QualityPostback
                            form={form}
                            onChange={handleChange}
                        />
                    )}
                </div>

                {/* Footer Controls */}
                <div className="px-6 py-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center justify-between">
                    <div>
                        {currentStep > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer shadow-2xs"
                            >
                                Back
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2.5">
                        <button
                            type="button"
                            onClick={handleClose}
                            className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>

                        {currentStep < STEPS.length ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="px-5 py-2 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shadow-2xs"
                            >
                                Continue
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={mutation.isPending}
                                className="px-6 py-2 text-xs font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs disabled:opacity-50"
                            >
                                {mutation.isPending ? 'Publishing Deal...' : 'Publish Offer'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
