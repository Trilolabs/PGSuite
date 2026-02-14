'use client';

import { CacheProvider } from '@chakra-ui/next-js';
import { ChakraProvider, extendTheme } from '@chakra-ui/react';

const theme = extendTheme({
  colors: {
    brand: {
      50: '#e6eaff',
      100: '#b3c0ff',
      200: '#809aff',
      300: '#4d70ff',
      400: '#1a4aff',
      500: '#0038FF',
      600: '#002dcc',
      700: '#002299',
      800: '#001766',
      900: '#000b33',
    },
    sidebar: {
      bg: '#0b0e21',
      active: '#1a237e',
      hover: '#141833',
      text: '#8892b0',
      textActive: '#ffffff',
    },
    dashboard: {
      bg: '#f0f4f8',
      card: '#ffffff',
    },
  },
  fonts: {
    heading: `'Inter', system-ui, -apple-system, sans-serif`,
    body: `'Inter', system-ui, -apple-system, sans-serif`,
  },
  styles: {
    global: {
      body: {
        bg: '#f0f4f8',
        color: '#1a202c',
      },
    },
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'brand',
      },
    },
  },
});

export function Providers({ children }) {
  return (
    <CacheProvider>
      <ChakraProvider theme={theme}>{children}</ChakraProvider>
    </CacheProvider>
  );
}
