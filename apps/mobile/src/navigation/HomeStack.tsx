import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import TransferScreen from '../screens/main/TransferScreen';
import QrPayScreen from '../screens/main/QrPayScreen';
import LoanSimulatorScreen from '../screens/main/LoanSimulatorScreen';
import DuesHistoryScreen from '../screens/main/DuesHistoryScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import PlaceholderScreen from '../screens/main/PlaceholderScreen';
import { colors } from '../theme';
import type { HomeStackParamList } from './types';

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.textPrimary,
        headerTitleStyle: { fontWeight: '600' },
      }}
    >
      <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ title: 'SindiWallet' }} />
      <Stack.Screen name="Transfer" component={TransferScreen} options={{ title: 'Transferir' }} />
      <Stack.Screen name="TransferCvu" component={PlaceholderScreen} options={{ title: 'Transferir CVU' }} />
      <Stack.Screen name="QrGenerate" component={PlaceholderScreen} options={{ title: 'Generar QR' }} />
      <Stack.Screen name="QrPay" component={QrPayScreen} options={{ title: 'Pagar QR' }} />
      <Stack.Screen name="LoanSimulator" component={LoanSimulatorScreen} options={{ title: 'Préstamos' }} />
      <Stack.Screen name="Benefits" component={PlaceholderScreen} options={{ title: 'Beneficios' }} />
      <Stack.Screen name="DuesHistory" component={DuesHistoryScreen} options={{ title: 'Mis Cuotas' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="MerchantMap" component={PlaceholderScreen} options={{ title: 'Comercios' }} />
      <Stack.Screen name="Chatbot" component={PlaceholderScreen} options={{ title: 'Asistente' }} />
    </Stack.Navigator>
  );
}
