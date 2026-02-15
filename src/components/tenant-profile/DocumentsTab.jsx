import { Box, SimpleGrid, Text, VStack, Button, Icon, Link, Flex, Image } from '@chakra-ui/react';
import { MdInsertDriveFile, MdCloudUpload, MdVisibility } from 'react-icons/md';

const DocumentCard = ({ title, type, url }) => (
    <Box p={4} borderWidth="1px" borderRadius="lg" bg="white" shadow="sm" _hover={{ shadow: 'md' }}>
        <VStack spacing={3}>
            <Icon as={MdInsertDriveFile} w={10} h={10} color="blue.500" />
            <Text fontWeight="600" fontSize="sm">{title}</Text>
            <Text fontSize="xs" color="gray.500">{type}</Text>
            {url ? (
                <Button as={Link} href={url} isExternal leftIcon={<MdVisibility />} size="sm" colorScheme="blue" variant="outline" w="full">
                    View
                </Button>
            ) : (
                <Button leftIcon={<MdCloudUpload />} size="sm" colorScheme="gray" variant="ghost" w="full">
                    Upload
                </Button>
            )}
        </VStack>
    </Box>
);

const DocumentsTab = ({ tenant }) => {
    let docs = [];
    try {
        docs = JSON.parse(tenant.documents || '[]');
    } catch (e) {
        console.error("Failed to parse documents", e);
    }

    return (
        <VStack spacing={6} align="stretch">
            <Flex justify="space-between" align="center">
                <Text fontSize="lg" fontWeight="bold">Key Documents</Text>
                <Button leftIcon={<MdCloudUpload />} colorScheme="blue" size="sm">Upload New</Button>
            </Flex>

            <SimpleGrid columns={{ base: 2, md: 4 }} spacing={6}>
                {/* Standard ID Proof */}
                <DocumentCard
                    title="ID Proof"
                    type="Official ID"
                    url={tenant.idProof || null}
                />

                {/* Rental Agreement */}
                <DocumentCard
                    title="Rental Agreement"
                    type="Contract"
                    url={null}
                />

                {/* Police Verification */}
                <DocumentCard
                    title="Police Verification"
                    type="Form"
                    url={null}
                />

                {/* Dynamically Loaded Docs */}
                {docs.map((doc, idx) => (
                    <DocumentCard key={idx} title={doc.name} type={doc.type} url={doc.url} />
                ))}
            </SimpleGrid>
        </VStack>
    );
};

export default DocumentsTab;
