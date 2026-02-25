import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import Navigation from './src/navigation';
import { useAuthStore } from './src/stores/authStore';

export default function App() {
  const loadUser = useAuthStore((s) => s.loadUser);

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Navigation />
    </>
  );
}
