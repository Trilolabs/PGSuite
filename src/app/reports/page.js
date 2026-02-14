'use client';

import {
    Box, Flex, Text, Card, CardBody, SimpleGrid, Button, Input, InputGroup,
    InputLeftElement, Icon, VStack, HStack, IconButton, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import { MdSearch, MdDownload, MdHistory, MdCheck, MdMoreVert, MdSchedule } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

// Matching Rentok Reports page exactly - report cards with feature lists
const reports = [
    {
        name: 'All tenant ledger report',
        icon: '📊',
        color: 'blue',
        features: [
            'Tenant, Room No & DOJ',
            'Monthly Rent Amount',
            'Invoice Amount',
            'Invoice Collected',
            'Total unpaid',
            'Total paid',
        ],
    },
    {
        name: 'Detailed Tenant Report',
        icon: '📊',
        color: 'blue',
        features: [
            'List of Tenant & Rooms',
            'Tenant KYC Details',
            'Unpaid Dues',
            'Collected Amount',
            'Remarks & Descriptions',
        ],
    },
    {
        name: 'All Bookings Report',
        icon: '📊',
        color: 'blue',
        features: [
            'List of Tenant & Rooms',
            'Tenant KYC Details',
            'Unpaid Dues',
            'Collected Amount',
            'Remarks & Descriptions',
        ],
    },
    {
        name: 'Tenant Report',
        icon: '📊',
        color: 'green',
        features: [
            'List of Tenant & Rooms',
            'Tenant KYC Details',
            'Unpaid Dues',
            'Collected Amount',
            'Remarks & Descriptions',
        ],
    },
    {
        name: 'Dues PDF',
        icon: '📄',
        color: 'red',
        features: [
            'Tenant & Room No.',
            'Unpaid Dues Amount',
            'Dues Category',
            'Descriptions',
        ],
    },
    {
        name: 'Dues Report',
        icon: '📊',
        color: 'blue',
        features: [
            'Tenant & Room No.',
            'Unpaid Dues Amount',
            'Active Discounts',
            'Dues Category',
            'Remarks & Descriptions',
        ],
    },
];

export default function ReportsPage() {
    return (
        <DashboardLayout>
            {/* Header - matching Rentok */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Reports</Text>
                <Button variant="outline" colorScheme="blue" size="sm" borderRadius="lg" fontWeight="500" leftIcon={<MdSchedule />}>
                    View Scheduled Reports
                </Button>
            </Flex>

            {/* Search */}
            <InputGroup size="sm" mb={5}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search reports..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Report Cards - 3 column grid matching Rentok */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {reports.map((report) => (
                    <Card key={report.name} bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                        <CardBody p={5}>
                            <Flex justify="space-between" align="flex-start" mb={3}>
                                <HStack spacing={2}>
                                    <Text fontSize="lg">{report.icon}</Text>
                                    <Text fontWeight="700" fontSize="md">{report.name}</Text>
                                </HStack>
                                <Menu>
                                    <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" />
                                    <MenuList fontSize="sm" minW="120px">
                                        <MenuItem>Share</MenuItem>
                                        <MenuItem>Schedule</MenuItem>
                                    </MenuList>
                                </Menu>
                            </Flex>
                            <VStack align="stretch" spacing={1.5} mb={4}>
                                {report.features.map((feature, idx) => (
                                    <HStack key={idx} spacing={2}>
                                        <Icon as={MdCheck} color="green.500" boxSize={4} />
                                        <Text fontSize="sm" color="gray.600">{feature}</Text>
                                    </HStack>
                                ))}
                            </VStack>
                            <Flex gap={3}>
                                <Button colorScheme="blue" size="sm" borderRadius="lg" flex="1" fontWeight="500">
                                    Generate Report
                                </Button>
                                <Button variant="outline" colorScheme="blue" size="sm" borderRadius="lg" flex="1" fontWeight="500">
                                    View Past Reports
                                </Button>
                            </Flex>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>
        </DashboardLayout>
    );
}
