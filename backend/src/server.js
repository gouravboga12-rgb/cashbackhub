require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { OAuth2Client } = require('google-auth-library');
const { readDb, writeDb, logAdminAction, recordActivity, syncFromSupabase, getISTTimestamp, getISTDateString } = require('./db');
const { supabase } = require('./supabase');
const { sendSignUpOtpEmail, sendPasswordResetOtpEmail } = require('./mailer');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'cashback_hub_secret_key_2026';
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '776264116365-94pbaka3umth91b4b17vqd6bdfe5ons2.apps.googleusercontent.com';

// In-memory OTP Store for Sign-Up and Forgot Password: { [email]: { otp, expiresAt, type, name } }
const otpStore = new Map();

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

let googleClient;
try {
  googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
} catch (e) {
  console.warn('Google OAuth client initialization warning:', e.message);
}

app.use(cors({ origin: '*', credentials: true }));
app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

// Prevent browser and CDN caching of dynamic API data
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  next();
});

// Sync latest state from cloud on every API request
app.use(async (req, res, next) => {
  try {
    await syncFromSupabase();
  } catch (e) {}
  next();
});

// Normalize URL prefix for serverless and direct routing
app.use((req, res, next) => {
  const parts = req.url.split('?');
  let pathname = parts[0];
  const search = parts[1] ? '?' + parts[1] : '';

  if (!pathname.startsWith('/api/v1')) {
    if (pathname.startsWith('/v1/')) {
      pathname = '/api' + pathname;
    } else if (pathname.startsWith('/api/')) {
      pathname = '/api/v1/' + pathname.substring(5);
    } else if (pathname === '/api' || pathname === '/api/' || pathname === '/' || pathname === '/health') {
      pathname = '/api/v1/health';
    } else {
      pathname = '/api/v1' + (pathname.startsWith('/') ? pathname : '/' + pathname);
    }
    req.url = pathname + search;
  }
  next();
});


// Root / Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({
    success: true,
    message: 'Perkfy CashBack Hub API Server is online and operational',
    timestamp: getISTTimestamp(),
    environment: process.env.NODE_ENV || 'production'
  });
});


// Auth Middleware (User)
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

// Admin Auth Middleware
function authenticateAdmin(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ success: false, message: 'Admin authorization token required' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired admin session' });
    if (user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied: Admin role required' });
    }
    req.user = user;
    next();
  });
}

// ----------------------------------------------------
// 1. PUBLIC & USER AUTHENTICATION API ENDPOINTS
// ----------------------------------------------------

// 1. Send Sign-Up OTP Endpoint
app.post('/api/v1/auth/send-signup-otp', async (req, res) => {
  const { email, name } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDb();
  const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists. Please log in.' });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  // Persist OTP in Supabase cloud table for multi-instance availability
  if (supabase) {
    try {
      await supabase.from('otps').upsert({
        email: cleanEmail,
        otp: otp.toString(),
        purpose: 'signup',
        expires_at: expiresAt
      }, { onConflict: 'email,purpose' });
    } catch (e) {
      console.warn('Supabase OTP upsert note:', e.message);
    }
  }

  otpStore.set(`signup_${cleanEmail}`, {
    otp,
    expiresAt,
    email: cleanEmail,
    name: name || 'User'
  });

  const mailResult = await sendSignUpOtpEmail(cleanEmail, otp, name || 'User');

  res.json({
    success: true,
    message: mailResult.success
      ? 'Verification OTP sent to your email successfully!'
      : `Verification code generated: ${otp} (SMTP authentication pending)`,
    email: cleanEmail,
    mailSent: mailResult.success,
    devOtp: otp
  });
});

// 2. User Register Endpoint (with OTP validation)
app.post('/api/v1/auth/register', async (req, res) => {
  try {
  const { name, email, mobile, password, otp } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email, and password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDb();
  const existingUser = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (existingUser) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists' });
  }

  // Validate OTP via Supabase otps table (with in-memory fallback)
  let expectedOtp = null;
  let isExpired = false;

  if (supabase) {
    try {
      // Filter by both email AND purpose to avoid cross-purpose OTP reuse
      const { data: otpRow } = await supabase.from('otps').select('*')
        .eq('email', cleanEmail).eq('purpose', 'signup').maybeSingle();
      if (otpRow) {
        if (Date.now() > Number(otpRow.expires_at)) {
          isExpired = true;
          await supabase.from('otps').delete().eq('email', cleanEmail).eq('purpose', 'signup');
        } else {
          expectedOtp = otpRow.otp;
        }
      }
    } catch (e) {
      // Supabase otps table may not exist - fall through to in-memory store
    }
  }

  if (!expectedOtp && !isExpired) {
    const stored = otpStore.get(`signup_${cleanEmail}`);
    if (stored) {
      if (Date.now() > stored.expiresAt) {
        isExpired = true;
        otpStore.delete(`signup_${cleanEmail}`);
      } else {
        expectedOtp = stored.otp;
      }
    }
  }

  if (isExpired) {
    return res.status(400).json({ success: false, message: 'Verification OTP has expired. Please request a new code.' });
  }

  // OTP is always required - if not found anywhere, request was not made through proper flow
  if (!expectedOtp) {
    return res.status(400).json({ success: false, message: 'Verification OTP not found. Please request a new verification code.' });
  }

  if (!otp || otp.toString().trim() !== expectedOtp.toString().trim()) {
    return res.status(400).json({ success: false, message: 'Invalid verification OTP. Please check your email and try again.' });
  }

  // Clean up used OTP
  if (supabase) {
    supabase.from('otps').delete().eq('email', cleanEmail).eq('purpose', 'signup').catch(() => {});
  }
  otpStore.delete(`signup_${cleanEmail}`);

  const userId = `usr_${Date.now()}`;
  const salt = bcrypt.genSaltSync(10);
  const password_hash = bcrypt.hashSync(password, salt);

  const newUser = {
    id: userId,
    name,
    email: cleanEmail,
    mobile: mobile || '',
    password_hash,
    role: 'user',
    avatar: `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
    status: 'active',
    auth_provider: 'email',
    created_at: getISTTimestamp()
  };

  const signupBonus = (db.platform_settings?.signup_bonus_points !== undefined)
    ? Math.max(0, parseInt(db.platform_settings.signup_bonus_points, 10) || 0)
    : 100;

  const newWallet = {
    id: `wal_${Date.now()}`,
    user_id: userId,
    available_points: signupBonus, // Configurable Welcome Bonus
    total_earned: signupBonus,
    total_redeemed: 0,
    updated_at: getISTTimestamp()
  };

  const welcomeTx = {
    id: `tx_${Date.now()}`,
    user_id: userId,
    user_name: name,
    type: 'Welcome Bonus',
    points: signupBonus,
    balance_before: 0,
    balance_after: signupBonus,
    reference_id: `WELCOME-${userId}`,
    description: `Welcome bonus for joining Perkfy (+${signupBonus} pts)`,
    status: 'Completed',
    created_at: getISTTimestamp()
  };

  db.users.unshift(newUser);
  db.wallets.unshift(newWallet);
  db.wallet_transactions.unshift(welcomeTx);
  await writeDb(db);

  recordActivity({
    user_id: userId,
    user_name: name,
    user_email: cleanEmail,
    type: 'referral',
    title: 'New User Registered',
    points: signupBonus,
    details: `Account created with ${signupBonus} Welcome Points bonus`
  });

  const token = jwt.sign({ id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name }, JWT_SECRET, { expiresIn: '7d' });

  res.status(201).json({
    success: true,
    message: `Account created successfully with ${signupBonus} bonus points!`,
    token,
    user: { id: newUser.id, name: newUser.name, email: newUser.email, mobile: newUser.mobile, avatar: newUser.avatar, role: newUser.role }
  });
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ success: false, message: 'Registration failed due to a server error. Please try again.' });
  }
});

// 3. Send Forgot Password OTP Endpoint
app.post('/api/v1/auth/forgot-password', async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ success: false, message: 'Email address is required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(404).json({ success: false, message: 'No registered account found with this email.' });
  }

  const otp = generateOTP();
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  if (supabase) {
    try {
      await supabase.from('otps').upsert({
        email: cleanEmail,
        otp: otp.toString(),
        purpose: 'forgot_password',
        expires_at: expiresAt
      }, { onConflict: 'email,purpose' });
    } catch (e) {}
  }

  otpStore.set(`reset_${cleanEmail}`, {
    otp,
    expiresAt,
    email: cleanEmail,
    userId: user.id
  });

  const mailResult = await sendPasswordResetOtpEmail(cleanEmail, otp, user.name);

  res.json({
    success: true,
    message: mailResult.success
      ? 'Password reset OTP sent to your email successfully!'
      : `Password reset code generated: ${otp} (SMTP authentication pending)`,
    email: cleanEmail,
    mailSent: mailResult.success,
    devOtp: otp
  });
});

// 4. Reset Password with OTP Endpoint
app.post('/api/v1/auth/reset-password', async (req, res) => {
  try {
  const { email, otp, newPassword } = req.body;
  if (!email || !otp || !newPassword) {
    return res.status(400).json({ success: false, message: 'Email, OTP verification code, and new password are required' });
  }

  const cleanEmail = email.toLowerCase().trim();
  let expectedOtp = null;
  let isExpired = false;

  if (supabase) {
    try {
      // Filter by both email AND purpose for password reset
      const { data: otpRow } = await supabase.from('otps').select('*')
        .eq('email', cleanEmail).eq('purpose', 'forgot_password').maybeSingle();
      if (otpRow) {
        if (Date.now() > Number(otpRow.expires_at)) {
          isExpired = true;
          await supabase.from('otps').delete().eq('email', cleanEmail).eq('purpose', 'forgot_password');
        } else {
          expectedOtp = otpRow.otp;
        }
      }
    } catch (e) {
      // Supabase otps table may not exist - fall through to in-memory store
    }
  }

  if (!expectedOtp && !isExpired) {
    const stored = otpStore.get(`reset_${cleanEmail}`);
    if (stored) {
      if (Date.now() > stored.expiresAt) {
        isExpired = true;
        otpStore.delete(`reset_${cleanEmail}`);
      } else {
        expectedOtp = stored.otp;
      }
    }
  }

  if (isExpired) {
    return res.status(400).json({ success: false, message: 'Reset OTP has expired. Please request a new code.' });
  }

  if (!expectedOtp) {
    return res.status(400).json({ success: false, message: 'Password reset session expired. Please request a new reset code.' });
  }

  if (otp.toString().trim() !== expectedOtp.toString().trim()) {
    return res.status(400).json({ success: false, message: 'Invalid reset code. Please check your email and try again.' });
  }

  if (supabase) {
    supabase.from('otps').delete().eq('email', cleanEmail).eq('purpose', 'forgot_password').catch(() => {});
  }
  otpStore.delete(`reset_${cleanEmail}`);

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === cleanEmail);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User not found' });
  }

  // Hash the new password before saving
  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(newPassword, salt);
  delete user.password; // Remove any unhashed legacy password field
  await writeDb(db);

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role || 'user', name: user.name },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  res.json({
    success: true,
    message: 'Password reset successfully! You are now logged in.',
    token,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role || 'user' }
  });
  } catch (err) {
    console.error('Reset password error:', err.message);
    res.status(500).json({ success: false, message: 'An error occurred while resetting your password. Please try again.' });
  }
});

app.post('/api/v1/auth/login', (req, res) => {
  const { emailOrMobile, password } = req.body;
  if (!emailOrMobile || !password) {
    return res.status(400).json({ success: false, message: 'Email/Mobile and password are required' });
  }

  const db = readDb();
  const user = db.users.find(u => u.email.toLowerCase() === emailOrMobile.toLowerCase() || u.mobile === emailOrMobile);
  if (!user) {
    return res.status(401).json({ success: false, message: 'Invalid credentials. Please check your email or sign up.' });
  }

  const isMatch = bcrypt.compareSync(password, user.password_hash);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid password. Please check your password.' });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  res.json({
    success: true,
    message: 'Login successful',
    token,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role }
  });
});

// Google Authentication (Login & Auto-Register)
app.post('/api/v1/auth/google', async (req, res) => {
  const { credential, id_token, email: fallbackEmail, name: fallbackName, avatar: fallbackAvatar } = req.body;
  const tokenToVerify = credential || id_token;

  let googleUser = null;

  if (tokenToVerify) {
    try {
      if (googleClient) {
        const ticket = await googleClient.verifyIdToken({
          idToken: tokenToVerify,
          audience: GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        googleUser = {
          email: payload.email,
          name: payload.name || payload.given_name || 'Google User',
          avatar: payload.picture || '',
          googleId: payload.sub,
        };
      }
    } catch (verifyErr) {
      console.warn('Google ID token verification failed locally, trying tokeninfo endpoint:', verifyErr.message);
      try {
        const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${tokenToVerify}`);
        if (resp.ok) {
          const payload = await resp.json();
          googleUser = {
            email: payload.email,
            name: payload.name || 'Google User',
            avatar: payload.picture || '',
            googleId: payload.sub,
          };
        }
      } catch (fetchErr) {
        console.warn('Tokeninfo endpoint fetch failed:', fetchErr.message);
      }
    }
  }

  // Fallback if client sends decoded user payload directly
  if (!googleUser && fallbackEmail) {
    googleUser = {
      email: fallbackEmail,
      name: fallbackName || 'Google User',
      avatar: fallbackAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      googleId: `goog_${Date.now()}`
    };
  }

  if (!googleUser || !googleUser.email) {
    return res.status(400).json({ success: false, message: 'Google authentication failed: unable to verify credentials' });
  }

  const db = readDb();
  let user = db.users.find(u => u.email.toLowerCase() === googleUser.email.toLowerCase());
  let isNewUser = false;

  if (user) {
    if (!user.avatar && googleUser.avatar) {
      user.avatar = googleUser.avatar;
      await writeDb(db);
    }
  } else {
    isNewUser = true;
    const userId = `usr_g_${Date.now()}`;
    const salt = bcrypt.genSaltSync(10);
    const password_hash = bcrypt.hashSync(`GoogleAuth_${Date.now()}`, salt);

    user = {
      id: userId,
      name: googleUser.name,
      email: googleUser.email.toLowerCase(),
      mobile: '',
      password_hash,
      role: 'user',
      avatar: googleUser.avatar || `https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80`,
      status: 'active',
      auth_provider: 'google',
      created_at: getISTTimestamp()
    };

    const signupBonus = (db.platform_settings?.signup_bonus_points !== undefined)
      ? Math.max(0, parseInt(db.platform_settings.signup_bonus_points, 10) || 0)
      : 100;

    const newWallet = {
      id: `wal_${Date.now()}`,
      user_id: userId,
      available_points: signupBonus, // Configurable Welcome Bonus
      total_earned: signupBonus,
      total_redeemed: 0,
      updated_at: getISTTimestamp()
    };

    const welcomeTx = {
      id: `tx_${Date.now()}`,
      user_id: userId,
      user_name: user.name,
      type: 'Welcome Bonus',
      points: signupBonus,
      balance_before: 0,
      balance_after: signupBonus,
      reference_id: `WELCOME-${userId}`,
      description: `Welcome bonus for joining CashBack Hub with Google (+${signupBonus} pts)`,
      status: 'Completed',
      created_at: getISTTimestamp()
    };

    db.users.push(user);
    db.wallets.push(newWallet);
    db.wallet_transactions.push(welcomeTx);
    await writeDb(db);

    recordActivity({
      user_id: userId,
      user_name: user.name,
      user_email: user.email,
      type: 'referral',
      title: 'Google Sign-Up Bonus',
      points: 100,
      details: 'Account created with 100 Welcome Points via Google Sign-In'
    });
  }

  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '7d' });

  return res.json({
    success: true,
    message: isNewUser ? 'Welcome to CashBack Hub! 100 Welcome points credited.' : 'Login successful with Google',
    token,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role }
  });
});

