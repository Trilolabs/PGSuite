'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import {
    Box, Flex, Text, Icon, VStack, Accordion, AccordionItem,
    AccordionButton, AccordionPanel, AccordionIcon, Tooltip,
} from '@chakra-ui/react';
import {
    MdDashboard, MdHome, MdAccountBalanceWallet, MdPeople,
    MdApartment, MdTask, MdBarChart, MdLanguage, MdElectricBolt,
    MdAccountBalance, MdWhatsapp, MdSettings, MdLogout,
    MdReceipt, MdPayments, MdMoneyOff, MdShoppingCart,
    MdPersonAdd, MdBookmarkAdded, MdPersonOff, MdBadge,
    MdReportProblem, MdMeetingRoom, MdLayers, MdRestaurant,
    MdContactPage, MdDescription,
} from 'react-icons/md';

const menuItems = [
    { label: 'Dashboard', icon: MdDashboard, href: '/' },
    { label: 'Home', icon: MdHome, href: '/home' },
    {
        label: 'Money', icon: MdAccountBalanceWallet, children: [
            { label: 'Dues Package', icon: MdReceipt, href: '/money/dues-package' },
            { label: 'Dues', icon: MdMoneyOff, href: '/money/dues' },
            { label: 'Collection', icon: MdPayments, href: '/money/collection' },
            { label: 'Expense', icon: MdShoppingCart, href: '/money/expense' },
            { label: 'FlexiPe', icon: MdDescription, href: '/money/flexipe' },
        ]
    },
    {
        label: 'People', icon: MdPeople, children: [
            { label: 'Tenants', icon: MdPeople, href: '/people/tenants' },
            { label: 'Add Tenant', icon: MdPersonAdd, href: '/people/add-tenant' },
            { label: 'Bookings', icon: MdBookmarkAdded, href: '/people/bookings' },
            { label: 'Old Tenants', icon: MdPersonOff, href: '/people/old-tenants' },
            { label: 'Leads', icon: MdContactPage, href: '/people/leads' },
            { label: 'Staff', icon: MdBadge, href: '/people/staff' },
            { label: 'Complaints', icon: MdReportProblem, href: '/people/complaints' },
        ]
    },
    {
        label: 'Property', icon: MdApartment, children: [
            { label: 'Rooms', icon: MdMeetingRoom, href: '/property/rooms' },
            { label: 'Food', icon: MdRestaurant, href: '/property/food' },
            { label: 'Floors', icon: MdLayers, href: '/property/floors' },
        ]
    },
    { label: 'Tasks', icon: MdTask, href: '/tasks', badge: 'Beta' },
    { label: 'Reports', icon: MdBarChart, href: '/reports' },
    { label: 'Listings', icon: MdLanguage, href: '/listings' },
    { label: 'Electricity', icon: MdElectricBolt, href: '/electricity', badge: 'Beta' },
    { label: 'Banks', icon: MdAccountBalance, href: '/banks' },
    { label: 'WhatsApp', icon: MdWhatsapp, href: '/whatsapp' },
    { label: 'Settings', icon: MdSettings, href: '/settings' },
];

function NavLink({ item, isCollapsed, pathname }) {
    const isActive = pathname === item.href;
    return (
        <Link href={item.href} style={{ textDecoration: 'none', width: '100%' }}>
            <Flex
                align="center"
                px={isCollapsed ? 0 : 4}
                py={2.5}
                mx={isCollapsed ? 0 : 2}
                borderRadius="lg"
                cursor="pointer"
                justifyContent={isCollapsed ? 'center' : 'flex-start'}
                bg={isActive ? 'brand.500' : 'transparent'}
                color={isActive ? 'white' : 'sidebar.text'}
                _hover={{ bg: isActive ? 'brand.500' : 'sidebar.hover', color: 'white' }}
                transition="all 0.2s"
                position="relative"
            >
                <Tooltip label={isCollapsed ? item.label : ''} placement="right" hasArrow>
                    <Flex align="center">
                        <Icon as={item.icon} boxSize={5} />
                    </Flex>
                </Tooltip>
                {!isCollapsed && (
                    <Text ml={3} fontSize="sm" fontWeight={isActive ? '600' : '400'} whiteSpace="nowrap">
                        {item.label}
                    </Text>
                )}
                {!isCollapsed && item.badge && (
                    <Text ml={2} fontSize="2xs" bg="orange.400" color="white" px={1.5} py={0.5}
                        borderRadius="full" fontWeight="700" lineHeight="1">
                        {item.badge}
                    </Text>
                )}
            </Flex>
        </Link>
    );
}

