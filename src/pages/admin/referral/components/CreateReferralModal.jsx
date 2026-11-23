import React, { useState } from 'react';
import { 
    FiX, 
    FiLink, 
    FiPercent, 
    FiUserPlus, 
    FiLayers, 
    FiUser
} from 'react-icons/fi';
import { showNotification } from '../../../../components/Toastify/Toast';

// Subcomponents for Payment Methods
import UpiPaymentFields from './payment/UpiPaymentFields';
import BankPaymentFields from './payment/BankPaymentFields';

const INITIAL_FORM_STATE = {
    partnerId: '',
    offerId: '',
    referrerType: 'UPI',
    referrerAccount: '',
    referrerIfsc: '',
    referrerHolderName: '',
    referrerPercent: 30,
};

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
    const [form, setForm] = useState(INITIAL_FORM_STATE);

    if (!isOpen) return null;

    const handlePaymentTypeChange = (type) => {
        setForm((prev) => ({
            ...prev,
            referrerType: type,
            referrerAccount: '',
            referrerIfsc: '',
            referrerHolderName: '',
        }));
    };

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

        // Validate and build payment payload based on selected method
        let paymentData = {};

        switch (form.referrerType) {
            case 'UPI': {
                const acc = form.referrerAccount?.trim();
                if (!acc) {
                    showNotification('Please enter partner UPI ID', 'warning');
                    return;
                }
                if (!/^[\w.-]+@[a-z\d.-]+$/i.test(acc)) {
                    showNotification('Please enter a valid UPI address (e.g. name@okhdfcbank)', 'warning');
                    return;
                }
                paymentData = {
                    referrerType: 'UPI',
                    referrerAccount: acc,
                };
                break;
            }

            case 'BANK': {
                const acc = form.referrerAccount?.trim();
                if (!acc) {
                    showNotification('Please enter bank account number', 'warning');
                    return;
                }
                if (!/^\d{9,18}$/.test(acc)) {
                    showNotification('Please enter a valid 9 to 18 digit bank account number', 'warning');
                    return;
                }
                const ifsc = form.referrerIfsc?.trim();
                if (!ifsc) {
                    showNotification('Please enter IFSC code', 'warning');
                    return;
                }
                if (!/^[A-Z]{4}0[A-Z0-9]{6}$/i.test(ifsc)) {
                    showNotification('Please enter a valid 11-character IFSC code (e.g. SBIN0001234)', 'warning');
                    return;
                }
                paymentData = {
                    referrerType: 'BANK',
                    referrerAccount: acc,
                    referrerIfsc: ifsc.toUpperCase(),
                    referrerHolderName: form.referrerHolderName?.trim() || undefined,
                };
                break;
            }

            default:
                showNotification('Invalid payout method selected', 'warning');
                return;
        }

        const payload = {
            partnerId: form.partnerId,
            offerId: form.offerId,
            referrerPercent: Number(form.referrerPercent),
            ...paymentData,
        };

        const success = await onSubmit(payload);
        if (success) {
            setForm(INITIAL_FORM_STATE);
        }
    };

    const refereePercent = Math.max(0, 100 - Number(form.referrerPercent || 0));

    const renderPaymentFields = () => {
        switch (form.referrerType) {
            case 'BANK':
                return (
                    <BankPaymentFields
                        account={form.referrerAccount}
                        ifsc={form.referrerIfsc}
                        holderName={form.referrerHolderName}
                        onChange={(field, val) => setForm((prev) => ({ ...prev, [field]: val }))}
                    />
                );
            case 'UPI':
            default:
                return (
                    <UpiPaymentFields
                        value={form.referrerAccount}
                        onChange={(val) => setForm((prev) => ({ ...prev, referrerAccount: val }))}
                    />
                );
        }
    };

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
                            <p className="text-xs font-normal text-slate-500">Generate an affiliate tracking URL tied to a partner</p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="text-slate-400 hover:text-slate-600 rounded-lg p-1.5 hover:bg-slate-100 transition-colors cursor-pointer"
                    >
                        <FiX size={16} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
                    {/* Partner Dropdown */}
                    <div>
                        <div className="flex items-center justify-between mb-1.5">
                            <label className="text-xs font-semibold text-slate-700">
                                Affiliate Partner <span className="text-rose-500">*</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    onOpenPartnerModal();
                                }}
                                className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer"
                            >
                                <FiUserPlus size={12} />
                                <span>+ New Partner</span>
                            </button>
                        </div>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select
                                required
                                value={form.partnerId}
                                onChange={(e) => setForm({ ...form, partnerId: e.target.value })}
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
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
                            <p className="text-[11px] font-medium text-amber-600 mt-1">
                                No active partners found. Click "+ New Partner" above to register one first.
                            </p>
                        )}
                    </div>

                    {/* Target Offer Dropdown */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Target Offer / Campaign <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <FiLayers className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
                            <select
                                required
                                value={form.offerId}
                                onChange={(e) => setForm({ ...form, offerId: e.target.value })}
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-200 text-slate-800 focus:outline-none focus:border-slate-400 transition-colors cursor-pointer"
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
                    <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                            <span className="flex items-center gap-1.5">
                                <FiPercent size={14} className="text-slate-500" />
                                <span>Commission Split</span>
                            </span>
                            <span className="font-mono text-slate-800 bg-white px-2 py-0.5 rounded border border-slate-200 text-[11px] font-semibold">
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
                        <div className="flex justify-between text-[11px] font-medium text-slate-500">
                            <span>0% (All to user)</span>
                            <span className="font-semibold text-slate-700">Partner: {form.referrerPercent}%</span>
                            <span>100% (All to partner)</span>
                        </div>
                    </div>

                    {/* Payment Account Details */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                            Partner Payout Method & Account <span className="text-rose-500">*</span>
                        </label>

                        {/* 2-Way Payment Method Switch */}
                        <div className="grid grid-cols-2 gap-2 mb-2.5">
                            <button
                                type="button"
                                onClick={() => handlePaymentTypeChange('UPI')}
                                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                    form.referrerType === 'UPI'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                UPI
                            </button>
                            <button
                                type="button"
                                onClick={() => handlePaymentTypeChange('BANK')}
                                className={`py-2 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                                    form.referrerType === 'BANK'
                                        ? 'bg-slate-900 text-white border-slate-900 shadow-2xs'
                                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                Bank
                            </button>
                        </div>

                        {/* Payment Fields (Switch Case) */}
                        {renderPaymentFields()}
                    </div>

                    {/* Modal Footer */}
                    <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
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
