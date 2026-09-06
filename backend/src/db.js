const bcrypt = require('bcryptjs');
const { supabase } = require('./supabase');

// ─── IST Timestamp Helper (UTC+5:30) ────────────────────────────────────────
function getISTTimestamp(offsetMs = 0) {
  const now = new Date(Date.now() + offsetMs);
  // Format as ISO string with IST offset (+05:30)
  const IST_OFFSET = 5.5 * 60 * 60 * 1000; // +5:30 in ms
  const istDate = new Date(now.getTime() + IST_OFFSET);
  const iso = istDate.toISOString().replace('Z', '+05:30');
  return iso;
}

// IST date string (YYYY-MM-DD) for today in IST
function getISTDateString(offsetMs = 0) {
  return getISTTimestamp(offsetMs).split('T')[0];
}

// Live in-memory cache synchronized with Supabase cloud
let memoryDbCache = null;

async function syncFromSupabase() {
  if (!supabase) {
    return memoryDbCache || initialData;
  }
  try {
    // 1. Fetch relational users, wallets, transactions, platform_settings in parallel
    const [usersRes, walletsRes, txsRes, settingsRes, stateRes] = await Promise.all([
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('wallets').select('*'),
      supabase.from('wallet_transactions').select('*').order('created_at', { ascending: false }).limit(100),
      supabase.from('platform_settings').select('*').eq('id', 'global_settings').maybeSingle(),
      supabase.from('perkfy_app_state').select('data').eq('id', 'main_state').maybeSingle()
    ]);

    const baseData = (stateRes.data && stateRes.data.data) ? stateRes.data.data : { ...initialData };

    if (usersRes.data && Array.isArray(usersRes.data) && usersRes.data.length > 0) {
      baseData.users = usersRes.data;
    }
    if (walletsRes.data && Array.isArray(walletsRes.data) && walletsRes.data.length > 0) {
      baseData.wallets = walletsRes.data;
    }
    if (txsRes.data && Array.isArray(txsRes.data) && txsRes.data.length > 0) {
      baseData.wallet_transactions = txsRes.data;
    }
    if (settingsRes.data) {
      const existingSignupBonus = baseData.platform_settings?.signup_bonus_points !== undefined
        ? baseData.platform_settings.signup_bonus_points
        : 100;
      baseData.platform_settings = {
        ...(baseData.platform_settings || {}),
        ...settingsRes.data,
        signup_bonus_points: (settingsRes.data.signup_bonus_points !== undefined && settingsRes.data.signup_bonus_points !== null)
          ? settingsRes.data.signup_bonus_points
          : existingSignupBonus
      };
    }

    if (baseData.vouchers && Array.isArray(baseData.vouchers)) {
      baseData.vouchers.forEach(v => {
        if (!v.minimum_points || v.minimum_points > 100) v.minimum_points = 100;
        if (!v.denominations || !v.denominations.includes(100)) v.denominations = [100, 200, 500, 1000, 2500, 5000];
      });
    }

    memoryDbCache = baseData;
    return memoryDbCache;
  } catch (err) {
    console.error('Supabase cloud fetch error:', err.message || err);
  }
  return memoryDbCache || initialData;
}

