import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function GaugeBar({ label, value, max, accent = '#3d6ea5', format }) {
  const rawPct = max > 0 ? (value / max) * 100 : 0;
  const pct = isNaN(rawPct) || !isFinite(rawPct)
    ? 0
    : Math.max(0, Math.min(100, Math.round(rawPct)));
  const displayValue = format ? format(value) : value;

  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${pct}%`, backgroundColor: accent }]} />
      </View>
      <Text style={[styles.val, { color: accent }]}>{displayValue}</Text>
    </View>
  );
}

export function StackedBar({ segments, colors, labels }) {
  const total = segments.reduce((s, v) => s + (isNaN(v) ? 0 : v), 0);
  return (
    <View style={styles.stackContainer}>
      <View style={styles.barStack}>
        {segments.map((val, i) => {
          const safeVal = isNaN(val) ? 0 : val;
          const rawW = total > 0 ? (safeVal / total) * 100 : 0;
          const pct = isNaN(rawW) || !isFinite(rawW) ? 0 : Math.max(0, Math.min(100, rawW));
          return (
            <View
              key={i}
              style={[
                styles.barSeg,
                {
                  width: `${pct}%`,
                  backgroundColor: colors[i] || '#ccc',
                },
              ]}
            />
          );
        })}
      </View>
      {labels && (
        <View style={styles.legend}>
          {labels.map((lbl, i) => (
            <View key={i} style={styles.legendItemContainer}>
              <View style={[styles.swatch, { backgroundColor: colors[i] }]} />
              <Text style={styles.legendItem}>
                {lbl}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#6b7178',
    minWidth: 100,
  },
  track: {
    flex: 1,
    height: 20,
    backgroundColor: '#f6f2e8',
    borderRadius: 6,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e6e0d0',
  },
  fill: {
    height: '100%',
    borderRadius: 6,
  },
  val: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    fontWeight: '700',
    minWidth: 90,
    textAlign: 'right',
  },
  stackContainer: {
    marginVertical: 8,
  },
  barStack: {
    flexDirection: 'row',
    height: 24,
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#e6e0d0',
  },
  barSeg: {
    height: '100%',
  },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 8,
  },
  legendItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  legendItem: {
    fontSize: 11.5,
    color: '#6b7178',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  swatch: {
    width: 9,
    height: 9,
    borderRadius: 3,
  },
});
