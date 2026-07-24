import React, { useEffect, useRef, useState } from 'react';
import {
  View, Text, Pressable, StyleSheet, Animated, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { COLORS, RADIUS } from '../constants/theme';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

function tapHaptic() {
  try { Haptics.selectionAsync(); } catch (_) { /* ignore */ }
}

export default function Section({ title, icon, accent = COLORS.accentLP, children, defaultOpen = true }) {
  const [open, setOpen] = useState(defaultOpen);
  const rot = useRef(new Animated.Value(defaultOpen ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(rot, {
      toValue: open ? 1 : 0,
      duration: 220,
      useNativeDriver: true,
    }).start();
  }, [open, rot]);

  const toggle = () => {
    LayoutAnimation.configureNext({
      duration: 260,
      create: { type: 'easeInEaseOut', property: 'opacity' },
      update: { type: 'easeInEaseOut' },
      delete: { type: 'easeInEaseOut', property: 'opacity' },
    });
    tapHaptic();
    setOpen((v) => !v);
  };

  const rotate = rot.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '180deg'] });

  return (
    <View style={styles.card}>
      <Pressable onPress={toggle} style={({ pressed }) => [styles.header, { opacity: pressed ? 0.85 : 1 }]} android_ripple={null}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
            <MaterialCommunityIcons name={icon} size={14} color={accent} />
          </View>
        ) : null}
        <Text style={styles.title} numberOfLines={1}>{title}</Text>
        <Animated.View style={{ transform: [{ rotate }] }}>
          <MaterialCommunityIcons name="chevron-down" size={22} color={COLORS.textSecondary} />
        </Animated.View>
      </Pressable>
      {open ? <View style={styles.body}>{children}</View> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: '#eef0f3',
    marginTop: 14,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 16,
    minHeight: 56,
  },
  iconWrap: {
    width: 26, height: 26, borderRadius: 8,
    alignItems: 'center', justifyContent: 'center',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.2,
  },
  body: {
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});
