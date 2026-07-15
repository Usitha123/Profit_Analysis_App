import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, Rect, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ENROLMENT_CAPACITY } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import EquationBox from '../components/EquationBox';

const ACCENT = COLORS.accentGR;
const SCREEN_WIDTH = Dimensions.get('window').width;

const safeNum = (n, fallback = 0) =>
  typeof n === 'number' && isFinite(n) && !isNaN(n) ? n : fallback;

export default function GRScreen() {
  const insets = useSafeAreaInsets();
  const [capacity, setCapacity] = useState(ENROLMENT_CAPACITY);
  const [initialEnrol, setInitialEnrol] = useState(8);
  const [growthRate, setGrowthRate] = useState(0.18);
  const [months, setMonths] = useState(36);

  const results = useMemo(() => {
    const data = [];
    const K = capacity;
    const n0 = Math.min(initialEnrol, K - 1);
    const r = growthRate;

    for (let t = 0; t <= months; t++) {
      const N = K / (1 + ((K - n0) / n0) * Math.exp(-r * t));
      data.push({ month: t, enrolment: Math.round(N) });
    }

    const plateauEnrol = Math.round(K * 0.95);
    const plateauMonth = data.findIndex((d) => d.enrolment >= plateauEnrol);
    const monthsTo95 = plateauMonth >= 0 ? plateauMonth : months;
    const finalEnrol = data[data.length - 1]?.enrolment || 0;
    const totalGrowth = finalEnrol - n0;
    const avgGrowthPerMonth = totalGrowth / months;

    return {
      data,
      monthsTo95,
      finalEnrol,
      totalGrowth,
      avgGrowthPerMonth,
      K,
      n0,
      r,
      capacityUtilisation: Math.round((finalEnrol / K) * 100),
    };
  }, [capacity, initialEnrol, growthRate, months]);

  // Chart dimensions
  const chartW = Math.min(SCREEN_WIDTH - 76, 400);
  const chartH = 240;
  const pad = { top: 20, right: 10, bottom: 30, left: 45 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;

  const maxEnrol = Math.max(...results.data.map((d) => safeNum(d.enrolment)), safeNum(capacity), 1);
  const maxMonth = months || 1;

  const toX = (m) => {
    const x = pad.left + (m / maxMonth) * plotW;
    return safeNum(x, pad.left);
  };
  const toY = (e) => {
    const y = pad.top + plotH - (safeNum(e) / maxEnrol) * plotH;
    return safeNum(y, pad.top + plotH);
  };

  const curvePoints = results.data.map((d) => `${toX(d.month)},${toY(d.enrolment)}`).join(' ');

  // Capacity line
  const capY = toY(capacity);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Project enrolment growth using the logistic growth model. This S-curve model
        captures how enrolment accelerates initially and then plateaus as capacity is approached.
      </Text>

      {/* Metrics */}
      <View style={styles.grid3}>
        <MetricCard label="Final Enrolment" value={results.finalEnrol} accent={ACCENT} />
        <MetricCard label="Months to 95%" value={results.monthsTo95} accent={ACCENT} subtitle={`of ${months} months`} />
        <MetricCard label="Total Growth" value={`+${results.totalGrowth}`} accent={ACCENT} subtitle="children" />
        <MetricCard label="Capacity Util" value={`${results.capacityUtilisation}%`} accent={ACCENT} />
        <MetricCard label="Avg Growth/Mo" value={results.avgGrowthPerMonth.toFixed(1)} accent={ACCENT} />
        <MetricCard label="Max Capacity" value={capacity} accent={ACCENT} />
      </View>

      {/* Inputs */}
      <SectionTitle accent={ACCENT}>Growth Parameters</SectionTitle>
      <EquationBox accent={ACCENT}>
        N(t) = K / (1 + ((K − n₀) / n₀) × e^(−rt))
        {'\n'}K = capacity  |  n₀ = initial enrolment  |  r = growth rate
      </EquationBox>

      <SliderRow
        label="Max Capacity"
        unit="children"
        value={capacity}
        onChange={setCapacity}
        min={20}
        max={120}
        step={5}
        accent={ACCENT}
      />

      <SliderRow
        label="Initial Enrolment"
        unit="children"
        value={initialEnrol}
        onChange={setInitialEnrol}
        min={2}
        max={50}
        step={1}
        accent={ACCENT}
      />

      <SliderRow
        label="Growth Rate (r)"
        unit=""
        value={Math.round(growthRate * 100)}
        onChange={(v) => setGrowthRate(v / 100)}
        min={2}
        max={50}
        step={1}
        accent={ACCENT}
        formatValue={(v) => `${(v / 100).toFixed(2)}`}
      />

      <SliderRow
        label="Projection Period"
        unit="months"
        value={months}
        onChange={setMonths}
        min={6}
        max={60}
        step={6}
        accent={ACCENT}
        formatValue={(v) => `${v} mo`}
      />

      {/* Growth Chart */}
      <SectionTitle accent={ACCENT}>Growth Projection</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {/* Y-axis label */}
          <SvgText x={8} y={12} fontSize={9} fill="#6b7178" textAnchor="start">
            Enrolment
          </SvgText>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <Line
              key={r}
              x1={pad.left}
              y1={pad.top + plotH * (1 - r)}
              x2={chartW - pad.right}
              y2={pad.top + plotH * (1 - r)}
              stroke="#eee9dc"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}

          {/* Capacity line */}
          <Line
            x1={pad.left}
            y1={capY}
            x2={chartW - pad.right}
            y2={capY}
            stroke={COLORS.accentRed}
            strokeWidth={1.5}
            strokeDasharray="6,4"
          />
          <SvgText
            x={chartW - pad.right - 4}
            y={capY - 5}
            fontSize={8}
            fill={COLORS.accentRed}
            textAnchor="end"
          >
            Capacity ({capacity})
          </SvgText>

          {/* Growth curve */}
          <Polyline
            points={curvePoints}
            fill="none"
            stroke={ACCENT}
            strokeWidth={2.5}
          />

          {/* Start point */}
          <Circle cx={toX(0)} cy={toY(results.n0)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
          <SvgText
            x={toX(0) + 6}
            y={toY(results.n0) + 3}
            fontSize={8}
            fill={ACCENT}
            fontWeight="600"
          >
            n₀={results.n0}
          </SvgText>

          {/* End point */}
          <Circle cx={toX(months)} cy={toY(results.finalEnrol)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
          <SvgText
            x={toX(months) - 4}
            y={toY(results.finalEnrol) - 8}
            fontSize={8}
            fill={ACCENT}
            fontWeight="600"
            textAnchor="end"
          >
            {results.finalEnrol}
          </SvgText>

          {/* Legend */}
          <G x={chartW - 120} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Projected</SvgText>
            <Rect x={70} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
            <SvgText x={85} y={4} fontSize={9} fill="#6b7178">Capacity</SvgText>
          </G>
        </Svg>
      </View>

      {/* Monthly breakdown */}
      <SectionTitle accent={ACCENT}>Growth Milestones</SectionTitle>
      <View style={styles.grid3}>
        {[6, 12, 24, 36].filter((m) => m <= months).map((m) => {
          const pt = results.data.find((d) => d.month === m);
          if (!pt) return null;
          const pct = capacity > 0 ? Math.round((pt.enrolment / capacity) * 100) : 0;
          return (
            <MetricCard
              key={m}
              label={`Month ${m}`}
              value={`${pt.enrolment} children`}
              subtitle={`${pct}% capacity`}
              accent={pct > 80 ? COLORS.accentRed : ACCENT}
            />
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 26,
  },
  intro: {
    fontSize: 13.5,
    color: '#6b7178',
    lineHeight: 22,
    marginBottom: 16,
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  chartContainer: {
    backgroundColor: '#f6f2e8',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
});
