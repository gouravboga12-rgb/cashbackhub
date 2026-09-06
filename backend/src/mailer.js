const nodemailer = require('nodemailer');

const SMTP_HOST = process.env.SMTP_HOST || 'smtp.gmail.com';
const SMTP_PORT = parseInt(process.env.SMTP_PORT || '587', 10);
const SMTP_USER = process.env.SMTP_USER || 'chvs2026@gmail.com';
const SMTP_PASSWORD = process.env.SMTP_PASSWORD || 'rqbvbjkppvbaikf';
const SMTP_FROM = process.env.SMTP_FROM || 'Perkfy <chvs2026@gmail.com>';

let transporter = null;

try {
  transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_PORT === 465, // true for 465, false for other ports
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD.replace(/\s+/g, '') // remove spaces from Gmail app password
    },
    tls: {
      rejectUnauthorized: false
    }
  });
} catch (err) {
  console.warn('Failed to initialize nodemailer transporter:', err.message);
}

/**
 * Send Sign Up OTP Verification Email
 */
async function sendSignUpOtpEmail(toEmail, otp, userName = 'User') {
  const mailOptions = {
    from: SMTP_FROM,
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
            Hi <strong>${userName}</strong>, thanks for creating an account on Perkfy! Use the 6-digit verification code below to complete your registration and claim your <strong>100 Welcome Bonus Points</strong>:
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
  const mailOptions = {
    from: SMTP_FROM,
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
  sendPasswordResetOtpEmail
};
