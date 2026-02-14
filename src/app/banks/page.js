'use client';

import {
    Box, Flex, Text, Card, CardBody, Input, InputGroup, InputLeftElement, Icon, Button,
} from '@chakra-ui/react';
import { MdSearch, MdAdd } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

// Matching Rentok Banks page exactly
const statCards = [
    { label: 'Total Banks', value: 1, color: 'blue.500' },
    { label: 'Active Banks', value: 1, color: 'green.500' },
    { label: 'VPA', value: 0, color: 'purple.500' },
    { label: 'Banks', value: 1, color: 'blue.600' },
];

export default function BanksPage() {
    return (
        <DashboardLayout>
            {/* Header - matching Rentok */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Banks</Text>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500" variant="outline">
                    Add a bank
                </Button>
            </Flex>

            {/* Stat Cards - scrollable like Rentok */}
            <Box overflowX="auto" mb={5} pb={2}>
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

            {/* Search - matching Rentok */}
            <InputGroup size="sm" mb={4}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search banks..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>
        </DashboardLayout>
    );
}
