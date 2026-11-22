import { useCallback, useEffect, useState } from 'react';
import { useQueryState } from '../../../../hooks/useQueryState';

export const STEPS = [
    { id: 1, title: 'Campaign details', short: 'Details' },
    { id: 2, title: 'Events & payout', short: 'Events' },
    { id: 3, title: 'Conversion settings', short: 'Settings' },
];

const INITIAL_FORM = {
    name: '',
    imageUrl: '',
    category: 'business',
    model: 'CPI',
    status: 'active',
    campaignUrl: '',
    events: [{ name: '', advertiserPayout: '', cap: 1000, order: 1 }],
    conversionApproval: 'automatic',
    sameClickIpBlock: true,
    sameConversionIpBlock: true,
};

export function useCreateCampaign({
    onClose,
    onCreate,
    currentStep: propStep,
    onStepChange: propSetStep
}) {
    const queryState = useQueryState();

    const requestedStep = Number(propStep !== undefined ? propStep : queryState.step);
    const currentStep = Number.isInteger(requestedStep)
        ? Math.min(Math.max(requestedStep, 1), STEPS.length)
        : 1;
    const setCurrentStep = propSetStep || queryState.setStep;
    const handleClose = onClose || queryState.closeModal;

    const [form, setForm] = useState(INITIAL_FORM);
    const [created, setCreated] = useState(null);
    const [validationError, setValidationError] = useState('');

    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        const previousOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = previousOverflow; };
    }, []);

    const handleChange = useCallback((field, value) => {
        setValidationError('');
        setForm((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleBack = () => setCurrentStep(currentStep - 1);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape' && !isSubmitting) handleClose();
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [handleClose, isSubmitting]);

    const handleSubmit = async (event) => {
        event.preventDefault();
        if (isSubmitting) return;
        if (!form.name.trim() || !form.imageUrl.trim() || !form.campaignUrl.trim()) {
            setCurrentStep(1);
            setValidationError('Enter the campaign title, image URL and destination URL.');
            return;
        }
        if (currentStep === 1) {
            setCurrentStep(2);
            return;
        }
        const events = form.events.map((row, index) => ({
            name: row.name.trim(),
            eventKey: (row.eventKey?.trim() || row.name.trim()).toLowerCase(),
            advertiserPayout: Number(row.advertiserPayout),
            cap: Number(row.cap),
            order: index + 1,
        }));
        if (events.some(row => !row.name) || new Set(events.map(row => row.eventKey)).size !== events.length) {
            setCurrentStep(2);
            setValidationError('Enter a name and a distinct postback key for each milestone.');
            return;
        }

        if (currentStep === 2) {
            setCurrentStep(3);
            return;
        }

        setIsSubmitting(true);
        try {
            const { events: _formEvents, ...campaignFields } = form;
            const campaign = await onCreate({
                campaign: {
                    ...campaignFields,
                    name: form.name.trim(),
                    imageUrl: form.imageUrl.trim(),
                    campaignUrl: form.campaignUrl.trim(),
                },
                events,
            });
            setCreated(campaign);
        } catch (error) {
            console.error('Campaign submission failed', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return {
        form, created, validationError, isSubmitting, currentStep,
        setCurrentStep, handleChange, handleSubmit, handleBack, handleClose,
    };
}
