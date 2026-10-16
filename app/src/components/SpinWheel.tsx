import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
  Modal,
  Platform,
} from 'react-native';
import Svg, { G, Path, Text as SvgText, Circle } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Trophy, Disc, Sparkles } from 'lucide-react-native';

interface Slice {
  id: string;
  label: string;
  reward_points: number;
  color: string;
}

interface SpinWheelProps {
  slices?: Slice[];
  spinsAvailable?: number;
  dailyLimit?: number;
  costPerSpin?: number;
  userPoints?: number;
  onSpin?: () => Promise<{ targetIndex: number; reward_points: number; cost_points?: number; message?: string; wallet?: any }>;
  onClaim?: (spinData: any) => void;
  onNavigateToAds?: () => void;
  size?: number;
}

export default function SpinWheel({
  slices = [],
  spinsAvailable = 10,
  dailyLimit = 10,
  costPerSpin = 10,
  userPoints = 0,
  onSpin,
  onClaim,
  onNavigateToAds,
  size,
}: SpinWheelProps) {
  const windowWidth = Dimensions.get('window').width;
  const wheelSize = size || Math.min(windowWidth * 0.78, 290);
  const radius = wheelSize / 2;

  const defaultSlices: Slice[] = [
    { id: '1', label: '1000 Pts', reward_points: 1000, color: '#5B21B6' },
    { id: '2', label: '500 Pts', reward_points: 500, color: '#22C55E' },
    { id: '3', label: '200 Pts', reward_points: 200, color: '#7C3AED' },
    { id: '4', label: '50 Pts', reward_points: 50, color: '#4ADE80' },
    { id: '5', label: '100 Pts', reward_points: 100, color: '#6D28D9' },
    { id: '6', label: 'Better Luck Next Time', reward_points: 0, color: '#EC4899' },
  ];

  const wheelSlices = slices.length > 0 ? slices : defaultSlices;
  const [spinning, setSpinning] = useState(false);
  const [resultModal, setResultModal] = useState<{ visible: boolean; points: number; message: string; data?: any }>({
    visible: false,
    points: 0,
    message: '',
  });

  const spinAnim = useRef(new Animated.Value(0)).current;
  const currentRotationRef = useRef(0);

  const numSlices = wheelSlices.length;
  const sliceAngle = (2 * Math.PI) / numSlices;
  const sliceDegrees = 360 / numSlices;

  const handleSpinClick = async () => {
    if (spinning || spinsAvailable <= 0) return;
    if (userPoints < costPerSpin) {
      if (onNavigateToAds) onNavigateToAds();
      return;
    }

    setSpinning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    let targetIndex = Math.floor(Math.random() * wheelSlices.length);
    let wonPts = wheelSlices[targetIndex]?.reward_points || 0;
    let spinDataResponse: any = null;

    if (onSpin) {
      try {
        spinDataResponse = await onSpin();
        if (typeof spinDataResponse?.targetIndex === 'number') {
          targetIndex = spinDataResponse.targetIndex;
        }
        if (typeof spinDataResponse?.reward_points === 'number') {
          wonPts = spinDataResponse.reward_points;
        }
      } catch (e) {
        console.warn('onSpin error', e);
      }
    }

    // Cumulative continuous forward angle calculation (works for spin 1, 2, 3...)
    const currentRot = currentRotationRef.current;
    const currentMod = ((currentRot % 360) + 360) % 360;
    const targetSliceCenter = targetIndex * sliceDegrees + sliceDegrees / 2;
    const targetMod = ((360 - targetSliceCenter) % 360 + 360) % 360;

    let forwardDiff = (targetMod - currentMod) % 360;
    if (forwardDiff <= 0) forwardDiff += 360;

    const totalSpins = 5 * 360;
    const finalTarget = currentRot + totalSpins + forwardDiff;

    Animated.timing(spinAnim, {
      toValue: finalTarget,
      duration: 3800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start(() => {
      currentRotationRef.current = finalTarget;
      setSpinning(false);

      if (wonPts > 0) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      }

      setResultModal({
        visible: true,
        points: wonPts,
        message: wonPts > 0 ? `🎉 Congratulations! You won +${wonPts} Points!` : 'Better luck next time!',
        data: spinDataResponse,
      });
    });
  };

  const handleClaim = () => {
    setResultModal({ visible: false, points: 0, message: '' });
    if (onClaim) {
      onClaim(resultModal.data || { reward_points: resultModal.points });
    }
  };

  const spinInterpolate = spinAnim.interpolate({
    inputRange: [0, 360000],
    outputRange: ['0deg', '360000deg'],
  });

  return (
    <View style={styles.container}>
      {/* Outer Glow Ring */}
      <View style={[styles.wheelOuterRing, { width: wheelSize + 16, height: wheelSize + 16, borderRadius: (wheelSize + 16) / 2 }]}>
        {/* Needle / Pointer at Top */}
        <View style={styles.pointerContainer}>
          <View style={styles.pointerTriangle} />
          <View style={styles.pointerShadow} />
        </View>

        {/* Animated Rotating Wheel */}
        <Animated.View style={{ transform: [{ rotate: spinInterpolate }] }}>
          <Svg width={wheelSize} height={wheelSize} viewBox={`0 0 ${wheelSize} ${wheelSize}`}>
            <G transform={`translate(${radius}, ${radius})`}>
              {wheelSlices.map((slice, i) => {
                const startAngle = i * sliceAngle - Math.PI / 2;
                const endAngle = (i + 1) * sliceAngle - Math.PI / 2;

                const x1 = radius * Math.cos(startAngle);
                const y1 = radius * Math.sin(startAngle);
                const x2 = radius * Math.cos(endAngle);
                const y2 = radius * Math.sin(endAngle);

                const d = `M 0 0 L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

                const textAngle = startAngle + sliceAngle / 2;
                const textRadius = radius * 0.63;
                const tx = textRadius * Math.cos(textAngle);
                const ty = textRadius * Math.sin(textAngle);
                const textDeg = ((textAngle + Math.PI / 2) * 180) / Math.PI;

                const labelLower = (slice.label || '').toLowerCase();
                const isBetterLuck = labelLower.includes('better') || labelLower.includes('luck') || labelLower.includes('try again');

                return (
                  <G key={slice.id || i}>
                    <Path d={d} fill={slice.color} stroke="#FFFFFF" strokeWidth={2.5} />

                    {isBetterLuck ? (
                      // Two clean lines to prevent overflow out of pink slice
                      <G transform={`rotate(${textDeg}, ${tx}, ${ty})`}>
                        <SvgText
                          x={tx}
                          y={ty - 6}
                          fill="#FFFFFF"
                          fontSize={Math.round(wheelSize * 0.032)}
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Better Luck
                        </SvgText>
                        <SvgText
                          x={tx}
                          y={ty + 7}
                          fill="#FFFFFF"
                          fontSize={Math.round(wheelSize * 0.032)}
                          fontWeight="bold"
                          textAnchor="middle"
                        >
                          Next Time
                        </SvgText>
                      </G>
                    ) : (
                      <SvgText
                        x={tx}
                        y={ty}
                        fill="#FFFFFF"
                        fontSize={Math.round(wheelSize * 0.04)}
                        fontWeight="bold"
                        textAnchor="middle"
                        alignmentBaseline="middle"
                        transform={`rotate(${textDeg}, ${tx}, ${ty})`}
                      >
                        {slice.label}
                      </SvgText>
                    )}
                  </G>
                );
              })}

              {/* Center Cap */}
              <Circle r={radius * 0.22} fill="#FFFFFF" stroke="#4C1D95" strokeWidth={3} />
              <Circle r={radius * 0.16} fill="#5B21B6" />
            </G>
          </Svg>
        </Animated.View>
      </View>

      {/* Spin Action Trigger */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={handleSpinClick}
          disabled={spinning || spinsAvailable <= 0}
          activeOpacity={0.85}
          style={[
            styles.spinBtn,
            (spinning || spinsAvailable <= 0) && styles.spinBtnDisabled,
          ]}
        >
          <Text style={styles.spinBtnText}>
            {spinning ? 'Spinning...' : spinsAvailable <= 0 ? 'No Spins Left' : `SPIN WHEEL (-${costPerSpin} Pts)`}
          </Text>
        </TouchableOpacity>

        <Text style={styles.subHint}>
          {spinsAvailable} of {dailyLimit} spins available today • Costs -{costPerSpin} Pts
        </Text>
      </View>

      {/* Win Modal Popup */}
      <Modal visible={resultModal.visible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View
              style={[
                styles.modalIconWrap,
                resultModal.points > 0 ? styles.modalIconWrapWin : styles.modalIconWrapNeutral,
              ]}
            >
              {resultModal.points > 0 ? (
                <Trophy size={36} color="#16A34A" />
              ) : (
                <Disc size={36} color="#64748B" />
              )}
            </View>

            <Text style={styles.modalTitle}>
              {resultModal.points > 0 ? 'Congratulations!' : 'Better Luck Next Time!'}
            </Text>

            <Text style={styles.modalDesc}>{resultModal.message}</Text>

            {/* Detailed Points Calculation Breakdown - 1:1 with Web */}
            <View style={styles.breakdownContainer}>
              <View style={styles.breakdownCol}>
                <Text style={styles.breakdownLabel}>SPIN COST</Text>
                <Text style={styles.breakdownCost}>
                  -{resultModal.data?.cost_points || costPerSpin} Pts
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownCol}>
                <Text style={styles.breakdownLabel}>REWARD</Text>
                <Text style={styles.breakdownReward}>
                  +{resultModal.points} Pts
                </Text>
              </View>
              <View style={styles.breakdownDivider} />
              <View style={styles.breakdownCol}>
                <Text style={styles.breakdownLabel}>NET CHANGE</Text>
                <Text
                  style={[
                    styles.breakdownNet,
                    {
                      color:
                        resultModal.points - (resultModal.data?.cost_points || costPerSpin) >= 0
                          ? '#16A34A'
                          : '#EF4444',
                    },
                  ]}
                >
                  {resultModal.points - (resultModal.data?.cost_points || costPerSpin) >= 0 ? '+' : ''}
                  {resultModal.points - (resultModal.data?.cost_points || costPerSpin)} Pts
                </Text>
              </View>
            </View>

            {resultModal.points > 0 && (
              <View style={styles.modalPointsPill}>
                <Sparkles size={16} color="#16A34A" />
                <Text style={styles.modalPointsPillText}>+{resultModal.points} Points Added</Text>
              </View>
            )}

            <TouchableOpacity onPress={handleClaim} style={styles.modalClaimBtn} activeOpacity={0.85}>
              <Text style={styles.modalClaimBtnText}>
                {resultModal.points > 0 ? 'Claim Reward' : 'Close'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  wheelOuterRing: {
    borderWidth: 4,
    borderColor: '#E2E8F0',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 18,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  pointerContainer: {
    position: 'absolute',
    top: -14,
    zIndex: 10,
    alignItems: 'center',
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderTopWidth: 24,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#DC2626',
  },
  pointerShadow: {
    position: 'absolute',
    top: 2,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7F1D1D',
  },
  actionRow: {
    width: '100%',
    alignItems: 'center',
    marginTop: 18,
  },
  spinBtn: {
    backgroundColor: '#5B21B6',
    paddingVertical: 12,
    paddingHorizontal: 28,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#5B21B6',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.35,
        shadowRadius: 14,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  spinBtnDisabled: {
    backgroundColor: '#94A3B8',
  },
  spinBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  subHint: {
    fontSize: 11,
    color: '#6B7280',
    marginTop: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    width: '88%',
    maxWidth: 340,
    alignItems: 'center',
    elevation: 10,
  },
  modalIconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  modalIconWrapWin: {
    backgroundColor: '#DCFCE7',
  },
  modalIconWrapNeutral: {
    backgroundColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#1E1B4B',
    marginBottom: 6,
    textAlign: 'center',
  },
  modalDesc: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 14,
  },
  modalPointsPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 16,
  },
  modalPointsPillText: {
    color: '#16A34A',
    fontWeight: '800',
    fontSize: 14,
  },
  modalClaimBtn: {
    backgroundColor: '#5B21B6',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 18,
    width: '100%',
    alignItems: 'center',
  },
  modalClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  breakdownContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 10,
    paddingHorizontal: 12,
    width: '100%',
    marginBottom: 14,
  },
  breakdownCol: {
    alignItems: 'center',
    flex: 1,
  },
  breakdownDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  breakdownLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  breakdownCost: {
    fontSize: 13,
    fontWeight: '800',
    color: '#EF4444',
  },
  breakdownReward: {
    fontSize: 13,
    fontWeight: '800',
    color: '#16A34A',
  },
  breakdownNet: {
    fontSize: 13,
    fontWeight: '800',
  },
});
