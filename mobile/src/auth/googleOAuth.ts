import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';

/**
 * Required on iOS/Android so expo-web-browser returns OAuth control to the app.
 * ClerkProvider only calls this on web — native must invoke it at startup.
 */
try {
  WebBrowser.maybeCompleteAuthSession();
} catch {
  // Native module may be unavailable until a full rebuild.
}

/** Must match Clerk Dashboard → Native applications → SSO redirect allowlist. */
export const googleOAuthRedirectUrl = AuthSession.makeRedirectUri({
  scheme: 'cardweave',
  path: 'oauth-native-callback',
});

export async function warmUpOAuthBrowser(): Promise<void> {
  try {
    await WebBrowser.warmUpAsync();
  } catch {
    // Non-fatal — warm-up is an optimization.
  }
}

export async function coolDownOAuthBrowser(): Promise<void> {
  try {
    await WebBrowser.coolDownAsync();
  } catch {
    // ignore
  }
}
