import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLogOut } from 'react-icons/fi';
import { logout } from '../../services/AppService';

/**
 * Minimalist Black & White vector avatar.
 */
function BlackWhiteAvatar({ className = "w-9 h-9" }) {
    return (
        <svg
            className={className}
            viewBox="0 0 36 36"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <circle cx="18" cy="18" r="18" fill="#18181B" />
            <circle cx="18" cy="13" r="5.5" fill="#FFFFFF" />
            <path
                d="M7.5 31C7.5 25.2 12.2 20.5 18 20.5C23.8 20.5 28.5 25.2 28.5 31"
                fill="#FFFFFF"
            />
        </svg>
    );
}

export default function AdminProfile() {
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef(null);

    const user = (() => {
        try {
            return JSON.parse(localStorage.getItem('user') || '{}');
        } catch {
            return {};
        }
    })();

    const displayName = user.name || (user.email ? user.email.split('@')[0] : 'Admin');

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setOpen(false);
        logout();
        navigate('/login');
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Simple Avatar Trigger (No card wrapper) */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="flex items-center rounded-full p-0.5 hover:ring-2 hover:ring-gray-300 transition-all focus:outline-none"
                title="Account"
            >
                <div className="relative">
                    <BlackWhiteAvatar className="w-9 h-9 cursor-pointer" />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                </div>
            </button>

            {/* Simple Dropdown Menu */}
            {open && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl shadow-lg border border-gray-200 bg-white py-1 text-gray-800 z-50 animate-in fade-in zoom-in-95 duration-100">
                    <div className="px-4 py-2.5 border-b border-gray-100">
                        <p className="text-sm font-semibold text-gray-900 truncate">{displayName}</p>
                        <p className="text-xs text-gray-500 truncate">{user.email || 'admin@adshamper.com'}</p>
                    </div>

                    <div className="py-1">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                        >
                            <FiLogOut size={15} />
                            <span>Sign Out</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
