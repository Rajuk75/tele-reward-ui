import { useState, useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { getCampaigns, createCampaign, deleteCampaign } from '../../../../services/AppService';
import { useQueryState } from '../../../../hooks/useQueryState';
import { showNotification } from '../../../../components/Toastify/Toast';

export const CAMPAIGN_CATEGORIES = [
    'business', 'education', 'entertainment', 'fantasy', 'finance', 'food',
    'gaming', 'loan', 'news', 'photography', 'productivity', 'shopping', 'travel'
];

export function useCampaigns() {
    const queryClient = useQueryClient();
    const { query, setQuery } = useQueryState();

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 15;
    const setPage = (p) => setQuery({ page: p > 1 ? p : undefined });
    const setLimit = (l) => setQuery({ limit: l !== 15 ? l : undefined, page: undefined });

    const [campaigns, setCampaigns] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterCategory, setFilterCategory] = useState('');
    const [selectedCampaign, setSelectedCampaign] = useState(null);

    // Row & Modal states
    const [expandedId, setExpandedId] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const fetchCampaigns = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const response = await getCampaigns({
                page,
                limit,
                search: search || undefined,
                status: filterStatus || undefined,
                category: filterCategory || undefined,
                campaignId: selectedCampaign?._id,
            });
            const data = response.data?.data;
            setCampaigns(data?.campaigns ?? []);
            setPagination(data?.pagination ?? {});
        } catch (error) {
            console.error('Error fetching campaigns:', error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, search, filterStatus, filterCategory, selectedCampaign?._id]);

    useEffect(() => {
        fetchCampaigns();
    }, [fetchCampaigns]);

    const handleDelete = async (id) => {
        setIsDeleting(true);
        try {
            await deleteCampaign(id);
            setDeleteTarget(null);
            fetchCampaigns();
        } catch (error) {
            console.error('Error deleting campaign:', error);
            setDeleteTarget(null);
        } finally {
            setIsDeleting(false);
        }
    };

    const handleCreate = async (payload) => {
        const response = await createCampaign(payload);
        await Promise.all([
            fetchCampaigns(),
            queryClient.invalidateQueries({ queryKey: ['campaigns-available'] }),
        ]);
        return response.data.data;
    };

    const toggleRow = (id) => setExpandedId((prev) => (prev === id ? null : id));

    const clearFilters = () => {
        setSearch('');
        setFilterStatus('');
        setFilterCategory('');
        setSelectedCampaign(null);
        setPage(1);
    };

    return {
        campaigns,
        pagination,
        isLoading,
        isError,
        refetch: fetchCampaigns,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        filterStatus,
        setFilterStatus,
        filterCategory,
        setFilterCategory,
        selectedCampaign,
        setSelectedCampaign,
        clearFilters,
        // Action states & handlers
        expandedId,
        toggleRow,
        deleteTarget,
        setDeleteTarget,
        isDeleting,
        handleDelete,
        handleCreate,
    };
}
