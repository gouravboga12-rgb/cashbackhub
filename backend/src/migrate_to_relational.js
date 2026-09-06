const { supabase } = require('./supabase');
const { getISTTimestamp } = require('./db');

async function migrate() {
  console.log('Fetching state from perkfy_app_state...');
  const { data: stateRow, error } = await supabase
    .from('perkfy_app_state')
    .select('data')
    .eq('id', 'main_state')
    .single();

  if (error || !stateRow || !stateRow.data) {
    console.error('Error fetching stateRow:', error);
    return;
  }
  const db = stateRow.data;

  // 1. Migrate Users
  const userIds = new Set();
  if (db.users && db.users.length > 0) {
    const usersToInsert = db.users.map((u) => {
      userIds.add(u.id);
      return {
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        mobile: u.mobile || '',
        password_hash: u.password_hash || u.password || 'hashed_default',
        role: u.role || 'user',
        avatar: u.avatar || '',
        status: u.status || 'active',
        auth_provider: u.auth_provider || (u.id.startsWith('usr_g_') ? 'google' : 'email'),
        created_at: u.created_at || getISTTimestamp()
      };
    });
    const { error: uErr } = await supabase.from('users').upsert(usersToInsert, { onConflict: 'id' });
    console.log('Migrated users:', usersToInsert.length, uErr ? uErr.message : 'OK');
  }

  // 2. Migrate Wallets
  if (db.wallets && db.wallets.length > 0) {
    const walletsToInsert = db.wallets
      .filter((w) => userIds.has(w.user_id))
      .map((w) => ({
        id: w.id,
        user_id: w.user_id,
        available_points: w.available_points || 0,
        total_earned: w.total_earned || 0,
        total_redeemed: w.total_redeemed || 0,
        updated_at: w.updated_at || getISTTimestamp()
      }));
    const { error: wErr } = await supabase.from('wallets').upsert(walletsToInsert, { onConflict: 'id' });
    console.log('Migrated wallets:', walletsToInsert.length, wErr ? wErr.message : 'OK');
  }

  // 3. Migrate Wallet Transactions
  if (db.wallet_transactions && db.wallet_transactions.length > 0) {
    const txsToInsert = db.wallet_transactions
      .filter((t) => userIds.has(t.user_id))
      .map((t) => ({
        id: t.id,
        user_id: t.user_id,
        user_name: t.user_name || 'User',
        type: t.type || 'Transaction',
        points: t.points || 0,
        balance_before: t.balance_before || 0,
        balance_after: t.balance_after || 0,
        reference_id: t.reference_id || `REF-${t.id}`,
        description: t.description || '',
        status: t.status || 'Completed',
        created_at: t.created_at || getISTTimestamp()
      }));
    const { error: tErr } = await supabase.from('wallet_transactions').upsert(txsToInsert, { onConflict: 'id' });
    console.log('Migrated transactions:', txsToInsert.length, tErr ? tErr.message : 'OK');
  }

  // 4. Migrate Platform Settings
  const ps = db.platform_settings || {};
  const settingsToInsert = {
    id: 'global_settings',
    daily_spin_limit: ps.daily_spin_limit || 10,
    cost_per_spin: ps.cost_per_spin !== undefined ? ps.cost_per_spin : 10,
    daily_ad_limit: ps.daily_ad_limit || 10,
    ad_reward_points: ps.ad_reward_points || 10,
    attendance_reward_points: ps.attendance_reward_points || 10,
    points_to_rupee_ratio: ps.points_to_rupee_ratio || 10,
    min_withdrawal_points: ps.min_withdrawal_points || 100,
    currency: ps.currency || 'INR',
    updated_at: getISTTimestamp()
  };
  const { error: sErr } = await supabase.from('platform_settings').upsert(settingsToInsert, { onConflict: 'id' });
  console.log('Migrated platform settings:', sErr ? sErr.message : 'OK');

  console.log('🏁 Relational DB migration completed successfully!');
}

migrate();
