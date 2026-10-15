import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal
} from 'react-native';
import {
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Eye,
  EyeOff,
  Sparkles,
  ShieldCheck,
  Zap,
  Gift,
  CheckCircle2,
  AlertCircle,
  X
} from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme';
import api from '../services/api';
import { promptGoogleBrowserSignIn } from '../services/googleAuth';

export default function LoginScreen() {
  const { login, registerUser, googleLogin } = useAuth();

  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Login form
  const [emailOrMobile, setEmailOrMobile] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register form
  const [regStep, setRegStep] = useState<'form' | 'otp'>('form');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regMobile, setRegMobile] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [regReferralCode, setRegReferralCode] = useState('');
  const [regOtp, setRegOtp] = useState('');
  const [regCountdown, setRegCountdown] = useState(60);
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Forgot password modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotStep, setForgotStep] = useState<1 | 2>(1);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [forgotNewPassword, setForgotNewPassword] = useState('');
  const [forgotConfirmPassword, setForgotConfirmPassword] = useState('');
  const [showForgotNewPassword, setShowForgotNewPassword] = useState(false);
  const [showForgotConfirmPassword, setShowForgotConfirmPassword] = useState(false);
  const [forgotCountdown, setForgotCountdown] = useState(60);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === 'otp' && regCountdown > 0) {
      timer = setInterval(() => setRegCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, regCountdown]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (forgotStep === 2 && forgotCountdown > 0) {
      timer = setInterval(() => setForgotCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [forgotStep, forgotCountdown]);

  const handleLogin = async () => {
    if (!emailOrMobile.trim() || !loginPassword) {
      setErrorMsg('Please enter your mobile number or email and password.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = await login(emailOrMobile.trim(), loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Login failed. Please verify your credentials.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSendRegOtp = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields.');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match. Please verify.');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-signup-otp', {
        email: regEmail.trim(),
        name: regName.trim(),
      });
      if (res.data?.success) {
        setRegStep('otp');
        setRegCountdown(60);
        setSuccessMsg(`Verification code sent to ${regEmail.trim()}`);
      } else {
        await handleCompleteRegistration();
      }
    } catch (e) {
      // Fallback direct register if SMTP is not configured
      await handleCompleteRegistration();
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteRegistration = async () => {
    setLoading(true);
    setErrorMsg('');

    const res = await registerUser({
      name: regName.trim(),
      email: regEmail.trim(),
      mobile: regMobile.trim(),
      password: regPassword,
      referral_code: regReferralCode.trim() || undefined,
      otp: regOtp.trim() || undefined,
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed. Please check your details.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setErrorMsg('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const googleRes = await promptGoogleBrowserSignIn();
      if (!googleRes.success) {
        if (googleRes.error && !googleRes.error.includes('cancelled')) {
          setErrorMsg(googleRes.error);
        }
        setLoading(false);
        return;
      }

      // Send Google credential/user info to backend /api/v1/auth/google
      const res = await googleLogin(googleRes.accessToken || googleRes.idToken || '', googleRes.user);
      if (!res.success) {
        setErrorMsg(res.message || 'Google authentication failed on server');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Google Sign-In error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendForgotOtp = async () => {
    if (!forgotEmail.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      const res = await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      if (res.data?.success) {
        setForgotStep(2);
        setForgotCountdown(60);
        setForgotMsg(`Reset code sent to ${forgotEmail.trim()}`);
      } else {
        setForgotError(res.data?.message || 'Unable to send reset code.');
      }
    } catch (e: any) {
      setForgotError(e.response?.data?.message || 'Failed to send reset code.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResendForgotOtp = async () => {
    if (forgotCountdown > 0 || forgotLoading) return;
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      await api.post('/auth/forgot-password', { email: forgotEmail.trim() });
      setForgotCountdown(60);
      setForgotMsg(`A new reset OTP has been sent to ${forgotEmail.trim()}`);
    } catch (err: any) {
      setForgotError('Failed to resend OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!forgotOtp || forgotOtp.trim().length < 6) {
      setForgotError('Please enter the 6-digit verification code.');
      return;
    }
    if (!forgotNewPassword || forgotNewPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (forgotNewPassword !== forgotConfirmPassword) {
      setForgotError('New passwords do not match. Please verify.');
      return;
    }
    setForgotLoading(true);
    setForgotError('');
    setForgotMsg('');
    try {
      const res = await api.post('/auth/reset-password', {
        email: forgotEmail.trim(),
        otp: forgotOtp.trim(),
        newPassword: forgotNewPassword,
      });
      if (res.data?.success) {
        setShowForgotModal(false);
        setForgotStep(1);
        setForgotOtp('');
        setForgotNewPassword('');
        setForgotConfirmPassword('');
        if (res.data.token && res.data.user) {
          await login(res.data.token, res.data.user);
        } else {
          setSuccessMsg('Password reset successfully! Please log in with your new password.');
        }
      } else {
        setForgotError(res.data?.message || 'Password reset failed.');
      }
    } catch (e: any) {
      setForgotError(e.response?.data?.message || 'Failed to reset password. Please check your OTP.');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.screenContainer}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Brand Header with Real Logo */}
        <View style={styles.header}>
          <Image
            source={require('../../assets/icon.png')}
            style={styles.logoImage}
            resizeMode="cover"
          />
          <Text style={styles.brandTitle}>
            Perk<Text style={{ color: COLORS.primaryGreen }}>fy</Text>
          </Text>
          <Text style={styles.welcomeHeading}>
            {activeTab === 'login' ? 'Welcome Back! 👋' : 'Create Free Account 🎉'}
          </Text>
          <Text style={styles.welcomeSub}>
            {activeTab === 'login'
              ? 'Secure access to your daily rewards & perks.'
              : 'Get 100 Free Welcome Points upon verification.'}
          </Text>
        </View>

        {/* Tab Switcher matching web (#F4F3F8 container, #2563EB active) */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('login');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            <UserIcon size={16} color={activeTab === 'login' ? '#FFFFFF' : '#4B5563'} />
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
              Login
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'register' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('register');
              setErrorMsg('');
              setSuccessMsg('');
            }}
          >
            <UserIcon size={16} color={activeTab === 'register' ? '#FFFFFF' : '#4B5563'} />
            <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
              Register
            </Text>
          </TouchableOpacity>
        </View>

        {/* Success Alert Box */}
        {successMsg ? (
          <View style={styles.successBox}>
            <CheckCircle2 size={16} color="#10B981" />
            <Text style={styles.successText}>{successMsg}</Text>
          </View>
        ) : null}

        {/* Error Alert Box */}
        {errorMsg ? (
          <View style={styles.errorBox}>
            <AlertCircle size={16} color="#DC2626" />
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* LOGIN FORM */}
        {activeTab === 'login' && (
          <View style={styles.formSection}>
            <View style={styles.fieldGroup}>
              <Text style={styles.fieldLabel}>Mobile Number or Email</Text>
              <View style={styles.inputWrapper}>
                <Phone size={18} color="#5B21B6" />
                <TextInput
                  style={styles.input}
                  placeholder="Enter mobile number or email"
                  placeholderTextColor="#9CA3AF"
                  value={emailOrMobile}
                  onChangeText={setEmailOrMobile}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.fieldGroup}>
              <View style={styles.labelRow}>
                <Text style={styles.fieldLabel}>Password</Text>
                <TouchableOpacity onPress={() => setShowForgotModal(true)}>
                  <Text style={styles.forgotPassText}>Forgot Password?</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#5B21B6" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#9CA3AF"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showLoginPassword}
                />
                <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)} style={styles.eyeBtn}>
                  {showLoginPassword ? (
                    <EyeOff size={18} color="#9CA3AF" />
                  ) : (
                    <Eye size={18} color="#9CA3AF" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={styles.primaryLoginBtn}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryBtnText}>Sign In to Perkfy</Text>
              )}
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.dividerLine} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.dividerLine} />
            </View>

            {/* Google Sign-In Button */}
            <TouchableOpacity
              onPress={handleGoogleSignIn}
              disabled={loading}
              style={styles.googleBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.googleG}>G</Text>
              <Text style={styles.googleBtnText}>Continue with Google</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* REGISTER FORM */}
        {activeTab === 'register' && (
          <View style={styles.formSection}>
            {regStep === 'form' ? (
              <>
                <View style={styles.welcomeRewardBanner}>
                  <Gift size={20} color="#16A34A" />
                  <Text style={styles.rewardBannerText}>
                    Sign up now & get <Text style={{ fontWeight: '800' }}>100 Welcome Points</Text>!
                  </Text>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={18} color="#5B21B6" />
                    <TextInput
                      style={styles.input}
                      placeholder="Gourav"
                      placeholderTextColor="#9CA3AF"
                      value={regName}
                      onChangeText={setRegName}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#5B21B6" />
                    <TextInput
                      style={styles.input}
                      placeholder="user@gmail.com"
                      placeholderTextColor="#9CA3AF"
                      value={regEmail}
                      onChangeText={setRegEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Mobile (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={18} color="#5B21B6" />
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit mobile number"
                      placeholderTextColor="#9CA3AF"
                      value={regMobile}
                      onChangeText={setRegMobile}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#5B21B6" />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••"
                      placeholderTextColor="#9CA3AF"
                      value={regPassword}
                      onChangeText={setRegPassword}
                      secureTextEntry={!showRegPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRegPassword(!showRegPassword)} style={styles.eyeBtn}>
                      {showRegPassword ? (
                        <EyeOff size={18} color="#9CA3AF" />
                      ) : (
                        <Eye size={18} color="#9CA3AF" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#5B21B6" />
                    <TextInput
                      style={styles.input}
                      placeholder="••••••"
                      placeholderTextColor="#9CA3AF"
                      value={regConfirmPassword}
                      onChangeText={setRegConfirmPassword}
                      secureTextEntry={!showRegPassword}
                    />
                  </View>
                </View>

                <View style={styles.fieldGroup}>
                  <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Sparkles size={18} color="#5B21B6" />
                    <TextInput
                      style={styles.input}
                      placeholder="PKF-XXXXX"
                      placeholderTextColor="#9CA3AF"
                      value={regReferralCode}
                      onChangeText={setRegReferralCode}
                      autoCapitalize="characters"
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={handleSendRegOtp}
                  disabled={loading}
                  activeOpacity={0.85}
                  style={styles.createAccountBtn}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Create Account (+100 Pts)</Text>
                  )}
                </TouchableOpacity>
              </>
            ) : (
              // OTP VERIFICATION STEP
              <View style={styles.otpSection}>
                <Text style={styles.otpHeading}>Verify Your Email</Text>
                <Text style={styles.otpDescription}>
                  Enter the 6-digit code sent to{' '}
                  <Text style={{ fontWeight: '700', color: '#1E1B4B' }}>{regEmail}</Text>
                </Text>

                <View style={[styles.inputWrapper, { justifyContent: 'center' }]}>
                  <TextInput
                    style={[styles.input, styles.otpInput]}
                    placeholder="••••••"
                    value={regOtp}
                    onChangeText={setRegOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <Text style={styles.resendText}>
                  {regCountdown > 0 ? `Resend code in ${regCountdown}s` : 'Did not receive code?'}
                </Text>

                <TouchableOpacity
                  onPress={handleCompleteRegistration}
                  disabled={loading}
                  style={styles.primaryLoginBtn}
                >
                  {loading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Verify & Complete Sign Up</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setRegStep('form')}>
                  <Text style={styles.backLinkText}>← Edit Registration Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Trust Badges matching website footer */}
        <View style={styles.trustBadgesRow}>
          <View style={styles.trustBadgeItem}>
            <ShieldCheck size={16} color="#7C3AED" />
            <Text style={styles.trustBadgeText}>256-Bit Secure</Text>
          </View>
          <View style={styles.trustBadgeItem}>
            <Zap size={16} color="#16A34A" />
            <Text style={styles.trustBadgeText}>Instant Rewards</Text>
          </View>
          <View style={styles.trustBadgeItem}>
            <Gift size={16} color="#F59E0B" />
            <Text style={styles.trustBadgeText}>Daily Attendance</Text>
          </View>
        </View>
      </ScrollView>

      {/* Forgot Password Modal */}
      <Modal visible={showForgotModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.forgotCard}>
            <View style={styles.forgotHeader}>
              <Text style={styles.forgotTitle}>
                {forgotStep === 1 ? 'Reset Password' : 'Enter Verification Code'}
              </Text>
              <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                <X size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {forgotMsg ? (
              <View style={styles.successBox}>
                <CheckCircle2 size={15} color="#10B981" />
                <Text style={styles.successText}>{forgotMsg}</Text>
              </View>
            ) : null}

            {forgotError ? (
              <View style={styles.errorBox}>
                <AlertCircle size={15} color="#DC2626" />
                <Text style={styles.errorText}>{forgotError}</Text>
              </View>
            ) : null}

            {forgotStep === 1 ? (
              <View style={{ gap: 12 }}>
                <Text style={styles.forgotDesc}>
                  Enter your registered email address to receive a 6-digit password reset code.
                </Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="name@email.com"
                  placeholderTextColor="#9CA3AF"
                  value={forgotEmail}
                  onChangeText={(val) => {
                    setForgotEmail(val);
                    setForgotError('');
                  }}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  onPress={handleSendForgotOtp}
                  disabled={forgotLoading}
                  style={styles.modalSubmitBtn}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Send Reset Code</Text>
                  )}
                </TouchableOpacity>
              </View>
            ) : (
              <View style={{ gap: 10 }}>
                <Text style={styles.forgotDesc}>
                  We sent an OTP to <Text style={{ fontWeight: '700', color: '#1E1B4B' }}>{forgotEmail}</Text>
                </Text>

                {/* 6-Digit OTP */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: -4 }}>
                  6-Digit OTP Code
                </Text>
                <TextInput
                  style={[
                    styles.modalInput,
                    { textAlign: 'center', fontSize: 18, fontWeight: '800', letterSpacing: 4, color: '#4F46E5', borderColor: '#4F46E5' }
                  ]}
                  placeholder="123456"
                  placeholderTextColor="#A5B4FC"
                  value={forgotOtp}
                  onChangeText={(val) => {
                    setForgotOtp(val.replace(/[^0-9]/g, ''));
                    setForgotError('');
                  }}
                  keyboardType="number-pad"
                  maxLength={6}
                />

                {/* New Password */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: -4 }}>
                  New Password
                </Text>
                <View style={[styles.inputWrapper, { height: 44 }]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Min 6 characters"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showForgotNewPassword}
                    value={forgotNewPassword}
                    onChangeText={(val) => {
                      setForgotNewPassword(val);
                      setForgotError('');
                    }}
                  />
                  <TouchableOpacity onPress={() => setShowForgotNewPassword(!showForgotNewPassword)}>
                    {showForgotNewPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </TouchableOpacity>
                </View>

                {/* Confirm New Password */}
                <Text style={{ fontSize: 11, fontWeight: '700', color: '#4B5563', marginBottom: -4 }}>
                  Confirm New Password
                </Text>
                <View style={[styles.inputWrapper, { height: 44 }]}>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Re-enter new password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showForgotConfirmPassword}
                    value={forgotConfirmPassword}
                    onChangeText={(val) => {
                      setForgotConfirmPassword(val);
                      setForgotError('');
                    }}
                  />
                  <TouchableOpacity onPress={() => setShowForgotConfirmPassword(!showForgotConfirmPassword)}>
                    {showForgotConfirmPassword ? <EyeOff size={18} color="#64748B" /> : <Eye size={18} color="#64748B" />}
                  </TouchableOpacity>
                </View>

                {/* Links row */}
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 }}>
                  <TouchableOpacity onPress={() => setForgotStep(1)}>
                    <Text style={{ fontSize: 11, fontWeight: '700', color: '#6B7280' }}>← Change Email</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={handleResendForgotOtp}
                    disabled={forgotCountdown > 0 || forgotLoading}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '700', color: forgotCountdown > 0 ? '#9CA3AF' : '#4F46E5' }}>
                      {forgotCountdown > 0 ? `Resend in ${forgotCountdown}s` : 'Resend Code'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleResetPassword}
                  disabled={forgotLoading}
                  style={[styles.modalSubmitBtn, { backgroundColor: '#10B981' }]}
                >
                  {forgotLoading ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.primaryBtnText}>Reset Password & Login</Text>
                  )}
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 40,
    backgroundColor: '#FFFFFF',
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoImage: {
    width: 48,
    height: 48,
    borderRadius: 14,
    marginBottom: 8,
  },
  brandTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.5,
  },
  welcomeHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
    marginTop: 10,
  },
  welcomeSub: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 3,
    textAlign: 'center',
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#F4F3F8',
    borderRadius: 16,
    padding: 4,
    marginBottom: 20,
  },
  tabBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
  },
  tabBtnActive: {
    backgroundColor: '#2563EB',
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#4B5563',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  successBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#10B981',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  successText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#DC2626',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
  },
  errorText: {
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  formSection: {
    width: '100%',
    gap: 14,
  },
  fieldGroup: {
    gap: 6,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4B5563',
  },
  forgotPassText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#2563EB',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F7FC',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1E1B4B',
  },
  eyeBtn: {
    padding: 4,
  },
  primaryLoginBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#2563EB',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    marginTop: 4,
  },
  createAccountBtn: {
    backgroundColor: '#16A34A',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#16A34A',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    marginTop: 4,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  dividerText: {
    color: '#9CA3AF',
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 10,
    elevation: 1,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    color: '#1E1B4B',
    fontSize: 14,
    fontWeight: '700',
  },
  welcomeRewardBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 4,
  },
  rewardBannerText: {
    color: '#15803D',
    fontSize: 12,
    flex: 1,
  },
  otpSection: {
    alignItems: 'center',
    gap: 14,
  },
  otpHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  otpDescription: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
  otpInput: {
    textAlign: 'center',
    letterSpacing: 8,
    fontSize: 20,
    fontWeight: '800',
  },
  resendText: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '600',
  },
  backLinkText: {
    color: '#2563EB',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  trustBadgesRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 26,
    paddingHorizontal: 8,
  },
  trustBadgeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    padding: 20,
  },
  forgotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
  },
  forgotHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  forgotTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  forgotDesc: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 18,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
    backgroundColor: '#F8F7FC',
    fontSize: 13,
    color: '#1E1B4B',
  },
  modalSubmitBtn: {
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  errorTextSmall: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
});
