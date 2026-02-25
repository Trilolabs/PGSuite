import { NavLink, useNavigate } from 'react-router-dom';
import {
    LayoutDashboard, Users, UserPlus, History, CalendarCheck,
    Target, UsersRound, IndianRupee, Receipt, CreditCard,
    Wallet, Building2, DoorOpen, UtensilsCrossed, AlertTriangle,
    Package, Zap, Landmark, FileBarChart, MessageCircle,
    Settings, LogOut, Star, ClipboardList, Globe,
} from 'lucide-react';
import { useAuthStore } from '../stores/authStore';
import { usePropertyStore } from '../stores/propertyStore';

const navItems = [
    {
        section: 'Overview',
        items: [
            { to: '/home', icon: LayoutDashboard, label: 'Home' },
        ],
    },
    {
        section: 'People',
        items: [
            { to: '/tenants', icon: Users, label: 'Tenants' },
            { to: '/tenants/add', icon: UserPlus, label: 'Add Tenant' },
            { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
            { to: '/old-tenants', icon: History, label: 'Old Tenants' },
            { to: '/leads', icon: Target, label: 'Leads' },
            { to: '/team', icon: UsersRound, label: 'Team' },
        ],
    },
    {
        section: 'Money',
        items: [
            { to: '/dues', icon: IndianRupee, label: 'Dues' },
            { to: '/collection', icon: Receipt, label: 'Collection' },
            { to: '/expense', icon: CreditCard, label: 'Expense' },
            { to: '/dues-package', icon: Wallet, label: 'Dues Package' },
        ],
    },
    {
        section: 'Property',
        items: [
            { to: '/rooms', icon: DoorOpen, label: 'Rooms' },
            { to: '/food', icon: UtensilsCrossed, label: 'Food' },
            { to: '/complaints', icon: AlertTriangle, label: 'Complaints' },
            { to: '/reviews', icon: Star, label: 'Reviews' },
        ],
    },
    {
        section: '',
        items: [
            { to: '/tasks', icon: ClipboardList, label: 'Tasks' },
            { to: '/reports', icon: FileBarChart, label: 'Reports' },
            { to: '/listings', icon: Globe, label: 'Listings' },
            { to: '/electricity', icon: Zap, label: 'Electricity' },
            { to: '/banks', icon: Landmark, label: 'Banks' },
            { to: '/assets', icon: Package, label: 'Assets' },
            { to: '/whatsapp', icon: MessageCircle, label: 'WhatsApp' },
        ],
    },
];

export default function Sidebar() {
    const { user, logout } = useAuthStore();
    const { properties, selectedPropertyId, setSelectedProperty } = usePropertyStore();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const initials = user?.name
        ?.split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || '?';

    return (
        <aside className="sidebar">
            <div className="sidebar-header">
                <div className="sidebar-logo">PG</div>
                <div className="sidebar-brand">
                    PG Manager
                    <small>Property Management</small>
                </div>
            </div>

            {properties.length > 1 && (
                <div style={{ padding: '8px 10px 0' }}>
                    <div className="property-selector" style={{ width: '100%' }}>
                        <Building2 size={16} />
                        <select
                            value={selectedPropertyId || ''}
                            onChange={(e) => setSelectedProperty(e.target.value)}
                            style={{ flex: 1 }}
                        >
                            {properties.map((p) => (
                                <option key={p.id} value={p.id}>{p.name}</option>
                            ))}
                        </select>
                    </div>
                </div>
            )}

            <nav className="sidebar-nav">
                {navItems.map((section) => (
                    <div className="nav-section" key={section.section}>
                        <div className="nav-section-title">{section.section}</div>
                        {section.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            >
                                <item.icon />
                                {item.label}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer">
                <NavLink to="/settings" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                    <Settings />
                    Settings
                </NavLink>
                <button className="nav-link" onClick={handleLogout}>
                    <LogOut />
                    Logout
                </button>
                <div className="sidebar-user">
                    <div className="sidebar-avatar">{initials}</div>
                    <div className="sidebar-user-info">
                        <div className="sidebar-user-name">{user?.name || 'User'}</div>
                        <div className="sidebar-user-role">{user?.role || 'admin'}</div>
                    </div>
                </div>
            </div>
        </aside>
    );
}
