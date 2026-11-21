import { PlusIcon } from '../../../../components/common/Icons';

export default function UserToolbar({
    search,
    onSearchChange,
    roleFilter,
    onRoleFilterChange,
    onAddUser,
}) {
    return (
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            {/* Left: Search & Filter */}
            <div className="flex flex-1 items-center gap-2.5 max-w-lg">
                {/* Search Input */}
                <div className="relative flex-1">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => onSearchChange(e.target.value)}
                        placeholder="Search by name, email or phone..."
                        className="w-full h-9 pl-3 pr-8 rounded-lg bg-white border border-slate-200 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 transition"
                    />
                    {search && (
                        <button
                            type="button"
                            onClick={() => onSearchChange('')}
                            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
                        >
                            ✕
                        </button>
                    )}
                </div>

                {/* Role Filter */}
                <select
                    value={roleFilter}
                    onChange={(e) => onRoleFilterChange(e.target.value)}
                    className="h-9 px-3 rounded-lg bg-white border border-slate-200 text-xs font-medium text-slate-700 focus:outline-none focus:border-slate-400 focus:ring-1 focus:ring-slate-400 cursor-pointer"
                >
                    <option value="all">All</option>
                    <option value="admin">Admin</option>
                    <option value="user">User</option>
                </select>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 justify-end">
                <button
                    type="button"
                    onClick={onAddUser}
                    className="h-9 px-4 rounded-lg bg-slate-900 text-white hover:bg-slate-800 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                >
                    <PlusIcon size={14} strokeWidth={2.5} />
                    <span>Add User</span>
                </button>
            </div>
        </div>
    );
}
