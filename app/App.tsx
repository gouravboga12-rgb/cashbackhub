import React, { useEffect } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer, createNavigationContainerRef } from '@react-navigation/native';
import Toast from 'react-native-toast-message';
import * as Notifications from 'expo-notifications';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { setupNotificationChannels, playNotificationAudio } from './src/services/notificationService';
import { initAdService, preloadAppOpenAd } from './src/services/adService';
import { COLORS } from './src/theme';

export const navigationRef = createNavigationContainerRef<any>();

export default function App() {
  useEffect(() => {
    // Initialize notification channels with custom sound alert chime
    setupNotificationChannels();

    // Initialize Google AdMob SDK and preload assets silently in background
    initAdService().then(() => {
      preloadAppOpenAd();
    }).catch(() => {});

    // Foreground notification listener
    const subscription = Notifications.addNotificationReceivedListener(() => {
      playNotificationAudio().catch(() => {});
    });

    // Background / Closed App Push Notification Tap Listener (Deep Linking to Activity Tab)
    const responseSub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      if (navigationRef.isReady()) {
        if (data?.screen === 'Activity' || data?.type === 'voucher' || data?.type === 'withdrawal') {
          navigationRef.navigate('MainTabs', { screen: 'Activity' });
        } else if (data?.screen === 'Spin') {
          navigationRef.navigate('MainTabs', { screen: 'Spin' });
        } else if (data?.screen) {
          navigationRef.navigate(data.screen as never);
        }
      }
    });

    return () => {
      subscription.remove();
      responseSub.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" translucent={false} />
      <AuthProvider>
        <NavigationContainer ref={navigationRef}>
          <AppNavigator />
        </NavigationContainer>
      </AuthProvider>
      <Toast />
    </SafeAreaProvider>
  );
}
