'use client';

import {
    Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    Button, FormControl, FormLabel, Input, Select, VStack, useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function AddBookingDrawer({ isOpen, onClose, onBookingAdded }) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [rooms, setRooms] = useState([]);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        room: '', // Room Number string
        bookingDate: new Date().toISOString().split('T')[0],
        moveInDate: '',
        amount: '', // Rent Amount (optional/estimated)
        tokenAmount: '', // Advance Paid
    });

    // Fetch vacant rooms for selection
    useEffect(() => {
        if (isOpen) {
            fetch('/api/rooms?status=Vacant')
                .then(res => res.json())
                .then(data => setRooms(data))
                .catch(err => console.error(err));
        }
    }, [isOpen]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name || !formData.phone || !formData.moveInDate) {
            toast({ title: 'Please fill required fields', status: 'error' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                name: formData.name,
                phone: formData.phone,
                room: formData.room,
                bookingDate: formData.bookingDate,
                moveInDate: formData.moveInDate,
                amount: parseFloat(formData.amount) || 0,
                advancePaid: parseFloat(formData.tokenAmount) || 0,
                status: 'Pending',
                propertyId: 'PROP001', // Default properties
            };

            const res = await fetch('/api/bookings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to create booking');

            toast({ title: 'Booking Created Successfully', status: 'success' });
            onBookingAdded();
            onClose();
            setFormData({
                name: '', phone: '', room: '',
                bookingDate: new Date().toISOString().split('T')[0],
                moveInDate: '', amount: '', tokenAmount: ''
            });

        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">Add New Booking</DrawerHeader>

                <DrawerBody>
                    <VStack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel>Tenant Name</FormLabel>
                            <Input name="name" value={formData.name} onChange={handleChange} placeholder="Enter full name" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Phone Number</FormLabel>
                            <Input name="phone" value={formData.phone} onChange={handleChange} placeholder="10-digit mobile number" />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Select Room (Optional)</FormLabel>
                            <Select name="room" value={formData.room} onChange={handleChange} placeholder="Select a vacant room">
                                {rooms.map(r => (
                                    <option key={r.id} value={r.number}>{r.number} ({r.type} - ₹{r.rent})</option>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Move In Date</FormLabel>
                            <Input type="date" name="moveInDate" value={formData.moveInDate} onChange={handleChange} />
                        </FormControl>

                        <FormControl>
                            <FormLabel>Rent Amount (Agreed)</FormLabel>
                            <Input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="Monthly Rent" />
                        </FormControl>

                        <FormControl isRequired>
                            <FormLabel>Token Amount (Advance)</FormLabel>
                            <Input type="number" name="tokenAmount" value={formData.tokenAmount} onChange={handleChange} placeholder="Amount paid to book" />
                        </FormControl>
                    </VStack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px">
                    <Button variant="outline" mr={3} onClick={onClose}>Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>Save Booking</Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
