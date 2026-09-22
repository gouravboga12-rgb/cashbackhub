/**
 * walletUtils.js - Persistent wallet balance helpers
 *
 * Problem: Vercel serverless cold-starts reset the in-memory / /tmp DB to 0,
 * which causes the API to return an empty wallet even for users who have earned
 * points.  These helpers guard against that by comparing `total_earned` – which
 * is monotonically increasing – between the live API response and the locally
 * cached value.  If the API reports LESS total_earned than what we already have
 * cached, we know the server cold-started and we keep the local balance.
 */

const WALLET_CACHE_KEY = 'cashback_wallet';

/**
 * Return the user-specific or generic wallet cache key.
 */
export function getWalletKey(userId) {
  return userId ? `cashback_wallet_${userId}` : WALLET_CACHE_KEY;
}

/**
 * Read the cached wallet object from localStorage.
 * Falls back to the legacy generic key for backwards compatibility.
 */
export function getCachedWallet(userId) {
  const keys = userId
    ? [`cashback_wallet_${userId}`, WALLET_CACHE_KEY]
    : [WALLET_CACHE_KEY];

  for (const key of keys) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === 'object') return parsed;
      }
    } catch (e) { /* ignore */ }
  }
  return null;
}

/**
 * Persist a wallet to localStorage under both the user-keyed and generic keys
 * so that all components can read it regardless of whether they know the userId.
 */
export function persistWallet(walletObj, userId) {
  const json = JSON.stringify(walletObj);
  try {
    if (userId) localStorage.setItem(`cashback_wallet_${userId}`, json);
    localStorage.setItem(WALLET_CACHE_KEY, json);
  } catch (e) { /* storage full or private mode */ }
}

/**
 * Merge an API wallet response with the locally cached wallet.
 *
 * Rules:
 *  - `total_earned` is monotonically increasing.  If the API total_earned is
 *    LOWER than the cache, the server cold-started with an empty DB – we must
 *    NOT overwrite the cache.
 *  - When awardedPoints > 0 and cold-start is detected, we add those points to
 *    the cached balance (the server just credited them in its ephemeral context).
 *  - Otherwise, trust the API response fully.
 *
 * @param {object} apiWallet      - Wallet object returned by the backend
 * @param {number} awardedPoints  - Points the backend JUST credited (0 for read-only calls)
 * @param {string} userId         - Logged-in user id (optional)
 * @returns {object}              - The wallet object that should be used / saved
 */
export function mergeWallet(apiWallet, awardedPoints = 0, userId = null) {
  const cached = getCachedWallet(userId) || { available_points: 0, total_earned: 0, total_redeemed: 0 };

  const apiEarned = (apiWallet && apiWallet.total_earned) ? apiWallet.total_earned : 0;
  const cachedEarned = cached.total_earned || 0;

  // API has at least as much history as we cached → server has real data → trust it
  if (apiEarned >= cachedEarned) {
    persistWallet(apiWallet, userId);
    return apiWallet;
  }

  // Cold-start detected: server lost data.
  // If the backend just credited awardedPoints, add them to our cached balance.
  const merged = {
    ...cached,
    available_points: Math.max(0, (cached.available_points || 0) + awardedPoints),
    total_earned: cachedEarned + awardedPoints,
    updated_at: new Date().toISOString()
  };

  persistWallet(merged, userId);
  return merged;
}
