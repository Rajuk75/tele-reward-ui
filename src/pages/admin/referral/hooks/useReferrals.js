import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
    getReferrals, 
    createReferral, 
    updateReferral, 
    deleteReferral, 
    getAllPartners, 
    createPartner, 
    getOffers 
} from '../../../../services/AppService';
import { useQueryState } from '../../../../hooks/useQueryState';
import { showNotification } from '../../../../components/Toastify/Toast';

export function useReferrals() {
    const { query, setQuery } = useQueryState();

    // URL sync for pagination
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const setPage = (p) => setQuery({ page: p > 1 ? p : undefined });
    const setLimit = (l) => setQuery({ limit: l !== 15 ? l : undefined, page: undefined });

    // Table & filter states
    const [referrals, setReferrals] = useState([]);
    const [pagination, setPagination] = useState({ total: 0, totalPages: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');

    // Auxiliary dropdown data
    const [partners, setPartners] = useState([]);
    const [isLoadingPartners, setIsLoadingPartners] = useState(false);

    const [offers, setOffers] = useState([]);
    const [isLoadingOffers, setIsLoadingOffers] = useState(false);

    // Modal & action states
    const [isCreateReferralOpen, setIsCreateReferralOpen] = useState(false);
    const [isCreatePartnerOpen, setIsCreatePartnerOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
    const [isSubmittingReferral, setIsSubmittingReferral] = useState(false);
    const [isSubmittingPartner, setIsSubmittingPartner] = useState(false);
    const [copiedCode, setCopiedCode] = useState(null);

    // 1. Fetch Referrals
    const fetchReferrals = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const response = await getReferrals({
                page,
                limit,
                search: search ? search.trim() : undefined,
                status: status || undefined,
            });
            const data = response?.data?.data;
            setReferrals(data?.referrals ?? []);
            setPagination(data?.pagination ?? { total: 0, totalPages: 1 });
        } catch (error) {
            console.error('Error fetching referrals:', error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search, status]);

    useEffect(() => {
        fetchReferrals();
    }, [fetchReferrals]);

    // 2. Fetch Partners for dropdown
    const fetchPartners = useCallback(async () => {
        setIsLoadingPartners(true);
        try {
            const response = await getAllPartners({ status: 'active' });
            const list = response?.data?.data?.partners ?? [];
            setPartners(list);
        } catch (error) {
            console.error('Error fetching partners:', error);
        } finally {
            setIsLoadingPartners(false);
        }
    }, []);

    // 3. Fetch Active Offers for dropdown
    const fetchOffers = useCallback(async () => {
        setIsLoadingOffers(true);
        try {
            const response = await getOffers({ status: 'active', limit: 100 });
            const list = response?.data?.data?.offers ?? response?.data?.offers ?? [];
            setOffers(list);
        } catch (error) {
            console.error('Error fetching active offers:', error);
        } finally {
            setIsLoadingOffers(false);
        }
    }, []);

    // Load partners & offers when create modal opens
    useEffect(() => {
        if (isCreateReferralOpen) {
            fetchPartners();
            fetchOffers();
        }
    }, [isCreateReferralOpen, fetchPartners, fetchOffers]);

    // Actions
    const handleDelete = async (id) => {
        setIsDeleting(true);
        try {
            await deleteReferral(id);
            setDeleteTarget(null);
            fetchReferrals();
        } catch (error) {
            console.error('Error deleting referral:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (referral) => {
        setIsUpdatingStatus(true);
        try {
            const nextStatus = referral.status === 'active' ? 'paused' : 'active';
            await updateReferral(referral.id || referral._id, { status: nextStatus });
            fetchReferrals();
        } catch (error) {
            console.error('Error toggling referral status:', error);
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const handleCreateReferral = async (payload) => {
        setIsSubmittingReferral(true);
        try {
            await createReferral(payload);
            setIsCreateReferralOpen(false);
            fetchReferrals();
            return true;
        } catch (error) {
            console.error('Error creating referral:', error);
            return false;
        } finally {
            setIsSubmittingReferral(false);
        }
    };

    const handleCreatePartner = async (payload) => {
        setIsSubmittingPartner(true);
        try {
            const res = await createPartner(payload);
            setIsCreatePartnerOpen(false);
            await fetchPartners();
            return res?.data?.data?.partner || true;
        } catch (error) {
            console.error('Error creating partner:', error);
            return false;
        } finally {
            setIsSubmittingPartner(false);
        }
    };

    const copyToClipboard = (text, code) => {
        if (!text) return;
        navigator.clipboard.writeText(text);
        setCopiedCode(code);
        showNotification('Link copied to clipboard', 'info');
        setTimeout(() => setCopiedCode(null), 2500);
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setPage(1);
    };

    const hasActiveFilters = Boolean(search || status);

    // Summary Statistics
    const stats = useMemo(() => {
        const total = pagination.total ?? referrals.length;
        const active = referrals.filter((r) => r.status === 'active').length;
        const clicks = referrals.reduce((sum, r) => sum + (r.totalClicks || 0), 0);
        const conversions = referrals.reduce((sum, r) => sum + (r.totalConversions || 0), 0);
        const earningsINR = referrals.reduce((sum, r) => sum + (r.totalEarningsINR || 0), 0);

        return {
            total,
            active,
            clicks,
            conversions,
            earningsINR: earningsINR.toFixed(2),
        };
    }, [pagination.total, referrals]);

    return {
        // Data
        referrals,
        pagination,
        stats,
        partners,
        offers,
        isLoading,
        isError,
        isLoadingPartners,
        isLoadingOffers,

        // Filters & Pagination
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        status,
        setStatus,
        clearFilters,
        hasActiveFilters,

        // Modal visibility
        isCreateReferralOpen,
        setIsCreateReferralOpen,
        isCreatePartnerOpen,
        setIsCreatePartnerOpen,
        deleteTarget,
        setDeleteTarget,

        // Action loading states
        isDeleting,
        isUpdatingStatus,
        isSubmittingReferral,
        isSubmittingPartner,
        copiedCode,

        // Handlers
        refetch: fetchReferrals,
        fetchPartners,
        fetchOffers,
        handleDelete,
        handleToggleStatus,
        handleCreateReferral,
        handleCreatePartner,
        copyToClipboard,
    };
}
