'use client';

import AddBookingDrawer from '@/components/AddBookingDrawer';
import { useRouter } from 'next/navigation';

// ... (existing imports)

export default function BookingsPage() {
    const [bookingsData, setBookingsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isAddDrawerOpen, setIsAddDrawerOpen] = useState(false);
    const toast = useToast();
    const router = useRouter();

    const fetchBookings = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/bookings');
            const data = await res.json();
            setBookingsData(data);
        } catch (error) {
            console.error("Failed to fetch bookings:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBookings();
    }, []);

    const handleAddBooking = () => {
        setIsAddDrawerOpen(true);
    };

    const handleMenuAction = async (action, booking) => {
        if (action === 'Convert to Tenant') {
            router.push(`/people/add-tenant?bookingId=${booking.id}`);
            return;
        }

        if (action === 'Cancel Booking') {
            // Simple cancel logic (UI only for now or simple API call if needed)
            toast({ title: 'Booking Cancelled', status: 'info' });
            // In real app: API call to update status
            return;
        }

        toast({
            title: action,
            description: `Action '${action}' performed on booking for ${booking.name}`,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    // ... (statCards logic remains mostly same, ensure field names match schema)
    // Schema uses: name, phone, room (string), bookingDate, moveInDate, amount, advancePaid, status
    // The previous mock data likely used different keys. Adjusting map below.

    const statCards = [
        { label: 'Total Bookings', value: bookingsData.length, color: 'blue.500' },
        { label: 'Confirmed', value: bookingsData.filter(b => b.status === 'Confirmed').length, color: 'green.500' },
        { label: 'Pending', value: bookingsData.filter(b => b.status === 'Pending').length, color: 'orange.500' },
        { label: 'Cancelled', value: bookingsData.filter(b => b.status === 'Cancelled').length, color: 'red.500' },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Bookings</Text>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500" onClick={handleAddBooking}>
                    Add Booking
                </Button>
            </Flex>

            {/* Stat Cards */}
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

            {/* ... (Search and Filters - kept same) ... */}
            <InputGroup size="sm" mb={4}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search bookings..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Filters - matching Rentok */}
            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                <Select placeholder="Booking Status" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Confirmed</option><option>Pending</option><option>Cancelled</option>
                </Select>
                {/* ... other filters can remain or be simplified ... */}
            </Flex>


            {/* Results Count */}
            <Text fontSize="sm" fontWeight="600" color="brand.500" mb={3}>{loading ? "Loading..." : `${bookingsData.length} Results Found`}</Text>

            {/* Table */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Tenant</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Rent</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Room</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Move In</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Advance</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Status</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading bookings...</Td></Tr>
                            ) : bookingsData.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center">No bookings found</Td></Tr>
                            ) : bookingsData.map((b) => (
                                <Tr key={b.id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <HStack>
                                            <Avatar size="xs" name={b.name} bg="brand.500" color="white" />
                                            <Box>
                                                <Text fontWeight="500" fontSize="sm">{b.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{b.phone}</Text>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td fontWeight="600" fontSize="sm">₹{b.amount}</Td>
                                    <Td fontSize="sm">{b.room || 'Unassigned'}</Td>
                                    <Td fontSize="sm">{b.moveInDate}</Td>
                                    <Td>
                                        <Badge colorScheme="green" fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                            ₹{b.advancePaid}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={statusColor[b.status] || 'gray'} fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                            {b.status}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Menu>
                                            <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" />
                                            <MenuList fontSize="sm" minW="160px">
                                                <MenuItem onClick={() => handleMenuAction('Convert to Tenant', b)}>Convert to Tenant</MenuItem>
                                                <MenuItem color="red.500" onClick={() => handleMenuAction('Cancel Booking', b)}>Cancel Booking</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <AddBookingDrawer
                isOpen={isAddDrawerOpen}
                onClose={() => setIsAddDrawerOpen(false)}
                onBookingAdded={fetchBookings}
            />
        </DashboardLayout>
    );
}
