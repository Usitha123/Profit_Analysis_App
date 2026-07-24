import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, Rect, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import Section from '../components/Section';

const { calculateGrowth } = require('../utils/calculations');

const ACCENT = COLORS.accentGR;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function GRScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();
  const months = 36;

  const results = useMemo(() => calculateGrowth({
    capacity: planner.capacity,
    initialEnrolment: planner.initialEnrolment,
    growthRate: planner.growthRate,
    months,
    breakevenUnits: planner.breakevenUnits,
  }), [planner.capacity, planner.growthRate, planner.initialEnrolment, planner.breakevenUnits]);

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 260;
  const pad = { top: 16, right: 14, bottom: 42, left: 48 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxVal = Math.max(planner.capacity, ...results.points.map((p) => p.enrolment), 1);
  const toX = (v) => pad.left + (v / months) * plotW;
  const toY = (v) => pad.top + plotH - (v / maxVal) * plotH;
  const curve = results.points.map((p) => `${toX(p.month)},${toY(p.enrolment)}`).join(' ');
  const capY = toY(planner.capacity);
  const bep = Number.isFinite(planner.breakevenUnits) ? Math.ceil(planner.breakevenUnits) : null;
  const bepY = bep ? toY(bep) : null;
  const month6 = results.points.find((p) => p.month === 6);
  const month12 = results.points.find((p) => p.month === 12);
  const xTicks = [0, 6, 12, 18, 24, 30, 36];
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(maxVal * r));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Month 6" value={month6?.enrolment ?? '—'} accent={ACCENT} icon="calendar-month-outline" />
        <MetricCard label="Month 12" value={month12?.enrolment ?? '—'} accent={ACCENT} icon="calendar-check-outline" />
        <MetricCard label="Break-even month" value={results.breakevenMonth != null ? `M${results.breakevenMonth}` : 'Not reached'} accent={results.breakevenMonth != null ? ACCENT : COLORS.accentRed} icon="flag-outline" />
        <MetricCard label="Months to 95%" value={results.monthsTo95} subtitle="capacity" accent={ACCENT} icon="gauge" />
      </View>

      <Section title="Growth parameters" icon="tune" accent={ACCENT}>
        <SliderRow plain label="Initial enrolment N0" unit="children" value={planner.initialEnrolment}
          onChange={(v) => planner.update({ initialEnrolment: v })}
          min={5} max={50} step={1} accent={ACCENT} />
        <SliderRow plain label="Capacity K" unit="children" value={planner.capacity}
          onChange={(v) => planner.update({ capacity: v })}
          min={15} max={120} step={1} accent={ACCENT} />
        <SliderRow plain label="Growth rate r"
          value={Math.round(planner.growthRate * 100)}
          onChange={(v) => planner.update({ growthRate: v / 100 })}
          min={5} max={40} step={1} accent={ACCENT}
          formatValue={(v) => `${(v / 100).toFixed(2)}`} />
      </Section>

      <Section title="Growth projection (36 months)" icon="chart-bell-curve-cumulative" accent={ACCENT}>
        <View style={styles.chartContainer}>
          <Svg width={chartW} height={chartH}>
            {yTicks.map((tick, i) => {
              const ratio = tick / maxVal;
              const y = pad.top + plotH * (1 - ratio);
              return (
                <G key={`y-${i}`}>
                  <Line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="#eef0f3" strokeWidth={1} />
                  <SvgText x={pad.left - 6} y={y + 3} fontSize={9} fill={COLORS.textMuted} textAnchor="end">{tick}</SvgText>
                </G>
              );
            })}
            {xTicks.map((tick, i) => (
              <SvgText key={`x-${i}`} x={toX(tick)} y={pad.top + plotH + 16} fontSize={9} fill={COLORS.textMuted} textAnchor="middle">{tick}</SvgText>
            ))}
            <SvgText x={pad.left + plotW / 2} y={chartH - 4} fontSize={10} fill={COLORS.textSecondary} fontWeight="600" textAnchor="middle">Months</SvgText>
            <SvgText x={10} y={pad.top + plotH / 2} fontSize={10} fill={COLORS.textSecondary} fontWeight="600" textAnchor="middle" transform={`rotate(-90, 10, ${pad.top + plotH / 2})`}>Enrolment N(t)</SvgText>

            <Line x1={pad.left} y1={capY} x2={chartW - pad.right} y2={capY} stroke={COLORS.accentRed} strokeDasharray="6,4" strokeWidth={1.5} />
            {bepY ? (
              <Line x1={pad.left} y1={bepY} x2={chartW - pad.right} y2={bepY} stroke={COLORS.accentBE} strokeDasharray="4,3" strokeWidth={1.3} />
            ) : null}
            <Polyline points={curve} fill="none" stroke={ACCENT} strokeWidth={2.5} />
            <Circle cx={toX(0)} cy={toY(planner.initialEnrolment)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
            <Circle cx={toX(months)} cy={toY(results.finalEnrolment)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />

            <G x={chartW - 170} y={4}>
              <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
              <SvgText x={15} y={4} fontSize={9} fill={COLORS.textSecondary}>N(t)</SvgText>
              <Rect x={44} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
              <SvgText x={59} y={4} fontSize={9} fill={COLORS.textSecondary}>Capacity</SvgText>
              <Rect x={104} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentBE} />
              <SvgText x={119} y={4} fontSize={9} fill={COLORS.textSecondary}>Break-even</SvgText>
            </G>
          </Svg>
        </View>
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chartContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, alignItems: 'center' },
});
