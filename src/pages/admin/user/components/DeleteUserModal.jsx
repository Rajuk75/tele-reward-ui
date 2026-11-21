import React from 'react';
import { TrashIcon, CloseIcon } from '../../../../components/common/Icons';

export default function DeleteUserModal({ user, onConfirm, onCancel, isDeleting }) {
    if (!user) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs"
            onClick={onCancel}
        >
            <div
                className="w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                    <div className="flex items-center gap-2 text-rose-600 font-bold text-sm">
                        <TrashIcon size={16} />
                        <span>Delete User Account</span>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer transition"
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-3">
                    <p className="text-xs text-slate-700 leading-relaxed">
                        Are you sure you want to delete user{' '}
                        <strong className="text-slate-900 font-semibold">{user.name || user.email}</strong>?
                    </p>
                    <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1 text-xs">
                        <div className="flex justify-between">
                            <span className="text-slate-500">Email:</span>
                            <span className="font-medium text-slate-800">{user.email || '—'}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-500">Role:</span>
                            <span className="font-semibold text-slate-800 uppercase text-[10px]">{user.userType || 'USER'}</span>
                        </div>
                    </div>
                    <p className="text-[11px] text-slate-400">
                        This action will mark the user account as deleted.
                    </p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-2.5 px-6 py-3.5 bg-slate-50 border-t border-slate-100">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="h-8 px-3.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onConfirm(user._id)}
                        disabled={isDeleting}
                        className="h-8 px-4 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition cursor-pointer shadow-2xs disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete User'}
                    </button>
                </div>
            </div>
        </div>
    );
}
