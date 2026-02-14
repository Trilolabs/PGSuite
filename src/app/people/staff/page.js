'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Button, HStack, Input, InputGroup, InputLeftElement, Icon, Avatar,

    IconButton, useToast,
} from '@chakra-ui/react';
import { MdSearch, MdAdd, MdHistory } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';



export default function StaffPage() {
    const [staffData, setStaffData] = useState([]);
    const [loading, setLoading] = useState(true);
    const toast = useToast();

    useEffect(() => {
        const fetchStaff = async () => {
            try {
                const res = await fetch('/api/staff');
                const data = await res.json();
                setStaffData(data);
            } catch (error) {
                console.error("Failed to fetch staff:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStaff();
    }, []);

    const handleAddMember = () => {
        toast({
            title: "Add Team Member",
            description: "Team management feature coming soon.",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleViewLogs = (member) => {
        toast({
            title: "Activity Logs",
            description: `Viewing activity logs for ${member.name}`,
            status: "info",
            duration: 2000,
            isClosable: true,
        });
    };

    return (
        <DashboardLayout>
            {/* Header - matching Rentok "Team" page */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Team</Text>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500" onClick={handleAddMember}>
                    Add Team Member
                </Button>
            </Flex>

            {/* Search */}
            <InputGroup size="sm" mb={4}>
                <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                <Input placeholder="Search team members..." borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
            </InputGroup>

            {/* Results count */}
            <Text fontSize="sm" fontWeight="600" color="brand.500" mb={3}>{loading ? "Loading..." : `${staffData.length} Results Found`}</Text>

            {/* Table - matching Rentok Team columns exactly */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="blue.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Name</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Designation</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Number of Properties</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Activity Logs</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={4} textAlign="center">Loading team...</Td></Tr>
                            ) : staffData.map((m) => (
                                <Tr key={m.id} _hover={{ bg: 'gray.50' }}>
                                    <Td>
                                        <HStack>
                                            <Avatar size="sm" name={m.name} bg="blue.500" color="white" />
                                            <Text fontWeight="500" fontSize="sm">{m.name}</Text>
                                        </HStack>
                                    </Td>
                                    <Td fontSize="sm">{m.role || m.designation}</Td>
                                    <Td fontSize="sm" color="brand.500" fontWeight="600">{m.propertiesCount || 0}</Td>
                                    <Td>
                                        <IconButton icon={<MdHistory />} size="xs" variant="ghost" colorScheme="blue" aria-label="Activity Logs" onClick={() => handleViewLogs(m)} />
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
