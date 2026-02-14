'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box, Flex, Text, SimpleGrid, Icon, HStack, Button, Badge,
  Stat, StatLabel, StatNumber, Card, CardBody, VStack, Divider,
  useToast,
} from '@chakra-ui/react';
import {
  MdAccountBalanceWallet, MdMoneyOff, MdReceipt, MdShoppingCart,
  MdPersonOff, MdSavings, MdTrendingUp, MdAdd, MdPersonAdd,
  MdPayments, MdDescription, MdBed, MdVisibility, MdShare,
  MdApartment, MdContentCopy, MdEditCalendar, MdFormatListBulleted,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';


const formatCurrency = (amount) => `₹${amount.toLocaleString('en-IN')}`;

const summaryCards = [
  { label: "Today's Collection", key: 'todayCollection', icon: MdTrendingUp, color: 'green.500' },
  { label: "February's Collection", key: 'monthlyCollection', icon: MdAccountBalanceWallet, color: 'green.600' },
  { label: "February's Dues", key: 'monthlyDues', icon: MdMoneyOff, color: 'red.500' },
  { label: 'Total Dues', key: 'totalDues', icon: MdReceipt, color: 'red.600' },
  { label: "February's Expenses", key: 'monthlyExpenses', icon: MdShoppingCart, color: 'blue.500' },
  { label: 'Rent Defaulters', key: 'rentDefaulters', icon: MdPersonOff, color: 'red.500', isCurrency: false },
  { label: 'Current Deposits', key: 'currentDeposits', icon: MdSavings, color: 'purple.500' },
];

const quickActions = [
  { label: 'Add Tenant', icon: MdPersonAdd, color: 'blue' },
  { label: 'Record Payment', icon: MdPayments, color: 'green' },
  { label: 'Generate Bill', icon: MdDescription, color: 'orange' },
  { label: 'Add Room', icon: MdBed, color: 'purple' },
  { label: 'Add Property', icon: MdApartment, color: 'teal' },
  { label: 'View Reports', icon: MdFormatListBulleted, color: 'cyan' },
  { label: 'Manage Dues', icon: MdEditCalendar, color: 'pink' },
];

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [propertiesData, setPropertiesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const toast = useToast();

  const handleQuickAction = (action) => {
    switch (action) {
      case 'Add Tenant':
        router.push('/people/add-tenant');
        break;
      case 'Record Payment':
        router.push('/money/collection');
        break;
      case 'Generate Bill':
        router.push('/money/dues');
        break;
      case 'Add Room':
        router.push('/property/rooms');
        break;
      case 'View Reports':
        router.push('/reports');
        break;
      case 'Manage Dues':
        router.push('/money/dues');
        break;
      case 'Add Property':
        toast({
          title: "Coming Soon",
          description: "Property creation flow is under development.",
          status: "info",
          duration: 3000,
          isClosable: true,
        });
        break;
      default:
        break;
    }
  };

  const handleAddProperty = () => {
    toast({
      title: "Coming Soon",
      description: "Property creation flow is under development.",
      status: "info",
      duration: 3000,
      isClosable: true,
    });
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link Copied",
      description: "Website link copied to clipboard.",
      status: "success",
      duration: 2000,
      isClosable: true,
    });
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, propertiesRes] = await Promise.all([
          fetch('/api/dashboard/summary'),
          fetch('/api/properties')
        ]);

        const summaryData = await summaryRes.json();
        const propertiesData = await propertiesRes.json();

        setSummary(summaryData);
        setPropertiesData(propertiesData);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Map API summary to card keys
  // API: { financial: { monthlyCollection, monthlyExpense, pendingDues }, ... }
  // Cards expect keys: todayCollection, monthlyCollection, monthlyDues, totalDues, monthlyExpenses, rentDefaulters, currentDeposits

  const displaySummary = summary ? {
    todayCollection: 0, // Not available in API yet
    monthlyCollection: summary.financial.monthlyCollection,
    monthlyDues: 0, // Not available split
    totalDues: summary.financial.pendingDues,
    monthlyExpenses: summary.financial.monthlyExpense,
    rentDefaulters: 0, // Not available
    currentDeposits: 0 // Not available
  } : {};

  return (
    <DashboardLayout>
      {/* Monthly Summary Header */}
      <Flex align="center" mb={4} gap={2}>
        <Text fontSize="lg" fontWeight="700" color="gray.700">February 2026 summary for</Text>
        <Badge colorScheme="blue" fontSize="sm" px={3} py={1} borderRadius="full" cursor="pointer">
          All {propertiesData.length} Properties ▾
        </Badge>
      </Flex>

      {/* Summary Cards Row */}
      <Box overflowX="auto" mb={6} pb={2}>
        <Flex gap={4} minW="fit-content">
          {summaryCards.map((card) => (
            <Card key={card.key} minW="180px" bg="white" boxShadow="sm" borderRadius="xl"
              _hover={{ boxShadow: 'md', transform: 'translateY(-2px)' }} transition="all 0.2s">
              <CardBody py={4} px={5}>
                <Flex align="center" justify="space-between" mb={1}>
                  <Text fontSize="2xl" fontWeight="800" color={card.color}>
                    {loading ? "..." : (card.isCurrency === false ? (displaySummary[card.key] || 0) : formatCurrency(displaySummary[card.key] || 0))}
                  </Text>
                  <Icon as={card.icon} boxSize={6} color={card.color} opacity={0.6} />
                </Flex>
                <Text fontSize="xs" color="gray.500" fontWeight="500">{card.label}</Text>
              </CardBody>
            </Card>
          ))}
        </Flex>
      </Box>

      {/* Dashboard Section Header */}
      <Flex justify="space-between" align="center" mb={4}>
        <Text fontSize="xl" fontWeight="700">Dashboard</Text>
        <HStack>
          <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" onClick={handleAddProperty}>
            Add New Property
          </Button>
          <Button variant="outline" size="sm" leftIcon={<MdVisibility />} borderRadius="lg" colorScheme="blue">
            View
          </Button>
        </HStack>
      </Flex>

      {/* Property Cards */}
      <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={5} mb={8}>
        {loading ? (
          <Text>Loading properties...</Text>
        ) : propertiesData.map((prop) => (
          <Card key={prop.id} bg="white" borderRadius="xl" boxShadow="sm" overflow="hidden"
            _hover={{ boxShadow: 'lg', transform: 'translateY(-2px)' }} transition="all 0.2s">
            <CardBody p={5}>
              <Flex justify="space-between" align="center" mb={3}>
                <VStack align="start" spacing={0}>
                  <Text fontWeight="700" fontSize="lg">{prop.name}</Text>
                  <Flex align="center" gap={2}>
                    <Text fontSize="xs" color="gray.500">{prop.code}</Text>
                    <Icon as={MdContentCopy} boxSize={3} color="gray.400" cursor="pointer" />
                  </Flex>
                </VStack>
                <Badge colorScheme="green" fontSize="xs" px={2} py={0.5} borderRadius="full">Current</Badge>
              </Flex>

              <Flex align="center" justify="center" mb={4} gap={3}>
                <Text fontSize="sm" color="gray.600">{prop.totalRooms} Rooms</Text>
                <Box bg="brand.500" borderRadius="full" p={1.5}>
                  <Icon as={MdApartment} color="white" boxSize={4} />
                </Box>
                <Text fontSize="sm" color="gray.600">{prop.totalBeds} Beds</Text>
              </Flex>

              <VStack spacing={2} align="stretch">
                <Flex justify="space-between">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="green.400" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">Occupied Beds</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600">{prop.occupiedBeds}</Text>
                </Flex>
                <Flex justify="space-between">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="blue.400" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">Active Tenants</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600">{prop.activeTenants}</Text>
                </Flex>
                <Flex justify="space-between">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="orange.400" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">Under Notice</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600">{prop.underNotice}</Text>
                </Flex>
                <Flex justify="space-between">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="red.400" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">Pending Dues</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600" color="red.500">{formatCurrency(prop.pendingDues)}</Text>
                </Flex>
                <Flex justify="space-between">
                  <HStack spacing={2}>
                    <Box w={2} h={2} bg="green.500" borderRadius="full" />
                    <Text fontSize="sm" color="gray.600">Collection</Text>
                  </HStack>
                  <Text fontSize="sm" fontWeight="600" color="green.500">{formatCurrency(prop.collection)}</Text>
                </Flex>
              </VStack>

              <Divider my={3} />

              <Button w="100%" colorScheme="blue" variant="outline" size="sm" leftIcon={<MdShare />}
                borderRadius="lg" onClick={handleShare}>
                Share Website
              </Button>
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {/* Quick Actions */}
      <Text fontSize="xl" fontWeight="700" mb={4}>Quick Actions</Text>
      <Flex gap={4} overflowX="auto" pb={4}>
        {quickActions.map((action) => (
          <VStack key={action.label} spacing={2} cursor="pointer" minW="80px"
            _hover={{ transform: 'translateY(-3px)' }} transition="all 0.2s"
            onClick={() => handleQuickAction(action.label)}>
            <Flex w={14} h={14} bg={`${action.color}.50`} borderRadius="xl" align="center" justify="center"
              boxShadow="sm" border="1px solid" borderColor={`${action.color}.100`}>
              <Icon as={action.icon} boxSize={6} color={`${action.color}.500`} />
            </Flex>
            <Text fontSize="xs" fontWeight="500" color="gray.600" textAlign="center">{action.label}</Text>
          </VStack>
        ))}
      </Flex>
    </DashboardLayout>
  );
}
