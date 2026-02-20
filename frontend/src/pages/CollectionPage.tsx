import { useEffect, useState } from 'react';
import { Receipt, Plus } from 'lucide-react';
import { paymentApi, tenantApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Payment {
    id: string;
    tenant_name: string;
    amount: string;
    payment_date: string;
    mode: string;
    reference_number: string;
    notes: string;
}

const modeBadge = (m: string) => {
    const map: Record<string, string> = {
        cash: 'badge-success', upi: 'badge-info',
        bank_transfer: 'badge-info', cheque: 'badge-warning', online: 'badge-info',
    };
    return map[m] || 'badge-neutral';
};

export default function CollectionPage() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
    const [form, setForm] = useState({ tenant: '', amount: '', mode: 'cash', payment_date: new Date().toISOString().split('T')[0], reference_number: '', notes: '' });
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        paymentApi.list(selectedPropertyId)
            .then(res => setPayments(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
        tenantApi.list(selectedPropertyId, {}).then(res => {
            const t = res.data.results || res.data || [];
            setTenants(t.map((x: any) => ({ id: x.id, name: x.name })));
        }).catch(() => { });
    }, [selectedPropertyId]);

    const total = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

    const handleAdd = async () => {
        if (!selectedPropertyId) return;
        try {
            await paymentApi.create(selectedPropertyId, {
                ...form,
                amount: Number(form.amount),
            });
            setShowAdd(false);
            window.location.reload();
        } catch { }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Collection</h1>
                    <p className="subtitle">₹{total.toLocaleString('en-IN')} collected from {payments.length} payments</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
                    <Plus size={16} /> Record Payment
                </button>
            </div>

            {showAdd && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Record Payment</h3>
                    <div className="grid-4">
                        <div className="form-group">
                            <label className="form-label">Tenant *</label>
                            <select className="form-select" value={form.tenant} onChange={e => setForm(f => ({ ...f, tenant: e.target.value }))}>
                                <option value="">Select Tenant</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount (₹)</label>
                            <input className="form-input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" value={form.payment_date} onChange={e => setForm(f => ({ ...f, payment_date: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Mode</label>
                            <select className="form-select" value={form.mode} onChange={e => setForm(f => ({ ...f, mode: e.target.value }))}>
                                <option value="cash">Cash</option>
                                <option value="upi">UPI</option>
                                <option value="bank_transfer">Bank Transfer</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Reference Number</label>
                        <input className="form-input" style={{ maxWidth: 300 }} value={form.reference_number} onChange={e => setForm(f => ({ ...f, reference_number: e.target.value }))} />
                    </div>
                    <button className="btn btn-primary" onClick={handleAdd}>Save Payment</button>
                </div>
            )}

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : payments.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Receipt size={48} />
                        <h3>No Payments Yet</h3>
                        <p>Record your first payment collection</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Amount</th>
                                <th>Date</th>
                                <th>Mode</th>
                                <th>Reference</th>
                            </tr>
                        </thead>
                        <tbody>
                            {payments.map(p => (
                                <tr key={p.id}>
                                    <td>{p.tenant_name}</td>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-success)' }}>₹{Number(p.amount).toLocaleString('en-IN')}</td>
                                    <td>{new Date(p.payment_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</td>
                                    <td><span className={`badge ${modeBadge(p.mode)}`}>{p.mode?.replace('_', ' ')}</span></td>
                                    <td style={{ color: 'var(--text-muted)' }}>{p.reference_number || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
