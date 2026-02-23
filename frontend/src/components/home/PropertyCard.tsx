import { usePropertyStore } from '../../stores/propertyStore';
import { MapPin } from 'lucide-react';

interface PropertyCardProps {
    property: any;
}

export default function PropertyCard({ property }: PropertyCardProps) {
    const { selectedPropertyId, setSelectedProperty } = usePropertyStore();
    const isSelected = selectedPropertyId === property.id;

    return (
        <div className="card" style={{
            borderColor: isSelected ? 'var(--accent-primary)' : 'var(--border-primary)',
            cursor: 'pointer',
            padding: '24px',
            transition: 'all 0.2s',
            boxShadow: isSelected ? '0 4px 12px rgba(99, 102, 241, 0.15)' : 'none',
        }} onClick={() => setSelectedProperty(property.id)}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                    <h3 style={{ fontSize: '1.05rem', fontWeight: 600, marginBottom: 2 }}>{property.name}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{property.code}</span>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                    <span className="badge badge-info" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{property.type}</span>
                    <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: '0.65rem' }}>{property.gender}</span>
                </div>
            </div>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 20, display: 'flex', alignItems: 'center', gap: 6 }}>
                <MapPin size={14} /> {property.address || 'Address not set'}{property.city ? `, ${property.city}` : ''}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, fontSize: '0.85rem' }}>
                <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Rooms</span>
                    <strong style={{ display: 'block', fontSize: '1rem', marginTop: 4 }}>{property.total_rooms || 0}</strong>
                </div>
                <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Total Beds</span>
                    <strong style={{ display: 'block', fontSize: '1rem', marginTop: 4 }}>{property.total_beds || 0}</strong>
                </div>
                <div>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>Occupied</span>
                    <strong style={{ display: 'block', fontSize: '1rem', marginTop: 4, color: 'var(--accent-success)' }}>{property.occupied_beds || 0}</strong>
                </div>
            </div>

            {isSelected && (
                <div style={{ marginTop: 16, fontSize: '0.75rem', color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
                    ✓ Currently Selected
                </div>
            )}
        </div>
    );
}
