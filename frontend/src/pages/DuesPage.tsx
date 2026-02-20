import { useEffect, useState } from 'react';
import { IndianRupee, RefreshCcw, Plus } from 'lucide-react';
import { duesApi, tenantApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Due {
    id: string;
    tenant_name: string;
    type: string;
    amount: string;
    paid_amount: string;
    late_fine: string;
    due_date: string;
    status: string;
    description: string;
}

interface Summary {
    total: number;
    paid: number;
    unpaid: number;
    partially_paid: number;
}

const statusBadge = (s: string) => {
    const map: Record<string, string> = {
        paid: 'badge-success', unpaid: 'badge-danger',
        partially_paid: 'badge-warning', waived: 'badge-neutral',
    };
    return map[s] || 'badge-neutral';
};

export default function DuesPage() {
    const [dues, setDues] = useState<Due[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState('');
    const [generating, setGenerating] = useState(false);
    const [showAddDue, setShowAddDue] = useState(false);
    const [tenants, setTenants] = useState<{ id: string; name: string }[]>([]);
    const [dueForm, setDueForm] = useState({ tenant: '', type: 'Rent', amount: '', due_date: new Date().toISOString().split('T')[0], description: '' });
    const { selectedPropertyId } = usePropertyStore();

    const load = () => {
        if (!selectedPropertyId) { setLoading(false); return; }
        setLoading(true);
        const params: any = {};
        if (statusFilter) params.status = statusFilter;
        Promise.all([
            duesApi.list(selectedPropertyId, params),
            duesApi.summary(selectedPropertyId),
        ]).then(([duesRes, sumRes]) => {
            setDues(duesRes.data.results || duesRes.data || []);
            setSummary(sumRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    };

    useEffect(() => { load(); }, [selectedPropertyId, statusFilter]);

    useEffect(() => {
        if (selectedPropertyId) {
            tenantApi.list(selectedPropertyId, {}).then(res => {
                const t = res.data.results || res.data || [];
                setTenants(t.map((x: any) => ({ id: x.id, name: x.name })));
            }).catch(() => { });
        }
    }, [selectedPropertyId]);

    const handleAddDue = async () => {
        if (!selectedPropertyId || !dueForm.tenant || !dueForm.amount) return;
        try {
            await duesApi.create(selectedPropertyId, {
                tenant: dueForm.tenant, type: dueForm.type,
                amount: Number(dueForm.amount), due_date: dueForm.due_date,
                description: dueForm.description,
            });
            setShowAddDue(false);
            setDueForm({ tenant: '', type: 'Rent', amount: '', due_date: new Date().toISOString().split('T')[0], description: '' });
            load();
        } catch { }
    };

    const handleGenerate = async () => {
        if (!selectedPropertyId) return;
        setGenerating(true);
        try {
            await duesApi.generate(selectedPropertyId);
            load();
        } catch { }
        setGenerating(false);
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Dues</h1>
                    <p className="subtitle">Monthly dues & billing</p>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={handleGenerate} disabled={generating}>
                        <RefreshCcw size={16} /> {generating ? 'Generating...' : 'Auto-Generate'}
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddDue(!showAddDue)}>
                        <Plus size={16} /> Add Due
                    </button>
                </div>
            </div>

            {/* Summary Cards */}
            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-primary)' } as any}>
                    <div className="label">Total Dues</div>
                    <div className="value money">{(summary?.total || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-success)' } as any}>
                    <div className="label">Paid</div>
                    <div className="value money">{(summary?.paid || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-danger)' } as any}>
                    <div className="label">Unpaid</div>
                    <div className="value money">{(summary?.unpaid || 0).toLocaleString('en-IN')}</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-warning)' } as any}>
                    <div className="label">Partial</div>
                    <div className="value">{summary?.partially_paid || 0}</div>
                </div>
            </div>

            {/* Add Due Form */}
            {showAddDue && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>Add Manual Due</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Tenant *</label>
                            <select className="form-select" value={dueForm.tenant} onChange={e => setDueForm(f => ({ ...f, tenant: e.target.value }))}>
                                <option value="">Select Tenant</option>
                                {tenants.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={dueForm.type} onChange={e => setDueForm(f => ({ ...f, type: e.target.value }))}>
                                <option value="Rent">Rent</option>
                                <option value="Security Deposit">Security Deposit</option>
                                <option value="Electricity">Electricity</option>
                                <option value="Maintenance">Maintenance</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount (₹) *</label>
                            <input className="form-input" type="number" value={dueForm.amount} onChange={e => setDueForm(f => ({ ...f, amount: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Due Date</label>
                            <input className="form-input" type="date" value={dueForm.due_date} onChange={e => setDueForm(f => ({ ...f, due_date: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input className="form-input" value={dueForm.description} onChange={e => setDueForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAddDue}>Save Due</button>
                </div>
            )}

            {/* Filters */}
            <div className="card" style={{ padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
                <select className="form-select" style={{ width: 180 }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                    <option value="">All Statuses</option>
                    <option value="unpaid">Unpaid</option>
                    <option value="partially_paid">Partially Paid</option>
                    <option value="paid">Paid</option>
                    <option value="waived">Waived</option>
                </select>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : dues.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <IndianRupee size={48} />
                        <h3>No Dues</h3>
                        <p>Use "Auto-Generate" to create monthly dues for all tenants</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Paid</th>
                                <th>Balance</th>
                                <th>Due Date</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dues.map(d => {
                                const balance = Number(d.amount) + Number(d.late_fine || 0) - Number(d.paid_amount || 0);
                                return (
                                    <tr key={d.id}>
                                        <td>{d.tenant_name}</td>
                                        <td>{d.type}</td>
                                        <td>₹{Number(d.amount).toLocaleString('en-IN')}</td>
                                        <td style={{ color: 'var(--accent-success)' }}>₹{Number(d.paid_amount || 0).toLocaleString('en-IN')}</td>
                                        <td style={{ color: balance > 0 ? 'var(--accent-danger)' : 'var(--accent-success)', fontWeight: 600 }}>
                                            ₹{balance.toLocaleString('en-IN')}
                                        </td>
                                        <td>{new Date(d.due_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                        <td><span className={`badge ${statusBadge(d.status)}`}>{d.status.replace('_', ' ')}</span></td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
