import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import SpinWheel from '../components/SpinWheel';
import { showInAppNotification } from '../services/notificationService';

export default function SpinWinScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();
  const insets = useSafeAreaInsets();
  const topPadding = Platform.OS === 'ios' ? Math.max(insets.top, 12) : (insets.top > 24 ? insets.top + 4 : 10);

  const [slices, setSlices] = useState([
    { id: '1', label: '1000 Pts', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Pts', reward_points: 500, color: '#22C55E' },
    { id: '3', label: '200 Pts', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Pts', reward_points: 50, color: '#4ADE80' },
    { id: '5', label: '100 Pts', reward_points: 100, color: '#6D28D9' },
    { id: '6', label: 'Try Again', reward_points: 0, color: '#EC4899' },
  ]);

  const [spinsAvailable, setSpinsAvailable] = useState(10);
  const [dailyLimit, setDailyLimit] = useState(10);
  const [costPerSpin, setCostPerSpin] = useState(10);

  useEffect(() => {
    fetchSpinConfig();
  }, []);

  const fetchSpinConfig = async () => {
    try {
      const res = await api.get('/spin/config');
      if (res.data?.success) {
        if (Array.isArray(res.data.slices) && res.data.slices.length > 0) {
          setSlices(res.data.slices);
        }
        if (res.data.spins_available_today !== undefined) {
          setSpinsAvailable(res.data.spins_available_today);
        }
        if (res.data.daily_limit !== undefined) {
          setDailyLimit(res.data.daily_limit);
        }
        if (res.data.cost_per_spin !== undefined) {
          setCostPerSpin(res.data.cost_per_spin);
        }
      }
    } catch (e) {
      console.warn('Spin config offline, using defaults');
    }
  };

  const handleSpinPlay = async () => {
    try {
      if (wallet && typeof wallet.available_points === 'number') {
        wallet.available_points = Math.max(0, wallet.available_points - costPerSpin);
      }
      const res = await api.post('/spin/play');
      if (res.data?.success) {
        if (typeof res.data.spins_remaining === 'number') {
          setSpinsAvailable(res.data.spins_remaining);
        } else {
          setSpinsAvailable((prev) => Math.max(0, prev - 1));
        }
        return {
          targetIndex: typeof res.data.targetIndex === 'number' ? res.data.targetIndex : 0,
          reward_points: res.data.reward_points ?? 0,
          cost_points: res.data.cost_points ?? costPerSpin,
          message: res.data.message,
          wallet: res.data.wallet,
        };
      }
    } catch (e: any) {
      if (e.response?.data?.message) {
        showInAppNotification('Spin Error', e.response.data.message, 'error');
      }
    }
    return {
      targetIndex: 0,
      reward_points: 0,
      cost_points: costPerSpin,
      message: 'Better luck next time!',
    };
  };

  const handleClaimReward = async (spinData: any) => {
    await refreshWallet();
    if (spinData?.reward_points > 0) {
      showInAppNotification('Points Claimed! 🎉', `+${spinData.reward_points} Points credited to your wallet!`);
    }
  };

  const availablePoints = wallet?.available_points ?? 0;

  return (
    <View style={styles.container}>
      {/* Top Header */}
      <View style={[styles.header, { paddingTop: topPadding }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E1B4B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🎡 Lucky Spin & Win</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{availablePoints.toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Banner Card - 1:1 with Web */}
        <LinearGradient
          colors={['#4C1D95', '#5B21B6', '#6D28D9']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.bannerCard}
        >
          <Text style={styles.bannerHeading}>🎡 Spin & Win Lucky Wheel</Text>
          <Text style={styles.bannerSubtext}>
            Test your luck up to <Text style={styles.boldText}>{dailyLimit} times daily</Text>! Each spin costs {costPerSpin} Points. Win up to 1,000 Points instantly credited to your wallet.
          </Text>
        </LinearGradient>

        {/* Wheel Container Card */}
        <View style={styles.wheelCard}>
          <SpinWheel
            slices={slices}
            spinsAvailable={spinsAvailable}
            dailyLimit={dailyLimit}
            costPerSpin={costPerSpin}
            userPoints={availablePoints}
            onSpin={handleSpinPlay}
            onClaim={handleClaimReward}
            onNavigateToAds={() => navigation.navigate('PlayDice')}
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#EDE9FE',
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  balancePill: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  balanceText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#6D28D9',
  },
  scroll: {
    padding: 16,
    paddingBottom: 40,
    gap: 16,
    alignItems: 'center',
  },
  bannerCard: {
    width: '100%',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    textAlign: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.25,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  bannerHeading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '900',
    marginBottom: 6,
    textAlign: 'center',
  },
  bannerSubtext: {
    color: '#E9D5FF',
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
  boldText: {
    fontWeight: '900',
    color: '#FFFFFF',
  },
  wheelCard: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 26,
    paddingVertical: 24,
    paddingHorizontal: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#EDE9FE',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.08,
        shadowRadius: 18,
      },
      android: {
        elevation: 4,
      },
    }),
  },
});
