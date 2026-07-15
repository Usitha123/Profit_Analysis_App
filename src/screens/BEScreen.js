import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, G, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ENROLMENT_CAPACITY, TUITION_RATE } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import ResultBox from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import InfoBox from '../components/InfoBox';
import { StackedBar } from '../components/GaugeBar';

const { calculateBreakEven } = require('../utils/calculations');

const ACCENT = COLORS.accentBE;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function BEScreen() {
  const insets = useSafeAreaInsets();
  const [fixedCost, setFixedCost] = useState(215000);
  const [variableCostPerChild, setVariableCostPerChild] = useState(9800);
  const [tuition, setTuition] = useState(TUITION_RATE);

  const results = useMemo(() => calculateBreakEven({
    fixedCost,
    variableCostPerChild,
    tuition,
    capacity: ENROLMENT_CAPACITY,
  }), [fixedCost, tuition, variableCostPerChild]);

  const pl30 = 30 * tuition - (fixedCost + 30 * variableCostPerChild);
  const maxX = Math.min(Math.max(ENROLMENT_CAPACITY, Number.isFinite(results.breakevenUnits) ? results.breakevenUnits + 10 : ENROLMENT_CAPACITY), 120);
  const points = [];
  for (let childCount = 0; childCount <= maxX; childCount += 5) {
    points.push({
      x: childCount,
      revenue: childCount * tuition,
      totalCost: fixedCost + childCount * variableCostPerChild,
    });
  }

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 240;
  const pad = { top: 20, right: 12, bottom: 32, left: 52 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxVal = Math.max(...points.map((point) => Math.max(point.revenue, point.totalCost)), 1);
  const toX = (value) => pad.left + (value / maxX) * plotW;
  const toY = (value) => pad.top + plotH - (value / maxVal) * plotH;

  const revenuePoints = points.map((point) => `${toX(point.x)},${toY(point.revenue)}`).join(' ');
  const costPoints = points.map((point) => `${toX(point.x)},${toY(point.totalCost)}`).join(' ');
  const beX = Number.isFinite(results.breakevenUnits) ? toX(results.breakevenUnits) : null;
  const beY = Number.isFinite(results.breakevenRevenue) ? toY(results.breakevenRevenue) : null;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 26 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Break-even converts the cost model into a simple question: how many enrolled children do you need
        before revenue covers both the monthly fixed base and the variable cost of each child served.
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Break-even" value={Number.isFinite(results.breakevenUnits) ? `${results.breakevenUnits} children` : 'Not reachable'} accent={ACCENT} />
        <MetricCard label="BE revenue" value={Number.isFinite(results.breakevenRevenue) ? `Rs. ${results.breakevenRevenue.toLocaleString()}` : '-'} accent={ACCENT} />
        <MetricCard label="Contribution" value={`Rs. ${results.contributionMargin.toLocaleString()}`} subtitle="per child per month" accent={ACCENT} />
        <MetricCard label="P/L at 30" value={`Rs. ${pl30.toLocaleString()}`} subtitle={pl30 >= 0 ? 'profit before depreciation' : 'loss before depreciation'} accent={pl30 >= 0 ? ACCENT : COLORS.accentRed} />
      </View>

      <InfoBox
        title="Variables to determine"
        accent={ACCENT}
        items={[
          { label: 'Fixed cost total:', text: 'Use the monthly floor from the cost model after staffing, rent, utilities, and marketing.' },
          { label: 'Variable cost per child:', text: 'Bundle food, supplies, activity materials, and maintenance into one child-level contribution.' },
          { label: 'Fee per child:', text: 'Use the actual monthly tuition plus any recurring add-on charge you expect to collect.' },
        ]}
      />

      <SectionTitle accent={ACCENT}>Core assumptions</SectionTitle>
      <EquationBox accent={ACCENT}>
        Break-even children = fixed cost / (fee per child - variable cost per child)
      </EquationBox>

      <SliderRow
        label="Fixed monthly cost"
        unit="Rs."
        value={fixedCost}
        onChange={setFixedCost}
        min={100000}
        max={700000}
        step={5000}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      <SliderRow
        label="Variable cost per child"
        unit="Rs."
        value={variableCostPerChild}
        onChange={setVariableCostPerChild}
        min={2000}
        max={20000}
        step={250}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      <SliderRow
        label="Monthly fee per child"
        unit="Rs."
        value={tuition}
        onChange={setTuition}
        min={15000}
        max={70000}
        step={500}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      <SectionTitle accent={ACCENT}>Cost composition</SectionTitle>
      <StackedBar
        segments={[fixedCost, variableCostPerChild]}
        colors={[ACCENT, '#c0574f']}
        labels={[
          `Fixed monthly base: Rs. ${fixedCost.toLocaleString()}`,
          `Variable per child: Rs. ${variableCostPerChild.toLocaleString()}`,
        ]}
      />

      {Number.isFinite(results.breakevenUnits) && results.breakevenUnits <= ENROLMENT_CAPACITY ? (
        <ResultBox type="ok">
          Break-even occurs at {results.breakevenUnits} children. At that point revenue and total operating
          cost intersect before depreciation and capital recovery are considered.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Break-even exceeds the current capacity planning range. Reduce fixed costs, reduce variable cost
          per child, or increase tuition before opening.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Break-even chart</SectionTitle>
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
          <Polyline points={revenuePoints} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          <Polyline points={costPoints} fill="none" stroke={COLORS.accentRed} strokeWidth={2.5} />

          {beX !== null && beY !== null ? (
            <>
              <Line x1={beX} y1={pad.top + plotH} x2={beX} y2={beY} stroke={ACCENT} strokeDasharray="6,3" strokeWidth={1.5} />
              <Circle cx={beX} cy={beY} r={5} fill={ACCENT} stroke="#fff" strokeWidth={2} />
              <SvgText x={beX} y={beY - 10} fontSize={9} fill={ACCENT} fontWeight="700" textAnchor="middle">BE</SvgText>
            </>
          ) : null}

          <G x={chartW - 140} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Revenue</SvgText>
            <Rect x={70} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
            <SvgText x={85} y={4} fontSize={9} fill="#6b7178">Total cost</SvgText>
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
