import { FiMenu } from 'react-icons/fi';
import AdminProfile from './AdminProfile';

export default function Header({ onToggleSidebar }) {
    return (
        <header className="flex-shrink-0 h-16 px-6 flex items-center justify-between gap-4 border-b border-gray-200 z-20 sticky top-0 bg-white/90 backdrop-blur-md shadow-sm transition-colors text-gray-900">
            {/* Left: Hamburger */}
            <div className="flex items-center gap-4">
                <button
                    onClick={onToggleSidebar}
                    className="p-2 rounded-xl transition-all hover:bg-slate-100 text-gray-500 hover:text-gray-900"
                    title="Toggle Sidebar"
                >
                    <FiMenu size={22} />
                </button>
            </div>

            {/* Right: Admin Profile */}
            <div className="flex items-center gap-3 flex-shrink-0">
                <AdminProfile />
            </div>
        </header>
    );
}
