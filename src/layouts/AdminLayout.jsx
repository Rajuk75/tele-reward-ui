import { Outlet, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Sidebar from './admin/Sidebar';
import Header from './admin/Header';

export default function AdminLayout() {
    const location = useLocation();

    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);

    // Auto-close mobile drawer on route changes
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname]);

    const handleToggleSidebar = () => {
        if (window.innerWidth < 1024) {
            setMobileOpen((prev) => !prev);
        } else {
            setCollapsed((prev) => !prev);
        }
    };

    return (
        <div className="flex h-screen overflow-hidden bg-slate-50 text-gray-900">
            {/* Desktop & Mobile Sidebar */}
            <Sidebar
                collapsed={collapsed}
                setCollapsed={setCollapsed}
                mobileOpen={mobileOpen}
                setMobileOpen={setMobileOpen}
            />

            {/* Main Work Area */}
            <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Header (Hamburger & Profile Menu) */}
                <Header
                    onToggleSidebar={handleToggleSidebar}
                />

                {/* Routed Page Content */}
                <main className="flex-1 overflow-y-auto custom-scrollbar bg-slate-50">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
