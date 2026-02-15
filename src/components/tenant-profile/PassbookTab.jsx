import {
    Box, Table, Thead, Tbody, Tr, Th, Td, Badge, Text, Flex, Button, Heading,
    Tabs, TabList, Tab, TabPanels, TabPanel
} from '@chakra-ui/react';
import { MdAdd, MdPayment } from 'react-icons/md';

const PassbookTab = ({ tenant }) => {
    // Combine Dues and Collections
    const transactions = [
        ...(tenant.dues || []).map(d => ({
            id: d.id,
            date: d.dueDate || d.createdAt,
            description: d.type || 'Due',
            amount: d.amount,
            type: 'DEBIT',
            category: 'Dues',
            original: d
        })),
        ...(tenant.collections || []).map(c => ({
            id: c.id,
            date: c.date || c.createdAt,
            description: 'Payment Received',
            amount: c.amount,
            type: 'CREDIT',
            category: 'collection',
            original: c
        }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date));

    // Calculate Totals
    const totalDues = (tenant.dues?.filter(d => d.type !== 'Security Deposit').reduce((acc, curr) => acc + curr.amount, 0) || 0);
    const totalCollection = (tenant.collections?.reduce((acc, curr) => acc + curr.amount, 0) || 0);
    const deposit = tenant.deposit || 0;

    const TransactionTable = ({ data, emptyMessage }) => (
        <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
            <Table variant="simple" size="sm">
                <Thead bg="gray.50">
                    <Tr>
                        <Th>Date</Th>
                        <Th>Description</Th>
                        <Th isNumeric>Amount</Th>
                        <Th>Status</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {data.length === 0 ? (
                        <Tr>
                            <Td colSpan={4} textAlign="center" py={4} color="gray.500">{emptyMessage}</Td>
                        </Tr>
                    ) : (
                        data.map((txn, idx) => (
                            <Tr key={idx}>
                                <Td>{new Date(txn.date).toLocaleDateString()}</Td>
                                <Td>{txn.description}</Td>
                                <Td isNumeric color={txn.type === 'DEBIT' ? "red.500" : "green.500"} fontWeight="bold">
                                    {txn.type === 'DEBIT' ? '-' : '+'}{`₹${txn.amount}`}
                                </Td>
                                <Td>
                                    {txn.type === 'DEBIT' && (
                                        <Badge colorScheme={txn.original.status === 'Paid' ? 'green' : (txn.original.status === 'Partial' ? 'orange' : 'red')}>
                                            {txn.original.status}
                                        </Badge>
                                    )}
                                    {txn.type === 'CREDIT' && <Badge colorScheme="green">Received</Badge>}
                                </Td>
                            </Tr>
                        ))
                    )}
                </Tbody>
            </Table>
        </Box>
    );

    return (
        <Box>
            {/* Financial Summary Cards */}
            <Flex gap={4} mb={6} overflowX="auto" pb={2}>
                <Box p={4} bg="red.50" borderRadius="lg" minW="150px" borderWidth="1px" borderColor="red.100">
                    <Text fontSize="xs" color="red.600" fontWeight="bold" textTransform="uppercase">Total Dues</Text>
                    <Text fontSize="xl" fontWeight="bold" color="red.700">₹{totalDues}</Text>
                </Box>
                <Box p={4} bg="green.50" borderRadius="lg" minW="150px" borderWidth="1px" borderColor="green.100">
                    <Text fontSize="xs" color="green.600" fontWeight="bold" textTransform="uppercase">Total Collection</Text>
                    <Text fontSize="xl" fontWeight="bold" color="green.700">₹{totalCollection}</Text>
                </Box>
                <Box p={4} bg="blue.50" borderRadius="lg" minW="150px" borderWidth="1px" borderColor="blue.100">
                    <Text fontSize="xs" color="blue.600" fontWeight="bold" textTransform="uppercase">Security Deposit</Text>
                    <Text fontSize="xl" fontWeight="bold" color="blue.700">₹{deposit}</Text>
                </Box>
            </Flex>

            <Flex justify="space-between" align="center" mb={4}>
                <Heading size="md">Passbook</Heading>
                <Flex gap={2}>
                    <Button leftIcon={<MdAdd />} size="sm" colorScheme="red" variant="outline">Add Due</Button>
                    <Button leftIcon={<MdPayment />} size="sm" colorScheme="green">Record Payment</Button>
                </Flex>
            </Flex>

            <Tabs variant="soft-rounded" colorScheme="brand" size="sm">
                <TabList mb={4} overflowX="auto" py={1}>
                    <Tab borderRadius="full">All Transactions</Tab>
                    <Tab borderRadius="full">Dues</Tab>
                    <Tab borderRadius="full">Collections</Tab>
                    <Tab borderRadius="full">Security Deposit</Tab>
                </TabList>
                <TabPanels>
                    <TabPanel px={0}>
                        <TransactionTable data={transactions} emptyMessage="No transactions found" />
                    </TabPanel>
                    <TabPanel px={0}>
                        <TransactionTable
                            data={transactions.filter(t => t.type === 'DEBIT' && t.original.type !== 'Security Deposit')}
                            emptyMessage="No dues records found"
                        />
                    </TabPanel>
                    <TabPanel px={0}>
                        <TransactionTable
                            data={transactions.filter(t => t.type === 'CREDIT')}
                            emptyMessage="No collection records found"
                        />
                    </TabPanel>
                    <TabPanel px={0}>
                        {/* Assuming security deposit is a type of due/collection or just tracked via filtered dues */}
                        <TransactionTable
                            data={transactions.filter(t => t.original.type === 'Security Deposit' || t.description.includes('Deposit'))}
                            emptyMessage="No deposit records found"
                        />
                    </TabPanel>
                </TabPanels>
            </Tabs>
        </Box>
    );
};

export default PassbookTab;
