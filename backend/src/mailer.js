const nodemailer = require('nodemailer');
const path = require('path');
const fs = require('fs');

// Attempt to load .env from backend folder or root
const envPaths = [
  path.resolve(__dirname, '../.env'),
  path.resolve(__dirname, '../../.env'),
  path.resolve(process.cwd(), 'backend/.env'),
  path.resolve(process.cwd(), '.env')
];

for (const p of envPaths) {
  if (fs.existsSync(p)) {
    require('dotenv').config({ path: p });
  }
}

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASSWORD ? process.env.SMTP_PASSWORD.replace(/\s+/g, '') : '';

  if (!user || !pass) {
    console.warn('[SMTP] Missing SMTP_USER or SMTP_PASSWORD in environment variables');
    return null;
  }

  try {
    return nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth: { user, pass },
      tls: { rejectUnauthorized: false }
    });
  } catch (err) {
    console.error('Failed to create nodemailer transporter:', err.message);
    return null;
  }
}

/**
 * Send Sign Up OTP Verification Email
 */
async function sendSignUpOtpEmail(toEmail, otp, userName = 'User') {
  const from = process.env.SMTP_FROM || 'Perkfy <chvs2026@gmail.com>';
  const mailOptions = {
    from,
    to: toEmail,
    subject: `${otp} is your Perkfy Sign-Up Verification Code`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #5B21B6 0%, #2563EB 50%, #22C55E 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Perkfy</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Welcome to Instant Rewards & Digital CashBack</p>
        </div>
        <div style="padding: 32px 28px;">
          <h2 style="color: #1E1B4B; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">Verify Your Email Address</h2>
          <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi <strong>${userName}</strong>, thanks for creating an account on Perkfy! Use the 6-digit verification code below to complete your registration and claim your welcome bonus points:
          </p>
          <div style="background: #F8F7FC; border: 2px dashed #7C3AED; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #5B21B6; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #6B7280; font-size: 13px; margin: 0 0 16px 0;">This OTP is valid for <strong>10 minutes</strong>. If you did not request this verification, please safely ignore this email.</p>
        </div>
        <div style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 18px 28px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Perkfy. All rights reserved.</p>
        </div>
      </div>
    `
  };

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[DEV OTP] Sign-up OTP for ${toEmail}: ${otp}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Sign-up OTP sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

/**
 * Send Password Reset OTP Email
 */
async function sendPasswordResetOtpEmail(toEmail, otp, userName = 'User') {
  const from = process.env.SMTP_FROM || 'Perkfy <chvs2026@gmail.com>';
  const mailOptions = {
    from,
    to: toEmail,
    subject: `${otp} is your Perkfy Password Reset Code`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #4338CA 50%, #EF4444 100%); padding: 32px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">Perkfy</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">Account Security & Recovery</p>
        </div>
        <div style="padding: 32px 28px;">
          <h2 style="color: #1E1B4B; margin: 0 0 12px 0; font-size: 20px; font-weight: 700;">Reset Your Password</h2>
          <p style="color: #4B5563; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0;">
            Hi <strong>${userName}</strong>, we received a request to reset your Perkfy account password. Use the verification code below to complete the reset:
          </p>
          <div style="background: #FEF2F2; border: 2px dashed #EF4444; border-radius: 14px; padding: 20px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 34px; font-weight: 800; letter-spacing: 8px; color: #DC2626; display: inline-block;">${otp}</span>
          </div>
          <p style="color: #6B7280; font-size: 13px; margin: 0 0 16px 0;">This OTP is valid for <strong>10 minutes</strong>. Never share this code with anyone. If you did not request a password reset, your account is safe and you can ignore this email.</p>
        </div>
        <div style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 18px 28px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">&copy; ${new Date().getFullYear()} Perkfy. All rights reserved.</p>
        </div>
      </div>
    `
  };

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[DEV OTP] Password reset OTP for ${toEmail}: ${otp}`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Password reset OTP sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send password reset email to ${toEmail}:`, error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  sendSignUpOtpEmail,
  sendPasswordResetOtpEmail,
  sendAdminWithdrawalAlertEmail
};

/**
 * Send Admin Withdrawal Alert Email to up to 2 configured admin emails
 */
