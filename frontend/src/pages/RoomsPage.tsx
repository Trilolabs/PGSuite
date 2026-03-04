import { useEffect, useState } from 'react';
import { DoorOpen, Plus, User, Search, UserPlus, Share2, X } from 'lucide-react';
import { roomApi } from '../lib/api';
import { usePropertyStore } from '../stores/propertyStore';
import RoomProfileDrawer from '../components/RoomProfileDrawer';

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
    const [newRoom, setNewRoom] = useState<{
        floor_name: string, number: string, type: string, rent_per_bed: string,
        bed_count: string, amenities: string[], tags: string[], remarks: string, is_available: boolean
    }>({
        floor_name: '', number: '', type: 'single', rent_per_bed: '',
        bed_count: '1', amenities: [], tags: [], remarks: '', is_available: true
    });
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState<any>(null);
    const [activeFilter, setActiveFilter] = useState<string>('Total Rooms');
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
    const { selectedPropertyId } = usePropertyStore();

    useEffect(() => {
        if (!selectedPropertyId) { setLoading(false); return; }
        Promise.all([
            roomApi.list(selectedPropertyId),
            roomApi.stats(selectedPropertyId),
        ]).then(([roomsRes, statsRes]) => {
            const roomData: Room[] = roomsRes.data.results || roomsRes.data || [];
            setStats(statsRes.data);

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



    const searchedRooms = searchQuery
        ? allRooms.filter(r => r.number.toLowerCase().includes(searchQuery.toLowerCase()))
        : allRooms;

    const filteredRooms = searchedRooms.filter(r => {
        if (activeFilter === 'Total Rooms' || activeFilter === 'Total Beds') return true;

        const occ = Number(r.occupied_beds) || 0;
        const tot = Number(r.total_beds) || 0;

        if (activeFilter === 'Vacant Rooms') return occ === 0;
        if (activeFilter === 'Semi Vacant Rooms') return occ > 0 && occ < tot;
        if (activeFilter === 'Vacant Beds') return occ < tot;
        if (activeFilter === 'Overbooked Rooms' || activeFilter === 'Overbooked Beds') return occ > tot;
        if (activeFilter === 'Occupied Rooms' || activeFilter === 'Occupied Beds') return occ === tot;
        return true; // Fallback
    });

    const handleAddRoom = async () => {
        if (!selectedPropertyId || !newRoom.floor_name || !newRoom.number) {
            alert('Please select a floor and provide a room number.');
            return;
        }
        try {
            await roomApi.create(selectedPropertyId, {
                floor_name: newRoom.floor_name,
                number: newRoom.number,
                type: newRoom.type,
                rent_per_bed: Number(newRoom.rent_per_bed) || 0,
                bed_count: Number(newRoom.bed_count) || 1,
                amenities: newRoom.amenities,
                tags: newRoom.tags,
                remarks: newRoom.remarks,
                is_available: newRoom.is_available
            });
            setShowAddRoom(false);
            window.location.reload();
        } catch (error: any) {
            console.error('Failed to add room:', error.response?.data || error);
            alert('Failed to create room: ' + JSON.stringify(error.response?.data || error.message));
        }
    };

    const generatedFloors = ['Ground Floor', ...Array.from({ length: 50 }, (_, i) => {
        const num = i + 1;
        const s = ['th', 'st', 'nd', 'rd'];
        const v = num % 100;
        return num + (s[(v - 20) % 10] || s[v] || s[0]) + ' Floor';
    })];

    const allFacilities = ['AC', 'TV', 'Washroom', 'Balcony', 'Food', 'CCTV', 'Laundry', 'WiFi', 'Geyser', 'Cupboard', 'Table', 'Chair'];
    const allTags = ['Corner Room', 'Large Room', 'Furnished', 'Unfurnished', 'Male', 'Female'];

    return (
        <div className="page-container">
            {/* Header */}
            <div className="page-header">
                <h1>Rooms</h1>
                <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary" onClick={() => setShowAddRoom(true)}>
                        <Plus size={14} /> Add Room
                    </button>
                </div>
            </div>

            {/* Scrollable Stat Cards */}
            <div style={{ display: 'flex', gap: 0, overflowX: 'auto', marginBottom: 24, paddingBottom: 8, scrollbarWidth: 'thin' }}>
                {[
                    { title: 'Total Rooms', val: stats?.total_rooms, color: '#3b82f6' },
                    { title: 'Total Beds', val: stats?.total_beds, color: '#6366f1' },
                    { title: 'Vacant Rooms', val: stats?.vacant_rooms, color: '#22c55e' },
                    { title: 'Semi Vacant Rooms', val: stats?.semi_vacant_rooms, color: '#f59e0b' },
                    { title: 'Vacant Beds', val: stats?.vacant_beds, color: '#22c55e' },
                    { title: 'Overbooked Rooms', val: stats?.overbooked_rooms, color: '#ef4444' },
                    { title: 'Overbooked Beds', val: stats?.overbooked_beds, color: '#ef4444' },
                    { title: 'Occupied Rooms', val: stats?.occupied_rooms, color: '#3b82f6' },
                    { title: 'Occupied Beds', val: stats?.occupied_beds, color: '#3b82f6' },
                    { title: 'New Bookings', val: stats?.new_bookings, color: '#8b5cf6' },
                    { title: 'Under Notice Tenants', val: stats?.under_notice, color: '#f59e0b' },
                    { title: 'Unverified Rooms', val: stats?.unverified_rooms, color: '#64748b' }
                ].map((stat, i, arr) => {
                    const isActive = activeFilter === stat.title;
                    return (
                        <div
                            key={stat.title}
                            onClick={() => setActiveFilter(stat.title)}
                            style={{
                                minWidth: 140,
                                padding: '16px 20px',
                                border: '1px solid var(--border-primary)',
                                borderRight: i < arr.length - 1 ? 'none' : '1px solid var(--border-primary)',
                                borderRadius: i === 0 ? '10px 0 0 10px' : i === arr.length - 1 ? '0 10px 10px 0' : 0,
                                background: isActive ? 'var(--bg-secondary)' : 'var(--bg-card)',
                                cursor: 'pointer',
                                transition: 'background 0.2s',
                                flexShrink: 0,
                            }}
                            className="hover-card"
                        >
                            <div style={{ fontSize: '1.5rem', fontWeight: 800, color: stat.color, marginBottom: 2 }}>{stat.val || 0}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{stat.title}</div>
                        </div>
                    );
                })}
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

            {/* Add Room Drawer (RentOk Replica) */}
            {showAddRoom && (
                <div className="drawer-overlay" style={{ zIndex: 1000 }} onClick={() => setShowAddRoom(false)}>
                    <div className="drawer-container" style={{ width: 600, padding: '20px 0', overflowY: 'auto' }} onClick={e => e.stopPropagation()}>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 24px 20px 24px', borderBottom: '1px solid var(--border-primary)' }}>
                            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, margin: 0 }}>Room Details</h2>
                            <button onClick={() => setShowAddRoom(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}><X size={20} /></button>
                        </div>

                        <div style={{ padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Room Name <span style={{ color: 'red' }}>*</span></label>
                                <input className="form-input" placeholder="Ex. Room 001" value={newRoom.number} onChange={e => setNewRoom(f => ({ ...f, number: e.target.value }))} />
                            </div>

                            <div className="grid-2">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Unit Type <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-select">
                                        <option value="">Select Unit Type</option>
                                        <option value="room">Room</option>
                                        <option value="flat">Flat</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Select Floor <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-select" value={newRoom.floor_name} onChange={e => setNewRoom(f => ({ ...f, floor_name: e.target.value }))}>
                                        <option value="">Select Floor</option>
                                        {generatedFloors.map(f => <option key={f} value={f}>{f}</option>)}
                                    </select>
                                </div>
                            </div>

                            <div className="grid-2">
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Sharing Type <span style={{ color: 'red' }}>*</span></label>
                                    <select className="form-select" value={newRoom.type} onChange={e => setNewRoom(f => ({ ...f, type: e.target.value }))}>
                                        <option value="single">Single Sharing</option>
                                        <option value="double">Double Sharing</option>
                                        <option value="triple">Triple Sharing</option>
                                        <option value="quad">Quad Sharing</option>
                                        <option value="dormitory">Dormitory</option>
                                    </select>
                                </div>
                                <div className="form-group" style={{ marginBottom: 0 }}>
                                    <label className="form-label">Total Beds <span style={{ color: 'red' }}>*</span></label>
                                    <input className="form-input" type="number" min="1" value={newRoom.bed_count} onChange={e => setNewRoom(f => ({ ...f, bed_count: String(e.target.value) }))} />
                                </div>
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Amount Per Bed (₹)</label>
                                <input className="form-input" type="number" placeholder="0" value={newRoom.rent_per_bed} onChange={e => setNewRoom(f => ({ ...f, rent_per_bed: e.target.value }))} />
                            </div>

                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label className="form-label">Room Remarks</label>
                                <textarea className="form-input" rows={2} placeholder="Remarks" value={newRoom.remarks} onChange={e => setNewRoom(f => ({ ...f, remarks: e.target.value }))} />
                            </div>

                            <div style={{ marginBottom: 8 }}>
                                <label className="form-label" style={{ marginBottom: 8 }}>Is this room available to rent <span style={{ color: 'red' }}>*</span></label>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input type="radio" checked={newRoom.is_available} onChange={() => setNewRoom(f => ({ ...f, is_available: true }))} /> Yes
                                    </label>
                                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.9rem', cursor: 'pointer' }}>
                                        <input type="radio" checked={!newRoom.is_available} onChange={() => setNewRoom(f => ({ ...f, is_available: false }))} /> No
                                    </label>
                                </div>
                            </div>

                            <div>
                                <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#3b82f6', marginBottom: 16 }}>Room Facilities</h3>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {allFacilities.map(fac => {
                                        const selected = newRoom.amenities.includes(fac);
                                        return (
                                            <div
                                                key={fac}
                                                onClick={() => {
                                                    setNewRoom(prev => ({
                                                        ...prev,
                                                        amenities: selected ? prev.amenities.filter(a => a !== fac) : [...prev.amenities, fac]
                                                    }));
                                                }}
                                                style={{
                                                    padding: '6px 12px', fontSize: '0.85rem', borderRadius: 4, cursor: 'pointer',
                                                    border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-primary)'}`,
                                                    background: selected ? 'var(--bg-primary-light)' : 'transparent',
                                                    color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                                                    display: 'flex', alignItems: 'center', gap: 8
                                                }}
                                            >
                                                <input type="checkbox" checked={selected} readOnly style={{ margin: 0, cursor: 'pointer' }} />
                                                {fac}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            <div style={{ marginTop: 8 }}>
                                <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>Room Type</h3>
                                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                                    {allTags.map(tag => {
                                        const selected = newRoom.tags.includes(tag);
                                        return (
                                            <div
                                                key={tag}
                                                onClick={() => {
                                                    setNewRoom(prev => ({
                                                        ...prev,
                                                        tags: selected ? prev.tags.filter(t => t !== tag) : [...prev.tags, tag]
                                                    }));
                                                }}
                                                style={{
                                                    padding: '6px 12px', fontSize: '0.85rem', borderRadius: 4, cursor: 'pointer',
                                                    border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-primary)'}`,
                                                    background: selected ? 'var(--bg-primary-light)' : 'transparent',
                                                    color: selected ? 'var(--primary)' : 'var(--text-secondary)',
                                                    display: 'flex', alignItems: 'center', gap: 8
                                                }}
                                            >
                                                <input type="checkbox" checked={selected} readOnly style={{ margin: 0, cursor: 'pointer' }} />
                                                {tag}
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-primary)', display: 'flex', justifyContent: 'center' }}>
                            <button className="btn btn-primary" style={{ width: '100%', padding: '12px', fontSize: '1rem' }} onClick={handleAddRoom}>
                                Add Room
                            </button>
                        </div>
                    </div>
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
                                    <tr
                                        key={room.id}
                                        onClick={() => setSelectedRoomId(room.id)}
                                        style={{ cursor: 'pointer', transition: 'background 0.2s' }}
                                        className="hover:bg-slate-800 hover-card"
                                    >
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

            {selectedRoomId && (
                <RoomProfileDrawer
                    roomId={selectedRoomId}
                    onClose={() => {
                        setSelectedRoomId(null);
                        window.location.reload(); // Refresh data on close
                    }}
                />
            )}
        </div>
    );
}
