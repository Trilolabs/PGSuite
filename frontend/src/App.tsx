import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import TenantsPage from './pages/TenantsPage';
import AddTenantPage from './pages/AddTenantPage';
import TenantProfilePage from './pages/TenantProfilePage';
import BookingsPage from './pages/BookingsPage';
import OldTenantsPage from './pages/OldTenantsPage';
import LeadsPage from './pages/LeadsPage';
import TeamPage from './pages/TeamPage';
import DuesPage from './pages/DuesPage';
import CollectionPage from './pages/CollectionPage';
import ExpensePage from './pages/ExpensePage';
import DuesPackagePage from './pages/DuesPackagePage';
import RoomsPage from './pages/RoomsPage';
import FoodPage from './pages/FoodPage';
import ComplaintsPage from './pages/ComplaintsPage';
import AssetsPage from './pages/AssetsPage';
import ElectricityPage from './pages/ElectricityPage';
import BanksPage from './pages/BanksPage';
import ReportsPage from './pages/ReportsPage';
import WhatsAppPage from './pages/WhatsAppPage';
import SettingsPage from './pages/SettingsPage';

import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';

function App() {
  const { loadUser } = useAuthStore();

  useEffect(() => {
    loadUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Protected — inside app layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<HomePage />} />
          <Route path="/dashboard" element={<Navigate to="/home" replace />} />

          {/* People */}
          <Route path="/tenants" element={<TenantsPage />} />
          <Route path="/tenants/add" element={<AddTenantPage />} />
          <Route path="/tenants/:id" element={<TenantProfilePage />} />
          <Route path="/bookings" element={<BookingsPage />} />
          <Route path="/old-tenants" element={<OldTenantsPage />} />
          <Route path="/leads" element={<LeadsPage />} />
          <Route path="/team" element={<TeamPage />} />

          {/* Money */}
          <Route path="/dues" element={<DuesPage />} />
          <Route path="/collection" element={<CollectionPage />} />
          <Route path="/expense" element={<ExpensePage />} />
          <Route path="/dues-package" element={<DuesPackagePage />} />

          {/* Property */}
          <Route path="/rooms" element={<RoomsPage />} />
          <Route path="/food" element={<FoodPage />} />
          <Route path="/complaints" element={<ComplaintsPage />} />
          <Route path="/assets" element={<AssetsPage />} />

          {/* Utilities */}
          <Route path="/electricity" element={<ElectricityPage />} />
          <Route path="/banks" element={<BanksPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/whatsapp" element={<WhatsAppPage />} />

          {/* Settings */}
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Default redirect */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
