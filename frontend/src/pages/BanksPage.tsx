import { useEffect, useState } from 'react';
import { Landmark, Plus } from 'lucide-react';
import { usePropertyStore } from '../stores/propertyStore';
import api from '../lib/api';

interface BankAccount {
    id: string;
    account_name: string;
    bank_name: string;
    account_number: string;
    ifsc_code: string;
    upi_id: string;
    is_primary: boolean;
}

export default function BanksPage() {
    const [banks, setBanks] = useState<BankAccount[]>([]);
    const [loading, setLoading] = useState(true);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        api.get(`/properties/${selectedPropertyId}/banks/`)
            .then(res => setBanks(res.data.results || res.data || []))
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [selectedPropertyId]);

    return (
        <div className="page-container">
            <div className="page-header">
                <div><h1>Bank Accounts</h1><p className="subtitle">{banks.length} accounts</p></div>
                <button className="btn btn-primary"><Plus size={16} /> Add Account</button>
            </div>
            {loading ? <div className="page-loading"><div className="spinner"></div></div> : banks.length === 0 ? (
                <div className="card"><div className="empty-state"><Landmark size={48} /><h3>No Bank Accounts</h3><p>Add bank accounts for payment collection</p></div></div>
            ) : (
                <div className="grid-2">
                    {banks.map(b => (
                        <div className="card" key={b.id} style={{ borderColor: b.is_primary ? 'var(--accent-primary)' : undefined }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600 }}>{b.account_name}</h3>
                                {b.is_primary && <span className="badge badge-success">Primary</span>}
                            </div>
                            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', display: 'grid', gap: 6 }}>
                                <div><span style={{ color: 'var(--text-muted)' }}>Bank:</span> {b.bank_name}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>A/c:</span> {b.account_number}</div>
                                <div><span style={{ color: 'var(--text-muted)' }}>IFSC:</span> {b.ifsc_code}</div>
                                {b.upi_id && <div><span style={{ color: 'var(--text-muted)' }}>UPI:</span> {b.upi_id}</div>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
