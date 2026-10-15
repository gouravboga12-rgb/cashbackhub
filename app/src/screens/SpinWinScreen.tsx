import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
  ActivityIndicator
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Sparkles, Trophy, Disc, ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification, triggerPushNotification } from '../services/notificationService';
import { COLORS } from '../theme';

const { width } = Dimensions.get('window');
const WHEEL_SIZE = width * 0.82;
const RADIUS = WHEEL_SIZE / 2;

export default function SpinWinScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();

  const [slices, setSlices] = useState([
    { id: '1', label: '1000 Pts', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Pts', reward_points: 500, color: '#22C55E' },
    { id: '3', label: '200 Pts', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Pts', reward_points: 50, color: '#4ADE80' },
    { id: '5', label: '100 Pts', reward_points: 100, color: '#6D28D9' },
    { id: '6', label: 'Try Again', reward_points: 0, color: '#EC4899' },
  ]);

  const [spinsAvailable, setSpinsAvailable] = useState(10);
  const [costPerSpin, setCostPerSpin] = useState(10);
  const [isSpinning, setIsSpinning] = useState(false);
  const [resultModal, setResultModal] = useState<{ visible: boolean; points: number; message: string }>({
    visible: false,
    points: 0,
    message: '',
  });

  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentAngle = useRef(0);

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
        if (res.data.cost_per_spin !== undefined) {
          setCostPerSpin(res.data.cost_per_spin);
        }
      }
    } catch (e) {
      console.warn('Spin config offline, using defaults');
    }
  };

  const handleSpin = async () => {
    if (isSpinning) return;
    if (spinsAvailable <= 0) {
      showInAppNotification('Daily Limit Reached', 'You have used all daily spins! Come back tomorrow.', 'info');
      return;
    }

    setIsSpinning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    let targetIndex = Math.floor(Math.random() * slices.length);
    let wonPts = slices[targetIndex]?.reward_points || 0;

    try {
      const res = await api.post('/spin/play');
      if (res.data?.success) {
        if (typeof res.data.targetIndex === 'number') {
          targetIndex = res.data.targetIndex;
        }
        if (typeof res.data.reward_points === 'number') {
          wonPts = res.data.reward_points;
        }
        if (typeof res.data.spins_remaining === 'number') {
          setSpinsAvailable(res.data.spins_remaining);
        } else {
          setSpinsAvailable((prev) => Math.max(0, prev - 1));
        }
      } else {
        setSpinsAvailable((prev) => Math.max(0, prev - 1));
      }
    } catch (e) {
      setSpinsAvailable((prev) => Math.max(0, prev - 1));
    }

    const numSlices = slices.length;
    const sliceAngle = 360 / numSlices;
    // Angle to land pointer at top (-90 degrees)
    const extraRounds = 5 * 360;
    const stopAngle = extraRounds + (360 - (targetIndex * sliceAngle + sliceAngle / 2));
    const targetRotation = currentAngle.current + stopAngle;

    Animated.timing(spinAnim, {
      toValue: targetRotation,
      duration: 4000,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(async () => {
      currentAngle.current = targetRotation % 360;
      setIsSpinning(false);

      await refreshWallet();
      playNotificationAudio().catch(() => {});

      const msg = wonPts > 0 ? `🎉 Congratulations! You won +${wonPts} Points!` : 'Better luck next time!';
      setResultModal({
        visible: true,
        points: wonPts,
        message: msg,
      });

      if (wonPts > 0) {
        showInAppNotification('Spin & Win Victory! 🎯', `+${wonPts} points credited to your wallet!`);
        triggerPushNotification('Spin & Win Reward! 🎁', `You spun the wheel and won +${wonPts} Points!`);
      }
    });
  };

  const numSlices = slices.length;
  const sliceAngle = (2 * Math.PI) / numSlices;

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 360],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      {/* Top Bar */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Lucky Spin & Win</Text>
        <View style={styles.spinsBadge}>
          <Text style={styles.spinsBadgeText}>{spinsAvailable} left</Text>
        </View>
      </View>

      <View style={styles.content}>
        {/* Info Card */}
        <View style={styles.infoBanner}>
          <View style={styles.infoLeft}>
            <Trophy size={18} color="#F59E0B" />
            <Text style={styles.infoText}>Win up to 1,000 Points with every spin!</Text>
          </View>
          <Text style={styles.costText}>Cost: {costPerSpin} pts</Text>
        </View>

        {/* Wheel Container */}
        <View style={styles.wheelWrapper}>
          {/* Top Pointer */}
          <View style={styles.pointerTriangle} />

          <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
            <Svg width={WHEEL_SIZE} height={WHEEL_SIZE} viewBox={`0 0 ${WHEEL_SIZE} ${WHEEL_SIZE}`}>
              <G x={RADIUS} y={RADIUS}>
                {slices.map((slice, i) => {
                  const startAngle = i * sliceAngle - Math.PI / 2;
                  const endAngle = (i + 1) * sliceAngle - Math.PI / 2;
                  const x1 = RADIUS * Math.cos(startAngle);
                  const y1 = RADIUS * Math.sin(startAngle);
                  const x2 = RADIUS * Math.cos(endAngle);
                  const y2 = RADIUS * Math.sin(endAngle);
                  const path = `M 0 0 L ${x1} ${y1} A ${RADIUS} ${RADIUS} 0 0 1 ${x2} ${y2} Z`;

                  // Text angle
                  const textAngle = ((startAngle + endAngle) / 2) * (180 / Math.PI);
                  const textRadius = RADIUS * 0.65;
                  const tx = textRadius * Math.cos((startAngle + endAngle) / 2);
                  const ty = textRadius * Math.sin((startAngle + endAngle) / 2);

                  return (
                    <G key={slice.id || i}>
                      <Path d={path} fill={slice.color || (i % 2 === 0 ? '#5B21B6' : '#7C3AED')} />
                      <SvgText
                        x={tx}
                        y={ty}
                        fill="#FFFFFF"
                        fontSize="12"
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${textAngle + 90}, ${tx}, ${ty})`}
                      >
                        {slice.label || `${slice.reward_points} pts`}
                      </SvgText>
                    </G>
                  );
                })}
                {/* Center Hub */}
                <Circle cx={0} cy={0} r={28} fill="#1E1B4B" stroke="#FFFFFF" strokeWidth={3} />
              </G>
            </Svg>
          </Animated.View>
        </View>

        {/* Spin Action Button */}
        <TouchableOpacity
          onPress={handleSpin}
          disabled={isSpinning || spinsAvailable <= 0}
          activeOpacity={0.85}
          style={{ width: '100%', marginTop: 24 }}
        >
          <LinearGradient
            colors={
              spinsAvailable <= 0
                ? ['#94A3B8', '#64748B']
                : isSpinning
                ? ['#6D28D9', '#5B21B6']
                : ['#16A34A', '#15803D']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.spinBtn}
          >
            {isSpinning ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.spinBtnText}>
                {spinsAvailable <= 0 ? 'No Spins Left Today' : 'SPIN WHEEL NOW'}
              </Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.footnoteText}>
          Spins reset every day at midnight (IST) • 100% fair and server-verified
        </Text>
      </View>

      {/* Result Modal */}
      <Modal visible={resultModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <LinearGradient
              colors={resultModal.points > 0 ? ['#16A34A', '#15803D'] : ['#5B21B6', '#7C3AED']}
              style={styles.modalIconWrap}
            >
              {resultModal.points > 0 ? (
                <Trophy size={36} color="#FFFFFF" />
              ) : (
                <Sparkles size={36} color="#FFFFFF" />
              )}
            </LinearGradient>

            <Text style={styles.modalTitle}>
              {resultModal.points > 0 ? `+${resultModal.points} Points!` : 'Spin Completed'}
            </Text>
            <Text style={styles.modalDesc}>{resultModal.message}</Text>

            <TouchableOpacity
              onPress={() => setResultModal({ ...resultModal, visible: false })}
              style={styles.modalCloseBtn}
            >
              <Text style={styles.modalCloseText}>Collect & Continue</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#1E1B4B',
  },
  spinsBadge: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  spinsBadgeText: {
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 11,
  },
  content: {
    padding: 16,
    alignItems: 'center',
  },
  infoBanner: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF3C7',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  infoLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  infoText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#92400E',
  },
  costText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  wheelWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
    position: 'relative',
  },
  pointerTriangle: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
    width: 0,
    height: 0,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 22,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#EF4444',
  },
  spinBtn: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#16A34A',
    shadowOpacity: 0.35,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  spinBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  footnoteText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '500',
    textAlign: 'center',
    marginTop: 16,
    paddingHorizontal: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    elevation: 5,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 6,
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  modalCloseBtn: {
    backgroundColor: '#5B21B6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
    width: '100%',
    alignItems: 'center',
  },
  modalCloseText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
});
