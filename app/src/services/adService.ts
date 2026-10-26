import { Platform } from 'react-native';

// Google Official Test IDs (guaranteed to load during development & testing)
const GOOGLE_TEST_IDS = {
  REWARDED: 'ca-app-pub-3940256099942544/5224354917',
  INTERSTITIAL: 'ca-app-pub-3940256099942544/1033173712',
  APP_OPEN: 'ca-app-pub-3940256099942544/9257395921',
  BANNER: 'ca-app-pub-3940256099942544/6300978111',
};

// Registered Production AdMob IDs for Perkfy (SS Innovations)
const PRODUCTION_IDS = {
  APP_ID: 'ca-app-pub-7975874630816543~2575911965',
  REWARDED: 'ca-app-pub-7975874630816543/8181919875',
  INTERSTITIAL: 'ca-app-pub-7975874630816543/7476884857',
  APP_OPEN: 'ca-app-pub-7975874630816543/3793002745',
  BANNER: '',
};

// Set to false to use real production AdMob IDs from SS Innovations
export const USE_TEST_ADS = false;

export const AD_UNIT_IDS = {
  REWARDED: USE_TEST_ADS ? GOOGLE_TEST_IDS.REWARDED : PRODUCTION_IDS.REWARDED,
  INTERSTITIAL: USE_TEST_ADS ? GOOGLE_TEST_IDS.INTERSTITIAL : PRODUCTION_IDS.INTERSTITIAL,
  APP_OPEN: USE_TEST_ADS ? GOOGLE_TEST_IDS.APP_OPEN : PRODUCTION_IDS.APP_OPEN,
  BANNER: USE_TEST_ADS ? GOOGLE_TEST_IDS.BANNER : PRODUCTION_IDS.BANNER,
};

let mobileAdsModule: any = null;
let isInitialized = false;

// Global state trackers for collision prevention and session management
let isAnyAdActive = false;
let hasShownSessionLoginAd = false;

export function isAnyAdShowing(): boolean {
  return isAnyAdActive;
}

export function hasShownSessionAd(): boolean {
  return hasShownSessionLoginAd;
}

export function resetSessionLoginAdFlag(): void {
  hasShownSessionLoginAd = false;
}

// Safely lazy-load the native module so the app runs everywhere without crashing
function getMobileAdsModule() {
  if (mobileAdsModule) return mobileAdsModule;
  try {
    const mod = require('react-native-google-mobile-ads');
    mobileAdsModule = mod;
    return mod;
  } catch (e) {
    console.log('[AdMob] Native module not loaded (running in Expo Go or web fallback)');
    return null;
  }
}

/**
 * Initialize Google Mobile Ads SDK
 */
export async function initAdService(): Promise<void> {
  if (isInitialized) return;
  const mod = getMobileAdsModule();
  if (!mod) return;

  try {
    const mobileAds = mod.default || mod;
    await mobileAds().initialize();
    isInitialized = true;
    console.log('[AdMob] Google Mobile Ads initialized successfully (Test Mode:', USE_TEST_ADS, ')');
  } catch (err) {
    console.warn('[AdMob] Initialization warning:', err);
  }
}

/**
 * Show a Rewarded Ad (for Dice Rolls, Spin Wheel, Mystery Box)
 * @param onRewarded Callback when user finishes watching and earns the reward
 * @param onClosed Callback when ad is closed or dismissed
 */
export async function showRewardedAd(options?: {
  onRewarded?: () => void;
  onClosed?: () => void;
}): Promise<void> {
  const mod = getMobileAdsModule();

  // If native ads module is unavailable, execute reward immediately without blocking user
  if (!mod || !mod.RewardedAd || !mod.RewardedAdEventType) {
    console.log('[AdMob] Rewarded ad skipped (simulated for dev)');
    options?.onRewarded?.();
    options?.onClosed?.();
    return;
  }

  const { RewardedAd, RewardedAdEventType } = mod;
  const adUnitId = AD_UNIT_IDS.REWARDED;

  try {
    const rewarded = RewardedAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let hasEarned = false;
    let isFinished = false;

    const finish = () => {
      isAnyAdActive = false;
      if (isFinished) return;
      isFinished = true;
      if (hasEarned) {
        options?.onRewarded?.();
      }
      options?.onClosed?.();
    };

    const unsubscribeLoaded = rewarded.addAdEventListener(RewardedAdEventType.LOADED, () => {
      isAnyAdActive = true;
      rewarded.show().catch((err: any) => {
        console.warn('[AdMob] Error showing rewarded ad:', err);
        finish();
      });
    });

    const unsubscribeEarned = rewarded.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        hasEarned = true;
      }
    );

    const unsubscribeClosed = rewarded.addAdEventListener(
      RewardedAdEventType.CLOSED || 'closed',
      () => {
        unsubscribeLoaded();
        unsubscribeEarned();
        unsubscribeClosed();
        finish();
      }
    );

    // Timeout safety fallback: if ad fails to load in 4 seconds, don't keep user waiting
    setTimeout(() => {
      if (!isFinished) {
        console.log('[AdMob] Ad load timeout, continuing user action');
        hasEarned = true;
        finish();
      }
    }, 4000);

    rewarded.load();
  } catch (e) {
    isAnyAdActive = false;
    console.warn('[AdMob] showRewardedAd exception:', e);
    options?.onRewarded?.();
    options?.onClosed?.();
  }
}

/**
 * Show an Interstitial Ad (for Daily Attendance / Login Claim)
 * @param onClosed Callback when ad is dismissed or fails to show
 */
