'use client';

import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Button, HStack, IconButton, Menu, MenuButton, MenuList, MenuItem,
} from '@chakra-ui/react';
import { MdAdd, MdSearch, MdMoreVert } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

// Matching Rentok Tasks page exactly - "Task Templates" with table
const mockTemplates = [
    { id: 1, name: 'Daily Room Cleaning', description: 'Ensure rooms are cleaned daily', questions: 5, status: 'Active' },
    { id: 2, name: 'Monthly Maintenance Check', description: 'Check all electrical and plumbing', questions: 8, status: 'Active' },
    { id: 3, name: 'Weekly Pest Control', description: 'Spray common areas weekly', questions: 3, status: 'Inactive' },
];

export default function TasksPage() {
    return (
        <DashboardLayout>
            {/* Header - matching Rentok exactly */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Task Templates</Text>
                <HStack spacing={3}>
                    <Button variant="outline" size="sm" leftIcon={<MdSearch />} borderRadius="lg" colorScheme="blue" fontWeight="500">
                        Explore Library
                    </Button>
                    <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" fontWeight="500">
                        Create Template
                    </Button>
                </HStack>
            </Flex>

            {/* Table - matching Rentok Task Templates columns exactly */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.100">
                            <Tr>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Template Name</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Description</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Questions</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Status</Th>
                                <Th fontSize="xs" color="gray.600" textTransform="uppercase" fontWeight="700">Actions</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {mockTemplates.length === 0 ? (
                                <Tr>
                                    <Td colSpan={5} textAlign="center" py={10}>
                                        <Text color="blue.400" fontSize="sm">No templates found. Create one or explore the library.</Text>
                                    </Td>
                                </Tr>
                            ) : (
                                mockTemplates.map((t) => (
                                    <Tr key={t.id} _hover={{ bg: 'gray.50' }}>
                                        <Td fontWeight="500" fontSize="sm">{t.name}</Td>
                                        <Td fontSize="sm" color="gray.600">{t.description}</Td>
                                        <Td fontSize="sm">{t.questions}</Td>
                                        <Td fontSize="sm">{t.status}</Td>
                                        <Td>
                                            <Menu>
                                                <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" />
                                                <MenuList fontSize="sm" minW="140px">
                                                    <MenuItem>Edit</MenuItem>
                                                    <MenuItem>Duplicate</MenuItem>
                                                    <MenuItem color="red.500">Delete</MenuItem>
                                                </MenuList>
                                            </Menu>
                                        </Td>
                                    </Tr>
                                ))
                            )}
                        </Tbody>
                    </Table>
                </Box>
            </Card>
        </DashboardLayout>
    );
}