async function sendAdminWithdrawalAlertEmail(recipientEmails, withdrawalData) {
  if (!recipientEmails || (Array.isArray(recipientEmails) && recipientEmails.length === 0)) {
    return { success: false, message: 'No recipient emails specified' };
  }

  // Ensure recipientEmails is an array of non-empty strings (max 2)
  let emailList = [];
  if (Array.isArray(recipientEmails)) {
    emailList = recipientEmails.map(e => (typeof e === 'string' ? e.trim() : '')).filter(Boolean);
  } else if (typeof recipientEmails === 'string') {
    emailList = recipientEmails.split(',').map(e => e.trim()).filter(Boolean);
  }
  emailList = emailList.slice(0, 2);

  if (emailList.length === 0) {
    return { success: false, message: 'No valid recipient emails' };
  }

  const from = process.env.SMTP_FROM || 'Perkfy Alerts <chvs2026@gmail.com>';
  const {
    user_name = 'User',
    user_email = 'N/A',
    user_mobile = 'N/A',
    voucher_name = 'Gift Card',
    rupee_value = 0,
    points = 0,
    reference_id = 'N/A',
    created_at = new Date().toISOString()
  } = withdrawalData;

  const mailOptions = {
    from,
    to: emailList.join(', '),
    subject: `🚨 [New Withdrawal] ₹${rupee_value} ${voucher_name} requested by ${user_name}`,
    html: `
      <div style="font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e5e7eb; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
        <div style="background: linear-gradient(135deg, #1E1B4B 0%, #5B21B6 50%, #2563EB 100%); padding: 28px 24px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px;">Perkfy Admin Alert</h1>
          <p style="color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 14px; font-weight: 500;">New Gift Card Withdrawal Request</p>
        </div>
        <div style="padding: 28px 24px;">
          <div style="background: #FEF3C7; border: 1px solid #F59E0B; border-radius: 12px; padding: 14px 18px; margin-bottom: 22px;">
            <p style="color: #92400E; margin: 0; font-size: 14px; font-weight: 700;">
              ⚡ Action Required: A customer has requested a voucher redemption.
            </p>
          </div>

          <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
            <tbody>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Voucher Brand:</td>
                <td style="padding: 10px 0; color: #111827; font-weight: 700; text-align: right;">${voucher_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Redemption Amount:</td>
                <td style="padding: 10px 0; color: #059669; font-weight: 800; font-size: 16px; text-align: right;">₹${rupee_value}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Points Deducted:</td>
                <td style="padding: 10px 0; color: #7C3AED; font-weight: 700; text-align: right;">${points} Points</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Customer Name:</td>
                <td style="padding: 10px 0; color: #111827; font-weight: 600; text-align: right;">${user_name}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Customer Email:</td>
                <td style="padding: 10px 0; color: #2563EB; font-weight: 600; text-align: right;">${user_email}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Customer Mobile:</td>
                <td style="padding: 10px 0; color: #111827; font-weight: 600; text-align: right;">${user_mobile}</td>
              </tr>
              <tr style="border-bottom: 1px solid #F3F4F6;">
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Reference ID:</td>
                <td style="padding: 10px 0; color: #374151; font-family: monospace; font-weight: 700; text-align: right;">${reference_id}</td>
              </tr>
              <tr>
                <td style="padding: 10px 0; color: #6B7280; font-weight: 600;">Requested At (IST):</td>
                <td style="padding: 10px 0; color: #6B7280; text-align: right;">${created_at}</td>
              </tr>
            </tbody>
          </table>

          <div style="margin-top: 24px; text-align: center;">
            <p style="color: #6B7280; font-size: 13px; margin: 0 0 8px 0;">Please log into the Admin Panel to review and fulfill this voucher with a valid code or voucher image.</p>
          </div>
        </div>
        <div style="background: #F9FAFB; border-top: 1px solid #E5E7EB; padding: 16px 24px; text-align: center;">
          <p style="color: #9CA3AF; font-size: 12px; margin: 0;">This is an automated operational alert sent to configured admin emails.</p>
        </div>
      </div>
    `
  };

  const transporter = getTransporter();
  if (!transporter) {
    console.log(`[DEV WITHDRAWAL ALERT] Alert to ${emailList.join(', ')} for ₹${rupee_value} ${voucher_name} (${reference_id})`);
    return { success: true, simulated: true };
  }

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`[SMTP] Admin withdrawal alert email sent to ${emailList.join(', ')}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`[SMTP ERROR] Failed to send admin withdrawal alert to ${emailList.join(', ')}:`, error.message);
    return { success: false, error: error.message };
  }
}
