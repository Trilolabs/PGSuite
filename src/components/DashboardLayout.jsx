'use client';

import { useState } from 'react';
import { Box, Flex } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function DashboardLayout({ children }) {
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <Flex minH="100vh">
            <Sidebar isCollapsed={isCollapsed} onToggle={() => setIsCollapsed(!isCollapsed)} />
            <Box
                flex="1"
                ml={isCollapsed ? '60px' : '220px'}
                transition="margin 0.3s cubic-bezier(0.4, 0, 0.2, 1)"
                bg="dashboard.bg"
                minH="100vh"
            >
                <Header />
                <Box as="main" p={6}>
                    {children}
                </Box>
            </Box>
        </Flex>
    );
}
