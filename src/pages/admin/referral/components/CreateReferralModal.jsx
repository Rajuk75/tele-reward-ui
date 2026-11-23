import React, { useState } from 'react';
import { FiX, FiLink, FiPercent, FiCreditCard, FiUserPlus, FiLayers, FiUser } from 'react-icons/fi';
import { showNotification } from '../../../../components/Toastify/Toast';

export default function CreateReferralModal({
    isOpen,
    onClose,
    onSubmit,
    isSubmitting,
    partners = [],
    isLoadingPartners = false,
    offers = [],
    isLoadingOffers = false,
    onOpenPartnerModal,
}) {
    const [form, setForm] = useState({
        partnerId: '',
        offerId: '',
        referrerType: 'UPI',
        referrerAccount: '',
        referrerIfsc: '',
        referrerHolderName: '',
        referrerPercent: 30,
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!form.partnerId) {
            showNotification('Please select a partner', 'warning');
            return;
        }

        if (!form.offerId) {
            showNotification('Please select a target offer', 'warning');
            return;
        }

        const trimmedAccount = form.referrerAccount.trim();
        if (!trimmedAccount) {
            showNotification('Please enter the payment account details', 'warning');
            return;
        }

        if (form.referrerType === 'UPI' && !/^[\w.-]+@[a-z\d.-]+$/i.test(trimmedAccount)) {
            showNotification('Please enter a valid UPI ID (e.g. user@bank)', 'warning');
            return;
        }

        if (form.referrerType === 'PAYTM' && !/^\d{10}$/.test(trimmedAccount)) {
            showNotification('Please enter a valid 10-digit Paytm mobile number', 'warning');
            return;
        }

        if (form.referrerType === 'BANK') {
            if (!/^\d{9,18}$/.test(trimmedAccount)) {
                showNotification('Please enter a valid bank account number (9-18 digits)', 'warning');
                return;
            }
            if (!form.referrerIfsc?.trim() || !/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(form.referrerIfsc.trim())) {
                showNotification('Please enter a valid 11-character IFSC code', 'warning');
                return;
            }
        }

        const payload = {
            partnerId: form.partnerId,
            offerId: form.offerId,
            referrerType: form.referrerType,
            referrerAccount: trimmedAccount,
            referrerPercent: Number(form.referrerPercent),
            ...(form.referrerType === 'BANK' && {
                referrerIfsc: form.referrerIfsc.trim().toUpperCase(),
                referrerHolderName: form.referrerHolderName.trim() || undefined,
            }),
        };

        const success = await onSubmit(payload);
        if (success) {
            setForm({
                partnerId: '',
                offerId: '',
                referrerType: 'UPI',
                referrerAccount: '',
                referrerIfsc: '',
                referrerHolderName: '',
                referrerPercent: 30,
            });
        }
    };

    const refereePercent = Math.max(0, 100 - Number(form.referrerPercent || 0));

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-xl bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                            <FiLink size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Create Referral Link</h3>
                            <p className="text-xs font-medium text-slate-600">Generate an affiliate tracking URL tied to a partner</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-500 hover:text-slate-800 rounded-lg p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
                    {/* Partner Dropdown */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-bold text-slate-800">
                                Affiliate Partner <span className="text-rose-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenPartnerModal();
                                }}
                                className="text-[11px] font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1 cursor-pointer"
                            >
                                <FiUserPlus size={12} />
                                <span>+ New Partner</span>
                            </button>
                        </div>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <select
                                required
                                value={form.partnerId}
                                onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-800 transition-colors cursor-pointer"
                            >
                                <option value="">Select a registered partner...</option>
                                {partners.map((p) => (
                                    <option key={p._id || p.id} value={p._id || p.id}>
                                        {p.name} {p.category ? `(${p.category})` : ''} — {p.email}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {partners.length === 0 && !isLoadingPartners && (
                            <p className="text-[11px] font-semibold text-amber-700 mt-1">
                                No active partners found. Click "+ New Partner" above to register one first.
                            </p>
                        )}
                    </div>

                    {/* Target Offer Dropdown */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Target Offer / Campaign <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <select
                                required
                                value={form.offerId}
                                onChange={(e) => setForm({ ...form, offerId: e.target.value })}
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-800 transition-colors cursor-pointer"
                            >
                                <option value="">Select an active offer...</option>
                                {offers.map((o) => (
                                    <option key={o._id} value={o._id}>
                                        {o.offerName} {o.campaignId?.name ? `(${o.campaignId.name})` : ''} — Payout ₹{(o.totalPayout || 0).toFixed(2)}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Commission Split */}
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-300 space-y-2">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-800">
                            <span className="flex items-center gap-1.5">
                                <FiPercent size={14} className="text-slate-700" />
                                <span>Commission Split</span>
                            </span>
                            <span className="font-mono text-slate-900 bg-white px-2 py-0.5 rounded border border-slate-300 text-[11px] font-bold">
                                {form.referrerPercent}% Partner / {refereePercent}% User
                            </span>
                        </div>
                        <input
                            type="range"
                            min="0"
                            max="100"
                            step="5"
                            value={form.referrerPercent}
                            onChange={(e) => setForm({ ...form, referrerPercent: Number(e.target.value) })}
                            className="w-full accent-slate-900 cursor-pointer"
                        />
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600">
                            <span>0% (All to user)</span>
                            <span className="font-bold text-slate-900">Partner: {form.referrerPercent}%</span>
                            <span>100% (All to partner)</span>
                        </div>
                    </div>

                    {/* Payment Account Details */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Partner Payout Method & Account <span className="text-rose-500">*</span>
                        </label>
                        <div className="grid grid-cols-3 gap-2 mb-2.5">
                            {['UPI', 'PAYTM', 'BANK'].map((type) => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => setForm({ ...form, referrerType: type, referrerAccount: '' })}
                                    className={`py-2 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                        form.referrerType === type
                                            ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                            : 'bg-white text-slate-800 border-slate-300 hover:bg-slate-100'
                                    }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>

                        <div className="relative">
                            <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                                type="text"
                                required
                                value={form.referrerAccount}
                                onChange={(e) => setForm({ ...form, referrerAccount: e.target.value })}
                                placeholder={
                                    form.referrerType === 'UPI'
                                        ? 'username@bank or mobile@upi'
                                        : form.referrerType === 'PAYTM'
                                        ? '10-digit Paytm mobile number'
                                        : 'Bank Account Number'
                                }
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors font-mono"
                            />
                        </div>

                        {form.referrerType === 'BANK' && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                                <input
                                    type="text"
                                    required
                                    value={form.referrerIfsc}
                                    onChange={(e) => setForm({ ...form, referrerIfsc: e.target.value.toUpperCase() })}
                                    placeholder="IFSC Code (e.g. SBIN0001234)"
                                    className="w-full px-3 py-2 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 uppercase font-mono"
                                />
                                <input
                                    type="text"
                                    value={form.referrerHolderName}
                                    onChange={(e) => setForm({ ...form, referrerHolderName: e.target.value })}
                                    placeholder="Account Holder Name (Optional)"
                                    className="w-full px-3 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800"
                                />
                            </div>
                        )}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-bold rounded-lg bg-white border border-slate-300 text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="inline-flex items-center justify-center min-w-[140px] px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60 shadow-2xs"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Generate Link'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
