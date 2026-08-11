import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

export default function WatchAdsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Watch Ads (0/10)</Text>
      <Text style={styles.sub}>Watch short videos to earn 10 points per ad</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.deepVioletDark, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', color: COLORS.white },
  sub: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8 }
});
