import React, { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { ShieldCheck, Phone, User as UserIcon, Tag, AlertCircle, ArrowRight, LogOut } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import api from '../services/api';

interface CompleteProfileModalProps {
  visible: boolean;
  user: any;
  onSuccess: (updatedUser: any) => void;
  onLogout: () => void;
}

export default function CompleteProfileModal({
  visible,
  user,
  onSuccess,
  onLogout,
}: CompleteProfileModalProps) {
  const [name, setName] = useState(user?.name || '');
  const [mobile, setMobile] = useState('');
  const [referralCode, setReferralCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async () => {
    setErrorMsg('');
    const cleanMobile = mobile.replace(/\D/g, '');

    if (!cleanMobile || cleanMobile.length !== 10) {
      setErrorMsg('Please enter a valid 10-digit mobile number.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      return;
    }

    setLoading(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    try {
      const res = await api.post('/auth/complete-profile', {
        mobile: cleanMobile,
        name: name.trim() || user?.name || 'User',
        referral_code: referralCode.trim() || undefined,
      });

      if (res.data?.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        onSuccess(res.data.user);
      } else {
        setErrorMsg(res.data?.message || 'Could not complete profile. Please retry.');
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        'Unable to link mobile number. Please check your network and try again.';
      setErrorMsg(msg);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <View style={styles.modalCard}>
            {/* Header Icon */}
            <View style={styles.headerIconCircle}>
              <ShieldCheck size={32} color="#7C3AED" />
            </View>

            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              To ensure fair play and verify reward withdrawals, please link your unique mobile number to your Perkfy account.
            </Text>

            {/* Fair play policy notice */}
            <View style={styles.policyBadge}>
              <Text style={styles.policyText}>
                ⚠️ <Text style={{ fontWeight: '800' }}>Policy:</Text> 1 Phone Number = 1 Account Only.
              </Text>
            </View>

            {errorMsg ? (
              <View style={styles.errorBox}>
                <AlertCircle size={16} color="#DC2626" />
                <Text style={styles.errorText}>{errorMsg}</Text>
              </View>
            ) : null}

            <ScrollView showsVerticalScrollIndicator={false} style={{ width: '100%' }}>
              {/* Name Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Full Name</Text>
                <View style={styles.inputWrapper}>
                  <UserIcon size={18} color="#7C3AED" />
                  <TextInput
                    style={styles.input}
                    placeholder="Your Name"
                    placeholderTextColor="#9CA3AF"
                    value={name}
                    onChangeText={setName}
                  />
                </View>
              </View>

              {/* Mobile Number Field */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Mobile Number (Mandatory) *</Text>
                <View style={styles.inputWrapper}>
                  <Phone size={18} color="#7C3AED" />
                  <Text style={styles.countryCode}>+91</Text>
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="10-digit mobile number"
                    placeholderTextColor="#9CA3AF"
                    value={mobile}
                    onChangeText={setMobile}
                    keyboardType="phone-pad"
                    maxLength={10}
                  />
                </View>
                <Text style={styles.helperText}>Used for reward OTPs & account recovery.</Text>
              </View>

              {/* Referral Code (Optional) */}
              <View style={styles.fieldGroup}>
                <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
                <View style={styles.inputWrapper}>
                  <Tag size={18} color="#7C3AED" />
                  <TextInput
                    style={styles.input}
                    placeholder="e.g. PKF-ABC12"
                    placeholderTextColor="#9CA3AF"
                    value={referralCode}
                    onChangeText={setReferralCode}
                    autoCapitalize="characters"
                  />
                </View>
              </View>
            </ScrollView>

            {/* Actions */}
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.88}
              style={[styles.submitBtn, loading && { opacity: 0.7 }]}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <View style={styles.btnRow}>
                  <Text style={styles.submitBtnText}>Save & Unlock App</Text>
                  <ArrowRight size={18} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onLogout}
              disabled={loading}
              style={styles.logoutBtn}
            >
              <LogOut size={14} color="#6B7280" />
              <Text style={styles.logoutBtnText}>Switch / Log Out</Text>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 400,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    width: '100%',
  },
  headerIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#EDE9FE',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1E1B4B',
    marginBottom: 6,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 13,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 14,
    paddingHorizontal: 8,
  },
  policyBadge: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 16,
  },
  policyText: {
    color: '#991B1B',
    fontSize: 12,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    width: '100%',
    marginBottom: 12,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  fieldGroup: {
    width: '100%',
    marginBottom: 12,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#374151',
    marginBottom: 5,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    gap: 8,
  },
  countryCode: {
    fontSize: 14,
    fontWeight: '700',
    color: '#4B5563',
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: '#1F2937',
    paddingVertical: 0,
  },
  helperText: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  submitBtn: {
    backgroundColor: '#7C3AED',
    borderRadius: 14,
    height: 48,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    shadowColor: '#7C3AED',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  btnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 14,
    padding: 6,
  },
  logoutBtnText: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
  },
});
