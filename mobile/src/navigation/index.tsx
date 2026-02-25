import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Home, Users, IndianRupee, Building2, Menu } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useAuthStore } from '../stores/authStore';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/home/DashboardScreen';
import TenantsScreen from '../screens/tenants/TenantsScreen';
import TenantDetailScreen from '../screens/tenants/TenantDetailScreen';
import DuesScreen from '../screens/money/DuesScreen';
import CollectionScreen from '../screens/money/CollectionScreen';
import ExpenseScreen from '../screens/money/ExpenseScreen';
import RoomsScreen from '../screens/property/RoomsScreen';
import ComplaintsScreen from '../screens/property/ComplaintsScreen';
import ReviewsScreen from '../screens/property/ReviewsScreen';
import TasksScreen from '../screens/utilities/TasksScreen';
import ListingsScreen from '../screens/utilities/ListingsScreen';
import ReportsScreen from '../screens/utilities/ReportsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import MoreScreen from '../screens/MoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const HomeStack = createNativeStackNavigator();
const TenantStack = createNativeStackNavigator();
const MoneyStack = createNativeStackNavigator();
const PropertyStack = createNativeStackNavigator();
const MoreStack = createNativeStackNavigator();

const screenOptions = {
  headerStyle: { backgroundColor: colors.bg.secondary },
  headerTintColor: colors.text.primary,
  headerTitleStyle: { fontWeight: '600' as const },
  contentStyle: { backgroundColor: colors.bg.primary },
};

function HomeStackNav() {
  return (
    <HomeStack.Navigator screenOptions={screenOptions}>
      <HomeStack.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'PG Manager' }} />
    </HomeStack.Navigator>
  );
}

function TenantStackNav() {
  return (
    <TenantStack.Navigator screenOptions={screenOptions}>
      <TenantStack.Screen name="TenantsList" component={TenantsScreen} options={{ title: 'Tenants' }} />
      <TenantStack.Screen name="TenantDetail" component={TenantDetailScreen} options={{ title: 'Tenant' }} />
    </TenantStack.Navigator>
  );
}

function MoneyStackNav() {
  return (
    <MoneyStack.Navigator screenOptions={screenOptions}>
      <MoneyStack.Screen name="DuesList" component={DuesScreen} options={{ title: 'Dues' }} />
      <MoneyStack.Screen name="Collection" component={CollectionScreen} options={{ title: 'Collection' }} />
      <MoneyStack.Screen name="Expenses" component={ExpenseScreen} options={{ title: 'Expenses' }} />
    </MoneyStack.Navigator>
  );
}

function PropertyStackNav() {
  return (
    <PropertyStack.Navigator screenOptions={screenOptions}>
      <PropertyStack.Screen name="RoomsList" component={RoomsScreen} options={{ title: 'Rooms' }} />
      <PropertyStack.Screen name="Complaints" component={ComplaintsScreen} options={{ title: 'Complaints' }} />
      <PropertyStack.Screen name="Reviews" component={ReviewsScreen} options={{ title: 'Reviews' }} />
    </PropertyStack.Navigator>
  );
}

function MoreStackNav() {
  return (
    <MoreStack.Navigator screenOptions={screenOptions}>
      <MoreStack.Screen name="MoreMenu" component={MoreScreen} options={{ title: 'More' }} />
      <MoreStack.Screen name="Tasks" component={TasksScreen} options={{ title: 'Tasks' }} />
      <MoreStack.Screen name="Listings" component={ListingsScreen} options={{ title: 'Listings' }} />
      <MoreStack.Screen name="Reports" component={ReportsScreen} options={{ title: 'Reports' }} />
      <MoreStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings' }} />
    </MoreStack.Navigator>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.bg.secondary,
          borderTopColor: colors.border,
          height: 60,
          paddingBottom: 8,
          paddingTop: 4,
        },
        tabBarActiveTintColor: colors.accent.primary,
        tabBarInactiveTintColor: colors.text.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '500' },
      }}
    >
      <Tab.Screen name="Home" component={HomeStackNav}
        options={{ tabBarIcon: ({ color, size }) => <Home size={size} color={color} /> }} />
      <Tab.Screen name="Tenants" component={TenantStackNav}
        options={{ tabBarIcon: ({ color, size }) => <Users size={size} color={color} /> }} />
      <Tab.Screen name="Money" component={MoneyStackNav}
        options={{ tabBarIcon: ({ color, size }) => <IndianRupee size={size} color={color} /> }} />
      <Tab.Screen name="Property" component={PropertyStackNav}
        options={{ tabBarIcon: ({ color, size }) => <Building2 size={size} color={color} /> }} />
      <Tab.Screen name="More" component={MoreStackNav}
        options={{ tabBarIcon: ({ color, size }) => <Menu size={size} color={color} /> }} />
    </Tab.Navigator>
  );
}

export default function Navigation() {
  const { isAuthenticated, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.bg.primary }}>
        <ActivityIndicator size="large" color={colors.accent.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {isAuthenticated ? (
          <Stack.Screen name="Main" component={MainTabs} />
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
