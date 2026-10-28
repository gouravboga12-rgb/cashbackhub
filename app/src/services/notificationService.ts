import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

// Configure global notification handler so notifications display even while app is in foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const CHANNEL_ID = 'perkfy_rewards';
export const EAS_PROJECT_ID = '2c1cb697-cfe5-4fd4-b9c8-39a0a8b8c385';

// Initialize Notification Channels with high priority and audible chime
export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Perkfy Rewards & Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('default', {
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      sound: 'default',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }
}

// Request permission and fetch Expo Push Token
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  try {
    if (Platform.OS === 'android') {
      await setupNotificationChannels();
    }

    if (Device.isDevice) {
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.warn('[Push] Notification permissions not granted by user.');
        return null;
      }

      let resolvedProjectId = EAS_PROJECT_ID;
      try {
        const Constants = require('expo-constants').default;
        if (Constants?.expoConfig?.extra?.eas?.projectId) {
          resolvedProjectId = Constants.expoConfig.extra.eas.projectId;
        } else if (Constants?.easConfig?.projectId) {
          resolvedProjectId = Constants.easConfig.projectId;
        }
      } catch (cErr) {}

      console.log('[Push] Fetching Expo push token with project ID:', resolvedProjectId);

      try {
        const pushTokenData = await Notifications.getExpoPushTokenAsync({
          projectId: resolvedProjectId,
        });
        token = pushTokenData.data;
        console.log('✅ [Push] Registered Expo push token successfully:', token);
      } catch (tokenErr: any) {
        console.warn('[Push] Error fetching push token with projectId:', tokenErr.message);
        try {
          const fallbackData = await Notifications.getExpoPushTokenAsync();
          token = fallbackData.data;
          console.log('✅ [Push] Fallback token fetched:', token);
        } catch (fallbackErr: any) {
          console.warn('[Push] Fallback token fetch note:', fallbackErr.message);
        }
      }
    } else {
      console.log('[Push] Running on simulator/emulator - physical device needed for APNS/FCM delivery');
    }
  } catch (err: any) {
    console.warn('[Push] General push registration error:', err.message);
  }

  return token;
}

// Play notification chime audio in-app
let chimeSound: Audio.Sound | null = null;

export async function playNotificationAudio() {
  try {
    if (chimeSound) {
      await chimeSound.replayAsync();
    } else {
      const { sound } = await Audio.Sound.createAsync(
        require('../../assets/sounds/alert_chime.wav'),
        { shouldPlay: true, volume: 1.0 }
      );
      chimeSound = sound;
    }
  } catch (error) {
    console.warn('Failed to play notification audio:', error);
  }
}

// Display in-app notification banner toast with audio and tactile haptic feedback
export function showInAppNotification(title: string, message: string, type: 'success' | 'info' | 'error' = 'success') {
  // Trigger gentle tactile vibration
  Haptics.notificationAsync(
    type === 'error'
      ? Haptics.NotificationFeedbackType.Error
      : Haptics.NotificationFeedbackType.Success
  ).catch(() => {});

  // Play audio chime
  playNotificationAudio().catch(() => {});

  // Show Toast banner at top
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4500,
    autoHide: true,
    topOffset: 50,
  });
}

// Dispatch an external system push notification (with sound)
export async function triggerPushNotification(title: string, body: string, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        data,
      },
      trigger: null, // deliver immediately
    });
  } catch (err) {
    console.warn('Could not schedule push notification:', err);
  }
}
