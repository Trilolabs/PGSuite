'use client';

import { useState, useEffect, useRef } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Switch, Badge, SimpleGrid,
    VStack, HStack, Icon, Button, Divider, useDisclosure, useToast,
    AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay,
    Menu, MenuButton, MenuList, MenuItem, IconButton,
} from '@chakra-ui/react';
import { MdAdd, MdEdit, MdDelete, MdHome, MdAttachMoney, MdMoreVert, MdBolt, MdRestaurant, MdWaterDrop, MdWifi, MdBuild, MdLocalLaundryService, MdSecurity } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import AddDuePackageDrawer from '@/components/AddDuePackageDrawer';

const SYSTEM_PACKAGES = [
    'Rent', 'Security Deposit', 'Electricity Meter', 'Food', 'Maintenance',
    'Laundry', 'Wifi', 'Water', 'Joining Fee', 'Police Verification',
    'Electricity Bill', 'Mess', 'Automatic Joining Fee', 'Automatic Move out Charges',
    'Manual Late Fine', 'Daily Rent Package', 'Weekly Rent Package', 'Yearly Rent Package',
    'Rental Agreement Charges', '3 Months Rent Package', '6 Months Rent Package',
    '9 Months Rent Package', 'Others', 'Automatic Late Fine'
];

