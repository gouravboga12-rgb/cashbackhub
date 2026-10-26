import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';

interface BrandLogoProps {
  brandName?: string;
  image?: string;
  size?: number;
}

export default function BrandLogo({ brandName = '', image, size = 44 }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const nameLower = (brandName || '').toLowerCase();
  const initial = (brandName || '🎁').trim().charAt(0).toUpperCase();

  const resolveImageUrl = (url: string | undefined | null) => {
    if (!url || typeof url !== 'string' || !url.trim()) return null;
    const clean = url.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
      return clean;
    }
    return `https://perkfy.co.in${clean.startsWith('/') ? '' : '/'}${clean}`;
  };

  // 1. Explicit image
  const resolvedUri = resolveImageUrl(image);
  const hasValidImage = !imageError && Boolean(resolvedUri);
  if (hasValidImage && resolvedUri) {
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.28 }]}>
        <Image
          source={{ uri: resolvedUri }}
          style={styles.img}
          resizeMode="contain"
          onError={() => setImageError(true)}
        />
      </View>
    );
  }

  // 2. Preset Brand: PhonePe
  if (nameLower.includes('phonepe')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#5F259F',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.45 }]}>पे</Text>
      </View>
    );
  }

  // 3. Preset Brand: Flipkart
  if (nameLower.includes('flipkart')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#2874F0',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.42, color: '#FFE500', fontWeight: '900' }]}>
          fk
        </Text>
      </View>
    );
  }

  // 4. Preset Brand: Amazon
  if (nameLower.includes('amazon')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#131921',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.42, color: '#FF9900', fontWeight: '900' }]}>
          a
        </Text>
      </View>
    );
  }

  // 5. Preset Brand: Google Play
  if (nameLower.includes('google') || nameLower.includes('play')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#01875F',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.4, color: '#FFFFFF' }]}>▶</Text>
      </View>
    );
  }

  // 6. Preset Brand: UPI
  if (nameLower.includes('upi')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#00833F',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.35, color: '#FFFFFF', fontWeight: '900' }]}>
          UPI
        </Text>
      </View>
    );
  }

  // 7. Generic Fallback
  return (
    <View
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size * 0.28,
          backgroundColor: '#EDE9FE',
          borderColor: '#DDD6FE',
        },
      ]}
    >
      <Text style={[styles.brandText, { fontSize: size * 0.4, color: '#6D28D9' }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.06)',
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
    backgroundColor: '#FFFFFF',
    overflow: 'hidden',
  },
  img: {
    width: '80%',
    height: '80%',
  },
  brandText: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});
