import { useEffect, useState } from 'react';
import { Zap, Plus } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface MeterReading {
    id: string;
    tenant_name: string;
    room_number: string;
    previous_reading: string;
    current_reading: string;
    units_consumed: number;
    rate_per_unit: string;
    total_amount: string;
    reading_date: string;
}

export default function ElectricityPage() {
    const [readings, setReadings] = useState<MeterReading[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        api.get(`/properties/${selectedPropertyId}/meter-readings/`)
            .then(res => setReadings(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const totalUnits = readings.reduce((s, r) => s + Number(r.units_consumed || 0), 0);
    const totalAmount = readings.reduce((s, r) => s + Number(r.total_amount || 0), 0);

    return (
        <div className="page-container">
            <div className="page-header">
                <div>
                    <h1>Electricity</h1>
                    <p className="subtitle">{totalUnits} units • ₹{totalAmount.toLocaleString('en-IN')}</p>
                </div>
                <button className="btn btn-primary"><Plus size={16} /> Add Reading</button>
            </div>

            <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-warning)' } as any}>
                    <div className="label">Total Units</div>
                    <div className="value">{totalUnits}</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-danger)' } as any}>
                    <div className="label">Total Amount</div>
                    <div className="value money">{totalAmount.toLocaleString('en-IN')}</div>
                </div>
                <div className="stat-card" style={{ '--stat-color': 'var(--accent-info)' } as any}>
                    <div className="label">Readings</div>
                    <div className="value">{readings.length}</div>
                </div>
            </div>

            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : readings.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <Zap size={48} />
                        <h3>No Meter Readings</h3>
                        <p>Record electricity meter readings to auto-create dues</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Tenant</th>
                                <th>Room</th>
                                <th>Previous</th>
                                <th>Current</th>
                                <th>Units</th>
                                <th>Rate</th>
                                <th>Amount</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            {readings.map(r => (
                                <tr key={r.id}>
                                    <td>{r.tenant_name}</td>
                                    <td>{r.room_number}</td>
                                    <td>{r.previous_reading}</td>
                                    <td>{r.current_reading}</td>
                                    <td style={{ fontWeight: 600 }}>{r.units_consumed}</td>
                                    <td>₹{r.rate_per_unit}/unit</td>
                                    <td style={{ fontWeight: 600, color: 'var(--accent-warning)' }}>₹{Number(r.total_amount).toLocaleString('en-IN')}</td>
                                    <td>{new Date(r.reading_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
