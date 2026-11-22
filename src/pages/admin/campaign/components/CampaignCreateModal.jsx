import React from 'react';
import { STEPS, useCreateCampaign } from '../hooks/useCreateCampaign';
import { FiArrowLeft, FiArrowRight, FiCheck, FiCheckCircle, FiX } from 'react-icons/fi';

import Step1Basic from './createCampaign/Step1Basic';
import Step2Events from './createCampaign/Step2Events';
import Step3ConversionSettings from './createCampaign/Step3ConversionSettings';

export default function CampaignCreateModal(props) {
    const {
        form, created, validationError, isSubmitting, currentStep,
        setCurrentStep, handleChange, handleSubmit, handleBack, handleClose,
    } = useCreateCampaign(props);

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-3 font-sans backdrop-blur-[2px] sm:p-6 animate-in fade-in duration-200"
            role="presentation"
            onMouseDown={(event) => {
                if (event.target === event.currentTarget && !isSubmitting) handleClose();
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
                        disabled={isSubmitting}
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
                                        disabled={isSubmitting || (!isDone && !isActive)}
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
                                <p className="mt-1 text-xs text-slate-500">Saved with {created.events?.length || 0} milestone{created.events?.length === 1 ? '' : 's'}.</p>
                            </div>
                            <div>
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
                        <form onSubmit={handleSubmit} id="campaign-step-form">
                            {currentStep === 1 && (
                                <Step1Basic form={form} onChange={handleChange} />
                            )}
                            {currentStep === 2 && (
                                <fieldset disabled={isSubmitting}><Step2Events form={form} onChange={handleChange} /></fieldset>
                            )}
                            {currentStep === 3 && (
                                <Step3ConversionSettings form={form} onChange={handleChange} disabled={isSubmitting} />
                            )}
                            {validationError && <p role="alert" className="mt-3 text-sm text-red-600">{validationError}</p>}
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
                                    disabled={isSubmitting}
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
                                    type="submit"
                                    form="campaign-step-form"
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold leading-none text-white shadow-sm transition-colors hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                                >
                                    <span>Next step</span>
                                    <FiArrowRight size={16} aria-hidden="true" className="shrink-0" />
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    form="campaign-step-form"
                                    disabled={isSubmitting}
                                    className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold leading-none text-white shadow-sm transition-colors enabled:hover:bg-slate-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Creating...' : 'Create Campaign'}
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
