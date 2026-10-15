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
  Alert
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
  Gift
} from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
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

  // Countdown timer for OTP
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (regStep === 'otp' && regCountdown > 0) {
      timer = setInterval(() => setRegCountdown((prev) => prev - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [regStep, regCountdown]);

  const handleLogin = async () => {
    if (!emailOrMobile.trim() || !loginPassword) {
      setErrorMsg('Please enter your email/mobile and password');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const res = await login(emailOrMobile.trim(), loginPassword);
    setLoading(false);

    if (!res.success) {
      setErrorMsg(res.message || 'Login failed');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const handleSendRegOtp = async () => {
    if (!regName.trim() || !regEmail.trim() || !regPassword) {
      setErrorMsg('Please complete all required fields');
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setErrorMsg('Passwords do not match');
      return;
    }

    setErrorMsg('');
    setLoading(true);
    try {
      const res = await api.post('/auth/send-otp', {
        email: regEmail.trim(),
        name: regName.trim(),
      });
      if (res.data?.success) {
        setRegStep('otp');
        setRegCountdown(60);
      } else {
        // If OTP service is disabled on backend, proceed to register directly
        await handleCompleteRegistration();
      }
    } catch (e) {
      // Backend direct registration fallback
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
      referral_code: regReferralCode.trim(),
      otp: regOtp.trim(),
    });

    setLoading(false);
    if (!res.success) {
      setErrorMsg(res.message || 'Registration failed');
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
      const res = await googleLogin(googleRes.idToken || '', googleRes.user);
      if (!res.success) {
        setErrorMsg(res.message || 'Google authentication failed on server');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Google Sign-In error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Brand Header */}
        <View style={styles.header}>
          <LinearGradient colors={['#5B21B6', '#7C3AED']} style={styles.logoBadge}>
            <Text style={styles.logoBadgeText}>P</Text>
          </LinearGradient>
          <Text style={styles.brandTitle}>
            Perk<Text style={{ color: COLORS.primaryGreen }}>fy</Text>
          </Text>
          <Text style={styles.tagline}>Earn Daily Cashback & Rewards</Text>
        </View>

        {/* Tab Switcher */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'login' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('login');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'login' && styles.tabTextActive]}>
              Log In
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabBtn, activeTab === 'register' && styles.tabBtnActive]}
            onPress={() => {
              setActiveTab('register');
              setErrorMsg('');
            }}
          >
            <Text style={[styles.tabText, activeTab === 'register' && styles.tabTextActive]}>
              Sign Up (+100 Pts)
            </Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* LOGIN TAB */}
        {activeTab === 'login' && (
          <View style={styles.formCard}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email or Mobile Number</Text>
              <View style={styles.inputWrapper}>
                <Mail size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="name@email.com or 10-digit mobile"
                  placeholderTextColor="#94A3B8"
                  value={emailOrMobile}
                  onChangeText={setEmailOrMobile}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.inputWrapper}>
                <Lock size={18} color="#94A3B8" />
                <TextInput
                  style={styles.input}
                  placeholder="••••••••"
                  placeholderTextColor="#94A3B8"
                  value={loginPassword}
                  onChangeText={setLoginPassword}
                  secureTextEntry={!showLoginPassword}
                />
                <TouchableOpacity onPress={() => setShowLoginPassword(!showLoginPassword)}>
                  {showLoginPassword ? (
                    <EyeOff size={18} color="#94A3B8" />
                  ) : (
                    <Eye size={18} color="#94A3B8" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleLogin}
              disabled={loading}
              activeOpacity={0.85}
              style={{ width: '100%', marginTop: 8 }}
            >
              <LinearGradient
                colors={['#5B21B6', '#7C3AED']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitBtn}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <Text style={styles.submitBtnText}>Sign In to Perkfy</Text>
                )}
              </LinearGradient>
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

        {/* REGISTER TAB */}
        {activeTab === 'register' && (
          <View style={styles.formCard}>
            {regStep === 'form' ? (
              <>
                <View style={styles.welcomeBanner}>
                  <Gift size={20} color="#16A34A" />
                  <Text style={styles.welcomeBannerText}>
                    Sign up now & get <Text style={{ fontWeight: '800' }}>100 Welcome Points</Text>!
                  </Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Full Name</Text>
                  <View style={styles.inputWrapper}>
                    <UserIcon size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="John Doe"
                      placeholderTextColor="#94A3B8"
                      value={regName}
                      onChangeText={setRegName}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Email Address</Text>
                  <View style={styles.inputWrapper}>
                    <Mail size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="john@example.com"
                      placeholderTextColor="#94A3B8"
                      value={regEmail}
                      onChangeText={setRegEmail}
                      keyboardType="email-address"
                      autoCapitalize="none"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Mobile (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Phone size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="10-digit number"
                      placeholderTextColor="#94A3B8"
                      value={regMobile}
                      onChangeText={setRegMobile}
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Create password"
                      placeholderTextColor="#94A3B8"
                      value={regPassword}
                      onChangeText={setRegPassword}
                      secureTextEntry={!showRegPassword}
                    />
                    <TouchableOpacity onPress={() => setShowRegPassword(!showRegPassword)}>
                      {showRegPassword ? (
                        <EyeOff size={18} color="#94A3B8" />
                      ) : (
                        <Eye size={18} color="#94A3B8" />
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Confirm Password</Text>
                  <View style={styles.inputWrapper}>
                    <Lock size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Repeat password"
                      placeholderTextColor="#94A3B8"
                      value={regConfirmPassword}
                      onChangeText={setRegConfirmPassword}
                      secureTextEntry={!showRegPassword}
                    />
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Referral Code (Optional)</Text>
                  <View style={styles.inputWrapper}>
                    <Sparkles size={18} color="#94A3B8" />
                    <TextInput
                      style={styles.input}
                      placeholder="Enter invite code"
                      placeholderTextColor="#94A3B8"
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
                  style={{ width: '100%', marginTop: 8 }}
                >
                  <LinearGradient
                    colors={['#16A34A', '#15803D']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.submitBtn}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Create Account (+100 Pts)</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </>
            ) : (
              // OTP STEP
              <View style={{ alignItems: 'center', gap: 14 }}>
                <Text style={styles.otpTitle}>Verify Your Email</Text>
                <Text style={styles.otpDesc}>
                  We sent a 6-digit verification code to{' '}
                  <Text style={{ fontWeight: '700', color: '#1E1B4B' }}>{regEmail}</Text>
                </Text>

                <View style={[styles.inputWrapper, { width: '100%', justifyContent: 'center' }]}>
                  <TextInput
                    style={[styles.input, { textAlign: 'center', letterSpacing: 8, fontSize: 20 }]}
                    placeholder="••••••"
                    value={regOtp}
                    onChangeText={setRegOtp}
                    keyboardType="number-pad"
                    maxLength={6}
                  />
                </View>

                <Text style={styles.timerText}>
                  {regCountdown > 0 ? `Resend code in ${regCountdown}s` : 'Did not receive code?'}
                </Text>

                <TouchableOpacity
                  onPress={handleCompleteRegistration}
                  disabled={loading || regOtp.length < 4}
                  style={{ width: '100%' }}
                >
                  <LinearGradient
                    colors={['#5B21B6', '#7C3AED']}
                    style={styles.submitBtn}
                  >
                    {loading ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <Text style={styles.submitBtnText}>Verify & Complete Sign Up</Text>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => setRegStep('form')}>
                  <Text style={styles.backLink}>← Edit Details</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {/* Footer Features */}
        <View style={styles.trustRow}>
          <View style={styles.trustItem}>
            <ShieldCheck size={16} color="#7C3AED" />
            <Text style={styles.trustText}>256-Bit Secure</Text>
          </View>
          <View style={styles.trustItem}>
            <Zap size={16} color="#16A34A" />
            <Text style={styles.trustText}>Instant Rewards</Text>
          </View>
          <View style={styles.trustItem}>
            <Gift size={16} color="#F59E0B" />
            <Text style={styles.trustText}>Daily Attendance</Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    padding: 20,
    paddingTop: 50,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    elevation: 4,
    shadowColor: '#5B21B6',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  logoBadgeText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 28,
  },
  brandTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: '#1E1B4B',
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
    marginTop: 2,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderRadius: 10,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
  tabText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#1E1B4B',
  },
  errorBox: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  welcomeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#DCFCE7',
    padding: 10,
    borderRadius: 12,
    gap: 8,
    marginBottom: 14,
  },
  welcomeBannerText: {
    color: '#15803D',
    fontSize: 12,
    flex: 1,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 10,
  },
  input: {
    flex: 1,
    color: '#1E293B',
    fontSize: 14,
  },
  submitBtn: {
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E2E8F0',
  },
  dividerText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  googleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 12,
    gap: 10,
  },
  googleG: {
    fontSize: 18,
    fontWeight: '900',
    color: '#4285F4',
  },
  googleBtnText: {
    color: '#1E293B',
    fontSize: 14,
    fontWeight: '700',
  },
  otpTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  otpDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  timerText: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  backLink: {
    color: '#7C3AED',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 6,
  },
  trustRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 24,
    paddingHorizontal: 8,
  },
  trustItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trustText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});