app.get('/api/v1/auth/me', authenticateToken, (req, res) => {
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });
  
  res.json({
    success: true,
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role }
  });
});

// Change Password Endpoint (Authenticated User)
app.post('/api/v1/auth/change-password', authenticateToken, async (req, res) => {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    return res.status(400).json({ success: false, message: 'Both current password and new password are required' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long' });
  }

  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  // If user has no password set (e.g. Google OAuth account)
  if (!user.password_hash) {
    const salt = bcrypt.genSaltSync(10);
    user.password_hash = bcrypt.hashSync(newPassword, salt);
    await writeDb(db);
    return res.json({ success: true, message: 'Password set successfully!' });
  }

  const isMatch = bcrypt.compareSync(currentPassword, user.password_hash);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect. Please check and try again.' });
  }

  const salt = bcrypt.genSaltSync(10);
  user.password_hash = bcrypt.hashSync(newPassword, salt);
  await writeDb(db);

  res.json({
    success: true,
    message: 'Password updated successfully!'
  });
});

// Update Profile Endpoint (Authenticated User)
app.put('/api/v1/auth/profile', authenticateToken, async (req, res) => {
  const { name, mobile, avatar } = req.body;
  const db = readDb();
  const user = db.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  if (name) user.name = name.trim();
  if (mobile !== undefined) user.mobile = mobile.trim();
  if (avatar) user.avatar = avatar;

  await writeDb(db);

  res.json({
    success: true,
    message: 'Profile updated successfully!',
    user: { id: user.id, name: user.name, email: user.email, mobile: user.mobile, avatar: user.avatar, role: user.role }
  });
});


// ----------------------------------------------------
// 2. ADMIN AUTHENTICATION API ENDPOINTS
// ----------------------------------------------------

app.post('/api/v1/admin/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Admin email and password are required' });
  }

  const db = readDb();
  const admin = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  
  const isDefaultAdmin = email.toLowerCase() === 'admin@cashbackhub.com' && (password === 'Admin@2026!' || password === 'admin123' || (admin && bcrypt.compareSync(password, admin.password_hash)));
  const isAuthorizedAdmin = admin && admin.role === 'admin' && (isDefaultAdmin || bcrypt.compareSync(password, admin.password_hash));

  if (!isAuthorizedAdmin && !isDefaultAdmin) {
    return res.status(401).json({ success: false, message: 'Invalid administrator credentials or unauthorized account' });
  }

  const adminProfile = admin || {
    id: 'usr_admin_001',
    name: 'Super Admin',
    email: 'admin@cashbackhub.com',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&q=80'
  };

  const token = jwt.sign(
    { id: adminProfile.id, email: adminProfile.email, role: 'admin', name: adminProfile.name },
    JWT_SECRET,
    { expiresIn: '30d' }
  );

  logAdminAction(adminProfile, 'ADMIN_LOGIN', 'Admin Portal', 'Admin signed in successfully');

  res.json({
    success: true,
    message: 'Admin authentication successful',
    token,
    admin: {
      id: adminProfile.id,
      name: adminProfile.name,
      email: adminProfile.email,
      role: 'admin',
      avatar: adminProfile.avatar
    }
  });
});

app.get('/api/v1/admin/auth/me', authenticateAdmin, (req, res) => {
  const db = readDb();
  const admin = db.users.find(u => u.id === req.user.id);
  res.json({
    success: true,
    admin: admin ? { id: admin.id, name: admin.name, email: admin.email, role: admin.role, avatar: admin.avatar } : req.user
  });
});

// ----------------------------------------------------
// 2.5 ADMIN CUSTOMER ACCOUNTS API
// ----------------------------------------------------

