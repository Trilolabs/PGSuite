'use client';

import {
    Box, Flex, Text, Card, CardBody, Icon, HStack,
    VStack, Button, Select, Divider,
} from '@chakra-ui/react';
import {
    MdTrendingUp, MdPeople, MdBed, MdAccountBalance,
    MdApartment, MdAdd, MdVisibility, MdPersonAdd,
    MdPayments, MdReceipt, MdMoneyOff, MdShoppingCart,
    MdBookmarkAdded, MdMeetingRoom, MdDescription, MdShare,
    MdContentCopy, MdExpandMore,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import { tenants, rooms, collections, expenses, properties } from '@/data/mockData';

// Matching Rentok Home page exactly - scrollable stat cards with icons
const totalBeds = rooms.reduce((s, r) => s + r.beds, 0);
const occupiedBeds = rooms.reduce((s, r) => s + r.occupiedBeds, 0);
const totalCollection = collections.reduce((s, c) => s + c.amount, 0);
const totalDues = 45000; // mock dues
const totalExpenses = expenses.reduce((s, e) => s + e.amount, 0);

const statCards = [
    { label: "Today's Collection", value: `₹${(12500).toLocaleString('en-IN')}`, color: 'blue.500', icon: '💰' },
    { label: "February's Collection", value: `₹${totalCollection.toLocaleString('en-IN')}`, color: 'blue.500', icon: '💰' },
    { label: "February's Dues", value: `₹${totalDues.toLocaleString('en-IN')}`, color: 'red.500', icon: '📋' },
    { label: 'Total Dues', value: `₹${totalDues.toLocaleString('en-IN')}`, color: 'red.500', icon: '📋' },
    { label: "February's Expenses", value: `₹${totalExpenses.toLocaleString('en-IN')}`, color: 'orange.500', icon: '📄' },
    { label: 'Rent Defaulters', value: '3', color: 'red.600', icon: '🚨' },
    { label: 'Current Deposit', value: `₹${(85000).toLocaleString('en-IN')}`, color: 'blue.600', icon: '🏦' },
];

// Quick action buttons matching Rentok
const quickActions = [
    { label: 'Add Tenant', icon: MdPersonAdd, color: 'blue' },
    { label: 'Record Payment', icon: MdPayments, color: 'green' },
    { label: 'Add Booking', icon: MdBookmarkAdded, color: 'purple' },
    { label: 'Create Due', icon: MdReceipt, color: 'red' },
    { label: 'Add Expense', icon: MdShoppingCart, color: 'orange' },
    { label: 'Add Room', icon: MdMeetingRoom, color: 'teal' },
    { label: 'Reports', icon: MdDescription, color: 'cyan' },
    { label: 'Dues Package', icon: MdMoneyOff, color: 'pink' },
];

export default function HomePage() {
    const property = properties[0] || { name: 'Sunrise PG' };

    return (
        <DashboardLayout>
            {/* Header - matching Rentok */}
            <Flex justify="flex-start" align="center" mb={5} gap={3}>
                <Text fontSize="md" fontWeight="600">February 2026 summary for</Text>
                <Select size="sm" maxW="180px" variant="unstyled" color="blue.500" fontWeight="700" fontSize="md" iconSize="md">
                    <option>All 1 Properties</option>
                    <option>{property.name}</option>
                </Select>
            </Flex>

            {/* Stat Cards - scrollable like Rentok */}
            <Box overflowX="auto" mb={6} pb={2}>
                <Flex gap={3} minW="max-content">
                    {statCards.map((stat) => (
                        <Card key={stat.label} minW="165px" bg="white" borderRadius="xl" boxShadow="sm" flex="0 0 auto">
                            <CardBody py={3} px={4}>
                                <Flex justify="space-between" align="flex-start">
                                    <Box>
                                        <HStack spacing={1}>
                                            <Text fontSize="xl" fontWeight="800" color={stat.color}>{stat.value}</Text>
                                            <Icon as={MdTrendingUp} color="gray.300" boxSize={3} />
                                        </HStack>
                                        <Text fontSize="xs" color="gray.500" mt={1}>{stat.label}</Text>
                                    </Box>
                                    <Text fontSize="xl">{stat.icon}</Text>
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </Flex>
            </Box>

            {/* Dashboard label + Add New Property */}
            <Flex justify="space-between" align="center" mb={4}>
                <Text fontSize="md" fontWeight="700">Dashboard</Text>
                <HStack spacing={2}>
                    <Button colorScheme="blue" size="sm" borderRadius="lg" fontWeight="500">
                        Add New Property
                    </Button>
                    <Button variant="outline" size="sm" borderRadius="lg" p={2}>
                        <Icon as={MdVisibility} />
                    </Button>
                </HStack>
            </Flex>

            {/* Property Card - matching Rentok */}
            <Box overflowX="auto" mb={5} pb={2}>
                <Card maxW="350px" bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                    <CardBody p={4}>
                        <Flex justify="space-between" align="center" mb={3}>
                            <HStack spacing={2}>
                                <Text fontWeight="700" fontSize="md">{property.name}</Text>
                                <Box bg="blue.50" borderRadius="full" p={1}>
                                    <Icon as={MdApartment} color="blue.500" boxSize={4} />
                                </Box>
                            </HStack>
                            <Text fontSize="xs" color="blue.500" bg="blue.50" px={2} py={0.5} borderRadius="full" fontWeight="600">Current</Text>
                        </Flex>
                        <Flex justify="space-between" mb={3}>
                            <Text fontSize="sm" color="gray.500">{rooms.length} Rooms</Text>
                            <Text fontSize="sm" color="gray.500">{totalBeds} Beds</Text>
                        </Flex>
                        <HStack mb={2}>
                            <Text fontSize="xs" color="gray.500">5000724104A</Text>
                            <Icon as={MdContentCopy} boxSize={3} color="gray.400" cursor="pointer" />
                        </HStack>
                        <Divider mb={3} />
                        <VStack align="stretch" spacing={2}>
                            <Flex justify="space-between">
                                <HStack spacing={2}><Text fontSize="sm">🛏️</Text><Text fontSize="sm" color="gray.600">Occupied Beds</Text></HStack>
                                <Text fontSize="sm" fontWeight="600">{occupiedBeds}</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <HStack spacing={2}><Text fontSize="sm">👥</Text><Text fontSize="sm" color="gray.600">Active Tenants</Text></HStack>
                                <Text fontSize="sm" fontWeight="600">{tenants.length}</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <HStack spacing={2}><Text fontSize="sm">🚨</Text><Text fontSize="sm" color="gray.600">Under Notice</Text></HStack>
                                <Text fontSize="sm" fontWeight="600">0</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <HStack spacing={2}><Text fontSize="sm">💸</Text><Text fontSize="sm" color="gray.600">Pending Dues</Text></HStack>
                                <Text fontSize="sm" fontWeight="600">₹{totalDues.toLocaleString('en-IN')}</Text>
                            </Flex>
                            <Flex justify="space-between">
                                <HStack spacing={2}><Text fontSize="sm">✅</Text><Text fontSize="sm" color="gray.600">Collection</Text></HStack>
                                <Text fontSize="sm" fontWeight="600">₹{totalCollection.toLocaleString('en-IN')}</Text>
                            </Flex>
                        </VStack>
                        <Button variant="link" color="blue.500" size="sm" mt={2} rightIcon={<MdExpandMore />} fontWeight="500">
                            View More
                        </Button>
                        <Button colorScheme="blue" size="sm" borderRadius="lg" w="100%" mt={3} leftIcon={<MdShare />} fontWeight="500">
                            Share Website
                        </Button>
                    </CardBody>
                </Card>
            </Box>

            {/* Quick Actions - matching Rentok */}
            <Text fontSize="md" fontWeight="700" mb={3}>Quick Actions</Text>
            <Flex gap={4} overflowX="auto" pb={4}>
                {quickActions.map((action) => (
                    <VStack key={action.label} spacing={2} cursor="pointer" minW="70px">
                        <Flex w={14} h={14} bg={`${action.color}.50`} borderRadius="2xl"
                            align="center" justify="center" _hover={{ bg: `${action.color}.100` }} transition="all 0.2s">
                            <Icon as={action.icon} boxSize={6} color={`${action.color}.500`} />
                        </Flex>
                        <Text fontSize="xs" color="gray.600" textAlign="center" whiteSpace="nowrap">{action.label}</Text>
                    </VStack>
                ))}
            </Flex>
        </DashboardLayout>
    );
}
