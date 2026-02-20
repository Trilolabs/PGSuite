import { Search, Bell, HelpCircle } from 'lucide-react';

export default function Header() {
    return (
        <header className="top-header">
            <div className="header-search">
                <Search />
                <input type="text" placeholder="Search tenants, rooms, dues..." />
            </div>
            <div className="header-actions">
                <button className="header-btn">
                    <HelpCircle size={18} />
                </button>
                <button className="header-btn">
                    <Bell size={18} />
                    <span className="dot"></span>
                </button>
            </div>
        </header>
    );
}
