import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet, Dimensions,
} from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, G, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { TUITION_RATE, ENROLMENT_CAPACITY } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import EquationBox from '../components/EquationBox';

const ACCENT = COLORS.accentBE;
const SCREEN_WIDTH = Dimensions.get('window').width;

const safeNum = (n, fallback = 0) =>
  typeof n === 'number' && isFinite(n) && !isNaN(n) ? n : fallback;

export default function BEScreen() {
  const insets = useSafeAreaInsets();
  const [fixedCost, setFixedCost] = useState(12500);
  const [varCostPerChild, setVarCostPerChild] = useState(1200);
  const [tuition, setTuition] = useState(TUITION_RATE);

  const results = useMemo(() => {
    const contributionMargin = tuition - varCostPerChild;
    const breakevenUnits = contributionMargin > 0
      ? Math.ceil(fixedCost / contributionMargin)
      : Infinity;
    const breakevenRevenue = breakevenUnits === Infinity ? Infinity : breakevenUnits * tuition;

    // Generate chart data
    const chartData = [];
    const maxX = Math.max(ENROLMENT_CAPACITY, breakevenUnits + 10);
    const steps = 20;
    const stepSize = maxX / steps;
    let foundBE = false;

    for (let i = 0; i <= steps; i++) {
      const x = Math.round(i * stepSize);
      const revenue = x * tuition;
      const totalCost = fixedCost + x * varCostPerChild;
      if (!foundBE && revenue >= totalCost && x > 0) {
        foundBE = true;
      }
      chartData.push({ x, revenue, totalCost });
    }

    // P&L at breakeven
    const plAtEnrolment = (enrol) => ({
      revenue: enrol * tuition,
      costs: fixedCost + enrol * varCostPerChild,
      profit: enrol * tuition - (fixedCost + enrol * varCostPerChild),
    });

    return {
      contributionMargin,
      breakevenUnits,
      breakevenRevenue,
      chartData,
      maxX,
      plAtEnrolment,
    };
  }, [fixedCost, varCostPerChild, tuition]);

  // Chart dimensions
  const chartW = Math.min(SCREEN_WIDTH - 76, 400);
  const chartH = 240;
  const pad = { top: 20, right: 10, bottom: 30, left: 50 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;

  const maxVal = Math.max(
    ...results.chartData.map((d) => Math.max(safeNum(d.revenue), safeNum(d.totalCost))),
    safeNum(results.breakevenRevenue, 0),
    1
  );

  const toX = (x) => {
    const px = pad.left + (x / (results.maxX || 1)) * plotW;
    return safeNum(px, pad.left);
  };
  const toY = (v) => {
    const py = pad.top + plotH - (safeNum(v) / maxVal) * plotH;
    return safeNum(py, pad.top + plotH);
  };

  const revPoints = results.chartData.map((d) => `${toX(d.x)},${toY(d.revenue)}`).join(' ');
  const costPoints = results.chartData.map((d) => `${toX(d.x)},${toY(d.totalCost)}`).join(' ');

  const beX = results.breakevenUnits !== Infinity ? toX(results.breakevenUnits) : null;
  const beY = results.breakevenRevenue !== Infinity ? toY(results.breakevenRevenue) : null;

  // Breakeven assessment
  const pl50 = results.plAtEnrolment(50);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Calculate how many enrolled children you need to cover all costs.
        Adjust fixed costs, variable costs per child, and tuition fees below.
      </Text>

      {/* Metrics */}
      <View style={styles.grid4}>
        <MetricCard
          label="Break-Even"
          value={results.breakevenUnits === Infinity ? '—' : `${results.breakevenUnits} children`}
          accent={ACCENT}
        />
        <MetricCard
          label="BE Revenue"
          value={results.breakevenRevenue === Infinity ? '—' : `$${results.breakevenRevenue.toLocaleString()}`}
          accent={ACCENT}
        />
        <MetricCard
          label="Contribution"
          value={`$${results.contributionMargin}`}
          subtitle="per child"
          accent={ACCENT}
        />
        <MetricCard
          label="P&L @ 50"
          value={`$${pl50.profit.toLocaleString()}`}
          subtitle={pl50.profit >= 0 ? 'Profit' : 'Loss'}
          accent={pl50.profit >= 0 ? ACCENT : COLORS.accentRed}
        />
      </View>

      {/* Inputs */}
      <SectionTitle accent={ACCENT}>Key Assumptions</SectionTitle>
      <EquationBox accent={ACCENT}>
        BE (units) = Fixed Costs / (Tuition − Variable Cost per Child)
      </EquationBox>

      <SliderRow
        label="Fixed Costs"
        unit="$/mo"
        value={fixedCost}
        onChange={setFixedCost}
        min={3000}
        max={35000}
        step={500}
        accent={ACCENT}
        formatValue={(v) => `$${v.toLocaleString()}`}
      />

      <SliderRow
        label="Variable Cost / Child"
        unit="$/mo"
        value={varCostPerChild}
        onChange={setVarCostPerChild}
        min={300}
        max={2500}
        step={50}
        accent={ACCENT}
        formatValue={(v) => `$${v}`}
      />

      <SliderRow
        label="Tuition Fee"
        unit="$/mo"
        value={tuition}
        onChange={setTuition}
        min={500}
        max={2000}
        step={25}
        accent={ACCENT}
        formatValue={(v) => `$${v}`}
      />

      {/* Chart */}
      <SectionTitle accent={ACCENT}>Break-Even Chart</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {/* Y-axis label */}
          <SvgText x={8} y={12} fontSize={9} fill="#6b7178" textAnchor="start">
            $
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

          {/* Revenue line */}
          <Polyline
            points={revPoints}
            fill="none"
            stroke={COLORS.accentLP}
            strokeWidth={2.5}
          />

          {/* Cost line */}
          <Polyline
            points={costPoints}
            fill="none"
            stroke={COLORS.accentRed}
            strokeWidth={2.5}
          />

          {/* Breakeven point */}
          {beX !== null && beY !== null && (
            <>
              <Line
                x1={beX}
                y1={pad.top + plotH}
                x2={beX}
                y2={beY}
                stroke={ACCENT}
                strokeWidth={1.5}
                strokeDasharray="6,3"
              />
              <Line
                x1={pad.left}
                y1={beY}
                x2={beX}
                y2={beY}
                stroke={ACCENT}
                strokeWidth={1.5}
                strokeDasharray="6,3"
              />
              <Circle cx={beX} cy={beY} r={5} fill={ACCENT} stroke="#fff" strokeWidth={2} />
              <SvgText
                x={beX}
                y={beY - 10}
                fontSize={9}
                fill={ACCENT}
                fontWeight="700"
                textAnchor="middle"
              >
                BE
              </SvgText>
              <SvgText
                x={beX}
                y={pad.top + plotH + 14}
                fontSize={9}
                fill={ACCENT}
                fontWeight="600"
                textAnchor="middle"
              >
                {results.breakevenUnits} children
              </SvgText>
            </>
          )}

          {/* Legend */}
          <G x={chartW - 130} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentLP} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Revenue</SvgText>
            <Rect x={65} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
            <SvgText x={80} y={4} fontSize={9} fill="#6b7178">Total Cost</SvgText>
          </G>
        </Svg>
      </View>

      {/* P&L at key enrolment levels */}
      <SectionTitle accent={ACCENT}>Profit & Loss at Key Levels</SectionTitle>
      <View style={styles.grid3}>
        {[30, 50, ENROLMENT_CAPACITY].map((n) => {
          const pl = results.plAtEnrolment(n);
          return (
            <MetricCard
              key={n}
              label={`@ ${n} Children`}
              value={`$${pl.profit.toLocaleString()}`}
              subtitle={pl.profit >= 0 ? 'Profit' : 'Loss'}
              accent={pl.profit >= 0 ? ACCENT : COLORS.accentRed}
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
  grid4: {
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
