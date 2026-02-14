'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,
    IconButton, Menu, MenuButton, MenuList, MenuItem, useDisclosure, useToast,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
} from '@chakra-ui/react';
import { useRef } from 'react';
import { MdSearch, MdAdd, MdMoreVert, MdChecklist, MdTimeline, MdHotel } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import AddRoomDrawer from '@/components/AddRoomDrawer';


const statusColor = { Occupied: 'green', Vacant: 'red', 'Partially Occupied': 'orange', Maintenance: 'gray' };



const getOccancyStatus = (room) => {
    if (room.occupiedBeds === 0) return 'Vacant';
    if (room.occupiedBeds >= room.beds) return 'Occupied';
    return `${room.occupiedBeds}/${room.beds}`;
};

const getRoomStatus = (room) => {
    if (room.status === 'Maintenance') return 'Maintenance';
    if (room.occupiedBeds === 0) return 'Vacant';
    if (room.occupiedBeds >= room.beds) return 'Occupied';
    return 'Partially Occupied';
};

export default function RoomsPage() {
    const [roomsData, setRoomsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const router = useRouter();
    const toast = useToast();
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [roomToDelete, setRoomToDelete] = useState(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    // Filters State
    const [filters, setFilters] = useState({
        vacancy: '',
        type: '',
        floor: '',
        sharing: '',
        unitType: '',
        status: '',
    });

    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const fetchRooms = async () => {
        try {
            const res = await fetch('/api/rooms');
            const data = await res.json();
            setRoomsData(data);
        } catch (error) {
            console.error("Failed to fetch rooms:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleAddRoom = () => {
        setSelectedRoom(null);
        onOpen();
    };

    const handleEditRoom = (room) => {
        setSelectedRoom(room);
        onOpen();
    };

    const confirmDeleteRoom = (room) => {
        setRoomToDelete(room);
        onDeleteOpen();
    };

    const handleDeleteRoom = async () => {
        if (!roomToDelete) return;
        try {
            const res = await fetch(`/api/rooms/${roomToDelete.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete room');

            toast({ title: 'Room deleted', status: 'success', duration: 2000 });
            fetchRooms();
            onDeleteClose();
            setRoomToDelete(null);
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
        }
    };

    const handleRoomAdded = () => {
        fetchRooms();
    };

    const handleViewTenants = () => {
        router.push('/people/tenants');
    };

    const handleAddTenantToRoom = (room) => {
        router.push(`/people/add-tenant?roomId=${room.id}&roomName=${room.number}`);
    };

    const handleMockAction = (action) => {
        toast({ title: action, description: "Feature coming soon", status: "info", duration: 2000 });
    };

    // Stat cards matching Rentok Rooms page exactly
    const totalRooms = roomsData.length;
    const totalBeds = roomsData.reduce((sum, r) => sum + r.beds, 0);
    const occupiedBeds = roomsData.reduce((sum, r) => sum + r.occupiedBeds, 0);
    const vacantRooms = roomsData.filter(r => r.occupiedBeds === 0).length;
    const semiVacant = roomsData.filter(r => r.occupiedBeds > 0 && r.occupiedBeds < r.beds).length;
    const vacantBeds = totalBeds - occupiedBeds;
    const unverifiedRooms = roomsData.filter(r => r.status === 'Unverified').length;
    const overbookedRooms = roomsData.filter(r => r.occupiedBeds > r.beds).length;
    const overbookedBeds = 0; // Need calculation if tracking overbooking count
    const occupiedRooms = roomsData.filter(r => r.occupiedBeds >= r.beds).length;

    const statCards = [
        { label: 'Total Rooms', value: totalRooms, color: 'blue.500' },
        { label: 'Total Beds', value: totalBeds, color: 'blue.500' },
        { label: 'Vacant Rooms', value: vacantRooms, color: 'red.500' },
        { label: 'Semi Vacant Rooms', value: semiVacant, color: 'orange.500' },
        { label: 'Vacant Beds', value: vacantBeds, color: 'red.500' },
        { label: 'Unverified Rooms', value: unverifiedRooms, color: 'purple.500' },
        { label: 'Overbooked Rooms', value: overbookedRooms, color: 'orange.500' },
        { label: 'Overbooked Beds', value: overbookedBeds, color: 'orange.500' },
        { label: 'Occupied Rooms', value: occupiedRooms, color: 'green.500' },
        { label: 'Occupied Beds', value: occupiedBeds, color: 'green.500' },
    ];

    const filteredRooms = roomsData.filter(room => {
        const matchesVacancy = !filters.vacancy || getOccancyStatus(room).toLowerCase().includes(filters.vacancy.toLowerCase()) ||
            (filters.vacancy === 'Vacant' && room.occupiedBeds === 0) ||
            (filters.vacancy === 'Occupied' && room.occupiedBeds >= room.beds) ||
            (filters.vacancy === 'Semi Vacant' && room.occupiedBeds > 0 && room.occupiedBeds < room.beds);

        const matchesType = !filters.type || (room.amenities && room.amenities.includes(filters.type)); // Rough check for AC/Non-AC if stored in amenities
        const matchesSharing = !filters.sharing || room.type === filters.sharing;
        const matchesFloor = !filters.floor || room.floor === filters.floor;
        const matchesUnitType = !filters.unitType || room.unitType === filters.unitType;
        const matchesStatus = !filters.status || room.status === filters.status;

        return matchesVacancy && matchesType && matchesSharing && matchesFloor && matchesUnitType && matchesStatus;
    });

    return (
        <DashboardLayout>
            {/* Header - matching Rentok exactly */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Rooms</Text>
                <HStack spacing={3}>
                    <Button variant="outline" size="sm" leftIcon={<MdChecklist />} borderRadius="lg" colorScheme="blue" fontWeight="500" onClick={() => handleMockAction('Cleaning Checklist')}>
                        Cleaning checklist
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<MdTimeline />} borderRadius="lg" colorScheme="blue" fontWeight="500" onClick={() => handleMockAction('View Timeline')}>
                        View timeline
                    </Button>
                    <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500" onClick={handleAddRoom}>
                        Add Room
                    </Button>
                </HStack>
            </Flex>

            {/* Stat Cards - scrollable like Rentok */}
            <Box overflowX="auto" mb={5} pb={2} css={{ '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: '3px' } }}>
                <Flex gap={3} minW="max-content">
                    {statCards.map((stat) => (
                        <Card key={stat.label} minW="150px" bg="white" borderRadius="xl" boxShadow="sm" flex="0 0 auto">
                            <CardBody py={3} px={4}>
                                <Text fontSize="2xl" fontWeight="800" color={stat.color}>{stat.value}</Text>
                                <Text fontSize="xs" color="gray.600" mt={1}>{stat.label}</Text>
                            </CardBody>
                        </Card>
                    ))}
                </Flex>
            </Box>

            {/* Search */}
            <InputGroup size="sm" mb={4}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search Room..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Filters - matching Rentok Rooms filters exactly */}
            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                <Select placeholder="Vacancy Type" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs" onChange={(e) => handleFilterChange('vacancy', e.target.value)}>
                    <option value="Vacant">Vacant</option>
                    <option value="Semi Vacant">Semi Vacant</option>
                    <option value="Occupied">Occupied</option>
                </Select>
                <Select placeholder="Room Type" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs" onChange={(e) => handleFilterChange('type', e.target.value)}>
                    <option value="AC">AC</option><option value="Non AC">Non AC</option>
                </Select>
                <Select placeholder="Sharing Type" size="sm" maxW="140px" borderRadius="full" bg="white" fontSize="xs" onChange={(e) => handleFilterChange('sharing', e.target.value)}>
                    <option value="1 Sharing">1 Sharing</option>
                    <option value="2 Sharing">2 Sharing</option>
                    <option value="3 Sharing">3 Sharing</option>
                    <option value="4 Sharing">4 Sharing</option>
                </Select>
                <Select placeholder="Floor" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs" onChange={(e) => handleFilterChange('floor', e.target.value)}>
                    {[...new Set(roomsData.map(r => r.floor))].sort().map(f => (
                        <option key={f} value={f}>{f}</option>
                    ))}
                </Select>
                <Select placeholder="Room Status" size="sm" maxW="140px" borderRadius="full" bg="white" fontSize="xs" onChange={(e) => handleFilterChange('status', e.target.value)}>
                    <option value="Available">Available</option><option value="Maintenance">Maintenance</option><option value="Blocked">Blocked</option>
                </Select>
                <Select placeholder="Unit Type" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs" onChange={(e) => handleFilterChange('unitType', e.target.value)}>
                    <option value="Room">Room</option>
                    <option value="1 RK">1 RK</option>
                    <option value="1 BHK">1 BHK</option>
                    <option value="Bed">Bed</option>
                </Select>
                <Select placeholder="Listing Status" size="sm" maxW="140px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Listed</option><option>Unlisted</option>
                </Select>
                <Select placeholder="Room Facilities" size="sm" maxW="150px" borderRadius="full" bg="white" fontSize="xs">
                    <option>AC</option><option>Wi-Fi</option><option>TV</option><option>Geyser</option><option>Fridge</option>
                </Select>
                <Select placeholder="Stay Type" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Long Stay</option><option>Short Stay</option>
                </Select>
            </Flex>

            {/* Results count */}
            <Text fontSize="sm" fontWeight="600" color="brand.500" mb={3}>{loading ? "Loading..." : `${filteredRooms.length} Results Found`}</Text>


            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Floor</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Name</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Occupancy Status</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Status</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Rent/Bed</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Remarks</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading rooms...</Td></Tr>
                            ) : filteredRooms.map((room) => {
                                const status = getRoomStatus(room);
                                return (
                                    <Tr key={room.id} _hover={{ bg: 'gray.50' }} cursor="pointer">
                                        <Td fontSize="sm">{room.floor || `Floor`}</Td>
                                        <Td fontWeight="500" fontSize="sm">{room.number}</Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                {Array.from({ length: room.beds }).map((_, i) => (
                                                    <Icon
                                                        key={i}
                                                        as={MdHotel}
                                                        color={i < room.occupiedBeds ? "green.500" : "red.400"}
                                                        boxSize={5}
                                                    />
                                                ))}
                                                <Text fontSize="xs" color="gray.500" ml={1}>
                                                    ({room.occupiedBeds}/{room.beds})
                                                </Text>
                                            </HStack>
                                        </Td>
                                        <Td>
                                            <Badge colorScheme={statusColor[status]} fontSize="2xs" px={2} py={0.5} borderRadius="full">{status}</Badge>
                                        </Td>
                                        <Td fontWeight="600" fontSize="sm">₹{(room.rent || 0).toLocaleString('en-IN')}</Td>
                                        <Td fontSize="xs" color="gray.500">{room.remarks || '—'}</Td>
                                        <Td>
                                            <HStack spacing={1}>
                                                <Button size="xs" colorScheme="blue" variant="outline" onClick={() => handleAddTenantToRoom(room)}>Add</Button>
                                                <Menu>
                                                    <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" />
                                                    <MenuList fontSize="sm" minW="160px">
                                                        <MenuItem onClick={() => handleEditRoom(room)}>Edit Room</MenuItem>
                                                        <MenuItem onClick={handleViewTenants}>View Tenants</MenuItem>
                                                        <MenuItem onClick={() => handleMockAction('Bulk Update Rent')}>Bulk Update Rent</MenuItem>
                                                        <MenuItem onClick={() => handleMockAction('Add to Listing')}>Add to Listing</MenuItem>
                                                        <MenuItem color="red.500" onClick={() => handleMockAction('Mark Maintenance')}>Mark Under Maintenance</MenuItem>
                                                        <MenuItem color="red.500" onClick={() => confirmDeleteRoom(room)}>Delete Room</MenuItem>
                                                    </MenuList>
                                                </Menu>
                                            </HStack>
                                        </Td>
                                    </Tr>
                                );
                            })}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <AddRoomDrawer isOpen={isOpen} onClose={onClose} onRoomAdded={handleRoomAdded} roomToEdit={selectedRoom} existingRooms={roomsData} />

            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Room
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete Room {roomToDelete?.number}? This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeleteRoom} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </DashboardLayout>
    );
}
