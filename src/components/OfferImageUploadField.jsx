import { useState } from 'react';
import { uploadFile } from '../services/AppService';

/**
 * Reusable background-image field for offer create/edit modals.
 * Props:
 *   value    — current image URL (form.backgroundImage)
 *   onChange — (url: string) => void  — called with the new URL after upload or URL paste
 *   tc       — theme classes object from useThemeClasses()
 */
export default function OfferImageUploadField({ value, onChange, tc }) {
    const [mode, setMode] = useState('upload');
    const [preview, setPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setPreview(URL.createObjectURL(file));
        setIsUploading(true);
        try {
            const res = await uploadFile(file, 'offers');
            const url = res.data?.data?.url;
            if (url) onChange(url);
        } catch (err) {
            console.error('Image upload failed', err);
        } finally {
            setIsUploading(false);
        }
    };

    const displaySrc = mode === 'upload' ? preview : value;

    return (
        <div className="space-y-3">
            {/* Mode toggle */}
            <div className="flex items-center gap-2">
                {['upload', 'url'].map((m) => (
                    <button
                        key={m}
                        type="button"
                        onClick={() => setMode(m)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                            mode === m
                                ? 'bg-black text-white border-black'
                                : tc.isDark
                                ? 'border-slate-700 text-slate-400 hover:border-slate-500'
                                : 'border-gray-200 text-gray-500 hover:border-gray-400'
                        }`}
                    >
                        {m === 'upload' ? 'Upload File' : 'Image URL'}
                    </button>
                ))}
            </div>

            {/* Preview + input row */}
            <div className="flex items-center gap-4">
                {/* Thumbnail preview */}
                <div
                    className={`w-24 h-16 rounded-lg border flex-shrink-0 flex items-center justify-center overflow-hidden ${
                        tc.isDark ? 'bg-slate-800 border-slate-700' : 'bg-gray-50 border-gray-200'
                    }`}
                >
                    {displaySrc ? (
                        <img src={displaySrc} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                        <span className="text-[10px] text-gray-400 uppercase font-bold tracking-wide">No Image</span>
                    )}
                </div>

                {/* Upload or URL input */}
                {mode === 'upload' ? (
                    <div className="flex-1 flex flex-col gap-1">
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            disabled={isUploading}
                            className={`text-xs file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold transition ${
                                tc.isDark
                                    ? 'file:bg-indigo-500/10 file:text-indigo-400 text-slate-400'
                                    : 'file:bg-indigo-50 file:text-indigo-700 text-gray-500'
                            } disabled:opacity-50`}
                        />
                        {isUploading && (
                            <p className="text-[10px] text-indigo-500 font-bold animate-pulse">Uploading image…</p>
                        )}
                        {!isUploading && value && (
                            <p className="text-[10px] text-green-500 font-semibold truncate max-w-xs">
                                Saved: {value.split('/').pop()}
                            </p>
                        )}
                    </div>
                ) : (
                    <input
                        type="url"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="https://example.com/image.jpg"
                        className={`flex-1 border rounded-lg px-3 py-1.5 text-sm focus:border-black outline-none transition ${tc.input}`}
                    />
                )}
            </div>
        </div>
    );
}
