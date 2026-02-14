'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,
    IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar,
    useToast,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';
import { MdSearch, MdMoreVert, MdPersonAdd, MdCampaign, MdArrowDropDown } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import SettlementModal from '@/components/SettlementModal';


// Stat card data matching Rentok exactly
const getStatCards = (tenants) => {
    const total = tenants.length;
    const newTenants = tenants.filter(t => t.moveIn >= '2026-02-01').length;
    const underNotice = tenants.filter(t => t.appStatus === 'Inactive' || t.status === 'Notice').length;
    const joiningRequests = 0;
    const contactNotAdded = tenants.filter(t => !t.phone).length;
    const notOnApp = tenants.filter(t => t.appStatus !== 'Active').length;

    return [
        { label: 'Total Tenants', value: total, color: 'blue.500', icon: '👤' },
        { label: 'New Tenants', value: newTenants, color: 'green.500', icon: '👤' },
        { label: 'Under Notice', value: underNotice, color: 'red.500', icon: '👤' },
        { label: 'Joining Requests', value: joiningRequests, color: 'red.500', icon: '👤' },
        { label: 'Contact Not Added', value: contactNotAdded, color: 'orange.500', icon: '👤' },
        { label: 'Not on App', value: notOnApp, color: 'red.500', icon: '👤' },
    ];
};

const kycColor = { Verified: 'green', Pending: 'orange', Rejected: 'red' };