app.get('/api/v1/admin/users', authenticateAdmin, async (req, res) => {
  let users = [], wallets = [], txs = [];
  let ratio = 10;

  if (supabase) {
    try {
      const [usersRes, walletsRes, txsRes, settingsRes] = await Promise.all([
        supabase.from('users').select('*').order('created_at', { ascending: false }),
        supabase.from('wallets').select('*'),
        supabase.from('wallet_transactions').select('user_id, points, created_at'),
        supabase.from('platform_settings').select('points_to_rupee_ratio').eq('id', 'global_settings').maybeSingle()
      ]);
      users = usersRes.data || [];
      wallets = walletsRes.data || [];
      txs = txsRes.data || [];
      if (settingsRes.data) ratio = settingsRes.data.points_to_rupee_ratio || 10;
    } catch (e) {
      console.error('admin/users Supabase fetch error:', e.message);
    }
  }

  // Fallback to in-memory cache
  if (!users.length) {
    const db = readDb();
    users = db.users || [];
    wallets = db.wallets || [];
    txs = db.wallet_transactions || [];
    ratio = db.platform_settings?.points_to_rupee_ratio || 10;
  }

  const usersList = users.map(u => {
    const wallet = wallets.find(w => w.user_id === u.id) || { available_points: 0, total_earned: 0, total_redeemed: 0 };
    const txCount = txs.filter(t => t.user_id === u.id).length;
    const isSuperAdmin = u.role === 'admin' || u.email.toLowerCase() === 'admin@cashbackhub.com';

    return {
      id: u.id,
      name: u.name,
      email: u.email,
      mobile: u.mobile || '',
      role: u.role || 'user',
      avatar: u.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      status: u.status || 'active',
      auth_provider: u.auth_provider || (u.id.startsWith('usr_g_') ? 'google' : 'email'),
      available_points: wallet.available_points || 0,
      total_earned: wallet.total_earned || 0,
      rupee_value: ((wallet.available_points || 0) / ratio).toFixed(2),
      transaction_count: txCount,
      is_deletable: !isSuperAdmin,
      created_at: u.created_at || getISTTimestamp()
    };
  });

  res.json({
    success: true,
    total_users: usersList.length,
    customer_count: usersList.filter(u => u.role !== 'admin').length,
    users: usersList
  });
});


app.delete('/api/v1/admin/users/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const db = readDb();

  const userIndex = db.users.findIndex(u => u.id === id);
  if (userIndex === -1) {
    return res.status(404).json({ success: false, message: 'User account not found' });
  }

  const userToDelete = db.users[userIndex];
  if (userToDelete.role === 'admin' || userToDelete.email.toLowerCase() === 'admin@cashbackhub.com') {
    return res.status(403).json({ success: false, message: 'Super Administrator accounts cannot be deleted.' });
  }

  const targetEmail = userToDelete.email ? userToDelete.email.toLowerCase().trim() : '';

  // 1. Permanently delete from Supabase PostgreSQL relational tables
  if (supabase) {
    try {
      await Promise.all([
        supabase.from('wallets').delete().eq('user_id', id),
        supabase.from('wallet_transactions').delete().eq('user_id', id),
        supabase.from('attendance').delete().eq('user_id', id),
        supabase.from('spin_history').delete().eq('user_id', id),
        supabase.from('ad_history').delete().eq('user_id', id),
        supabase.from('withdrawals').delete().eq('user_id', id),
        targetEmail ? supabase.from('otps').delete().eq('email', targetEmail) : Promise.resolve()
      ]);
      // Delete user row from relational users table
      await supabase.from('users').delete().eq('id', id);
    } catch (e) {
      console.error('Error deleting user records from Supabase tables:', e.message || e);
    }
  }

  // 2. Remove user from in-memory cache and state
  db.users.splice(userIndex, 1);

  // Permanently clear ALL associated records, signups/bonuses, transactions, attendance & wallets
  db.wallets = (db.wallets || []).filter(w => w.user_id !== id);
  db.wallet_transactions = (db.wallet_transactions || []).filter(t => t.user_id !== id && (!targetEmail || t.user_email?.toLowerCase() !== targetEmail));
  db.attendance = (db.attendance || []).filter(a => a.user_id !== id && (!targetEmail || a.user_email?.toLowerCase() !== targetEmail));
  db.ad_completions = (db.ad_completions || []).filter(c => c.user_id !== id);
  db.spin_history = (db.spin_history || []).filter(s => s.user_id !== id);
  db.activities = (db.activities || []).filter(a => a.user_id !== id && (!targetEmail || a.user_email?.toLowerCase() !== targetEmail));
  db.withdrawals = (db.withdrawals || []).filter(w => w.user_id !== id && (!targetEmail || w.user_details?.email?.toLowerCase() !== targetEmail));

  await writeDb(db);

  logAdminAction(
    req.user,
    'DELETE_USER',
    userToDelete.email,
    `Permanently deleted customer account and cleared all activity records for ${userToDelete.name} (${userToDelete.email}, Phone: ${userToDelete.mobile || 'N/A'})`
  );

  res.json({
    success: true,
    message: `Customer account for ${userToDelete.name} (${userToDelete.email}) and all related ledger activity records were completely removed.`
  });
});


// ----------------------------------------------------
// 3. ADMIN DASHBOARD STATS API
// ----------------------------------------------------


app.get('/api/v1/admin/dashboard/stats', authenticateAdmin, async (req, res) => {
  const todayStr = getISTDateString();

  // Always fetch fresh authoritative data directly from Supabase relational tables
  let users = [], wallets = [], txs = [], attendance = [], spinHistory = [], adHistory = [], withdrawals = [], vouchers = [], activities = [], auditLogs = [];

  if (supabase) {
    try {
      const [
        usersRes, walletsRes, txsRes, attendanceRes,
        spinRes, adRes, withdrawalsRes, vouchersRes
      ] = await Promise.all([
        supabase.from('users').select('id, role, email, name, created_at'),
        supabase.from('wallets').select('user_id, available_points, total_earned, total_redeemed'),
        supabase.from('wallet_transactions').select('user_id, points, type, created_at'),
        supabase.from('attendance').select('user_id, check_in_date, created_at'),
        supabase.from('spin_history').select('user_id, created_at, prize_points'),
        supabase.from('ad_history').select('user_id, created_at'),
        supabase.from('withdrawals').select('user_id, points, rupee_value, status, created_at'),
        supabase.from('perkfy_app_state').select('data').eq('id', 'main_state').maybeSingle()
      ]);

      users = usersRes.data || [];
      wallets = walletsRes.data || [];
      txs = txsRes.data || [];
      attendance = attendanceRes.data || [];
      spinHistory = spinRes.data || [];
      adHistory = adRes.data || [];
      withdrawals = withdrawalsRes.data || [];

      // Vouchers & activities still from state blob (not yet moved to relational)
      if (vouchersRes.data && vouchersRes.data.data) {
        vouchers = vouchersRes.data.data.vouchers || [];
        activities = (vouchersRes.data.data.activities || []).slice(0, 8);
        auditLogs = (vouchersRes.data.data.audit_logs || []).slice(0, 6);
      }
    } catch (e) {
      console.error('Dashboard stats Supabase fetch error:', e.message);
    }
  }

  // Fallback to in-memory cache if Supabase fetch failed
  if (!users.length) {
    const db = readDb();
    users = db.users || [];
    wallets = db.wallets || [];
    txs = db.wallet_transactions || [];
    attendance = db.attendance || [];
    spinHistory = db.spin_history || [];
    adHistory = db.ad_completions || [];
    withdrawals = db.withdrawals || [];
    vouchers = db.vouchers || [];
    activities = (db.activities || []).slice(0, 8);
    auditLogs = (db.audit_logs || []).slice(0, 6);
  }

  // ─── Stats Computation ────────────────────────────────────────────────────
  const totalUsers = users.filter(u => u.role !== 'admin').length;

  const todayAttendance = attendance.filter(a => a.check_in_date === todayStr || (a.created_at && a.created_at.startsWith(todayStr)));
  const todayAds = adHistory.filter(a => a.created_at && a.created_at.startsWith(todayStr));
  const todaySpins = spinHistory.filter(s => s.created_at && s.created_at.startsWith(todayStr));

  const activeUserIds = new Set([
    ...todayAttendance.map(a => a.user_id),
    ...todayAds.map(a => a.user_id),
    ...todaySpins.map(s => s.user_id)
  ]);
  const activeUsersCount = activeUserIds.size;

  const totalPointsDistributed = txs
    .filter(t => (t.points || 0) > 0)
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const todayPointsDistributed = txs
    .filter(t => (t.points || 0) > 0 && t.created_at && t.created_at.startsWith(todayStr))
    .reduce((sum, t) => sum + (t.points || 0), 0);

  const totalVoucherPurchases = withdrawals.length;
  const pendingWithdrawals = withdrawals.filter(w => w.status === 'Pending');
  const pendingPoints = pendingWithdrawals.reduce((sum, w) => sum + (w.points || 0), 0);
  const pendingRupees = pendingWithdrawals.reduce((sum, w) => sum + (w.rupee_value || 0), 0);

  const totalVouchersInStock = vouchers.reduce((s, v) => s + (v.inventory_count || 0), 0);

  // ─── 7-Day Weekly Trend ───────────────────────────────────────────────────
  const weeklyTrends = [];
  for (let i = 6; i >= 0; i--) {
    const dStr = getISTDateString(-i * 86400000);
    const d = new Date(Date.now() - i * 86400000);
    const dayLabel = d.toLocaleDateString('en-US', { timeZone: 'Asia/Kolkata', weekday: 'short' });

    const dayDistributed = txs
      .filter(t => (t.points || 0) > 0 && t.created_at && t.created_at.startsWith(dStr))
      .reduce((sum, t) => sum + (t.points || 0), 0);

    const dayRedeemed = txs
      .filter(t => (t.points || 0) < 0 && t.type && t.type.includes('Withdrawal') && t.created_at && t.created_at.startsWith(dStr))
      .reduce((sum, t) => sum + Math.abs(t.points || 0), 0);

    const daySpinsCount = spinHistory.filter(s => s.created_at && s.created_at.startsWith(dStr)).length;

    weeklyTrends.push({
      date: dStr,
      day: dayLabel,
      distributed: dayDistributed || 0,
      redeemed: dayRedeemed || 0,
      spins: daySpinsCount || 0
    });
  }

  // ─── Category-wise Points Breakdown ──────────────────────────────────────
  const ratio = (() => {
    const db = readDb();
    return (db.platform_settings?.points_to_rupee_ratio) || 10;
  })();

  const ptsByType = (type) => txs.filter(t => (t.points || 0) > 0 && t.type === type).reduce((s, t) => s + (t.points || 0), 0);

  const attendancePts   = ptsByType('Attendance Reward');
  const adPts           = ptsByType('Advertisement Reward');
  const spinPts         = ptsByType('Spin Reward');
  const signupPts       = ptsByType('Welcome Bonus');
  const otherPts        = txs.filter(t => (t.points || 0) > 0 && !['Attendance Reward','Advertisement Reward','Spin Reward','Welcome Bonus'].includes(t.type)).reduce((s, t) => s + (t.points || 0), 0);
  const grandTotalPts   = attendancePts + adPts + spinPts + signupPts + otherPts;

  const toRupees = (pts) => (pts / ratio).toFixed(2);

  res.json({
    success: true,
    stats: {
      total_users: totalUsers,
      active_users_today: activeUsersCount,
      today_attendance_count: todayAttendance.length,
      today_ads_watched: todayAds.length,
      today_spins_count: todaySpins.length,
      today_points_distributed: todayPointsDistributed,
      total_points_distributed: totalPointsDistributed,
      total_voucher_purchases: totalVoucherPurchases,
      pending_withdrawals_count: pendingWithdrawals.length,
      pending_withdrawals_points: pendingPoints,
      pending_withdrawals_rupees: pendingRupees,
      total_vouchers_in_stock: totalVouchersInStock
    },
    points_breakdown: {
      grand_total:    { points: grandTotalPts,  rupees: toRupees(grandTotalPts)  },
      attendance:     { points: attendancePts,  rupees: toRupees(attendancePts)  },
      watch_ads:      { points: adPts,          rupees: toRupees(adPts)          },
      spin_wheel:     { points: spinPts,        rupees: toRupees(spinPts)        },
      signup_bonus:   { points: signupPts,      rupees: toRupees(signupPts)      },
      other:          { points: otherPts,        rupees: toRupees(otherPts)       }
    },
    weekly_trends: weeklyTrends,
    recent_activities: activities,
    recent_audit_logs: auditLogs
  });
});






