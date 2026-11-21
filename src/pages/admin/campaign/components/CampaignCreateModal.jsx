import React, { useCallback, useEffect, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createCampaign } from '../../../../services/AppService';
import { useQueryState } from '../../../../hooks/useQueryState';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiCopy, FiX } from 'react-icons/fi';
import { showNotification } from '../../../../components/Toastify/Toast';

import Step1Basic from './createCampaign/Step1Basic';
import Step2Events from './createCampaign/Step2Events';
import Step3Budget from './createCampaign/Step3Budget';
import Step4Offer from './createCampaign/Step4Offer';

const STEPS = [
    { id: 1, title: 'Campaign details', short: 'Details' },
    { id: 2, title: 'Events & payout', short: 'Events' },
    { id: 3, title: 'Budget & safety', short: 'Budget' },
    { id: 4, title: 'Offer setup', short: 'Offer' },
];

const INITIAL_FORM = {
    name: '',
    category: '',
    model: '',
    status: 'active',
    campaignUrl: '',
    events: [{ name: '', objective: 'CPI', payout: '', order: 1 }],
    dailyCap: '',
    dailyBudget: '',
    totalCap: '',
    totalBudget: '',
    conversionApproval: 'automatic',
    sameClickIpBlock: true,
    sameConversionIpBlock: true,
    autoCreateOffer: true,
    userPayout: '',
    platforms: ['telegram'],
    offerSteps: '',
};

