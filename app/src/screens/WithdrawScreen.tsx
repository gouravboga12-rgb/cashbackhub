import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function WithdrawScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Voucher Catalog</Text>
      <Text style={styles.sub}>Redeem points for PhonePe, Flipkart & Amazon gift cards</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepVioletDark, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 }
});