export async function showInterstitialAd(options?: {
  onClosed?: () => void;
}): Promise<void> {
  const mod = getMobileAdsModule();

  if (!mod || !mod.InterstitialAd || !mod.AdEventType) {
    console.log('[AdMob] Interstitial ad skipped (simulated for dev)');
    options?.onClosed?.();
    return;
  }

  const { InterstitialAd, AdEventType } = mod;
  const adUnitId = AD_UNIT_IDS.INTERSTITIAL;

  try {
    const interstitial = InterstitialAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let isFinished = false;

    const finish = () => {
      isAnyAdActive = false;
      if (isFinished) return;
      isFinished = true;
      options?.onClosed?.();
    };

    const unsubscribeLoaded = interstitial.addAdEventListener(AdEventType.LOADED, () => {
      isAnyAdActive = true;
      interstitial.show().catch((err: any) => {
        console.warn('[AdMob] Error showing interstitial ad:', err);
        finish();
      });
    });

    const unsubscribeClosed = interstitial.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        unsubscribeLoaded();
        unsubscribeClosed();
        finish();
      }
    );

    const unsubscribeError = interstitial.addAdEventListener(
      AdEventType.ERROR,
      (err: any) => {
        console.warn('[AdMob] Interstitial ad load error:', err);
        unsubscribeLoaded();
        unsubscribeError();
        finish();
      }
    );

    // Timeout fallback after 3.5 seconds
    setTimeout(() => {
      if (!isFinished) {
        finish();
      }
    }, 3500);

    interstitial.load();
  } catch (e) {
    isAnyAdActive = false;
    console.warn('[AdMob] showInterstitialAd exception:', e);
    options?.onClosed?.();
  }
}

let appOpenAdInstance: any = null;
let isAppOpenAdLoading = false;

export function preloadAppOpenAd() {
  const mod = getMobileAdsModule();
  if (!mod || !mod.AppOpenAd || !mod.AdEventType) return;
  if (isAppOpenAdLoading || (appOpenAdInstance && appOpenAdInstance.loaded)) return;

  isAppOpenAdLoading = true;
  const { AppOpenAd, AdEventType } = mod;

  try {
    const ad = AppOpenAd.createForAdRequest(AD_UNIT_IDS.APP_OPEN, {
      requestNonPersonalizedAdsOnly: true,
    });

    ad.addAdEventListener(AdEventType.LOADED, () => {
      isAppOpenAdLoading = false;
      appOpenAdInstance = ad;
      console.log('[AdMob] App open ad preloaded');
    });

    ad.addAdEventListener(AdEventType.ERROR, (err: any) => {
      isAppOpenAdLoading = false;
      appOpenAdInstance = null;
      console.warn('[AdMob] App open ad preload error:', err);
    });

    ad.addAdEventListener(AdEventType.CLOSED, () => {
      isAnyAdActive = false;
      appOpenAdInstance = null;
      preloadAppOpenAd();
    });

    ad.load();
  } catch (err) {
    isAppOpenAdLoading = false;
  }
}

/**
 * Show App Open Ad safely
 */
export async function showAppOpenAd(): Promise<void> {
  const mod = getMobileAdsModule();
  if (!mod || !mod.AppOpenAd || !mod.AdEventType) return;
  if (isAnyAdActive) return;

  if (appOpenAdInstance && appOpenAdInstance.loaded) {
    try {
      isAnyAdActive = true;
      await appOpenAdInstance.show();
      appOpenAdInstance = null;
      return;
    } catch (e) {
      console.warn('[AdMob] Failed to show preloaded app open ad:', e);
      isAnyAdActive = false;
      appOpenAdInstance = null;
    }
  }

  const { AppOpenAd, AdEventType } = mod;
  const adUnitId = AD_UNIT_IDS.APP_OPEN;

  try {
    const appOpenAd = AppOpenAd.createForAdRequest(adUnitId, {
      requestNonPersonalizedAdsOnly: true,
    });

    let hasShown = false;
    const unsubLoaded = appOpenAd.addAdEventListener(AdEventType.LOADED, () => {
      if (!hasShown && !isAnyAdActive) {
        hasShown = true;
        isAnyAdActive = true;
        appOpenAd.show().catch((e: any) => {
          console.log('[AdMob] App open ad show error', e);
          isAnyAdActive = false;
        });
      }
    });

    const unsubClosed = appOpenAd.addAdEventListener(AdEventType.CLOSED, () => {
      isAnyAdActive = false;
      unsubLoaded();
      unsubClosed();
      preloadAppOpenAd();
    });

    const unsubError = appOpenAd.addAdEventListener(AdEventType.ERROR, () => {
      isAnyAdActive = false;
      unsubLoaded();
      unsubClosed();
      unsubError();
    });

    appOpenAd.load();
  } catch (e) {
    isAnyAdActive = false;
    console.log('[AdMob] showAppOpenAd error', e);
  }
}

/**
 * Show Post-Login App Open Ad
 * Rules:
 * 1. Only runs once per user session (enforced by hasShownSessionLoginAd).
 * 2. Will NOT run before login or on login/register screens.
 * 3. Will NOT collide with active reward ads (checked via isAnyAdActive).
 */
export async function showPostLoginAd(): Promise<void> {
  if (hasShownSessionLoginAd) {
    console.log('[AdMob] Post-login ad already shown for this session. Skipping.');
    return;
  }
  if (isAnyAdActive) {
    console.log('[AdMob] Another ad is currently active. Skipping post-login ad.');
    return;
  }

  hasShownSessionLoginAd = true;
  console.log('[AdMob] Triggering single session post-login ad');
  await showAppOpenAd();
}

