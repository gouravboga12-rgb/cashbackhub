import * as WebBrowser from 'expo-web-browser';
import { Linking } from 'react-native';

// Complete any pending auth session if redirected back
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '776264116365-94pbaka3umth91b4b17vqd6bdfe5ons2.apps.googleusercontent.com';
const REDIRECT_URI = 'https://cashbackhub-nine.vercel.app';
const APP_SCHEME = 'perkfy://';

export interface GoogleAuthResult {
  success: boolean;
  idToken?: string;
  accessToken?: string;
  user?: {
    email: string;
    name: string;
    photo?: string;
  };
  error?: string;
}

/**
 * Extracts access_token or id_token from a redirect URL (supports fragment # and query ?).
 */
function extractTokenFromUrl(url: string): string | null {
  try {
    const hashIndex = url.indexOf('#');
    const paramPart = hashIndex !== -1 ? url.slice(hashIndex + 1) : (url.includes('?') ? url.split('?')[1] : '');
    const params = new URLSearchParams(paramPart);
    return params.get('access_token') || params.get('id_token') || null;
  } catch (e) {
    return null;
  }
}

/**
 * Fetches user profile from Google's userinfo API using the access token.
 */
async function fetchGoogleUserInfo(accessToken: string) {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    if (!res.ok) return null;
    const json = await res.json();
    if (json && json.email) {
      return {
        email: json.email,
        name: json.name || json.given_name || 'Google User',
        photo: json.picture,
      };
    }
  } catch (e) {
    console.warn('Error fetching Google userinfo:', e);
  }
  return null;
}

/**
 * Initiates Google OAuth via System Browser (Chrome Custom Tabs).
 * 1. Launches Google OAuth in Chrome with redirect_uri pointing to our authorized domain (https://cashbackhub-nine.vercel.app).
 * 2. On Google account selection, Chrome lands on https://cashbackhub-nine.vercel.app/#access_token=...&state=app_mobile_oauth.
 * 3. The Google Authentication Bridge on the website immediately deep-links to perkfy://oauth#access_token=...
 * 4. The app captures the deep link, retrieves user profile, and completes login.
 */
export async function promptGoogleBrowserSignIn(): Promise<GoogleAuthResult> {
  return new Promise(async (resolve) => {
    let resolved = false;
    let linkingSubscription: any = null;

    const cleanup = () => {
      if (linkingSubscription && linkingSubscription.remove) {
        linkingSubscription.remove();
      }
    };

    const handleSuccessToken = async (accessToken: string) => {
      if (resolved) return;
      resolved = true;
      cleanup();

      try {
        WebBrowser.dismissAuthSession();
      } catch (e) {}

      const userInfo = await fetchGoogleUserInfo(accessToken);
      if (userInfo) {
        resolve({
          success: true,
          accessToken,
          user: userInfo,
        });
      } else {
        // Even if userinfo endpoint fails, return accessToken
        resolve({
          success: true,
          accessToken,
          user: {
            email: '',
            name: 'Google User',
          },
        });
      }
    };

    // Deep link fallback listener
    const onReceiveUrl = async (event: { url: string }) => {
      const url = event?.url;
      if (!url) return;
      if (url.startsWith('perkfy://') || url.includes('access_token')) {
        const token = extractTokenFromUrl(url);
        if (token) {
          await handleSuccessToken(token);
        }
      }
    };

    linkingSubscription = Linking.addEventListener('url', onReceiveUrl);

    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
        `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
        `&response_type=token` +
        `&scope=${encodeURIComponent('openid profile email')}` +
        `&prompt=select_account` +
        `&state=app_mobile_oauth`;

      // Open Chrome Custom Tab / System Browser
      const result = await WebBrowser.openAuthSessionAsync(authUrl, APP_SCHEME);

      if (result.type === 'success' && result.url) {
        const token = extractTokenFromUrl(result.url);
        if (token) {
          await handleSuccessToken(token);
          return;
        }
      }

      // If user manually dismissed/cancelled
      setTimeout(() => {
        if (!resolved) {
          resolved = true;
          cleanup();
          if (result.type === 'cancel' || result.type === 'dismiss') {
            resolve({ success: false, error: 'Sign-in cancelled' });
          } else {
            resolve({ success: false, error: 'Could not complete Google sign-in. Please try again.' });
          }
        }
      }, 500);
    } catch (error: any) {
      if (!resolved) {
        resolved = true;
        cleanup();
        resolve({ success: false, error: error.message || 'Error opening Google Sign-In' });
      }
    }
  });
}
