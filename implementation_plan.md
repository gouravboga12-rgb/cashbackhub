# Implementation Plan: Fix Global State Persistence on Vercel, Spin Wheel Engine, and Wallet Reset Issues

## Problem Summary
1. **Admin Panel Spin Wheel Engine limits not updating globally on user-side**:
   - In `backend/src/server.js`, `/api/v1/spin/config` had hardcoded `const dailyLimit = 10;` and `const costPerSpin = 10;` instead of reading from `db.platform_settings.daily_spin_limit` and `db.platform_settings.cost_per_spin`.
2. **Earned points clearing on refresh and spins resetting**:
   - `POST /api/v1/spin/play` did not exist in `backend/src/server.js`. When a user spun the wheel, the backend returned 404, prompting the frontend to record points solely in browser `localStorage`. On page refresh, the frontend queried the server wallet, wiping out all locally earned spin points and resetting spin counts!
3. **New users, attendance points, and wallet balances not persisting on Vercel**:
   - On Vercel serverless lambdas, `writeDb()` called `syncToSupabase()` asynchronously in the background without awaiting it before `res.json()`.
   - Vercel immediately freezes/kills the lambda upon HTTP response transmission, aborting the Supabase write before completion.
   - Subsequent requests to new lambda instances (or page refreshes from other devices) loaded stale/empty state from Supabase, causing new registrations, attendance check-ins (+10 pts), and bonus points (+100 pts) to be lost.

---

## Proposed Changes

### 1. Database & Cloud Persistence (`backend/src/db.js`)
- Convert `writeDb` into an `async function writeDb(data)` (or provide `async saveDb(data)`) that explicitly **awaits** `syncToSupabase(data)` to guarantee all data is saved to Supabase before any HTTP response is dispatched.
- Update `syncToSupabase()` to:
  - Perform an atomic upsert into `public.perkfy_app_state` (`id: 'main_state'`).
  - Log and ensure full completion on Vercel serverless environments.
- Ensure `syncFromSupabase()` always fetches the latest data when running in serverless mode (or when cache is stale), keeping all Vercel lambda instances strictly in sync.

### 2. Backend Server Routes (`backend/src/server.js`)
- **Implement `POST /api/v1/spin/play`**:
  - Authenticate user via `authenticateToken`.
  - Validate daily spin limit from `db.platform_settings.daily_spin_limit`.
  - Check if user has enough points if `cost_per_spin > 0`.
  - Calculate slice outcome based on admin configured slice probability weights and daily win limits.
  - Deduct entry fee (if any), credit won points, update user's wallet and create `wallet_transactions` record.
  - Record spin in `db.spin_history` and `recordActivity`.
  - **Await** `writeDb(db)` to commit to Supabase.
  - Return updated wallet, spins remaining, won points, and slice index.
- **Fix `GET /api/v1/spin/config`**:
  - Replace hardcoded `dailyLimit = 10` and `costPerSpin = 10` with `db.platform_settings.daily_spin_limit || 10` and `db.platform_settings.cost_per_spin || 10`.
  - Return active slices configured by admin.
- **Await Supabase persistence on all mutation endpoints**:
  - `POST /api/v1/auth/register`: `await writeDb(db)` before `res.status(201).json()`.
  - `POST /api/v1/auth/google`: `await writeDb(db)` before `res.json()`.
  - `POST /api/v1/attendance/check-in`: `await writeDb(db)` before `res.json()`.
  - `POST /api/v1/ads/verify`: `await writeDb(db)` before `res.json()`.
  - `PUT /api/v1/admin/spin-wheel` & `PUT /api/v1/admin/settings`: `await writeDb(db)` before `res.json()`.
  - `POST /api/v1/withdraw/request`: `await writeDb(db)` before `res.json()`.

### 3. Frontend Portal Pages (`web/src/pages/Portal/`)
- **`SpinWin.jsx`**:
  - Bind directly to `/api/v1/spin/config` and `/api/v1/spin/play`.
  - Eliminate reliance on disconnected client-side `localStorage` overrides when authenticated with backend.
  - Refresh user wallet and daily spin counters from live server responses.
- **`WatchAds.jsx`**:
  - Ensure daily ad watch limit and ad reward points dynamically reflect `db.platform_settings.daily_ad_limit` and `db.platform_settings.ad_reward_points`.
  - Synchronize completed ads directly from server response.
- **`Dashboard.jsx` & `Wallet.jsx`**:
  - Ensure wallet points display always syncs with the verified server balance.

---

## Verification Plan

### Automated / API Verification
1. **Live Supabase Persistence Test**:
   - Register a user via `POST /api/v1/auth/register` (or `POST /api/v1/auth/google`).
   - Query Supabase directly via Node.js script to confirm the user and their 100-point wallet record exist in Supabase.
2. **Attendance Persistence Test**:
   - Call `POST /api/v1/attendance/check-in`.
   - Verify +10 points are credited and immediately verifiable in Supabase.
3. **Spin Wheel Engine Test**:
   - Update daily spin limit in Admin Panel (e.g. from 10 to 15).
   - Query `GET /api/v1/spin/config` to verify `daily_limit` returns 15.
   - Call `POST /api/v1/spin/play` to verify the spin is processed, wallet points updated, and outcome persisted in Supabase.
4. **Vercel Build & Live Endpoint Verification**:
   - Run `npm run build` to verify clean compilation.
   - Commit & push to `main` to trigger Vercel deployment.
   - Test endpoints on `https://cashbackhub-peach.vercel.app` using `curl.exe` to verify live global persistence.