async function syncToSupabase(data) {
  if (!supabase || !data) return;
  memoryDbCache = data;
  try {
    const promises = [
      supabase.from('perkfy_app_state').upsert({ id: 'main_state', data, updated_at: getISTTimestamp() })
    ];

    // Sync Relational Users Table
    if (data.users && Array.isArray(data.users) && data.users.length > 0) {
      const activeIds = data.users.map(u => u.id);
      const usersPayload = data.users.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email.toLowerCase(),
        mobile: u.mobile || '',
        password_hash: u.password_hash || u.password || 'hashed',
        role: u.role || 'user',
        avatar: u.avatar || '',
        status: u.status || 'active',
        auth_provider: u.auth_provider || (u.id.startsWith('usr_g_') ? 'google' : 'email'),
        created_at: u.created_at || getISTTimestamp()
      }));
      promises.push(supabase.from('users').upsert(usersPayload, { onConflict: 'id' }));

      // Clean up any deleted users from relational PostgreSQL tables
      try {
        const { data: currentDbUsers } = await supabase.from('users').select('id');
        if (currentDbUsers && Array.isArray(currentDbUsers)) {
          const removedIds = currentDbUsers.map(u => u.id).filter(id => !activeIds.includes(id));
          for (const remId of removedIds) {
            promises.push(supabase.from('wallets').delete().eq('user_id', remId));
            promises.push(supabase.from('wallet_transactions').delete().eq('user_id', remId));
            promises.push(supabase.from('attendance').delete().eq('user_id', remId));
            promises.push(supabase.from('spin_history').delete().eq('user_id', remId));
            promises.push(supabase.from('ad_history').delete().eq('user_id', remId));
            promises.push(supabase.from('withdrawals').delete().eq('user_id', remId));
            promises.push(supabase.from('users').delete().eq('id', remId));
          }
        }
      } catch (e) {}
    }

    // Sync Relational Wallets Table
    if (data.wallets && Array.isArray(data.wallets) && data.wallets.length > 0) {
      const validUserIds = new Set((data.users || []).map(u => u.id));
      const walletsPayload = data.wallets
        .filter(w => validUserIds.has(w.user_id))
        .map(w => ({
          id: w.id,
          user_id: w.user_id,
          available_points: w.available_points || 0,
          total_earned: w.total_earned || 0,
          total_redeemed: w.total_redeemed || 0,
          updated_at: w.updated_at || getISTTimestamp()
        }));
      if (walletsPayload.length > 0) {
        promises.push(supabase.from('wallets').upsert(walletsPayload, { onConflict: 'id' }));
      }
    }

    // Sync Relational Platform Settings Table
    if (data.platform_settings) {
      const ps = data.platform_settings;
      const settingsPayload = {
        id: 'global_settings',
        daily_spin_limit: ps.daily_spin_limit || 10,
        cost_per_spin: ps.cost_per_spin !== undefined ? ps.cost_per_spin : 10,
        daily_ad_limit: ps.daily_ad_limit || 10,
        ad_reward_points: ps.ad_reward_points || 10,
        attendance_reward_points: ps.attendance_reward_points || 10,
        points_to_rupee_ratio: ps.points_to_rupee_ratio || 10,
        signup_bonus_points: ps.signup_bonus_points !== undefined ? ps.signup_bonus_points : 100,
        min_withdrawal_points: ps.min_withdrawal_points || 100,
        currency: ps.currency || 'INR',
        updated_at: getISTTimestamp()
      };

      promises.push((async () => {
        try {
          const { error } = await supabase.from('platform_settings').upsert(settingsPayload, { onConflict: 'id' });
          if (error && (error.code === 'PGRST204' || error.message?.includes('signup_bonus_points'))) {
            // PostgreSQL column signup_bonus_points not yet created in relation; upsert remaining settings safely
            const safePayload = { ...settingsPayload };
            delete safePayload.signup_bonus_points;
            await supabase.from('platform_settings').upsert(safePayload, { onConflict: 'id' });
          }
        } catch (e) {
          console.warn('Supabase platform_settings upsert warning:', e.message);
        }
      })());
    }

    await Promise.all(promises);
  } catch (err) {
    console.error('Supabase cloud sync exception:', err.message || err);
  }
}



const adminSalt = bcrypt.genSaltSync(10);
const adminPasswordHash = bcrypt.hashSync('Admin@2026!', adminSalt);
const userPasswordHash = bcrypt.hashSync('Demo123!', adminSalt);

