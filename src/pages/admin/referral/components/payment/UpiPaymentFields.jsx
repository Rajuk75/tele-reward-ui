import React, { useState, useEffect } from 'react';
import { FiCreditCard, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { verifyUpiId } from '../../../../../services/AppService';

export default function UpiPaymentFields({ value, onChange }) {
    const [verification, setVerification] = useState(null);
    const [isVerifying, setIsVerifying] = useState(false);

    // Debounced automatic verification (500ms)
    useEffect(() => {
        const vpa = value?.trim();
        if (!vpa || !vpa.includes('@') || vpa.length < 4) {
            setVerification(null);
            setIsVerifying(false);
            return;
        }

        const timer = setTimeout(async () => {
            setIsVerifying(true);
            try {
                const res = await verifyUpiId(vpa);
                const payload = res?.data?.data;
                const bankOrAppInfo = payload?.data?.message || payload?.message || 'Valid UPI ID';
                setVerification({ isValid: true, message: bankOrAppInfo });
            } catch (err) {
                const msg = err?.response?.data?.message || err.message;
                setVerification({ isValid: false, message: msg });
            } finally {
                setIsVerifying(false);
            }
        }, 500);

        return () => clearTimeout(timer);
    }, [value]);

    return (
        <div className="space-y-1.5">
            <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                    type="text"
                    required
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder="username@bank or mobile@upi"
                    className="w-full pl-9 pr-9 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors font-mono"
                />

                {/* Inline loading or verification status icon */}
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center pointer-events-none">
                    {isVerifying ? (
                        <div className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
                    ) : verification?.isValid ? (
                        <FiCheck className="text-emerald-600 stroke-[2.5]" size={15} />
                    ) : verification && !verification.isValid ? (
                        <FiAlertCircle className="text-rose-500" size={15} />
                    ) : null}
                </div>
            </div>

            {/* Verification message */}
            {verification && (
                <div className={`flex items-center gap-1.5 text-xs font-medium ${
                    verification.isValid ? 'text-emerald-700' : 'text-rose-600'
                }`}>
                    <span>{verification.isValid ? `✓ ${verification.message}` : verification.message}</span>
                </div>
            )}
        </div>
    );
}
