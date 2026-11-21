import { useSearchParams } from 'react-router-dom';
import { useCallback, useMemo } from 'react';

/**
 * Universal URL Query State Hook
 * 
 * Manages URL query params seamlessly for modals, steppers, and pagination.
 * Enables refresh persistence and browser back/forward navigation.
 */
export function useQueryState() {
    const [searchParams, setSearchParams] = useSearchParams();

    // Query object for convenient access: query.modal, query.page, query.step, etc.
    const query = useMemo(() => {
        const obj = {};
        for (const [key, value] of searchParams.entries()) {
            obj[key] = value;
        }
        return obj;
    }, [searchParams]);

    // Active modal name (or null)
    const modal = searchParams.get('modal') || null;

    // Active step as integer (defaults to 1)
    const step = useMemo(() => {
        const s = parseInt(searchParams.get('step'), 10);
        return isNaN(s) || s < 1 ? 1 : s;
    }, [searchParams]);

    // Update query params (merges with existing params, cleans up undefined/null)
    const setQuery = useCallback((updates = {}, options = { replace: true }) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            Object.entries(updates).forEach(([k, v]) => {
                if (v === null || v === undefined || v === '') {
                    next.delete(k);
                } else {
                    next.set(k, String(v));
                }
            });
            return next;
        }, options);
    }, [setSearchParams]);

    // Open a modal with optional extra params (e.g. step: 1)
    const openModal = useCallback((modalName, extraParams = {}) => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.set('modal', modalName);
            Object.entries(extraParams).forEach(([k, v]) => {
                if (v !== null && v !== undefined && v !== '') {
                    next.set(k, String(v));
                }
            });
            return next;
        }, { replace: false });
    }, [setSearchParams]);

    // Close modal (removes 'modal' and 'step')
    const closeModal = useCallback(() => {
        setSearchParams((prev) => {
            const next = new URLSearchParams(prev);
            next.delete('modal');
            next.delete('step');
            return next;
        }, { replace: true });
    }, [setSearchParams]);

    // Set step for stepper modals
    const setStep = useCallback((newStep) => {
        setQuery({ step: newStep });
    }, [setQuery]);

    return {
        query,
        modal,
        step,
        openModal,
        closeModal,
        setStep,
        setQuery,
    };
}

export default useQueryState;
