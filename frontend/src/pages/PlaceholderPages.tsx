import { Users, CalendarCheck, History, Target, UsersRound, IndianRupee, Receipt, CreditCard, Wallet, DoorOpen, UtensilsCrossed, AlertTriangle, Package, Zap, Landmark, FileBarChart, MessageCircle, Settings } from 'lucide-react';

// Generic placeholder page for modules not yet fully built
export function PlaceholderPage({ title, icon: Icon }: { title: string; icon: any }) {
    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>{title}</h1>
                    <p className="subtitle">This module is connected to the backend API</p>
                </div>
                <button className="btn btn-primary">
                    <Icon size={16} /> Add New
                </button>
            </div>
            <div className="card">
                <div className="empty-state">
                    <Icon size={48} />
                    <h3>{title}</h3>
                    <p>This page will display your {title.toLowerCase()} data from the API</p>
                </div>
            </div>
        </div>
    );
}

export const TenantsPage = () => <PlaceholderPage title="Tenants" icon={Users} />;
export const AddTenantPage = () => <PlaceholderPage title="Add Tenant" icon={Users} />;
export const BookingsPage = () => <PlaceholderPage title="Bookings" icon={CalendarCheck} />;
export const OldTenantsPage = () => <PlaceholderPage title="Old Tenants" icon={History} />;
export const LeadsPage = () => <PlaceholderPage title="Leads" icon={Target} />;
export const TeamPage = () => <PlaceholderPage title="Team" icon={UsersRound} />;
export const DuesPage = () => <PlaceholderPage title="Dues" icon={IndianRupee} />;
export const CollectionPage = () => <PlaceholderPage title="Collection" icon={Receipt} />;
export const ExpensePage = () => <PlaceholderPage title="Expense" icon={CreditCard} />;
export const DuesPackagePage = () => <PlaceholderPage title="Dues Package" icon={Wallet} />;
export const RoomsPage = () => <PlaceholderPage title="Rooms" icon={DoorOpen} />;
export const FoodPage = () => <PlaceholderPage title="Food" icon={UtensilsCrossed} />;
export const ComplaintsPage = () => <PlaceholderPage title="Complaints" icon={AlertTriangle} />;
export const AssetsPage = () => <PlaceholderPage title="Assets" icon={Package} />;
export const ElectricityPage = () => <PlaceholderPage title="Electricity" icon={Zap} />;
export const BanksPage = () => <PlaceholderPage title="Banks" icon={Landmark} />;
export const ReportsPage = () => <PlaceholderPage title="Reports" icon={FileBarChart} />;
export const WhatsAppPage = () => <PlaceholderPage title="WhatsApp" icon={MessageCircle} />;
export const SettingsPage = () => <PlaceholderPage title="Settings" icon={Settings} />;