export default function DuesPackagePage() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [selectedPackage, setSelectedPackage] = useState(null);
    const toast = useToast();

    // Delete Alert Logic
    const [packageToDelete, setPackageToDelete] = useState(null);
    const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
    const cancelRef = useRef();

    const fetchPackages = async () => {
        try {
            const res = await fetch('/api/dues-packages');
            const data = await res.json();
            setPackages(data);
        } catch (error) {
            console.error("Failed to fetch dues packages:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPackages();
    }, []);

    const handleAddPackage = () => {
        setSelectedPackage(null);
        onOpen();
    };

    const handleEditPackage = (pkg) => {
        setSelectedPackage(pkg);
        onOpen();
    };

    const confirmDeletePackage = (pkg) => {
        setPackageToDelete(pkg);
        onDeleteOpen();
    };

    const handleDeletePackage = async () => {
        if (!packageToDelete) return;
        try {
            const res = await fetch(`/api/dues-packages/${packageToDelete.id}`, {
                method: 'DELETE',
            });
            if (!res.ok) throw new Error('Failed to delete package');

            toast({ title: 'Package deleted', status: 'success', duration: 2000 });
            fetchPackages();
            onDeleteClose();
            setPackageToDelete(null);
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
        }
    };

    const handlePackageSaved = () => {
        fetchPackages();
    };

    const handleToggleStatus = async (pkg) => {
        try {
            const newStatus = !pkg.active;
            // Optimistic update
            setPackages(prev => prev.map(p => p.id === pkg.id ? { ...p, active: newStatus } : p));

            const res = await fetch(`/api/dues-packages/${pkg.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ active: newStatus }),
            });

            if (!res.ok) throw new Error('Failed to update status');

            toast({ title: `Package ${newStatus ? 'enabled' : 'disabled'}`, status: 'success', duration: 1000 });
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error', duration: 3000 });
            fetchPackages(); // Revert on error
        }
    };

    const getIconForPackage = (name) => {
        const n = name.toLowerCase();
        if (n.includes('rent')) return MdHome;
        if (n.includes('electricity') || n.includes('bill')) return MdBolt;
        if (n.includes('food') || n.includes('mess')) return MdRestaurant;
        if (n.includes('water')) return MdWaterDrop;
        if (n.includes('wifi') || n.includes('internet')) return MdWifi;
        if (n.includes('laundry')) return MdLocalLaundryService;
        if (n.includes('maintenance')) return MdBuild;
        if (n.includes('security') || n.includes('deposit')) return MdSecurity;
        return MdAttachMoney;
    };


    const isSystemPackage = (name) => SYSTEM_PACKAGES.includes(name);

    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Text fontSize="xl" fontWeight="700">Dues Package</Text>
                    <Text fontSize="sm" color="gray.500">Configure recurring and one-time charges for your property</Text>
                </Box>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg" onClick={handleAddPackage}>
                    Add Category
                </Button>
            </Flex>

            {loading ? (
                <Flex justify="center" align="center" minH="200px">
                    <Text>Loading packages...</Text>
                </Flex>
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing="24px">
                    {packages.map((pkg) => (
                        <Card key={pkg.id} bg="white" borderRadius="lg"
                            boxShadow="sm"
                            border="1px solid" borderColor="gray.200"
                            opacity={pkg.active ? 1 : 0.6}
                            _hover={{ borderColor: 'blue.300', boxShadow: 'md' }}
                            transition="all 0.2s"
                        >
                            <CardBody p={4}>
                                <Flex justify="space-between" align="flex-start" mb={2}>
                                    <HStack align="flex-start" spacing={3}>
                                        <Box
                                            p={2}
                                            borderRadius="md"
                                            bg={pkg.active ? 'blue.50' : 'orange.50'}
                                            color={pkg.active ? 'blue.500' : 'orange.500'}
                                            display="flex" alignItems="center" justify="center"
                                        >
                                            <Icon as={getIconForPackage(pkg.name)} boxSize={5} />
                                        </Box>
                                        <VStack align="start" spacing={0}>
                                            <Text fontWeight="700" fontSize="md" color="gray.700" lineHeight="1.2">
                                                {pkg.name}
                                            </Text>
                                            <Badge
                                                mt={1}
                                                bg={pkg.active ? 'green.100' : 'orange.100'}
                                                color={pkg.active ? 'green.800' : 'orange.800'}
                                                fontSize="10px"
                                                px={2}
                                                py={0.5}
                                                borderRadius="full"
                                                textTransform="uppercase"
                                                letterSpacing="wider"
                                            >
                                                {pkg.active ? 'ACTIVE' : 'DISABLED'}
                                            </Badge>
                                            <Text fontSize="xs" color="gray.500" mt={1}>
                                                {pkg.type === 'Fixed'
                                                    ? `${pkg.amount ? '₹' + pkg.amount.toLocaleString() : 'Variable'} fixed`
                                                    : 'Variable Amount'}
                                            </Text>
                                        </VStack>
                                    </HStack>
                                    <HStack spacing={1}>
                                        <Switch
                                            colorScheme="blue"
                                            isChecked={pkg.active}
                                            onChange={() => handleToggleStatus(pkg)}
                                            size="sm"
                                        />
                                        <Menu>
                                            <MenuButton as={IconButton} icon={<Icon as={MdEdit} />} variant="ghost" size="sm" aria-label="Options" borderRadius="full" />
                                            <MenuList fontSize="sm">
                                                <MenuItem icon={<MdEdit />} onClick={() => handleEditPackage(pkg)}>
                                                    {isSystemPackage(pkg.name) ? 'View / Edit' : 'Edit'}
                                                </MenuItem>
                                                {!isSystemPackage(pkg.name) && (
                                                    <MenuItem icon={<MdDelete />} color="red.500" onClick={() => confirmDeletePackage(pkg)}>
                                                        Delete
                                                    </MenuItem>
                                                )}
                                            </MenuList>
                                        </Menu>
                                    </HStack>
                                </Flex>

                                <Box mt={6}>
                                    <Button
                                        size="sm"
                                        width="full"
                                        colorScheme={pkg.active ? 'blue' : 'gray'}
                                        variant={pkg.active ? 'outline' : 'solid'}
                                        fontSize="sm"
                                        onClick={() => !pkg.active && handleToggleStatus(pkg)}
                                    >
                                        {pkg.active ? 'Add Dues' : 'Enable'}
                                    </Button>
                                </Box>
                            </CardBody>
                        </Card>
                    ))}
                </SimpleGrid>
            )}

            <AddDuePackageDrawer
                isOpen={isOpen}
                onClose={onClose}
                onPackageAdded={handlePackageSaved}
                packageToEdit={selectedPackage}
                isSystem={selectedPackage ? isSystemPackage(selectedPackage.name) : false}
            />

            <AlertDialog isOpen={isDeleteOpen} leastDestructiveRef={cancelRef} onClose={onDeleteClose}>
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader fontSize="lg" fontWeight="bold">
                            Delete Package
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            Are you sure you want to delete "{packageToDelete?.name}"?
                            This action cannot be undone.
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button ref={cancelRef} onClick={onDeleteClose}>
                                Cancel
                            </Button>
                            <Button colorScheme="red" onClick={handleDeletePackage} ml={3}>
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </DashboardLayout>
    );
}
