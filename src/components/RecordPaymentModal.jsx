import {
    Modal, ModalOverlay, ModalContent, ModalHeader, ModalFooter, ModalBody, ModalCloseButton,
    Button, FormControl, FormLabel, Input, Select, Textarea, VStack, useToast
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';

export default function RecordPaymentModal({ isOpen, onClose, due, onPaymentRecorded, tenants = [] }) {
    const [loading, setLoading] = useState(false);
    const toast = useToast();

    // Initial State
    const [formData, setFormData] = useState({
        tenantId: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        mode: 'Cash',
        reference: '',
        remarks: '',
        propertyId: 'PROP001', // Default
    });

    // Populate form when 'due' or 'isOpen' changes
    useEffect(() => {
        if (isOpen) {
            if (due) {
                // Paying specific due
                setFormData(prev => ({
                    ...prev,
                    tenantId: due.tenantId,
                    amount: due.amount,
                    remarks: `Payment for ${due.type} due`,
                    propertyId: due.propertyId,
                }));
            } else {
                // Generic payment
                setFormData(prev => ({
                    ...prev,
                    tenantId: '',
                    amount: '',
                    remarks: '',
                    propertyId: 'PROP001',
                }));
            }
        }
    }, [isOpen, due]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        if (!formData.tenantId || !formData.amount) {
            toast({ title: 'Error', description: 'Tenant and Amount are required', status: 'error' });
            return;
        }

        setLoading(true);
        try {
            const payload = {
                ...formData,
                amount: parseFloat(formData.amount),
                dueIds: due ? [due.id] : [], // Link to due if present
                receipt: formData.reference || `REC-${Date.now()}` // Auto-gen receipt if empty
            };

            const res = await fetch('/api/collections', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) throw new Error('Failed to record payment');

            toast({ title: 'Payment Recorded', status: 'success' });
            onPaymentRecorded(); // Refresh parent data
            onClose();
        } catch (error) {
            toast({ title: 'Error', description: error.message, status: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="xl">
                <ModalHeader>Record Payment</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    <VStack spacing={4}>
                        <FormControl isDisabled={!!due}>
                            <FormLabel fontSize="sm">Tenant</FormLabel>
                            {/* If tenants list passed, show select, else assume ID is handled or show input */}
                            <Select name="tenantId" value={formData.tenantId} onChange={handleChange} placeholder="Select Tenant" size="sm" borderRadius="lg">
                                {tenants.map(t => (
                                    <option key={t.id} value={t.id}>{t.name} ({t.room?.number || 'No Room'})</option>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Amount (₹)</FormLabel>
                            <Input name="amount" type="number" value={formData.amount} onChange={handleChange} size="sm" borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Payment Date</FormLabel>
                            <Input name="date" type="date" value={formData.date} onChange={handleChange} size="sm" borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Payment Mode</FormLabel>
                            <Select name="mode" value={formData.mode} onChange={handleChange} size="sm" borderRadius="lg">
                                <option>Cash</option>
                                <option>UPI</option>
                                <option>Bank Transfer</option>
                            </Select>
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Reference / Receipt No</FormLabel>
                            <Input name="reference" value={formData.reference} onChange={handleChange} placeholder="Optional" size="sm" borderRadius="lg" />
                        </FormControl>
                        <FormControl>
                            <FormLabel fontSize="sm">Remarks</FormLabel>
                            <Textarea name="remarks" value={formData.remarks} onChange={handleChange} size="sm" borderRadius="lg" />
                        </FormControl>
                    </VStack>
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose} borderRadius="lg">Cancel</Button>
                    <Button colorScheme="blue" onClick={handleSubmit} isLoading={loading} borderRadius="lg">
                        Record Payment
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
}
