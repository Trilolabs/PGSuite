'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, InputGroup, InputLeftElement, Icon,
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter,
    ModalCloseButton, useDisclosure, FormControl, FormLabel, Textarea,
} from '@chakra-ui/react';
import { MdSearch, MdAdd, MdDownload, MdReceipt } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';


const categoryColor = { Salary: 'blue', Rent: 'purple', Food: 'green', Maintenance: 'orange', Electricity: 'yellow', Others: 'gray' };

export default function ExpensePage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [expensesData, setExpensesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await fetch('/api/expenses');
                const data = await res.json();
                setExpensesData(data);
            } catch (error) {
                console.error("Failed to fetch expenses:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, []);

    const totalExpense = expensesData.reduce((s, e) => s + (e.amount || 0), 0);
    const categories = [...new Set(expensesData.map(e => e.category))];
    const catTotals = categories.map(cat => ({
        name: cat,
        total: expensesData.filter(e => e.category === cat).reduce((s, e) => s + (e.amount || 0), 0),
        count: expensesData.filter(e => e.category === cat).length,
    }));

    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="xl" fontWeight="700">Expense</Text>
                <HStack>
                    <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" onClick={onOpen}>
                        Add Expense
                    </Button>
                    <Button variant="outline" size="sm" leftIcon={<MdDownload />} borderRadius="lg" colorScheme="blue">Export</Button>
                </HStack>
            </Flex>

            {/* Category Summary */}
            <Flex gap={4} mb={6} overflowX="auto" pb={1}>
                <Card minW="180px" bg="white" borderRadius="xl" boxShadow="sm" borderLeft="4px solid" borderLeftColor="red.400">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">Total Expenses</Text>
                        <Text fontSize="2xl" fontWeight="800" color="red.500">₹{totalExpense.toLocaleString('en-IN')}</Text>
                        <Text fontSize="xs" color="gray.400">{expensesData.length} entries</Text>
                    </CardBody>
                </Card>
                {catTotals.map(cat => (
                    <Card key={cat.name} minW="160px" bg="white" borderRadius="xl" boxShadow="sm"
                        borderLeft="4px solid" borderLeftColor={`${categoryColor[cat.name] || 'gray'}.400`}>
                        <CardBody py={3} px={5}>
                            <Text fontSize="xs" color="gray.500">{cat.name}</Text>
                            <Text fontSize="xl" fontWeight="700">₹{cat.total.toLocaleString('en-IN')}</Text>
                            <Text fontSize="xs" color="gray.400">{cat.count} entries</Text>
                        </CardBody>
                    </Card>
                ))}
            </Flex>

            {/* Filters */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" mb={4}>
                <CardBody py={3}>
                    <HStack spacing={3}>
                        <InputGroup maxW="250px" size="sm">
                            <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                            <Input placeholder="Search expenses..." borderRadius="lg" />
                        </InputGroup>
                        <Select placeholder="Category" size="sm" maxW="160px" borderRadius="lg">
                            {categories.map(c => <option key={c}>{c}</option>)}
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
                                <Th fontSize="xs" color="gray.500">Category</Th>
                                <Th fontSize="xs" color="gray.500">Description</Th>
                                <Th fontSize="xs" color="gray.500">Amount</Th>
                                <Th fontSize="xs" color="gray.500">Property</Th>
                                <Th fontSize="xs" color="gray.500">Receipt</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={6} textAlign="center">Loading expenses...</Td></Tr>
                            ) : expensesData.map((e) => (
                                <Tr key={e.id} _hover={{ bg: 'gray.50' }}>
                                    <Td fontSize="sm">{new Date(e.date).toLocaleDateString()}</Td>
                                    <Td><Badge colorScheme={categoryColor[e.category] || 'gray'} fontSize="2xs">{e.category}</Badge></Td>
                                    <Td fontSize="sm">{e.description}</Td>
                                    <Td fontWeight="600" fontSize="sm" color="red.500">₹{(e.amount || 0).toLocaleString('en-IN')}</Td>
                                    <Td fontSize="sm">{e.property || '—'}</Td>
                                    <Td>
                                        {e.receipt ? (
                                            <Icon as={MdReceipt} color="green.500" boxSize={4} />
                                        ) : (
                                            <Text fontSize="xs" color="gray.400">—</Text>
                                        )}
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            {/* Add Expense Modal */}
            <Modal isOpen={isOpen} onClose={onClose} size="lg">
                <ModalOverlay />
                <ModalContent borderRadius="xl">
                    <ModalHeader>Add Expense</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={4}>
                        <Flex gap={4} mb={4}>
                            <FormControl>
                                <FormLabel fontSize="sm">Date</FormLabel>
                                <Input type="date" size="sm" borderRadius="lg" />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Category</FormLabel>
                                <Select size="sm" borderRadius="lg" placeholder="Select">
                                    {Object.keys(categoryColor).map(c => <option key={c}>{c}</option>)}
                                </Select>
                            </FormControl>
                        </Flex>
                        <FormControl mb={4}>
                            <FormLabel fontSize="sm">Description</FormLabel>
                            <Textarea size="sm" borderRadius="lg" placeholder="Expense description..." />
                        </FormControl>
                        <Flex gap={4}>
                            <FormControl>
                                <FormLabel fontSize="sm">Amount (₹)</FormLabel>
                                <Input type="number" size="sm" borderRadius="lg" placeholder="0" />
                            </FormControl>
                            <FormControl>
                                <FormLabel fontSize="sm">Property</FormLabel>
                                <Select size="sm" borderRadius="lg">
                                    <option>Sunrise PG</option><option>Green Valley PG</option>
                                </Select>
                            </FormControl>
                        </Flex>
                    </ModalBody>
                    <ModalFooter>
                        <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        <Button colorScheme="blue" borderRadius="lg">Save Expense</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </DashboardLayout>
    );
}
