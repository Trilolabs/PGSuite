'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,
    IconButton, Menu, MenuButton, MenuList, MenuItem, Avatar, Switch, FormLabel,
} from '@chakra-ui/react';
import { MdSearch, MdAdd, MdMoreVert, MdFacebook } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';



const statusColor = { New: 'blue', 'Follow Up': 'red', Converted: 'green', 'Visit Done': 'green', 'Call Pending': 'purple', Junk: 'gray' };

export default function LeadsPage() {
    const [leadsData, setLeadsData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await fetch('/api/leads');
                const data = await res.json();
                setLeadsData(data);
            } catch (error) {
                console.error("Failed to fetch leads:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, []);

    const statCards = [
        { label: 'Total Leads', value: leadsData.length, color: 'blue.500', icon: '👤' },
        { label: 'Follow Up Leads', value: leadsData.filter(l => l.status === 'Follow Up').length, color: 'red.500', icon: '🔴' },
        { label: 'Converted Leads', value: leadsData.filter(l => l.status === 'Converted').length, color: 'orange.500', icon: '🟠' },
        { label: 'Visits Done', value: leadsData.filter(l => l.status === 'Visit Done').length, color: 'green.500', icon: '🟢' },
        { label: 'Call Pending', value: leadsData.filter(l => l.status === 'Call Pending').length, color: 'purple.500', icon: '📞' },
        { label: 'Junk Leads', value: leadsData.filter(l => l.status === 'Junk').length, color: 'red.600', icon: '🔴' },
        { label: 'Token Paid', value: 0, color: 'red.400', icon: '🚫' }, // Need to implement token logic if applicable
    ];

    return (
        <DashboardLayout>
            {/* Header - matching Rentok Leads page exactly */}
            <Flex justify="space-between" align="center" mb={4}>
                <HStack spacing={3}>
                    <Button leftIcon={<MdFacebook />} colorScheme="blue" size="sm" borderRadius="lg" fontWeight="500">
                        Connect Meta Page
                    </Button>
                    <Text fontSize="xl" fontWeight="700">Leads</Text>
                </HStack>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500" variant="outline">
                    Add a Lead
                </Button>
            </Flex>

            {/* Toggle */}
            <HStack mb={5}>
                <FormLabel fontSize="sm" mb={0}>Show summary of all properties</FormLabel>
                <Switch size="sm" colorScheme="blue" defaultChecked />
            </HStack>

            {/* Stat Cards - scrollable like Rentok */}
            <Box overflowX="auto" mb={5} pb={2} css={{ '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: '3px' } }}>
                <Flex gap={3} minW="max-content">
                    {statCards.map((stat) => (
                        <Card key={stat.label} minW="150px" bg="white" borderRadius="xl" boxShadow="sm" flex="0 0 auto">
                            <CardBody py={3} px={4}>
                                <Flex justify="space-between" align="flex-start">
                                    <Box>
                                        <Text fontSize="2xl" fontWeight="800" color={stat.color}>{stat.value}</Text>
                                        <Text fontSize="xs" color="gray.600" mt={1}>{stat.label}</Text>
                                    </Box>
                                    <Text fontSize="xl">{stat.icon}</Text>
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </Flex>
            </Box>

            {/* Search */}
            <InputGroup size="sm" mb={4}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search your Leads..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Filters - matching Rentok Leads page exactly */}
            <Flex gap={2} mb={4} flexWrap="wrap" align="center">
                <Select placeholder="Property" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Sunrise PG</option><option>Green Valley PG</option>
                </Select>
                <Select placeholder="Token Paid" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Yes</option><option>No</option>
                </Select>
                <Select placeholder="Gender" size="sm" maxW="110px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Male</option><option>Female</option>
                </Select>
                <Select placeholder="Room Type" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>AC</option><option>Non AC</option>
                </Select>
                <Select placeholder="Facilities" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>AC</option><option>WiFi</option><option>TV</option>
                </Select>
                <Select placeholder="Rent Range" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>₹5k-₹8k</option><option>₹8k-₹12k</option><option>₹12k+</option>
                </Select>
                <Select placeholder="Visit Type" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Physical</option><option>Video Tour</option>
                </Select>
                <Select placeholder="Visit Date" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Today</option><option>This Week</option><option>This Month</option>
                </Select>
                <Select placeholder="Added On" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>This Week</option><option>This Month</option>
                </Select>
                <Select placeholder="Added By" size="sm" maxW="120px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Admin</option><option>Manager</option>
                </Select>
                <Select placeholder="Lead Status" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>New</option><option>Follow Up</option><option>Converted</option><option>Junk</option>
                </Select>
                <Select placeholder="Lead Source" size="sm" maxW="130px" borderRadius="full" bg="white" fontSize="xs">
                    <option>Website</option><option>Walk-in</option><option>Facebook</option><option>Instagram</option><option>Referral</option>
                </Select>
            </Flex>

            {/* Results count */}
            <Text fontSize="sm" fontWeight="600" color="brand.500" mb={3}>{loading ? "Loading..." : `${leadsData.length} Results Found`}</Text>

            {/* Table - matching Rentok Leads columns exactly */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Added On</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Name</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Budget</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Sharing</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Facilities</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Lead Status</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Source</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading leads...</Td></Tr>
                            ) : leadsData.map((lead) => (
                                <Tr key={lead.id} _hover={{ bg: 'gray.50' }} cursor="pointer">
                                    <Td fontSize="sm">{new Date(lead.createdAt).toLocaleDateString()}</Td>
                                    <Td>
                                        <HStack>
                                            <Avatar size="xs" name={lead.name} bg="brand.500" color="white" />
                                            <Box>
                                                <Text fontWeight="500" fontSize="sm">{lead.name}</Text>
                                                <Text fontSize="xs" color="gray.500">{lead.phone}</Text>
                                            </Box>
                                        </HStack>
                                    </Td>
                                    <Td fontSize="sm">{lead.budget || '—'}</Td>
                                    <Td fontSize="sm">{lead.sharing || '—'}</Td>
                                    <Td fontSize="sm">{lead.facilities || '—'}</Td>
                                    <Td>
                                        <Badge colorScheme={statusColor[lead.status] || 'gray'} fontSize="2xs" px={2} py={0.5} borderRadius="full">{lead.status}</Badge>
                                    </Td>
                                    <Td fontSize="sm">{lead.source || 'Website'}</Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>
        </DashboardLayout>
    );
}
