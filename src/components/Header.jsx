'use client';

import {
    Flex, Input, InputGroup, InputLeftElement, Box, Text, Icon,
    IconButton, Menu, MenuButton, MenuList, MenuItem, Badge, HStack,
} from '@chakra-ui/react';
import { MdSearch, MdNotifications, MdHelpOutline, MdKeyboardArrowDown } from 'react-icons/md';

export default function Header({ propertyName = 'Sunrise PG' }) {
    return (
        <Flex
            as="header"
            align="center"
            justify="space-between"
            bg="white"
            px={6}
            py={3}
            borderBottom="1px solid"
            borderColor="gray.100"
            position="sticky"
            top={0}
            zIndex={50}
            boxShadow="0 1px 3px rgba(0,0,0,0.04)"
        >
            {/* Left: Property Selector */}
            <HStack spacing={3}>
                <Box bg="brand.500" borderRadius="lg" p={1.5}>
                    <Icon as={() => (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
                            <path d="M12 3L4 9v12h16V9l-8-6zm0 2.5L18 10v9H6V10l6-4.5z" />
                            <path d="M10 14h4v5h-4z" />
                        </svg>
                    )} />
                </Box>
                <Menu>
                    <MenuButton>
                        <Flex align="center" cursor="pointer">
                            <Text fontWeight="700" fontSize="md" color="gray.800">{propertyName}</Text>
                            <Icon as={MdKeyboardArrowDown} ml={1} color="gray.500" />
                        </Flex>
                    </MenuButton>
                    <MenuList>
                        <MenuItem fontWeight="600">Sunrise PG</MenuItem>
                        <MenuItem>Green Valley PG</MenuItem>
                    </MenuList>
                </Menu>
            </HStack>

            {/* Center: Search */}
            <InputGroup maxW="400px" mx={4}>
                <InputLeftElement pointerEvents="none">
                    <Icon as={MdSearch} color="gray.400" />
                </InputLeftElement>
                <Input
                    placeholder="Search tenants or rooms..."
                    bg="gray.50"
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="lg"
                    fontSize="sm"
                    _focus={{ borderColor: 'brand.500', boxShadow: '0 0 0 1px #0038FF' }}
                    _placeholder={{ color: 'gray.400' }}
                />
            </InputGroup>

            {/* Right: Actions */}
            <HStack spacing={2}>
                <IconButton
                    icon={<MdNotifications />}
                    variant="ghost"
                    aria-label="Notifications"
                    fontSize="xl"
                    color="gray.500"
                    position="relative"
                    _hover={{ color: 'brand.500', bg: 'blue.50' }}
                />
                <Flex
                    align="center"
                    bg="blue.50"
                    px={3}
                    py={1.5}
                    borderRadius="full"
                    cursor="pointer"
                    _hover={{ bg: 'blue.100' }}
                >
                    <Icon as={MdHelpOutline} color="brand.500" mr={1.5} />
                    <Text fontSize="sm" fontWeight="600" color="brand.500">Help ?</Text>
                </Flex>
            </HStack>
        </Flex>
    );
}
