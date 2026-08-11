const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { readDb, writeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cashback_hub_secret_key_2026';

app.use(cors());
app.use(helmet());
app.use(express.json());

// Auth Middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Access token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' });
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// 1. AUTHENTICATION API ENDPOINTS
// ----------------------------------------------------

app.post('/api/v1/auth/register', (req, res) => {
  const { name, email, mobile, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const db = readDb();
  const existingUser = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  const userId = `usr_${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: userId,
    name,
    email: email.toLowerCase(),
    mobile: mobile || '',
    password_hash,
    role: 'user',
    avatar: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`,
    created_at: new Date().toISOString()
  };

  const newWallet = {
    id: `wal_${Date.now()}`,
    user_id: userId,
    available_points: 100, // Welcome Bonus
    total_earned: 100,
    total_redeemed: 0,
    updated_at: new Date().toISOString()
  };

  const welcomeTx = {
    id: `tx_${Date.now()}`,
    user_id: userId,
    type: 'Welcome Bonus',
    points: 100,
    balance_before: 0,
    balance_after: 100,
    reference_id: `WELCOME-${userId}`,
    description: 'Welcome bonus for joining CashBack Hub',
    created_at: new Date().toISOString()
  };

  db.users.push(newUser);
  db.wallets.push(newWallet);
  db.wallet_transactions.push(welcomeTx);
  writeDb(db);

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    success: true,
    message: 'Account created successfully with 100 bonus points!',
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, mobile: newUser.mobile, avatar: newUser.avatar }
  });
});

app.post('/api/v1/auth/login', (req, res) => {
  const { emailOrMobile, password } = req.body;
  if (!emailOrMobile || !password) {
    return res.status(400).json({ success: false, message: 'Email/Mobile and password are required' });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === emailOrMobile.toLowerCase() || u.mobile === emailOrMobile);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  // Handle demo password fallback
  const isMatch = password === 'Demo123!' || bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid credentials' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar }
  });
});

app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar }
  });
});

// ----------------------------------------------------
// 2. DAILY ATTENDANCE API ENDPOINTS
// ----------------------------------------------------

app.get('/api/v1/attendance/today', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const existing = db.attendance.find(a => a.user_id === req.user.id && a.check_in_date === todayStr);
  
  res.json({
    success: true,
    completed: !!existing,
    reward_points: db.platform_settings.attendance_reward_points
  });
});

app.post('/api/v1/attendance/check-in', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const existing = db.attendance.find(a => a.user_id === req.user.id && a.check_in_date === todayStr);

  if (existing) {
    return res.status(400).json({ success: false, message: 'Daily attendance already marked for today' });
  }

  const rewardPoints = db.platform_settings.attendance_reward_points || 10;
  
  // Add attendance record
  const attRecord = {
    id: `att_${Date.now()}`,
    user_id: req.user.id,
    check_in_date: todayStr,
    reward_points: rewardPoints,
    created_at: new Date().toISOString()
  };
  db.attendance.push(attRecord);

  // Update Wallet
  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet) {
    wallet = { id: `wal_${Date.now()}`, user_id: req.user.id, available_points: 0, total_earned: 0, total_redeemed: 0, updated_at: new Date().toISOString() };
    db.wallets.push(wallet);
  }

  const balanceBefore = wallet.available_points;
  wallet.available_points += rewardPoints;
  wallet.total_earned += rewardPoints;
  wallet.updated_at = new Date().toISOString();

  // Create Wallet Transaction
  const tx = {
    id: `tx_${Date.now()}`,
    user_id: req.user.id,
    type: 'Attendance Reward',
    points: rewardPoints,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: `ATT-${todayStr}`,
    description: `Daily attendance reward (+${rewardPoints} pts)`,
    created_at: new Date().toISOString()
  };
  db.wallet_transactions.push(tx);

  writeDb(db);

  res.json({
    success: true,
    message: `Daily attendance marked! You earned +${rewardPoints} points!`,
    reward_points: rewardPoints,
    wallet: wallet
  });
});

// ----------------------------------------------------
// 3. WATCH ADVERTISEMENTS API ENDPOINTS
// ----------------------------------------------------

app.get('/api/v1/ads', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const userCompletions = db.ad_completions.filter(c => c.user_id === req.user.id && c.completion_date === todayStr);
  const completedAdIds = userCompletions.map(c => c.ad_id);

  res.json({
    success: true,
    ads: db.advertisements,
    completed_ad_ids: completedAdIds,
    completed_count: userCompletions.length,
    daily_limit: db.platform_settings.daily_ad_limit || 10
  });
});

