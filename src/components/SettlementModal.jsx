'use client';

import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, VStack, useToast, Text, HStack, Divider, Box
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function SettlementModal({ isOpen, onClose, tenant, onSettled }) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();
    const [dues, setDues] = useState([]);
    const [loadingDues, setLoadingDues] = useState(false);

    // Initial State
    const [formData, setFormData] = useState({
        moveOutDate: new Date().toISOString().split('T')[0],
        deductions: '',
        deductionReason: '',
        paymentMode: 'Cash', // If money is paid/received
    });

    // Fetch Dues when tenant selected
    useEffect(() => {
        if (isOpen && tenant) {
            const fetchDues = async () => {
                setLoadingDues(true);
                try {
                    const res = await fetch(`/api/dues?tenantId=${tenant.id}&status=Unpaid`);
                    const data = await res.json();
                    setDues(data);
                } catch (error) {
                    console.error("Failed to fetch dues:", error);
                } finally {
                    setLoadingDues(false);
                }
            };
            fetchDues();
        }
    }, [isOpen, tenant]);

    const totalUnpaidDues = dues.reduce((sum, d) => sum + (d.amount || 0), 0);
    const deposit = tenant?.deposit || 0;
    const deductions = parseFloat(formData.deductions) || 0;

    // Settlement Calculation
    // Positive = We pay them (Refund). Negative = They pay us (Recovery).
    const settlementAmount = deposit - totalUnpaidDues - deductions;
    const settlementStatus = settlementAmount >= 0 ? 'Refundable' : 'Recovery Needed';

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                moveOutDate: formData.moveOutDate,
                deductions: deductions,
                totalStay: 'Unknown', // Calculate on backend or approx here
                pendingDues: totalUnpaidDues,
                pendingAmount: Math.abs(settlementAmount),
                settlement: settlementAmount === 0 ? 'Fully Settled' : (settlementAmount > 0 ? 'Refund Pending' : 'Recovery Pending'),
                depositRefunded: false, // Explicit action usually
            };

            const res = await fetch(`/api/tenants/${tenant.id}/settle`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to process settlement');

            toast({ title: 'Tenant Moved Out & Settled', status: 'success' });
            onSettled();
            onClose();
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    if (!tenant) return null;

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
            <ModalOverlay />
            <ModalContent borderRadius="xl">
                <ModalHeader>Settle & Move Out: {tenant.name}</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4} align="stretch">
                        <Box bg="blue.50" p={3} borderRadius="md">
                            <Text fontWeight="bold" fontSize="sm" mb={2}>Financial Overview</Text>
                            <HStack justify="space-between" fontSize="sm">
                                <Text>Security Deposit:</Text>
                                <Text fontWeight="600" color="green.600">₹{deposit.toLocaleString('en-IN')}</Text>
                            </HStack>
                            <HStack justify="space-between" fontSize="sm" mt={1}>
                                <Text>Pending Dues:</Text>
                                <Text fontWeight="600" color="red.500">- ₹{totalUnpaidDues.toLocaleString('en-IN')}</Text>
                            </HStack>
                        </Box>

                        <FormControl>
                            <FormLabel fontSize="sm">Move Out Date</FormLabel>
                            <Input name="moveOutDate" type="date" value={formData.moveOutDate} onChange={handleChange} size="sm" borderRadius="lg" />
                        </FormControl>

                        <FormControl>
                            <FormLabel fontSize="sm">Deductions (Repair/Maintenance)</FormLabel>
                            <Input
                                name="deductions"
                                type="number"
                                placeholder="0"
                                value={formData.deductions}
                                onChange={handleChange}
                                size="sm"
                                borderRadius="lg"
                            />
                        </FormControl>

                        <Divider />

                        <Box p={3} borderRadius="md" bg={settlementAmount >= 0 ? "green.50" : "red.50"} border="1px dashed" borderColor={settlementAmount >= 0 ? "green.200" : "red.200"}>
                            <HStack justify="space-between">
                                <Text fontWeight="bold" fontSize="md">{settlementAmount >= 0 ? "Refund Amount" : "Amount to Recover"}</Text>
                                <Text fontWeight="800" fontSize="xl" color={settlementAmount >= 0 ? "green.600" : "red.600"}>
                                    ₹{Math.abs(settlementAmount).toLocaleString('en-IN')}
                                </Text>
                            </HStack>
                            <Text fontSize="xs" color="gray.500" mt={1}>
                                {settlementAmount >= 0
                                    ? "Amount to be returned to tenant"
                                    : "Amount tenant needs to pay before leaving"}
                            </Text>
                        </Box>

                        {/* Note: Actual payment recording logic can be done here or separately. For now, we just mark as settled/pending. */}
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">Cancel</Button>
                    <Button colorScheme="red" onClick={handleSubmit} isLoading={loading} borderRadius="lg">
                        Confirm Move Out
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
