import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Bell, Share2, Copy, MessageCircle, X, Check, FileText, Upload, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react';
import { duesApi, paymentApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Due {
    id: string;
    tenant: string;
    tenant_name: string;
    type: string;
    amount: string;
    paid_amount: string;
    late_fine: string;
    due_date: string;
    status: string;
    description: string;
    room_number?: string;
}

interface GroupedDue {
    id: string;
    tenant: string;
    tenant_name: string;
    room_number: string;
    amount: number;
    paid_amount: number;
    late_fine: number;
    balance: number;
    oldest_due_date: string;
    latest_due_date: string;
    original_dues: Due[];
}

interface Summary {
    all_dues: number;
    current_dues: number;
    month_dues: number;
    future_dues: number;
    month_rent: number;
    month_electricity: number;
    month_food: number;
    month_deposit: number;
    total_rent: number;
    total_electricity: number;
    total_late_fine: number;
}

export default function DuesPage() {
    const navigate = useNavigate();
    const [dues, setDues] = useState<GroupedDue[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    // Filters
    const [dueTypeFilter, setDueTypeFilter] = useState(''); // dropdown filter
    const [tenantTypeFilter, setTenantTypeFilter] = useState('');
    const [dateRangeFilter, setDateRangeFilter] = useState('');
    const [defaulterFilter, setDefaulterFilter] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeCardFilter, setActiveCardFilter] = useState(''); // card-based filter

    // UI states
    const [showRemindModal, setShowRemindModal] = useState<GroupedDue | null>(null);
    const [showRecordPayment, setShowRecordPayment] = useState<GroupedDue | null>(null);
    const [showBulkReminder, setShowBulkReminder] = useState(false);

    // Forms
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        payment_date: new Date().toISOString().split('T')[0],
        mode: 'Cash',
        reference_number: '',
        notes: ''
    });

    // Breakup allocation state
    const [showBreakup, setShowBreakup] = useState(false);
    const [breakupAllocations, setBreakupAllocations] = useState<Record<string, string>>({});
    const [breakupSaved, setBreakupSaved] = useState(false);

    const load = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        const params: any = { paginate: 'false' };
        if (activeCardFilter) {
            params.due_type = activeCardFilter;
        } else if (dueTypeFilter) {
            params.due_type = dueTypeFilter;
        }
        if (tenantTypeFilter) params.tenant_status = tenantTypeFilter;
        if (defaulterFilter) params.defaulter = defaulterFilter;
        // Date range presets
        if (dateRangeFilter) {
            const today = new Date();
            const fmt = (d: Date) => d.toISOString().split('T')[0];
            params.date_to = fmt(today);
            if (dateRangeFilter === 'today') params.date_from = fmt(today);
            else if (dateRangeFilter === 'this_month') params.date_from = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
            else if (dateRangeFilter === 'last_month') {
                params.date_from = fmt(new Date(today.getFullYear(), today.getMonth() - 1, 1));
                params.date_to = fmt(new Date(today.getFullYear(), today.getMonth(), 0));
            } else if (dateRangeFilter === 'last_3_months') params.date_from = fmt(new Date(today.getFullYear(), today.getMonth() - 3, 1));
            else if (dateRangeFilter === 'last_6_months') params.date_from = fmt(new Date(today.getFullYear(), today.getMonth() - 6, 1));
        }

        Promise.all([
            duesApi.list(selectedPropertyId, params),
            duesApi.summary(selectedPropertyId),
        ]).then(([duesRes, sumRes]) => {
            const fetched: Due[] = duesRes.data.results || duesRes.data || [];
            const openDues = fetched.filter(d => d.status !== 'paid');

            const groupMap: Record<string, GroupedDue> = {};
            openDues.forEach(d => {
                if (!groupMap[d.tenant]) {
                    groupMap[d.tenant] = {
                        id: d.tenant,
                        tenant: d.tenant,
                        tenant_name: d.tenant_name,
                        room_number: d.room_number || '',
                        amount: 0,
                        paid_amount: 0,
                        late_fine: 0,
                        balance: 0,
                        oldest_due_date: d.due_date,
                        latest_due_date: d.due_date,
                        original_dues: []
                    };
                }
                const g = groupMap[d.tenant];
                g.amount += Number(d.amount);
                g.paid_amount += Number(d.paid_amount);
                g.late_fine += Number(d.late_fine || 0);
                g.balance += (Number(d.amount) + Number(d.late_fine || 0) - Number(d.paid_amount));

                // Track oldest and latest due date
                if (new Date(d.due_date) < new Date(g.oldest_due_date)) {
                    g.oldest_due_date = d.due_date;
                }
                if (new Date(d.due_date) > new Date(g.latest_due_date)) {
                    g.latest_due_date = d.due_date;
                }
                g.original_dues.push(d);
            });

            setDues(Object.values(groupMap) as GroupedDue[]);
            setSummary(sumRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [selectedPropertyId, activeCardFilter, dueTypeFilter, tenantTypeFilter, dateRangeFilter, defaulterFilter]);
    // Filtered dues (client-side search)
    const filteredDues = searchQuery.trim()
        ? dues.filter(d => d.tenant_name.toLowerCase().includes(searchQuery.toLowerCase()))
        : dues;

    // Compute the filtered total from the current visible table rows
    const filteredTotal = filteredDues.reduce((sum, d) => sum + d.balance, 0);

    const handleCardFilter = (filterValue: string) => {
        // Clicking card clears the dropdown filter (like RentOk — they are mutually exclusive)
        setActiveCardFilter(filterValue);
        setDueTypeFilter('');
    };

    const handleDueTypeDropdown = (value: string) => {
        // Dropdown clears card filter (like RentOk)
        setDueTypeFilter(value);
        setActiveCardFilter('');
    };

    const handleRecordPayment = async () => {
        if (!selectedPropertyId || !showRecordPayment) return;
        try {
            const modeMap: Record<string, string> = {
                'Cash': 'cash',
                'GPay': 'upi',
                'PhonePe': 'upi',
                'Paytm': 'upi',
                'Bank Transfer': 'bank_transfer',
                'Other': 'other'
            };
            await paymentApi.create(selectedPropertyId, {
                tenant: showRecordPayment.tenant,
                amount: Number(paymentForm.amount),
                payment_date: paymentForm.payment_date,
                mode: modeMap[paymentForm.mode] || 'other',
                reference_number: paymentForm.reference_number,
                notes: paymentForm.notes
            });
            setShowRecordPayment(null);
            setPaymentForm({
                amount: '', payment_date: new Date().toISOString().split('T')[0],
                mode: 'Cash', reference_number: '', notes: ''
            });
            setShowBreakup(false);
            setBreakupAllocations({});
            setBreakupSaved(false);
            load();
            alert("Payment recorded successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to record payment");
        }
    };

    const initBreakupAllocations = (dues: Due[]) => {
        const allocs: Record<string, string> = {};
        let remaining = Number(paymentForm.amount) || 0;
        dues.forEach(d => {
            const bal = Number(d.amount) + Number(d.late_fine || 0) - Number(d.paid_amount);
            const alloc = Math.min(remaining, bal);
            allocs[d.id] = alloc.toString();
            remaining -= alloc;
        });
        setBreakupAllocations(allocs);
    };

    const breakupTotal = Object.values(breakupAllocations).reduce((s, v) => s + (Number(v) || 0), 0);
    const amountsMatch = Math.abs(breakupTotal - (Number(paymentForm.amount) || 0)) < 0.01;

    const copyPaymentLink = () => {
        navigator.clipboard.writeText(`https://pay.pgmanager.com/${showRemindModal?.id || 'demo'}`);
        alert("Payment link copied to clipboard!");
    };

    const filterCards = [
        { label: 'All Dues', value: summary?.all_dues || 0, filterValue: '' },
        { label: 'Current Dues', value: summary?.current_dues || 0, filterValue: 'current' },
        { label: `${new Date().toLocaleString('default', { month: 'short' })} Dues`, value: summary?.month_dues || 0, filterValue: 'month' },
        { label: 'Total Future Dues', value: summary?.future_dues || 0, filterValue: 'future', highlightColor: '#f59e0b' },
        { label: `${new Date().toLocaleString('default', { month: 'short' })} Rent Dues`, value: summary?.month_rent || 0, filterValue: 'month_rent' },
        { label: `${new Date().toLocaleString('default', { month: 'short' })} Electricity Bill Dues`, value: summary?.month_electricity || 0, filterValue: 'month_electricity' },
        { label: `${new Date().toLocaleString('default', { month: 'short' })} Mess Food Dues`, value: summary?.month_food || 0, filterValue: 'month_food' },
        { label: `${new Date().toLocaleString('default', { month: 'short' })} Cash Deposit Dues`, value: summary?.month_deposit || 0, filterValue: 'month_deposit' },
        { label: 'Total Unpaid Rent', value: summary?.total_rent || 0, filterValue: 'rent' },
        { label: 'Total Electricity Bill Dues', value: summary?.total_electricity || 0, filterValue: 'electricity' },
        { label: 'Total Late Fine Dues', value: summary?.total_late_fine || 0, filterValue: 'late' },
    ];

    const selectStyle = (active: boolean) => ({
        padding: '7px 14px', borderRadius: 20,
        background: active ? '#3b82f6' : 'var(--bg-secondary, #1e293b)',
        border: '1px solid var(--border-primary, #334155)',
        color: active ? '#fff' : 'var(--text-secondary, #94a3b8)',
        fontSize: '0.8rem', outline: 'none' as const, cursor: 'pointer' as const,
    });

    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}>Dues</h1>
                <button
                    onClick={() => setShowBulkReminder(true)}
                    style={{
                        display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px',
                        borderRadius: 6, border: '1px solid #3b82f6', background: 'rgba(59, 130, 246, 0.1)',
                        color: '#3b82f6', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer'
                    }}
                >
                    <MessageCircle size={16} /> Whatsapp Bulk Reminder
                </button>
            </div>

            {/* Scrolling Summary Filter Cards */}
            <div style={{
                display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 16, marginBottom: 16,
                scrollbarWidth: 'none'
            }}>
                {filterCards.map((card, idx) => {
                    const isActive = activeCardFilter === card.filterValue;
                    return (
                        <div key={idx}
                            onClick={() => handleCardFilter(card.filterValue)}
                            style={{
                                cursor: 'pointer', minWidth: 160, padding: '14px 16px', borderRadius: 10,
                                background: 'var(--bg-secondary, #1e293b)',
                                border: isActive ? '2px solid #3b82f6' : '1px solid var(--border-primary, #334155)',
                                transition: 'all 0.2s', flexShrink: 0,
                            }}>
                            <div style={{ color: isActive ? '#3b82f6' : (card.highlightColor || '#ef4444'), fontSize: '1.15rem', fontWeight: 700, marginBottom: 4, whiteSpace: 'nowrap' }}>
                                ₹{Number(card.value).toLocaleString('en-IN')}
                            </div>
                            <div style={{ color: isActive ? '#f8fafc' : '#94a3b8', fontSize: '0.78rem', lineHeight: 1.3 }}>
                                {card.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters Bar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap', alignItems: 'center' }}>
                <input
                    type="text"
                    placeholder="Search tenants with dues..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    style={{
                        flex: 1, minWidth: 240, padding: '8px 14px', borderRadius: 8,
                        background: 'var(--bg-secondary, #1e293b)', border: '1px solid var(--border-primary, #334155)',
                        color: 'var(--text-primary, #e2e8f0)', outline: 'none', fontSize: '0.875rem'
                    }}
                />
                <select
                    value={dateRangeFilter}
                    onChange={e => { setDateRangeFilter(e.target.value); setActiveCardFilter(''); }}
                    style={selectStyle(!!dateRangeFilter)}
                >
                    <option value="">Date Range</option>
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                </select>
                <select
                    value={dueTypeFilter}
                    onChange={e => handleDueTypeDropdown(e.target.value)}
                    style={selectStyle(!!dueTypeFilter)}
                >
                    <option value="">Due Type</option>
                    <option value="rent">Rent</option>
                    <option value="electricity">Electricity</option>
                    <option value="mess">Mess/Food</option>
                    <option value="deposit">Security Deposit</option>
                    <option value="late">Late Fine</option>
                </select>
                <select
                    value={defaulterFilter}
                    onChange={e => { setDefaulterFilter(e.target.value); setActiveCardFilter(''); }}
                    style={selectStyle(!!defaulterFilter)}
                >
                    <option value="">Defaulter</option>
                    <option value="rent">Rent Defaulters</option>
                    <option value="other">Other Bills</option>
                </select>
                <select
                    value={tenantTypeFilter}
                    onChange={e => { setTenantTypeFilter(e.target.value); setActiveCardFilter(''); }}
                    style={selectStyle(!!tenantTypeFilter)}
                >
                    <option value="">Tenant Type</option>
                    <option value="active">Active Tenants</option>
                    <option value="booking_pending">Bookings</option>
                </select>
            </div>

            {/* Results counter */}
            <div style={{ marginBottom: 8, fontSize: '0.9rem' }}>
                <span style={{ color: '#3b82f6', fontWeight: 600 }}>₹{filteredTotal.toLocaleString('en-IN')}</span>
                <span style={{ color: '#3b82f6', marginLeft: 6 }}>/ {filteredDues.length} Results Found</span>
            </div>

            {/* Data Table */}
            {loading ? (
                <div style={{ padding: 40, textAlign: 'center' }}>Loading...</div>
            ) : filteredDues.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60, background: 'var(--bg-card)', borderRadius: 12, border: '1px solid var(--border-primary)' }}>
                    <IndianRupee size={48} style={{ color: 'var(--text-muted)', margin: '0 auto 16px' }} />
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 8px' }}>No pending dues found</h3>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>All tenants are caught up.</p>
                </div>
            ) : (
                <div style={{ background: 'var(--bg-secondary, #1e293b)', borderRadius: 12, overflow: 'hidden', border: '1px solid var(--border-primary, #334155)' }}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                    <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>TENANT</th>
                                    <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>ROOM</th>
                                    <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>AMOUNT</th>
                                    <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>OLDEST DUE DATE</th>
                                    <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>LATEST DUE DATE</th>
                                    <th style={{ padding: '14px 20px', color: '#94a3b8', fontSize: '0.72rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', textAlign: 'right' }}>ACTION</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredDues.map((d: GroupedDue) => (
                                    <tr key={d.id}
                                        style={{ borderBottom: '1px solid var(--border-primary, #334155)', cursor: 'pointer' }}
                                        onClick={() => navigate(`/tenants/${d.tenant}?tab=passbook&view=dues`)}
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
                                                    {d.tenant_name.charAt(0).toUpperCase()}
                                                </div>
                                                <span style={{ color: '#3b82f6', fontWeight: 500 }}>
                                                    {d.tenant_name}
                                                </span>
                                            </div>
                                        </td>
                                        <td style={{ padding: '14px 20px' }}>
                                            <span style={{ padding: '3px 10px', background: 'rgba(217, 70, 239, 0.1)', color: '#d946ef', borderRadius: 4, fontSize: '0.82rem' }}>
                                                {d.room_number || 'Room'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '14px 20px', fontWeight: 700, color: d.balance > 0 ? '#ef4444' : '#22c55e', fontSize: '0.9rem' }}>
                                            ₹{d.balance.toLocaleString('en-IN')}
                                        </td>
                                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                                            {new Date(d.oldest_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '14px 20px', color: 'var(--text-secondary, #94a3b8)', fontSize: '0.85rem' }}>
                                            {new Date(d.latest_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                        </td>
                                        <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                                            <div style={{ display: 'flex', gap: 16, justifyContent: 'flex-end', fontSize: '0.8rem' }}>
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); setShowRemindModal(d); }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                                >
                                                    <Bell size={14} /> Remind
                                                </button>
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowRecordPayment(d);
                                                        setPaymentForm(f => ({ ...f, amount: d.balance.toString() }));
                                                    }}
                                                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#3b82f6', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                                                >
                                                    <FileText size={14} /> Record Payment
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* ===== REMIND MODAL (DARK THEME) ===== */}
            {showRemindModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: 'var(--bg-card, #1e293b)', borderRadius: 12, width: 380, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)', border: '1px solid var(--border-primary, #334155)' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>Receive Payment</h3>
                            <button onClick={() => setShowRemindModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: 4, color: '#ef4444' }}>₹{showRemindModal.balance.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted, #94a3b8)', marginBottom: 24 }}>Amount due for {showRemindModal.tenant_name}</div>

                            {/* QR Code */}
                            <div style={{ width: 180, height: 180, background: '#fff', border: '1px solid var(--border-primary, #334155)', borderRadius: 12, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=demo@upi&pn=PG_Manager&am=${showRemindModal.balance}`} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <button onClick={copyPaymentLink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(59,130,246,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Copy size={18} /></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>Copy Link</span>
                                </button>
                                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(34,197,94,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}><MessageCircle size={18} /></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>Whatsapp</span>
                                </button>
                                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(100,116,139,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8' }}><Share2 size={18} /></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RECORD PAYMENT DRAWER (DARK THEME + RENTOK FEATURES) ===== */}
            {showRecordPayment && (
                <div className="drawer-overlay" style={{ zIndex: 1000 }} onClick={() => setShowRecordPayment(null)}>
                    <div className="drawer-container" style={{ width: 440, padding: 0, display: 'flex', flexDirection: 'column', height: '100vh' }} onClick={e => e.stopPropagation()}>

                        {/* Header */}
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)', display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button onClick={() => setShowRecordPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)', display: 'flex' }}>
                                <ArrowLeft size={20} />
                            </button>
                            <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>Record Payment</h3>
                        </div>

                        {/* Scrollable Content */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '0' }}>

                            {/* Due Summary Header */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                {showRecordPayment.original_dues.length > 0 && (
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>
                                            {showRecordPayment.original_dues[0].type}
                                        </span>
                                        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#ef4444' }}>
                                            ₹{(Number(showRecordPayment.original_dues[0].amount) + Number(showRecordPayment.original_dues[0].late_fine || 0) - Number(showRecordPayment.original_dues[0].paid_amount)).toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                )}
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'var(--bg-secondary, #0f172a)', borderRadius: 8 }}>
                                    <span style={{ fontSize: '0.9rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>Net Receivable</span>
                                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#ef4444' }}>₹{showRecordPayment.balance.toLocaleString('en-IN')}</span>
                                </div>
                            </div>

                            {/* I'm Receiving Input */}
                            <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', marginBottom: 10 }}>I'm Receiving</label>
                                <div style={{
                                    display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', borderRadius: 10,
                                    border: '2px solid #3b82f6', background: 'var(--bg-secondary, #0f172a)'
                                }}>
                                    <span style={{ color: '#94a3b8', fontSize: '1.3rem', fontWeight: 600 }}>₹</span>
                                    <input
                                        type="number"
                                        style={{
                                            border: 'none', background: 'transparent', fontSize: '1.5rem', fontWeight: 700,
                                            color: '#e2e8f0', width: '100%', outline: 'none'
                                        }}
                                        value={paymentForm.amount}
                                        onChange={e => {
                                            setPaymentForm(f => ({ ...f, amount: e.target.value }));
                                            setBreakupSaved(false);
                                        }}
                                    />
                                </div>

                                {/* View Breakup Toggle */}
                                <button
                                    onClick={() => {
                                        if (!showBreakup) {
                                            initBreakupAllocations(showRecordPayment.original_dues);
                                        }
                                        setShowBreakup(!showBreakup);
                                        setBreakupSaved(false);
                                    }}
                                    style={{
                                        background: 'none', border: 'none', cursor: 'pointer', color: '#3b82f6',
                                        fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4,
                                        marginTop: 12, padding: 0
                                    }}
                                >
                                    {showBreakup ? 'Hide Breakup' : 'View Breakup'}
                                    {showBreakup ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </button>

                                {/* Expandable Breakup Allocation Table */}
                                {showBreakup && (
                                    <div style={{ marginTop: 12, border: '1px solid var(--border-primary, #334155)', borderRadius: 8, overflow: 'hidden' }}>
                                        {/* Table Header */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 0, padding: '10px 12px', background: 'var(--bg-secondary, #0f172a)', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase' }}>Dues</span>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Due Amt</span>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', textAlign: 'right' }}>Receiving</span>
                                        </div>

                                        {/* Rows */}
                                        {showRecordPayment.original_dues.map((due) => {
                                            const bal = Number(due.amount) + Number(due.late_fine || 0) - Number(due.paid_amount);
                                            return (
                                                <div key={due.id} style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 0, padding: '10px 12px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                                    <div>
                                                        <div style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text-primary, #e2e8f0)' }}>{due.type}</div>
                                                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>📅 {new Date(due.due_date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}</div>
                                                    </div>
                                                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-secondary, #94a3b8)', textAlign: 'right', alignSelf: 'center' }}>₹{bal.toLocaleString('en-IN')}</div>
                                                    <div style={{ textAlign: 'right', alignSelf: 'center' }}>
                                                        <input
                                                            type="number"
                                                            value={breakupAllocations[due.id] || ''}
                                                            onChange={e => setBreakupAllocations(a => ({ ...a, [due.id]: e.target.value }))}
                                                            style={{
                                                                width: 75, padding: '4px 6px', borderRadius: 4, border: '1px solid var(--border-primary, #334155)',
                                                                background: 'var(--bg-secondary, #0f172a)', color: '#3b82f6', fontSize: '0.82rem',
                                                                fontWeight: 600, textAlign: 'right', outline: 'none'
                                                            }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}

                                        {/* Total Row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px 90px', gap: 0, padding: '10px 12px', background: 'var(--bg-secondary, #0f172a)', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>Total {showRecordPayment.original_dues.length} Invoice{showRecordPayment.original_dues.length > 1 ? 's' : ''}</span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary, #e2e8f0)', textAlign: 'right' }}>
                                                ₹{showRecordPayment.balance.toLocaleString('en-IN')}
                                            </span>
                                            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: '#3b82f6', textAlign: 'right' }}>
                                                ₹{breakupTotal.toLocaleString('en-IN')}
                                            </span>
                                        </div>

                                        {/* Validation Status */}
                                        <div style={{
                                            padding: '8px 12px', fontSize: '0.8rem', fontWeight: 500,
                                            background: amountsMatch ? 'rgba(34,197,94,0.1)' : 'rgba(239,68,68,0.1)',
                                            color: amountsMatch ? '#22c55e' : '#ef4444',
                                            display: 'flex', alignItems: 'center', gap: 6
                                        }}>
                                            {amountsMatch ? <Check size={14} /> : <X size={14} />}
                                            {amountsMatch ? 'Amounts Match' : 'Amounts DO NOT Match'}
                                        </div>

                                        {/* Breakup Actions */}
                                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, padding: '10px 12px' }}>
                                            <button
                                                onClick={() => setShowBreakup(false)}
                                                style={{
                                                    padding: '6px 20px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                                                    background: 'transparent', color: 'var(--text-secondary, #94a3b8)', border: '1px solid var(--border-primary, #334155)'
                                                }}
                                            >Cancel</button>
                                            <button
                                                onClick={() => { setBreakupSaved(true); setShowBreakup(false); }}
                                                disabled={!amountsMatch}
                                                style={{
                                                    padding: '6px 20px', borderRadius: 6, fontSize: '0.8rem', fontWeight: 500, cursor: amountsMatch ? 'pointer' : 'not-allowed',
                                                    background: amountsMatch ? '#3b82f6' : 'rgba(59,130,246,0.3)', color: '#fff', border: 'none',
                                                    opacity: amountsMatch ? 1 : 0.5
                                                }}
                                            >Save</button>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Collection Date */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)' }}>Collection Date</label>
                                    <input
                                        type="date"
                                        value={paymentForm.payment_date}
                                        onChange={e => setPaymentForm(f => ({ ...f, payment_date: e.target.value }))}
                                        style={{
                                            background: 'transparent', border: 'none', color: 'var(--text-primary, #e2e8f0)',
                                            fontSize: '0.85rem', fontWeight: 500, outline: 'none', cursor: 'pointer'
                                        }}
                                    />
                                </div>
                            </div>

                            {/* Collection Mode - Icon Grid */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', marginBottom: 12 }}>Collection Mode</label>
                                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                                    {[
                                        { key: 'Cash', icon: '💵', label: 'Cash' },
                                        { key: 'GPay', icon: '🟢', label: 'GPay' },
                                        { key: 'PhonePe', icon: '🟣', label: 'PhonePe' },
                                        { key: 'Paytm', icon: '🔵', label: 'Paytm' },
                                        { key: 'Bank Transfer', icon: '🏦', label: 'Bank' },
                                        { key: 'Other', icon: '⋯', label: 'Other' },
                                    ].map(m => {
                                        const isActive = paymentForm.mode === m.key;
                                        return (
                                            <button
                                                key={m.key}
                                                onClick={() => setPaymentForm(f => ({ ...f, mode: m.key }))}
                                                style={{
                                                    width: 64, padding: '10px 4px', borderRadius: 10, cursor: 'pointer',
                                                    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
                                                    border: isActive ? '2px solid #3b82f6' : '1px solid var(--border-primary, #334155)',
                                                    background: isActive ? 'rgba(59,130,246,0.1)' : 'var(--bg-secondary, #0f172a)',
                                                    transition: 'all 0.2s'
                                                }}
                                            >
                                                <span style={{ fontSize: '1.3rem' }}>{m.icon}</span>
                                                <span style={{ fontSize: '0.65rem', fontWeight: 500, color: isActive ? '#3b82f6' : '#94a3b8' }}>{m.label}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Upload Attachments */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', marginBottom: 10 }}>Upload Attachments</label>
                                <div style={{
                                    border: '2px dashed var(--border-primary, #334155)', borderRadius: 10,
                                    padding: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer', transition: 'border-color 0.2s', gap: 6
                                }}
                                    onMouseEnter={e => e.currentTarget.style.borderColor = '#3b82f6'}
                                    onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-primary, #334155)'}
                                >
                                    <Upload size={24} style={{ color: '#3b82f6' }} />
                                    <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Click to upload receipt</span>
                                </div>
                            </div>

                            {/* Transaction ID */}
                            <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', marginBottom: 8 }}>
                                    Transaction ID / Details {paymentForm.mode !== 'Cash' && <span style={{ color: '#ef4444' }}>*</span>}
                                </label>
                                <input
                                    type="text" placeholder="e.g. UTR or Check Number"
                                    value={paymentForm.reference_number}
                                    onChange={e => setPaymentForm(f => ({ ...f, reference_number: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem',
                                        background: 'var(--bg-secondary, #0f172a)', border: '1px solid var(--border-primary, #334155)',
                                        color: 'var(--text-primary, #e2e8f0)', outline: 'none'
                                    }}
                                />
                            </div>

                            {/* Description */}
                            <div style={{ padding: '16px 24px' }}>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary, #94a3b8)', marginBottom: 8 }}>Description</label>
                                <textarea
                                    rows={3} placeholder="Enter description here..."
                                    value={paymentForm.notes}
                                    onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                                    style={{
                                        width: '100%', padding: '10px 14px', borderRadius: 8, fontSize: '0.85rem',
                                        background: 'var(--bg-secondary, #0f172a)', border: '1px solid var(--border-primary, #334155)',
                                        color: 'var(--text-primary, #e2e8f0)', outline: 'none', resize: 'vertical', fontFamily: 'inherit'
                                    }}
                                />
                            </div>
                        </div>

                        {/* Footer */}
                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary, #334155)' }}>
                            <button
                                onClick={handleRecordPayment}
                                style={{
                                    width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 600,
                                    background: '#3b82f6', color: '#fff', border: 'none', borderRadius: 10,
                                    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#2563eb'}
                                onMouseLeave={e => e.currentTarget.style.background = '#3b82f6'}
                            >
                                <Check size={18} /> Record Payment
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== BULK REMINDER DRAWER (DARK THEME) ===== */}
            {showBulkReminder && (
                <div className="drawer-overlay" style={{ zIndex: 1000 }} onClick={() => setShowBulkReminder(false)}>
                    <div className="drawer-container" style={{ width: 420, padding: 0, display: 'flex', flexDirection: 'column', height: '100vh' }} onClick={e => e.stopPropagation()}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary, #e2e8f0)' }}>Send Bulk Reminder</h3>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted, #94a3b8)', marginTop: 4 }}>{dues.length} tenants with pending dues</div>
                            </div>
                            <button onClick={() => setShowBulkReminder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #94a3b8)' }}>
                                <X size={20} />
                            </button>
                        </div>

                        <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', color: 'var(--text-primary, #e2e8f0)' }}>
                                <input type="checkbox" defaultChecked />
                                <span>Select All Tenants</span>
                            </label>
                            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', marginTop: 12, color: 'var(--text-primary, #e2e8f0)' }}>
                                <input type="checkbox" defaultChecked />
                                <span>Send Whatsapp reminder to Parents too</span>
                            </label>
                        </div>

                        <div style={{ flex: 1, overflowY: 'auto' }}>
                            {dues.map(d => (
                                <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 24px', borderBottom: '1px solid var(--border-primary, #334155)' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                        <input type="checkbox" defaultChecked />
                                        <div>
                                            <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary, #e2e8f0)' }}>{d.tenant_name}</div>
                                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #94a3b8)' }}>Room: {d.room_number || 'N/A'}</div>
                                        </div>
                                    </div>
                                    <div style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>
                                        ₹{d.balance.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary, #334155)' }}>
                            <button
                                onClick={() => { alert("Bulk reminders sent via WhatsApp!"); setShowBulkReminder(false); }}
                                style={{
                                    width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: 600,
                                    background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10,
                                    cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8,
                                    transition: 'background 0.2s'
                                }}
                                onMouseEnter={e => e.currentTarget.style.background = '#16a34a'}
                                onMouseLeave={e => e.currentTarget.style.background = '#22c55e'}
                            >
                                <MessageCircle size={18} /> Send Reminder to {dues.length} Tenants
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
