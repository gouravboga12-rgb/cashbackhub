import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotificationChannels, playNotificationAudio } from './src/services/notificationService';
import { initAdService, preloadAppOpenAd } from './src/services/adService';
import { COLORS } from './src/theme';

export default function App() {
  useEffect(() => {
    // Initialize notification channels with custom sound alert chime
    setupNotificationChannels();

    // Initialize Google AdMob SDK and preload assets silently in background
    initAdService().then(() => {
      preloadAppOpenAd();
    }).catch(() => {});

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
