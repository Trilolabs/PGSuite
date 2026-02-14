'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,

    IconButton, Menu, MenuButton, MenuList, MenuItem, useToast,
} from '@chakra-ui/react';
import { MdSearch, MdAdd, MdClose } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';




const statusColor = {
    'Complaint Received': 'blue',
    'Complaint Verified': 'green',
    'Need More Time': 'orange',
    'Need More Details': 'yellow',
    'Team is Working': 'purple',
    'Resolved': 'green',
    Open: 'blue',
    'In Progress': 'yellow',
    Closed: 'green',
};

const activeFilters = ['Complaint Received', 'Complaint Verified', 'Need More Time', 'Need More Details', 'Team is Working'];

export default function ComplaintsPage() {
    const [complaintsData, setComplaintsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchComplaints = async () => {
            try {
                const res = await fetch('/api/complaints');
                const data = await res.json();
                setComplaintsData(data);
            } catch (error) {
                console.error("Failed to fetch complaints:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchComplaints();
    }, []);

    const handleAddComplaint = () => {
        toast({
            title: "Add Complaint",
            description: "Complaint raising feature coming soon.",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleClearFilters = () => {
        toast({
            title: "Filters Cleared",
            description: "All active filters have been cleared.",
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    // Interactive status update handler
    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await fetch(`/api/complaints/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            });
            // Optimistic update
            setComplaintsData(prev => prev.map(c => c.id === id ? { ...c, status: newStatus } : c));
        } catch (error) {
            console.error("Failed to update status:", error);
        }
    };

    const statCards = [
        { label: 'New Complaints', value: complaintsData.filter(c => c.status === 'New').length, color: 'red.500' },
        { label: 'Verified Complaints', value: complaintsData.filter(c => c.status === 'Verified').length, color: 'green.500' },
        { label: 'Need More Time', value: complaintsData.filter(c => c.status === 'Need More Time').length, color: 'orange.500' },
        { label: 'Need More Details', value: complaintsData.filter(c => c.status === 'Need More Details').length, color: 'orange.500' },
        { label: 'Under Process', value: complaintsData.filter(c => c.status === 'In Progress').length, color: 'blue.500' },
        { label: 'Assigned To Team', value: complaintsData.filter(c => c.assignedTo).length, color: 'purple.500' },
        { label: 'Resolved Complaints', value: complaintsData.filter(c => c.status === 'Resolved').length, color: 'green.500' },
        { label: 'Total Complaints', value: complaintsData.length, color: 'gray.600' },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Complaints</Text>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500" onClick={handleAddComplaint}>
                    Add Complaint
                </Button>
            </Flex>

            {/* Stat Cards - scrollable */}
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
                <Input placeholder="Search complaints..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Filters - matching Rentok exactly */}
            <Flex gap={2} mb={3} flexWrap="wrap" align="center">
                <Select placeholder="Status" size="sm" maxW="110px" borderRadius="full" bg="white" fontSize="xs">
                    <option>New</option><option>Verified</option><option>Resolved</option>
                </Select>
                <Select placeholder="Category" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Plumbing</option><option>Electrical</option><option>Furniture</option><option>Cleaning</option>
                </Select>
                <Select placeholder="Sub Category" size="sm" maxW="140px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Leakage</option><option>Noise</option><option>Broken</option>
                </Select>
                <Select placeholder="Assigned To" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Admin</option><option>Manager</option><option>Staff</option>
                </Select>
                <Select placeholder="Raised By" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Tenant</option><option>Staff</option><option>Admin</option>
                </Select>
            </Flex>

            {/* Active filter tags - like Rentok */}
            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                <Text fontSize="sm" fontWeight="600" color="brand.500">{loading ? "Loading..." : `${complaintsData.length} Results Found`}</Text>
                {activeFilters.map(f => (
                    <Badge key={f} px={2} py={0.5} borderRadius="full" fontSize="2xs" variant="outline" colorScheme="blue"
                        display="flex" alignItems="center" gap={1}>
                        {f} <Icon as={MdClose} boxSize={3} cursor="pointer" />
                    </Badge>
                ))}
                <Text fontSize="xs" color="brand.500" cursor="pointer" fontWeight="600" _hover={{ textDecor: 'underline' }} onClick={handleClearFilters}>Clear All</Text>
            </Flex>

            {/* Table - Rentok complaint columns */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Raised On</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Complaint</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Raised By</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Assigned To</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Unit</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Status</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={6} textAlign="center">Loading complaints...</Td></Tr>
                            ) : complaintsData.map((c) => (
                                <Tr key={c.id} _hover={{ bg: 'gray.50' }} cursor="pointer">
                                    <Td fontSize="sm">{new Date(c.createdAt).toLocaleDateString()}</Td>
                                    <Td>
                                        <Box>
                                            <Text fontWeight="500" fontSize="sm">{c.title || c.issue}</Text>
                                            <Text fontSize="xs" color="gray.500">{c.category || 'General'}</Text>
                                        </Box>
                                    </Td>
                                    <Td fontSize="sm">{c.tenant ? c.tenant.name : 'Unknown'}</Td>
                                    <Td fontSize="sm">{c.assignedTo || 'Unassigned'}</Td>
                                    <Td fontSize="sm">{c.tenant && c.tenant.room ? c.tenant.room.number : 'N/A'}</Td>
                                    <Td>
                                        <Menu>
                                            <MenuButton as={Badge} colorScheme={statusColor[c.status] || 'gray'} fontSize="2xs" px={2} py={0.5} borderRadius="full" cursor="pointer">
                                                {c.status} ▾
                                            </MenuButton>
                                            <MenuList zIndex={10}>
                                                <MenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c.id, 'New'); }}>New</MenuItem>
                                                <MenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c.id, 'In Progress'); }}>In Progress</MenuItem>
                                                <MenuItem onClick={(e) => { e.stopPropagation(); handleStatusUpdate(c.id, 'Resolved'); }}>Resolved</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>
        </DashboardLayout>
    );
}
