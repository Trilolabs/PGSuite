import {
    Drawer, DrawerBody, DrawerContent, DrawerHeader, DrawerOverlay,
    VStack, FormControl, FormLabel, Input, Select, Textarea,
    Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon,
    Box, SimpleGrid, IconButton
} from '@chakra-ui/react';
import { MdClose } from 'react-icons/md';

export default function TenantDetailsDrawer({ isOpen, onClose, formData, onChange }) {
    return (
        <Drawer isOpen={isOpen} placement="right" onClose={onClose} size="md">
            <DrawerOverlay />
            <DrawerContent>
                <DrawerHeader borderBottomWidth="1px" display="flex" justifyContent="space-between" alignItems="center">
                    Other Details
                    <IconButton icon={<MdClose />} size="sm" variant="ghost" onClick={onClose} />
                </DrawerHeader>

                <DrawerBody p={0}>
                    <Accordion allowToggle defaultIndex={[0]}>

                        {/* Personal Details */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Personal Details</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Remarks</FormLabel>
                                        <Textarea name="remarks" value={formData.remarks} onChange={onChange} size="sm" borderRadius="lg" placeholder="Add remarks here" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Email Address</FormLabel>
                                        <Input name="email" value={formData.email} onChange={onChange} size="sm" borderRadius="lg" placeholder="Enter email" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Alternate Contact Number</FormLabel>
                                        <Input name="alternatePhone" value={formData.alternatePhone} onChange={onChange} size="sm" borderRadius="lg" placeholder="Alternate Info" />
                                    </FormControl>
                                    <SimpleGrid columns={2} spacing={3} w="full">
                                        <FormControl>
                                            <FormLabel fontSize="xs">Food Preference</FormLabel>
                                            <Select name="foodPreference" value={formData.foodPreference} onChange={onChange} size="sm" borderRadius="lg">
                                                <option>Veg</option><option>Non-Veg</option><option>Both</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs">Date of Birth</FormLabel>
                                            <Input name="dob" value={formData.dob} onChange={onChange} type="date" size="sm" borderRadius="lg" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs">Gender</FormLabel>
                                            <Select name="gender" value={formData.gender} onChange={onChange} size="sm" borderRadius="lg">
                                                <option>Male</option><option>Female</option><option>Other</option>
                                            </Select>
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs">Blood Group</FormLabel>
                                            <Select name="bloodGroup" value={formData.bloodGroup} onChange={onChange} size="sm" borderRadius="lg" placeholder="Select">
                                                <option>A+</option><option>B+</option><option>O+</option><option>AB+</option><option>A-</option><option>B-</option><option>O-</option><option>AB-</option>
                                            </Select>
                                        </FormControl>
                                    </SimpleGrid>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Profile Photo URL</FormLabel>
                                        <Input name="photo" value={formData.photo} onChange={onChange} size="sm" borderRadius="lg" placeholder="https://..." />
                                    </FormControl>
                                    <SimpleGrid columns={2} spacing={3} w="full">
                                        <FormControl>
                                            <FormLabel fontSize="xs">Aadhar Number</FormLabel>
                                            <Input name="aadhar" value={formData.aadhar} onChange={onChange} size="sm" borderRadius="lg" />
                                        </FormControl>
                                        <FormControl>
                                            <FormLabel fontSize="xs">PAN Number</FormLabel>
                                            <Input name="pan" value={formData.pan} onChange={onChange} size="sm" borderRadius="lg" />
                                        </FormControl>
                                    </SimpleGrid>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Current Address */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Current Address</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs">Address</FormLabel>
                                    <Textarea name="currentAddress" value={formData.currentAddress} onChange={onChange} size="sm" borderRadius="lg" placeholder="Enter current address" />
                                </FormControl>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Permanent Address */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Permanent Address</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs">Address</FormLabel>
                                    <Textarea name="permanentAddress" value={formData.permanentAddress} onChange={onChange} size="sm" borderRadius="lg" placeholder="Enter permanent address" />
                                </FormControl>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Nationality */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Nationality</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <FormControl>
                                    <FormLabel fontSize="xs">Nationality</FormLabel>
                                    <Select name="nationality" value={formData.nationality} onChange={onChange} size="sm" borderRadius="lg">
                                        <option>Indian</option><option>Other</option>
                                    </Select>
                                </FormControl>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* GST Details */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">GST Details</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs">GST No</FormLabel>
                                        <Input name="gstNo" value={formData.gstNo} onChange={onChange} size="sm" borderRadius="lg" placeholder="Enter GST No" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">GST Address</FormLabel>
                                        <Textarea name="gstAddress" value={formData.gstAddress} onChange={onChange} size="sm" borderRadius="lg" placeholder="Enter GST Address" />
                                    </FormControl>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Parent Details */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Parent Details</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Father's Name</FormLabel>
                                        <Input name="fatherName" value={formData.fatherName} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Father's Phone</FormLabel>
                                        <Input name="fatherPhone" value={formData.fatherPhone} onChange={onChange} size="sm" borderRadius="lg" type="tel" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Father's Occupation</FormLabel>
                                        <Input name="fatherOccupation" value={formData.fatherOccupation} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Mother's Name</FormLabel>
                                        <Input name="motherName" value={formData.motherName} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Mother's Phone</FormLabel>
                                        <Input name="motherPhone" value={formData.motherPhone} onChange={onChange} size="sm" borderRadius="lg" type="tel" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Mother's Occupation</FormLabel>
                                        <Input name="motherOccupation" value={formData.motherOccupation} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Local Guardian Details */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Local Guardian Details</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Guardian Name</FormLabel>
                                        <Input name="guardianName" value={formData.guardianName} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Guardian Phone</FormLabel>
                                        <Input name="guardianPhone" value={formData.guardianPhone} onChange={onChange} size="sm" borderRadius="lg" type="tel" />
                                    </FormControl>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Bank Details */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Bank Details</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Bank Name</FormLabel>
                                        <Input name="bankName" value={formData.bankName} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">Account Number</FormLabel>
                                        <Input name="accountNumber" value={formData.accountNumber} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">IFSC Code</FormLabel>
                                        <Input name="ifscCode" value={formData.ifscCode} onChange={onChange} size="sm" borderRadius="lg" />
                                    </FormControl>
                                    <FormControl>
                                        <FormLabel fontSize="xs">UPI ID</FormLabel>
                                        <Input name="upiId" value={formData.upiId} onChange={onChange} size="sm" borderRadius="lg" placeholder="user@upi" />
                                    </FormControl>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                        {/* Documents */}
                        <AccordionItem>
                            <h2>
                                <AccordionButton>
                                    <Box flex="1" textAlign="left" fontWeight="600">Documents</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                            </h2>
                            <AccordionPanel pb={4}>
                                <VStack spacing={4}>
                                    <FormControl>
                                        <FormLabel fontSize="xs">ID Proof (Google Drive Link etc)</FormLabel>
                                        <Input name="idProof" value={formData.idProof || ''} onChange={onChange} size="sm" borderRadius="lg" placeholder="Paste link to ID Proof" />
                                    </FormControl>
                                    {/* Placeholder for future uploads */}
                                    <Box border="1px dashed" borderColor="gray.300" borderRadius="lg" p={4} w="full" textAlign="center" color="gray.500" fontSize="xs">
                                        Document Upload Integration Coming Soon
                                    </Box>
                                </VStack>
                            </AccordionPanel>
                        </AccordionItem>

                    </Accordion>
                </DrawerBody>
            </DrawerContent>
        </Drawer>
    );
}
