import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { COLORS, RADIUS } from '../constants/theme';

export default function MetricCard({
  label,
  value,
  subtitle,
  accent,
  sub,
  style,
}) {
  const safeValue = (value === null || value === undefined || (typeof value === 'number' && isNaN(value)))
    ? '-'
    : String(value);
  const accentColor = accent || COLORS.accentLP;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.head}>
        <View style={[styles.dot, { backgroundColor: accentColor }]} />
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {safeValue}
      </Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text> : null}
      {sub !== undefined ? <Text style={styles.sub} numberOfLines={2}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: 16,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 150,
    minWidth: 140,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  dot: { width: 6, height: 6, borderRadius: 3 },
  label: {
    fontSize: 11,
    color: COLORS.textSecondary,
    fontWeight: '600',
    letterSpacing: 0.2,
    flex: 1,
    lineHeight: 14,
  },
  value: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif',
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.4,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 15,
  },
  sub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 6,
    lineHeight: 15,
  },
});
