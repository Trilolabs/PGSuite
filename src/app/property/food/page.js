'use client';

import {
    Box, Flex, Text, VStack, Icon, Button,
} from '@chakra-ui/react';
import { MdRestaurant } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

export default function FoodPage() {
    return (
        <DashboardLayout>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Food</Text>
            </Flex>

            {/* Empty state - matching Rentok exactly */}
            <Flex direction="column" align="center" justify="center" minH="400px">
                <Box bg="orange.100" p={5} borderRadius="full" mb={4}>
                    <Icon as={MdRestaurant} boxSize={12} color="orange.500" />
                </Box>
                <Text fontWeight="700" fontSize="lg" color="gray.800" mb={2}>Mess is not enabled</Text>
                <Text fontSize="sm" color="gray.500" mb={5}>Enable mess to manage food menu</Text>
                <Button colorScheme="orange" size="sm" borderRadius="lg" fontWeight="500" leftIcon={<MdRestaurant />}>
                    Activate Mess
                </Button>
            </Flex>
        </DashboardLayout>
    );
}