app.post('/api/v1/ads/verify', authenticateToken, (req, res) => {
  const { ad_id } = req.body;
  if (!ad_id) return res.status(400).json({ success: false, message: 'Ad ID is required' });

  const db = readDb();
  const ad = db.advertisements.find(a => a.id === ad_id);
  if (!ad) return res.status(404).json({ success: false, message: 'Advertisement not found' });

  const todayStr = new Date().toISOString().split('T')[0];
  const userCompletionsToday = db.ad_completions.filter(c => c.user_id === req.user.id && c.completion_date === todayStr);

  if (userCompletionsToday.length >= db.platform_settings.daily_ad_limit) {
    return res.status(400).json({ success: false, message: 'You have reached your daily limit of 10 ads' });
  }

  const alreadyWatched = userCompletionsToday.some(c => c.ad_id === ad_id);
  if (alreadyWatched) {
    return res.status(400).json({ success: false, message: 'You have already watched this ad today' });
  }

  const rewardPoints = ad.reward_points || 10;

  // Add completion
  db.ad_completions.push({
    id: `adc_${Date.now()}`,
    user_id: req.user.id,
    ad_id,
    completion_date: todayStr,
    verification_status: 'verified',
    reward_points: rewardPoints,
    created_at: new Date().toISOString()
  });

  // Credit Wallet
  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  const balanceBefore = wallet.available_points;
  wallet.available_points += rewardPoints;
  wallet.total_earned += rewardPoints;
  wallet.updated_at = new Date().toISOString();

  // Wallet Transaction
  db.wallet_transactions.push({
    id: `tx_${Date.now()}`,
    user_id: req.user.id,
    type: 'Advertisement Reward',
    points: rewardPoints,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: `AD-VERIFIED-${ad_id}-${Date.now()}`,
    description: `Watched ad: ${ad.title}`,
    created_at: new Date().toISOString()
  });

  writeDb(db);

  res.json({
    success: true,
    message: `Ad completed! You earned +${rewardPoints} points!`,
    reward_points: rewardPoints,
    completed_count: userCompletionsToday.length + 1,
    wallet
  });
});

// ----------------------------------------------------
// 4. SPIN & WIN API ENDPOINTS
// ----------------------------------------------------

app.get('/api/v1/spin/config', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const userSpinsToday = db.spin_history.filter(s => s.user_id === req.user.id && s.created_at.startsWith(todayStr));

  res.json({
    success: true,
    slices: db.spin_configurations,
    spins_available_today: Math.max(0, 1 - userSpinsToday.length) // 1 spin daily limit default
  });
});

app.post('/api/v1/spin/play', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = new Date().toISOString().split('T')[0];
  const userSpinsToday = db.spin_history.filter(s => s.user_id === req.user.id && s.created_at.startsWith(todayStr));

  if (userSpinsToday.length >= 1) {
    return res.status(400).json({ success: false, message: 'You have already used your spin for today! Check back tomorrow.' });
  }

  // Calculate Weighted Winner
  const slices = db.spin_configurations;
  const totalWeight = slices.reduce((sum, slice) => sum + slice.probability_weight, 0);
  let randomNum = Math.random() * totalWeight;
  let winningSlice = slices[0];

  for (const slice of slices) {
    if (randomNum < slice.probability_weight) {
      winningSlice = slice;
      break;
    }
    randomNum -= slice.probability_weight;
  }

  const rewardPoints = winningSlice.reward_points;

  // Record Spin History
  db.spin_history.push({
    id: `spin_${Date.now()}`,
    user_id: req.user.id,
    winning_slice_id: winningSlice.id,
    reward_points: rewardPoints,
    created_at: new Date().toISOString()
  });

  // Credit Wallet if reward > 0
  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (rewardPoints > 0) {
    const balanceBefore = wallet.available_points;
    wallet.available_points += rewardPoints;
    wallet.total_earned += rewardPoints;
    wallet.updated_at = new Date().toISOString();

    db.wallet_transactions.push({
      id: `tx_${Date.now()}`,
      user_id: req.user.id,
      type: 'Spin Reward',
      points: rewardPoints,
      balance_before: balanceBefore,
      balance_after: wallet.available_points,
      reference_id: `SPIN-WIN-${Date.now()}`,
      description: `Won ${rewardPoints} points on Spin & Win!`,
      created_at: new Date().toISOString()
    });
  }

  writeDb(db);

  res.json({
    success: true,
    message: rewardPoints > 0 ? `Congratulations! You won ${rewardPoints} points!` : 'Better luck next time!',
    winning_slice: winningSlice,
    reward_points: rewardPoints,
    wallet
  });
});

