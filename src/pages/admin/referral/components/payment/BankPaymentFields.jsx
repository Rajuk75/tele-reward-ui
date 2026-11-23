import React from 'react';
import { FiCreditCard } from 'react-icons/fi';

export default function BankPaymentFields({ account, ifsc, holderName, onChange }) {
    return (
        <div className="space-y-2.5">
            {/* Account Number */}
            <div className="relative">
                <FiCreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input
                    type="text"
                    required
                    value={account}
                    onChange={(e) => onChange('referrerAccount', e.target.value)}
                    placeholder="Bank Account Number (9-18 digits)"
                    className="w-full pl-9 pr-3.5 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors font-mono"
                />
            </div>

            {/* IFSC Code & Account Holder Name */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <input
                    type="text"
                    required
                    value={ifsc}
                    onChange={(e) => onChange('referrerIfsc', e.target.value.toUpperCase())}
                    placeholder="IFSC Code (e.g. SBIN0001234)"
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800 uppercase font-mono"
                />
                <input
                    type="text"
                    value={holderName}
                    onChange={(e) => onChange('referrerHolderName', e.target.value)}
                    placeholder="Account Holder Name (Optional)"
                    className="w-full px-3 py-2 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-800"
                />
            </div>
        </div>
    );
}
