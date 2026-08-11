import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function SpinWinScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Spin & Win Wheel</Text>
      <Text style={styles.sub}>Spin daily for bonus rewards!</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepVioletDark, padding: 20, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 }
});