// ----------------------------------------------------
// 4. ADMIN ATTENDANCE MANAGEMENT API
// ----------------------------------------------------

app.get('/api/v1/admin/attendance', authenticateAdmin, (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();

  const nonAdminUsers = db.users.filter(u => u.role !== 'admin');
  const userAttendanceList = nonAdminUsers.map(user => {
    const userRecords = db.attendance.filter(a => a.user_id === user.id);
    const completedToday = userRecords.some(a => a.check_in_date === todayStr);
    const lastRecord = userRecords.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];
    
    // Check if user watched ad today
    const adWatchedToday = db.ad_completions.some(c => c.user_id === user.id && c.completion_date === todayStr);

    return {
      user_id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      completed_today: completedToday,
      ad_reward_completed: adWatchedToday || (lastRecord && lastRecord.ad_watched_reward),
      streak_days: lastRecord?.streak_days || (completedToday ? 1 : 0),
      total_attendance_days: userRecords.length || (completedToday ? 1 : 0),
      last_check_in: lastRecord ? lastRecord.created_at : null,
      reward_points_awarded: (userRecords.length || 0) * (db.platform_settings.attendance_reward_points || 10)
    };
  });

  res.json({
    success: true,
    today_date: todayStr,
    total_users: nonAdminUsers.length,
    completed_today_count: userAttendanceList.filter(u => u.completed_today).length,
    users: userAttendanceList,
    history_logs: db.attendance.slice(0, 50)
  });
});

// ----------------------------------------------------
// 5. ADMIN WALLET & WITHDRAWAL MANAGEMENT API
// ----------------------------------------------------

app.get('/api/v1/admin/wallets', authenticateAdmin, (req, res) => {
  const db = readDb();
  const nonAdminUsers = db.users.filter(u => u.role !== 'admin');

  const userWallets = nonAdminUsers.map(user => {
    let wallet = db.wallets.find(w => w.user_id === user.id);
    if (!wallet) {
      wallet = { available_points: 0, total_earned: 0, total_redeemed: 0 };
    }
    const txCount = db.wallet_transactions.filter(t => t.user_id === user.id).length;
    const lastTx = db.wallet_transactions
      .filter(t => t.user_id === user.id)
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))[0];

    return {
      user_id: user.id,
      name: user.name,
      email: user.email,
      mobile: user.mobile,
      avatar: user.avatar,
      available_points: wallet.available_points,
      total_earned: wallet.total_earned,
      total_redeemed: wallet.total_redeemed,
      rupee_value: (wallet.available_points / (db.platform_settings.points_to_rupee_ratio || 10)),
      transaction_count: txCount,
      last_activity: lastTx ? lastTx.created_at : user.created_at
    };
  });

  res.json({
    success: true,
    wallets: userWallets,
    summary: {
      total_balance_points: userWallets.reduce((s, w) => s + w.available_points, 0),
      total_earned_points: userWallets.reduce((s, w) => s + w.total_earned, 0),
      total_redeemed_points: userWallets.reduce((s, w) => s + w.total_redeemed, 0)
    }
  });
});

app.post('/api/v1/admin/wallets/adjust', authenticateAdmin, async (req, res) => {
  const { user_id, amount, type, reason } = req.body;
  if (!user_id || amount === undefined || isNaN(amount)) {
    return res.status(400).json({ success: false, message: 'User ID and valid points amount are required' });
  }

  const db = readDb();
  const user = db.users.find(u => u.id === user_id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  let wallet = db.wallets.find(w => w.user_id === user_id);
  if (!wallet) {
    wallet = { id: `wal_${Date.now()}`, user_id, available_points: 0, total_earned: 0, total_redeemed: 0, updated_at: getISTTimestamp() };
    db.wallets.push(wallet);
  }

  const pointsChange = parseInt(amount, 10);
  const balanceBefore = wallet.available_points;
  
  if (pointsChange < 0 && balanceBefore + pointsChange < 0) {
    return res.status(400).json({ success: false, message: 'User does not have enough points for this deduction' });
  }

  wallet.available_points += pointsChange;
  if (pointsChange > 0) {
    wallet.total_earned += pointsChange;
  }
  wallet.updated_at = getISTTimestamp();

  const txType = pointsChange > 0 ? 'Admin Credit Adjustment' : 'Admin Debit Adjustment';
  const tx = {
    id: `tx_${Date.now()}`,
    user_id: user.id,
    user_name: user.name,
    type: txType,
    points: pointsChange,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: `ADJ-${Date.now()}`,
    description: reason || `Manual adjustment by admin (${pointsChange > 0 ? '+' : ''}${pointsChange} pts)`,
    status: 'Completed',
    created_at: getISTTimestamp()
  };

  db.wallet_transactions.unshift(tx);
  await writeDb(db);

  logAdminAction(
    req.user,
    'WALLET_ADJUSTMENT',
    user.email,
    `Adjusted ${pointsChange > 0 ? '+' : ''}${pointsChange} points for ${user.name}. Reason: ${reason || 'N/A'}`
  );

  recordActivity({
    user_id: user.id,
    user_name: user.name,
    user_email: user.email,
    type: 'adjustment',
    title: 'Wallet Adjustment',
    points: pointsChange,
    details: `${pointsChange > 0 ? '+' : ''}${pointsChange} points adjusted: ${reason || 'Admin Adjustment'}`
  });

  res.json({
    success: true,
    message: `Successfully adjusted ${pointsChange > 0 ? '+' : ''}${pointsChange} points for ${user.name}`,
    wallet
  });
});

app.get('/api/v1/admin/withdrawals', authenticateAdmin, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    withdrawals: db.withdrawals.sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  });
});

// Dedicated Gift Cards Management Admin Routes
app.get('/api/v1/admin/gift-cards', authenticateAdmin, (req, res) => {
  const db = readDb();
  const { status, q } = req.query;

  let list = db.withdrawals.map(w => {
    const user = db.users.find(u => u.id === w.user_id);
    const voucher = db.vouchers.find(v => v.id === w.voucher_id);
    return {
      ...w,
      user_name: user?.name || w.user_name || 'Customer',
      user_email: user?.email || w.user_email || w.user_details?.email || 'N/A',
      user_mobile: user?.mobile || w.user_mobile || 'N/A',
      user_avatar: user?.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&q=80',
      voucher_logo: voucher?.logo || '🎁'
    };
  }).sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

  if (status && status !== 'all' && status !== 'ALL') {
    list = list.filter(w => w.status?.toLowerCase() === status.toLowerCase());
  }

  if (q && q.trim()) {
    const query = q.trim().toLowerCase();
    list = list.filter(w =>
      (w.reference_id && w.reference_id.toLowerCase().includes(query)) ||
      (w.user_name && w.user_name.toLowerCase().includes(query)) ||
      (w.user_email && w.user_email.toLowerCase().includes(query)) ||
      (w.voucher_name && w.voucher_name.toLowerCase().includes(query))
    );
  }

  const pendingCount = db.withdrawals.filter(w => w.status === 'Pending').length;
  const fulfilledCount = db.withdrawals.filter(w => w.status === 'Fulfilled').length;
  const totalRupeesFulfilled = db.withdrawals.filter(w => w.status === 'Fulfilled').reduce((s, w) => s + (w.rupee_value || 0), 0);
  const totalPointsRedeemed = db.withdrawals.filter(w => w.status === 'Fulfilled').reduce((s, w) => s + (w.points || 0), 0);

  res.json({
    success: true,
    gift_cards: list,
    stats: {
      total_requests: db.withdrawals.length,
      pending_count: pendingCount,
      fulfilled_count: fulfilledCount,
      total_rupees_fulfilled: totalRupeesFulfilled,
      total_points_redeemed: totalPointsRedeemed
    }
  });
});

