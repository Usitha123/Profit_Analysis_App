import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

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

  return (
    <View style={[styles.card, { borderTopColor: accent || '#2563eb' }, style]}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.7}>
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
    borderTopWidth: 2.5,
    borderRadius: 12,
    padding: 13,
    paddingHorizontal: 11,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 145,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  label: {
    fontSize: 10,
    color: '#64748b',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
    fontWeight: '600',
    lineHeight: 13,
  },
  value: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 14.5,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
  },
  sub: {
    fontSize: 10.5,
    color: '#64748b',
    marginTop: 2,
    lineHeight: 14,
  },
});
