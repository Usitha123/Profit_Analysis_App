import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function MetricCard({ label, value, subtitle, accent, sub }) {
  // Guard: never render raw NaN to the screen
  const safeValue = (value === null || value === undefined || (typeof value === 'number' && isNaN(value)))
    ? '—'
    : String(value);
  return (
    <View style={[styles.card, { borderTopColor: accent || '#3d6ea5' }]}>
      <Text style={styles.label} numberOfLines={2}>{label}</Text>
      <Text style={styles.value} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
        {safeValue}
      </Text>
      {subtitle ? <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text> : null}
      {sub !== undefined ? <Text style={styles.sub} numberOfLines={1}>{sub}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#f6f2e8',
    borderTopWidth: 3,
    borderRadius: 10,
    padding: 12,
    paddingHorizontal: 11,
    flex: 1,
    // minWidth forces at most 3 cards per row in flex-wrap grids
    minWidth: '30%',
  },
  label: {
    fontSize: 10,
    color: '#6b7178',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    marginBottom: 4,
    fontWeight: '600',
    lineHeight: 13,
  },
  value: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 15,
    fontWeight: '700',
    color: '#232a2e',
  },
  subtitle: {
    fontSize: 10,
    color: '#6b7178',
    marginTop: 2,
  },
  sub: {
    fontSize: 10.5,
    color: '#6b7178',
    marginTop: 2,
  },
});
