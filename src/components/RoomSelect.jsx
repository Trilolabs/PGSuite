import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Input,
    List,
    ListItem,
    Text,
    Flex,
    Icon,
    Popover,
    PopoverTrigger,
    PopoverContent,
    PopoverBody,
    useDisclosure,
    Badge,
    InputGroup,
    InputRightElement
} from '@chakra-ui/react';
import { MdBed, MdKeyboardArrowDown, MdSearch, MdCheckCircle } from 'react-icons/md';

const BedIcon = ({ status }) => {
    let color = "gray.300";
    if (status === 'Vacant') color = "green.500";
    if (status === 'Occupied') color = "red.500";

    return <Icon as={MdBed} color={color} boxSize={5} mr={1} />;
};

const RoomSelect = ({ rooms, selectedRoomId, onSelect }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [search, setSearch] = useState('');
    const initialRef = useRef();

    const selectedRoom = rooms.find(r => r.id === selectedRoomId);

    // Group rooms by floor (optional, but good for organization) or just filter
    const filteredRooms = rooms.filter(room =>
        room.status !== 'Maintenance' &&
        (room.number.toLowerCase().includes(search.toLowerCase()) ||
            room.floor.toLowerCase().includes(search.toLowerCase()))
    );

    const handleSelect = (room) => {
        onSelect(room.id);
        onClose();
        setSearch('');
    };

    return (
        <Popover
            isOpen={isOpen}
            onOpen={onOpen}
            onClose={onClose}
            initialFocusRef={initialRef}
            placement="bottom-start"
            matchWidth
        >
            <PopoverTrigger>
                <Box
                    w="100%"
                    p={2}
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor="inherit"
                    cursor="pointer"
                    _hover={{ borderColor: "gray.300" }}
                    position="relative"
                    bg="white"
                >
                    <Flex justify="space-between" align="center">
                        <Text fontSize="sm" color={selectedRoom ? "black" : "gray.500"}>
                            {selectedRoom ? `${selectedRoom.number} - ${selectedRoom.floor}` : "Select Room"}
                        </Text>
                        <Icon as={MdKeyboardArrowDown} color="gray.500" />
                    </Flex>
                </Box>
            </PopoverTrigger>
            <PopoverContent p={0} w="100%" minW="300px" maxH="300px" overflowY="auto">
                <PopoverBody p={2}>
                    <InputGroup size="sm" mb={2}>
                        <Input
                            ref={initialRef}
                            placeholder="Search room..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            borderRadius="md"
                        />
                        <InputRightElement><Icon as={MdSearch} color="gray.400" /></InputRightElement>
                    </InputGroup>

                    <List spacing={1}>
                        {filteredRooms.length === 0 && <Text fontSize="xs" color="gray.500" p={2}>No rooms found.</Text>}
                        {filteredRooms.map(room => {
                            const available = room.beds - room.occupiedBeds;
                            const isSelected = room.id === selectedRoomId;

                            // Generate bed icons
                            // Assuming we don't have individual bed status, we approximate:
                            // occupiedBeds = red, remaining = green
                            const bedsIcons = [];
                            for (let i = 0; i < room.occupiedBeds; i++) {
                                bedsIcons.push(<BedIcon key={`occ-${i}`} status="Occupied" />);
                            }
                            for (let i = 0; i < (room.beds - room.occupiedBeds); i++) {
                                bedsIcons.push(<BedIcon key={`vac-${i}`} status="Vacant" />);
                            }

                            return (
                                <ListItem
                                    key={room.id}
                                    p={2}
                                    borderRadius="md"
                                    bg={isSelected ? "blue.50" : "transparent"}
                                    _hover={{ bg: "gray.50" }}
                                    cursor="pointer"
                                    onClick={() => handleSelect(room)}
                                    borderWidth={isSelected ? "1px" : "0"}
                                    borderColor="blue.200"
                                >
                                    <Flex justify="space-between" align="center">
                                        <Box>
                                            <Text fontWeight="600" fontSize="sm" color="blue.600">{room.number}</Text>
                                            <Flex mt={1}>
                                                {bedsIcons}
                                            </Flex>
                                        </Box>
                                        <Box textAlign="right">
                                            <Text fontSize="xs" fontWeight="bold">₹{room.rent}/bed</Text>
                                            <Text fontSize="xs" color="gray.500">{room.type}</Text>
                                        </Box>
                                    </Flex>
                                </ListItem>
                            );
                        })}
                    </List>
                </PopoverBody>
            </PopoverContent>
        </Popover>
    );
};

export default RoomSelect;
