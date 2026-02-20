import { useEffect, useState } from 'react';
import { CreditCard, Plus } from 'lucide-react';
import { expenseApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Expense {
    id: string;
    title: string;
    category: string;
    amount: string;
    date: string;
    description: string;
    receipt_url: string | null;
}

interface Summary {
    total: number;
    by_category: { category: string; total: number }[];
}

const categoryColors: Record<string, string> = {
    maintenance: '#3b82f6', salary: '#8b5cf6', electricity: '#f59e0b',
    water: '#06b6d4', internet: '#10b981', food: '#ef4444',
    security: '#f97316', housekeeping: '#6366f1', other: '#64748b',
};

export default function ExpensePage() {
    const [expenses, setExpenses] = useState<Expense[]>([]);
    const [summary, setSummary] = useState<Summary | null>(null);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({ title: '', category: 'maintenance', amount: '', date: new Date().toISOString().split('T')[0], description: '' });
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        Promise.all([
            expenseApi.list(selectedPropertyId),
            expenseApi.summary(selectedPropertyId),
        ]).then(([expRes, sumRes]) => {
            setExpenses(expRes.data.results || expRes.data || []);
            setSummary(sumRes.data);
        }).catch(() => { }).finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const handleAdd = async () => {
        if (!selectedPropertyId) return;
        try {
            await expenseApi.create(selectedPropertyId, { ...form, amount: Number(form.amount) });
            setShowAdd(false);
            window.location.reload();
        } catch { }
    };

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Expenses</h1>
                    <p className="subtitle">₹{(summary?.total || 0).toLocaleString('en-IN')} total expenses</p>
                </div>
                <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}>
                    <Plus size={16} /> Add Expense
                </button>
            </div>

            {/* Category Breakdown */}
            {summary?.by_category && summary.by_category.length > 0 && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-title" style={{ marginBottom: 12 }}>By Category</div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {summary.by_category.map(c => (
                            <div key={c.category} style={{
                                background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-sm)',
                                padding: '8px 14px', display: 'flex', alignItems: 'center', gap: 8,
                                border: '1px solid var(--border-color)',
                            }}>
                                <div style={{
                                    width: 8, height: 8, borderRadius: '50%',
                                    background: categoryColors[c.category] || 'var(--text-muted)',
                                }} />
                                <span style={{ fontSize: '0.8rem', textTransform: 'capitalize' }}>{c.category}</span>
                                <strong style={{ fontSize: '0.85rem' }}>₹{c.total.toLocaleString('en-IN')}</strong>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {showAdd && (
                <div className="card" style={{ marginBottom: 20 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 16 }}>New Expense</h3>
                    <div className="grid-3">
                        <div className="form-group">
                            <label className="form-label">Title</label>
                            <input className="form-input" placeholder="Plumbing repair" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Category</label>
                            <select className="form-select" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                                {Object.keys(categoryColors).map(c => (
                                    <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Amount (₹)</label>
                            <input className="form-input" type="number" value={form.amount} onChange={e => setForm(f => ({ ...f, amount: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid-2">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input className="form-input" type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Description</label>
                            <input className="form-input" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                        </div>
                    </div>
                    <button className="btn btn-primary" onClick={handleAdd}>Save Expense</button>
                </div>
            )}

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : expenses.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <CreditCard size={48} />
                        <h3>No Expenses</h3>
                        <p>Track your property expenses here</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Title</th>
                                <th>Category</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {expenses.map(e => (
                                <tr key={e.id}>
                                    <td>{e.title}</td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                                            <div style={{ width: 8, height: 8, borderRadius: '50%', background: categoryColors[e.category] || 'var(--text-muted)' }} />
                                            <span style={{ textTransform: 'capitalize' }}>{e.category}</span>
                                        </div>
                                    </td>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-danger)' }}>₹{Number(e.amount).toLocaleString('en-IN')}</td>
                                    <td>{new Date(e.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
