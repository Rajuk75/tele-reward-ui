import React from 'react';
import { FiAlertTriangle, FiX } from 'react-icons/fi';

export default function DeleteReferralModal({ referral, onConfirm, onCancel, isDeleting }) {
    if (!referral) return null;

    const partnerName = referral.partner?.name || referral.partnerName || 'Direct Partner';
    const offerName = referral.offer?.offerName || 'Target Offer';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-md bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5 text-rose-600">
                        <div className="w-8 h-8 rounded-lg bg-rose-50 border border-rose-100 flex items-center justify-center">
                            <FiAlertTriangle size={16} />
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">Delete Referral Link</h3>
                    </div>
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                <div className="p-6 space-y-3.5">
                    <p className="text-xs font-medium text-slate-800 leading-relaxed">
                        Are you sure you want to permanently delete the referral link for{' '}
                        <strong className="text-slate-900 font-bold">{partnerName}</strong> on offer{' '}
                        <strong className="text-slate-900 font-bold">{offerName}</strong>?
                    </p>

                    <div className="p-3 bg-slate-50 rounded-lg border border-slate-300 font-mono text-[11px] text-slate-800">
                        <div>Code: <span className="font-bold text-slate-900">{referral.referralCode}</span></div>
                        <div className="mt-1">Account: <span className="font-bold text-slate-900">{referral.referrerAccount} ({referral.referrerType})</span></div>
                    </div>

                    <p className="text-[11px] text-rose-700 font-bold">
                        Warning: Users clicking this link will no longer be attributed to this affiliate partner.
                    </p>
                </div>

                <div className="flex items-center justify-end gap-2.5 px-6 py-4 bg-slate-50 border-t border-slate-200">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isDeleting}
                        className="px-4 py-2 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isDeleting}
                        className="inline-flex items-center justify-center min-w-[100px] px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 text-white hover:bg-rose-700 transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
                    >
                        {isDeleting ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            'Yes, Delete'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
