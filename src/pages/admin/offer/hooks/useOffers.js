import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOffers, deleteOffer, updateOfferStatus } from '../../../../services/AppService';
import { useQueryState } from '../../../../hooks/useQueryState';
import { showNotification } from '../../../../components/Toastify/Toast';

export function useOffers() {
    const navigate = useNavigate();
    const { query, setQuery, openModal } = useQueryState();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const setPage = (p) => setQuery({ page: p > 1 ? p : undefined });
    const setLimit = (l) => setQuery({ limit: l !== 15 ? l : undefined, page: undefined });

    const [offers, setOffers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const [search, setSearch] = useState('');
    const [status, setStatus] = useState('');
    const [selectedOffer, setSelectedOffer] = useState(null);

    // Action states
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [detailTarget, setDetailTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const fetchOffers = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const response = await getOffers({
                page,
                limit,
                search: search || undefined,
                status: status || undefined,
                offerId: selectedOffer?._id || undefined,
            });
            const data = response.data?.data;
            setOffers(data?.offers ?? []);
            setPagination(data?.pagination ?? {});
        } catch (error) {
            console.error('Error fetching offers:', error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search, status, selectedOffer?._id]);

    useEffect(() => {
        fetchOffers();
    }, [fetchOffers]);

    const handleDelete = async (id) => {
        setIsDeleting(true);
        try {
            await deleteOffer(id);
            setDeleteTarget(null);
            fetchOffers();
            showNotification('Offer deleted successfully', 'success');
        } catch (error) {
            console.error('Error deleting offer:', error);
            showNotification(error?.response?.data?.message || 'Failed to delete offer', 'error');
            setDeleteTarget(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleToggleStatus = async (offer) => {
        setIsUpdatingStatus(true);
        try {
            const nextStatus = offer.status === 'active' ? 'inactive' : 'active';
            await updateOfferStatus(offer._id, {
                status: nextStatus,
                isActive: nextStatus === 'active',
            });
            fetchOffers();
            showNotification(`Offer ${nextStatus === 'active' ? 'activated' : 'deactivated'} successfully`, 'success');
        } catch (error) {
            console.error('Error updating offer status:', error);
            showNotification(error?.response?.data?.message || 'Failed to update offer status', 'error');
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const goToBanner = (id) => {
        navigate(`/admin/offers/${id}/banner`);
    };

    const openCreate = () => {
        openModal('create-offer', { step: 1 });
    };

    const clearFilters = () => {
        setSearch('');
        setStatus('');
        setSelectedOffer(null);
        setPage(1);
    };

    // Summary statistics
    const totalOffers = pagination.total ?? offers.length;
    const activeOffers = offers.filter((o) => o.status === 'active' || o.isActive).length;
    const visibleOffers = offers.filter((o) => o.offerDisplay).length;
    const avgPayout = offers.length > 0
        ? Math.round(offers.reduce((acc, o) => acc + (o.totalPayout || 0), 0) / offers.length)
        : 0;

    const stats = {
        total: totalOffers,
        active: activeOffers,
        visible: visibleOffers,
        avgPayout,
    };

    return {
        offers,
        pagination,
        stats,
        isLoading,
        isError,
        refetch: fetchOffers,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        status,
        setStatus,
        selectedOffer,
        setSelectedOffer,
        clearFilters,
        // Action states & handlers
        detailTarget,
        setDetailTarget,
        deleteTarget,
        setDeleteTarget,
        isDeleting,
        isUpdatingStatus,
        handleDelete,
        handleToggleStatus,
        goToBanner,
        openCreate,
    };
}
