import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';
import Toast from 'react-native-toast-message';

// Configure global notification handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export const CHANNEL_ID = 'perkfy_rewards';

// Initialize Notification Channels with custom sound & high priority
export async function setupNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
      name: 'Perkfy Rewards & Alerts',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      sound: 'alert_chime.wav',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });

    await Notifications.setNotificationChannelAsync('default', {
      name: 'General Notifications',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#7C3AED',
      enableVibrate: true,
      enableLights: true,
      showBadge: true,
    });
  }
}

// Request permission and fetch Expo Push Token
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

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
      console.warn('Notification permissions not granted by user.');
      return null;
    }

    try {
      const pushTokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'cb16deb1-6677-405f-95cd-fc2ede10a858',
      });
      token = pushTokenData.data;
      console.log('✅ Registered Expo push token successfully:', token);
    } catch (e: any) {
      console.warn('Error fetching push token with projectId:', e.message);
      try {
        const fallbackData = await Notifications.getExpoPushTokenAsync();
        token = fallbackData.data;
      } catch (fallbackErr: any) {
        console.warn('Fallback token fetch error:', fallbackErr.message);
      }
    }
  } else {
    console.log('Must use physical device for Push Notifications');
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

// Display in-app notification banner toast with audio and haptic feedback
export function showInAppNotification(title: string, message: string, type: 'success' | 'info' | 'error' = 'success') {
  // Trigger gentle tactile vibration
  Haptics.notificationAsync(
    type === 'error'
      ? Haptics.NotificationFeedbackType.Error
      : Haptics.NotificationFeedbackType.Success
  ).catch(() => {});

  // Play audio chime
  playNotificationAudio().catch(() => {});

  // Show Toast banner
  Toast.show({
    type,
    text1: title,
    text2: message,
    position: 'top',
    visibilityTime: 4000,
    autoHide: true,
    topOffset: 45,
  });
}

// Dispatch an external system push notification (with sound)
export async function triggerPushNotification(title: string, body: string, data = {}) {
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'alert_chime.wav',
        data,
      },
      trigger: null, // deliver immediately
    });
  } catch (err) {
    console.warn('Could not schedule push notification:', err);
  }
}
