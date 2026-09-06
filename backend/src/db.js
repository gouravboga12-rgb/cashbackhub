const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const os = require('os');
const { supabase } = require('./supabase');


const LOCAL_DB_FILE = path.join(__dirname, 'data.json');
const TMP_DB_FILE = path.join(os.tmpdir(), 'cashbackhub_data.json');

// In-memory cache for fast serverless execution
let memoryDbCache = null;
let lastSupabaseSync = 0;
let lastLocalWriteTime = 0;

// Check if running in serverless / read-only filesystem (like Vercel)
function getDbFilePath() {
  if (process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME) {
    if (!fs.existsSync(TMP_DB_FILE) && fs.existsSync(LOCAL_DB_FILE)) {
      try {
        fs.copyFileSync(LOCAL_DB_FILE, TMP_DB_FILE);
      } catch (e) {
        // Continue
      }
    }
    return TMP_DB_FILE;
  }
  return LOCAL_DB_FILE;
}

let DB_FILE = getDbFilePath();

async function syncFromSupabase() {
  if (!supabase) return memoryDbCache;
  // Guard: If a local write occurred recently (within last 6s), preserve local memory state
  if (Date.now() - lastLocalWriteTime < 6000 && memoryDbCache) {
    return memoryDbCache;
  }
  try {
    const { data, error } = await supabase
      .from('perkfy_app_state')
      .select('data')
      .eq('id', 'main_state')
      .maybeSingle();

    if (data && data.data && !error) {
      if (Date.now() - lastLocalWriteTime < 6000 && memoryDbCache) {
        return memoryDbCache;
      }
      const loaded = data.data;
      if (loaded.vouchers && Array.isArray(loaded.vouchers)) {
        loaded.vouchers.forEach(v => {
          if (!v.minimum_points || v.minimum_points > 100) v.minimum_points = 100;
          if (!v.denominations || !v.denominations.includes(100)) v.denominations = [100, 200, 500, 1000, 2500, 5000];
        });
      }
      if (!loaded.platform_settings) {
        loaded.platform_settings = { min_withdrawal_points: 100, points_to_rupee_ratio: 10 };
      } else if (!loaded.platform_settings.min_withdrawal_points || loaded.platform_settings.min_withdrawal_points > 100) {
        loaded.platform_settings.min_withdrawal_points = 100;
      }
      memoryDbCache = loaded;
      lastSupabaseSync = Date.now();
      try {
        const currentFile = getDbFilePath();
        fs.writeFileSync(currentFile, JSON.stringify(loaded, null, 2));
      } catch (e) {}
      syncToSupabase(loaded).catch(() => {});
      return memoryDbCache;
    } else if (!data && !error) {
      // Table exists but is empty, seed initial state
      const seed = readDb();
      await syncToSupabase(seed);
    }
  } catch (err) {
    // Supabase table not created or network delay, fallback to file
  }
  return memoryDbCache;
}

