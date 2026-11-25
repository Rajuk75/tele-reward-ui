import React, { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
    getConversionById, getConversionSignedUrl,
    approveConversion, rejectConversion, 
    approveProof, rejectProof 
} from '../../../services/AppService';
import { showNotification } from '../../../components/Toastify/Toast';
import { useThemeClasses } from '../../../context/ThemeContext';
import {
    FiX, FiEye, FiDownload, FiUser, FiMail, FiPhone, FiClock, 
    FiWifi, FiMonitor, FiCalendar, FiSearch, FiCheckCircle, FiXCircle
} from 'react-icons/fi';
import { Inp, Sel, TextArea, Toggle, FormField } from '../common/AdminUI';

const APPROVAL_BADGE = {
    auto_approved:    { label: 'Auto',    cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20' },
    approved:         { label: 'Approved',cls: 'bg-emerald-500/15 text-emerald-400 ring-emerald-500/20' },
    pending_approval: { label: 'Pending', cls: 'bg-amber-500/15 text-amber-400 ring-amber-500/20' },
    pending_proof:    { label: 'Awaiting Proof', cls: 'bg-amber-500/15 text-amber-400 ring-amber-500/20' },
    pending_review:   { label: 'Review Needed', cls: 'bg-orange-500/15 text-orange-400 ring-orange-500/20' },
    rejected:         { label: 'Rejected',cls: 'bg-red-500/15 text-red-400 ring-red-500/20' },
};

const fmt = (d) =>
    d ? new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

const inr = (v) => {
    const n = Number(v ?? 0);
    return isNaN(n) ? '0.00' : n.toFixed(2);
};

/* ── Proof Viewer ────────────────────────────────────────────────────────── */

const ProofViewer = React.memo(({ url, label, onClose }) => {
    const tc = useThemeClasses();

    const { data: signedUrl, isLoading: loading } = useQuery({
        queryKey: ['signed-url', url],
        queryFn: () => getConversionSignedUrl(url).then(r => r.data?.data?.signedUrl),
        staleTime: 5 * 60 * 1000,
        enabled: !!url,
    });

    const isPdf   = signedUrl && (signedUrl.match(/\.(pdf)/i) || signedUrl.includes('pdf'));

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80">
            <div className={`relative w-full max-w-2xl aspect-square flex flex-col rounded-xl shadow-2xl overflow-hidden ${tc.card}`}>
                <div className={`px-6 py-4 border-b flex items-center justify-between ${tc.border}`}>
                    <h3 className={`text-sm font-bold ${tc.text}`}>{label}</h3>
                    <div className="flex items-center gap-2">
                        {signedUrl && (
                            <a href={signedUrl} download target="_blank" className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition ${tc.textMuted}`}>
                                <FiDownload size={18} />
                            </a>
                        )}
                        <button onClick={onClose} className={`p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition ${tc.textMuted}`}>
                            <FiX size={20} />
                        </button>
                    </div>
                </div>
                <div className="flex-1 overflow-hidden bg-slate-900/50 flex items-center justify-center p-8">
                    {loading ? (
                        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : isPdf ? (
                        <iframe src={signedUrl} className="w-full h-full rounded-lg" title={label} />
                    ) : (
                        <img src={signedUrl} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" alt={label} />
                    )}
                </div>
            </div>
        </div>
    );
});

/* ── Rejection Reason Modal ──────────────────────────────────────────────── */

function RejectionReasonModal({ onClose, onConfirm, tc }) {
    const [reason, setReason] = useState('Pls reupload correct file');
    const [isReupload, setIsReupload] = useState(true);
    const [customNote, setCustomNote] = useState('');

    const REASONS = [
        { label: 'Pls reupload correct file', reupload: true },
        { label: 'Invalid Proof Content', reupload: false },
        { label: 'Blurred/Unreadable Image', reupload: true },
        { label: 'Incorrect Offer/Event', reupload: false },
        { label: 'Fraudulent/Fake Proof', reupload: false },
        { label: 'Duplicate Submission', reupload: false },
        { label: 'Other (Specify below)', reupload: false },
    ];

    const handleReasonChange = (e) => {
        const r = REASONS.find(x => x.label === e.target.value);
        setReason(e.target.value);
        if (r) setIsReupload(r.reupload);
    };

    const handleConfirm = () => {
        const finalNote = reason === 'Other (Specify below)' ? customNote : reason;
        if (!finalNote.trim()) return alert('Please provide a reason');
        onConfirm(finalNote, isReupload);
    };

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/40">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border ${tc.border} ${tc.card}`}>
                <div className={`px-6 py-4 border-b flex items-center justify-between ${tc.border} bg-gray-50/50 dark:bg-slate-800/50`}>
                    <h3 className={`text-base font-bold ${tc.text}`}>Rejection Reason</h3>
                    <button onClick={onClose} className={tc.textMuted}><FiX size={20} /></button>
                </div>
                <div className="p-6 space-y-5">
                    <FormField label="Select Reason" tc={tc}>
                        <Sel 
                            value={reason}
                            onChange={handleReasonChange}
                            tc={tc}
                        >
                            {REASONS.map(r => <option key={r.label} value={r.label}>{r.label}</option>)}
                        </Sel>
                    </FormField>

                    <div className={`p-4 rounded-xl border flex items-center justify-between ${isReupload ? 'bg-amber-500/5 border-amber-500/20' : 'bg-red-500/5 border-red-500/20'}`}>
                        <div>
                            <p className={`text-xs font-semibold ${isReupload ? 'text-amber-600' : 'text-red-600'}`}>Allow Re-upload?</p>
                            <p className="text-[10px] opacity-60">User can submit proof again if enabled</p>
                        </div>
                        <Toggle checked={isReupload} onChange={setIsReupload} tc={tc} />
                    </div>

                    {(reason === 'Other (Specify below)' || reason === 'Blurred/Unreadable Image') && (
                        <FormField label="Additional Note" tc={tc}>
                            <TextArea 
                                value={customNote}
                                onChange={e => setCustomNote(e.target.value)}
                                placeholder="Enter specific details for the user..."
                                tc={tc}
                            />
                        </FormField>
                    )}
                </div>
                <div className={`px-6 py-4 border-t flex gap-3 ${tc.border} bg-gray-50/50 dark:bg-slate-800/50`}>
                    <button onClick={onClose} className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-semibold border transition ${tc.btnSecondary}`}>Cancel</button>
                    <button onClick={handleConfirm} className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold shadow-lg shadow-red-600/20 transition">Confirm Reject</button>
                </div>
            </div>
        </div>
    );
}

/* ── Main Detail Modal ───────────────────────────────────────────────────── */

export default function LegacyConversionReview({ trackingId, onClose }) {
    const queryClient  = useQueryClient();
    const tc           = useThemeClasses();
    const [note, setNote] = useState('');
    const [activeProof, setActiveProof] = useState(null);

    const { data: c, isLoading, refetch } = useQuery({
        queryKey: ['admin-conversion-detail', trackingId],
        queryFn: () => getConversionById(trackingId).then(r => r.data?.data?.conversion || r.data?.data),
        enabled: !!trackingId,
    });

    const approveMutation = useMutation({
        mutationFn: () => approveConversion(trackingId, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-conversions'] });
            queryClient.invalidateQueries({ queryKey: ['admin-clicks'] });
            onClose();
        },
    });

    const rejectMutation = useMutation({
        mutationFn: () => rejectConversion(trackingId, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-conversions'] });
            queryClient.invalidateQueries({ queryKey: ['admin-clicks'] });
            onClose();
        },
    });

    const milestoneApprove = useMutation({
        mutationFn: (eventId) => approveProof(trackingId, eventId, note),
        onSuccess: () => {
            refetch();
        },
    });

    const milestoneReject = useMutation({
        mutationFn: ({ eventId, reason, reupload }) => rejectProof(trackingId, eventId, reason, reupload),
        onSuccess: () => {
            refetch();
        },
    });

    const [noteError, setNoteError] = useState(false);

    const handleRejectConversion = () => {
        if (!note.trim()) {
            setNoteError(true);
            showNotification('Please provide a rejection reason in the note field', 'error');
            return;
        }
        setNoteError(false);
        rejectMutation.mutate();
    };

    const [rejectionModal, setRejectionModal] = useState({ open: false, eventId: null });

    const handleRejectMilestone = (eventId) => {
        setRejectionModal({ open: true, eventId });
    };

    const confirmRejectMilestone = (reason, reupload) => {
        milestoneReject.mutate({ eventId: rejectionModal.eventId, reason, reupload });
        setRejectionModal({ open: false, eventId: null });
    };

    const handleCloseProof = useCallback(() => {
        setActiveProof(null);
    }, []);

    if (!trackingId) return null;

    const renderLabel = (icon, label, value, color) => (
        <div className="flex flex-col gap-0.5">
            <span className={`text-[11px] font-bold uppercase tracking-tight ${tc.textMuted}`}>{label}</span>
            <span className={`text-xs font-semibold ${color || tc.text}`}>{value || '—'}</span>
        </div>
    );

    return (
        <>
            <div className="min-w-0 bg-white">
                <div>
                    {isLoading ? (
                        <div className="flex-1 flex flex-col items-center justify-center p-20 gap-4">
                            <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-sm font-medium">Fetching details...</span>
                        </div>
                    ) : !c ? (
                        <div className="p-20 text-center">Conversion data not available.</div>
                    ) : (
                        <div className="flex-1 overflow-y-auto p-6 space-y-8">
                            {/* Row 1: Core Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* User Profile */}
                                <div className={`relative p-[1px] rounded-lg overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-indigo-100/30 border border-indigo-200/40'}`}>
                                    <div className={`relative overflow-hidden rounded-lg p-5 h-full ${tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-indigo-50/40'}`}>
                                        {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />}
                                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                        />
                                        <div className="relative z-10">
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-3 ${tc.textMuted}`}>User / Payout Profile</h3>
                                            {c.payoutAccount && (
                                                <div className="mb-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-wider">{c.payoutType || 'UPI'} Payout Account</p>
                                                    <p className="text-sm font-mono font-black text-emerald-400 select-all">{c.payoutAccount}</p>
                                                    {c.payoutHolderName && (
                                                        <p className="text-[10px] text-slate-400 mt-1">Name: {c.payoutHolderName} {c.payoutIfsc ? `| IFSC: ${c.payoutIfsc}` : ''}</p>
                                                    )}
                                                </div>
                                            )}
                                            <div className="flex items-start gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/10">
                                                    <FiUser size={20} />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-base font-black leading-none mb-2 truncate ${tc.text}`}>{c.userId?.name}</p>
                                                    <div className="space-y-1.5">
                                                        <p className={`text-[11px] font-bold flex items-center gap-2 ${tc.isDark ? 'text-slate-300' : 'text-slate-700'}`}><FiMail size={12} className="text-indigo-400"/> {c.userId?.email}</p>
                                                        <p className={`text-[11px] font-bold flex items-center gap-2 text-emerald-500`}><FiPhone size={12}/> {c.userId?.phone || '—'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Offer Context */}
                                <div className={`relative p-[1px] rounded-lg overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-purple-100/30 border border-purple-200/40'}`}>
                                    <div className={`relative overflow-hidden rounded-lg p-5 h-full ${tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-purple-50/40'}`}>
                                        {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />}
                                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                        />
                                        <div className="relative z-10">
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${tc.textMuted}`}>Offer Context</h3>
                                            <div className="flex items-center gap-3">
                                                <img src={c.campaignId?.imageUrl} className="w-10 h-10 rounded-lg object-cover border border-white/10" alt="" />
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-black leading-none truncate ${tc.text}`}>{c.campaignId?.name}</p>
                                                    <p className={`text-[11px] font-bold opacity-50 mt-1.5 truncate ${tc.text}`}>{c.offerId?.offerName}</p>
                                                </div>
                                            </div>
                                            <div className={`mt-4 pt-4 border-t border-dashed ${tc.isDark ? 'border-white/10' : 'border-purple-200'} grid grid-cols-2 gap-4`}>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase opacity-40">Model</p>
                                                    <p className="text-xs font-black text-indigo-400 uppercase">{c.campaignId?.model}</p>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase opacity-40">Category</p>
                                                    <p className="text-xs font-black capitalize text-indigo-400">{c.campaignId?.category}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Revenue Audit */}
                                <div className={`relative p-[1px] rounded-lg overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-emerald-100/30 border border-emerald-200/40'}`}>
                                    <div className={`relative overflow-hidden rounded-lg p-5 h-full ${tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-emerald-50/40'}`}>
                                        {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />}
                                        <div className="absolute inset-0 opacity-[0.08] pointer-events-none mix-blend-overlay"
                                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                        />
                                        <div className="relative z-10">
                                            <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${tc.textMuted}`}>Revenue Audit</h3>
                                            <div className="space-y-3.5">
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[11px] font-bold uppercase ${tc.isDark ? 'opacity-50' : 'text-emerald-700 opacity-60'}`}>User Reward</span>
                                                    <span className={`text-sm font-black ${tc.text}`}>₹{inr(c.userRewardINR)}</span>
                                                </div>
                                                <div className="flex items-center justify-between">
                                                    <span className={`text-[11px] font-bold uppercase ${tc.isDark ? 'opacity-50' : 'text-emerald-700 opacity-60'}`}>Adv Payout</span>
                                                    <span className={`text-sm font-black ${tc.text}`}>₹{inr(c.advertiserAmount)}</span>
                                                </div>
                                                <div className={`pt-3 border-t border-dashed ${tc.isDark ? 'border-white/10' : 'border-emerald-200'} flex items-center justify-between`}>
                                                    <span className="text-[11px] font-black uppercase">Total Awarded</span>
                                                    <span className="text-base font-black text-emerald-500">₹{inr(c.amountAwarded)}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 2: Tracking Metadata */}
                            <div>
                                <h3 className={`text-[10px] font-black uppercase tracking-widest mb-4 ${tc.textMuted}`}>Tracking Metadata</h3>
                                <div className={`relative p-[1px] rounded-lg overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-slate-200'}`}>
                                    <div className={`relative overflow-hidden rounded-lg p-6 ${tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-white'}`}>
                                        {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/10 via-transparent to-transparent pointer-events-none" />}
                                        <div className="relative z-10 grid grid-cols-2 md:grid-cols-4 gap-x-8 gap-y-6">
                                            {renderLabel(FiMonitor, 'Device ID',    c.deviceId)}
                                            {renderLabel(FiWifi,    'Click IP',     c.ipAddress)}
                                            {renderLabel(FiWifi,    'Conv. IP',     c.conversionIp)}
                                            {renderLabel(FiClock,   'Clicked At',   fmt(c.clickedAt))}
                                            {renderLabel(FiClock,   'Redirected',   fmt(c.redirectedAt))}
                                            {renderLabel(FiCalendar,'Conv. Date',   fmt(c.conversionDate), 'text-emerald-500')}
                                            {renderLabel(FiSearch,  'Last Event',   c.completedEvent, 'font-black text-indigo-400')}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Row 3: Event Timeline & Proofs */}
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-sm font-bold ${tc.text}`}>Milestone Timeline</h3>
                                    <span className="text-[10px] font-bold uppercase opacity-40">{c.completedEvents?.length || 0} postbacks</span>
                                </div>
                                <div className="space-y-4">
                                    {c.completedEvents?.length === 0 ? (
                                        <div className={`py-12 text-center border-2 border-dashed rounded-lg ${tc.border} opacity-40 text-xs font-bold uppercase tracking-widest`}>No events recorded</div>
                                    ) : (
                                        c.completedEvents.map((ev, i) => {
                                            const badge = APPROVAL_BADGE[ev.approvalStatus];
                                            return (
                                                <div key={i} className={`relative p-[1px] rounded-lg overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                                                    <div className={`relative overflow-hidden rounded-lg p-5 transition-colors ${tc.isDark ? 'bg-gradient-to-b from-white/[0.15] to-white/[0.05] border border-white/10' : 'bg-white'}`}>
                                                    <div className="flex flex-wrap items-start justify-between gap-4">
                                                        <div className="flex items-start gap-4 flex-1">
                                                            <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-slate-700 flex items-center justify-center shrink-0 font-bold text-xs">
                                                                {ev.order}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-bold">{ev.eventName}</p>
                                                                <div className="flex items-center gap-4 mt-2">
                                                                    {badge && (
                                                                        <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-tight ring-1 ring-inset ${badge.cls}`}>
                                                                            {badge.label}
                                                                        </span>
                                                                    )}
                                                                    <span className="text-[10px] font-medium opacity-50 flex items-center gap-1.5">
                                                                        <FiClock size={11} /> {fmt(ev.completedAt)}
                                                                    </span>
                                                                    <span className="text-[10px] font-medium opacity-50 flex items-center gap-1.5">
                                                                        <FiWifi size={11} /> {ev.conversionIp}
                                                                    </span>
                                                                    {ev.approvalStatus === 'rejected' && ev.canReupload && (
                                                                        <span className="text-[9px] font-black text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-1.5 py-0.5 rounded">Re-upload Allowed</span>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-col items-end gap-2">
                                                            <p className="text-sm font-bold text-emerald-500">+₹{inr(ev.amountAwarded)}</p>
                                                            {ev.approvalStatus === 'pending_review' && (
                                                                <div className="flex items-center gap-1.5 mt-1">
                                                                    <button
                                                                        onClick={() => handleRejectMilestone(ev.eventId || ev._id)}
                                                                        disabled={milestoneReject.isPending}
                                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition"
                                                                        title="Reject Proof"
                                                                    ><FiXCircle size={14} /></button>
                                                                    <button
                                                                        onClick={() => milestoneApprove.mutate(ev.eventId || ev._id)}
                                                                        disabled={milestoneApprove.isPending}
                                                                        className="w-7 h-7 flex items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition"
                                                                        title="Approve Proof"
                                                                    ><FiCheckCircle size={14} /></button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {ev.submittedProofs?.length > 0 && (
                                                        <div className="mt-5 pt-4 border-t border-dashed border-gray-200 dark:border-slate-700">
                                                            <p className="text-[10px] font-bold uppercase opacity-30 mb-3">Submitted Proofs</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {ev.submittedProofs.map((p, pi) => (
                                                                    <button
                                                                        key={pi}
                                                                        onClick={() => setActiveProof(p)}
                                                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-2 border transition ${
                                                                            tc.isDark ? 'bg-slate-700 border-slate-600 hover:bg-slate-600' : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                                                                        }`}
                                                                    >
                                                                        <FiEye size={14} className="opacity-50" /> {p.label}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>

                            {/* Raw Audit */}
                            {c.postbackRawQuery && (
                                <div className={`relative p-[1px] rounded-lg overflow-hidden ${tc.isDark ? 'bg-white/10' : 'bg-slate-200'} mb-4`}>
                                    <div className={`p-4 rounded-lg bg-slate-950/80 border border-white/5`}>
                                        <p className="text-[10px] font-black uppercase text-slate-500 mb-3 tracking-widest">Raw Query Parameters</p>
                                        <pre className={`text-[10px] font-black overflow-x-auto text-emerald-400 leading-relaxed`}>
                                            {JSON.stringify(c.postbackRawQuery, null, 2)}
                                        </pre>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Footer Actions */}
                    <div className={`relative shrink-0 p-[1px] ${tc.isDark ? 'bg-white/10' : 'bg-slate-100'}`}>
                        <div className={`relative overflow-hidden p-6 flex flex-col md:flex-row items-end gap-6 ${tc.isDark ? 'bg-slate-900 border-t border-white/10' : 'bg-gray-50'}`}>
                            {tc.isDark && <div className="absolute inset-0 bg-gradient-to-tr from-white/5 via-transparent to-transparent pointer-events-none" />}
                            {tc.isDark && (
                                <div className="absolute inset-0 opacity-[0.05] pointer-events-none mix-blend-overlay"
                                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                                />
                            )}
                            
                            <div className="relative z-10 flex-1 w-full">
                                <FormField label="Admin Note (Internal)" tc={tc}>
                                    <TextArea
                                        value={note}
                                        onChange={(e) => { setNote(e.target.value); if(noteError) setNoteError(false); }}
                                        placeholder="Write internal notes about this conversion..."
                                        tc={tc}
                                        rows={2}
                                        className={`w-full bg-black/20 border-white/10 focus:border-indigo-500 transition-all text-center`}
                                    />
                                </FormField>
                            </div>
                            
                            <div className="relative z-10 flex gap-3 shrink-0">
                                {c?.status === 'pending_approval' ? (
                                    <>
                                        <button
                                            onClick={handleRejectConversion}
                                            disabled={rejectMutation.isPending || approveMutation.isPending}
                                            className={`px-6 py-2.5 rounded-lg text-sm font-bold border border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white transition-all disabled:opacity-50`}
                                        >
                                            Reject
                                        </button>
                                        <button
                                            onClick={() => approveMutation.mutate()}
                                            disabled={approveMutation.isPending || rejectMutation.isPending}
                                            className="px-8 py-2.5 rounded-lg bg-indigo-600 text-white text-sm font-bold hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/30 disabled:opacity-50"
                                        >
                                            {approveMutation.isPending ? 'Processing...' : 'Approve Conversion'}
                                        </button>
                                    </>
                                ) : (
                                    <button onClick={onClose} className={`px-8 py-2.5 rounded-lg text-sm font-bold border ${tc.btnSecondary}`}>Close Audit</button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {rejectionModal.open && (
                <RejectionReasonModal 
                    onClose={() => setRejectionModal({ open: false, eventId: null })}
                    onConfirm={confirmRejectMilestone}
                    tc={tc}
                />
            )}

            {activeProof && (
                <ProofViewer 
                    url={activeProof.url} 
                    label={activeProof.label} 
                    onClose={handleCloseProof} 
                />
            )}
        </>
    );
}
