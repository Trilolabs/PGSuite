'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Table, Thead, Tbody, Tr, Th, Td,
    Badge, Button, HStack, Select, Input, IconButton, Menu, MenuButton,
    MenuList, MenuItem, InputGroup, InputLeftElement, Icon, Stat, StatLabel, StatNumber,
    useToast,
} from '@chakra-ui/react';
import { MdSearch, MdFilterList, MdWhatsapp, MdMoreVert, MdNotifications } from 'react-icons/md';

import DashboardLayout from '@/components/DashboardLayout';
import RecordPaymentModal from '@/components/RecordPaymentModal';

const statusColor = { Unpaid: 'red', Paid: 'green', Overdue: 'orange' };

export default function DuesPage() {
    const [duesData, setDuesData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedDue, setSelectedDue] = useState(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

    useEffect(() => {
        const fetchDues = async () => {
            try {
                const res = await fetch('/api/dues');
                const data = await res.json();
                setDuesData(data);
            } catch (error) {
                console.error("Failed to fetch dues:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDues();
    }, []);

    const unpaidDues = duesData.filter(d => d.status !== 'Paid');
    const totalUnpaid = unpaidDues.reduce((s, d) => s + (d.amount || 0), 0);
    const overdueDues = duesData.filter(d => d.status === 'Overdue');
    const totalOverdue = overdueDues.reduce((s, d) => s + (d.amount || 0), 0);
    const toast = useToast();

    const handleSendReminders = () => {
        toast({
            title: "Reminders Queued",
            description: "Payment reminders have been queued for all pending dues.",
            status: "success",
            duration: 3000,
            isClosable: true,
        });
    };

    const handleNotifyAll = () => {
        toast({
            title: "Notifications Sent",
            description: "Notifications sent to all tenants with pending dues.",
            status: "info",
            duration: 3000,
            isClosable: true,
        });
    };

    const fetchDues = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/dues');
            const data = await res.json();
            setDuesData(data);
        } catch (error) {
            console.error("Failed to fetch dues:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleRowAction = (action, due) => {
        if (action === 'Collect Payment') {
            setSelectedDue(due);
            setIsPaymentModalOpen(true);
            return;
        }

        let title = "";
        let description = "";
        let status = "info";

        switch (action) {
            case 'Send Reminder':
                title = "Reminder Sent";
                description = `Reminder sent to ${due.tenantName}.`;
                status = "success";
                break;
            case 'View Details':
                title = "Navigating";
                description = `Opening details for ${due.tenantName}.`;
                break;
            default:
                break;
        }

        toast({
            title,
            description,
            status,
            duration: 2000,
            isClosable: true,
        });
    };

    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={6}>
                <Text fontSize="xl" fontWeight="700">Dues</Text>
                <HStack>
                    <Button colorScheme="green" size="sm" leftIcon={<MdWhatsapp />} borderRadius="lg" onClick={handleSendReminders}>
                        Send Reminders
                    </Button>
                    <Button colorScheme="blue" variant="outline" size="sm" leftIcon={<MdNotifications />} borderRadius="lg" onClick={handleNotifyAll}>
                        Notify All
                    </Button>
                </HStack>
            </Flex>

            {/* Summary Cards */}
            <Flex gap={4} mb={6} overflowX="auto" pb={1}>
                <Card minW="200px" bg="white" borderRadius="xl" boxShadow="sm">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">Total Unpaid</Text>
                        <Text fontSize="2xl" fontWeight="800" color="red.500">₹{totalUnpaid.toLocaleString('en-IN')}</Text>
                        <Text fontSize="xs" color="gray.400">{unpaidDues.length} dues pending</Text>
                    </CardBody>
                </Card>
                <Card minW="200px" bg="white" borderRadius="xl" boxShadow="sm">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">Overdue</Text>
                        <Text fontSize="2xl" fontWeight="800" color="orange.500">₹{totalOverdue.toLocaleString('en-IN')}</Text>
                        <Text fontSize="xs" color="gray.400">{overdueDues.length} overdue</Text>
                    </CardBody>
                </Card>
                <Card minW="200px" bg="white" borderRadius="xl" boxShadow="sm">
                    <CardBody py={3} px={5}>
                        <Text fontSize="xs" color="gray.500">Total Dues</Text>
                        <Text fontSize="2xl" fontWeight="800" color="gray.700">{duesData.length}</Text>
                        <Text fontSize="xs" color="gray.400">This month</Text>
                    </CardBody>
                </Card>
            </Flex>

            {/* Filters */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" mb={4}>
                <CardBody py={3}>
                    <HStack spacing={3} flexWrap="wrap">
                        <InputGroup maxW="250px" size="sm">
                            <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                            <Input placeholder="Search tenant..." borderRadius="lg" />
                        </InputGroup>
                        <Select placeholder="Due Type" size="sm" maxW="150px" borderRadius="lg">
                            <option>Rent</option><option>Electricity</option><option>Maintenance</option>
                            <option>Water</option><option>Food</option>
                        </Select>
                        <Select placeholder="Status" size="sm" maxW="150px" borderRadius="lg">
                            <option>Unpaid</option><option>Paid</option><option>Overdue</option>
                        </Select>
                        <Input type="date" size="sm" maxW="160px" borderRadius="lg" />
                    </HStack>
                </CardBody>
            </Card>

            {/* Dues Table */}
            <Card bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                <Box overflowX="auto">
                    <Table variant="simple" size="sm">
                        <Thead bg="gray.50">
                            <Tr>
                                <Th fontSize="xs" color="gray.500">Tenant</Th>
                                <Th fontSize="xs" color="gray.500">Room</Th>
                                <Th fontSize="xs" color="gray.500">Type</Th>
                                <Th fontSize="xs" color="gray.500">Amount</Th>
                                <Th fontSize="xs" color="gray.500">Due Date</Th>
                                <Th fontSize="xs" color="gray.500">Status</Th>
                                <Th fontSize="xs" color="gray.500">Action</Th>
                            </Tr>
                        </Thead>
                        <Tbody>
                            {loading ? (
                                <Tr><Td colSpan={7} textAlign="center">Loading dues...</Td></Tr>
                            ) : duesData.map((due) => (
                                <Tr key={due.id} _hover={{ bg: 'gray.50' }}>
                                    <Td fontWeight="500" fontSize="sm">{due.tenantName || '—'}</Td>
                                    <Td fontSize="sm">{due.roomNumber ? `${due.roomNumber}` : '—'}</Td>
                                    <Td fontSize="sm">{due.type}</Td>
                                    <Td fontWeight="600" fontSize="sm">₹{(due.amount || 0).toLocaleString('en-IN')}</Td>
                                    <Td fontSize="sm">{new Date(due.dueDate).toLocaleDateString()}</Td>
                                    <Td>
                                        <Badge colorScheme={statusColor[due.status] || 'gray'} fontSize="2xs" px={2} py={0.5} borderRadius="full">
                                            {due.status}
                                        </Badge>
                                    </Td>
                                    <Td>
                                        <Menu>
                                            <MenuButton as={IconButton} icon={<MdMoreVert />} size="xs" variant="ghost" />
                                            <MenuList fontSize="sm">
                                                <MenuItem onClick={() => handleRowAction('Collect Payment', due)}>Collect Payment</MenuItem>
                                                <MenuItem onClick={() => handleRowAction('Send Reminder', due)}>Send Reminder</MenuItem>
                                                <MenuItem onClick={() => handleRowAction('View Details', due)}>View Details</MenuItem>
                                            </MenuList>
                                        </Menu>
                                    </Td>
                                </Tr>
                            ))}
                        </Tbody>
                    </Table>
                </Box>
            </Card>

            <RecordPaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                due={selectedDue}
                onPaymentRecorded={fetchDues}
            />
        </DashboardLayout >
    );
}
