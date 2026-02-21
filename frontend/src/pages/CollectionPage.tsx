import { useEffect, useState } from 'react';
import { Share2 } from 'lucide-react';
import { paymentApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import { Link } from 'react-router-dom';

interface Payment {
    id: string;
    tenant_name: string;
    tenant_id?: string;
    amount: string;
    payment_date: string;
    mode: string;
    reference_number: string;
    notes: string;
    tenant?: {
        id: string;
        name: string;
        room_number?: string;
    };
}

interface SummaryData {
    total: number;
    rent: number;
    electricity: number;
    food: number;
    deposit: number;
    late_fine: number;
    advance: number;
}

export default function CollectionPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [summary, setSummary] = useState<SummaryData | null>(null);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();
    const [activeFilter, setActiveFilter] = useState('');

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }

        const params: any = {};
        if (activeFilter) params.due_type = activeFilter;

        Promise.all([
            paymentApi.list(selectedPropertyId, params),
            paymentApi.summary(selectedPropertyId)
        ]).then(([paymentsRes, summaryRes]) => {
            setPayments(paymentsRes.data.results || paymentsRes.data || []);
            setSummary(summaryRes.data);
        }).catch(() => {
        }).finally(() => {
            setLoading(false);
        });
    }, [selectedPropertyId, activeFilter]);

    const formatCurrency = (amount: number | string) => {
        return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(amount));
    };

    if (loading) return <div className="p-8 text-center" style={{ color: '#ecf0f1' }}>Loading collections...</div>;

    return (
        <div className="page-container" style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', background: '#0f172a', minHeight: '100vh', color: '#e2e8f0' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#fff' }}>Collection</h1>
            </div>

            {/* Top Summary Cards */}
            {summary && (
                <div style={{ display: 'flex', gap: 16, overflowX: 'auto', paddingBottom: 16, marginBottom: 16, scrollbarWidth: 'none' }}>
                    {[
                        { label: 'Total Collection', value: summary.total, filterValue: '', color: '#10b981', sub: 'This Month' },
                        { label: 'Rent Collection', value: summary.rent, filterValue: 'rent', color: '#10b981', sub: 'This Month' },
                        { label: 'Electricity Collection', value: summary.electricity, filterValue: 'electricity', color: '#3b82f6', sub: 'This Month' },
                        ...(summary.food > 0 ? [{ label: 'Food Collection', value: summary.food, filterValue: 'food', color: '#f59e0b', sub: 'This Month' }] : []),
                        { label: 'Deposit Collection', value: summary.deposit, filterValue: 'deposit', color: '#ef4444', sub: 'This Month' },
                        { label: 'Late Fine Collection', value: summary.late_fine, filterValue: 'late', color: '#ef4444', sub: 'This Month' },
                        { label: 'Advance', value: summary.advance, filterValue: 'advance', color: '#10b981', sub: 'Total Advance Credits' },
                    ].map((card, idx) => {
                        const isActive = activeFilter === card.filterValue;
                        return (
                            <div key={idx}
                                onClick={() => setActiveFilter(card.filterValue)}
                                style={{
                                    cursor: 'pointer', minWidth: 200, padding: 16, borderRadius: 12,
                                    background: isActive ? 'linear-gradient(145deg, #1e293b, #1d4ed833)' : 'linear-gradient(145deg, #1e293b, #0f172a)',
                                    border: isActive ? '2px solid #3b82f6' : '1px solid #334155',
                                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                                    transition: 'all 0.2s',
                                    position: 'relative', overflow: 'hidden'
                                }}>
                                {card.filterValue === 'advance' && <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 4, background: card.color }}></div>}
                                <div style={{ color: card.color, fontSize: '1.25rem', fontWeight: 'bold', marginBottom: 8 }}>{formatCurrency(card.value)}</div>
                                <div style={{ color: isActive ? '#f8fafc' : '#94a3b8', fontSize: '0.875rem' }}>{card.label}</div>
                                <div style={{ color: '#64748b', fontSize: '0.75rem', marginTop: 4 }}>{card.sub}</div>
                            </div>
                        )
                    })}
                </div>
            )}

            {/* Filter Pills Placeholder */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, overflowX: 'auto', paddingBottom: 8 }}>
                {['Date Range', 'Payment Mode', 'Received By', 'Collection Types'].map(f => (
                    <button key={f} style={{ padding: '6px 16px', borderRadius: 20, background: '#1e293b', border: '1px solid #334155', color: '#cbd5e1', fontSize: '0.875rem', whiteSpace: 'nowrap' }}>
                        {f} ▾
                    </button>
                ))}
            </div>

            {/* Data Table */}
            <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden', border: '1px solid #334155' }}>
                <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', background: '#0f172a' }}>
                    <span style={{ fontWeight: 600, color: '#f8fafc' }}>{formatCurrency(summary?.total || 0)}</span>
                    <span style={{ color: '#94a3b8', marginLeft: 8, fontSize: '0.875rem' }}>/ {payments.length} Results Found</span>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                            <tr style={{ background: '#1e293b', borderBottom: '1px solid #334155' }}>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Tenant</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Room</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Amount</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Received On</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Payment Mode</th>
                                <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(payment => (
                                <tr key={payment.id} style={{ borderBottom: '1px solid #334155', transition: 'background 0.2s' }} className="hover:bg-slate-800">
                                    <td style={{ padding: '16px 20px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                            <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3b82f6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.875rem' }}>
                                                {(payment.tenant?.name || payment.tenant_name || 'U')[0].toUpperCase()}
                                            </div>
                                            {payment.tenant?.id ? (
                                                <Link to={`/tenants/${payment.tenant.id}?tab=passbook`} style={{ color: '#e2e8f0', textDecoration: 'none', fontWeight: 500 }} className="hover:text-blue-400">
                                                    {payment.tenant?.name || payment.tenant_name}
                                                </Link>
                                            ) : (
                                                <span style={{ color: '#e2e8f0', fontWeight: 500 }}>{payment.tenant?.name || payment.tenant_name}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ padding: '4px 12px', background: 'rgba(139, 92, 246, 0.1)', color: '#a78bfa', borderRadius: 4, fontSize: '0.875rem' }}>
                                            {payment.tenant?.room_number || 'N/A'}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#10b981', fontWeight: 600 }}>
                                        {formatCurrency(payment.amount)}
                                    </td>
                                    <td style={{ padding: '16px 20px', color: '#cbd5e1', fontSize: '0.875rem' }}>
                                        {new Date(payment.payment_date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td style={{ padding: '16px 20px' }}>
                                        <span style={{ padding: '4px 12px', background: 'rgba(59, 130, 246, 0.1)', color: '#60a5fa', borderRadius: 4, fontSize: '0.75rem', textTransform: 'capitalize' }}>
                                            {payment.mode.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                                        {payment.tenant?.id && (
                                            <Link
                                                to={`/tenants/${payment.tenant.id}?tab=passbook`}
                                                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: '#60a5fa', fontSize: '0.875rem', textDecoration: 'none', background: 'transparent', border: 'none', cursor: 'pointer' }}
                                                className="hover:text-blue-400 transition-colors"
                                            >
                                                <Share2 size={16} /> Share receipt
                                            </Link>
                                        )}
                                    </td>
                                </tr>
                            ))}
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