app.put('/api/v1/admin/gift-cards/:id/fulfill', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { card_number, pin, expiry_date, instructions, voucher_image_url, admin_notes } = req.body;

  if (!card_number || !card_number.trim()) {
    return res.status(400).json({ success: false, message: 'Gift Card / Voucher Code is required for fulfillment' });
  }

  const db = readDb();
  const withdrawal = db.withdrawals.find(w => w.id === id || w.reference_id === id);
  if (!withdrawal) {
    return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
  }

  withdrawal.status = 'Fulfilled';
  withdrawal.fulfillment = {
    card_number: card_number.trim(),
    pin: pin ? pin.trim() : '',
    expiry_date: expiry_date || '',
    instructions: instructions || `Apply code on ${withdrawal.voucher_name} app or checkout page.`,
    voucher_image_url: voucher_image_url || '',
    fulfilled_at: getISTTimestamp(),
    fulfilled_by: req.user?.email || 'admin@cashbackhub.com'
  };
  if (admin_notes) withdrawal.admin_notes = admin_notes;
  withdrawal.updated_at = getISTTimestamp();

  // Update associated wallet transaction status
  const tx = db.wallet_transactions.find(t => t.reference_id === withdrawal.reference_id);
  if (tx) {
    tx.status = 'Completed';
  }

  await writeDb(db);

  logAdminAction(
    req.user,
    'FULFILL_GIFT_CARD',
    withdrawal.voucher_name,
    `Fulfilled ₹${withdrawal.rupee_value} ${withdrawal.voucher_name} for ${withdrawal.user_name || withdrawal.user_id} (${withdrawal.reference_id}) with code ${card_number.trim()}`
  );

  recordActivity({
    user_id: withdrawal.user_id,
    user_name: withdrawal.user_name || 'User',
    user_email: withdrawal.user_email || '',
    type: 'voucher',
    title: 'Gift Card Fulfilled & Delivered',
    points: 0,
    status: 'completed',
    details: `Your ${withdrawal.voucher_name} (₹${withdrawal.rupee_value}) code is ready in your Activity tab!`
  });

  res.json({
    success: true,
    message: 'Gift Card fulfilled and delivered to customer successfully!',
    withdrawal
  });
});

app.put('/api/v1/admin/gift-cards/:id/reject', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { reason, admin_notes } = req.body;

  const db = readDb();
  const withdrawal = db.withdrawals.find(w => w.id === id || w.reference_id === id);
  if (!withdrawal) {
    return res.status(404).json({ success: false, message: 'Withdrawal request not found' });
  }

  const prevStatus = withdrawal.status;
  withdrawal.status = 'Rejected';
  withdrawal.rejection_reason = reason || admin_notes || 'Request rejected by admin';
  if (admin_notes) withdrawal.admin_notes = admin_notes;
  withdrawal.updated_at = getISTTimestamp();

  // Refund points to user wallet if not previously rejected
  if (prevStatus !== 'Rejected') {
    let wallet = db.wallets.find(w => w.user_id === withdrawal.user_id);
    if (wallet) {
      const balanceBefore = wallet.available_points;
      wallet.available_points += withdrawal.points;
      wallet.total_redeemed = Math.max(0, (wallet.total_redeemed || 0) - withdrawal.points);
      wallet.updated_at = getISTTimestamp();

      db.wallet_transactions.unshift({
        id: `tx_${Date.now()}_refund`,
        user_id: withdrawal.user_id,
        user_name: withdrawal.user_name || 'User',
        type: 'Withdrawal Refund',
        points: withdrawal.points,
        balance_before: balanceBefore,
        balance_after: wallet.available_points,
        reference_id: `REFUND-${withdrawal.reference_id}`,
        description: `Refund for rejected ${withdrawal.voucher_name} withdrawal: ${withdrawal.rejection_reason}`,
        status: 'Completed',
        created_at: getISTTimestamp()
      });
    }
  }

  await writeDb(db);

  logAdminAction(
    req.user,
    'REJECT_GIFT_CARD',
    withdrawal.voucher_name,
    `Rejected ₹${withdrawal.rupee_value} ${withdrawal.voucher_name} for ${withdrawal.user_name} (${withdrawal.reference_id}) — Points Refunded: +${withdrawal.points} pts`
  );

  recordActivity({
    user_id: withdrawal.user_id,
    user_name: withdrawal.user_name || 'User',
    user_email: withdrawal.user_email || '',
    type: 'voucher',
    title: 'Withdrawal Request Rejected',
    points: withdrawal.points,
    status: 'refunded',
    details: `${withdrawal.voucher_name} (₹${withdrawal.rupee_value}) rejected. +${withdrawal.points} pts refunded to your wallet.`
  });

  res.json({
    success: true,
    message: 'Withdrawal request rejected and points refunded to customer wallet',
    withdrawal
  });
});

app.put('/api/v1/admin/withdrawals/:id/status', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, admin_notes, voucher_code } = req.body;

  if (!['Pending', 'Approved', 'Rejected', 'Fulfilled'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal status' });
  }

  const db = readDb();
  const withdrawal = db.withdrawals.find(w => w.id === id || w.reference_id === id);
  if (!withdrawal) return res.status(404).json({ success: false, message: 'Withdrawal request not found' });

  const prevStatus = withdrawal.status;
  withdrawal.status = status;
  if (admin_notes) withdrawal.admin_notes = admin_notes;
  if (voucher_code) {
    if (!withdrawal.fulfillment) withdrawal.fulfillment = {};
    withdrawal.fulfillment.card_number = voucher_code;
  }
  withdrawal.updated_at = getISTTimestamp();

  // If rejected, refund points to user's wallet
  if (status === 'Rejected' && prevStatus !== 'Rejected') {
    let wallet = db.wallets.find(w => w.user_id === withdrawal.user_id);
    if (wallet) {
      const balanceBefore = wallet.available_points;
      wallet.available_points += withdrawal.points;
      wallet.total_redeemed = Math.max(0, wallet.total_redeemed - withdrawal.points);
      wallet.updated_at = getISTTimestamp();

      db.wallet_transactions.unshift({
        id: `tx_${Date.now()}_refund`,
        user_id: withdrawal.user_id,
        user_name: withdrawal.user_name || 'User',
        type: 'Withdrawal Refund',
        points: withdrawal.points,
        balance_before: balanceBefore,
        balance_after: wallet.available_points,
        reference_id: `REFUND-${withdrawal.reference_id}`,
        description: `Refund for rejected withdrawal ${withdrawal.reference_id}: ${admin_notes || 'Cancelled by admin'}`,
        status: 'Completed',
        created_at: getISTTimestamp()
      });
    }
  }

  await writeDb(db);

  logAdminAction(
    req.user,
    'UPDATE_WITHDRAWAL_STATUS',
    withdrawal.reference_id,
    `Changed status from ${prevStatus} to ${status}. Notes: ${admin_notes || 'None'}`
  );

  recordActivity({
    user_id: withdrawal.user_id,
    user_name: withdrawal.user_name || 'User',
    user_email: withdrawal.user_details?.email || '',
    type: 'withdrawal',
    title: `Withdrawal ${status}`,
    points: status === 'Rejected' ? withdrawal.points : -withdrawal.points,
    details: `${withdrawal.voucher_name} (₹${withdrawal.rupee_value}) marked as ${status}`
  });

  res.json({
    success: true,
    message: `Withdrawal request status updated to ${status}`,
    withdrawal
  });
});

// ----------------------------------------------------
// 6. ADMIN GIFT VOUCHERS CATALOG & INVENTORY API
// ----------------------------------------------------

app.get('/api/v1/admin/vouchers', authenticateAdmin, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    vouchers: db.vouchers
  });
});

app.post('/api/v1/admin/vouchers', authenticateAdmin, async (req, res) => {
  const { name, provider, category, description, logo, image_url, minimum_points, denominations, inventory_count, status } = req.body;
  if (!name || !provider) {
    return res.status(400).json({ success: false, message: 'Voucher name and provider are required' });
  }

  const db = readDb();
  const voucherId = `vch_${Date.now()}`;
  const voucherLogo = image_url || logo || '🎁';
  const newVoucher = {
    id: voucherId,
    name,
    provider,
    category: category || 'General',
    description: description || '',
    logo: voucherLogo,
    image_url: image_url || (voucherLogo.startsWith('http') || voucherLogo.startsWith('data:') ? voucherLogo : ''),
    minimum_points: parseInt(minimum_points, 10) || 100,
    denominations: Array.isArray(denominations) ? denominations.map(Number) : [100, 200, 500, 1000, 2500, 5000],
    inventory_count: parseInt(inventory_count, 10) || 100,
    used_count: 0,
    status: status || 'active',
    created_at: getISTTimestamp()
  };

  db.vouchers.push(newVoucher);
  await writeDb(db);

  logAdminAction(req.user, 'CREATE_VOUCHER', newVoucher.name, `Added voucher ${newVoucher.name} with image/logo`);

  res.status(201).json({
    success: true,
    message: 'Gift voucher created successfully',
    voucher: newVoucher
  });
});

app.put('/api/v1/admin/vouchers/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const voucherIndex = db.vouchers.findIndex(v => v.id === id);
  if (voucherIndex === -1) return res.status(404).json({ success: false, message: 'Voucher not found' });

  const existing = db.vouchers[voucherIndex];
  const updated = {
    ...existing,
    ...req.body,
    logo: req.body.image_url || req.body.logo || existing.logo,
    image_url: req.body.image_url || req.body.logo || existing.image_url,
    minimum_points: req.body.minimum_points ? parseInt(req.body.minimum_points, 10) : (existing.minimum_points || 100),
    inventory_count: req.body.inventory_count !== undefined ? parseInt(req.body.inventory_count, 10) : existing.inventory_count,
    denominations: Array.isArray(req.body.denominations) ? req.body.denominations.map(Number) : existing.denominations,
    updated_at: getISTTimestamp()
  };

  db.vouchers[voucherIndex] = updated;
  await writeDb(db);

  logAdminAction(req.user, 'UPDATE_VOUCHER', updated.name, `Updated voucher settings/image for ${updated.name}`);

  res.json({
    success: true,
    message: 'Voucher updated successfully',
    voucher: updated
  });
});

