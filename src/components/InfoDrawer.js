import React, { useEffect, useRef, useState } from 'react';
import {
  Modal, View, Text, TouchableOpacity, ScrollView, StyleSheet, Pressable, Platform,
  Animated, Easing, Dimensions, PanResponder,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

const SCREEN_H = Dimensions.get('window').height;

// Snap points as fractions of screen height (from top of sheet, so bigger = shorter sheet).
const SNAP_COLLAPSED = Math.round(SCREEN_H * 0.45); // sheet takes ~55% of screen
const SNAP_EXPANDED = Math.round(SCREEN_H * 0.08); // sheet takes ~92% of screen
const CLOSE_THRESHOLD = Math.round(SCREEN_H * 0.75); // drag below this = close
const CLOSE_VELOCITY = 1.2;

export default function InfoDrawer({ visible, onClose, title, subtitle, accent, tint, sections = [] }) {
  const insets = useSafeAreaInsets();
  const translateY = useRef(new Animated.Value(SCREEN_H)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;
  const currentSnap = useRef(SNAP_COLLAPSED);
  const [mounted, setMounted] = useState(visible);

  const animateTo = (toValue, opacityTo = 1, cb) => {
    Animated.parallel([
      Animated.spring(translateY, {
        toValue,
        useNativeDriver: true,
        damping: 22,
        stiffness: 220,
        mass: 0.9,
      }),
      Animated.timing(backdropOpacity, {
        toValue: opacityTo,
        duration: 220,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => { if (finished && cb) cb(); });
    currentSnap.current = toValue;
  };

  const closeSheet = () => {
    Animated.parallel([
      Animated.timing(translateY, {
        toValue: SCREEN_H,
        duration: 240,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.timing(backdropOpacity, {
        toValue: 0,
        duration: 220,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (finished) {
        setMounted(false);
        if (onClose) onClose();
      }
    });
  };

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => animateTo(SNAP_COLLAPSED));
    } else if (mounted) {
      closeSheet();
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dy) > 4,
      onPanResponderGrant: () => {
        translateY.stopAnimation();
        translateY.setOffset(currentSnap.current);
        translateY.setValue(0);
      },
      onPanResponderMove: (_, g) => {
        // Prevent dragging above expanded snap.
        const rawTarget = currentSnap.current + g.dy;
        const clamped = Math.max(SNAP_EXPANDED, rawTarget);
        translateY.setOffset(0);
        translateY.setValue(clamped);
        currentSnap.current = clamped;
        // Reset offset for smooth further deltas.
        translateY.setOffset(clamped);
        translateY.setValue(0);
      },
      onPanResponderRelease: (_, g) => {
        translateY.flattenOffset();
        const settled = currentSnap.current;
        const velocity = g.vy;
        // Downward strong swipe or below close threshold -> dismiss.
        if (velocity > CLOSE_VELOCITY || settled > CLOSE_THRESHOLD) {
          closeSheet();
          return;
        }
        // Snap to nearest of the two.
        const midpoint = (SNAP_COLLAPSED + SNAP_EXPANDED) / 2;
        const target = settled < midpoint ? SNAP_EXPANDED : SNAP_COLLAPSED;
        animateTo(target);
      },
      onPanResponderTerminate: () => {
        translateY.flattenOffset();
        animateTo(currentSnap.current);
      },
    }),
  ).current;

  if (!mounted) return null;

  return (
    <Modal
      visible={mounted}
      transparent
      animationType="none"
      onRequestClose={closeSheet}
      statusBarTranslucent
    >
      <View style={StyleSheet.absoluteFill}>
        <Animated.View style={[styles.backdrop, { opacity: backdropOpacity }]}>
          <Pressable style={StyleSheet.absoluteFill} onPress={closeSheet} />
        </Animated.View>

        <Animated.View
          style={[
            styles.sheet,
            { transform: [{ translateY }], paddingBottom: insets.bottom + 24 },
          ]}
        >
          <View {...panResponder.panHandlers} style={styles.dragArea}>
            <View style={styles.handle} />
          </View>

          <View style={styles.header}>
            <View style={styles.headerText}>
              <Text style={styles.title}>{title}</Text>
              {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
            </View>
            <TouchableOpacity onPress={closeSheet} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Close">
              <MaterialCommunityIcons name="close" size={22} color={COLORS.textOnDark} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {sections.map((section, idx) => (
              <View key={`sec-${idx}`} style={styles.section}>
                <View style={styles.sectionHead}>
                  <View style={[styles.dot, { backgroundColor: accent || COLORS.accentLP }]} />
                  <Text style={styles.sectionTitle}>{section.title}</Text>
                </View>

                {section.type === 'variables' ? (
                  <View style={[styles.card, { backgroundColor: tint || COLORS.backgroundSecondary }]}>
                    {section.items.map((it) => (
                      <View key={it.label} style={styles.varRow}>
                        <Text style={styles.varLabel}>{it.label}</Text>
                        <Text style={styles.varText}>{it.text}</Text>
                      </View>
                    ))}
                  </View>
                ) : null}

                {section.type === 'equation' ? (
                  <View style={[styles.equation, { borderLeftColor: accent || COLORS.accentLP }]}>
                    <Text style={styles.equationText}>{section.text}</Text>
                  </View>
                ) : null}

                {section.type === 'reference' ? (
                  <View style={styles.refGrid}>
                    {section.items.map((it) => (
                      <View key={it.label} style={styles.refCard}>
                        <View style={[styles.refIcon, { backgroundColor: tint || COLORS.backgroundSecondary }]}>
                          <MaterialCommunityIcons name={it.icon || 'lightbulb-outline'} size={18} color={accent || COLORS.accentLP} />
                        </View>
                        <View style={styles.refText}>
                          <Text style={styles.refLabel}>{it.label}</Text>
                          <Text style={styles.refValue}>{it.value}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                ) : null}

                {section.type === 'note' ? (
                  <Text style={styles.note}>{section.text}</Text>
                ) : null}
              </View>
            ))}
          </ScrollView>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
  },
  sheet: {
    position: 'absolute',
    left: 0, right: 0, top: 0, bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 24,
  },
  dragArea: {
    alignItems: 'center',
    paddingVertical: 10,
    // Larger hit area beyond the visible handle.
    paddingHorizontal: 60,
  },
  handle: { width: 42, height: 5, borderRadius: 3, backgroundColor: '#d9dde3' },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSecondary,
    marginBottom: 12,
  },
  headerText: { flex: 1, paddingRight: 12 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  subtitle: { marginTop: 4, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.backgroundInverse,
    alignItems: 'center', justifyContent: 'center',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 20 },
  section: { marginBottom: 20 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: COLORS.textPrimary },
  card: { borderRadius: RADIUS.lg, padding: 16 },
  varRow: { marginBottom: 10 },
  varLabel: { fontSize: 12.5, fontWeight: '700', color: COLORS.textPrimary, marginBottom: 2 },
  varText: { fontSize: 12.5, lineHeight: 19, color: COLORS.textSecondary },
  equation: {
    backgroundColor: '#f4f5f7',
    borderLeftWidth: 3,
    borderRadius: RADIUS.md,
    padding: 14,
  },
  equationText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12.5,
    lineHeight: 21,
    color: COLORS.textPrimary,
  },
  refGrid: { gap: 10 },
  refCard: {
    flexDirection: 'row', gap: 12, padding: 12,
    borderRadius: RADIUS.md,
    backgroundColor: '#fff',
    borderWidth: 1, borderColor: COLORS.borderSecondary,
  },
  refIcon: {
    width: 36, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  refText: { flex: 1 },
  refLabel: { fontSize: 12.5, fontWeight: '700', color: COLORS.textPrimary },
  refValue: { marginTop: 2, fontSize: 12, lineHeight: 18, color: COLORS.textSecondary },
  note: { fontSize: 13, lineHeight: 20, color: COLORS.textSecondary },
});
