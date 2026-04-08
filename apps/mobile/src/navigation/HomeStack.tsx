import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/main/HomeScreen';
import TransferScreen from '../screens/main/TransferScreen';
import TransferCvuScreen from '../screens/main/TransferCvuScreen';
import QrGenerateScreen from '../screens/main/QrGenerateScreen';
import QrPayScreen from '../screens/main/QrPayScreen';
import LoanSimulatorScreen from '../screens/main/LoanSimulatorScreen';
import BenefitsCatalogScreen from '../screens/main/BenefitsCatalogScreen';
import DuesHistoryScreen from '../screens/main/DuesHistoryScreen';
import NotificationsScreen from '../screens/main/NotificationsScreen';
import MerchantListScreen from '../screens/main/MerchantListScreen';
import ChatbotScreen from '../screens/main/ChatbotScreen';
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
      <Stack.Screen name="TransferCvu" component={TransferCvuScreen} options={{ title: 'Transferir CVU' }} />
      <Stack.Screen name="QrGenerate" component={QrGenerateScreen} options={{ title: 'Generar QR' }} />
      <Stack.Screen name="QrPay" component={QrPayScreen} options={{ title: 'Pagar QR' }} />
      <Stack.Screen name="LoanSimulator" component={LoanSimulatorScreen} options={{ title: 'Préstamos' }} />
      <Stack.Screen name="Benefits" component={BenefitsCatalogScreen} options={{ title: 'Beneficios' }} />
      <Stack.Screen name="DuesHistory" component={DuesHistoryScreen} options={{ title: 'Mis Cuotas' }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ title: 'Notificaciones' }} />
      <Stack.Screen name="MerchantMap" component={MerchantListScreen} options={{ title: 'Comercios' }} />
      <Stack.Screen name="Chatbot" component={ChatbotScreen} options={{ title: 'Asistente IA' }} />
    </Stack.Navigator>
  );
}
