import { useEffect, useState } from 'react';
import { UtensilsCrossed, Plus } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface FoodMenu {
    id: string;
    day: string;
    breakfast: string;
    lunch: string;
    dinner: string;
}

const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

export default function FoodPage() {
    const [menus, setMenus] = useState<FoodMenu[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        api.get(`/properties/${selectedPropertyId}/food-menu/`)
            .then(res => setMenus(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const sortedMenus = [...menus].sort((a, b) => days.indexOf(a.day) - days.indexOf(b.day));

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Food Menu</h1><p className="subtitle">Weekly menu for your tenants</p></div>
                <button className="btn btn-primary"><Plus size={16} /> Add Menu</button>
            </div>
            {loading ? <div className="page-loading"><div className="spinner"></div></div> : menus.length === 0 ? (
                <div className="card"><div className="empty-state"><UtensilsCrossed size={48} /><h3>No Menu Set</h3><p>Configure the weekly food menu</p></div></div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead><tr><th>Day</th><th>🌅 Breakfast</th><th>☀️ Lunch</th><th>🌙 Dinner</th></tr></thead>
                        <tbody>
                            {sortedMenus.map(m => (
                                <tr key={m.id} style={{ background: m.day === today ? 'var(--accent-primary-glow)' : undefined }}>
                                    <td style={{ textTransform: 'capitalize', fontWeight: m.day === today ? 700 : 500 }}>
                                        {m.day} {m.day === today && <span className="badge badge-info" style={{ marginLeft: 6 }}>Today</span>}
                                    </td>
                                    <td>{m.breakfast || '—'}</td>
                                    <td>{m.lunch || '—'}</td>
                                    <td>{m.dinner || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