// Initial seed dataset
const initialData = {
  platform_settings: {
    points_to_rupee_ratio: 10, // 10 Points = ₹1
    attendance_reward_points: 10,
    ad_reward_points: 10,
    daily_ad_limit: 10,
    daily_spin_limit: 10,
    cost_per_spin: 10,
    signup_bonus_points: 100,
    min_withdrawal_points: 100,
    currency: 'INR'
  },
  users: [
    {
      id: 'usr_admin_001',
      name: 'Super Admin',
      email: 'admin@cashbackhub.com',
      mobile: '+919876500001',
      password_hash: adminPasswordHash,
      role: 'admin',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 30 * 86400000).toISOString()
    },
    {
      id: 'usr_admin_001',
      name: 'Super Admin',
      email: 'admin@cashbackhub.com',
      mobile: '+919812345678',
      password_hash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 10 * 86400000).toISOString()
    },
    {
      id: 'usr_admin_001',
      name: 'Super Admin',
      email: 'admin@cashbackhub.com',
      mobile: '+919823456789',
      password_hash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 8 * 86400000).toISOString()
    },
    {
      id: 'usr_admin_001',
      name: 'Super Admin',
      email: 'admin@cashbackhub.com',
      mobile: '+919834567890',
      password_hash: userPasswordHash,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80',
      status: 'active',
      created_at: new Date(Date.now() - 5 * 86400000).toISOString()
    }
  ],
  wallets: [
    {
      id: 'wal_admin_001',
      user_id: 'usr_admin_001',
      available_points: 4120,
      total_earned: 5620,
      total_redeemed: 1500,
      updated_at: new Date().toISOString()
    },
    {
      id: 'wal_admin_001',
      user_id: 'usr_admin_001',
      available_points: 1850,
      total_earned: 1850,
      total_redeemed: 0,
      updated_at: new Date().toISOString()
    },
    {
      id: 'wal_admin_001',
      user_id: 'usr_admin_001',
      available_points: 920,
      total_earned: 2920,
      total_redeemed: 2000,
      updated_at: new Date().toISOString()
    }
  ],
  wallet_transactions: [
    {
      id: 'tx_1001',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      type: 'Attendance Reward',
      points: 10,
      balance_before: 2440,
      balance_after: 2450,
      reference_id: 'ATT-2026-09-05',
      description: 'Daily check-in attendance reward',
      status: 'Completed',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'tx_1002',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      type: 'Advertisement Reward',
      points: 10,
      balance_before: 2430,
      balance_after: 2440,
      reference_id: 'AD-VIEW-101',
      description: 'Completed video ad #1',
      status: 'Completed',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'tx_1003',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      type: 'Spin Reward',
      points: 100,
      balance_before: 2330,
      balance_after: 2430,
      reference_id: 'SPIN-WHEEL-889',
      description: 'Won 100 points on Spin & Win',
      status: 'Completed',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'tx_1004',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      type: 'Withdrawal Debit',
      points: -800,
      balance_before: 3130,
      balance_after: 2330,
      reference_id: 'WD-REQ-7741',
      description: 'Redeemed Flipkart ₹80 Gift Voucher',
      status: 'Completed',
      created_at: new Date(Date.now() - 172800000).toISOString()
    },
    {
      id: 'tx_1005',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      type: 'Spin Reward',
      points: 500,
      balance_before: 3620,
      balance_after: 4120,
      reference_id: 'SPIN-WHEEL-902',
      description: 'Won 500 points on Spin & Win',
      status: 'Completed',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'tx_1006',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      type: 'Attendance Reward',
      points: 10,
      balance_before: 1840,
      balance_after: 1850,
      reference_id: 'ATT-2026-09-05',
      description: 'Daily check-in attendance reward',
      status: 'Completed',
      created_at: new Date(Date.now() - 5400000).toISOString()
    }
  ],
  attendance: [
    {
      id: 'att_101',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      user_email: 'user@perkfy.com',
      check_in_date: new Date().toISOString().split('T')[0],
      reward_points: 10,
      streak_days: 7,
      ad_watched_reward: true,
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'att_102',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      user_email: 'admin@cashbackhub.com',
      check_in_date: new Date().toISOString().split('T')[0],
      reward_points: 10,
      streak_days: 12,
      ad_watched_reward: true,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'att_103',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      user_email: 'admin@cashbackhub.com',
      check_in_date: new Date().toISOString().split('T')[0],
      reward_points: 10,
      streak_days: 3,
      ad_watched_reward: true,
      created_at: new Date(Date.now() - 5400000).toISOString()
    }
  ],
  advertisements: [
    { id: 'ad_1', title: 'Tech Gadgets 2026 Showcase', duration: 15, reward_points: 10, thumbnail: '📱' },
    { id: 'ad_2', title: 'Super Saver FMCG Deals', duration: 20, reward_points: 10, thumbnail: '🛒' },
    { id: 'ad_3', title: 'Eco Friendly Home Cleaning', duration: 15, reward_points: 10, thumbnail: '🧹' },
    { id: 'ad_4', title: 'Top Mobile Games Promo', duration: 30, reward_points: 10, thumbnail: '🎮' },
    { id: 'ad_5', title: 'Fresh Grocery Express', duration: 15, reward_points: 10, thumbnail: '🍎' },
    { id: 'ad_6', title: 'Smart Home Automation', duration: 20, reward_points: 10, thumbnail: '🏠' },
    { id: 'ad_7', title: 'Electric Vehicles Tour', duration: 25, reward_points: 10, thumbnail: '⚡' },
    { id: 'ad_8', title: 'Online Learning Discount', duration: 15, reward_points: 10, thumbnail: '📚' },
    { id: 'ad_9', title: 'Fashion Clearance Sale', duration: 20, reward_points: 10, thumbnail: '👗' },
    { id: 'ad_10', title: 'Travel & Cashback Booking', duration: 30, reward_points: 10, thumbnail: '✈️' }
  ],
  ad_completions: [
    {
      id: 'adc_101',
      user_id: 'usr_admin_001',
      ad_id: 'ad_1',
      completion_date: new Date().toISOString().split('T')[0],
      verification_status: 'verified',
      reward_points: 10,
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'adc_102',
      user_id: 'usr_admin_001',
      ad_id: 'ad_2',
      completion_date: new Date().toISOString().split('T')[0],
      verification_status: 'verified',
      reward_points: 10,
      created_at: new Date(Date.now() - 8200000).toISOString()
    }
  ],
  spin_configurations: [
    {
      id: 'slice_1',
      label: '1,000 Points',
      reward_points: 1000,
      probability_weight: 5,
      color: '#5B21B6',
      daily_limit: 5,
      today_awarded_count: 1,
      last_reset_date: new Date().toISOString().split('T')[0],
      is_active: true
    },
    {
      id: 'slice_2',
      label: '500 Points',
      reward_points: 500,
      probability_weight: 15,
      color: '#4ADE80',
      daily_limit: 15,
      today_awarded_count: 3,
      last_reset_date: new Date().toISOString().split('T')[0],
      is_active: true
    },
    {
      id: 'slice_3',
      label: '200 Points',
      reward_points: 200,
      probability_weight: 25,
      color: '#6D28D9',
      daily_limit: 50,
      today_awarded_count: 12,
      last_reset_date: new Date().toISOString().split('T')[0],
      is_active: true
    },
    {
      id: 'slice_4',
      label: '100 Points',
      reward_points: 100,
      probability_weight: 25,
      color: '#22C55E',
      daily_limit: 100,
      today_awarded_count: 24,
      last_reset_date: new Date().toISOString().split('T')[0],
      is_active: true
    },
    {
      id: 'slice_5',
      label: '50 Points',
      reward_points: 50,
      probability_weight: 20,
      color: '#7C3AED',
      daily_limit: 0, // 0 = unlimited
      today_awarded_count: 45,
      last_reset_date: new Date().toISOString().split('T')[0],
      is_active: true
    },
    {
      id: 'slice_6',
      label: 'Better Luck Next Time',
      reward_points: 0,
      probability_weight: 10,
      color: '#EC4899',
      daily_limit: 0,
      today_awarded_count: 18,
      last_reset_date: new Date().toISOString().split('T')[0],
      is_active: true
    }
  ],
  spin_history: [
    {
      id: 'spin_101',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      winning_slice_id: 'slice_4',
      reward_points: 100,
      cost_points: 10,
      status: 'Completed',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'spin_102',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      winning_slice_id: 'slice_2',
      reward_points: 500,
      cost_points: 10,
      status: 'Completed',
      created_at: new Date(Date.now() - 1800000).toISOString()
    }
  ],
  vouchers: [
    {
      id: 'vch_phonepe',
      name: 'PhonePe Gift Voucher',
      provider: 'PhonePe',
      category: 'UPI / Recharge',
      description: 'Redeem instantly for mobile recharges, bill payments & shopping on PhonePe.',
      logo: '💳',
      minimum_points: 100,
      denominations: [100, 200, 500, 1000, 2500, 5000],
      inventory_count: 150,
      used_count: 42,
      status: 'active'
    },
    {
      id: 'vch_flipkart',
      name: 'Flipkart Voucher',
      provider: 'Flipkart',
      category: 'E-commerce',
      description: 'Shop thousands of items on Flipkart electronics, fashion & home appliances.',
      logo: '🛍️',
      minimum_points: 100,
      denominations: [100, 200, 500, 1000, 2500, 5000],
      inventory_count: 85,
      used_count: 67,
      status: 'active'
    },
    {
      id: 'vch_amazon',
      name: 'Amazon Pay Gift Card',
      provider: 'Amazon',
      category: 'Shopping & Utility',
      description: 'Add money directly to your Amazon Pay wallet balance for all purchases.',
      logo: '📦',
      minimum_points: 100,
      denominations: [100, 200, 500, 1000, 2500, 5000],
      inventory_count: 200,
      used_count: 110,
      status: 'active'
    },
    {
      id: 'vch_gplay',
      name: 'Google Play Gift Voucher',
      provider: 'Google Play',
      category: 'Digital Gaming',
      description: 'Buy apps, games, movies and in-game rewards on Google Play Store.',
      logo: '🎮',
      minimum_points: 100,
      denominations: [100, 200, 500, 1000, 2500, 5000],
      inventory_count: 40,
      used_count: 18,
      status: 'active'
    }
  ],
  withdrawals: [
    {
      id: 'wd_1001',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      voucher_id: 'vch_flipkart',
      voucher_name: 'Flipkart Voucher',
      points: 1000,
      rupee_value: 100,
      reference_id: 'WD-REQ-9011',
      status: 'Pending',
      user_details: { email: 'user@perkfy.com', mobile: '+919876543210' },
      admin_notes: '',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'wd_1002',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      voucher_id: 'vch_phonepe',
      voucher_name: 'PhonePe Gift Voucher',
      points: 2000,
      rupee_value: 200,
      reference_id: 'WD-REQ-8812',
      status: 'Approved',
      user_details: { email: 'admin@cashbackhub.com', mobile: '+919812345678' },
      admin_notes: 'Verified account and approved for payout batch #41',
      created_at: new Date(Date.now() - 259200000).toISOString()
    },
    {
      id: 'wd_1003',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      voucher_id: 'vch_amazon',
      voucher_name: 'Amazon Pay Gift Card',
      points: 1500,
      rupee_value: 150,
      reference_id: 'WD-REQ-7713',
      status: 'Fulfilled',
      user_details: { email: 'admin@cashbackhub.com', mobile: '+919834567890' },
      admin_notes: 'Gift card code AMZ-8829-4410 emailed to user.',
      created_at: new Date(Date.now() - 518400000).toISOString()
    }
  ],
  audit_logs: [
    {
      id: 'audit_001',
      admin_id: 'usr_admin_001',
      admin_email: 'admin@cashbackhub.com',
      action: 'UPDATE_SPIN_CONFIG',
      target: 'Spin Wheel Slices',
      details: 'Updated 1000 points daily limit to 5 and probability weight to 5%',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'audit_002',
      admin_id: 'usr_admin_001',
      admin_email: 'admin@cashbackhub.com',
      action: 'APPROVE_WITHDRAWAL',
      target: 'WD-REQ-8812',
      details: 'Approved PhonePe Gift Voucher (₹200) for Super Admin',
      timestamp: new Date(Date.now() - 14400000).toISOString()
    },
    {
      id: 'audit_003',
      admin_id: 'usr_admin_001',
      admin_email: 'admin@cashbackhub.com',
      action: 'ADD_VOUCHER',
      target: 'Google Play Gift Voucher',
      details: 'Added initial inventory of 40 codes for Google Play',
      timestamp: new Date(Date.now() - 86400000).toISOString()
    }
  ],
  activities: [
    {
      id: 'act_101',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      user_email: 'user@perkfy.com',
      type: 'attendance',
      title: 'Daily Attendance Check-in',
      points: 10,
      status: 'completed',
      details: 'Claimed streak day 7 attendance (+10 pts)',
      created_at: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 'act_102',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      user_email: 'admin@cashbackhub.com',
      type: 'spin',
      title: 'Lucky Spin & Win',
      points: 500,
      status: 'completed',
      details: 'Won 500 points on Spin Wheel (Cost: 10 pts)',
      created_at: new Date(Date.now() - 1800000).toISOString()
    },
    {
      id: 'act_103',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      user_email: 'user@perkfy.com',
      type: 'ad',
      title: 'Video Ad Watched',
      points: 10,
      status: 'completed',
      details: 'Completed Tech Gadgets 2026 Showcase ad',
      created_at: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 'act_104',
      user_id: 'usr_admin_001',
      user_name: 'Rahul Sharma',
      user_email: 'user@perkfy.com',
      type: 'withdrawal',
      title: 'Voucher Withdrawal Request',
      points: -1000,
      status: 'pending',
      details: 'Requested Flipkart ₹100 Gift Voucher (WD-REQ-9011)',
      created_at: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'act_105',
      user_id: 'usr_admin_001',
      user_name: 'Super Admin',
      user_email: 'admin@cashbackhub.com',
      type: 'voucher',
      title: 'Voucher Fulfilled',
      points: -1500,
      status: 'completed',
      details: 'Amazon Pay Gift Card ₹150 delivered (WD-REQ-7713)',
      created_at: new Date(Date.now() - 518400000).toISOString()
    }
  ]
};

function readDb() {
  if (memoryDbCache) {
    return memoryDbCache;
  }
  return initialData;
}

async function getDb() {
  return await syncFromSupabase();
}

async function writeDb(data) {
  memoryDbCache = data;
  await syncToSupabase(data);
  return memoryDbCache;
}

function logAdminAction(adminUser, action, target, details) {
  const db = readDb();
  if (!db.audit_logs) db.audit_logs = [];
  const logEntry = {
    id: `audit_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    admin_id: adminUser?.id || 'admin',
    admin_email: adminUser?.email || 'admin@cashbackhub.com',
    action,
    target,
    details,
    timestamp: getISTTimestamp()
  };
  db.audit_logs.unshift(logEntry);
  writeDb(db).catch(() => {});
  return logEntry;
}

function recordActivity(activity) {
  const db = readDb();
  if (!db.activities) db.activities = [];
  const act = {
    id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: 'completed',
    created_at: getISTTimestamp(),
    ...activity
  };
  db.activities.unshift(act);
  writeDb(db).catch(() => {});
  return act;
}

module.exports = {
  readDb,
  getDb,
  writeDb,
  logAdminAction,
  recordActivity,
  syncFromSupabase,
  syncToSupabase,
  getISTTimestamp,
  getISTDateString
};

