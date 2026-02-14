'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Button, HStack, Image, SimpleGrid,
} from '@chakra-ui/react';
import DashboardLayout from '@/components/DashboardLayout';



export default function ListingsPage() {
    const [propertiesData, setPropertiesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProperties = async () => {
            try {
                const res = await fetch('/api/properties');
                const data = await res.json();
                setPropertiesData(data);
            } catch (error) {
                console.error("Failed to fetch properties:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProperties();
    }, []);

    const statCards = [
        { label: 'Listed Properties', value: propertiesData.length, color: 'blue.500', icon: '📋' },
        { label: 'Unlisted Properties', value: 0, color: 'red.500', icon: '🚫' },
        { label: 'New Leads', value: 3, color: 'gray.700', icon: '🛒' }, // Mock for now
        { label: 'Physical Tours', value: 0, color: 'red.400', icon: '📋' },
        { label: 'Video Tours', value: 0, color: 'purple.500', icon: '📹' },
        { label: 'Calls Scheduled', value: 0, color: 'blue.600', icon: '📞' },
        { label: 'Reserved Beds', value: 0, color: 'blue.500', icon: '🛏️' },
        { label: 'Total Collection', value: 0, color: 'blue.600', icon: '💰' },
        { label: 'Total Wishlists', value: 0, color: 'red.400', icon: '❤️' },
    ];

    return (
        <DashboardLayout>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Listings</Text>
            </Flex>

            {/* Stat Cards - scrollable like Rentok */}
            <Box overflowX="auto" mb={5} pb={2} css={{ '&::-webkit-scrollbar': { height: '6px' }, '&::-webkit-scrollbar-thumb': { bg: 'gray.300', borderRadius: '3px' } }}>
                <Flex gap={3} minW="max-content">
                    {statCards.map((stat) => (
                        <Card key={stat.label} minW="140px" bg="white" borderRadius="xl" boxShadow="sm" flex="0 0 auto">
                            <CardBody py={3} px={4}>
                                <Flex justify="space-between" align="flex-start">
                                    <Box>
                                        <Text fontSize="2xl" fontWeight="800" color={stat.color}>{stat.value}</Text>
                                        <Text fontSize="xs" color="gray.600" mt={1}>{stat.label}</Text>
                                    </Box>
                                    <Text fontSize="lg">{stat.icon}</Text>
                                </Flex>
                            </CardBody>
                        </Card>
                    ))}
                </Flex>
            </Box>

            {/* Property Cards Grid */}
            <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5}>
                {loading ? (
                    <Text>Loading listings...</Text>
                ) : propertiesData.map((prop) => (
                    <Card key={prop.id} bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden" maxW="600px">
                        <Box position="relative">
                            <Image
                                src="https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=600&h=400&fit=crop"
                                alt="Property"
                                w="100%"
                                h="250px"
                                objectFit="cover"
                            />
                            <Text position="absolute" top={2} right={2} fontSize="xs" color="white" bg="blackAlpha.600" px={2} py={1} borderRadius="md">
                                {prop.code}
                            </Text>
                        </Box>
                        <CardBody p={4}>
                            <Text fontWeight="700" fontSize="lg" mb={3}>{prop.name}</Text>
                            <Flex gap={4} flexWrap="wrap" mb={3}>
                                <HStack spacing={2}>
                                    <Text fontSize="sm">🏠</Text>
                                    <Text fontSize="sm" color="gray.600">Single, Double, Triple</Text>
                                </HStack>
                                <HStack spacing={2}>
                                    <Text fontSize="sm">👤</Text>
                                    <Text fontSize="sm" color="gray.600">Boys / Girls</Text>
                                </HStack>
                            </Flex>
                            <HStack spacing={2} mb={3}>
                                <Text fontSize="sm">🎓</Text>
                                <Text fontSize="sm" color="gray.600">Students / Working Professionals</Text>
                            </HStack>
                            <Flex justify="space-between" align="center" mt={3}>
                                <Text fontSize="sm" color="green.500" fontWeight="600">Rent on Request</Text>
                                <HStack spacing={2}>
                                    <Button colorScheme="green" size="sm" borderRadius="lg" fontWeight="500">
                                        View Website
                                    </Button>
                                    <Button colorScheme="blue" size="sm" borderRadius="lg" fontWeight="500">
                                        Edit Website
                                    </Button>
                                </HStack>
                            </Flex>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>
        </DashboardLayout>
    );
}
