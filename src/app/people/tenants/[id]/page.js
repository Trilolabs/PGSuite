'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import {
    Box, Grid, GridItem, VStack, Text, Heading, Avatar,
    Tabs, TabList, TabPanels, Tab, TabPanel,
    Button, Badge, Flex, Icon, Spinner, useToast,
    Menu, MenuButton, MenuList, MenuItem, IconButton
} from '@chakra-ui/react';
import { MdEdit, MdDelete, MdMoreVert, MdCheckCircle, MdCancel, MdArrowBack, MdHistory, MdAddCircle } from 'react-icons/md';

// Import Tabs
import JoiningFormTab from '@/components/tenant-profile/JoiningFormTab';
import ProfileTab from '@/components/tenant-profile/ProfileTab';
import RentDetailsTab from '@/components/tenant-profile/RentDetailsTab';
import DocumentsTab from '@/components/tenant-profile/DocumentsTab';
import PassbookTab from '@/components/tenant-profile/PassbookTab';

export default function TenantProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const toast = useToast();
    const [tenant, setTenant] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            fetchTenantDetails();
        }
    }, [id]);

    const fetchTenantDetails = async () => {
        try {
            const res = await fetch(`/api/tenants/${id}`);
            if (!res.ok) throw new Error('Failed to fetch tenant');
            const data = await res.json();
            setTenant(data);
        } catch (error) {
            console.error(error);
            toast({ title: 'Error', description: 'Could not load tenant details', status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <DashboardLayout>
                <Flex justify="center" align="center" h="50vh">
                    <Spinner size="xl" color="brand.500" />
                </Flex>
            </DashboardLayout>
        );
    }

    if (!tenant) {
        return (
            <DashboardLayout>
                <Box p={8} textAlign="center">
                    <Text>Tenant not found.</Text>
                    <Button mt={4} onClick={() => router.push('/people/tenants')}>Back to List</Button>
                </Box>
            </DashboardLayout>
        );
    }

    // Calculations
    const totalDues = tenant.dues?.filter(d => d.type !== 'Security Deposit').reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const totalCollection = tenant.collections?.reduce((acc, curr) => acc + curr.amount, 0) || 0;
    const deposit = tenant.deposit || 0;

    return (
        <DashboardLayout>
            <Box p={6}>
                {/* Header / Breadcrumb */}
                <Flex align="center" mb={6}>
                    <IconButton icon={<MdArrowBack />} variant="ghost" mr={2} onClick={() => router.back()} />
                    <Heading size="md" color="gray.700">Tenant Profile</Heading>
                    <Box flex="1" />

                    <Button leftIcon={<MdHistory />} variant="ghost" mr={2}>
                        History
                    </Button>
                    <Button leftIcon={<MdAddCircle />} colorScheme="brand" mr={2}>
                        Add Dues
                    </Button>

                    <Menu>
                        <MenuButton as={Button} rightIcon={<MdMoreVert />} size="sm">
                            Actions
                        </MenuButton>
                        <MenuList>
                            <MenuItem icon={<MdEdit />}>Edit Profile</MenuItem>
                            <MenuItem icon={<MdCancel />} color="orange.500">Move Out</MenuItem>
                            <MenuItem icon={<MdDelete />} color="red.500">Delete</MenuItem>
                        </MenuList>
                    </Menu>
                </Flex>

                <Grid templateColumns={{ base: "1fr", lg: "300px 1fr" }} gap={8}>
                    {/* Left Sidebar */}
                    <GridItem>
                        <VStack spacing={6} align="stretch">
                            {/* Profile Card */}
                            <Box p={6} bg="white" borderRadius="lg" shadow="sm" textAlign="center" borderWidth="1px">
                                <Avatar size="2xl" name={tenant.name} src={tenant.photo} mb={4} />
                                <Heading size="md" mb={1}>{tenant.name}</Heading>
                                <Text color="gray.500" fontSize="sm">{tenant.phone}</Text>
                                <Badge mt={2} colorScheme={tenant.appStatus === 'Active' ? 'green' : 'red'}>
                                    {tenant.appStatus}
                                </Badge>

                                <Box mt={6} textAlign="left">
                                    <Text fontSize="xs" fontWeight="bold" textTransform="uppercase" color="gray.400" mb={3}>Current Stay</Text>
                                    <Flex justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Room</Text>
                                        <Text fontWeight="bold">{tenant.room?.number || '-'}</Text>
                                    </Flex>
                                    <Flex justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Bed</Text>
                                        <Text fontWeight="bold">{tenant.bed || '-'}</Text>
                                    </Flex>
                                    <Flex justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Rent Cycle</Text>
                                        <Text fontWeight="bold">{tenant.rentalFrequency || 'Monthly'}</Text>
                                    </Flex>
                                    <Flex justify="space-between" mb={2}>
                                        <Text fontSize="sm" color="gray.600">Food</Text>
                                        <Text fontWeight="bold">{tenant.foodPreference || 'Standard'}</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Since</Text>
                                        <Text fontWeight="bold">{tenant.moveIn}</Text>
                                    </Flex>
                                </Box>
                            </Box>

                            {/* Financial Summary */}
                            <Box p={5} bg="white" borderRadius="lg" shadow="sm" borderWidth="1px">
                                <Heading size="xs" textTransform="uppercase" color="gray.400" mb={4}>Financials</Heading>
                                <VStack spacing={3} align="stretch">
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Total Dues</Text>
                                        <Text fontWeight="bold" color="red.500">₹{totalDues}</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Total Collection</Text>
                                        <Text fontWeight="bold" color="green.500">₹{totalCollection}</Text>
                                    </Flex>
                                    <Flex justify="space-between">
                                        <Text fontSize="sm" color="gray.600">Security Deposit</Text>
                                        <Text fontWeight="bold" color="blue.500">₹{deposit}</Text>
                                    </Flex>
                                </VStack>
                            </Box>

                            {/* Verification Status */}
                            <Box p={5} bg="white" borderRadius="lg" shadow="sm" borderWidth="1px">
                                <Heading size="xs" textTransform="uppercase" color="gray.400" mb={4}>Verification</Heading>
                                <VStack spacing={3} align="stretch">
                                    <Button size="sm" colorScheme="blue" width="full" variant="outline">Web Check-in</Button>

                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm">ID Proof</Text>
                                        <Icon as={tenant.idProof ? MdCheckCircle : MdCancel} color={tenant.idProof ? "green.500" : "gray.300"} boxSize={5} />
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm">Agreement</Text>
                                        {/* Placeholder logic for agreement */}
                                        <Icon as={MdCancel} color="gray.300" boxSize={5} />
                                    </Flex>
                                    <Flex justify="space-between" align="center">
                                        <Text fontSize="sm">Police Verification</Text>
                                        <Icon as={MdCancel} color="gray.300" boxSize={5} />
                                    </Flex>

                                    <Button size="sm" width="full" mt={2}>Verify Tenant</Button>
                                </VStack>
                            </Box>
                        </VStack>
                    </GridItem>

                    {/* Right Content - Tabs */}
                    <GridItem>
                        <Box bg="white" borderRadius="lg" shadow="sm" minH="500px" borderWidth="1px">
                            <Tabs colorScheme="brand" isLazy>
                                <TabList px={4} pt={4} overflowX="auto">
                                    <Tab fontWeight="600">Joining Form</Tab>
                                    <Tab fontWeight="600">Profile</Tab>
                                    <Tab fontWeight="600">Rent & Stay</Tab>
                                    <Tab fontWeight="600">Documents</Tab>
                                    <Tab fontWeight="600">Passbook</Tab>
                                    <Tab fontWeight="600">Complaints</Tab>
                                </TabList>
                                <TabPanels p={6}>
                                    <TabPanel>
                                        <JoiningFormTab tenant={tenant} />
                                    </TabPanel>
                                    <TabPanel>
                                        <ProfileTab tenant={tenant} />
                                    </TabPanel>
                                    <TabPanel>
                                        <RentDetailsTab tenant={tenant} />
                                    </TabPanel>
                                    <TabPanel>
                                        <DocumentsTab tenant={tenant} />
                                    </TabPanel>
                                    <TabPanel>
                                        <PassbookTab tenant={tenant} />
                                    </TabPanel>
                                    <TabPanel>
                                        <Text color="gray.500">No complaints found.</Text>
                                    </TabPanel>
                                </TabPanels>
                            </Tabs>
                        </Box>
                    </GridItem>
                </Grid>
            </Box>
        </DashboardLayout>
    );
}
