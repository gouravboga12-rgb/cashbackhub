/**
 * walletUtils.js - Wallet helpers backed by AWS EC2 PostgreSQL
 *
 * AWS PostgreSQL is the single source of truth for user balances.
 * LocalStorage caching across accounts is eliminated to ensure total
 * independence between different logged-in users.
 */

/**
 * Return user-scoped wallet cache key.
 */
export function getWalletKey(userId) {
  return userId ? `perkfy_wallet_${userId}` : null;
}

/**
 * Read cached wallet ONLY for the exact current user.
 * Returns null if no exact user match exists (forces fresh fetch from AWS EC2).
 */
export function getCachedWallet(userId) {
  if (!userId) return null;
  try {
    const raw = sessionStorage.getItem(`perkfy_wallet_${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return null;
}

/**
 * Persist wallet to session memory for the current user only.
 * Automatically cleans up any legacy shared keys.
 */
export function persistWallet(walletObj, userId) {
  try {
    // Remove legacy cross-account contamination keys from localStorage
    localStorage.removeItem('cashback_wallet');
    if (userId && walletObj) {
      sessionStorage.setItem(`perkfy_wallet_${userId}`, JSON.stringify(walletObj));
    }
  } catch (e) {}
}

/**
 * Merge wallet helper - AWS EC2 is the single source of truth.
 * Always trust the live server response.
 */
export function mergeWallet(apiWallet, awardedPoints = 0, userId = null) {
  if (apiWallet && typeof apiWallet === 'object') {
    persistWallet(apiWallet, userId);
    return apiWallet;
  }
  return { available_points: 0, total_earned: 0, total_redeemed: 0 };
}

/**
 * Wipe all cached data on logout or account switch so that
 * the next account starts 100% clean and independent.
 */
export function clearAllUserLocalCache(keepToken = false) {
  try {
    const keysToRemove = [
      ...(keepToken ? [] : ['cashback_token', 'cashback_user']),
      'cashback_wallet',
      'perkfy_social_connect_status',
      'cashback_completed_ads',
      'cashback_transactions',
      'cashback_spin_date',
      'cashback_spin_count_today',
      'cashback_dice_completed_today',
      'cashback_withdrawals',
      'cashback_attendance_claimed'
    ];

    keysToRemove.forEach(k => {
      localStorage.removeItem(k);
      sessionStorage.removeItem(k);
    });

    // Also remove any residue keys starting with perkfy_ or cashback_ (except token/user if keepToken)
    Object.keys(localStorage).forEach(k => {
      if (keepToken && (k === 'cashback_token' || k === 'cashback_user')) return;
      if (k.startsWith('perkfy_') || k.startsWith('cashback_')) {
        localStorage.removeItem(k);
      }
    });
    Object.keys(sessionStorage).forEach(k => {
      if (k.startsWith('perkfy_') || k.startsWith('cashback_')) {
        sessionStorage.removeItem(k);
      }
    });
  } catch (e) {}
}
