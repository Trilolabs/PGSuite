'use client';

import { useState, useEffect } from 'react';
import {
    Box, Flex, Text, Card, CardBody, Button, Input, Select,
    FormControl, FormLabel, SimpleGrid, Divider,
    useDisclosure, Tabs, TabList, TabPanels, Tab, TabPanel, useToast,
    Checkbox, IconButton
} from '@chakra-ui/react';
import { MdAdd, MdClose } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import { useRouter, useSearchParams } from 'next/navigation';
import TenantDetailsDrawer from '@/components/TenantDetailsDrawer';
import RoomSelect from '@/components/RoomSelect';

export default function AddTenantPage() {
    const [step, setStep] = useState(0);
    const { isOpen: isDrawerOpen, onOpen: openDrawer, onClose: closeDrawer } = useDisclosure();
    const toast = useToast();
    const router = useRouter();
    const searchParams = useSearchParams();
    const [loading, setLoading] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        // Personal
        name: '', phone: '', email: '', alternatePhone: '',
        dob: '', gender: 'Male', bloodGroup: '', foodPreference: 'Veg',
        company: '', designation: '', aadhar: '', pan: '',
        currentAddress: '', permanentAddress: '',
        remarks: '', photo: '', // Added photo
        nationality: 'Indian',
        gstNo: '', gstAddress: '',
        fatherName: '', fatherPhone: '', fatherOccupation: '', // Added
        motherName: '', motherPhone: '', motherOccupation: '', // Added
        guardianName: '', guardianPhone: '',
        bankName: '', accountNumber: '', ifscCode: '', upiId: '', // Added
        documents: [], // Added

        tenantType: 'Student', bookedBy: '', referredBy: '',

        // Stay
        stayType: 'Long Stay', moveIn: '', moveOut: '',
        noticePeriod: 30, lockIn: 0, agreementPeriod: 11,
        propertyId: 'PROP001', roomId: '', bed: '', floor: '',

        // Rent
        rent: '', rentalFrequency: 'Monthly', rentStartDate: 1,
        deposit: '', maintenance: '', joiningFee: '',
        electricityType: 'Fixed Amount', electricityRate: '',
        meterNumber: '', initialMeterReading: '', // Added

        // Payment
        openingBalance: '', paymentMode: 'Cash',
        openingBalance: '', paymentMode: 'Cash',
        otherDues: [], // Added for frontend logic only
        newDueLabel: '', newDueAmount: '' // Temp state for adding due
    });

    const [rooms, setRooms] = useState([]);
    const [availableBeds, setAvailableBeds] = useState([]);

    // Fetch Rooms on Mount
    useEffect(() => {
        const fetchRooms = async () => {
            try {
                const res = await fetch('/api/rooms');
                const data = await res.json();
                setRooms(data);
            } catch (error) {
                console.error("Failed to fetch rooms:", error);
            }
        };
        fetchRooms();
    }, []);

    // Handle URL Params (e.g. ?roomId=... or ?bookingId=...)
    useEffect(() => {
        const roomIdParam = searchParams.get('roomId');
        const bookingIdParam = searchParams.get('bookingId');

        if (roomIdParam) {
            setFormData(prev => ({ ...prev, roomId: roomIdParam }));
        }

        if (bookingIdParam) {
            const fetchBooking = async () => {
                try {
                    // Assuming GET /api/bookings returns array, we might need a specific endpoint or filter
                    // For now, filtering client side from list or we can add GET /api/bookings/[id] later
                    // Let's try fetching all and finding (inefficient but works for now)
                    // Better: Update API to support ID. But let's see if we can just pass data via query params? 
                    // No, data handles are better.
                    // Let's assume we can fetch all or filtered.
                    const res = await fetch(`/api/bookings`);
                    const data = await res.json();
                    const booking = data.find(b => b.id === bookingIdParam);

                    if (booking) {
                        setFormData(prev => ({
                            ...prev,
                            name: booking.name,
                            phone: booking.phone,
                            roomId: booking.room ? getRoomIdFromNumber(booking.room, rooms) : prev.roomId, // Helper needed
                            moveIn: booking.moveInDate,
                            // Add Advance as a "Paid" record or negative due? 
                            // For Opening Balance table, we can add it as "Advance Paid"
                            otherDues: booking.advancePaid > 0 ? [{ label: 'Advance Paid (Booking)', amount: -booking.advancePaid }] : []
                        }));
                        toast({ title: 'Booking Details Loaded', status: 'info' });
                    }
                } catch (error) {
                    console.error("Failed to load booking:", error);
                }
            };
            fetchBooking();
        }
    }, [searchParams, rooms]);

    const getRoomIdFromNumber = (number, roomsList) => {
        const r = roomsList.find(room => room.number === number);
        return r ? r.id : '';
    };

    // Filter available beds when Room changes
    useEffect(() => {
        if (formData.roomId) {
            const room = rooms.find(r => r.id === formData.roomId);
            if (room) {
                const beds = Array.from({ length: room.beds }, (_, i) => String.fromCharCode(65 + i)); // A, B, C
                setAvailableBeds(beds);
                setFormData(prev => ({ ...prev, floor: room.floor, rent: room.rent })); // Auto-fill details
            }
        }
    }, [formData.roomId, rooms]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRoomSelect = (roomId) => {
        setFormData(prev => ({ ...prev, roomId }));
    };

    const handleSubmit = async () => {
        // Detailed Validation
        // Detailed Validation - SKIPPED as per user request
        const errors = [];
        // if (!formData.name) errors.push("Name");
        // if (!formData.phone) errors.push("Phone");
        // if (!formData.roomId) errors.push("Room");

        /*
        if (errors.length > 0) {
            toast({
                title: 'Missing Fields',
                description: `Required: ${errors.join(', ')}`,
                status: 'error',
                duration: 5000
            });
            return;
        }
        */

        setLoading(true);
        try {
            // Calculate Total Opening Balance
            const totalRent = parseFloat(formData.rent) || 0;
            const totalDeposit = parseFloat(formData.deposit) || 0;
            const totalOtherDues = formData.otherDues.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);
            const finalOpeningBalance = totalRent + totalDeposit + totalOtherDues;

            const payload = {
                ...formData,
                openingBalance: finalOpeningBalance,
                // Ensure numeric fields are numbers if needed, though state is string/number mixed
                initialMeterReading: parseFloat(formData.initialMeterReading) || 0,
                electricityRate: parseFloat(formData.electricityRate) || 0
            };

            const res = await fetch('/api/tenants', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to add tenant');
            }

            toast({ title: 'Tenant Added', status: 'success', duration: 3000 });
            router.push('/people/tenants');
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    // Filtered lists
    const floors = [...new Set(rooms.map(r => r.floor))];
    const filteredRooms = rooms.filter(r => (!formData.floor || r.floor === formData.floor) && r.status !== 'Maintenance');

    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={5}>
                <Box>
                    <Text fontSize="xl" fontWeight="700">Add Tenant</Text>
                    <Text fontSize="sm" color="gray.500">Fill the form to add tenant details.</Text>
                </Box>
            </Flex>

            <Tabs index={step} onChange={setStep} colorScheme="blue" variant="enclosed-colored" size="sm" mb={5}>
                <TabList>
                    <Tab borderRadius="lg 0 0 0" fontWeight="600">1. Tenant Details</Tab>
                    <Tab fontWeight="600">2. Stay Details</Tab>
                    <Tab fontWeight="600">3. Rental Terms</Tab>
                    <Tab borderRadius="0 lg 0 0" fontWeight="600">4. Payment</Tab>
                </TabList>

                <TabPanels>
                    {/* Step 1: Tenant Details */}
                    <TabPanel p={0} pt={4}>
                        <Card bg="white" borderRadius="xl" boxShadow="sm">
                            <CardBody p={6}>
                                <Text fontWeight="600" mb={4} color="brand.500" fontSize="md">Tenant Details</Text>

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Name</FormLabel>
                                        <Input name="name" value={formData.name} onChange={handleChange} placeholder="Full name" size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Contact Number</FormLabel>
                                        <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="+91" size="sm" borderRadius="lg" type="tel" />
                                        <Checkbox size="sm" colorScheme="blue" mt={1}>Send Whatsapp Rent Reminder</Checkbox>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Tenant Type</FormLabel>
                                        <Select name="tenantType" value={formData.tenantType} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option>Student</option><option>Professional</option><option>Family</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4} mb={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Property</FormLabel>
                                        <Select name="propertyId" value={formData.propertyId} onChange={handleChange} size="sm" borderRadius="lg" isDisabled>
                                            <option value="PROP001">nani</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Room</FormLabel>
                                        <RoomSelect
                                            rooms={rooms}
                                            selectedRoomId={formData.roomId}
                                            onSelect={handleRoomSelect}
                                        />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Other Details</FormLabel>
                                        <Button size="sm" w="full" variant="outline" onClick={openDrawer} rightIcon={<MdAdd />}>
                                            Add Other Details
                                        </Button>
                                    </FormControl>
                                </SimpleGrid>

                                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Booked By</FormLabel>
                                        <Select name="bookedBy" value={formData.bookedBy} onChange={handleChange} size="sm" borderRadius="lg" placeholder="Select Booked By">
                                            <option>Admin</option><option>Agent</option><option>Referral</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Referred By</FormLabel>
                                        <Select name="referredBy" value={formData.referredBy} onChange={handleChange} size="sm" borderRadius="lg" placeholder="Select Referred By">
                                            <option>Admin</option><option>Friend</option><option>Google</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>

                                <Flex justify="flex-end" mt={6}>
                                    <Button colorScheme="blue" size="sm" borderRadius="lg" onClick={() => setStep(1)}>Next: Stay Details →</Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Step 2: Stay Details */}
                    <TabPanel p={0} pt={4}>
                        <Card bg="white" borderRadius="xl" boxShadow="sm">
                            <CardBody p={6}>
                                <Text fontWeight="600" mb={4} color="brand.500" fontSize="md">Stay Details</Text>
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={5}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Stay Type</FormLabel>
                                        <Select name="stayType" value={formData.stayType} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option>Long Stay (Monthly)</option><option>Short Stay (Daily)</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Move-in Date</FormLabel>
                                        <Input name="moveIn" value={formData.moveIn} onChange={handleChange} type="date" size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Move-out Date</FormLabel>
                                        <Input name="moveOut" value={formData.moveOut} onChange={handleChange} type="date" size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Lock-in Period (Months)</FormLabel>
                                        <Select name="lockIn" value={formData.lockIn} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option value={0}>0 Months</option>
                                            <option value={1}>1 Month</option>
                                            <option value={3}>3 Months</option>
                                            <option value={6}>6 Months</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Notice Period (Days)</FormLabel>
                                        <Select name="noticePeriod" value={formData.noticePeriod} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option value={15}>15 Days</option><option value={30}>30 Days</option><option value={45}>45 Days</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Agreement Period</FormLabel>
                                        <Select name="agreementPeriod" value={formData.agreementPeriod} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option value={11}>11 Months</option>
                                            <option value={22}>22 Months</option>
                                        </Select>
                                    </FormControl>
                                </SimpleGrid>



                                <Flex justify="space-between" mt={6}>
                                    <Button variant="outline" size="sm" borderRadius="lg" onClick={() => setStep(0)}>← Back</Button>
                                    <Button colorScheme="blue" size="sm" borderRadius="lg" onClick={() => setStep(2)}>Next: Rental Terms →</Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Step 3: Rental Terms */}
                    <TabPanel p={0} pt={4}>
                        <Card bg="white" borderRadius="xl" boxShadow="sm">
                            <CardBody p={6}>
                                <Text fontWeight="600" mb={4} color="brand.500" fontSize="md">Rental Terms</Text>
                                <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4} mb={5}>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Fixed Rent (₹)</FormLabel>
                                        <Input name="rent" type="number" value={formData.rent} onChange={handleChange} placeholder="0" size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Security Deposit (₹)</FormLabel>
                                        <Input name="deposit" type="number" value={formData.deposit} onChange={handleChange} placeholder="0" size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Rental Frequency</FormLabel>
                                        <Select name="rentalFrequency" value={formData.rentalFrequency} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option>Monthly</option><option>Quarterly</option>
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Add Rent On</FormLabel>
                                        <Select name="rentStartDate" value={formData.rentStartDate} onChange={handleChange} size="sm" borderRadius="lg">
                                            {[...Array(31).keys()].map(i => (
                                                <option key={i + 1} value={i + 1}>{i + 1}</option>
                                            ))}
                                        </Select>
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs" color="gray.600">Electricity Meter</FormLabel>
                                        <Select name="electricityType" value={formData.electricityType} onChange={handleChange} size="sm" borderRadius="lg">
                                            <option>Fixed Amount</option>
                                            <option>Submeter</option>
                                        </Select>
                                    </FormControl>
                                    {formData.electricityType === 'Submeter' && (
                                        <>
                                            <FormControl>
                                                <FormLabel fontSize="xs" color="gray.600">Meter Number</FormLabel>
                                                <Input name="meterNumber" value={formData.meterNumber} onChange={handleChange} placeholder="Meter No" size="sm" borderRadius="lg" />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="xs" color="gray.600">Initial Reading</FormLabel>
                                                <Input name="initialMeterReading" type="number" value={formData.initialMeterReading} onChange={handleChange} placeholder="0" size="sm" borderRadius="lg" />
                                            </FormControl>
                                            <FormControl>
                                                <FormLabel fontSize="xs" color="gray.600">Rate per Unit (₹)</FormLabel>
                                                <Input name="electricityRate" type="number" value={formData.electricityRate} onChange={handleChange} placeholder="0" size="sm" borderRadius="lg" />
                                            </FormControl>
                                        </>
                                    )}
                                </SimpleGrid>

                                <Flex justify="space-between" mt={6}>
                                    <Button variant="outline" size="sm" borderRadius="lg" onClick={() => setStep(1)}>← Back</Button>
                                    <Button colorScheme="blue" size="sm" borderRadius="lg" onClick={() => setStep(3)}>Next: Payment →</Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </TabPanel>

                    {/* Step 4: Payment */}
                    <TabPanel p={0} pt={4}>
                        <Card bg="white" borderRadius="xl" boxShadow="sm">
                            <CardBody p={6}>
                                <Text fontWeight="600" mb={4} color="brand.500" fontSize="md">Opening Balance</Text>

                                <Box overflowX="auto" border="1px solid" borderColor="gray.100" borderRadius="xl">
                                    <Box as="table" w="full" style={{ borderCollapse: 'collapse' }}>
                                        <Box as="thead" bg="gray.50">
                                            <Box as="tr">
                                                <Box as="th" p={3} textAlign="left" fontSize="xs" color="gray.500" fontWeight="600">DUE TYPE</Box>
                                                <Box as="th" p={3} textAlign="left" fontSize="xs" color="gray.500" fontWeight="600">DUE FOR</Box>
                                                <Box as="th" p={3} textAlign="right" fontSize="xs" color="gray.500" fontWeight="600">DUE AMOUNT</Box>
                                            </Box>
                                        </Box>
                                        <Box as="tbody">
                                            <Box as="tr" borderTop="1px solid" borderColor="gray.100">
                                                <Box as="td" p={3} fontSize="sm">Security Deposit</Box>
                                                <Box as="td" p={3} fontSize="sm">One Time</Box>
                                                <Box as="td" p={3} textAlign="right" fontSize="sm" fontWeight="600">₹{parseFloat(formData.deposit) || 0}</Box>
                                            </Box>
                                            <Box as="tr" borderTop="1px solid" borderColor="gray.100">
                                                <Box as="td" p={3} fontSize="sm">Rent</Box>
                                                <Box as="td" p={3} fontSize="sm">{new Date(formData.moveIn || Date.now()).toLocaleString('default', { month: 'short', year: 'numeric' })}</Box>
                                                <Box as="td" p={3} textAlign="right" fontSize="sm" fontWeight="600">₹{parseFloat(formData.rent) || 0}</Box>
                                            </Box>
                                            {/* Other Dues Logic */}
                                            {formData.otherDues.map((due, index) => (
                                                <Box as="tr" key={index} borderTop="1px solid" borderColor="gray.100">
                                                    <Box as="td" p={3} fontSize="sm">{due.label}</Box>
                                                    <Box as="td" p={3} fontSize="sm">One Time</Box>
                                                    <Box as="td" p={3} textAlign="right" fontSize="sm" fontWeight="600">
                                                        ₹{due.amount}
                                                        <IconButton icon={<MdClose />} size="xs" variant="ghost" colorScheme="red" ml={2} onClick={() => {
                                                            const newDues = formData.otherDues.filter((_, i) => i !== index);
                                                            setFormData(prev => ({ ...prev, otherDues: newDues }));
                                                        }} />
                                                    </Box>
                                                </Box>
                                            ))}
                                            <Box as="tr">
                                                <Box as="td" colSpan={3} p={3}>
                                                    {/* Inline Add Due Form */}
                                                    <Flex gap={2}>
                                                        <Input
                                                            placeholder="Due Name (e.g. WiFi)"
                                                            size="xs"
                                                            borderRadius="md"
                                                            value={formData.newDueLabel}
                                                            onChange={(e) => setFormData(p => ({ ...p, newDueLabel: e.target.value }))}
                                                        />
                                                        <Input
                                                            placeholder="Amount"
                                                            type="number"
                                                            size="xs"
                                                            borderRadius="md"
                                                            w="80px"
                                                            value={formData.newDueAmount}
                                                            onChange={(e) => setFormData(p => ({ ...p, newDueAmount: e.target.value }))}
                                                        />
                                                        <Button
                                                            size="xs"
                                                            leftIcon={<MdAdd />}
                                                            colorScheme="blue"
                                                            variant="outline"
                                                            onClick={() => {
                                                                if (formData.newDueLabel && formData.newDueAmount) {
                                                                    setFormData(prev => ({
                                                                        ...prev,
                                                                        otherDues: [...prev.otherDues, { label: prev.newDueLabel, amount: prev.newDueAmount }],
                                                                        newDueLabel: '',
                                                                        newDueAmount: ''
                                                                    }));
                                                                }
                                                            }}
                                                        >
                                                            Add
                                                        </Button>
                                                    </Flex>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <Box as="tfoot" bg="gray.50">
                                            <Box as="tr" borderTop="1px solid" borderColor="gray.200">
                                                <Box as="td" p={3} colSpan={2} textAlign="right" fontSize="sm" fontWeight="700">Total Payable</Box>
                                                <Box as="td" p={3} textAlign="right" fontSize="sm" fontWeight="700" color="brand.500">
                                                    ₹{(parseFloat(formData.rent) || 0) + (parseFloat(formData.deposit) || 0) + formData.otherDues.reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0)}
                                                </Box>
                                            </Box>
                                        </Box>

                                    </Box>
                                </Box>


                                <Flex justify="space-between" mt={6}>
                                    <Button variant="outline" size="sm" borderRadius="lg" onClick={() => setStep(2)}>← Back</Button>
                                    <Button colorScheme="blue" size="sm" borderRadius="lg" onClick={handleSubmit} isLoading={loading}>Add Tenant</Button>
                                </Flex>
                            </CardBody>
                        </Card>
                    </TabPanel>
                </TabPanels>
            </Tabs>

            <TenantDetailsDrawer
                isOpen={isDrawerOpen}
                onClose={closeDrawer}
                formData={formData}
                onChange={handleChange}
            />
        </DashboardLayout >
    );
}