export default function CampaignCreateModal({ 
    onClose,
    currentStep: propStep,
    onStepChange: propSetStep
}) {
    const queryClient = useQueryClient();
    const queryState = useQueryState();

    const requestedStep = Number(propStep !== undefined ? propStep : queryState.step);
    const currentStep = Number.isInteger(requestedStep)
        ? Math.min(Math.max(requestedStep, 1), STEPS.length)
        : 1;
    const setCurrentStep = propSetStep || queryState.setStep;
    const handleClose = onClose || queryState.closeModal;

    const [form, setForm] = useState(INITIAL_FORM);
    const [created, setCreated] = useState(null);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    const handleChange = useCallback((field, value) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const validateStep = (step) => {
        if (step === 1) {
            if (!(form.name || '').trim()) {
                showNotification('Campaign title is required', 'error');
                return false;
            }
            if (!(form.campaignUrl || '').trim()) {
                showNotification('Advertiser destination URL is required', 'error');
                return false;
            }
        }
        if (step === 2) {
            if (!form.events || form.events.length === 0) {
                showNotification('At least one conversion milestone event is required', 'error');
                return false;
            }
            for (let i = 0; i < form.events.length; i++) {
                const ev = form.events[i];
                if (!(ev.name || '').trim()) {
                    showNotification(`Milestone #${i + 1} name is required`, 'error');
                    return false;
                }
                if (ev.payout === '' || Number(ev.payout) < 0) {
                    showNotification(`Milestone #${i + 1} advertiser payout must be entered`, 'error');
                    return false;
                }
            }
        }
        if (step === 4 && form.autoCreateOffer) {
            if (form.userPayout === '' || Number(form.userPayout) < 0) {
                showNotification('User reward payout is required', 'error');
                return false;
            }
        }
        return true;
    };

    const handleNext = () => {
        if (!validateStep(currentStep)) return;
        const next = Math.min(currentStep + 1, STEPS.length);
        setCurrentStep(next);
    };

    const handleBack = () => {
        const prev = Math.max(currentStep - 1, 1);
        setCurrentStep(prev);
    };

    const mutation = useMutation({
        mutationFn: (payload) => createCampaign(payload),
        onSuccess: (res) => {
            queryClient.invalidateQueries({ queryKey: ['campaigns'] });
            setCreated(res.data?.data?.campaign || res.data?.data);
            showNotification('Campaign created successfully!', 'success');
        },
        onError: (err) => {
            showNotification(err.message || 'Failed to create campaign', 'error');
        }
    });

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !mutation.isPending) handleClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, mutation.isPending]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!validateStep(currentStep)) return;

        // Build Clean Payload
        const payload = {
            name: (form.name || '').trim(),
            category: form.category || '',
            model: form.model || '',
            status: form.status || 'active',
            campaignUrl: (form.campaignUrl || '').trim(),
            
            // Events
            events: (form.events || []).map((ev, idx) => ({
                name: (ev.name || '').trim(),
                eventKey: (ev.eventKey || ev.name || '').trim().toLowerCase(),
                objective: ev.objective || form.model || 'CPI',
                payout: Number(ev.payout) || 0,
                advertiserPayout: Number(ev.payout) || 0,
                order: ev.order || idx + 1,
            })),

            // 4 Scalable Budget & Cap fields
            dailyCap: form.dailyCap ? Number(form.dailyCap) : 0,
            dailyBudget: form.dailyBudget ? Number(form.dailyBudget) : 0,
            totalCap: form.totalCap ? Number(form.totalCap) : 0,
            totalBudget: form.totalBudget ? Number(form.totalBudget) : 0,

            // Fraud settings
            conversionApproval: form.conversionApproval || 'automatic',
            sameClickIpBlock: form.sameClickIpBlock !== false,
            sameConversionIpBlock: form.sameConversionIpBlock !== false,

            // Optional Auto-Offer
            autoCreateOffer: Boolean(form.autoCreateOffer),
            offer: form.autoCreateOffer ? {
                userPayout: Number(form.userPayout) || 0,
                platforms: form.platforms || ['telegram'],
                steps: form.offerSteps || '',
            } : null,
        };

        mutation.mutate(payload);
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 font-sans backdrop-blur-[2px] sm:p-6 animate-in fade-in duration-200"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !mutation.isPending) handleClose();
            }}
        >
            <section
                role="dialog"
                aria-modal="true"
                aria-labelledby="campaign-modal-title"
                className="relative flex max-h-[94vh] w-full max-w-[820px] flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_24px_80px_-24px_rgba(15,23,42,0.45)]"
            >
                
                {/* Modal Header */}
                <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4 sm:px-7 sm:py-5">
                    <div>
                        <h2 id="campaign-modal-title" className="text-lg font-semibold tracking-tight text-slate-950">
                            Create campaign
                        </h2>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={mutation.isPending}
                        aria-label="Close campaign modal"
                        className="grid size-9 place-items-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        <FiX size={17} />
                    </button>
                </div>

                {/* Stepper Progress Bar (Only when not created) */}
                {!created && (
                    <nav aria-label="Campaign creation progress" className="border-b border-slate-200 bg-slate-50/70 px-5 py-3 sm:px-7">
                        <ol className="flex items-center">
                        {STEPS.map((s, idx) => {
                            const isDone = currentStep > s.id;
                            const isActive = currentStep === s.id;
                            return (
                                <li key={s.id} className="flex flex-1 items-center last:flex-none">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (s.id < currentStep) setCurrentStep(s.id);
                                        }}
                                        disabled={!isDone && !isActive}
                                        aria-current={isActive ? 'step' : undefined}
                                        className={`flex items-center gap-2 whitespace-nowrap text-xs font-medium transition-colors ${
                                            isActive 
                                                ? 'text-slate-950' 
                                                : isDone 
                                                    ? 'text-slate-600 hover:text-slate-950' 
                                                    : 'cursor-not-allowed text-slate-400'
                                        }`}
                                    >
                                        <span className={`grid size-6 place-items-center rounded-full text-[11px] font-semibold transition-colors ${
                                            isDone 
                                                ? 'bg-slate-900 text-white' 
                                                : isActive 
                                                    ? 'bg-indigo-600 text-white ring-4 ring-indigo-100' 
                                                    : 'border border-slate-200 bg-white text-slate-400'
                                        }`}>
                                            {isDone ? <FiCheck size={12} /> : s.id}
                                        </span>
                                        <span className="hidden sm:inline">{s.title}</span>
                                        <span className="sm:hidden">{s.short}</span>
                                    </button>
                                    {idx < STEPS.length - 1 && (
                                        <span className={`mx-2 h-px flex-1 sm:mx-4 ${
                                            currentStep > s.id ? 'bg-slate-400' : 'bg-slate-200'
                                        }`} />
                                    )}
                                </li>
                            );
                        })}
                        </ol>
                    </nav>
                )}

                {/* Modal Body / Steps */}
                <div className="flex-1 overflow-y-auto bg-white px-5 py-5 sm:px-7 sm:py-6">
                    {created ? (
                        /* Success View */
                        <div className="mx-auto max-w-md space-y-6 px-4 py-8 text-center">
                            <div className="mx-auto flex size-16 items-center justify-center rounded-full border border-emerald-100 bg-emerald-50 text-emerald-600">
                                <FiCheckCircle size={32} />
                            </div>
                            <div>
                                <h3 className="text-xl font-semibold tracking-tight text-slate-950">{created.name}</h3>
                                <p className="mt-1 text-xs text-slate-500">Campaign is live and ready to receive traffic.</p>
                            </div>

                            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-left">
                                <span className="mb-1 block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                                    Telegram Mini App Task Link
                                </span>
                                <span className="block select-all break-all font-mono text-xs font-medium text-indigo-600">
                                    {`https://t.me/your_bot?start=task_${created._id}`}
                                </span>
                            </div>

                            <div className="flex flex-col gap-2.5 pt-2">
                                <button
                                    type="button"
                                    onClick={() => {
                                        navigator.clipboard.writeText(`https://t.me/your_bot?start=task_${created._id}`);
                                        showNotification('Link copied to clipboard!', 'success');
                                    }}
                                    className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-indigo-600"
                                >
                                    <FiCopy size={14} />
                                    Copy Link
                                </button>
                                <button
                                    type="button"
                                    onClick={handleClose}
                                    className="h-10 w-full rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-50"
                                >
                                    Done & Close
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* Multi-Step Forms */
                        <form onSubmit={handleSubmit} id="campaign-step-form" noValidate>
                            {currentStep === 1 && (
                                <Step1Basic form={form} onChange={handleChange} />
                            )}
                            {currentStep === 2 && (
                                <Step2Events form={form} onChange={handleChange} />
                            )}
                            {currentStep === 3 && (
                                <Step3Budget form={form} onChange={handleChange} />
                            )}
                            {currentStep === 4 && (
                                <Step4Offer form={form} onChange={handleChange} />
                            )}
                        </form>
                    )}
                </div>

                {/* Footer Navigation Buttons */}
                {!created && (
                    <div className="flex items-center justify-between border-t border-slate-200 bg-slate-50/70 px-5 py-3.5 sm:px-7">
                        <div>
                            {currentStep > 1 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    className="inline-flex h-9 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 text-xs font-semibold text-slate-700 shadow-sm transition-colors hover:border-slate-300 hover:bg-slate-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    <FiArrowLeft size={13} />
                                    Back
                                </button>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            {currentStep < STEPS.length ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold leading-none text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    <span>Next step</span>
                                    <FiArrowRight size={16} aria-hidden="true" className="shrink-0" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    form="campaign-step-form"
                                    disabled={mutation.isPending}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold leading-none text-white shadow-sm transition-colors enabled:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {mutation.isPending ? 'Creating...' : 'Create Campaign'}
                                    <FiCheck size={16} aria-hidden="true" className="shrink-0" />
                                </button>
                            )}
                        </div>
                    </div>
                )}
            </section>
        </div>
    );
}
