'use client';

import {
    Box, Flex, Text, Card, CardBody, SimpleGrid, Badge, HStack,
    Button, Icon, VStack, Divider,
} from '@chakra-ui/react';
import { MdAdd, MdLayers, MdBed, MdPerson, MdMeetingRoom } from 'react-icons/md';
import DashboardLayout from '@/components/DashboardLayout';
import { rooms } from '@/data/mockData';

export default function FloorsPage() {
    const floors = [...new Set(rooms.map(r => r.floor))];
    const properties = [...new Set(rooms.map(r => r.property))];

    return (
        <DashboardLayout>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Text fontSize="xl" fontWeight="700">Floors</Text>
                    <Text fontSize="sm" color="gray.500">Floor-wise property overview</Text>
                </Box>
                <Button colorScheme="blue" size="sm" leftIcon={<MdAdd />} borderRadius="lg">Add Floor</Button>
            </Flex>

            {properties.map(prop => (
                <Box key={prop} mb={8}>
                    <Text fontSize="lg" fontWeight="700" mb={4} color="gray.700">{prop}</Text>
                    <VStack spacing={4} align="stretch">
                        {floors.filter(f => rooms.some(r => r.property === prop && r.floor === f)).map(floor => {
                            const floorRooms = rooms.filter(r => r.property === prop && r.floor === floor);
                            const totalBeds = floorRooms.reduce((s, r) => s + r.beds, 0);
                            const occupiedBeds = floorRooms.reduce((s, r) => s + r.occupiedBeds, 0);

                            return (
                                <Card key={floor} bg="white" borderRadius="xl" boxShadow="sm">
                                    <CardBody p={4}>
                                        <Flex justify="space-between" align="center" mb={3}>
                                            <HStack>
                                                <Icon as={MdLayers} color="brand.500" boxSize={5} />
                                                <Text fontWeight="700">{floor}</Text>
                                            </HStack>
                                            <HStack spacing={4}>
                                                <HStack spacing={1}>
                                                    <Icon as={MdMeetingRoom} color="gray.400" boxSize={4} />
                                                    <Text fontSize="sm" color="gray.600">{floorRooms.length} Rooms</Text>
                                                </HStack>
                                                <HStack spacing={1}>
                                                    <Icon as={MdBed} color="gray.400" boxSize={4} />
                                                    <Text fontSize="sm" color="gray.600">{occupiedBeds}/{totalBeds} Beds</Text>
                                                </HStack>
                                            </HStack>
                                        </Flex>
                                        <Divider mb={3} />
                                        <SimpleGrid columns={{ base: 2, md: 3, lg: 6 }} spacing={3}>
                                            {floorRooms.map(room => (
                                                <Box key={room.id} p={3} borderRadius="lg" border="1px solid"
                                                    borderColor={room.occupiedBeds === room.beds ? 'red.200' : room.occupiedBeds > 0 ? 'orange.200' : 'green.200'}
                                                    bg={room.occupiedBeds === room.beds ? 'red.50' : room.occupiedBeds > 0 ? 'orange.50' : 'green.50'}
                                                    cursor="pointer" _hover={{ boxShadow: 'md' }} transition="all 0.2s">
                                                    <Text fontWeight="600" fontSize="sm">Room {room.number}</Text>
                                                    <HStack spacing={1} mt={1}>
                                                        <Icon as={MdPerson} boxSize={3} color="gray.500" />
                                                        <Text fontSize="xs" color="gray.600">{room.occupiedBeds}/{room.beds}</Text>
                                                    </HStack>
                                                    <Text fontSize="xs" color="gray.500" mt={0.5}>₹{room.rent.toLocaleString('en-IN')}</Text>
                                                </Box>
                                            ))}
                                        </SimpleGrid>
                                    </CardBody>
                                </Card>
                            );
                        })}
                    </VStack>
                </Box>
            ))}
        </DashboardLayout>
    );
}
