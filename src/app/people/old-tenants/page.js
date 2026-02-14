'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,
    IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar,
} from '@chakra-ui/react';
import { MdSearch, MdMoreVert } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';


export default function OldTenantsPage() {
    const [oldTenantsData, setOldTenantsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchOldTenants = async () => {
            try {
                const res = await fetch('/api/old-tenants');
                const data = await res.json();
                setOldTenantsData(data);
            } catch (error) {
                console.error("Failed to fetch old tenants:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchOldTenants();
    }, []);

    return (
        <DashboardLayout>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Old Tenants</Text>
            </Flex>

            {/* Search */}
            <InputGroup size="sm" mb={4}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search old tenants..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Filters */}
            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                <Select placeholder="Settlement Status" size="sm" maxW="160px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Fully Settled</option><option>Pending Settlement</option>
                </Select>
                <Select placeholder="Leaving Date" size="sm" maxW="140px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Month</option><option>Last Month</option><option>Last 3 Months</option><option>Last 6 Months</option>
                </Select>
                <Select placeholder="Property" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Sunrise PG</option><option>Green Valley PG</option>
                </Select>
            </Flex>

            {/* Results count */}
            <Text fontSize="sm" fontWeight="600" color="brand.500" mb={3}>{loading ? "Loading..." : `${oldTenantsData.length} Results Found`}</Text>

            {/* Table */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Name</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Room</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Moved In</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Moved Out</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Pending Amount</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Settlement</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading old tenants...</Td></Tr>
                            ) : oldTenantsData.map((t) => (
                                <Tr key={t.id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <HStack>
                                            <Avatar size="xs" name={t.name} bg="gray.400" color="white" />
                                            <Box>
                                                <Text fontWeight="500" fontSize="sm">{t.name}</Text>
                                                <Text fontSize="xs" color="gray.500">+91 {t.phone || '—'}</Text>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td fontSize="sm">{t.roomNumber}</Td>
                                    <Td fontSize="sm">{t.moveInDate ? new Date(t.moveInDate).toLocaleDateString() : '—'}</Td>
                                    <Td fontSize="sm">{t.moveOutDate ? new Date(t.moveOutDate).toLocaleDateString() : '—'}</Td>
                                    <Td fontSize="sm" fontWeight="600" color={t.pendingDues > 0 ? 'red.500' : 'green.500'}>
                                        ₹{(t.pendingDues || 0).toLocaleString('en-IN')}
                                    </Td>
                                    <Td>
                                        <Badge colorScheme={t.pendingDues <= 0 ? 'green' : 'orange'} fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                            {t.pendingDues <= 0 ? 'Fully Settled' : 'Pending Settlement'}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Menu>
                                            <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" />
                                            <MenuList fontSize="sm" minW="160px">
                                                <MenuItem>View Details</MenuItem>
                                                <MenuItem>Settlement Details</MenuItem>
                                                <MenuItem>Download Receipt</MenuItem>
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
