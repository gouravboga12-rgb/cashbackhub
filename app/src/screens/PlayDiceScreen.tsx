import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  ActivityIndicator,
  ScrollView
} from 'react-native';
import { Dices, ArrowLeft, Trophy, Sparkles } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { playNotificationAudio, showInAppNotification } from '../services/notificationService';

export default function PlayDiceScreen({ navigation }: any) {
  const { wallet, refreshWallet } = useAuth();

  const [betPoints, setBetPoints] = useState(10);
  const [selectedPrediction, setSelectedPrediction] = useState<'LOW' | 'HIGH'>('HIGH');
  const [diceValue, setDiceValue] = useState(6);
  const [isRolling, setIsRolling] = useState(false);
  const [gameResult, setGameResult] = useState<{ win: boolean; message: string } | null>(null);

  const rotateAnim = useRef(new Animated.Value(0)).current;

  const handleRollDice = async () => {
    if (isRolling) return;
    const currentPoints = wallet?.available_points ?? 0;
    if (currentPoints < betPoints) {
      showInAppNotification('Insufficient Balance', 'You need more points to place this bet.', 'error');
      return;
    }

    setIsRolling(true);
    setGameResult(null);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    // Animate rotation
    rotateAnim.setValue(0);
    Animated.timing(rotateAnim, {
      toValue: 720,
      duration: 1800,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    // Roll random die 1-6
    const rollOutcome = Math.floor(Math.random() * 6) + 1;

    setTimeout(async () => {
      setDiceValue(rollOutcome);
      setIsRolling(false);

      const isHigh = rollOutcome >= 4;
      const isWin = (selectedPrediction === 'HIGH' && isHigh) || (selectedPrediction === 'LOW' && !isHigh);

      if (isWin) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        playNotificationAudio().catch(() => {});
        setGameResult({
          win: true,
          message: `🎉 Great guess! Rolled ${rollOutcome} (${isHigh ? 'High' : 'Low'}). You won +${betPoints * 2} Points!`,
        });
        showInAppNotification('Dice Roll Winner! 🎲', `+${betPoints * 2} Points credited!`);
      } else {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setGameResult({
          win: false,
          message: `Rolled ${rollOutcome} (${isHigh ? 'High' : 'Low'}). Better luck next roll!`,
        });
      }

      // Record roll on backend
      try {
        await api.post('/dice/roll', {
          bet_points: betPoints,
          prediction: selectedPrediction,
          outcome: rollOutcome,
          won: isWin,
        });
      } catch (e) {}

      await refreshWallet();
    }, 1800);
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 720],
    outputRange: ['0deg', '720deg'],
  });

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ArrowLeft size={18} color="#1E293B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Roll 3D Lucky Dice</Text>
        <View style={styles.balancePill}>
          <Text style={styles.balanceText}>{(wallet?.available_points ?? 0).toLocaleString()} pts</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Dice Arena */}
        <LinearGradient colors={['#1E1B4B', '#2E1065']} style={styles.arena}>
          <Animated.View style={[styles.diceBox, { transform: [{ rotate: spin }] }]}>
            <Text style={styles.diceFaceNumber}>{diceValue}</Text>
          </Animated.View>
          <Text style={styles.arenaSubtitle}>
            {isRolling ? 'Rolling dice...' : `Last outcome: ${diceValue} (${diceValue >= 4 ? 'HIGH' : 'LOW'})`}
          </Text>
        </LinearGradient>

        {/* Prediction Choice (LOW 1-3 vs HIGH 4-6) */}
        <Text style={styles.label}>Choose Your Prediction (2x Win)</Text>
        <View style={styles.choiceRow}>
          <TouchableOpacity
            style={[styles.choiceBtn, selectedPrediction === 'LOW' && styles.choiceBtnActive]}
            onPress={() => setSelectedPrediction('LOW')}
          >
            <Text style={[styles.choiceBtnText, selectedPrediction === 'LOW' && styles.choiceBtnTextActive]}>
              LOW (1, 2, 3)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.choiceBtn, selectedPrediction === 'HIGH' && styles.choiceBtnActive]}
            onPress={() => setSelectedPrediction('HIGH')}
          >
            <Text style={[styles.choiceBtnText, selectedPrediction === 'HIGH' && styles.choiceBtnTextActive]}>
              HIGH (4, 5, 6)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Bet Amount Selector */}
        <Text style={styles.label}>Select Bet Amount</Text>
        <View style={styles.betRow}>
          {[10, 20, 50, 100].map((amt) => (
            <TouchableOpacity
              key={amt}
              style={[styles.betChip, betPoints === amt && styles.betChipActive]}
              onPress={() => setBetPoints(amt)}
            >
              <Text style={[styles.betChipText, betPoints === amt && styles.betChipTextActive]}>
                {amt} pts
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Button */}
        <TouchableOpacity
          onPress={handleRollDice}
          disabled={isRolling}
          activeOpacity={0.85}
          style={{ width: '100%', marginTop: 20 }}
        >
          <LinearGradient
            colors={isRolling ? ['#6D28D9', '#5B21B6'] : ['#2563EB', '#1D4ED8']}
            style={styles.rollBtn}
          >
            {isRolling ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Text style={styles.rollBtnText}>ROLL DICE NOW ({betPoints} Pts)</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

        {/* Result Message */}
        {gameResult && (
          <View style={[styles.resultBox, gameResult.win ? styles.winBox : styles.loseBox]}>
            <Text style={[styles.resultText, gameResult.win ? styles.winText : styles.loseText]}>
              {gameResult.message}
            </Text>
          </View>
        )}
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
    paddingHorizontal: 16,
    paddingTop: 45,
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
  balancePill: {
    backgroundColor: '#F3E8FF',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 14,
  },
  balanceText: {
    color: '#7C3AED',
    fontWeight: '800',
    fontSize: 12,
  },
  content: {
    padding: 16,
  },
  arena: {
    borderRadius: 22,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
  },
  diceBox: {
    width: 90,
    height: 90,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: '#E2E8F0',
    elevation: 6,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  diceFaceNumber: {
    fontSize: 42,
    fontWeight: '900',
    color: '#1E1B4B',
  },
  arenaSubtitle: {
    color: '#DDD6FE',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 8,
    marginTop: 8,
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  choiceBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  choiceBtnActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  choiceBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  choiceBtnTextActive: {
    color: '#2563EB',
  },
  betRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  betChip: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  betChipActive: {
    borderColor: '#16A34A',
    backgroundColor: '#ECFDF5',
  },
  betChipText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#64748B',
  },
  betChipTextActive: {
    color: '#16A34A',
  },
  rollBtn: {
    paddingVertical: 15,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
  },
  rollBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  resultBox: {
    marginTop: 18,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  winBox: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  loseBox: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECACA',
  },
  resultText: {
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'center',
  },
  winText: {
    color: '#15803D',
  },
  loseText: {
    color: '#DC2626',
  },
});
