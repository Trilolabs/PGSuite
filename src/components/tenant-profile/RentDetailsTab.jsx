import { Box, SimpleGrid, Text, VStack, Heading, Badge, Flex, Icon, Button } from '@chakra-ui/react';
import { MdBed, MdCalendarToday, MdAttachMoney, MdLockClock, MdWarning } from 'react-icons/md';

const DetailCard = ({ title, icon, children }) => (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm">
        <Flex align="center" mb={3}>
            <Icon as={icon} color="brand.500" w={5} h={5} mr={2} />
            <Heading size="sm" color="gray.700">{title}</Heading>
        </Flex>
        <VStack align="stretch" spacing={2}>
            {children}
        </VStack>
    </Box>
);

const DetailRow = ({ label, value, isBold = false }) => (
    <Flex justify="space-between">
        <Text color="gray.500" fontSize="sm">{label}</Text>
        <Text fontWeight={isBold ? "600" : "500"} fontSize="sm">{value || '-'}</Text>
    </Flex>
);

const RentDetailsTab = ({ tenant }) => {
    return (
        <VStack spacing={6} align="stretch">
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={6}>
                {/* Current Stay */}
                <DetailCard title="Current Stay" icon={MdBed}>
                    <DetailRow label="Room Number" value={tenant.room?.number || 'Unassigned'} />
                    <DetailRow label="Bed Number" value={tenant.bed} />
                    <DetailRow label="Floor" value={tenant.floor} />
                    <DetailRow label="Stay Type" value={tenant.stayType} />
                </DetailCard>

                {/* Financial Terms */}
                <DetailCard title="Financial Terms" icon={MdAttachMoney}>
                    <DetailRow label="Monthly Rent" value={`₹${tenant.rent}`} isBold />
                    <DetailRow label="Security Deposit" value={`₹${tenant.deposit}`} />
                    <DetailRow label="Maintenance" value={`₹${tenant.maintenance}`} />
                    <DetailRow label="Rent Cycle" value={tenant.rentalFrequency} />
                </DetailCard>

                {/* Timeline */}
                <DetailCard title="Timeline" icon={MdCalendarToday}>
                    <DetailRow label="Move-in Date" value={tenant.moveIn} />
                    <DetailRow label="Rent Start Date" value={tenant.rentStartDate} />
                    <DetailRow label="Agreement Period" value={`${tenant.agreementPeriod} Months`} />
                    <DetailRow label="Expected Move-out" value={tenant.moveOut || 'Not Scheduled'} />
                </DetailCard>

                {/* Contract Rules */}
                <DetailCard title="Contract Rules" icon={MdLockClock}>
                    <DetailRow label="Lock-in Period" value={`${tenant.lockIn} Months`} />
                    <DetailRow label="Notice Period" value={`${tenant.noticePeriod} Days`} />
                    <DetailRow label="App Status" value={<Badge colorScheme={tenant.appStatus === 'Active' ? 'green' : 'red'}>{tenant.appStatus}</Badge>} />
                </DetailCard>
            </SimpleGrid>
        </VStack>
    );
};

export default RentDetailsTab;
