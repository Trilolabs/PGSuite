import {
    Box, Grid, GridItem, Text, VStack, Heading, Button, Divider, Flex, Icon
} from '@chakra-ui/react';
import { MdDownload, MdPrint } from 'react-icons/md';

const FormSection = ({ title, children }) => (
    <Box mb={6}>
        <Heading size="sm" mb={4} color="gray.600" textTransform="uppercase" letterSpacing="wide">
            {title}
        </Heading>
        <Grid templateColumns={{ base: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }} gap={6}>
            {children}
        </Grid>
        <Divider mt={6} borderColor="gray.200" />
    </Box>
);

const Field = ({ label, value }) => (
    <Box>
        <Text fontSize="xs" color="gray.500" mb={1}>{label}</Text>
        <Text fontWeight="500" fontSize="sm">{value || '-'}</Text>
    </Box>
);

export default function JoiningFormTab({ tenant }) {
    const handlePrint = () => {
        window.print();
    };

    return (
        <Box p={4}>
            <Flex justify="space-between" align="center" mb={8}>
                <Box>
                    <Heading size="md">Joining Form</Heading>
                    <Text fontSize="sm" color="gray.500">Digital representation of the tenant application form</Text>
                </Box>
                <Button
                    leftIcon={<MdPrint />}
                    colorScheme="blue"
                    variant="outline"
                    size="sm"
                    onClick={handlePrint}
                >
                    Print / Download
                </Button>
            </Flex>

            <Box bg="white" p={8} borderRadius="lg" border="1px solid" borderColor="gray.200" maxW="900px" mx="auto">
                {/* Personal Details */}
                <FormSection title="Personal Information">
                    <Field label="Full Name" value={tenant?.name} />
                    <Field label="Phone Number" value={tenant?.phone} />
                    <Field label="Email Address" value={tenant?.email} />
                    <Field label="Date of Birth" value={tenant?.dob} />
                    <Field label="Gender" value={tenant?.gender} />
                    <Field label="Blood Group" value={tenant?.bloodGroup} />
                    <Field label="Nationality" value={tenant?.nationality} />
                </FormSection>

                {/* Parent/Guardian Details */}
                <FormSection title="Family Details">
                    <Field label="Father's Name" value={tenant?.fatherName} />
                    <Field label="Father's Phone" value={tenant?.fatherPhone} />
                    <Field label="Father's Occupation" value={tenant?.fatherOccupation} />
                    <Field label="Mother's Name" value={tenant?.motherName} />
                    <Field label="Mother's Phone" value={tenant?.motherPhone} />
                    <Field label="Guardian's Name" value={tenant?.guardianName} />
                    <Field label="Guardian's Phone" value={tenant?.guardianPhone} />
                </FormSection>

                {/* Professional Details */}
                <FormSection title="Professional / Student Details">
                    <Field label="Type" value={tenant?.tenantType} />
                    <Field label="Company / College" value={tenant?.company} />
                    <Field label="Designation / Course" value={tenant?.designation} />
                    <Field label="Office / College Address" value={tenant?.officeAddress} />
                </FormSection>

                {/* Permanent Address */}
                <FormSection title="Permanent Address">
                    <GridItem colSpan={{ base: 1, md: 3 }}>
                        <Field label="Address" value={tenant?.permanentAddress} />
                    </GridItem>
                </FormSection>

                {/* Accomodation Details */}
                <FormSection title="Accommodation Details">
                    <Field label="Property" value={tenant?.property?.name} />
                    <Field label="Room No" value={tenant?.room?.number} />
                    <Field label="Bed No" value={tenant?.bed} />
                    <Field label="Joining Date" value={tenant?.moveIn} />
                    <Field label="Rent Amount" value={`₹${tenant?.rent}`} />
                    <Field label="Security Deposit" value={`₹${tenant?.deposit}`} />
                </FormSection>
            </Box>
        </Box>
    );
}