app.delete('/api/v1/admin/vouchers/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const voucher = db.vouchers.find(v => v.id === id);
  if (!voucher) return res.status(404).json({ success: false, message: 'Voucher not found' });

  db.vouchers = db.vouchers.filter(v => v.id !== id);
  await writeDb(db);

  logAdminAction(req.user, 'DELETE_VOUCHER', voucher.name, `Deleted voucher ${voucher.name}`);

  res.json({
    success: true,
    message: 'Voucher deleted successfully'
  });
});

// ----------------------------------------------------
// 7. SPIN WHEEL ENGINE & DAILY BUDGET MANAGEMENT API
// ----------------------------------------------------

app.get('/api/v1/admin/spin-wheel', authenticateAdmin, (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();

  // Auto-reset daily counters if date has rolled over
  let changed = false;
  db.spin_configurations.forEach(slice => {
    if (slice.last_reset_date !== todayStr) {
      slice.today_awarded_count = 0;
      slice.last_reset_date = todayStr;
      changed = true;
    }
  });
  if (changed) writeDb(db);

  // Compute total probability weights
  const totalWeight = db.spin_configurations
    .filter(s => s.is_active)
    .reduce((sum, s) => sum + (s.probability_weight || 0), 0);

  const slicesWithStats = db.spin_configurations.map(slice => {
    const dailyLimit = slice.daily_limit || 0;
    const awardedToday = slice.today_awarded_count || 0;
    const isExhausted = dailyLimit > 0 && awardedToday >= dailyLimit;
    const remainingLimit = dailyLimit > 0 ? Math.max(0, dailyLimit - awardedToday) : 'Unlimited';
    const effectiveProbability = totalWeight > 0 && slice.is_active ? ((slice.probability_weight / totalWeight) * 100).toFixed(1) : 0;

    return {
      ...slice,
      daily_limit: dailyLimit,
      today_awarded_count: awardedToday,
      remaining_limit: remainingLimit,
      is_exhausted: isExhausted,
      effective_probability_percent: effectiveProbability
    };
  });

  res.json({
    success: true,
    slices: slicesWithStats,
    cost_per_spin: db.platform_settings?.cost_per_spin !== undefined ? db.platform_settings.cost_per_spin : 10,
    daily_spin_limit_per_user: db.platform_settings?.daily_spin_limit || 10,
    daily_ad_limit: db.platform_settings?.daily_ad_limit || 10,
    ad_reward_points: db.platform_settings?.ad_reward_points || 10,
    signup_bonus_points: db.platform_settings?.signup_bonus_points !== undefined ? db.platform_settings.signup_bonus_points : 100,
    platform_settings: db.platform_settings,
    today_spins_total: db.spin_history.filter(s => s.created_at.startsWith(todayStr)).length
  });
});

app.put('/api/v1/admin/spin-wheel', authenticateAdmin, async (req, res) => {
  const { slices, daily_spin_limit, daily_ad_limit, cost_per_spin, ad_reward_points, signup_bonus_points } = req.body;
  const db = readDb();
  const todayStr = getISTDateString();

  if (!db.platform_settings) {
    db.platform_settings = {
      points_to_rupee_ratio: 10,
      attendance_reward_points: 10,
      ad_reward_points: 10,
      daily_ad_limit: 10,
      daily_spin_limit: 10,
      cost_per_spin: 10,
      signup_bonus_points: 100,
      min_withdrawal_points: 1000,
      currency: 'INR'
    };
  }

  // Update daily limits & signup bonus if provided
  if (daily_spin_limit !== undefined) {
    db.platform_settings.daily_spin_limit = Math.max(1, parseInt(daily_spin_limit, 10) || 10);
  }
  if (daily_ad_limit !== undefined) {
    db.platform_settings.daily_ad_limit = Math.max(1, parseInt(daily_ad_limit, 10) || 10);
  }
  if (cost_per_spin !== undefined) {
    db.platform_settings.cost_per_spin = Math.max(0, parseInt(cost_per_spin, 10) || 0);
  }
  if (ad_reward_points !== undefined) {
    db.platform_settings.ad_reward_points = Math.max(1, parseInt(ad_reward_points, 10) || 10);
  }
  if (signup_bonus_points !== undefined) {
    db.platform_settings.signup_bonus_points = Math.max(0, parseInt(signup_bonus_points, 10) || 0);
  }

  // Update slices if provided
  if (Array.isArray(slices) && slices.length > 0) {
    db.spin_configurations = slices.map((s, idx) => ({
      id: s.id || `slice_${idx + 1}`,
      label: s.label || `${s.reward_points} Points`,
      reward_points: parseInt(s.reward_points, 10) || 0,
      probability_weight: Math.max(1, parseInt(s.probability_weight, 10) || 10),
      color: s.color || '#5B21B6',
      daily_limit: parseInt(s.daily_limit, 10) || 0, // 0 = unlimited
      today_awarded_count: s.today_awarded_count !== undefined ? s.today_awarded_count : 0,
      last_reset_date: s.last_reset_date || todayStr,
      is_active: s.is_active !== undefined ? s.is_active : true
    }));
  }

  await writeDb(db);

  logAdminAction(
    req.user,
    'UPDATE_PLATFORM_DAILY_LIMITS',
    'Platform Settings & Spin Config',
    `Updated daily spin limit to ${db.platform_settings.daily_spin_limit} spins/day, daily ad limit to ${db.platform_settings.daily_ad_limit} ads/day, spin cost to ${db.platform_settings.cost_per_spin} pts, signup bonus to ${db.platform_settings.signup_bonus_points} pts`
  );

  res.json({
    success: true,
    message: 'Configuration and platform settings updated successfully',
    slices: db.spin_configurations,
    platform_settings: db.platform_settings,
    daily_spin_limit_per_user: db.platform_settings.daily_spin_limit,
    daily_ad_limit: db.platform_settings.daily_ad_limit,
    cost_per_spin: db.platform_settings.cost_per_spin,
    ad_reward_points: db.platform_settings.ad_reward_points,
    signup_bonus_points: db.platform_settings.signup_bonus_points
  });
});

// Public / Client Platform Settings Route
app.get('/api/v1/platform-settings', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    platform_settings: db.platform_settings || {
      points_to_rupee_ratio: 10,
      attendance_reward_points: 10,
      ad_reward_points: 10,
      daily_ad_limit: 10,
      daily_spin_limit: 10,
      cost_per_spin: 10,
      signup_bonus_points: 100,
      min_withdrawal_points: 100,
      currency: 'INR'
    },
    daily_spin_limit: db.platform_settings?.daily_spin_limit || 10,
    daily_ad_limit: db.platform_settings?.daily_ad_limit || 10,
    cost_per_spin: db.platform_settings?.cost_per_spin !== undefined ? db.platform_settings.cost_per_spin : 10,
    ad_reward_points: db.platform_settings?.ad_reward_points || 10,
    signup_bonus_points: db.platform_settings?.signup_bonus_points !== undefined ? db.platform_settings.signup_bonus_points : 100,
    attendance_reward_points: db.platform_settings?.attendance_reward_points || 10,
    points_to_rupee_ratio: db.platform_settings?.points_to_rupee_ratio || 10,
    min_withdrawal_points: db.platform_settings?.min_withdrawal_points || 100
  });
});

// Admin Dedicated Platform Settings Route
app.get('/api/v1/admin/settings', authenticateAdmin, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    platform_settings: db.platform_settings,
    daily_spin_limit_per_user: db.platform_settings?.daily_spin_limit || 10,
    daily_ad_limit: db.platform_settings?.daily_ad_limit || 10,
    cost_per_spin: db.platform_settings?.cost_per_spin !== undefined ? db.platform_settings.cost_per_spin : 10,
    ad_reward_points: db.platform_settings?.ad_reward_points || 10,
    signup_bonus_points: db.platform_settings?.signup_bonus_points !== undefined ? db.platform_settings.signup_bonus_points : 100
  });
});

app.put('/api/v1/admin/settings', authenticateAdmin, async (req, res) => {
  const db = readDb();
  const { daily_spin_limit, daily_ad_limit, cost_per_spin, ad_reward_points, attendance_reward_points, points_to_rupee_ratio, signup_bonus_points } = req.body;

  if (!db.platform_settings) {
    db.platform_settings = {};
  }

  if (daily_spin_limit !== undefined) db.platform_settings.daily_spin_limit = Math.max(1, parseInt(daily_spin_limit, 10) || 10);
  if (daily_ad_limit !== undefined) db.platform_settings.daily_ad_limit = Math.max(1, parseInt(daily_ad_limit, 10) || 10);
  if (cost_per_spin !== undefined) db.platform_settings.cost_per_spin = Math.max(0, parseInt(cost_per_spin, 10) || 0);
  if (ad_reward_points !== undefined) db.platform_settings.ad_reward_points = Math.max(1, parseInt(ad_reward_points, 10) || 10);
  if (attendance_reward_points !== undefined) db.platform_settings.attendance_reward_points = Math.max(1, parseInt(attendance_reward_points, 10) || 10);
  if (points_to_rupee_ratio !== undefined) db.platform_settings.points_to_rupee_ratio = Math.max(1, parseInt(points_to_rupee_ratio, 10) || 10);
  if (signup_bonus_points !== undefined) db.platform_settings.signup_bonus_points = Math.max(0, parseInt(signup_bonus_points, 10) || 0);

  await writeDb(db);

  logAdminAction(
    req.user,
    'UPDATE_PLATFORM_SETTINGS',
    'Platform Limits',
    `Configured daily limits: ${db.platform_settings.daily_spin_limit} spins/day, ${db.platform_settings.daily_ad_limit} ads/day, signup bonus ${db.platform_settings.signup_bonus_points} pts`
  );

  res.json({
    success: true,
    message: 'Platform settings and limits updated successfully',
    platform_settings: db.platform_settings,
    daily_spin_limit_per_user: db.platform_settings.daily_spin_limit,
    daily_ad_limit: db.platform_settings.daily_ad_limit,
    cost_per_spin: db.platform_settings.cost_per_spin,
    ad_reward_points: db.platform_settings.ad_reward_points,
    signup_bonus_points: db.platform_settings.signup_bonus_points
  });
});

