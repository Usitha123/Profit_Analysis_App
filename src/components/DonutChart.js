import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';
import { COLORS, CHART_PALETTE } from '../constants/theme';

const SIZE = 168;
const STROKE = 26;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;
// 2px of surface showing between neighbouring arcs, per mark spec.
const GAP = 2;

function safe(v) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

/**
 * Composition donut. Segments are drawn as dash-offset arcs on a single ring so
 * each slice keeps a 2px surface gap from its neighbour.
 *
 * Colours come from CHART_PALETTE by index unless `colors` is passed. Every
 * slice is also named and valued in the legend, so identity is never carried by
 * colour alone.
 */
export default function DonutChart({
  segments,
  labels,
  colors = CHART_PALETTE,
  formatValue = (v) => `Rs. ${Math.round(v).toLocaleString()}`,
  centerCaption = 'Total',
}) {
  const values = segments.map(safe);
  const total = values.reduce((sum, v) => sum + v, 0);

  let cursor = 0;
  const arcs = values.map((value, i) => {
    const length = total > 0 ? (value / total) * CIRCUMFERENCE : 0;
    // Keep a hairline for slices smaller than the gap so they stay visible.
    const drawn = length > 0 ? Math.max(length - GAP, 1) : 0;
    const arc = {
      key: i,
      color: colors[i % colors.length],
      dash: drawn,
      offset: -cursor,
      share: total > 0 ? (value / total) * 100 : 0,
      value,
    };
    cursor += length;
    return arc;
  });

  return (
    <View style={styles.wrap}>
      <View style={styles.chart}>
        <Svg width={SIZE} height={SIZE}>
          {/* -90deg so the first slice starts at 12 o'clock. */}
          <G rotation={-90} origin={`${SIZE / 2}, ${SIZE / 2}`}>
            <Circle
              cx={SIZE / 2}
              cy={SIZE / 2}
              r={RADIUS}
              stroke={COLORS.backgroundSecondary}
              strokeWidth={STROKE}
              fill="none"
            />
            {arcs.map((arc) => (arc.dash > 0 ? (
              <Circle
                key={arc.key}
                cx={SIZE / 2}
                cy={SIZE / 2}
                r={RADIUS}
                stroke={arc.color}
                strokeWidth={STROKE}
                strokeDasharray={[arc.dash, CIRCUMFERENCE - arc.dash]}
                strokeDashoffset={arc.offset}
                fill="none"
              />
            ) : null))}
          </G>
        </Svg>
        <View style={styles.center} pointerEvents="none">
          <Text style={styles.centerValue} numberOfLines={1}>{formatValue(total)}</Text>
          <Text style={styles.centerCaption}>{centerCaption}</Text>
        </View>
      </View>

      <View style={styles.legend}>
        {arcs.map((arc, i) => (
          <View key={arc.key} style={styles.legendRow}>
            <View style={[styles.swatch, { backgroundColor: arc.color }]} />
            <Text style={styles.legendLabel} numberOfLines={1}>{labels?.[i] ?? `Series ${i + 1}`}</Text>
            <Text style={styles.legendValue}>{formatValue(arc.value)}</Text>
            <Text style={styles.legendShare}>{arc.share.toFixed(0)}%</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 8,
  },
  chart: {
    alignSelf: 'center',
    width: SIZE,
    height: SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: STROKE,
  },
  centerValue: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  centerCaption: {
    marginTop: 2,
    fontSize: 9.5,
    fontWeight: '700',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: COLORS.textMuted,
  },
  legend: {
    marginTop: 16,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderTertiary,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: 3,
  },
  legendLabel: {
    flex: 1,
    fontSize: 12.5,
    color: COLORS.textPrimary,
  },
  legendValue: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  legendShare: {
    width: 38,
    textAlign: 'right',
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textPrimary,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
