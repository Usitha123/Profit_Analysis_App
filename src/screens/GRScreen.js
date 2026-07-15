import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, Rect, G } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ENROLMENT_CAPACITY } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import InfoBox from '../components/InfoBox';

const { calculateGrowth } = require('../utils/calculations');

const ACCENT = COLORS.accentGR;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function GRScreen() {
  const insets = useSafeAreaInsets();
  const [capacity, setCapacity] = useState(ENROLMENT_CAPACITY);
  const [initialEnrolment, setInitialEnrolment] = useState(12);
  const [growthRate, setGrowthRate] = useState(0.18);
  const [months, setMonths] = useState(36);

  const results = useMemo(() => calculateGrowth({
    capacity,
    initialEnrolment,
    growthRate,
    months,
  }), [capacity, growthRate, initialEnrolment, months]);

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 240;
  const pad = { top: 20, right: 12, bottom: 32, left: 48 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxMonth = Math.max(months, 1);
  const maxVal = Math.max(capacity, ...results.points.map((point) => point.enrolment), 1);
  const toX = (value) => pad.left + (value / maxMonth) * plotW;
  const toY = (value) => pad.top + plotH - (value / maxVal) * plotH;
  const curve = results.points.map((point) => `${toX(point.month)},${toY(point.enrolment)}`).join(' ');
  const capY = toY(capacity);
  const month12 = results.points.find((point) => point.month === Math.min(12, months));
  const month24 = results.points.find((point) => point.month === Math.min(24, months));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 26 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        The growth tab uses a logistic S-curve. Enrolment accelerates early while awareness builds, then
        growth naturally slows as you get close to the centre's physical capacity.
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Final enrolment" value={results.finalEnrolment} accent={ACCENT} />
        <MetricCard label="Months to 95%" value={results.monthsTo95} subtitle="capacity threshold" accent={ACCENT} />
        <MetricCard label="Month 12" value={month12?.enrolment ?? '-'} accent={ACCENT} />
        <MetricCard label="Month 24" value={month24?.enrolment ?? '-'} accent={ACCENT} />
      </View>

      <InfoBox
        title="Variables to determine"
        accent={ACCENT}
        items={[
          { label: 'Capacity K:', text: 'Use the true licensed or physically possible child count, not an aspirational number.' },
          { label: 'Initial enrolment n0:', text: 'Set the realistic launch-month enrolment after pre-sales and first tours.' },
          { label: 'Growth rate r:', text: 'Higher values imply faster parent acquisition and quicker word-of-mouth spread.' },
        ]}
      />

      <SectionTitle accent={ACCENT}>Growth equation</SectionTitle>
      <EquationBox accent={ACCENT}>
        N(t) = K / (1 + ((K - n0) / n0) x e^(-rt))
      </EquationBox>

      <SliderRow
        label="Capacity K"
        unit="children"
        value={capacity}
        onChange={setCapacity}
        min={20}
        max={120}
        step={5}
        accent={ACCENT}
      />

      <SliderRow
        label="Initial enrolment n0"
        unit="children"
        value={initialEnrolment}
        onChange={setInitialEnrolment}
        min={2}
        max={50}
        step={1}
        accent={ACCENT}
      />

      <SliderRow
        label="Growth rate r"
        value={Math.round(growthRate * 100)}
        onChange={(value) => setGrowthRate(value / 100)}
        min={5}
        max={50}
        step={1}
        accent={ACCENT}
        formatValue={(value) => `${(value / 100).toFixed(2)}`}
      />

      <SliderRow
        label="Projection period"
        unit="months"
        value={months}
        onChange={setMonths}
        min={6}
        max={60}
        step={6}
        accent={ACCENT}
      />

      <SectionTitle accent={ACCENT}>Growth projection</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
            <Line
              key={ratio}
              x1={pad.left}
              y1={pad.top + plotH * (1 - ratio)}
              x2={chartW - pad.right}
              y2={pad.top + plotH * (1 - ratio)}
              stroke="#eee9dc"
              strokeWidth={1}
              strokeDasharray="4,4"
            />
          ))}
          <Line x1={pad.left} y1={capY} x2={chartW - pad.right} y2={capY} stroke={COLORS.accentRed} strokeDasharray="6,4" strokeWidth={1.5} />
          <Polyline points={curve} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          <Circle cx={toX(0)} cy={toY(initialEnrolment)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />
          <Circle cx={toX(months)} cy={toY(results.finalEnrolment)} r={4} fill={ACCENT} stroke="#fff" strokeWidth={2} />

          <G x={chartW - 120} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Projected</SvgText>
            <Rect x={70} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
            <SvgText x={85} y={4} fontSize={9} fill="#6b7178">Capacity</SvgText>
          </G>
        </Svg>
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
    paddingHorizontal: 18,
    paddingTop: 18,
  },
  intro: {
    fontSize: 13.5,
    color: '#6b7178',
    lineHeight: 21,
    marginBottom: 14,
  },
  metrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  chartContainer: {
    backgroundColor: '#f6f2e8',
    borderRadius: 10,
    padding: 12,
    alignItems: 'center',
  },
});