export default function Sidebar({ isCollapsed, onToggle }) {
    const pathname = usePathname();

    const getDefaultAccordionIndex = () => {
        const indices = [];
        let accIdx = 0;
        for (const item of menuItems) {
            if (item.children) {
                if (item.children.some(c => pathname.startsWith(c.href))) {
                    indices.push(accIdx);
                }
                accIdx++;
            }
        }
        return indices;
    };

    return (
        <Box
            as="nav"
            bg="sidebar.bg"
            w={isCollapsed ? '60px' : '220px'}
            minH="100vh"
            position="fixed"
            left={0}
            top={0}
            zIndex={100}
            transition="width 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
            overflowX="hidden"
            overflowY="auto"
            borderRight="1px solid"
            borderColor="whiteAlpha.100"
            css={{
                '&::-webkit-scrollbar': { width: '4px' },
                '&::-webkit-scrollbar-thumb': { background: '#333', borderRadius: '4px' },
            }}
        >
            {/* Logo */}
            <Flex align="center" justify={isCollapsed ? 'center' : 'flex-start'} px={isCollapsed ? 2 : 4} py={4}
                borderBottom="1px solid" borderColor="whiteAlpha.100" mb={2} cursor="pointer" onClick={onToggle}>
                <Box bg="brand.500" borderRadius="lg" p={1.5} display="flex" alignItems="center" justifyContent="center">
                    <Icon as={MdApartment} color="white" boxSize={5} />
                </Box>
                {!isCollapsed && (
                    <Text ml={3} fontWeight="800" fontSize="lg" color="white" letterSpacing="-0.02em">
                        PG Manager
                    </Text>
                )}
            </Flex>

            {/* Admin greeting */}
            {!isCollapsed && (
                <Flex px={4} py={2} align="center" mb={1}>
                    <Box bg="brand.500" borderRadius="full" w={7} h={7} display="flex" alignItems="center" justifyContent="center">
                        <Text color="white" fontSize="xs" fontWeight="700">A</Text>
                    </Box>
                    <Text ml={2} color="white" fontSize="sm" fontWeight="500">Hi Admin 👋</Text>
                </Flex>
            )}

            {/* Navigation */}
            <VStack spacing={0} align="stretch" pb={4}>
                <Accordion allowMultiple defaultIndex={getDefaultAccordionIndex()} variant="unstyled">
                    {menuItems.map((item) => {
                        if (item.children) {
                            return (
                                <AccordionItem key={item.label} border="none">
                                    <AccordionButton
                                        px={isCollapsed ? 0 : 4}
                                        py={2.5}
                                        mx={isCollapsed ? 0 : 2}
                                        borderRadius="lg"
                                        justifyContent={isCollapsed ? 'center' : 'flex-start'}
                                        color="sidebar.text"
                                        _hover={{ bg: 'sidebar.hover', color: 'white' }}
                                    >
                                        <Tooltip label={isCollapsed ? item.label : ''} placement="right" hasArrow>
                                            <Flex align="center">
                                                <Icon as={item.icon} boxSize={5} />
                                            </Flex>
                                        </Tooltip>
                                        {!isCollapsed && (
                                            <>
                                                <Text ml={3} fontSize="sm" flex="1" textAlign="left">{item.label}</Text>
                                                <AccordionIcon />
                                            </>
                                        )}
                                    </AccordionButton>
                                    {!isCollapsed && (
                                        <AccordionPanel pb={1} pt={0} px={0}>
                                            {item.children.map((child) => (
                                                <NavLink key={child.href} item={child} isCollapsed={isCollapsed} pathname={pathname} />
                                            ))}
                                        </AccordionPanel>
                                    )}
                                </AccordionItem>
                            );
                        }
                        return (
                            <NavLink key={item.href} item={item} isCollapsed={isCollapsed} pathname={pathname} />
                        );
                    })}
                </Accordion>
            </VStack>
        </Box>
    );
}
