import {
    FiGrid, FiBriefcase, FiTag, FiCheckSquare, FiActivity, FiUsers, FiShare2
} from 'react-icons/fi';

export const ADMIN_NAV_ITEMS = [
    { to: '/admin/dashboard',   label: 'Dashboard',             Icon: FiGrid },
    { to: '/admin/campaigns',   label: 'Campaigns',             Icon: FiBriefcase },
    { to: '/admin/offers',      label: 'Offers',                Icon: FiTag },
    { to: '/admin/referrals',   label: 'Partner & Referrers',   Icon: FiShare2 },
    { to: '/admin/conversions', label: 'Conversions & Payouts', Icon: FiCheckSquare },
    { to: '/admin/postbacks',   label: 'Postback Logs',         Icon: FiActivity },
    { to: '/admin/users',       label: 'Team & Admins',         Icon: FiUsers },
];
