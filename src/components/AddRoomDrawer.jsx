'use client';

import {
    Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    Button, Stack, Box, FormLabel, Input, Select, Textarea,
    FormControl, Switch, Flex, Text, Checkbox, SimpleGrid, useToast, Tag, Wrap, WrapItem
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function AddRoomDrawer({ isOpen, onClose, onRoomAdded, propertyId, roomToEdit, existingRooms }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        number: '',
        floor: '',
        type: 'Single', // Sharing Type
        rent: '',
        beds: 1, // Derived from type usually, but kept editable
        status: 'Available',
        amenities: [], // For 'facilities'
        remarks: '',
        propertyId: propertyId || 'PROP001', // Default or passed prop
        isAvailableToRent: true,
        unitType: 'Room',
        tags: []
    });

    useEffect(() => {
        if (roomToEdit) {
            setFormData({
                number: roomToEdit.number,
                floor: roomToEdit.floor,
                type: roomToEdit.type,
                rent: roomToEdit.rent,
                beds: roomToEdit.beds,
                status: roomToEdit.status,
                amenities: JSON.parse(roomToEdit.amenities || '[]'),
                remarks: roomToEdit.remarks,
                propertyId: roomToEdit.propertyId,
                isAvailableToRent: roomToEdit.status !== 'Maintenance',
                unitType: 'Room',
                tags: []
            });
        } else {
            setFormData({
                number: '', floor: '', type: 'Single', rent: '', beds: 1,
                status: 'Available', amenities: [], remarks: '',
                propertyId: propertyId || 'PROP001', isAvailableToRent: true, unitType: 'Room', tags: []
            });
        }
    }, [roomToEdit, isOpen]);

    const facilitiesList = [
        'AC', 'Table', 'TV', 'Washroom', 'Balcony', 'Fridge', 'Almirah', 'Chair',
        'Food', 'Microwave', 'Geyser', 'Laundry', 'CCTV', 'Toilet', 'Cooler'
    ];
    const tagOptions = [
        'Corner Room', 'Large Room', 'Ventilation', 'Furnished', 'Unfurnished', 'Semi-Furnished',
        'Female', 'Male', 'Non Attached', 'Attached', 'Hall', 'Short Term', 'Long Term'
    ];

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSwitchChange = (e) => {
        setFormData(prev => ({ ...prev, isAvailableToRent: e.target.checked }));
    };

    const handleFacilityChange = (facility) => {
        setFormData(prev => {
            const newAmenities = prev.amenities.includes(facility)
                ? prev.amenities.filter(a => a !== facility)
                : [...prev.amenities, facility];
            return { ...prev, amenities: newAmenities };
        });
    };

    const handleTagToggle = (tag) => {
        setFormData(prev => {
            const newTags = prev.tags.includes(tag)
                ? prev.tags.filter(t => t !== tag)
                : [...prev.tags, tag];
            return { ...prev, tags: newTags };
        });
    };

    const handleSubmit = async () => {
        // Validation
        if (!formData.unitType || !formData.number || !formData.floor || !formData.rent) {
            toast({ title: 'Missing Fields', description: 'Unit Type, Room No, Floor, and Amount/Bed are required.', status: 'warning', duration: 3000 });
            return;
        }

        // Duplicate Check
        const isDuplicate = existingRooms?.some(r =>
            r.number === formData.number &&
            r.propertyId === (propertyId || 'PROP001') && // Ensure check is within same property
            (!roomToEdit || r.id !== roomToEdit.id) // Exclude self if editing
        );

        if (isDuplicate) {
            toast({ title: 'Duplicate Room', description: `Room ${formData.number} already exists.`, status: 'error', duration: 3000 });
            return;
        }

        setLoading(true);
        try {
            // Map 'type' to 'beds' logic if needed, or trust user input
            let derivedBeds = 1;
            if (formData.type === '2 Sharing') derivedBeds = 2;
            if (formData.type === '3 Sharing') derivedBeds = 3;
            if (formData.type === '4 Sharing') derivedBeds = 4;
            // logic can be improved but this suffices for simple cases

            const payload = {
                ...formData,
                beds: parseInt(formData.type) || 1, // Simple parse '2 Sharing' -> 2
                rent: parseFloat(formData.rent) || 0,
                // Map switch to status if not available
                status: formData.isAvailableToRent ? 'Vacant' : 'Maintenance',
            };
            // Remove helper fields not in schema
            delete payload.isAvailableToRent;
            delete payload.unitType;
            delete payload.tags;

            const url = roomToEdit ? `/api/rooms/${roomToEdit.id}` : '/api/rooms';
            const method = roomToEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create room');
            }

            toast({ title: roomToEdit ? 'Room updated' : 'Room added successfully', status: 'success', duration: 3000 });
            onRoomAdded(); // Refresh parent list
            onClose();
            // Reset form
            setFormData({
                number: '', floor: '', type: '1 Sharing', rent: '', beds: 1,
                status: 'Available', amenities: [], remarks: '',
                propertyId: propertyId || 'PROP001', isAvailableToRent: true, unitType: 'Room', tags: []
            });

        } catch (error) {
            toast({ title: 'Error adding room', description: error.message, status: 'error', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px">{roomToEdit ? 'Edit Room' : 'Add Room'}</DrawerHeader>

                <DrawerBody>
                    <Stack spacing={4}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm">Room Name / Number</FormLabel>
                            <Input name="number" value={formData.number} onChange={handleChange} placeholder="e.g. 101" />
                        </FormControl>

                        <SimpleGrid columns={2} spacing={3}>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Unit Type</FormLabel>
                                <Select name="unitType" value={formData.unitType} onChange={handleChange}>
                                    <option value="Room">Room</option>
                                    <option value="1 RK">1 RK</option>
                                    <option value="2 RK">2 RK</option>
                                    <option value="1 BHK">1 BHK</option>
                                    <option value="2 BHK">2 BHK</option>
                                    <option value="3 BHK">3 BHK</option>
                                    <option value="4 BHK">4 BHK</option>
                                    <option value="5 BHK">5 BHK</option>
                                    <option value="Studio Apartment">Studio Apartment</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Floor</FormLabel>
                                <Select name="floor" value={formData.floor} onChange={handleChange} placeholder="Select Floor">
                                    <option value="Ground">Ground</option>
                                    <option value="1">1st</option>
                                    <option value="2">2nd</option>
                                    <option value="3">3rd</option>
                                    <option value="4">4th</option>
                                </Select>
                            </FormControl>
                        </SimpleGrid>

                        <SimpleGrid columns={2} spacing={3}>
                            <FormControl>
                                <FormLabel fontSize="sm">Sharing Type</FormLabel>
                                <Select name="type" value={formData.type} onChange={handleChange}>
                                    <option value="1 Sharing">1 Sharing</option>
                                    <option value="2 Sharing">2 Sharing</option>
                                    <option value="3 Sharing">3 Sharing</option>
                                    <option value="4 Sharing">4 Sharing</option>
                                    <option value="5 Sharing">5 Sharing</option>
                                    <option value="6 Sharing">6 Sharing</option>
                                    <option value="7 Sharing">7 Sharing</option>
                                    <option value="8 Sharing">8 Sharing</option>
                                    <option value="9 Sharing">9 Sharing</option>
                                    <option value="10+ Sharing">10+ Sharing</option>
                                </Select>
                            </FormControl>
                            <FormControl isRequired>
                                <FormLabel fontSize="sm">Amount Per Bed</FormLabel>
                                <Input name="rent" type="number" value={formData.rent} onChange={handleChange} placeholder="₹ 0" />
                            </FormControl>
                        </SimpleGrid>

                        <FormControl display="flex" alignItems="center">
                            <FormLabel htmlFor="is-available" mb="0" fontSize="sm" flex="1">
                                Is this room available to rent?
                            </FormLabel>
                            <Switch id="is-available" isChecked={formData.isAvailableToRent} onChange={handleSwitchChange} colorScheme="blue" />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm">Room Facilities</FormLabel>
                            <SimpleGrid columns={2} spacing={2}>
                                {facilitiesList.map(f => (
                                    <Checkbox
                                        key={f}
                                        isChecked={formData.amenities.includes(f)}
                                        onChange={() => handleFacilityChange(f)}
                                        size="sm"
                                    >
                                        {f}
                                    </Checkbox>
                                ))}
                            </SimpleGrid>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm">Room Tags</FormLabel>
                            <Wrap>
                                {tagOptions.map(tag => (
                                    <WrapItem key={tag}>
                                        <Tag
                                            size="sm"
                                            variant={formData.tags.includes(tag) ? 'solid' : 'outline'}
                                            colorScheme="blue"
                                            cursor="pointer"
                                            onClick={() => handleTagToggle(tag)}
                                        >
                                            {tag}
                                        </Tag>
                                    </WrapItem>
                                ))}
                            </Wrap>
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm">Remarks</FormLabel>
                            <Textarea name="remarks" value={formData.remarks} onChange={handleChange} placeholder="Any specific details..." size="sm" />
                        </FormControl>

                    </Stack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px">
                    <Button variant="outline" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        {roomToEdit ? 'Update Room' : 'Create Room'}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
