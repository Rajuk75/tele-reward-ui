import React from 'react';
import OfferImageUploadField from '../../../../../components/OfferImageUploadField';
import { useThemeClasses } from '../../../../../context/ThemeContext';

export default function Step3Instructions({ form, onChange, onUploadingChange }) {
    const tc = useThemeClasses();

    return (
        <div className="space-y-5">
            {/* 1. Banner / Background Image */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <div>
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        Offer Banner Image
                    </h4>
                    <p className="text-[11px] text-slate-500">
                        Wide banner image displayed on the top of the offer detail card.
                    </p>
                </div>

                <OfferImageUploadField
                    value={form.backgroundImage || ''}
                    onChange={(url) => onChange('backgroundImage', url)}
                    onUploadingChange={onUploadingChange}
                    tc={tc}
                />
            </div>

            {/* 2. Steps to complete */}
            <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    How to Complete Steps
                </label>
                <textarea
                    rows={3}
                    value={form.steps || ''}
                    onChange={(e) => onChange('steps', e.target.value)}
                    placeholder="1. Click Install button&#10;2. Register with your mobile number&#10;3. Complete Aadhaar verification"
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors shadow-2xs leading-relaxed"
                />
                <p className="mt-1 text-[11px] text-slate-500">
                    Step-by-step instructions displayed to the user.
                </p>
            </div>

            {/* 3. Terms & Conditions */}
            <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    Terms & Conditions <span className="text-rose-500">*</span>
                </label>
                <textarea
                    rows={3}
                    value={form.termsAndConditions || ''}
                    onChange={(e) => onChange('termsAndConditions', e.target.value)}
                    placeholder="• Only for first-time app installers&#10;• Payout credited within 24 hours of KYC completion&#10;• VPN or emulator users will be rejected"
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors shadow-2xs leading-relaxed"
                />
            </div>

            {/* 4. Referral Terms & Conditions */}
            <div>
                <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block mb-1.5">
                    Referral Terms & Conditions
                </label>
                <textarea
                    rows={2}
                    value={form.referTermsAndConditions || ''}
                    onChange={(e) => onChange('referTermsAndConditions', e.target.value)}
                    placeholder="Optional rules for refer-and-earn commissions on this deal..."
                    className="w-full px-3.5 py-2.5 text-xs font-medium rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 transition-colors shadow-2xs leading-relaxed"
                />
            </div>
        </div>
    );
}
