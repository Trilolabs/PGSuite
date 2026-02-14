'use client';

import {
    Box, Flex, Text, Card, CardBody, SimpleGrid, VStack, HStack, Icon, Button, Badge,
    UnorderedList, ListItem, ListIcon,
} from '@chakra-ui/react';
import { MdCheck, MdArrowForward, MdDownload } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

// Matching Rentok Electricity page exactly - partner integration cards
const partners = [
    {
        name: 'Frontier',
        tagline: 'Transform Energy Management for Your Properties',
        comingSoon: false,
        features: [
            'Efficient Billing: Automate meter readings and billing to save time and reduce errors.',
            'Proactive Management: Use predictive maintenance alerts to address potential issues early.',
            'Cost Optimization: Analyze energy consumption patterns to implement cost-saving strategies.',
            'Resident Empowerment: Provide residents with personal dashboards for transparency and self-management.',
            'Green Energy Support: Track sustainability metrics and promote eco-friendly initiatives.',
        ],
    },
    {
        name: 'Aliste',
        tagline: 'Advanced smart meter management solution coming soon to revolutionize energy monitoring',
        comingSoon: false,
        features: [
            'Energy Savings: Optimize energy usage with AI-powered analysis and actionable insights.',
            'Simplified Billing: Automate billing to reduce administrative workload and errors.',
            'Proactive Maintenance: Avoid costly repairs with predictive alerts for energy systems.',
            'Advanced Analytics: Access detailed reports to refine energy management strategies.',
            'Sustainability Goals: Promote environmental responsibility with built-in tracking for energy efficiency and green practices.',
        ],
    },
    {
        name: 'EPVI',
        tagline: 'Redefine Property Energy Management',
        comingSoon: true,
        features: [
            'Real-Time Insights: Monitor energy consumption instantly for proactive management.',
            'Smarter Optimization: Use AI-driven tools to ensure optimal energy efficiency across properties.',
            'Cost Reduction: Identify and address energy inefficiencies to save on operational costs.',
            'Comprehensive Analytics: Access reports that help refine your energy strategy and track progress.',
            'Easy Data Migration: Seamlessly transition historical energy data for continuity and better analysis.',
        ],
    },
    {
        name: 'Radius',
        tagline: 'Innovative smart meter solution for comprehensive energy management',
        comingSoon: true,
        features: [
            'Efficient Billing: Automate meter readings and billing to save time and reduce errors.',
            'Proactive Management: Use predictive maintenance alerts to address potential issues early.',
            'Cost Optimization: Analyze energy consumption patterns to implement cost-saving strategies.',
            'Resident Empowerment: Provide residents with personal dashboards for transparency and self-management.',
            'Green Energy Support: Track sustainability metrics and promote eco-friendly initiatives.',
        ],
    },
];

export default function ElectricityPage() {
    return (
        <DashboardLayout>
            {/* Header - matching Rentok */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Electricity Meters</Text>
                <Button colorScheme="blue" size="sm" leftIcon={<MdDownload />} borderRadius="lg" fontWeight="500" variant="outline">
                    Download Report
                </Button>
            </Flex>

            {/* Partner Cards - 2x2 grid matching Rentok */}
            <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={5}>
                {partners.map((partner) => (
                    <Card key={partner.name} bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden">
                        <CardBody p={6}>
                            <Flex justify="space-between" align="flex-start" mb={2}>
                                <Box>
                                    <HStack mb={1}>
                                        <Box bg="blue.50" p={2} borderRadius="lg">
                                            <Text fontSize="lg" fontWeight="bold">⚡</Text>
                                        </Box>
                                    </HStack>
                                    <Text fontWeight="700" fontSize="lg" mt={2}>{partner.name}</Text>
                                </Box>
                                {partner.comingSoon && (
                                    <Badge colorScheme="orange" fontSize="xs" px={2} py={1} borderRadius="md">COMING SOON</Badge>
                                )}
                            </Flex>
                            <Text color="gray.500" fontSize="sm" mb={4}>{partner.tagline}</Text>
                            <VStack align="stretch" spacing={2} mb={4}>
                                {partner.features.map((feature, idx) => (
                                    <HStack key={idx} align="flex-start" spacing={2}>
                                        <Icon as={MdCheck} color="green.500" mt={0.5} flexShrink={0} />
                                        <Text fontSize="sm" color="gray.600">{feature}</Text>
                                    </HStack>
                                ))}
                            </VStack>
                            <Flex justify="flex-end">
                                <Button variant="link" colorScheme="blue" size="sm" rightIcon={<MdArrowForward />}>
                                    View Details
                                </Button>
                            </Flex>
                        </CardBody>
                    </Card>
                ))}
            </SimpleGrid>
        </DashboardLayout>
    );
}