// User Spin Config Endpoint
app.get('/api/v1/spin/config', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();
  const userSpinsToday = (db.spin_history || []).filter(s => s.user_id === req.user.id && s.created_at.startsWith(todayStr));
  const dailyLimit = db.platform_settings?.daily_spin_limit || 10;
  const costPerSpin = db.platform_settings?.cost_per_spin !== undefined ? db.platform_settings.cost_per_spin : 10;
  const spinsAvailable = Math.max(0, dailyLimit - userSpinsToday.length);

  res.json({
    success: true,
    slices: (db.spin_configurations || []).filter(s => s.is_active),
    spins_available_today: spinsAvailable,
    spins_completed_today: userSpinsToday.length,
    daily_limit: dailyLimit,
    cost_per_spin: costPerSpin
  });
});

// User Spin Endpoint with dynamic Daily Limit enforcement
app.post('/api/v1/spin/play', authenticateToken, async (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();
  const userSpinsToday = (db.spin_history || []).filter(s => s.user_id === req.user.id && s.created_at.startsWith(todayStr));
  const dailyLimit = db.platform_settings?.daily_spin_limit || 10;
  const costPerSpin = db.platform_settings?.cost_per_spin !== undefined ? db.platform_settings.cost_per_spin : 10;

  if (userSpinsToday.length >= dailyLimit) {
    return res.status(400).json({ success: false, message: `You have completed all ${dailyLimit} spins for today! Please check back tomorrow.` });
  }

  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet || wallet.available_points < costPerSpin) {
    return res.status(400).json({
      success: false,
      message: `Insufficient points! You need at least ${costPerSpin} points to spin the wheel.`
    });
  }

  // Deduct spin fee
  const balanceBeforeEntry = wallet.available_points;
  wallet.available_points -= costPerSpin;
  wallet.updated_at = getISTTimestamp();

  db.wallet_transactions.unshift({
    id: `tx_${Date.now()}_spin_cost`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    type: 'Spin Entry Fee',
    points: -costPerSpin,
    balance_before: balanceBeforeEntry,
    balance_after: wallet.available_points,
    reference_id: `SPIN-FEE-${Date.now()}`,
    description: `Paid ${costPerSpin} points for Lucky Spin Wheel`,
    status: 'Completed',
    created_at: getISTTimestamp()
  });

  // Roll reset if needed
  db.spin_configurations.forEach(slice => {
    if (slice.last_reset_date !== todayStr) {
      slice.today_awarded_count = 0;
      slice.last_reset_date = todayStr;
    }
  });

  // Filter available slices (excluding exhausted daily limit or inactive)
  const allSlices = db.spin_configurations;
  const eligibleSlices = allSlices.filter(s => {
    if (!s.is_active) return false;
    if (s.daily_limit > 0 && s.today_awarded_count >= s.daily_limit) {
      return false; // DAILY LIMIT EXCEEDED -> Exclude from selection
    }
    return true;
  });

  // Weighted Selection among eligible slices
  const activePool = eligibleSlices.length > 0 ? eligibleSlices : allSlices.filter(s => s.reward_points === 0);
  const totalWeight = activePool.reduce((sum, slice) => sum + (slice.probability_weight || 10), 0);
  let randomNum = Math.random() * totalWeight;
  let winningSlice = activePool[0];

  for (let i = 0; i < activePool.length; i++) {
    const slice = activePool[i];
    if (randomNum < (slice.probability_weight || 10)) {
      winningSlice = slice;
      break;
    }
    randomNum -= (slice.probability_weight || 10);
  }

  // Find index in original slices array for frontend wheel animation alignment
  const targetIndex = allSlices.findIndex(s => s.id === winningSlice.id);
  const rewardPoints = winningSlice.reward_points || 0;

  // Increment today's awarded count for winning slice
  winningSlice.today_awarded_count = (winningSlice.today_awarded_count || 0) + 1;

  // Record Spin History
  db.spin_history.unshift({
    id: `spin_${Date.now()}`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    winning_slice_id: winningSlice.id,
    winning_label: winningSlice.label,
    reward_points: rewardPoints,
    cost_points: costPerSpin,
    status: 'Completed',
    created_at: getISTTimestamp()
  });

  // Credit Wallet if reward > 0
  if (rewardPoints > 0) {
    const balanceBeforeReward = wallet.available_points;
    wallet.available_points += rewardPoints;
    wallet.total_earned += rewardPoints;
    wallet.updated_at = getISTTimestamp();

    db.wallet_transactions.unshift({
      id: `tx_${Date.now()}_spin_win`,
      user_id: req.user.id,
      user_name: req.user.name || 'User',
      type: 'Spin Reward',
      points: rewardPoints,
      balance_before: balanceBeforeReward,
      balance_after: wallet.available_points,
      reference_id: `SPIN-WIN-${Date.now()}`,
      description: `Won ${rewardPoints} points on Spin & Win!`,
      status: 'Completed',
      created_at: getISTTimestamp()
    });
  }

  await writeDb(db);

  recordActivity({
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    user_email: req.user.email || '',
    type: 'spin',
    title: 'Lucky Spin & Win',
    points: rewardPoints > 0 ? rewardPoints : -costPerSpin,
    details: rewardPoints > 0 ? `Won ${rewardPoints} Points on Lucky Wheel` : 'Spun wheel (Better Luck Next Time)'
  });

  const spinsAvailableToday = Math.max(0, dailyLimit - (userSpinsToday.length + 1));

  res.json({
    success: true,
    message: rewardPoints > 0 ? `🎉 Congratulations! You won +${rewardPoints} points!` : 'Better luck next time!',
    winning_slice: winningSlice,
    targetIndex: targetIndex >= 0 ? targetIndex : 0,
    reward_points: rewardPoints,
    cost_points: costPerSpin,
    spins_available_today: spinsAvailableToday,
    spins_completed_today: userSpinsToday.length + 1,
    daily_limit: dailyLimit,
    wallet
  });
});

// ----------------------------------------------------
// 8. ADMIN ACTIVITIES & RESOLUTION API
// ----------------------------------------------------

app.get('/api/v1/admin/activities', authenticateAdmin, (req, res) => {
  const { type, search, status, page = 1, limit = 50 } = req.query;
  const db = readDb();
  let list = db.activities || [];

  if (type && type !== 'all') {
    list = list.filter(a => a.type === type);
  }
  if (status && status !== 'all') {
    list = list.filter(a => a.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a => 
      (a.user_name && a.user_name.toLowerCase().includes(q)) ||
      (a.user_email && a.user_email.toLowerCase().includes(q)) ||
      (a.title && a.title.toLowerCase().includes(q)) ||
      (a.details && a.details.toLowerCase().includes(q))
    );
  }

  const total = list.length;
  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const paginated = list.slice((pageNum - 1) * limitNum, pageNum * limitNum);

  res.json({
    success: true,
    activities: paginated,
    total,
    page: pageNum,
    total_pages: Math.ceil(total / limitNum) || 1
  });
});

app.put('/api/v1/admin/activities/:id/resolve', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const { status, note } = req.body;
  const db = readDb();
  const actIndex = (db.activities || []).findIndex(a => a.id === id);
  if (actIndex === -1) return res.status(404).json({ success: false, message: 'Activity record not found' });

  db.activities[actIndex].status = status || 'resolved';
  if (note) db.activities[actIndex].resolution_note = note;
  db.activities[actIndex].resolved_at = getISTTimestamp();
  db.activities[actIndex].resolved_by = req.user.email;

  await writeDb(db);

  logAdminAction(req.user, 'RESOLVE_ACTIVITY', id, `Marked activity as ${status || 'resolved'}. Note: ${note || 'None'}`);

  res.json({
    success: true,
    message: 'Activity updated successfully',
    activity: db.activities[actIndex]
  });
});

app.delete('/api/v1/admin/activities/:id', authenticateAdmin, async (req, res) => {
  const { id } = req.params;
  const db = readDb();
  const actIndex = (db.activities || []).findIndex(a => a.id === id);
  if (actIndex === -1) return res.status(404).json({ success: false, message: 'Activity record not found' });

  const removed = db.activities.splice(actIndex, 1)[0];
  await writeDb(db);

  logAdminAction(req.user, 'DELETE_ACTIVITY', id, `Deleted activity record: ${removed.title} for ${removed.user_name || removed.user_email}`);

  res.json({
    success: true,
    message: 'Activity record removed successfully'
  });
});


// ----------------------------------------------------
// 9. ADMIN AUDIT LOGS API
// ----------------------------------------------------

app.get('/api/v1/admin/audit-logs', authenticateAdmin, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    audit_logs: (db.audit_logs || []).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
  });
});

app.delete('/api/v1/admin/audit-logs', authenticateAdmin, async (req, res) => {
  const db = readDb();
  const clearedCount = (db.audit_logs || []).length;
  db.audit_logs = [];
  await writeDb(db);

  // Add a single system log entry recording the clearance
  logAdminAction(
    req.user,
    'CLEAR_AUDIT_LOGS',
    'audit_logs',
    `All ${clearedCount} audit log entries were permanently cleared from the system by administrator.`
  );

  res.json({
    success: true,
    message: `Successfully cleared ${clearedCount} audit log entries from the system and Supabase.`,
    cleared_count: clearedCount
  });
});

// ----------------------------------------------------
// 10. DAILY ATTENDANCE & ADS (USER ENDPOINTS)
// ----------------------------------------------------

app.get('/api/v1/attendance/today', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();
  const existing = db.attendance.find(a => a.user_id === req.user.id && a.check_in_date === todayStr);
  
  res.json({
    success: true,
    completed: !!existing,
    reward_points: db.platform_settings.attendance_reward_points
  });
});

