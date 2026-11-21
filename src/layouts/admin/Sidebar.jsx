import { NavLink } from 'react-router-dom';
import { FiChevronLeft, FiChevronRight, FiX } from 'react-icons/fi';
import { ADMIN_NAV_ITEMS } from './navConfig';

export default function Sidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen }) {
    function SidebarBody({ isMobile = false }) {
        const expanded = isMobile || !collapsed;

        return (
            <div className="flex flex-col h-full select-none bg-white">
                {/* Brand / Logo Header */}
                <div className="flex items-center h-16 gap-3 px-4 border-b border-gray-200 flex-shrink-0">
                    <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0 shadow-md shadow-indigo-600/30">
                        A
                    </div>

                    {expanded && (
                        <div className="min-w-0 flex-1">
                            <p className="font-bold text-sm truncate text-gray-900">
                                AdsHamper
                            </p>
                            <p className="text-[11px] text-indigo-500 font-medium tracking-wide">
                                Telegram Rewards
                            </p>
                        </div>
                    )}

                    {isMobile ? (
                        <button
                            onClick={() => setMobileOpen(false)}
                            className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                        >
                            <FiX size={18} />
                        </button>
                    ) : (
                        <button
                            onClick={() => setCollapsed((c) => !c)}
                            className="ml-auto p-1.5 rounded-lg transition text-gray-400 hover:text-gray-700 hover:bg-gray-100"
                            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                        >
                            {collapsed ? <FiChevronRight size={15} /> : <FiChevronLeft size={15} />}
                        </button>
                    )}
                </div>

                {/* Navigation Links */}
                <nav className={`flex-1 overflow-y-auto py-4 space-y-1 ${expanded ? 'px-3' : 'px-2'}`}>
                    {ADMIN_NAV_ITEMS.map(({ to, label, Icon }) => (
                        <NavLink
                            key={to}
                            to={to}
                            title={!expanded ? label : undefined}
                            onClick={() => {
                                if (isMobile) setMobileOpen(false);
                            }}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                                    isActive
                                        ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                                        : 'text-gray-600 hover:text-gray-900 hover:bg-slate-100'
                                }`
                            }
                        >
                            <Icon size={18} className="flex-shrink-0" />
                            {expanded && <span className="truncate">{label}</span>}
                        </NavLink>
                    ))}
                </nav>
            </div>
        );
    }

    return (
        <>
            {/* Desktop Sidebar */}
            <aside
                className={`hidden lg:flex flex-col flex-shrink-0 transition-all duration-300 ease-in-out z-30 ${
                    collapsed ? 'w-[70px]' : 'w-64'
                } bg-white border-r border-gray-200 shadow-sm`}
            >
                <SidebarBody />
            </aside>

            {/* Mobile Drawer Overlay */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
                        onClick={() => setMobileOpen(false)}
                    />
                    <aside className="relative z-10 w-72 flex flex-col h-full shadow-2xl transition-transform duration-300 bg-white">
                        <SidebarBody isMobile />
                    </aside>
                </div>
            )}
        </>
    );
}
