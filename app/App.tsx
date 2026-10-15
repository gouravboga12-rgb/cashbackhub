import React, { useEffect } from 'react';
import { StatusBar, StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotificationChannels, playNotificationAudio } from './src/services/notificationService';
import { COLORS } from './src/theme';

export default function App() {
  useEffect(() => {
    // Initialize notification channels with custom sound alert chime
    setupNotificationChannels();

    // Foreground notification listener
    const subscription = Notifications.addNotificationReceivedListener((notification) => {
      playNotificationAudio().catch(() => {});
    });

    return () => {
      subscription.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <AuthProvider>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
