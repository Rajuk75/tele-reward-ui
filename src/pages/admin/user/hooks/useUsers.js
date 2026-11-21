import { useState, useEffect, useCallback } from 'react';
import { getAllUsers, deleteUser, createAdmin } from '../../../../services/AppService';

export function useUsers() {
    // ==========================================
    // State
    // ==========================================
    const [users, setUsers] = useState([]);
    const [pagination, setPagination] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const [isError, setIsError] = useState(false);

    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(15);
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');

    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [adminForm, setAdminForm] = useState({ name: '', email: '', phone: '', password: '' });
    const [isCreatingAdmin, setIsCreatingAdmin] = useState(false);

    const [deleteTarget, setDeleteTarget] = useState(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // ==========================================
    // Search Debounce
    // ==========================================
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);
        return () => clearTimeout(handler);
    }, [search]);

    // ==========================================
    // Fetch Users
    // ==========================================
    const fetchUsers = useCallback(async () => {
        setIsLoading(true);
        setIsError(false);
        try {
            const response = await getAllUsers({
                page,
                limit,
                search: debouncedSearch || undefined,
                userType: roleFilter === 'all' ? undefined : roleFilter,
                isDeleted: false,
            });
            const data = response.data?.data;
            setUsers(data?.users ?? []);
            setPagination(data?.pagination ?? {});
        } catch (error) {
            console.error('Error fetching users:', error);
            setIsError(true);
        } finally {
            setIsLoading(false);
        }
    }, [page, limit, debouncedSearch, roleFilter]);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    // ==========================================
    // Create Admin
    // ==========================================
    const handleCreateAdmin = async (e) => {
        if (e) e.preventDefault();
        setIsCreatingAdmin(true);
        try {
            await createAdmin(adminForm);
            setAdminForm({ name: '', email: '', phone: '', password: '' });
            setIsAddModalOpen(false);
            fetchUsers();
        } catch (error) {
            console.error('Error creating admin:', error);
        } finally {
            setIsCreatingAdmin(false);
        }
    };

    const closeAddModal = () => {
        setAdminForm({ name: '', email: '', phone: '', password: '' });
        setIsAddModalOpen(false);
    };

    // ==========================================
    // Delete User
    // ==========================================
    const handleDelete = async (userId) => {
        setIsDeleting(true);
        try {
            await deleteUser(userId);
            setDeleteTarget(null);
            fetchUsers();
        } catch (error) {
            console.error('Error deleting user:', error);
        } finally {
            setIsDeleting(false);
        }
    };

    const stats = {
        total: pagination?.total || 1248,
        active: 1180,
        admins: 8,
        standardUsers: 1240,
    };

    return {
        users,
        pagination,
        stats,
        isLoading,
        isError,
        refetch: fetchUsers,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        debouncedSearch,
        roleFilter,
        setRoleFilter: (role) => {
            setRoleFilter(role);
            setPage(1);
        },
        isAddModalOpen,
        openAddModal: () => setIsAddModalOpen(true),
        closeAddModal,
        adminForm,
        setAdminForm,
        isCreatingAdmin,
        handleCreateAdmin,
        deleteTarget,
        openDeleteModal: (user) => setDeleteTarget(user),
        closeDeleteModal: () => setDeleteTarget(null),
        handleDelete,
        isDeleting,
    };
}