export default function TenantsPage() {
    const [tenantsData, setTenantsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTenant, setSelectedTenant] = useState(null);
    const [isSettlementModalOpen, setIsSettlementModalOpen] = useState(false);
    const router = useRouter();
    const toast = useToast();

    const fetchTenants = async () => {
        try {
            // setLoading(true); // Optional: keep loading specific if needed, or just refresh silently
            const res = await fetch('/api/tenants');
            const data = await res.json();
            setTenantsData(data);
        } catch (error) {
            console.error("Failed to fetch tenants:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        fetchTenants();
    }, []);

    const handleAddTenant = () => {
        router.push('/people/add-tenant');
    };

    const handleAnnouncement = () => {
        toast({
            title: "Announcements",
            description: "Announcement feature coming soon!",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleBuyCredits = () => {
        toast({
            title: "Buy Credits",
            description: "KYC Credit purchase flow coming soon.",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleRowClick = (tenant) => {
        toast({
            title: "View Profile",
            description: `Navigating to profile of ${tenant.name}`,
            status: "info",
            duration: 2000,
            isClosable: true,
        });
        // router.push(`/people/tenants/${tenant.id}`); 
    };

    const handleMenuAction = (action, tenant, e) => {
        e.stopPropagation();

        if (action === 'Move Out') {
            setSelectedTenant(tenant);
            setIsSettlementModalOpen(true);
            return;
        }

        toast({
            title: action,
            description: `Action '${action}' performed on ${tenant.name}`,
            status: "success",
            duration: 2000,
            isClosable: true,
        });
    };

    const stats = getStatCards(tenantsData);

    return (
        <DashboardLayout>
            {/* Page Header */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Tenants</Text>
                <HStack spacing={3}>
                    <Button variant="outline" size="sm" leftIcon={<MdCampaign />} borderRadius="lg" colorScheme="blue" fontWeight="500" onClick={handleAnnouncement}>
                        Announcements
                    </Button>
                    <Button colorScheme="blue" size="sm" leftIcon={<MdPersonAdd />} borderRadius="lg" fontWeight="500" onClick={handleAddTenant}>
                        Add Tenant
                    </Button>
                </HStack>
            </Flex>

            {/* Stat Cards - Horizontal scrollable like Rentok */}
            <Box overflowX="auto" mb={5} pb={2} css={{ '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: '3px' } }}>
                <Flex gap={3} minW="max-content">
                    {stats.map((stat) => (
                        <Card key={stat.label} minW="150px" bg="white" borderRadius="xl" boxShadow="sm" flex="0 0 auto">
                            <CardBody py={3} px={4}>
                                <Text fontSize="2xl" fontWeight="800" color={stat.color}>{stat.value}</Text>
                                <Text fontSize="xs" color="gray.600" mt={1}>{stat.label}</Text>
                            </CardBody>
                        </Card>
                    ))}
                </Flex>
            </Box>

            {/* Search + KYC Credits */}
            <Flex gap={3} mb={4} align="center">
                <InputGroup flex="1" size="sm">
                    <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search your tenants..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
                </InputGroup>
                <HStack bg="white" px={3} py={1.5} borderRadius="full" border="1px solid" borderColor="gray.200" spacing={2}>
                    <Text fontSize="xs">🛡️</Text>
                    <Text fontSize="xs" fontWeight="600" whiteSpace="nowrap">KYC Credits left: <Text as="span" color="brand.500">5</Text></Text>
                    <Button size="xs" variant="outline" colorScheme="blue" borderRadius="full" fontSize="xs" onClick={handleBuyCredits}>Buy More</Button>
                </HStack>
            </Flex>

            {/* Filters - matching Rentok's exact filter bar */}
            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                <Select placeholder="App Status" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Active</option><option>Inactive</option>
                </Select>
                <Select placeholder="KYC Status" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Verified</option><option>Pending</option><option>Rejected</option>
                </Select>
                <Select placeholder="Tenant Status" size="sm" maxW="140px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Active</option><option>Under Notice</option><option>Moved Out</option>
                </Select>
                <Select placeholder="Stay Type" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Long Stay</option><option>Short Stay</option>
                </Select>
                <Select placeholder="Move In Date" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Month</option><option>Last Month</option><option>Last 3 Months</option>
                </Select>
                <Select placeholder="Created At" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Week</option><option>This Month</option>
                </Select>
                <Select placeholder="Move-Out In" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Month</option><option>Next Month</option>
                </Select>
                <Select placeholder="Eviction In" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Month</option><option>Next Month</option>
                </Select>
                <Select placeholder="Agreement Renewal In" size="sm" maxW="185px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Month</option><option>Next Month</option>
                </Select>
                <Select placeholder="Gender" size="sm" maxW="110px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Male</option><option>Female</option>
                </Select>
                <Select placeholder="Eqaro" size="sm" maxW="100px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Yes</option><option>No</option>
                </Select>
            </Flex>

            {/* Results count */}
            <Text fontSize="sm" fontWeight="600" color="brand.500" mb={3}>{loading ? 'Loading...' : `${tenantsData.length} Results Found`}</Text>

            {/* Table - matching Rentok's exact columns */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Name</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Room</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Rent</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Date of Joining</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Check Out Date</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Status</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center" py={4}>Loading tenants...</Td></Tr>
                            ) : tenantsData.length === 0 ? (
                                <Tr><Td colSpan={7} textAlign="center" py={4}>No tenants found</Td></Tr>
                            ) : tenantsData.map((t) => (
                                <Tr key={t.id} _hover={{ bg: 'gray.50' }} cursor="pointer" onClick={() => handleRowClick(t)}>
                                    <Td>
                                        <HStack>
                                            <Avatar size="xs" name={t.name} bg="brand.500" color="white" />
                                            <Box>
                                                <Text fontWeight="500" fontSize="sm">{t.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{t.phone}</Text>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td fontSize="sm">{t.room ? t.room.number : 'N/A'}{t.bed ? `-${t.bed}` : ''}</Td>
                                    <Td fontWeight="600" fontSize="sm">₹{t.rent.toLocaleString('en-IN')}</Td>
                                    <Td fontSize="sm">{t.moveIn}</Td>
                                    <Td fontSize="sm" color="gray.500">—</Td>
                                    <Td>
                                        <Badge colorScheme={kycColor[t.kycStatus] || 'gray'} fontSize="2xs" px={2} py={0.5} borderRadius="full">{t.kycStatus || 'Pending'}</Badge>
                                    </Td>
                                    <Td>
                                        <Menu>
                                            <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" onClick={(e) => e.stopPropagation()} />
                                            <MenuList fontSize="sm" minW="180px">
                                                <MenuItem onClick={(e) => handleMenuAction('View Profile', t, e)}>View Profile</MenuItem>
                                                <MenuItem onClick={(e) => handleMenuAction('Edit Details', t, e)}>Edit Details</MenuItem>
                                                <MenuItem onClick={(e) => handleMenuAction('Collect Dues', t, e)}>Collect Dues</MenuItem>
                                                <MenuItem onClick={(e) => handleMenuAction('Generate Bill', t, e)}>Generate Bill</MenuItem>
                                                <MenuItem onClick={(e) => handleMenuAction('Send Reminder', t, e)}>Send Reminder</MenuItem>
                                                <MenuItem onClick={(e) => handleMenuAction('Renew Agreement', t, e)}>Renew Agreement</MenuItem>
                                                <MenuItem color="red.500" onClick={(e) => handleMenuAction('Move Out', t, e)}>Move Out</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <SettlementModal
                isOpen={isSettlementModalOpen}
                onClose={() => setIsSettlementModalOpen(false)}
                tenant={selectedTenant}
                onSettled={fetchTenants}
            />
        </DashboardLayout>
    );
}
