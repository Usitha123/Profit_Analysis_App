import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

export default function MetricCard({
  label,
  value,
  subtitle,
  accent,
  icon,
  tint,
  trend,
  style,
}) {
  const safeValue = (value === null || value === undefined || (typeof value === 'number' && isNaN(value)))
    ? '—'
    : String(value);
  const accentColor = accent || COLORS.accentLP;
  const tintColor = tint || `${accentColor}18`;

  return (
    <View style={[styles.card, style]}>
      <View style={styles.head}>
        {icon ? (
          <View style={[styles.iconWrap, { backgroundColor: tintColor }]}>
            <MaterialCommunityIcons name={icon} size={16} color={accentColor} />
          </View>
        ) : (
          <View style={[styles.dot, { backgroundColor: accentColor }]} />
        )}
        <Text style={styles.label} numberOfLines={2}>{label}</Text>
      </View>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.55}>
        {safeValue}
      </Text>
      {subtitle ? (
        <View style={styles.footer}>
          {trend ? (
            <MaterialCommunityIcons
              name={trend === 'up' ? 'arrow-up' : trend === 'down' ? 'arrow-down' : 'minus'}
              size={12}
              color={trend === 'up' ? COLORS.textSuccess : trend === 'down' ? COLORS.textDanger : COLORS.textMuted}
            />
          ) : null}
          <Text style={styles.subtitle} numberOfLines={2}>{subtitle}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: RADIUS.lg,
    padding: 14,
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
    gap: 8,
    marginBottom: 10,
    minHeight: 26,
  },
  iconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  dot: { width: 6, height: 6, borderRadius: 3, marginLeft: 6, marginRight: 4 },
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
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.5,
    lineHeight: 26,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 6,
  },
  subtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    lineHeight: 15,
    flex: 1,
  },
});
