'use client';

import {
    Box, Flex, Text, Card, CardBody, Button, VStack, HStack, Icon, Badge,
    SimpleGrid, Divider, Textarea, Select,
} from '@chakra-ui/react';
import { MdWhatsapp, MdSend, MdHistory, MdNotifications } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

const templates = [
    { name: 'Rent Reminder', message: 'Dear {tenant}, your rent of ₹{amount} for {month} is due. Please pay at the earliest.', type: 'Reminder' },
    { name: 'Payment Confirmation', message: 'Dear {tenant}, we have received your payment of ₹{amount}. Thank you!', type: 'Confirmation' },
    { name: 'Due Notice', message: 'Dear {tenant}, your payment of ₹{amount} is overdue by {days} days. Please clear immediately.', type: 'Notice' },
    { name: 'Welcome Message', message: 'Welcome to {property}, {tenant}! We are happy to have you.', type: 'Welcome' },
    { name: 'Move-out Notice', message: 'Dear {tenant}, your notice period ends on {date}. Please ensure all dues are cleared.', type: 'Notice' },
];

const recentMessages = [
    { tenant: 'Rahul Sharma', template: 'Rent Reminder', time: '2 hours ago', status: 'Delivered' },
    { tenant: 'Amit Kumar', template: 'Due Notice', time: '5 hours ago', status: 'Read' },
    { tenant: 'Priya Patel', template: 'Payment Confirmation', time: '1 day ago', status: 'Delivered' },
    { tenant: 'Ravi Teja', template: 'Rent Reminder', time: '1 day ago', status: 'Sent' },
];

export default function WhatsAppPage() {
    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={6}>
                <HStack>
                    <Icon as={MdWhatsapp} boxSize={6} color="green.500" />
                    <Text fontSize="xl" fontWeight="700">WhatsApp CRM</Text>
                </HStack>
                <Button colorScheme="green" size="sm" leftIcon={<MdSend />} borderRadius="lg">Bulk Send</Button>
            </Flex>

            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                {/* Templates */}
                <Box>
                    <Text fontWeight="600" mb={3} color="gray.700">Message Templates</Text>
                    <VStack spacing={3}>
                        {templates.map((t) => (
                            <Card key={t.name} bg="white" borderRadius="xl" boxShadow="sm" w="100%">
                                <CardBody p={4}>
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="600" fontSize="sm">{t.name}</Text>
                                        <Badge colorScheme={t.type === 'Reminder' ? 'orange' : t.type === 'Confirmation' ? 'green' : t.type === 'Notice' ? 'red' : 'blue'}
                                            fontSize="2xs" borderRadius="full">{t.type}</Badge>
                                    </Flex>
                                    <Text fontSize="xs" color="gray.500" bg="gray.50" p={2} borderRadius="md">{t.message}</Text>
                                    <Flex justify="flex-end" mt={2}>
                                        <Button size="xs" colorScheme="green" leftIcon={<MdSend />} borderRadius="lg">Send</Button>
                                    </Flex>
                                </CardBody>
                            </Card>
                        ))}
                    </VStack>
                </Box>

                {/* Recent Messages */}
                <Box>
                    <Text fontWeight="600" mb={3} color="gray.700">Recent Messages</Text>
                    <Card bg="white" borderRadius="xl" boxShadow="sm">
                        <CardBody p={0}>
                            <VStack spacing={0} divider={<Divider />}>
                                {recentMessages.map((msg, i) => (
                                    <Flex key={i} justify="space-between" align="center" w="100%" p={4}>
                                        <HStack spacing={3}>
                                            <Flex w={8} h={8} bg="green.50" borderRadius="full" align="center" justify="center">
                                                <Icon as={MdWhatsapp} color="green.500" boxSize={4} />
                                            </Flex>
                                            <Box>
                                                <Text fontSize="sm" fontWeight="500">{msg.tenant}</Text>
                                                <Text fontSize="xs" color="gray.500">{msg.template}</Text>
                                            </Box>
                                        </HStack>
                                        <Box textAlign="right">
                                            <Badge colorScheme={msg.status === 'Read' ? 'blue' : msg.status === 'Delivered' ? 'green' : 'gray'}
                                                fontSize="2xs" borderRadius="full">{msg.status}</Badge>
                                            <Text fontSize="2xs" color="gray.400" mt={0.5}>{msg.time}</Text>
                                        </Box>
                                    </Flex>
                                ))}
                            </VStack>
                        </CardBody>
                    </Card>

                    <Card bg="white" borderRadius="xl" boxShadow="sm" mt={4}>
                        <CardBody p={4}>
                            <Text fontWeight="600" fontSize="sm" mb={3}>Quick Message</Text>
                            <Select size="sm" borderRadius="lg" mb={3} placeholder="Select tenant">
                                <option>All Tenants</option>
                                <option>Rent Defaulters</option>
                                <option>Rahul Sharma</option><option>Priya Patel</option>
                            </Select>
                            <Textarea size="sm" borderRadius="lg" placeholder="Type your message..." rows={3} mb={3} />
                            <Button colorScheme="green" size="sm" leftIcon={<MdWhatsapp />} borderRadius="lg" w="100%">
                                Send via WhatsApp
                            </Button>
                        </CardBody>
                    </Card>
                </Box>
            </SimpleGrid>
        </DashboardLayout>
    );
}
