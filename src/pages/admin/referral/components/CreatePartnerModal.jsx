import React, { useState } from 'react';
import { FiX, FiUserPlus, FiMail, FiPhone, FiTag, FiGlobe, FiUser } from 'react-icons/fi';
import { showNotification } from '../../../../components/Toastify/Toast';

const CATEGORY_OPTIONS = [
    { value: 'affiliate', label: 'Affiliate Marketer' },
    { value: 'youtuber', label: 'YouTube Creator' },
    { value: 'telegram_channel', label: 'Telegram Admin' },
    { value: 'instagram', label: 'Instagram Influencer' },
    { value: 'website', label: 'Website / Blog Owner' },
    { value: 'agency', label: 'Marketing Agency' },
    { value: 'other', label: 'Other' },
];

export default function CreatePartnerModal({ isOpen, onClose, onSubmit, isSubmitting }) {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        category: 'affiliate',
        channelOrPageUrl: '',
    });

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        const trimmedName = form.name.trim();
        const trimmedEmail = form.email.trim();

        if (!trimmedName) {
            showNotification('Please enter the partner full name', 'warning');
            return;
        }

        if (!trimmedEmail || !/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
            showNotification('Please enter a valid email address', 'warning');
            return;
        }

        const success = await onSubmit({
            name: trimmedName,
            email: trimmedEmail,
            phone: form.phone.trim() || undefined,
            category: form.category,
            channelOrPageUrl: form.channelOrPageUrl.trim() || undefined,
        });

        if (success) {
            setForm({
                name: '',
                email: '',
                phone: '',
                category: 'affiliate',
                channelOrPageUrl: '',
            });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4.5 border-b border-slate-100 bg-slate-50/50">
                    <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-2xs">
                            <FiUserPlus size={16} />
                        </div>
                        <div>
                            <h3 className="text-sm font-bold text-slate-900">Add New Partner</h3>
                            <p className="text-xs font-medium text-slate-600">Register an affiliate creator, influencer or agency</p>
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
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {/* Full Name */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Full Name / Channel Name <span className="text-rose-500">*</span>
                        </label>
                        <div className="relative">
                            <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                                type="text"
                                required
                                value={form.name}
                                onChange={(e) => setForm({ ...form, name: e.target.value })}
                                placeholder="e.g. Sagar Tech, Rohit Sharma"
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                            />
                        </div>
                    </div>

                    {/* Email & Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                Email Address <span className="text-rose-500">*</span>
                            </label>
                            <div className="relative">
                                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="email"
                                    required
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="partner@example.com"
                                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-800 mb-1.5">
                                Phone / WhatsApp
                            </label>
                            <div className="relative">
                                <FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                                <input
                                    type="text"
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="+91 9876543210"
                                    className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Partner Category
                        </label>
                        <div className="relative">
                            <FiTag className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <select
                                value={form.category}
                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-slate-800 transition-colors cursor-pointer"
                            >
                                {CATEGORY_OPTIONS.map((opt) => (
                                    <option key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Channel / Page URL */}
                    <div>
                        <label className="block text-xs font-bold text-slate-800 mb-1.5">
                            Channel / Page / Profile Link
                        </label>
                        <div className="relative">
                            <FiGlobe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                            <input
                                type="url"
                                value={form.channelOrPageUrl}
                                onChange={(e) => setForm({ ...form, channelOrPageUrl: e.target.value })}
                                placeholder="https://t.me/channel or https://youtube.com/@channel"
                                className="w-full pl-9 pr-3.5 py-2 text-xs font-semibold rounded-lg bg-white border border-slate-300 text-slate-900 placeholder-slate-500 focus:outline-none focus:border-slate-800 focus:ring-1 focus:ring-slate-800 transition-colors"
                            />
                        </div>
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
                            className="inline-flex items-center justify-center min-w-[120px] px-4 py-2 text-xs font-semibold rounded-lg bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer disabled:opacity-60"
                        >
                            {isSubmitting ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                'Save Partner'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
