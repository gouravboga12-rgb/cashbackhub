import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import * as Crypto from 'expo-crypto';

// Complete any pending auth session if redirected back
WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_ID = '776264116365-94pbaka3umth91b4b17vqd6bdfe5ons2.apps.googleusercontent.com';

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
 * Initiates Google OAuth via System Browser (Chrome Custom Tabs / Safari View Controller).
 * Redirects user to Google OAuth in browser, allows account selection, and securely
 * returns to the app via custom scheme 'perkfy://'.
 */
export async function promptGoogleBrowserSignIn(): Promise<GoogleAuthResult> {
  try {
    const redirectUri = AuthSession.makeRedirectUri({
      scheme: 'perkfy',
    });

    const nonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      String(Math.random())
    );

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
      `client_id=${encodeURIComponent(GOOGLE_CLIENT_ID)}` +
      `&redirect_uri=${encodeURIComponent(redirectUri)}` +
      `&response_type=${encodeURIComponent('id_token token')}` +
      `&scope=${encodeURIComponent('openid profile email')}` +
      `&nonce=${encodeURIComponent(nonce)}` +
      `&prompt=select_account`;

    // Opens system browser and waits for redirect back to app
    const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectUri);

    if (result.type === 'success' && result.url) {
      // Parse parameters from fragment (#) or query string (?)
      const parsedUrl = new URL(result.url);
      const hashParams = new URLSearchParams(parsedUrl.hash.replace(/^#/, ''));
      const queryParams = parsedUrl.searchParams;

      const idToken = hashParams.get('id_token') || queryParams.get('id_token');
      const accessToken = hashParams.get('access_token') || queryParams.get('access_token');

      let userInfo = undefined;
      if (accessToken) {
        try {
          const userRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
          });
          const userJson = await userRes.json();
          if (userJson?.email) {
            userInfo = {
              email: userJson.email,
              name: userJson.name || userJson.given_name || 'Google User',
              photo: userJson.picture,
            };
          }
        } catch (e) {
          console.warn('Could not fetch userinfo from Google API', e);
        }
      }

      if (idToken || userInfo?.email) {
        return {
          success: true,
          idToken: idToken || undefined,
          accessToken: accessToken || undefined,
          user: userInfo,
        };
      }

      return { success: false, error: 'Could not extract authentication credentials from redirect URL' };
    }

    if (result.type === 'cancel' || result.type === 'dismiss') {
      return { success: false, error: 'Sign-in was cancelled by user.' };
    }

    return { success: false, error: 'Authentication session failed.' };
  } catch (error: any) {
    console.error('Google Browser Sign-In error:', error);
    return { success: false, error: error.message || 'Error opening Google Sign-In in browser' };
  }
}