async function syncToSupabase(data) {
  if (!supabase || !data) return;
  try {
    lastLocalWriteTime = Date.now();
    await supabase
      .from('perkfy_app_state')
      .upsert({ id: 'main_state', data, updated_at: new Date().toISOString() });
  } catch (err) {
    // Ignore error
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
  const currentDbFile = getDbFilePath();
  if (!fs.existsSync(currentDbFile)) {
    try {
      fs.writeFileSync(currentDbFile, JSON.stringify(initialData, null, 2));
    } catch (e) {
      // Ignore if write error
    }
    memoryDbCache = initialData;
    return initialData;
  }
  try {
    const raw = fs.readFileSync(currentDbFile, 'utf8');
    const parsed = JSON.parse(raw);
    
    // Ensure admin user exists in DB
    if (!parsed.users || !parsed.users.some(u => u.role === 'admin' || u.email === 'admin@cashbackhub.com')) {
      parsed.users = parsed.users || [];
      parsed.users.unshift(initialData.users[0]);
      writeDb(parsed);
    }
    
    // Ensure audit_logs and activities arrays exist
    if (!parsed.audit_logs) {
      parsed.audit_logs = initialData.audit_logs;
      writeDb(parsed);
    }
    if (!parsed.activities) {
      parsed.activities = initialData.activities;
      writeDb(parsed);
    }

    // Ensure platform settings exist with daily limits & min_withdrawal_points 100
    if (!parsed.platform_settings) {
      parsed.platform_settings = { ...initialData.platform_settings };
      writeDb(parsed);
    } else {
      let psChanged = false;
      if (parsed.platform_settings.daily_spin_limit === undefined) {
        parsed.platform_settings.daily_spin_limit = 10;
        psChanged = true;
      }
      if (parsed.platform_settings.daily_ad_limit === undefined) {
        parsed.platform_settings.daily_ad_limit = 10;
        psChanged = true;
      }
      if (parsed.platform_settings.cost_per_spin === undefined) {
        parsed.platform_settings.cost_per_spin = 10;
        psChanged = true;
      }
      if (!parsed.platform_settings.min_withdrawal_points || parsed.platform_settings.min_withdrawal_points > 100) {
        parsed.platform_settings.min_withdrawal_points = 100;
        psChanged = true;
      }
      if (psChanged) writeDb(parsed);
    }

    // Ensure all vouchers have minimum_points 100 (₹10)
    if (parsed.vouchers && Array.isArray(parsed.vouchers)) {
      let vChanged = false;
      parsed.vouchers.forEach(v => {
        if (!v.minimum_points || v.minimum_points > 100) {
          v.minimum_points = 100;
          vChanged = true;
        }
        if (!v.denominations || v.denominations.length === 0 || !v.denominations.includes(100)) {
          v.denominations = [100, 200, 500, 1000, 2500, 5000];
          vChanged = true;
        }
      });
      if (vChanged) writeDb(parsed);
    }
    
    // Ensure spin configurations have daily_limit & counts
    if (parsed.spin_configurations) {
      let changed = false;
      const todayStr = new Date().toISOString().split('T')[0];
      parsed.spin_configurations.forEach(slice => {
        if (slice.daily_limit === undefined) {
          slice.daily_limit = slice.reward_points >= 1000 ? 5 : (slice.reward_points >= 500 ? 15 : 0);
          changed = true;
        }
        if (slice.today_awarded_count === undefined || slice.last_reset_date !== todayStr) {
          slice.today_awarded_count = slice.last_reset_date !== todayStr ? 0 : (slice.today_awarded_count || 0);
          slice.last_reset_date = todayStr;
          changed = true;
        }
        if (slice.is_active === undefined) {
          slice.is_active = true;
          changed = true;
        }
      });
      if (changed) {
        writeDb(parsed);
      }
    }

    memoryDbCache = parsed;
    return parsed;
  } catch (err) {
    memoryDbCache = initialData;
    return initialData;
  }
}

function writeDb(data) {
  lastLocalWriteTime = Date.now();
  memoryDbCache = data;
  const currentDbFile = getDbFilePath();
  try {
    fs.writeFileSync(currentDbFile, JSON.stringify(data, null, 2));
  } catch (err) {
    try {
      fs.writeFileSync(TMP_DB_FILE, JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn('DB File write note (serverless mode):', e.message);
    }
  }
  // Asynchronously synchronize to Supabase Cloud Database
  syncToSupabase(data).catch(() => {});
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
    timestamp: new Date().toISOString()
  };
  db.audit_logs.unshift(logEntry);
  writeDb(db);
  return logEntry;
}

function recordActivity(activity) {
  const db = readDb();
  if (!db.activities) db.activities = [];
  const act = {
    id: `act_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    status: 'completed',
    created_at: new Date().toISOString(),
    ...activity
  };
  db.activities.unshift(act);
  writeDb(db);
  return act;
}

module.exports = {
  readDb,
  writeDb,
  logAdminAction,
  recordActivity,
  syncFromSupabase,
  syncToSupabase
};

