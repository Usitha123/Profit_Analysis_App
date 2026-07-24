import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, ACCENT_TINTS, RADIUS } from '../constants/theme';

const FEATURES = [
  { icon: 'account-group-outline', label: 'Staffing',   sub: 'Ratios + budget',      tint: ACCENT_TINTS.lp, accent: COLORS.accentLP },
  { icon: 'cash-multiple',         label: 'Cost',       sub: 'Budget allocation',    tint: ACCENT_TINTS.co, accent: COLORS.accentCO },
  { icon: 'chart-line-variant',    label: 'Break-Even', sub: 'Fee vs cost curve',    tint: ACCENT_TINTS.be, accent: COLORS.accentBE },
  { icon: 'chart-bell-curve-cumulative', label: 'Growth', sub: 'Logistic projection', tint: ACCENT_TINTS.gr, accent: COLORS.accentGR },
  { icon: 'finance',               label: 'Profit',     sub: 'ROI + payback',        tint: ACCENT_TINTS.pf, accent: COLORS.accentPF },
  { icon: 'information-outline',   label: 'Info',       sub: 'Formulas + refs',      tint: '#f3f4f6',       accent: COLORS.textPrimary },
];

export default function WelcomeScreen({ onStart }) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.hero}>
          <Text style={styles.eyebrow}>DAYCARE PLANNER</Text>
          <Text style={styles.hi}>Hi there,</Text>
          <Text style={styles.title}>Let's plan your{'\n'}daycare centre.</Text>
          <Text style={styles.subtitle}>
            Five decision models shape staffing, operating cost, break-even, growth, and profitability before opening.
          </Text>
        </View>

        <View style={styles.grid}>
          {FEATURES.map((f) => (
            <View key={f.label} style={[styles.tile, { backgroundColor: f.tint }]}>
              <View style={styles.tileIcon}>
                <MaterialCommunityIcons name={f.icon} size={22} color={f.accent} />
              </View>
              <Text style={[styles.tileTitle, { color: f.accent }]}>{f.label}</Text>
              <Text style={styles.tileSub}>{f.sub}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.cta} onPress={onStart} activeOpacity={0.85} accessibilityRole="button">
        <Text style={styles.ctaText}>Get started</Text>
        <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: COLORS.backgroundPage,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  scroll: { paddingBottom: 20 },
  hero: { paddingTop: 8, gap: 6 },
  eyebrow: {
    fontSize: 11, fontWeight: '700',
    color: COLORS.textMuted, letterSpacing: 1.4,
  },
  hi: {
    marginTop: 12,
    fontSize: 16, color: COLORS.textSecondary, fontWeight: '500',
  },
  title: {
    fontSize: 34, lineHeight: 40,
    fontWeight: '800', color: COLORS.textPrimary,
    letterSpacing: -0.6,
  },
  subtitle: {
    marginTop: 10,
    fontSize: 14.5, lineHeight: 22, color: COLORS.textSecondary,
  },
  grid: {
    marginTop: 26,
    flexDirection: 'row', flexWrap: 'wrap',
    gap: 12,
  },
  tile: {
    flexBasis: '47%', flexGrow: 1,
    borderRadius: RADIUS.lg, padding: 16,
    minHeight: 118,
  },
  tileIcon: {
    width: 36, height: 36, borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.8)',
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  tileTitle: { fontSize: 16, fontWeight: '800', letterSpacing: -0.2 },
  tileSub: { marginTop: 2, fontSize: 12, color: COLORS.textSecondary },
  cta: {
    marginTop: 12,
    backgroundColor: COLORS.backgroundInverse,
    borderRadius: RADIUS.pill,
    paddingVertical: 18,
    paddingHorizontal: 22,
    alignItems: 'center', justifyContent: 'center',
    flexDirection: 'row', gap: 8,
    minHeight: 56,
  },
  ctaText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