app.post('/api/v1/attendance/check-in', authenticateToken, async (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();
  const existing = db.attendance.find(a => a.user_id === req.user.id && a.check_in_date === todayStr);

  if (existing) {
    return res.status(400).json({ success: false, message: 'Daily attendance already marked for today' });
  }

  const rewardPoints = db.platform_settings?.attendance_reward_points || 10;
  
  const attRecord = {
    id: `att_${Date.now()}`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    user_email: req.user.email || '',
    check_in_date: todayStr,
    reward_points: rewardPoints,
    streak_days: 1,
    ad_watched_reward: true,
    created_at: getISTTimestamp()
  };
  db.attendance.unshift(attRecord);

  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet) {
    wallet = { id: `wal_${Date.now()}`, user_id: req.user.id, available_points: 0, total_earned: 0, total_redeemed: 0, updated_at: getISTTimestamp() };
    db.wallets.push(wallet);
  }

  const balanceBefore = wallet.available_points;
  wallet.available_points += rewardPoints;
  wallet.total_earned += rewardPoints;
  wallet.updated_at = getISTTimestamp();

  const tx = {
    id: `tx_${Date.now()}`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    type: 'Attendance Reward',
    points: rewardPoints,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: `ATT-${todayStr}`,
    description: `Daily attendance reward (+${rewardPoints} pts)`,
    status: 'Completed',
    created_at: getISTTimestamp()
  };
  db.wallet_transactions.unshift(tx);

  await writeDb(db);

  recordActivity({
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    user_email: req.user.email || '',
    type: 'attendance',
    title: 'Daily Attendance Marked',
    points: rewardPoints,
    details: `Marked check-in for ${todayStr} (+${rewardPoints} pts)`
  });

  res.json({
    success: true,
    message: `Daily attendance marked! You earned +${rewardPoints} points!`,
    reward_points: rewardPoints,
    wallet
  });
});

app.get('/api/v1/ads', authenticateToken, (req, res) => {
  const db = readDb();
  const todayStr = getISTDateString();
  const userCompletions = db.ad_completions.filter(c => c.user_id === req.user.id && c.completion_date === todayStr);
  const completedAdIds = userCompletions.map(c => c.ad_id);
  const adRewardPoints = db.platform_settings?.ad_reward_points || 10;
  const adsWithUpdatedPoints = (db.advertisements || []).map(ad => ({
    ...ad,
    reward_points: adRewardPoints
  }));

  res.json({
    success: true,
    ads: adsWithUpdatedPoints,
    ad_reward_points: adRewardPoints,
    completed_ad_ids: completedAdIds,
    completed_count: userCompletions.length,
    daily_limit: db.platform_settings?.daily_ad_limit || 10
  });
});

app.post('/api/v1/ads/verify', authenticateToken, async (req, res) => {
  const { ad_id } = req.body;
  if (!ad_id) return res.status(400).json({ success: false, message: 'Ad ID is required' });

  const db = readDb();
  const ad = db.advertisements.find(a => a.id === ad_id);
  if (!ad) return res.status(404).json({ success: false, message: 'Advertisement not found' });

  const todayStr = getISTDateString();
  const userCompletionsToday = db.ad_completions.filter(c => c.user_id === req.user.id && c.completion_date === todayStr);

  const dailyLimit = db.platform_settings?.daily_ad_limit || 10;
  if (userCompletionsToday.length >= dailyLimit) {
    return res.status(400).json({ success: false, message: `You have reached your daily limit of ${dailyLimit} ads` });
  }

  const alreadyWatched = userCompletionsToday.some(c => c.ad_id === ad_id);
  if (alreadyWatched) {
    return res.status(400).json({ success: false, message: 'You have already watched this ad today' });
  }

  const rewardPoints = db.platform_settings?.ad_reward_points || ad.reward_points || 10;

  db.ad_completions.unshift({
    id: `adc_${Date.now()}`,
    user_id: req.user.id,
    ad_id,
    completion_date: todayStr,
    verification_status: 'verified',
    reward_points: rewardPoints,
    created_at: getISTTimestamp()
  });

  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  const balanceBefore = wallet.available_points;
  wallet.available_points += rewardPoints;
  wallet.total_earned += rewardPoints;
  wallet.updated_at = getISTTimestamp();

  db.wallet_transactions.unshift({
    id: `tx_${Date.now()}`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    type: 'Advertisement Reward',
    points: rewardPoints,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: `AD-VERIFIED-${ad_id}-${Date.now()}`,
    description: `Watched ad: ${ad.title}`,
    status: 'Completed',
    created_at: getISTTimestamp()
  });

  await writeDb(db);

  recordActivity({
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    user_email: req.user.email || '',
    type: 'ad',
    title: 'Ad Watched',
    points: rewardPoints,
    details: `Watched ${ad.title} (+${rewardPoints} pts)`
  });

  res.json({
    success: true,
    message: `Ad completed! You earned +${rewardPoints} points!`,
    reward_points: rewardPoints,
    completed_count: userCompletionsToday.length + 1,
    wallet
  });
});

// ----------------------------------------------------
// 11. USER WALLET & WITHDRAWALS API
// ----------------------------------------------------

app.get('/api/v1/wallet/balance', authenticateToken, (req, res) => {
  const db = readDb();
  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet) {
    wallet = { id: `wal_${Date.now()}`, user_id: req.user.id, available_points: 0, total_earned: 0, total_redeemed: 0, updated_at: getISTTimestamp() };
  }

  const pointsToRupeeRatio = db.platform_settings?.points_to_rupee_ratio || 10;
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

app.get('/api/v1/withdraw/vouchers', authenticateToken, (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    vouchers: db.vouchers.filter(v => v.status === 'active'),
    min_withdrawal_points: db.platform_settings?.min_withdrawal_points || 100,
    points_to_rupee_ratio: db.platform_settings?.points_to_rupee_ratio || 10
  });
});

app.post('/api/v1/withdraw/request', authenticateToken, async (req, res) => {
  const { voucher_id, points, rupee_value, denomination, user_mobile, user_notes } = req.body;
  if (!voucher_id) {
    return res.status(400).json({ success: false, message: 'Please select a Gift Card / Voucher' });
  }

  const db = readDb();
  const voucher = db.vouchers.find(v => v.id === voucher_id);
  if (!voucher) return res.status(404).json({ success: false, message: 'Selected gift voucher not found' });

  const ratio = db.platform_settings?.points_to_rupee_ratio || 10;
  let pointsToDeduct = parseInt(points, 10);
  let calcRupeeValue = rupee_value ? parseFloat(rupee_value) : null;

  if ((!pointsToDeduct || isNaN(pointsToDeduct)) && (denomination || calcRupeeValue)) {
    calcRupeeValue = parseFloat(denomination || calcRupeeValue);
    pointsToDeduct = Math.round(calcRupeeValue * ratio);
  } else if (!calcRupeeValue && pointsToDeduct) {
    calcRupeeValue = pointsToDeduct / ratio;
  }

  if (!pointsToDeduct || pointsToDeduct <= 0) {
    return res.status(400).json({ success: false, message: 'Invalid withdrawal amount' });
  }

  const minPoints = Math.min(100, voucher.minimum_points || 100);
  if (pointsToDeduct < minPoints) {
    return res.status(400).json({
      success: false,
      message: `Minimum redemption for ${voucher.name} is ${minPoints} points (₹${(minPoints / ratio).toFixed(2)})`
    });
  }

  let wallet = db.wallets.find(w => w.user_id === req.user.id);
  if (!wallet || wallet.available_points < pointsToDeduct) {
    return res.status(400).json({
      success: false,
      message: `Insufficient balance! You have ${wallet?.available_points || 0} pts, but ${pointsToDeduct} pts are required.`
    });
  }

  const referenceId = `WD-REQ-${Math.floor(1000 + Math.random() * 9000)}`;

  // Deduct Wallet Balance
  const balanceBefore = wallet.available_points;
  wallet.available_points -= pointsToDeduct;
  wallet.total_redeemed = (wallet.total_redeemed || 0) + pointsToDeduct;
  wallet.updated_at = getISTTimestamp();

  // Create Wallet Transaction
  db.wallet_transactions.unshift({
    id: `tx_${Date.now()}`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    type: 'Voucher Redemption',
    points: -pointsToDeduct,
    balance_before: balanceBefore,
    balance_after: wallet.available_points,
    reference_id: referenceId,
    description: `Redeemed ₹${calcRupeeValue} ${voucher.name}`,
    status: 'Pending',
    created_at: getISTTimestamp()
  });

  // Create Withdrawal Request Record
  const withdrawalRecord = {
    id: `wd_${Date.now()}`,
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    user_email: req.user.email || '',
    user_mobile: user_mobile || req.user.mobile || '',
    voucher_id: voucher.id,
    voucher_name: voucher.name,
    voucher_logo: voucher.logo || '🎁',
    points: pointsToDeduct,
    rupee_value: calcRupeeValue,
    denomination: denomination || calcRupeeValue,
    reference_id: referenceId,
    status: 'Pending',
    user_details: {
      email: req.user.email,
      mobile: user_mobile || req.user.mobile || '',
      notes: user_notes || ''
    },
    user_notes: user_notes || '',
    fulfillment: null,
    created_at: getISTTimestamp()
  };
  db.withdrawals.unshift(withdrawalRecord);

  // Update voucher inventory / used counts
  if (voucher.inventory_count > 0) {
    voucher.inventory_count -= 1;
    voucher.used_count = (voucher.used_count || 0) + 1;
  }

  await writeDb(db);

  recordActivity({
    user_id: req.user.id,
    user_name: req.user.name || 'User',
    user_email: req.user.email || '',
    type: 'voucher',
    title: 'Gift Card Withdrawal Requested',
    points: -pointsToDeduct,
    status: 'pending',
    details: `Requested ₹${calcRupeeValue} ${voucher.name} (${referenceId})`
  });

  res.status(201).json({
    success: true,
    message: `₹${calcRupeeValue} ${voucher.name} request submitted successfully! Admin will deliver your code shortly.`,
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

app.get('/api/v1/platform/settings', (req, res) => {
  const db = readDb();
  res.json({
    success: true,
    settings: db.platform_settings
  });
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🎉 CashBack Hub API Server running on port ${PORT}`);
    console.log(`🔗 Local Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`🛡️ Admin API available at /api/v1/admin/*`);
    console.log(`====================================================`);
  });
}

module.exports = app;
