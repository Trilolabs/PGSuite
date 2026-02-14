'use client';

import {
    Drawer, DrawerBody, DrawerFooter, DrawerHeader, DrawerOverlay, DrawerContent, DrawerCloseButton,
    Button, Stack, Box, FormLabel, Input, Select, Textarea,
    FormControl, Switch, Flex, Text, useToast, NumberInput, NumberInputField, Radio, RadioGroup, Badge
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function AddDuePackageDrawer({ isOpen, onClose, onPackageAdded, propertyId, packageToEdit, isSystem }) {
    const toast = useToast();
    const [loading, setLoading] = useState(false);
    const [billingMode, setBillingMode] = useState('Fixed'); // 'Fixed' or 'Variable'

    const [formData, setFormData] = useState({
        name: '',
        amount: '',
        frequency: 'Monthly',
        deposit: '',
        active: true,
        description: '',
        propertyId: propertyId || 'PROP001',
    });

    useEffect(() => {
        if (packageToEdit) {
            setBillingMode(packageToEdit.type || 'Fixed');
            setFormData({
                name: packageToEdit.name,
                amount: packageToEdit.amount || '',
                frequency: packageToEdit.frequency || 'Monthly',
                deposit: packageToEdit.deposit || '',
                active: packageToEdit.active !== undefined ? packageToEdit.active : true,
                description: packageToEdit.description || '',
                propertyId: packageToEdit.propertyId,
            });
        } else {
            setBillingMode('Variable'); // Default to Variable as per RentOk typical flow? Or Fixed. Let's default to Variable for new.
            setFormData({
                name: '',
                amount: '',
                frequency: 'Monthly',
                deposit: '',
                active: true,
                description: '',
                propertyId: propertyId || 'PROP001',
            });
        }
    }, [packageToEdit, isOpen, propertyId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.name) {
            toast({ title: 'Missing Name', description: 'Package Name is required.', status: 'warning', duration: 3000 });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                type: billingMode,
                amount: billingMode === 'Fixed' && formData.amount ? parseFloat(formData.amount) : null,
                deposit: formData.deposit ? parseFloat(formData.deposit) : 0,
            };

            const url = packageToEdit ? `/api/dues-packages/${packageToEdit.id}` : '/api/dues-packages';
            const method = packageToEdit ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to save package');
            }

            toast({ title: packageToEdit ? 'Category updated' : 'Category added successfully', status: 'success', duration: 3000 });
            onPackageAdded();
            onClose();
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error', duration: 4000 });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerCloseButton />
                <DrawerHeader borderBottomWidth="1px" display="flex" alignItems="center" gap={2}>
                    {packageToEdit ? 'Edit Due Category' : 'Add New Due Category'}
                    {packageToEdit && (
                        <Badge colorScheme={isSystem ? 'green' : 'blue'}>
                            {isSystem ? 'SYSTEM' : 'CUSTOM'}
                        </Badge>
                    )}
                </DrawerHeader>

                <DrawerBody>
                    <Stack spacing={6} mt={4}>
                        <FormControl isRequired>
                            <FormLabel fontSize="sm" fontWeight="600">Category Name</FormLabel>
                            <Input
                                list="categories"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Enter due type name (e.g. Maintenance)"
                                isDisabled={isSystem} // Disable if system package
                            />
                            {isSystem && <Text fontSize="xs" color="gray.500" mt={1}>System category names cannot be modified.</Text>}
                            {!isSystem && (
                                <datalist id="categories">
                                    <option value="Rent" />
                                    <option value="Electricity Bill" />
                                    <option value="Food" />
                                    <option value="Maintenance" />
                                    <option value="Wifi" />
                                </datalist>
                            )}
                        </FormControl>

                        <FormControl as="fieldset">
                            <FormLabel as="legend" fontSize="sm" fontWeight="600">Billing Mode</FormLabel>
                            <RadioGroup onChange={setBillingMode} value={billingMode}>
                                <Stack spacing={3}>
                                    <Radio value="Variable" alignItems="start">
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500">Due amount is different per tenant/room</Text>
                                            <Text fontSize="xs" color="gray.500">You'll set individual amounts when creating dues</Text>
                                        </Box>
                                    </Radio>
                                    <Radio value="Fixed" alignItems="start">
                                        <Box>
                                            <Text fontSize="sm" fontWeight="500">Due amount is fixed</Text>
                                            <Text fontSize="xs" color="gray.500">Same amount for all tenants</Text>
                                        </Box>
                                    </Radio>
                                </Stack>
                            </RadioGroup>
                        </FormControl>

                        {billingMode === 'Fixed' && (
                            <FormControl isRequired>
                                <FormLabel fontSize="sm" fontWeight="600">Fixed Amount (₹)</FormLabel>
                                <Input type="number" name="amount" value={formData.amount} onChange={handleChange} placeholder="0.00" />
                            </FormControl>
                        )}



                        <Box bg="blue.50" p={3} borderRadius="md">
                            <Text fontSize="xs" color="blue.700">
                                This category can be enabled or disabled at any time from the main list.
                            </Text>
                        </Box>
                    </Stack>
                </DrawerBody>

                <DrawerFooter borderTopWidth="1px" justifyContent="space-between">
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading}>
                        {packageToEdit ? 'Update Category' : 'Add Category'}
                    </Button>
                </DrawerFooter>
            </DrawerContent>
        </Drawer>
    );
}
