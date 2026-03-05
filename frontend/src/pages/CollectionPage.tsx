import { useEffect, useState, useMemo } from 'react';
import { Share2 } from 'lucide-react';
import { paymentApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import { useNavigate } from 'react-router-dom';

interface Payment {
    id: string;
    tenant_name: string;
    tenant_id?: string;
    tenant?: string;
    amount: string;
    payment_date: string;
    mode: string;
    reference_number: string;
    notes: string;
    received_by?: string;
    received_by_name?: string;
    due?: string;
    due_type?: string;
}

interface SummaryData {
    total: number;
    advance: number;
    rent: number;
    electricity: number;
    food: number;
    deposit: number;
    late_fine: number;
    month_total: number;
    month_dues: number;
    month_rent: number;
    month_electricity: number;
    month_food: number;
    month_deposit: number;
    month_late_fine: number;
    month_advance: number;
}


const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const CURRENT_MONTH = MONTH_NAMES[new Date().getMonth()];

const PAYMENT_MODES = [
    { value: '', label: 'Payment Mode' },
    { value: 'cash', label: 'Cash' },
    { value: 'upi', label: 'UPI' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'online', label: 'Online' },
    { value: 'card', label: 'Card' },
    { value: 'cheque', label: 'Cheque' },
    { value: 'other', label: 'Other' },
];

const COLLECTION_TYPES = [
    { value: '', label: 'Collection Types' },
    { value: 'rent', label: 'Rent' },
    { value: 'electricity', label: 'Electricity' },
    { value: 'mess', label: 'Mess/Food' },
    { value: 'deposit', label: 'Security Deposit' },
    { value: 'late', label: 'Late Fine' },
    { value: 'advance', label: 'Advance' },
];

const DATE_PRESETS = [
    { value: '', label: 'All Time' },
    { value: 'today', label: 'Today' },
    { value: 'this_month', label: 'This Month' },
    { value: 'last_month', label: 'Last Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
];

const getDateRange = (preset: string) => {
    const today = new Date();
    const fmt = (d: Date) => d.toISOString().split('T')[0];
    if (!preset) return {};
    const range: any = { date_to: fmt(today) };
    if (preset === 'today') range.date_from = fmt(today);
    else if (preset === 'this_month') range.date_from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
    else if (preset === 'last_month') {
        range.date_from = fmt(new Date(today.getFullYear(), today.getMonth() - 1, 1));
        range.date_to = fmt(new Date(today.getFullYear(), today.getMonth(), 0));
    } else if (preset === 'last_3_months') range.date_from = fmt(new Date(today.getFullYear(), today.getMonth() - 3, 1));
    else if (preset === 'last_6_months') range.date_from = fmt(new Date(today.getFullYear(), today.getMonth() - 6, 1));
    return range;
};

export default function CollectionPage() {
    const navigate = useNavigate();
    const { selectedPropertyId } = usePropertyStore();

    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);

    // Filters — mutually exclusive: card filters vs dropdown filters
    const [activeCardFilter, setActiveCardFilter] = useState('');
    const [modeFilter, setModeFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [collectedOnFilter, setCollectedOnFilter] = useState('');
    const [dueDateFilter, setDueDateFilter] = useState('');
    const [receivedByFilter, setReceivedByFilter] = useState('');
    const [tenantTypeFilter, setTenantTypeFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');

    const load = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);

        const params: any = { paginate: 'false' };

        // Apply active card filter OR dropdown filters (mutually exclusive)
        if (activeCardFilter) {
            params.due_type = activeCardFilter;
        } else {
            if (modeFilter) params.mode = modeFilter;
            if (typeFilter) params.due_type = typeFilter;
        }

        // "Was Collected On" date range
        if (collectedOnFilter) {
            const range = getDateRange(collectedOnFilter);
            if (range.date_from) params.date_from = range.date_from;
            if (range.date_to) params.date_to = range.date_to;
        }
        // "Was Due On" date range
        if (dueDateFilter) {
            const range = getDateRange(dueDateFilter);
            if (range.date_from) params.due_date_from = range.date_from;
            if (range.date_to) params.due_date_to = range.date_to;
        }
        if (receivedByFilter) params.received_by = receivedByFilter;
        if (tenantTypeFilter) params.tenant_status = tenantTypeFilter;
        if (searchQuery.trim()) params.search = searchQuery.trim();

        Promise.all([
            paymentApi.list(selectedPropertyId, params),
            paymentApi.summary(selectedPropertyId)
        ]).then(([paymentsRes, summaryRes]) => {
            setPayments(paymentsRes.data.results || paymentsRes.data || []);
            setSummary(summaryRes.data);
        }).catch((err) => {
            console.error('Error loading collections:', err);
        }).finally(() => {
            setLoading(false);
        });
    };

    useEffect(() => { load(); }, [selectedPropertyId, activeCardFilter, modeFilter, typeFilter, collectedOnFilter, dueDateFilter, receivedByFilter, tenantTypeFilter, searchQuery]);

    const formatCurrency = (amount: number | string) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));

    // Dynamic totals from visible table rows
    const visibleTotal = payments.reduce((sum, p) => sum + Number(p.amount), 0);
    const visibleCount = payments.length;

    // Unique received_by names from payment data (fallback if no team API)
    const receivedByOptions = useMemo(() => {
        const map = new Map<string, string>();
        payments.forEach(p => {
            if (p.received_by && p.received_by_name) {
                map.set(String(p.received_by), p.received_by_name);
            }
        });
        return Array.from(map, ([id, name]) => ({ id, name }));
    }, [payments]);

    // Build filter cards based on summary data (matching RentOk layout)
    const buildFilterCards = () => {
        if (!summary) return [];
        return [
            { label: 'Total Collection', value: summary.total, filterValue: '', color: '#10b981' },
            { label: `All Collection in ${CURRENT_MONTH}`, value: summary.month_total, filterValue: 'month', color: '#10b981' },
            { label: `${CURRENT_MONTH} Dues Collection`, value: summary.month_dues, filterValue: 'month_dues', color: '#10b981' },
            { label: `${CURRENT_MONTH}'s Rent Collection`, value: summary.month_rent, filterValue: 'month_rent', color: '#10b981' },
            { label: `${CURRENT_MONTH}'s Electricity Collection`, value: summary.month_electricity, filterValue: 'month_electricity', color: '#3b82f6' },
            { label: `${CURRENT_MONTH}'s Food Collection`, value: summary.month_food, filterValue: 'month_food', color: '#f59e0b' },
            { label: `${CURRENT_MONTH}'s Deposit Collection`, value: summary.month_deposit, filterValue: 'month_deposit', color: '#ef4444' },
            { label: `${CURRENT_MONTH}'s Late Fine Collection`, value: summary.month_late_fine, filterValue: 'month_late', color: '#ef4444' },
            { label: `${CURRENT_MONTH}'s Advance`, value: summary.month_advance, filterValue: 'advance', color: '#10b981' },
            { label: 'Total Rent Collection', value: summary.rent, filterValue: 'rent', color: '#10b981' },
            { label: 'Total Electricity Collection', value: summary.electricity, filterValue: 'electricity', color: '#3b82f6' },
            { label: 'Total Deposit Collection', value: summary.deposit, filterValue: 'deposit', color: '#ef4444' },
        ];
    };

    const filterCards = buildFilterCards();
    const selectStyle = (active: boolean) => ({
        padding: '7px 14px', borderRadius: 20,
        background: active ? '#3b82f6' : 'var(--bg-secondary, #1e293b)',
        border: '1px solid var(--border-primary, #334155)',
        color: active ? '#fff' : 'var(--text-secondary, #94a3b8)',
        fontSize: '0.8rem', outline: 'none' as const, cursor: 'pointer' as const,
    });

    if (loading && !payments.length && !summary) return <div className="p-8 text-center" style={{ color: '#ecf0f1' }}>Loading collections...</div>;

    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>Collection</h1>
            </div>

            {/* ===== TOP SUMMARY CARDS ===== */}
            {summary && (
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 16, scrollbarWidth: 'none' }}>
                    {filterCards.map((card, idx) => {
                        const isActive = activeCardFilter === card.filterValue;
                        return (
                            <div key={idx}
                                onClick={() => {
                                    setActiveCardFilter(card.filterValue);
                                    setModeFilter(''); setTypeFilter('');
                                }}
                                style={{
                                    cursor: 'pointer', minWidth: 160, padding: '14px 16px', borderRadius: 10,
                                    background: 'var(--bg-secondary, #1e293b)',
                                    border: isActive ? '2px solid #3b82f6' : '1px solid var(--border-primary, #334155)',
                                    transition: 'all 0.2s', flexShrink: 0,
                                }}
                            >
                                <div style={{ color: card.color, fontSize: '1.15rem', fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap' }}>
                                    {formatCurrency(card.value)}
                                </div>
                                <div style={{ color: isActive ? '#f8fafc' : '#94a3b8', fontSize: '0.78rem', lineHeight: 1.3 }}>
                                    {card.label}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ===== SEARCH & FILTER DROPDOWNS ===== */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search tenants with collections..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1, minWidth: 240, padding: '8px 14px', borderRadius: 8,
                        background: 'var(--bg-secondary, #1e293b)', border: '1px solid var(--border-primary, #334155)',
                        color: 'var(--text-primary, #e2e8f0)', outline: 'none', fontSize: '0.875rem'
                    }}
                />

                {/* Was Collected On */}
                <select value={collectedOnFilter} onChange={e => { setCollectedOnFilter(e.target.value); setActiveCardFilter(''); }} style={selectStyle(!!collectedOnFilter)}>
                    <option value="">Was Collected On</option>
                    {DATE_PRESETS.filter(p => p.value).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>

                {/* Was Due On */}
                <select value={dueDateFilter} onChange={e => { setDueDateFilter(e.target.value); setActiveCardFilter(''); }} style={selectStyle(!!dueDateFilter)}>
                    <option value="">Was Due On</option>
                    {DATE_PRESETS.filter(p => p.value).map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                </select>

                {/* Payment Mode */}
                <select value={modeFilter} onChange={e => { setModeFilter(e.target.value); setActiveCardFilter(''); }} style={selectStyle(!!modeFilter)}>
                    {PAYMENT_MODES.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>

                {/* Received By */}
                <select value={receivedByFilter} onChange={e => { setReceivedByFilter(e.target.value); setActiveCardFilter(''); }} style={selectStyle(!!receivedByFilter)}>
                    <option value="">Received By</option>
                    {receivedByOptions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>

                {/* Collection Types */}
                <select value={typeFilter} onChange={e => { setTypeFilter(e.target.value); setActiveCardFilter(''); }} style={selectStyle(!!typeFilter)}>
                    {COLLECTION_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>

                {/* Tenant Types */}
                <select value={tenantTypeFilter} onChange={e => { setTenantTypeFilter(e.target.value); setActiveCardFilter(''); }} style={selectStyle(!!tenantTypeFilter)}>
                    <option value="">Tenant Types</option>
                    <option value="active">Active Tenant</option>
                    <option value="booking_pending">Bookings</option>
                    <option value="checked_out">Old Tenants</option>
                </select>
            </div>

            {/* ===== RESULTS COUNTER ===== */}
            <div style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>{formatCurrency(visibleTotal)}</span>
                <span style={{ color: '#3b82f6', marginLeft: 6 }}>/ {visibleCount} Results Found</span>
            </div>

            {/* ===== DATA TABLE ===== */}
            <div style={{ background: 'var(--bg-secondary, #1e293b)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-primary, #334155)' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tenant</th>
                                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Room</th>
                                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Received On</th>
                                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Payment Mode</th>
                                <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => {
                                const tenantId = (payment as any).tenant_id || (payment as any).tenant;
                                const tenantName = payment.tenant_name || 'Unknown';
                                return (
                                    <tr key={payment.id}
                                        style={{ borderBottom: '1px solid var(--border-primary, #334155)', cursor: 'pointer' }}
                                        onClick={() => { if (tenantId) navigate(`/tenants/${tenantId}?tab=passbook&view=collections`); }}
                                        onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-primary, #0f172a)')}
                                        onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                    >
                                        <td style={{ padding: '14px 20px' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                <div style={{
                                                    width: 30, height: 30, borderRadius: '50%',
                                                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                                                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                    color: '#fff', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0
                                                }}>
                                                    {tenantName.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ color: '#3b82f6', fontWeight: 500 }}>{tenantName}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ padding: '3px 10px', background: 'rgba(217, 70, 239, 0.1)', color: '#d946ef', borderRadius: 4, fontSize: '0.82rem' }}>
                                                Room
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: 700, color: '#22c55e', fontSize: '0.9rem' }}>
                                            {formatCurrency(payment.amount)}
                                        </td>
                                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                                            {new Date(payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ padding: '3px 10px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 4, fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                                {payment.mode.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); }}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#60a5fa', fontSize: '0.82rem', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                            >
                                                <Share2 size={14} /> Share receipt
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                            {payments.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: '40px 20px', textAlign: 'center', color: '#64748b' }}>
                                        No collections found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
