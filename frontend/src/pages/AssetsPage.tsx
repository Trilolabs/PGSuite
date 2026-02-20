import { useEffect, useState } from 'react';
import { Package, Plus } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface Asset {
    id: string;
    name: string;
    category: string;
    quantity: number;
    purchase_date: string;
    purchase_price: string;
    room_number: string | null;
    condition: string;
}

const condBadge = (c: string) => {
    const map: Record<string, string> = { good: 'badge-success', fair: 'badge-warning', poor: 'badge-danger', new: 'badge-info' };
    return map[c] || 'badge-neutral';
};

export default function AssetsPage() {
    const [assets, setAssets] = useState<Asset[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        api.get(`/properties/${selectedPropertyId}/assets/`)
            .then(res => setAssets(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const totalValue = assets.reduce((s, a) => s + Number(a.purchase_price || 0) * (a.quantity || 1), 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Assets</h1><p className="subtitle">{assets.length} items • ₹{totalValue.toLocaleString('en-IN')} total value</p></div>
                <button className="btn btn-primary"><Plus size={16} /> Add Asset</button>
            </div>
            {loading ? <div className="page-loading"><div className="spinner"></div></div> : assets.length === 0 ? (
                <div className="card"><div className="empty-state"><Package size={48} /><h3>No Assets</h3><p>Track your property inventory</p></div></div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead><tr><th>Item</th><th>Category</th><th>Qty</th><th>Room</th><th>Value</th><th>Condition</th></tr></thead>
                        <tbody>
                            {assets.map(a => (
                                <tr key={a.id}>
                                    <td>{a.name}</td>
                                    <td style={{ textTransform: 'capitalize' }}>{a.category}</td>
                                    <td>{a.quantity}</td>
                                    <td>{a.room_number || 'Common'}</td>
                                    <td>₹{Number(a.purchase_price || 0).toLocaleString('en-IN')}</td>
                                    <td><span className={`badge ${condBadge(a.condition)}`}>{a.condition}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