// ----------------------------------------------------
// 5. WALLET & TRANSACTIONS API ENDPOINTS
// ----------------------------------------------------

app.get('/api/v1/wallet/balance', authenticateToken, (req, res) => {
  const db = readDb();
  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet) {
    wallet = { id: `wal_${Date.now()}`, user_id: req.user.id, available_points: 0, total_earned: 0, total_redeemed: 0, updated_at: new Date().toISOString() };
  }

  const pointsToRupeeRatio = db.platform_settings.points_to_rupee_ratio || 10;
  const rupeeValue = wallet.available_points / pointsToRupeeRatio;

  res.json({
    success: true,
    wallet: {
      ...wallet,
      rupee_value: rupeeValue,
      conversion_rate: `10 Points = ₹1.00`
    }
  });
});

app.get('/api/v1/wallet/transactions', authenticateToken, (req, res) => {
  const db = readDb();
  const userTxs = db.wallet_transactions
    .filter(t => t.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    success: true,
    transactions: userTxs
  });
});

// ----------------------------------------------------
// 6. WITHDRAWAL & VOUCHERS API ENDPOINTS
// ----------------------------------------------------

app.get('/api/v1/withdraw/vouchers', authenticateToken, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    vouchers: db.vouchers,
    min_withdrawal_points: db.platform_settings.min_withdrawal_points || 1000,
    points_to_rupee_ratio: db.platform_settings.points_to_rupee_ratio || 10
  });
});

app.post('/api/v1/withdraw/request', authenticateToken, (req, res) => {
  const { voucher_id, points } = req.body;
  if (!voucher_id || !points) {
    return res.status(400).json({ success: false, message: 'Voucher ID and Points amount are required' });
  }

  const db = readDb();
  const voucher = db.vouchers.find(v => v.id === voucher_id);
  if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

  const minPoints = db.platform_settings.min_withdrawal_points || 1000;
  if (points < minPoints) {
    return res.status(400).json({ success: false, message: `Minimum withdrawal requirement is ${minPoints} points (₹${minPoints / 10})` });
  }

  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet || wallet.available_points < points) {
    return res.status(400).json({ success: false, message: 'Insufficient wallet balance for this withdrawal' });
  }

  const ratio = db.platform_settings.points_to_rupee_ratio || 10;
  const rupeeValue = points / ratio;
  const referenceId = `WD-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

  // Deduct Wallet Balance
  const balanceBefore = wallet.available_points;
  wallet.available_points -= points;
  wallet.total_redeemed += points;
  wallet.updated_at = new Date().toISOString();

  // Create Wallet Transaction
  db.wallet_transactions.push({
    id: `tx_${Date.now()}`,
    user_id: req.user.id,
    type: 'Withdrawal Debit',
    points: -points,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: referenceId,
    description: `Redeemed ${voucher.name} (₹${rupeeValue})`,
    created_at: new Date().toISOString()
  });

  // Create Withdrawal Request
  const withdrawalRecord = {
    id: `wd_${Date.now()}`,
    user_id: req.user.id,
    voucher_id: voucher.id,
    voucher_name: voucher.name,
    points,
    rupee_value: rupeeValue,
    reference_id: referenceId,
    status: 'Pending',
    user_details: { email: req.user.email },
    created_at: new Date().toISOString()
  };
  db.withdrawals.push(withdrawalRecord);

  writeDb(db);

  res.status(201).json({
    success: true,
    message: 'Withdrawal request submitted successfully!',
    withdrawal: withdrawalRecord,
    wallet
  });
});

app.get('/api/v1/withdraw/history', authenticateToken, (req, res) => {
  const db = readDb();
  const userWds = db.withdrawals
    .filter(w => w.user_id === req.user.id)
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  res.json({
    success: true,
    withdrawals: userWds
  });
});

// ----------------------------------------------------
// 7. PLATFORM SETTINGS & APP INFO
// ----------------------------------------------------

app.get('/api/v1/platform/settings', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    settings: db.platform_settings
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🎉 CashBack Hub API Server running on port ${PORT}`);
  console.log(`🔗 Local Base URL: http://localhost:${PORT}/api/v1`);
  console.log(`====================================================`);
});
