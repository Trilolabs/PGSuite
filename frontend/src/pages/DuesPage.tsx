import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { IndianRupee, Bell, Share2, Copy, MessageCircle, X, Check, FileText } from 'lucide-react';
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
        mode: 'GPay',
        reference_number: '',
        notes: ''
    });

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
                mode: 'GPay', reference_number: '', notes: ''
            });
            load();
            alert("Payment recorded successfully!");
        } catch (error) {
            console.error(error);
            alert("Failed to record payment");
        }
    };

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

    return (
        <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh', color: 'var(--text-primary)', position: 'relative' }}>
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
                display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 12, marginBottom: 16,
                scrollbarWidth: 'none', msOverflowStyle: 'none'
            }}>
                {filterCards.map((card, idx) => {
                    const isActive = activeCardFilter === card.filterValue;
                    return (
                        <div key={idx}
                            onClick={() => handleCardFilter(card.filterValue)}
                            style={{
                                flexShrink: 0, minWidth: 130, padding: '12px 14px', borderRadius: 8,
                                border: isActive ? '2px solid #3b82f6' : '1px solid var(--border-primary)',
                                background: isActive ? 'rgba(59, 130, 246, 0.05)' : 'var(--bg-card)',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                boxShadow: isActive ? '0 4px 6px rgba(59, 130, 246, 0.1)' : '0 1px 3px rgba(0,0,0,0.05)'
                            }}>
                            <div style={{ color: isActive ? '#3b82f6' : (card.highlightColor || '#ef4444'), fontSize: '1.1rem', fontWeight: 700, marginBottom: 6 }}>
                                ₹{Number(card.value).toLocaleString('en-IN')}
                            </div>
                            <div style={{ fontSize: '0.75rem', color: isActive ? '#1e3a8a' : 'var(--text-secondary)', fontWeight: 500, lineHeight: 1.3 }}>
                                {card.label}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Filters Bar */}
            <div style={{
                display: 'flex', gap: 10, marginBottom: 16, padding: '10px 14px', borderRadius: 8,
                background: 'var(--bg-card)', border: '1px solid var(--border-primary)', flexWrap: 'wrap'
            }}>
                <input
                    className="form-input"
                    placeholder="Search tenants with dues..."
                    style={{ flex: 1, minWidth: 200 }}
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                />
                <select
                    className="form-select" style={{ width: 150 }}
                    value={dateRangeFilter}
                    onChange={e => { setDateRangeFilter(e.target.value); setActiveCardFilter(''); }}
                >
                    <option value="">Date Range</option>
                    <option value="today">Today</option>
                    <option value="this_month">This Month</option>
                    <option value="last_month">Last Month</option>
                    <option value="last_3_months">Last 3 Months</option>
                    <option value="last_6_months">Last 6 Months</option>
                </select>
                <select
                    className="form-select"
                    style={{ width: 140 }}
                    value={dueTypeFilter}
                    onChange={e => handleDueTypeDropdown(e.target.value)}
                >
                    <option value="">Due Type</option>
                    <option value="rent">Rent</option>
                    <option value="electricity">Electricity</option>
                    <option value="mess">Mess/Food</option>
                    <option value="deposit">Security Deposit</option>
                    <option value="late">Late Fine</option>
                </select>
                <select
                    className="form-select" style={{ width: 140 }}
                    value={defaulterFilter}
                    onChange={e => { setDefaulterFilter(e.target.value); setActiveCardFilter(''); }}
                >
                    <option value="">Defaulter</option>
                    <option value="rent">Rent Defaulters</option>
                    <option value="other">Other Bills</option>
                </select>
                <select
                    className="form-select"
                    style={{ width: 150 }}
                    value={tenantTypeFilter}
                    onChange={e => { setTenantTypeFilter(e.target.value); setActiveCardFilter(''); }}
                >
                    <option value="">Tenant Type</option>
                    <option value="active">Active Tenants</option>
                    <option value="booking_pending">Bookings</option>
                </select>
            </div>

            {/* Results counter — shows filtered total from visible rows */}
            <div style={{ fontSize: '0.9rem', fontWeight: 600, color: '#1e40af', marginBottom: 12 }}>
                ₹{filteredTotal.toLocaleString('en-IN')} / {filteredDues.length} Results Found
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
                <div style={{ background: 'var(--bg-card)', borderRadius: 8, border: '1px solid var(--border-primary)', overflow: 'hidden' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.85rem' }}>
                        <thead style={{ background: '#f1f5f9', color: '#64748b' }}>
                            <tr>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>TENANT</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>ROOM</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>AMOUNT</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>OLDEST DUE DATE</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600 }}>LATEST DUE DATE</th>
                                <th style={{ padding: '12px 16px', fontWeight: 600, textAlign: 'right' }}>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredDues.map((d: GroupedDue) => (
                                <tr key={d.id}
                                    style={{ borderBottom: '1px solid var(--border-primary)', cursor: 'pointer' }}
                                    onClick={() => navigate(`/tenants/${d.tenant}?tab=passbook&view=dues`)}
                                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary)')}
                                    onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                                >
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                            <div style={{
                                                width: 28, height: 28, borderRadius: '50%',
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
                                    <td style={{ padding: '12px 16px', color: '#d946ef' }}>
                                        <span style={{ background: 'rgba(217, 70, 239, 0.1)', padding: '4px 8px', borderRadius: 4 }}>
                                            {d.room_number || 'Room'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', fontWeight: 700, color: d.balance > 0 ? '#ef4444' : '#22c55e', fontSize: '0.9rem' }}>
                                        ₹{d.balance.toLocaleString('en-IN')}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                        {new Date(d.oldest_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: 'var(--text-secondary)' }}>
                                        {new Date(d.latest_due_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
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
            )}

            {/* ===== REMIND MODAL ===== */}
            {showRemindModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                }}>
                    <div style={{ background: '#fff', borderRadius: 12, width: 380, overflow: 'hidden', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)' }}>
                        <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Receive Payment</h3>
                            <button onClick={() => setShowRemindModal(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                                <X size={20} />
                            </button>
                        </div>
                        <div style={{ padding: '32px 24px', textAlign: 'center' }}>
                            <div style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 4 }}>₹{showRemindModal.balance.toLocaleString('en-IN')}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: 24 }}>Amount due for {showRemindModal.tenant_name}</div>

                            {/* QR Code */}
                            <div style={{ width: 180, height: 180, background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12, margin: '0 auto 24px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 12 }}>
                                <img src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=demo@upi&pn=PG_Manager&am=${showRemindModal.balance}`} alt="QR Code" style={{ width: '100%', height: '100%' }} />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                                <button onClick={copyPaymentLink} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}><Copy size={18} /></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Copy Link</span>
                                </button>
                                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#22c55e' }}><MessageCircle size={18} /></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Whatsapp</span>
                                </button>
                                <button style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, padding: 12, background: 'none', border: 'none', cursor: 'pointer' }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}><Share2 size={18} /></div>
                                    <span style={{ fontSize: '0.75rem', fontWeight: 500 }}>Share</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== RECORD PAYMENT DRAWER ===== */}
            {showRecordPayment && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Record Payment</h3>
                        <button onClick={() => setShowRecordPayment(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ padding: 24, flex: 1, overflowY: 'auto' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
                            <div>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>Net Receivable</div>
                                <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#ef4444' }}>
                                    ₹{showRecordPayment.balance.toLocaleString('en-IN')}
                                </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: 4 }}>I'm Receiving</div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#f1f5f9', padding: '6px 12px', borderRadius: 8 }}>
                                    <span style={{ color: '#64748b', fontWeight: 600 }}>₹</span>
                                    <input
                                        type="number"
                                        style={{ border: 'none', background: 'transparent', fontSize: '1.2rem', fontWeight: 700, color: '#22c55e', width: '100px', textAlign: 'right', outline: 'none' }}
                                        value={paymentForm.amount}
                                        onChange={e => setPaymentForm(f => ({ ...f, amount: e.target.value }))}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Dues Breakup */}
                        <div style={{ border: '1px solid #e2e8f0', borderRadius: 8, padding: 16, marginBottom: 24 }}>
                            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3b82f6', marginBottom: 10 }}>View Breakup</div>
                            {showRecordPayment.original_dues.map((due, i) => (
                                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', padding: '4px 0', borderBottom: i < showRecordPayment.original_dues.length - 1 ? '1px solid #f1f5f9' : 'none' }}>
                                    <span style={{ color: '#64748b' }}>{due.type}</span>
                                    <span style={{ fontWeight: 600, color: '#ef4444' }}>₹{(Number(due.amount) + Number(due.late_fine || 0) - Number(due.paid_amount)).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: 8 }}>Collection Mode *</label>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                                {['Cash', 'GPay', 'PhonePe', 'Paytm', 'Bank Transfer', 'Other'].map(mode => (
                                    <button
                                        key={mode}
                                        onClick={() => setPaymentForm(f => ({ ...f, mode }))}
                                        style={{
                                            padding: '8px 16px', borderRadius: 20, fontSize: '0.8rem', fontWeight: 500, cursor: 'pointer',
                                            background: paymentForm.mode === mode ? 'rgba(59, 130, 246, 0.1)' : '#f8fafc',
                                            color: paymentForm.mode === mode ? '#3b82f6' : '#64748b',
                                            border: `1px solid ${paymentForm.mode === mode ? '#3b82f6' : '#e2e8f0'}`
                                        }}
                                    >
                                        {mode}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: 8 }}>Collection Date</label>
                            <input
                                type="date" className="form-input"
                                value={paymentForm.payment_date}
                                onChange={e => setPaymentForm(f => ({ ...f, payment_date: e.target.value }))}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: 8 }}>Transaction ID / Details {paymentForm.mode !== 'Cash' && '*'}</label>
                            <input
                                type="text" className="form-input" placeholder="e.g. UTR or Check Number"
                                value={paymentForm.reference_number}
                                onChange={e => setPaymentForm(f => ({ ...f, reference_number: e.target.value }))}
                            />
                        </div>

                        <div style={{ marginBottom: 24 }}>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 500, color: '#475569', marginBottom: 8 }}>Description (Internal)</label>
                            <textarea
                                className="form-input" rows={3} placeholder="Add notes..."
                                value={paymentForm.notes}
                                onChange={e => setPaymentForm(f => ({ ...f, notes: e.target.value }))}
                            ></textarea>
                        </div>
                    </div>

                    <div style={{ padding: 24, borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <button
                            className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                            onClick={handleRecordPayment}
                        >
                            <Check size={18} /> Confirm Payment
                        </button>
                    </div>
                </div>
            )}

            {/* ===== BULK REMINDER DRAWER ===== */}
            {showBulkReminder && (
                <div style={{
                    position: 'fixed', top: 0, right: 0, bottom: 0, width: 400, background: '#fff',
                    boxShadow: '-10px 0 30px rgba(0,0,0,0.1)', zIndex: 1000, display: 'flex', flexDirection: 'column',
                    animation: 'slideInRight 0.3s ease-out'
                }}>
                    <div style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
                        <div>
                            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 600 }}>Send Bulk Reminder</h3>
                            <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: 4 }}>{dues.length} tenants with pending dues</div>
                        </div>
                        <button onClick={() => setShowBulkReminder(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}>
                            <X size={24} />
                        </button>
                    </div>

                    <div style={{ padding: '16px 24px', borderBottom: '1px solid #e2e8f0' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer' }}>
                            <input type="checkbox" defaultChecked />
                            <span>Select All Tenants</span>
                        </label>
                        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', cursor: 'pointer', marginTop: 12 }}>
                            <input type="checkbox" defaultChecked />
                            <span>Send Whatsapp reminder to Parents too</span>
                        </label>
                    </div>

                    <div style={{ flex: 1, overflowY: 'auto' }}>
                        {dues.map(d => (
                            <div key={d.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid #f1f5f9' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <input type="checkbox" defaultChecked />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{d.tenant_name}</div>
                                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Room: {d.room_number || 'N/A'}</div>
                                    </div>
                                </div>
                                <div style={{ textAlign: 'right', fontWeight: 600, color: '#ef4444' }}>
                                    ₹{d.balance.toLocaleString('en-IN')}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ padding: 24, borderTop: '1px solid #e2e8f0', background: '#f8fafc' }}>
                        <button
                            className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem', fontWeight: 600, display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8 }}
                            onClick={() => { alert("Bulk reminders sent via WhatsApp!"); setShowBulkReminder(false); }}
                        >
                            <MessageCircle size={18} /> Send Reminder to {dues.length} Tenants
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
