import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import BottomSheet, { BottomSheetScrollView, BottomSheetBackdrop } from '@gorhom/bottom-sheet';
import { COLORS, RADIUS } from '../constants/theme';

export default function InfoDrawer({ visible, onClose, title, subtitle, accent, tint, sections = [] }) {
  const sheetRef = useRef(null);
  const snapPoints = useMemo(() => ['55%', '92%'], []);

  useEffect(() => {
    if (!sheetRef.current) return;
    if (visible) sheetRef.current.snapToIndex(0);
    else sheetRef.current.close();
  }, [visible]);

  const handleChange = useCallback((index) => {
    if (index === -1 && onClose) onClose();
  }, [onClose]);

  const renderBackdrop = useCallback(
    (props) => (
      <BottomSheetBackdrop
        {...props}
        appearsOnIndex={0}
        disappearsOnIndex={-1}
        opacity={0.45}
        pressBehavior="close"
      />
    ),
    [],
  );

  // Always render, controlled by index. Starts closed.
  return (
    <BottomSheet
      ref={sheetRef}
      index={-1}
      snapPoints={snapPoints}
      enablePanDownToClose
      enableDynamicSizing={false}
      onChange={handleChange}
      backdropComponent={renderBackdrop}
      handleIndicatorStyle={styles.handle}
      backgroundStyle={styles.sheetBg}
      style={styles.sheetShadow}
      keyboardBehavior="interactive"
      keyboardBlurBehavior="restore"
    >
      <View style={styles.header}>
        <View style={styles.headerText}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
        <TouchableOpacity onPress={onClose} style={styles.closeBtn} activeOpacity={0.7} accessibilityLabel="Close">
          <MaterialCommunityIcons name="close" size={22} color={COLORS.textOnDark} />
        </TouchableOpacity>
      </View>

      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {sections.map((section, idx) => (
          <View key={`sec-${idx}`} style={styles.section}>
            <View style={styles.sectionHead}>
              <View style={[styles.sectionIcon, { backgroundColor: `${accent || COLORS.accentLP}18` }]}>
                <MaterialCommunityIcons name="bookmark-outline" size={12} color={accent || COLORS.accentLP} />
              </View>
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
      </BottomSheetScrollView>
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetShadow: {
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 24,
  },
  sheetBg: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: RADIUS.xl,
    borderTopRightRadius: RADIUS.xl,
  },
  handle: { backgroundColor: '#d9dde3', width: 42, height: 5, borderRadius: 3 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderSecondary,
    marginBottom: 8,
  },
  headerText: { flex: 1, paddingRight: 12 },
  title: { fontSize: 22, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.3 },
  subtitle: { marginTop: 4, fontSize: 13, color: COLORS.textSecondary, lineHeight: 19 },
  closeBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: COLORS.backgroundInverse,
    alignItems: 'center', justifyContent: 'center',
  },
  scrollContent: { paddingHorizontal: 20, paddingBottom: 40 },
  section: { marginBottom: 22 },
  sectionHead: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 10 },
  sectionIcon: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionTitle: { fontSize: 15, fontWeight: '800', color: COLORS.textPrimary, letterSpacing: -0.2 },
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
