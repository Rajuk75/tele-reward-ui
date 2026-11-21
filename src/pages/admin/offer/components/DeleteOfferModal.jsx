import React from 'react';
import { CloseIcon } from '../../../../components/common/Icons';

export default function DeleteOfferModal({ offer, onConfirm, onCancel, isDeleting }) {
    if (!offer) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <div
                className="relative w-full max-w-md rounded-2xl bg-white border border-slate-200 shadow-2xl p-6 select-text text-left"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-base font-bold text-slate-900">Delete Offer</h3>
                        <p className="text-xs text-slate-500 mt-1">
                            Are you sure you want to delete <strong className="text-slate-800 font-semibold">{offer.offerName}</strong>?
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={onCancel}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                        <CloseIcon size={16} />
                    </button>
                </div>

                <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 leading-relaxed font-medium">
                    This deal will immediately be unlinked and removed from the public Telegram mini-app. Any active user sessions might not be rewarded.
                </div>

                <div className="mt-6 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>

                    <button
                        type="button"
                        onClick={() => onConfirm(offer._id)}
                        disabled={isDeleting}
                        className="px-5 py-2 text-xs font-bold text-white bg-rose-600 rounded-lg hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-50"
                    >
                        {isDeleting ? 'Deleting...' : 'Delete Offer'}
                    </button>
                </div>
            </div>
        </div>
    );
}
