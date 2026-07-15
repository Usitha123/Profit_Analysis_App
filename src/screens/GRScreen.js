import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, Rect, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';

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
  const chartH = 240;
  const pad = { top: 20, right: 12, bottom: 32, left: 48 };
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Month 6" value={month6?.enrolment ?? '-'} accent={ACCENT} />
        <MetricCard label="Month 12" value={month12?.enrolment ?? '-'} accent={ACCENT} />
        <MetricCard label="Break-even month" value={results.breakevenMonth != null ? `M${results.breakevenMonth}` : 'Not reached'} accent={results.breakevenMonth != null ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Months to 95%" value={results.monthsTo95} subtitle="capacity" accent={ACCENT} />
      </View>

      <SliderRow label="Initial enrolment N0 (Q6)" unit="children" value={planner.initialEnrolment}
        onChange={(v) => planner.update({ initialEnrolment: v })}
        min={5} max={50} step={1} accent={ACCENT} />
      <SliderRow label="Capacity K (Q5)" unit="children" value={planner.capacity}
        onChange={(v) => planner.update({ capacity: v })}
        min={15} max={120} step={1} accent={ACCENT} />
      <SliderRow label="Growth rate r"
        value={Math.round(planner.growthRate * 100)}
        onChange={(v) => planner.update({ growthRate: v / 100 })}
        min={5} max={40} step={1} accent={ACCENT}
        formatValue={(v) => `${(v / 100).toFixed(2)}`} />

      <SectionTitle accent={ACCENT}>Growth projection (36 months)</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <Line key={r} x1={pad.left} y1={pad.top + plotH * (1 - r)} x2={chartW - pad.right} y2={pad.top + plotH * (1 - r)} stroke="#eee9dc" strokeWidth={1} strokeDasharray="4,4" />
          ))}
          <Line x1={pad.left} y1={capY} x2={chartW - pad.right} y2={capY} stroke={COLORS.accentRed} strokeDasharray="6,4" strokeWidth={1.5} />
          {bepY ? (
            <Line x1={pad.left} y1={bepY} x2={chartW - pad.right} y2={bepY} stroke={COLORS.accentBE} strokeDasharray="4,3" strokeWidth={1.3} />
          ) : null}
          <Polyline points={curve} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          <Circle cx={toX(0)} cy={toY(planner.initialEnrolment)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
          <Circle cx={toX(months)} cy={toY(results.finalEnrolment)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />

          <G x={chartW - 170} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">N(t)</SvgText>
            <Rect x={44} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
            <SvgText x={59} y={4} fontSize={9} fill="#6b7178">Capacity</SvgText>
            <Rect x={104} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentBE} />
            <SvgText x={119} y={4} fontSize={9} fill="#6b7178">Break-even</SvgText>
          </G>
        </Svg>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chartContainer: { backgroundColor: '#f6f2e8', borderRadius: 10, padding: 12, alignItems: 'center' },
});
