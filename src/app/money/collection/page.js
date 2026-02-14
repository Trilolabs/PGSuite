'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,
} from '@chakra-ui/react';
import { MdSearch, MdDownload, MdAdd } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import RecordPaymentModal from '@/components/RecordPaymentModal';


const modeColor = { UPI: 'blue', Cash: 'green', 'Bank Transfer': 'purple' };

export default function CollectionPage() {
    const [collectionsData, setCollectionsData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [tenants, setTenants] = useState([]);

    useEffect(() => {
        const fetchCollections = async () => {
            try {
                const res = await fetch('/api/collections');
                const data = await res.json();
                setCollectionsData(data);
            } catch (error) {
                console.error("Failed to fetch collections:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchTenants = async () => {
            try {
                const res = await fetch('/api/tenants'); // Assuming this endpoint exists and returns all tenants
                const data = await res.json();
                setTenants(data);
            } catch (error) {
                console.error("Failed to fetch tenants:", error);
            }
        };

        fetchCollections();
        fetchTenants();
    }, []);

    const totalCollection = collectionsData.reduce((s, c) => s + (c.amount || 0), 0);

    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="xl" fontWeight="700">Collection</Text>
                <HStack>
                    <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" onClick={() => setIsPaymentModalOpen(true)}>Record Payment</Button>
                    <Button variant="outline" size="sm" leftIcon={<MdDownload />} borderRadius="lg" colorScheme="blue">Export</Button>
                </HStack>
            </Flex>

            {/* Summary */}
            <Flex gap={4} mb={6}>
                <Card minW="200px" bg="white" borderRadius="xl" boxShadow="sm">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">Total Collected</Text>
                        <Text fontSize="2xl" fontWeight="800" color="green.500">₹{totalCollection.toLocaleString('en-IN')}</Text>
                        <Text fontSize="xs" color="gray.400">{collectionsData.length} transactions</Text>
                    </CardBody>
                </Card>
                <Card minW="200px" bg="white" borderRadius="xl" boxShadow="sm">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">UPI</Text>
                        <Text fontSize="2xl" fontWeight="800" color="blue.500">
                            ₹{collectionsData.filter(c => c.mode === 'UPI').reduce((s, c) => s + (c.amount || 0), 0).toLocaleString('en-IN')}
                        </Text>
                    </CardBody>
                </Card>
                <Card minW="200px" bg="white" borderRadius="xl" boxShadow="sm">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">Cash</Text>
                        <Text fontSize="2xl" fontWeight="800" color="green.600">
                            ₹{collectionsData.filter(c => c.mode === 'Cash').reduce((s, c) => s + (c.amount || 0), 0).toLocaleString('en-IN')}
                        </Text>
                    </CardBody>
                </Card>
            </Flex>

            {/* Filters */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" mb={4}>
                <CardBody py={3}>
                    <HStack spacing={3}>
                        <InputGroup maxW="250px" size="sm">
                            <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                            <Input placeholder="Search tenant..." borderRadius="lg" />
                        </InputGroup>
                        <Select placeholder="Payment Mode" size="sm" maxW="160px" borderRadius="lg">
                            <option>UPI</option><option>Cash</option><option>Bank Transfer</option>
                        </Select>
                        <Select placeholder="Received By" size="sm" maxW="160px" borderRadius="lg">
                            <option>Admin</option><option>Manager</option>
                        </Select>
                        <Input type="date" size="sm" maxW="160px" borderRadius="lg" />
                    </HStack>
                </CardBody>
            </Card>

            {/* Table */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.500">Date</Th>
                                <Th fontSize="xs" color="gray.500">Tenant</Th>
                                <Th fontSize="xs" color="gray.500">Room</Th>
                                <Th fontSize="xs" color="gray.500">Amount</Th>
                                <Th fontSize="xs" color="gray.500">Mode</Th>
                                <Th fontSize="xs" color="gray.500">Received By</Th>
                                <Th fontSize="xs" color="gray.500">Receipt</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading collections...</Td></Tr>
                            ) : collectionsData.map((c) => (
                                <Tr key={c.id} _hover={{ bg: 'gray.50' }}>
                                    <Td fontSize="sm">{new Date(c.createdAt).toLocaleDateString()}</Td>
                                    <Td fontWeight="500" fontSize="sm">{c.tenantName || '—'}</Td>
                                    <Td fontSize="sm">{c.roomNumber || '—'}</Td>
                                    <Td fontWeight="600" fontSize="sm" color="green.600">₹{(c.amount || 0).toLocaleString('en-IN')}</Td>
                                    <Td><Badge colorScheme={modeColor[c.mode] || 'gray'} fontSize="2xs">{c.mode}</Badge></Td>
                                    <Td fontSize="sm">{c.receivedBy || 'Admin'}</Td>
                                    <Td fontSize="sm" color="brand.500" cursor="pointer" fontWeight="500">{c.receipt || '—'}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                onPaymentRecorded={() => window.location.reload()} // Simple reload or refetch
                tenants={tenants}
            />
        </DashboardLayout>
    );
}
