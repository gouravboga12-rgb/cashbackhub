import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing, Platform } from 'react-native';

interface Dice3DProps {
  targetFace?: number;
  isRolling?: boolean;
  onRollComplete?: (face: number) => void;
  size?: number;
}

export default function Dice3D({
  targetFace = 1,
  isRolling = false,
  onRollComplete,
  size = 110,
}: Dice3DProps) {
  const [displayFace, setDisplayFace] = useState(targetFace);

  const rotateX = useRef(new Animated.Value(0)).current;
  const rotateY = useRef(new Animated.Value(0)).current;
  const rotateZ = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const shadowScale = useRef(new Animated.Value(1)).current;
  const shadowOpacity = useRef(new Animated.Value(0.4)).current;

  const intervalRef = useRef<any>(null);

  useEffect(() => {
    if (isRolling) {
      // Rapid face switching while in mid-air tumble
      intervalRef.current = setInterval(() => {
        setDisplayFace(Math.floor(Math.random() * 6) + 1);
      }, 90);

      // Multi-axis 3D tumbling animation
      rotateX.setValue(0);
      rotateY.setValue(0);
      rotateZ.setValue(0);
      translateY.setValue(0);
      scale.setValue(1);

      // Dice jump and spin
      Animated.parallel([
        Animated.sequence([
          // Jump up
          Animated.timing(translateY, {
            toValue: -36,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          // Fall down with bounce
          Animated.timing(translateY, {
            toValue: 0,
            duration: 1150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        // Scale pulse
        Animated.sequence([
          Animated.timing(scale, {
            toValue: 1.15,
            duration: 650,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 1,
            duration: 1150,
            easing: Easing.bounce,
            useNativeDriver: true,
          }),
        ]),
        // X rotation tumble (3 full spins)
        Animated.timing(rotateX, {
          toValue: 1080,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Y rotation tumble (3 full spins)
        Animated.timing(rotateY, {
          toValue: 1080,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Z rotation wobble
        Animated.timing(rotateZ, {
          toValue: 720,
          duration: 1800,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: true,
        }),
        // Shadow animation (shrinks as dice jumps up, grows as it hits ground)
        Animated.sequence([
          Animated.timing(shadowScale, {
            toValue: 0.6,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(shadowScale, {
            toValue: 1,
            duration: 1150,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(shadowOpacity, {
            toValue: 0.15,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(shadowOpacity, {
            toValue: 0.45,
            duration: 1150,
            useNativeDriver: true,
          }),
        ]),
      ]).start(() => {
        clearInterval(intervalRef.current);
        setDisplayFace(targetFace);
        rotateX.setValue(0);
        rotateY.setValue(0);
        rotateZ.setValue(0);
        if (onRollComplete) onRollComplete(targetFace);
      });

      return () => {
        if (intervalRef.current) clearInterval(intervalRef.current);
      };
    } else {
      setDisplayFace(targetFace);
    }
  }, [isRolling, targetFace]);

  const spinX = rotateX.interpolate({
    inputRange: [0, 1080],
    outputRange: ['0deg', '1080deg'],
  });

  const spinY = rotateY.interpolate({
    inputRange: [0, 1080],
    outputRange: ['0deg', '1080deg'],
  });

  const spinZ = rotateZ.interpolate({
    inputRange: [0, 720],
    outputRange: ['0deg', '720deg'],
  });

  // Render authentic Casino Dice Pips (dots)
  const renderDiceFacePips = (face: number) => {
    const isRed = face === 1 || face === 6;
    const pipColor = isRed ? '#DC2626' : '#1E1B4B';
    const pipSize = Math.max(14, Math.round(size * 0.18));
    const bigPipSize = Math.max(22, Math.round(size * 0.28));

    const pip = (key: string, customStyle?: any) => (
      <View
        key={key}
        style={[
          styles.pip,
          {
            width: pipSize,
            height: pipSize,
            borderRadius: pipSize / 2,
            backgroundColor: pipColor,
          },
          customStyle,
        ]}
      >
        {/* Realistic Pip Glint */}
        <View style={styles.pipGlint} />
      </View>
    );

    switch (face) {
      case 1:
        return (
          <View style={styles.faceCenter}>
            <View
              style={[
                styles.pip,
                {
                  width: bigPipSize,
                  height: bigPipSize,
                  borderRadius: bigPipSize / 2,
                  backgroundColor: '#DC2626',
                },
              ]}
            >
              <View style={[styles.pipGlint, { width: 5, height: 5 }]} />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.faceDiagonal}>
            <View style={styles.topRightCorner}>{pip('p2_1')}</View>
            <View style={styles.bottomLeftCorner}>{pip('p2_2')}</View>
          </View>
        );

      case 3:
        return (
          <View style={styles.faceDiagonal}>
            <View style={styles.topRightCorner}>{pip('p3_1')}</View>
            <View style={styles.centerAbsolute}>{pip('p3_2')}</View>
            <View style={styles.bottomLeftCorner}>{pip('p3_3')}</View>
          </View>
        );

      case 4:
        return (
          <View style={styles.faceGrid2x2}>
            <View style={styles.rowBetween}>
              {pip('p4_1')}
              {pip('p4_2')}
            </View>
            <View style={styles.rowBetween}>
              {pip('p4_3')}
              {pip('p4_4')}
            </View>
          </View>
        );

      case 5:
        return (
          <View style={styles.faceGrid2x2}>
            <View style={styles.rowBetween}>
              {pip('p5_1')}
              {pip('p5_2')}
            </View>
            <View style={styles.centerAbsolute}>{pip('p5_mid')}</View>
            <View style={styles.rowBetween}>
              {pip('p5_3')}
              {pip('p5_4')}
            </View>
          </View>
        );

      case 6:
        return (
          <View style={styles.faceGrid2x3}>
            <View style={styles.rowBetween}>
              {pip('p6_1')}
              {pip('p6_2')}
            </View>
            <View style={styles.rowBetween}>
              {pip('p6_3')}
              {pip('p6_4')}
            </View>
            <View style={styles.rowBetween}>
              {pip('p6_5')}
              {pip('p6_6')}
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* 3D Dice Cube */}
      <Animated.View
        style={[
          styles.diceCube,
          {
            width: size,
            height: size,
            borderRadius: Math.round(size * 0.2),
            transform: [
              { translateY },
              { scale },
              { rotateX: spinX },
              { rotateY: spinY },
              { rotateZ: spinZ },
            ],
          },
        ]}
      >
        {/* Subtle 3D Edge Bevel Highlights */}
        <View style={styles.bevelTop} />
        <View style={styles.bevelLeft} />

        {/* The Dice Face with Real Pips */}
        <View style={styles.innerFace}>
          {renderDiceFacePips(displayFace)}
        </View>
      </Animated.View>

      {/* Dynamic 3D Ground Shadow */}
      <Animated.View
        style={[
          styles.groundShadow,
          {
            width: size * 0.95,
            height: size * 0.2,
            opacity: shadowOpacity,
            transform: [{ scaleX: shadowScale }, { scaleY: shadowScale }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  diceCube: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    position: 'relative',
    ...Platform.select({
      ios: {
        shadowColor: '#0F172A',
        shadowOffset: { width: 0, height: 12 },
        shadowOpacity: 0.28,
        shadowRadius: 16,
      },
      android: {
        elevation: 14,
      },
    }),
  },
  bevelTop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    zIndex: 2,
  },
  bevelLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 2,
  },
  innerFace: {
    flex: 1,
    padding: 14,
    backgroundColor: '#FAFAFC',
    justifyContent: 'center',
  },
  pip: {
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.35,
    shadowRadius: 2,
    elevation: 3,
  },
  pipGlint: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.75)',
    position: 'absolute',
    top: 2,
    left: 2,
  },
  faceCenter: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceDiagonal: {
    flex: 1,
    position: 'relative',
  },
  topRightCorner: {
    position: 'absolute',
    top: 0,
    right: 0,
  },
  bottomLeftCorner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
  },
  centerAbsolute: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  faceGrid2x2: {
    flex: 1,
    justifyContent: 'space-between',
    position: 'relative',
  },
  faceGrid2x3: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  groundShadow: {
    backgroundColor: 'rgba(30, 27, 75, 0.35)',
    borderRadius: 50,
    marginTop: 18,
  },
});
