'use client';

import {
    Box, Flex, Text,
} from '@chakra-ui/react';
import DashboardLayout from '@/components/DashboardLayout';

export default function FlexiPePage() {
    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">FlexiPe</Text>
            </Flex>

            {/* Placeholder - matching the 404-like state on Rentok */}
            <Flex direction="column" align="center" justify="center" minH="400px">
                <Text fontSize="5xl" fontWeight="300" color="gray.400" mb={2}>Coming Soon</Text>
                <Text fontSize="sm" color="gray.500">FlexiPe integration is coming soon to your dashboard.</Text>
            </Flex>
        </DashboardLayout>
    );
}
