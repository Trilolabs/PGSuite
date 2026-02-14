'use client';

import { useState } from 'react';
import {
    Box, Flex, Text, Card, CardBody, SimpleGrid, Input, InputGroup, InputLeftElement, Icon,
    Divider, VStack, HStack, Switch, FormControl, FormLabel, Select, Textarea,
    Drawer, DrawerOverlay, DrawerContent, DrawerCloseButton, DrawerHeader, DrawerBody, DrawerFooter,
    useDisclosure, Button,
} from '@chakra-ui/react';
import {
    MdSearch, MdHome, MdPeople, MdPayment, MdDescription, MdLanguage, MdChat,
    MdPersonAdd, MdPersonRemove, MdWeb, MdAccessTime, MdRestaurant, MdSettings,
} from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';

// Settings cards matching Rentok's exact layout with drawer content
const settingsGroups = [
    {
        title: 'Property Management & Financial',
        items: [
            {
                icon: MdHome,
                title: 'Property Settings',
                description: 'View and update property details',
                drawerContent: [
                    {
                        section: 'Basic Details', fields: [
                            { label: 'Property Name', type: 'input', placeholder: 'Sunrise PG' },
                            { label: 'Property Type', type: 'select', options: ['PG', 'Hostel', 'Co-Living', 'Apartment'] },
                            { label: 'Gender Preference', type: 'select', options: ['Male', 'Female', 'Co-Ed'] },
                            { label: 'Address', type: 'textarea', placeholder: 'Full property address' },
                            { label: 'City', type: 'input', placeholder: 'City' },
                            { label: 'State', type: 'input', placeholder: 'State' },
                            { label: 'PIN Code', type: 'input', placeholder: 'PIN Code' },
                        ]
                    },
                    {
                        section: 'Location & Map', fields: [
                            { label: 'Google Maps Link', type: 'input', placeholder: 'https://maps.google.com/...' },
                            { label: 'Latitude', type: 'input', placeholder: '17.XXXXX' },
                            { label: 'Longitude', type: 'input', placeholder: '78.XXXXX' },
                        ]
                    },
                    {
                        section: 'Curfew Timings', fields: [
                            { label: 'Gate Opening Time', type: 'input', placeholder: '06:00 AM', inputType: 'time' },
                            { label: 'Gate Closing Time', type: 'input', placeholder: '11:00 PM', inputType: 'time' },
                            { label: 'Enable Curfew', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdPeople,
                title: 'Management Details',
                description: 'Configure management settings',
                drawerContent: [
                    {
                        section: 'Manager Information', fields: [
                            { label: 'Manager Name', type: 'input', placeholder: 'Enter name' },
                            { label: 'Manager Phone', type: 'input', placeholder: '+91 XXXXXXXXXX' },
                            { label: 'Manager Email', type: 'input', placeholder: 'email@example.com' },
                        ]
                    },
                    {
                        section: 'Permissions', fields: [
                            { label: 'Allow Manager to Add Tenants', type: 'switch' },
                            { label: 'Allow Manager to Collect Payments', type: 'switch' },
                            { label: 'Allow Manager to Edit Rooms', type: 'switch' },
                            { label: 'Allow Manager to View Reports', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdDescription,
                title: 'Renting & Stay Rules',
                description: 'Set rules for renting and stays',
                drawerContent: [
                    {
                        section: 'Default Stay Rules', fields: [
                            { label: 'Default Notice Period (days)', type: 'select', options: ['15', '30', '45', '60', '90'] },
                            { label: 'Default Lock-in Period (months)', type: 'select', options: ['0', '3', '6', '11', '12'] },
                            { label: 'Default Agreement Period (months)', type: 'select', options: ['6', '11', '12', '24'] },
                            { label: 'Default Security Deposit (₹)', type: 'input', placeholder: '5000' },
                        ]
                    },
                    {
                        section: 'Rental Configuration', fields: [
                            { label: 'Allow Short Stay', type: 'switch' },
                            { label: 'Allow Room Upgrades', type: 'switch' },
                            { label: 'Auto Renew Agreement', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdPayment,
                title: 'Dues & Payment Settings',
                description: 'Configure payment settings',
                drawerContent: [
                    {
                        section: 'Rent Cycle', fields: [
                            { label: 'Rent Start Date', type: 'select', options: Array.from({ length: 28 }, (_, i) => `${i + 1}`) },
                            { label: 'Auto Generate Rent', type: 'switch' },
                            { label: 'Rent Generation Day', type: 'select', options: Array.from({ length: 28 }, (_, i) => `${i + 1}`) },
                        ]
                    },
                    {
                        section: 'Late Fees & Fines', fields: [
                            { label: 'Enable Late Fee', type: 'switch' },
                            { label: 'Late Fee Amount (₹)', type: 'input', placeholder: '100' },
                            { label: 'Grace Period (days)', type: 'input', placeholder: '5' },
                            { label: 'Fine Type', type: 'select', options: ['Fixed Amount', 'Per Day', 'Percentage'] },
                        ]
                    },
                    {
                        section: 'Tax & Gateway', fields: [
                            { label: 'Enable GST', type: 'switch' },
                            { label: 'GST Percentage', type: 'input', placeholder: '18' },
                            { label: 'Enable Online Payment', type: 'switch' },
                            { label: 'Payment Gateway', type: 'select', options: ['Razorpay', 'PayU', 'PhonePe', 'None'] },
                        ]
                    },
                ],
            },
            {
                icon: MdLanguage,
                title: 'My Website Details',
                description: 'Manage your website information',
                drawerContent: [
                    {
                        section: 'Website Information', fields: [
                            { label: 'Website URL', type: 'input', placeholder: 'https://yourpg.rentok.com' },
                            { label: 'Description', type: 'textarea', placeholder: 'About your PG...' },
                            { label: 'Contact Email (Public)', type: 'input', placeholder: 'contact@yourpg.com' },
                            { label: 'Contact Phone (Public)', type: 'input', placeholder: '+91 XXXXXXXXXX' },
                        ]
                    },
                    {
                        section: 'SEO & Visibility', fields: [
                            { label: 'Show on Rentok Website', type: 'switch' },
                            { label: 'Enable Google Indexing', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdChat,
                title: 'Chat Widget Settings',
                description: 'Configure and embed WhatsApp chat widget on your website',
                drawerContent: [
                    {
                        section: 'WhatsApp Configuration', fields: [
                            { label: 'Enable Chat Widget', type: 'switch' },
                            { label: 'WhatsApp Number', type: 'input', placeholder: '+91 XXXXXXXXXX' },
                            { label: 'Welcome Message', type: 'textarea', placeholder: 'Hi! How can I help you?' },
                            { label: 'Widget Position', type: 'select', options: ['Bottom Right', 'Bottom Left'] },
                            { label: 'Widget Color', type: 'input', placeholder: '#25D366', inputType: 'color' },
                        ]
                    },
                ],
            },
        ],
    },
    {
        title: 'Tenant Management',
        items: [
            {
                icon: MdPersonAdd,
                title: 'Tenant Onboarding & KYC Settings',
                description: 'Manage tenant verification process',
                drawerContent: [
                    {
                        section: 'KYC Requirements', fields: [
                            { label: 'Require Aadhar Verification', type: 'switch' },
                            { label: 'Require PAN Verification', type: 'switch' },
                            { label: 'Require Photo ID', type: 'switch' },
                            { label: 'Require Address Proof', type: 'switch' },
                        ]
                    },
                    {
                        section: 'Onboarding Workflow', fields: [
                            { label: 'Auto Approve Tenants', type: 'switch' },
                            { label: 'Send Welcome Message', type: 'switch' },
                            { label: 'Welcome Message Template', type: 'textarea', placeholder: 'Welcome to our PG!' },
                            { label: 'Mandatory Food Preference', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdPersonRemove,
                title: 'Eviction Settings',
                description: 'Configure eviction policies',
                drawerContent: [
                    {
                        section: 'Eviction Rules', fields: [
                            { label: 'Enable Eviction Process', type: 'switch' },
                            { label: 'Eviction Notice Period (days)', type: 'select', options: ['7', '15', '30'] },
                            { label: 'Auto Calculate Settlement', type: 'switch' },
                            { label: 'Deduct Security Deposit on Eviction', type: 'switch' },
                        ]
                    },
                    {
                        section: 'Notification', fields: [
                            { label: 'Send Eviction Notice via WhatsApp', type: 'switch' },
                            { label: 'Send Eviction Notice via Email', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdWeb,
                title: 'Web Checkin Settings',
                description: 'Manage web checkin settings',
                drawerContent: [
                    {
                        section: 'Web Check-in Configuration', fields: [
                            { label: 'Enable Web Check-in', type: 'switch' },
                            { label: 'Check-in Link', type: 'input', placeholder: 'https://yourpg.com/checkin' },
                            { label: 'Require OTP Verification', type: 'switch' },
                            { label: 'Auto Assign Room', type: 'switch' },
                            { label: 'Collect Payment at Check-in', type: 'switch' },
                        ]
                    },
                ],
            },
        ],
    },
    {
        title: 'Attendance & Food',
        items: [
            {
                icon: MdAccessTime,
                title: 'Attendance Settings',
                description: 'Manage attendance configurations',
                drawerContent: [
                    {
                        section: 'Attendance Configuration', fields: [
                            { label: 'Enable Attendance Tracking', type: 'switch' },
                            { label: 'Check-in Time', type: 'input', placeholder: '09:00 AM', inputType: 'time' },
                            { label: 'Check-out Time', type: 'input', placeholder: '06:00 PM', inputType: 'time' },
                            { label: 'Allow Late Check-in', type: 'switch' },
                            { label: 'Late Threshold (minutes)', type: 'input', placeholder: '30' },
                        ]
                    },
                    {
                        section: 'Notifications', fields: [
                            { label: 'Send Absent Notification', type: 'switch' },
                            { label: 'Notify Manager', type: 'switch' },
                        ]
                    },
                ],
            },
            {
                icon: MdRestaurant,
                title: 'Food Attendance Settings',
                description: 'Manage food service and meal timings',
                drawerContent: [
                    {
                        section: 'Meal Timings', fields: [
                            { label: 'Enable Food Attendance', type: 'switch' },
                            { label: 'Breakfast Time', type: 'input', placeholder: '07:30 AM', inputType: 'time' },
                            { label: 'Lunch Time', type: 'input', placeholder: '12:30 PM', inputType: 'time' },
                            { label: 'Dinner Time', type: 'input', placeholder: '08:00 PM', inputType: 'time' },
                        ]
                    },
                    {
                        section: 'Food Service', fields: [
                            { label: 'Default Meal Plan', type: 'select', options: ['Veg Only', 'Non-Veg Only', 'Both'] },
                            { label: 'Allow Meal Cancellation', type: 'switch' },
                            { label: 'Cancellation Deadline (hours before)', type: 'input', placeholder: '2' },
                            { label: 'Track Meal Count', type: 'switch' },
                        ]
                    },
                ],
            },
        ],
    },
];

function SettingsDrawer({ item, isOpen, onClose }) {
    if (!item) return null;
    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">
                    <HStack>
                        <Icon as={item.icon} boxSize={5} color="brand.500" />
                        <Text fontSize="lg">{item.title}</Text>
                    </HStack>
                </DrawerHeader>
                <DrawerBody py={5}>
                    {item.drawerContent.map((section, idx) => (
                        <Box key={idx} mb={6}>
                            <Text fontWeight="600" fontSize="sm" color="gray.700" mb={3}>{section.section}</Text>
                            <VStack spacing={3} align="stretch">
                                {section.fields.map((field, fidx) => (
                                    <FormControl key={fidx}>
                                        {field.type === 'switch' ? (
                                            <Flex justify="space-between" align="center" bg="gray.50" px={3} py={2} borderRadius="lg">
                                                <FormLabel fontSize="sm" mb={0} color="gray.600">{field.label}</FormLabel>
                                                <Switch size="sm" colorScheme="blue" />
                                            </Flex>
                                        ) : field.type === 'select' ? (
                                            <>
                                                <FormLabel fontSize="xs" color="gray.600">{field.label}</FormLabel>
                                                <Select size="sm" borderRadius="lg">
                                                    {field.options.map(opt => <option key={opt}>{opt}</option>)}
                                                </Select>
                                            </>
                                        ) : field.type === 'textarea' ? (
                                            <>
                                                <FormLabel fontSize="xs" color="gray.600">{field.label}</FormLabel>
                                                <Textarea placeholder={field.placeholder} size="sm" borderRadius="lg" rows={2} />
                                            </>
                                        ) : (
                                            <>
                                                <FormLabel fontSize="xs" color="gray.600">{field.label}</FormLabel>
                                                <Input type={field.inputType || 'text'} placeholder={field.placeholder} size="sm" borderRadius="lg" />
                                            </>
                                        )}
                                    </FormControl>
                                ))}
                            </VStack>
                            {idx < item.drawerContent.length - 1 && <Divider mt={5} />}
                        </Box>
                    ))}
                </DrawerBody>
                <DrawerFooter borderTopWidth="1px">
                    <Button variant="outline" mr={3} onClick={onClose} size="sm">Cancel</Button>
                    <Button colorScheme="blue" size="sm">Save Changes</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}

export default function SettingsPage() {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [activeItem, setActiveItem] = useState(null);

    const openDrawer = (item) => {
        setActiveItem(item);
        onOpen();
    };

    return (
        <DashboardLayout>
            {/* Header - matching Rentok */}
            <Flex justify="space-between" align="center" mb={5}>
                <Text fontSize="xl" fontWeight="700">Settings</Text>
                <InputGroup maxW="300px" size="sm">
                    <InputLeftElement><Icon as={MdSearch} color="gray.400" /></InputLeftElement>
                    <Input placeholder="Search settings" borderRadius="full" bg="white" border="1px solid" borderColor="gray.200" />
                </InputGroup>
            </Flex>

            {/* Settings Groups - matching Rentok card layout */}
            {settingsGroups.map((group, gIdx) => (
                <Box key={gIdx} mb={8}>
                    <Text fontWeight="600" fontSize="md" color="gray.800" mb={4}>{group.title}</Text>
                    <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                        {group.items.map((item, iIdx) => (
                            <Card key={iIdx} bg="white" borderRadius="xl" boxShadow="sm" _hover={{ boxShadow: 'md', transform: 'translateY(-1px)' }}
                                transition="all 0.2s" cursor="pointer" onClick={() => openDrawer(item)}>
                                <CardBody py={5} px={5}>
                                    <HStack spacing={3} align="flex-start">
                                        <Flex bg="blue.50" p={2} borderRadius="lg" align="center" justify="center">
                                            <Icon as={item.icon} boxSize={5} color="brand.500" />
                                        </Flex>
                                        <Box>
                                            <Text fontWeight="600" fontSize="sm">{item.title}</Text>
                                            <Text color="gray.500" fontSize="xs" mt={0.5}>{item.description}</Text>
                                        </Box>
                                    </HStack>
                                </CardBody>
                            </Card>
                        ))}
                    </SimpleGrid>
                    {gIdx < settingsGroups.length - 1 && <Divider mt={6} />}
                </Box>
            ))}

            {/* Settings Drawer */}
            <SettingsDrawer item={activeItem} isOpen={isOpen} onClose={onClose} />
        </DashboardLayout>
    );
}
