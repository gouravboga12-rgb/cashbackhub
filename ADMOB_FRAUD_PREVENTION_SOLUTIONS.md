# AdMob Multi-Account & Invalid Traffic Prevention Guide

This document outlines the solutions to protect your Google AdMob account from **Invalid Traffic (IVT)**, multi-account farming on a single device, and account suspensions.

---

## 🎯 Preferred Approach: Solution A (Zero-Code / Google Console Level)

### Overview
Google AdMob provides built-in, hardware-level frequency capping. When enabled, Google tracks the device's **Google Advertising ID (GAID)** and automatically blocks ad serving to that physical device once the limit is reached, regardless of how many accounts the user switches to inside your app.

### Step-by-Step Setup:
1. Open your **[Google AdMob Console](https://apps.admob.com/)**.
2. Go to **Apps** > Select **Perkfy**.
3. In the left navigation, click **Ad units**.
4. Click on your **Rewarded Ad Unit** (and Interstitial Ad Unit if applicable).
5. Click **Advanced settings** at the bottom of the page.
6. Find the **Frequency capping** section and click the edit/toggle icon.
7. Set the cap:
   * **Recommendation**: **10 impressions per user per 24 hours** (or 1 impression per 3 minutes).
8. Click **Save**.

> **Why this works:** Google enforces this directly at the Google Play Services level on the physical phone. Even if the user logs out and logs into 10 different accounts, AdMob will return `ERROR_CODE_NO_FILL` on that phone until the next 24-hour cycle.

---

## 🛠️ Alternative Approach: Solution B (App & Device-Level Binding)

### Overview
Bind daily ad rewards to the physical phone's unique hardware identifier rather than just the user ID.

### How to Implement:
1. Generate a permanent installation UUID on the device using `expo-secure-store` or `expo-application`:
   ```typescript
   import * as SecureStore from 'expo-secure-store';
   import * as Application from 'expo-application';

   async function getOrCreateDeviceId(): Promise<string> {
     let deviceId = await SecureStore.getItemAsync('perkfy_device_uuid');
     if (!deviceId) {
       deviceId = Application.androidId || `dev_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
       await SecureStore.setItemAsync('perkfy_device_uuid', deviceId);
     }
     return deviceId;
   }
   ```
2. When the user watches an ad and calls `/api/v1/ads/verify`, send `device_id` in the request header/body.
3. In the backend, track daily ad counts in a `device_ad_limits` table:
   * If `daily_count >= 10` for that `device_id`, reject reward credit regardless of the `user_id`.

---

## 🛡️ Complementary Approach: Solution C (Ad Cooldowns & Cooldown Timers)

### Overview
Prevent bot-like ad speedrunning by forcing a cooling period between ad views on the same device.

### How to Implement:
1. **Frontend Cooldown**: Disable the "Watch Ad" button for **60–90 seconds** after every completed ad with a visual countdown timer.
2. **Server-Side Timestamp Validation**: The server checks that at least 45 seconds have passed since the previous ad verification timestamp for that device/user.
3. **VPN & Proxy Blocking**: In backend middleware, flag or block requests originating from public datacenter VPN proxies during reward claims.

---

## 📌 Implementation Status
- **Current Phase**: Proceeding with Google Play Store release first.
- **Next Phase**: Enable **Solution A** in the Google AdMob console prior to scaling user acquisition.
