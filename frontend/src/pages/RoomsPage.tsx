import { useEffect, useState } from 'react';
import { DoorOpen, Plus, User, Search, UserPlus, Share2 } from 'lucide-react';
import { roomApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';

interface Bed {
    id: string;
    label: string;
    status: string;
    tenant_name: string | null;
    effective_rent: number;
}

interface Room {
    id: string;
    number: string;
    type: string;
    floor: string;
    floor_name: string;
    total_beds: number;
    occupied_beds: number;
    rent_per_bed: string;
    amenities: string[];
    status: string;
    beds: Bed[];
}

interface Floor {
    name: string;
    rooms: Room[];
}

const bedStatusIcon = (s: string) => {
    const map: Record<string, { color: string; emoji: string }> = {
        vacant: { color: '#22c55e', emoji: '🟩' },
        occupied: { color: '#3b82f6', emoji: '🟦' },
        under_notice: { color: '#f59e0b', emoji: '🟨' },
        maintenance: { color: '#ef4444', emoji: '🟥' },
    };
    return map[s] || { color: '#64748b', emoji: '⬜' };
};

export default function RoomsPage() {
    const [floors, setFloors] = useState<Floor[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddRoom, setShowAddRoom] = useState(false);
    const [showAddFloor, setShowAddFloor] = useState(false);
    const [newFloorName, setNewFloorName] = useState('');
    const [newRoom, setNewRoom] = useState({ floor: '', number: '', type: 'single', rent_per_bed: '', bed_count: '1' });
    const [floorOptions, setFloorOptions] = useState<{ id: string; name: string }[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        Promise.all([
            roomApi.list(selectedPropertyId),
            roomApi.floors(selectedPropertyId),
        ]).then(([roomsRes, floorsRes]) => {
            const roomData: Room[] = roomsRes.data.results || roomsRes.data || [];
            const floorData = floorsRes.data.results || floorsRes.data || [];
            setFloorOptions(floorData);

            const floorMap = new Map<string, Room[]>();
            roomData.forEach(r => {
                const fname = r.floor_name || 'Unassigned';
                if (!floorMap.has(fname)) floorMap.set(fname, []);
                floorMap.get(fname)!.push(r);
            });
            setFloors(Array.from(floorMap.entries()).map(([name, rooms]) => ({ name, rooms })));
        }).catch(() => setFloors([])).finally(() => setLoading(false));
    }, [selectedPropertyId]);

    const allRooms = floors.flatMap(f => f.rooms);
    const totalRooms = allRooms.length;
    const totalBeds = allRooms.reduce((s, r) => s + r.total_beds, 0);
    const occupiedBeds = allRooms.reduce((s, r) => s + r.occupied_beds, 0);
    const vacantBeds = totalBeds - occupiedBeds;
    const vacantRooms = allRooms.filter(r => r.occupied_beds === 0).length;
    const semiVacant = allRooms.filter(r => r.occupied_beds > 0 && r.occupied_beds < r.total_beds).length;
    const occupiedRooms = allRooms.filter(r => r.occupied_beds === r.total_beds).length;

    const scrollStats = [
        { count: totalRooms, label: 'Total Rooms', color: '#3b82f6' },
        { count: totalBeds, label: 'Total Beds', color: '#6366f1' },
        { count: vacantRooms, label: 'Vacant Rooms', color: '#22c55e' },
        { count: semiVacant, label: 'Semi Vacant Rooms', color: '#22c55e' },
        { count: vacantBeds, label: 'Vacant Beds', color: '#22c55e' },
        { count: 0, label: 'Overbooked Rooms', color: '#ef4444' },
        { count: 0, label: 'Overbooked Beds', color: '#ef4444' },
        { count: occupiedRooms, label: 'Occupied Rooms', color: '#f59e0b' },
        { count: occupiedBeds, label: 'Occupied Beds', color: '#f59e0b' },
        { count: 0, label: 'New Bookings', color: '#06b6d4' },
        { count: 0, label: 'Under Notice Tenants', color: '#8b5cf6' },
    ];

    const filteredRooms = searchQuery
        ? allRooms.filter(r => r.number.toLowerCase().includes(searchQuery.toLowerCase()))
        : allRooms;

    const handleAddRoom = async () => {
        if (!selectedPropertyId || !newRoom.floor || !newRoom.number) return;
        try {
            await roomApi.create(selectedPropertyId, {
                floor: newRoom.floor, number: newRoom.number, type: newRoom.type,
                rent_per_bed: Number(newRoom.rent_per_bed) || 0, bed_count: Number(newRoom.bed_count) || 1,
            });
            setShowAddRoom(false);
            window.location.reload();
        } catch { }
    };

    const handleAddFloor = async () => {
        if (!selectedPropertyId || !newFloorName) return;
        try {
            const res = await roomApi.createFloor(selectedPropertyId, { name: newFloorName });
            setFloorOptions(prev => [...prev, res.data]);
            setNewFloorName('');
            setShowAddFloor(false);
            setNewRoom(f => ({ ...f, floor: res.data.id }));
            if (!showAddRoom) setShowAddRoom(true);
        } catch { }
    };

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1>Rooms</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-secondary" onClick={() => setShowAddFloor(!showAddFloor)}>
                        <Plus size={14} /> Add Floor
                    </button>
                    <button className="btn btn-primary" onClick={() => setShowAddRoom(!showAddRoom)}>
                        <Plus size={14} /> Add Room
                    </button>
                </div>
            </div>

            {/* Scrollable Stat Cards */}
            <div style={{
                display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 20, scrollbarWidth: 'thin',
            }}>
                {scrollStats.map((s, i) => (
                    <div key={i} style={{
                        minWidth: 120, padding: '14px 16px',
                        border: '1px solid var(--border-primary)',
                        borderRight: i < scrollStats.length - 1 ? 'none' : '1px solid var(--border-primary)',
                        borderRadius: i === 0 ? '10px 0 0 10px' : i === scrollStats.length - 1 ? '0 10px 10px 0' : 0,
                        background: 'var(--bg-card)', cursor: 'pointer',
                    }} className="hover-card">
                        <div style={{ fontSize: '1.3rem', fontWeight: 800, color: s.color }}>{s.count}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{s.label}</div>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="card" style={{ padding: '12px 20px', marginBottom: 12 }}>
                <div className="header-search" style={{ maxWidth: 400 }}>
                    <Search size={16} />
                    <input placeholder="Search Room..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
                </div>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                {['Vacancy Type', 'Room Type', 'Room Status', 'Sharing Type', 'Unit Type', 'Listing Status', 'Room Facilities', 'Stay Type'].map(f => (
                    <select key={f} className="form-select" style={{ width: 130, fontSize: '0.78rem' }}>
                        <option>{f} ▾</option>
                    </select>
                ))}
            </div>

            {/* Add Floor/Room Forms */}
            {showAddFloor && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>New Floor</h3>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end' }}>
                        <div className="form-group" style={{ flex: 1, maxWidth: 300, marginBottom: 0 }}>
                            <label className="form-label">Floor Name</label>
                            <input className="form-input" placeholder="e.g. Ground Floor" value={newFloorName} onChange={e => setNewFloorName(e.target.value)} />
                        </div>
                        <button className="btn btn-primary" onClick={handleAddFloor}>Create</button>
                    </div>
                </div>
            )}

            {showAddRoom && (
                <div className="card" style={{ marginBottom: 16 }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 12 }}>New Room</h3>
                    <div className="grid-4">
                        <div className="form-group">
                            <label className="form-label">Floor</label>
                            <select className="form-select" value={newRoom.floor} onChange={e => setNewRoom(f => ({ ...f, floor: e.target.value }))}>
                                <option value="">Select Floor</option>
                                {floorOptions.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Room Number</label>
                            <input className="form-input" placeholder="101" value={newRoom.number} onChange={e => setNewRoom(f => ({ ...f, number: e.target.value }))} />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Type</label>
                            <select className="form-select" value={newRoom.type} onChange={e => setNewRoom(f => ({ ...f, type: e.target.value }))}>
                                <option value="single">Single</option>
                                <option value="double">Double</option>
                                <option value="triple">Triple</option>
                                <option value="quad">Quad (4)</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">Beds</label>
                            <input className="form-input" type="number" min="1" value={newRoom.bed_count} onChange={e => setNewRoom(f => ({ ...f, bed_count: e.target.value }))} />
                        </div>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Rent per Bed (₹)</label>
                        <input className="form-input" type="number" style={{ maxWidth: 200 }} value={newRoom.rent_per_bed} onChange={e => setNewRoom(f => ({ ...f, rent_per_bed: e.target.value }))} />
                    </div>
                    <button className="btn btn-primary" onClick={handleAddRoom}>Create Room</button>
                </div>
            )}

            {/* Results Count */}
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {filteredRooms.length} Results Found
            </div>

            {/* Table View */}
            {loading ? (
                <div className="page-loading"><div className="spinner"></div></div>
            ) : filteredRooms.length === 0 ? (
                <div className="card">
                    <div className="empty-state">
                        <DoorOpen size={48} />
                        <h3>No Rooms Yet</h3>
                        <p>Add floors and rooms to your property</p>
                    </div>
                </div>
            ) : (
                <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>FLOOR</th>
                                <th>NAME</th>
                                <th>OCCUPANCY STATUS</th>
                                <th>STATUS</th>
                                <th>RENT/BED</th>
                                <th>REMARKS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredRooms.map(room => {
                                const vacantCount = room.total_beds - room.occupied_beds;
                                let statusText = '';
                                let statusColor = '';
                                if (room.occupied_beds === room.total_beds) {
                                    statusText = 'Occupied';
                                    statusColor = '#f59e0b';
                                } else if (room.occupied_beds === 0) {
                                    statusText = `${room.total_beds} bed${room.total_beds > 1 ? 's' : ''} vacant`;
                                    statusColor = '#22c55e';
                                } else {
                                    statusText = `${vacantCount} bed${vacantCount > 1 ? 's' : ''} vacant`;
                                    statusColor = '#22c55e';
                                }

                                return (
                                    <tr key={room.id}>
                                        <td style={{ color: 'var(--text-muted)' }}>{room.floor_name}</td>
                                        <td style={{ fontWeight: 600 }}>{room.number}</td>
                                        <td>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginRight: 4 }}>ℹ️</span>
                                                {room.beds?.map(bed => (
                                                    <div key={bed.id} title={bed.tenant_name || 'Vacant'} style={{
                                                        width: 28, height: 22, borderRadius: 4, display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center',
                                                        background: `${bedStatusIcon(bed.status).color}18`,
                                                        border: `1.5px solid ${bedStatusIcon(bed.status).color}`,
                                                        cursor: 'pointer',
                                                    }}>
                                                        {bed.status === 'occupied' ? (
                                                            <User size={12} style={{ color: bedStatusIcon(bed.status).color }} />
                                                        ) : (
                                                            <span style={{ fontSize: '0.6rem', color: bedStatusIcon(bed.status).color }}>🛏</span>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </td>
                                        <td>
                                            <span style={{ color: statusColor, fontSize: '0.8rem', fontWeight: 500 }}>
                                                {statusText}
                                            </span>
                                        </td>
                                        <td style={{ fontWeight: 600 }}>₹{Number(room.rent_per_bed).toLocaleString('en-IN')}</td>
                                        <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{room.type}</td>
                                        <td>
                                            <div style={{ display: 'flex', gap: 6 }}>
                                                <button className="btn btn-secondary" style={{ fontSize: '0.75rem', padding: '4px 10px' }}>
                                                    <UserPlus size={13} /> Add
                                                </button>
                                                <button style={{
                                                    background: 'none', border: '1px solid var(--border-primary)',
                                                    borderRadius: 6, padding: '4px 8px', cursor: 'pointer', color: 'var(--text-muted)',
                                                }}>
                                                    <Share2 size={13} />
                                                </button>
                                            </div>
                                        </td>
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
