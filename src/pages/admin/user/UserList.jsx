import React, { useMemo } from 'react';
import { useThemeClasses } from '../../../context/ThemeContext';

import { useUsers } from './hooks/useUsers';

// Common Components
import DataTable from '../../../components/common/table/DataTable';
import ActionDropdown from '../../../components/common/table/ActionDropdown';
import { TrashIcon, ShieldIcon } from '../../../components/common/Icons';

// Subcomponents
import UserStats from './components/UserStats';
import UserToolbar from './components/UserToolbar';
import DeleteUserModal from './components/DeleteUserModal';
import AddUserModal from './components/AddUserModal';

function UserAvatar({ name, email }) {
    const initial = (name || email || 'U').charAt(0).toUpperCase();
    return (
        <div className="w-8 h-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center flex-shrink-0 border border-slate-700 shadow-2xs">
            {initial}
        </div>
    );
}

function RolePill({ role }) {
    const isAdmin = (role || '').toLowerCase() === 'admin';
    return (
        <span
            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-semibold uppercase tracking-wider border ${
                isAdmin
                    ? 'bg-purple-50 text-purple-700 border-purple-200/80'
                    : 'bg-slate-100 text-slate-700 border-slate-200/80'
            }`}
        >
            {isAdmin && <ShieldIcon size={11} className="text-purple-600" />}
            <span>{isAdmin ? 'Admin' : 'User'}</span>
        </span>
    );
}

function StatusPill({ isActive }) {
    return (
        <span
            className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border capitalize ${
                isActive
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
                    : 'bg-slate-100 text-slate-500 border-slate-200/80'
            }`}
        >
            {isActive ? 'Active' : 'Inactive'}
        </span>
    );
}

export default function UserList() {
    const tc = useThemeClasses();
    const {
        users,
        pagination,
        stats,
        isLoading,
        refetch,
        page,
        setPage,
        limit,
        setLimit,
        search,
        setSearch,
        debouncedSearch,
        roleFilter,
        setRoleFilter,
        isAddModalOpen,
        openAddModal,
        closeAddModal,
        adminForm,
        setAdminForm,
        isCreatingAdmin,
        handleCreateAdmin,
        deleteTarget,
        openDeleteModal,
        closeDeleteModal,
        handleDelete,
        isDeleting,
    } = useUsers();

    // DataTable Columns
    const columns = useMemo(
        () => [
            {
                key: 'user',
                header: 'User Profile',
                className: 'w-72',
                render: (u) => (
                    <div className="flex items-center gap-3">
                        <UserAvatar name={u.name} email={u.email} />
                        <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate text-xs">
                                {u.name || 'Anonymous User'}
                            </p>
                            <p className="text-[11px] text-slate-500 truncate mt-0.5">{u.email || '—'}</p>
                            {u.phone && <p className="text-[10px] text-slate-400 mt-0.5">{u.phone}</p>}
                        </div>
                    </div>
                ),
            },
            {
                key: 'role',
                header: 'Role',
                className: 'w-32',
                render: (u) => <RolePill role={u.userType} />,
            },
            {
                key: 'status',
                header: 'Status',
                className: 'w-32',
                render: (u) => <StatusPill isActive={!u.isDeleted} />,
            },
            {
                key: 'joined',
                header: 'Registered At',
                className: 'w-44',
                render: (u) => (
                    <span className="text-xs text-slate-600 font-mono">
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </span>
                ),
            },
            {
                key: 'actions',
                header: '',
                align: 'right',
                className: 'w-12',
                render: (u) => (
                    <ActionDropdown>
                        {({ close }) => (
                            <>
                                <button
                                    type="button"
                                    onClick={() => {
                                        close();
                                        openDeleteModal(u);
                                    }}
                                    className="w-full text-left px-3.5 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 flex items-center gap-2 cursor-pointer transition-colors"
                                >
                                    <TrashIcon size={13} className="text-rose-500" />
                                    <span>Delete User</span>
                                </button>
                            </>
                        )}
                    </ActionDropdown>
                ),
            },
        ],
        [openDeleteModal]
    );

    return (
        <div className="w-full space-y-6 p-4 sm:p-6 pb-12 select-none">
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-xl font-bold text-slate-900 tracking-tight">Users & Team</h1>
                    <p className="text-xs text-slate-500 mt-1">
                        Manage system administrators, operator accounts, and registered users.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <UserStats stats={stats} isLoading={isLoading} />

            {/* Toolbar */}
            <UserToolbar
                search={search}
                onSearchChange={setSearch}
                roleFilter={roleFilter}
                onRoleFilterChange={setRoleFilter}
                onAddUser={openAddModal}
            />

            {/* Modern DataTable */}
            <DataTable
                columns={columns}
                data={users}
                isLoading={isLoading}
                keyExtractor={(u) => u._id}
                emptyMessage={debouncedSearch ? `No users match "${debouncedSearch}".` : 'No user accounts found.'}
                pagination={{
                    total: pagination.total ?? users.length ?? 0,
                    totalPages: pagination.totalPages ?? Math.max(1, Math.ceil((pagination.total || users.length || 1) / limit)),
                    page,
                    limit,
                    onPageChange: (newPage) => setPage(newPage),
                    onPageSizeChange: (newLimit) => { setLimit(newLimit); setPage(1); },
                }}
            />

            {/* Add User Modal */}
            <AddUserModal
                isOpen={isAddModalOpen}
                onClose={closeAddModal}
                formData={adminForm}
                setFormData={setAdminForm}
                onSubmit={handleCreateAdmin}
                isSubmitting={isCreatingAdmin}
            />

            {/* Delete Confirmation Modal */}
            <DeleteUserModal
                user={deleteTarget}
                onConfirm={handleDelete}
                onCancel={closeDeleteModal}
                isDeleting={isDeleting}
            />
        </div>
    );
}
