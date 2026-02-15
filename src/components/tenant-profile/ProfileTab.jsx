import { Box, Grid, GridItem, Text, VStack, Heading, Divider, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon, Badge } from '@chakra-ui/react';

const DetailRow = ({ label, value }) => (
    <Grid templateColumns="1fr 2fr" gap={4} py={2}>
        <GridItem>
            <Text color="gray.500" fontSize="sm">{label}</Text>
        </GridItem>
        <GridItem>
            <Text fontWeight="500" fontSize="sm">{value || '-'}</Text>
        </GridItem>
    </Grid>
);

const Section = ({ title, children, defaultOpen = true }) => (
    <AccordionItem border="none" mb={4} bg="white" borderRadius="md">
        <h2>
            <AccordionButton px={0} _hover={{ bg: 'none' }}>
                <Box flex="1" textAlign="left">
                    <Heading size="sm" color="gray.700" textTransform="uppercase" letterSpacing="wide" fontSize="xs" fontWeight="700">
                        {title}
                    </Heading>
                </Box>
                <AccordionIcon />
            </AccordionButton>
        </h2>
        <AccordionPanel pb={4} px={0}>
            {children}
        </AccordionPanel>
        <Divider borderColor="gray.100" />
    </AccordionItem>
);

const ProfileTab = ({ tenant }) => {
    return (
        <Accordion allowMultiple defaultIndex={[0, 1]}>
            {/* Renting Details */}
            <Section title="Renting Details">
                <DetailRow label="Monthly Rent" value={`₹${tenant.rent}`} />
                <DetailRow label="Security Deposit" value={`₹${tenant.deposit}`} />
                <DetailRow label="Rent Cycle" value={tenant.rentalFrequency} />
                <DetailRow label="Stay Type" value={tenant.stayType} />
                <DetailRow label="Lock-in Period" value={`${tenant.lockIn} Months`} />
                <DetailRow label="Notice Period" value={`${tenant.noticePeriod} Days`} />
                <DetailRow label="Agreement Period" value={`${tenant.agreementPeriod} Months`} />
                <DetailRow label="Move-in Date" value={tenant.moveIn} />
                <DetailRow label="Rent Start Date" value={tenant.rentStartDate} />
                <DetailRow label="Check-in Time" value={tenant.checkInTime} />
                <DetailRow label="Check-out Time" value={tenant.checkOutTime} />
                <DetailRow label="Initial Meter Reading" value={tenant.initialMeterReading} />
                <DetailRow label="Current Meter Reading" value={tenant.lastMeterReading} />
            </Section>

            {/* Tenant Personal Details */}
            <Section title="Tenant Personal Details">
                <DetailRow label="Full Name" value={tenant.name} />
                <DetailRow label="Phone" value={tenant.phone} />
                <DetailRow label="Email" value={tenant.email} />
                <DetailRow label="Date of Birth" value={tenant.dob} />
                <DetailRow label="Gender" value={tenant.gender} />
                <DetailRow label="Nationality" value={tenant.nationality} />
                <DetailRow label="Blood Group" value={tenant.bloodGroup} />
                <DetailRow label="ID Proof Type" value={tenant.idProofType} />
                <DetailRow label="ID Proof Number" value={tenant.idProofNumber} />
                <DetailRow label="Permanent Address" value={tenant.permanentAddress} />
                <DetailRow label="Current Address" value={tenant.currentAddress} />
                <DetailRow label="Company / College" value={tenant.company} />
                <DetailRow label="Designation / Course" value={tenant.designation} />
            </Section>

            {/* Guardian Details */}
            <Section title="Guardian Details">
                <DetailRow label="Guardian Name" value={tenant.guardianName} />
                <DetailRow label="Guardian Phone" value={tenant.guardianPhone} />
            </Section>

            {/* Parents Details */}
            <Section title="Parents Details">
                <DetailRow label="Father's Name" value={tenant.fatherName} />
                <DetailRow label="Father's Phone" value={tenant.fatherPhone} />
                <DetailRow label="Father's Occupation" value={tenant.fatherOccupation} />
                <DetailRow label="Mother's Name" value={tenant.motherName} />
                <DetailRow label="Mother's Phone" value={tenant.motherPhone} />
            </Section>

            {/* Bank Details */}
            <Section title="Bank Details">
                <DetailRow label="Account Holder" value={tenant.bankName} />
                <DetailRow label="Account Number" value={tenant.accountNumber} />
                <DetailRow label="IFSC Code" value={tenant.ifscCode} />
                <DetailRow label="UPI ID" value={tenant.upiId} />
            </Section>

            {/* GST Details */}
            <Section title="GST Details">
                <DetailRow label="GST Number" value={tenant.gstNo} />
                <DetailRow label="Registered Address" value={tenant.gstAddress} />
            </Section>
        </Accordion>
    );
};

export default ProfileTab;
