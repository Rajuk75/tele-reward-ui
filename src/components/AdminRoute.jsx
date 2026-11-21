import { Navigate } from 'react-router-dom';

/**
 * Wraps admin-only pages.
 * If no JWT token or not an admin, redirects to /login.
 */
export default function AdminRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const isAdmin = user?.userType === 'admin';

    if (!token || !isAdmin) {
        // If they have a token but aren't admin, they shouldn't be here
        if (token && !isAdmin) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
        }
        return <Navigate to="/login" replace />;
    }
    
    return children;
}

/**
 * Wraps public pages (Login, Landing, etc.).
 * If an admin JWT token exists, redirects to /admin/dashboard.
 */
export function PublicRoute({ children }) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    const isAdmin = user?.userType === 'admin';

    if (token && isAdmin) return <Navigate to="/admin/dashboard" replace />;
    return children;
}
