import { FiAlertTriangle } from 'react-icons/fi';

export default function DeleteWarningModal({ name, isLoading, onConfirm, onCancel, tc }) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
            <div className={`w-full max-w-sm rounded-xl shadow-xl border p-6 animate-in fade-in zoom-in duration-200 ${tc.card} ${tc.border}`}>
                <div className="flex items-start gap-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                        <FiAlertTriangle size={18} className="text-red-500" />
                    </div>
                    <div>
                        <h3 className={`text-base font-bold mb-1 ${tc.text}`}>Delete Campaign?</h3>
                        <p className={`text-sm ${tc.textMuted}`}>
                            Are you sure you want to delete{' '}
                            <span className={`font-semibold ${tc.text}`}>{name}</span>?
                            All associated data will be removed.
                        </p>
                    </div>
                </div>
                <div className="flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancel}
                        disabled={isLoading}
                        className={`px-5 py-2 rounded-lg text-sm font-semibold border transition disabled:opacity-50 ${tc.border} hover:bg-gray-50`}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="px-5 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-sm font-bold transition disabled:opacity-50"
                    >
                        {isLoading ? 'Deleting…' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
}
