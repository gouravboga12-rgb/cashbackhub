import React, { useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import Svg, { Path } from 'react-native-svg';

interface BrandLogoProps {
  brandName?: string;
  image?: string;
  logo?: string;
  size?: number;
}

export default function BrandLogo({ brandName = '', image, logo, size = 44 }: BrandLogoProps) {
  const [imageError, setImageError] = useState(false);
  const nameLower = (brandName || '').toLowerCase();
  const initial = (brandName || '🎁').trim().charAt(0).toUpperCase();

  const resolveImageUrl = (url: string | undefined | null) => {
    if (!url || typeof url !== 'string' || !url.trim()) return null;
    const clean = url.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://') || clean.startsWith('data:image/')) {
      return clean;
    }
    // Only prepend backend host if it starts with / or has an image extension
    if (
      clean.startsWith('/') ||
      clean.startsWith('./') ||
      clean.endsWith('.png') ||
      clean.endsWith('.jpg') ||
      clean.endsWith('.jpeg') ||
      clean.endsWith('.webp') ||
      clean.endsWith('.svg')
    ) {
      return `https://perkfy.co.in${clean.startsWith('/') ? '' : '/'}${clean}`;
    }
    return null;
  };

  // 1. Explicit image URL (from image or logo prop if it's a valid URL)
  const candidateUrl = resolveImageUrl(image) || resolveImageUrl(logo);
  const hasValidImage = !imageError && Boolean(candidateUrl);
  if (hasValidImage && candidateUrl) {
    return (
      <View style={[styles.box, { width: size, height: size, borderRadius: size * 0.28, backgroundColor: '#FFFFFF' }]}>
        <Image
          source={{ uri: candidateUrl }}
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
        <Text style={[styles.brandText, { fontSize: size * 0.52, color: '#FFE500', fontWeight: '900', fontStyle: 'italic' }]}>
          f
        </Text>
      </View>
    );
  }

  // 4. Preset Brand: Amazon Pay / Amazon
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
        <Text style={[styles.brandText, { fontSize: size * 0.48, color: '#FF9900', fontWeight: '900' }]}>
          a
        </Text>
      </View>
    );
  }

  // 5. Preset Brand: Google Play (1:1 with Web SVG)
  if (nameLower.includes('google') || nameLower.includes('play')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#FFFFFF',
            borderColor: '#E2E8F0',
            borderWidth: 1.5,
          },
        ]}
      >
        <Svg viewBox="0 0 24 24" width={size * 0.6} height={size * 0.6}>
          <Path fill="#4285F4" d="M3.6 1.8L13.8 12 3.6 22.2c-.4-.4-.6-1-.6-1.7V3.5c0-.7.2-1.3.6-1.7z" />
          <Path fill="#FBBC04" d="M17.3 8.5L13.8 12l3.5 3.5 4.1-2.3c1.2-.7 1.2-1.7 0-2.4l-4.1-2.3z" />
          <Path fill="#34A853" d="M3.6 22.2l10.2-10.2 3.5 3.5-11.8 6.7c-.6.3-1.3.3-1.9 0z" />
          <Path fill="#EA4335" d="M17.3 8.5L13.8 12 3.6 1.8c.6-.3 1.3-.3 1.9 0l11.8 6.7z" />
        </Svg>
      </View>
    );
  }

  // 6. Preset Brand: Zomato (1:1 with Web Red Card)
  if (nameLower.includes('zomato')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#CB202D',
          },
        ]}
      >
        <Text
          style={[
            styles.brandText,
            {
              fontSize: size * 0.28,
              fontWeight: '900',
              fontStyle: 'italic',
              color: '#FFFFFF',
              letterSpacing: -0.5,
            },
          ]}
        >
          zomato
        </Text>
      </View>
    );
  }

  // 7. Preset Brand: Swiggy
  if (nameLower.includes('swiggy')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#FC8019',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.45 }]}>S</Text>
      </View>
    );
  }

  // 8. Preset Brand: Paytm
  if (nameLower.includes('paytm')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#002E6E',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.3, color: '#00BAF2', fontWeight: '900' }]}>
          Paytm
        </Text>
      </View>
    );
  }

  // 9. Preset Brand: Myntra
  if (nameLower.includes('myntra')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#E11B55',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.45 }]}>M</Text>
      </View>
    );
  }

  // 10. Preset Brand: BookMyShow
  if (nameLower.includes('bookmyshow') || nameLower.includes('bms')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#C4242D',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.28 }]}>BMS</Text>
      </View>
    );
  }

  // 11. Preset Brand: MakeMyTrip
  if (nameLower.includes('makemytrip') || nameLower.includes('mmt')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#EB2026',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.28 }]}>MMT</Text>
      </View>
    );
  }

  // 12. Preset Brand: Nykaa
  if (nameLower.includes('nykaa')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#FC2779',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.24, fontWeight: '900' }]}>NYKAA</Text>
      </View>
    );
  }

  // 13. Preset Brand: Uber
  if (nameLower.includes('uber')) {
    return (
      <View
        style={[
          styles.box,
          {
            width: size,
            height: size,
            borderRadius: size * 0.28,
            backgroundColor: '#000000',
          },
        ]}
      >
        <Text style={[styles.brandText, { fontSize: size * 0.28 }]}>Uber</Text>
      </View>
    );
  }

  // 14. Preset Brand: UPI
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

  // 15. Emoji or Short Symbol Fallback (e.g. 💳, 🛍️, 📦, 🎮)
  const candidateEmoji = (logo && typeof logo === 'string' && logo.length <= 4) ? logo : ((image && typeof image === 'string' && image.length <= 4) ? image : null);
  if (candidateEmoji) {
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
        <Text style={{ fontSize: size * 0.48 }}>{candidateEmoji}</Text>
      </View>
    );
  }

  // 16. Generic Letter Initial Fallback
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
