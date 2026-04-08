import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeStack from './HomeStack';
import ProfileScreen from '../screens/main/ProfileScreen';
import PlaceholderScreen from '../screens/main/PlaceholderScreen';
import { colors, typography } from '../theme';
import type { MainTabParamList } from './types';

const Tab = createBottomTabNavigator<MainTabParamList>();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠',
    Cards: '💳',
    Payments: '💸',
    Profile: '👤',
  };

  return (
    <>{/* Using text emoji as icon placeholder - in prod use @expo/vector-icons */}</>
  );
}

export default function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.cardBorder,
          height: 60,
          paddingBottom: 8,
        },
        tabBarActiveTintColor: colors.tabActive,
        tabBarInactiveTintColor: colors.tabInactive,
        tabBarLabelStyle: {
          ...typography.caption,
          fontSize: 11,
        },
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeStack}
        options={{ tabBarLabel: 'Inicio' }}
      />
      <Tab.Screen
        name="Cards"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Tarjetas' }}
      />
      <Tab.Screen
        name="Payments"
        component={PlaceholderScreen}
        options={{ tabBarLabel: 'Pagos' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: 'Perfil', headerShown: true, headerTitle: 'Mi Perfil', headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.textPrimary }}
      />
    </Tab.Navigator>
  );
}
