import React, { useMemo } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, G, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ACTIVITIES, BE_MKT_CHANNELS } from '../constants/modelData';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import CheckRow from '../components/CheckRow';
import ResultBox from '../components/ResultBox';
import Section from '../components/Section';
import DonutChart from '../components/DonutChart';
import DataTable from '../components/DataTable';

const { allocateMarketing } = require('../utils/calculations');

const ACCENT = COLORS.accentBE;
const SCREEN_WIDTH = Dimensions.get('window').width;

function formatCurrencyShort(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

export default function BEScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();

  const activities = useMemo(
    () => ACTIVITIES.map((meta) => {
      const saved = (planner.activities || []).find((a) => a.id === meta.id);
      return { ...meta, on: saved?.on ?? meta.defaultOn, annualCost: saved?.annualCost ?? meta.annual };
    }),
    [planner.activities],
  );

  const fixedCost = planner.fixedCost;
  const variableCostPerChild = planner.variableCost;
  const effectiveFee = planner.effectiveFee;
  const contribution = planner.contribution;
  const bep = planner.breakevenUnits;
  const bepDisplay = Number.isFinite(bep) ? Math.ceil(bep) : null;
  const activitiesMonthly = planner.activitiesMonthly;

  const mktAllocation = useMemo(
    () => allocateMarketing(planner.marketingFixed, BE_MKT_CHANNELS),
    [planner.marketingFixed],
  );

  const toggleActivity = (id) => {
    const next = activities.map((a) => a.id === id ? { ...a, on: !a.on } : a);
    planner.update({ activities: next.map(({ id, on, annualCost }) => ({ id, on, annualCost })) });
  };
  const setActivityCost = (id, val) => {
    const next = activities.map((a) => a.id === id ? { ...a, annualCost: val } : a);
    planner.update({ activities: next.map(({ id, on, annualCost }) => ({ id, on, annualCost })) });
  };

  const maxX = Math.min(Math.max(100, bepDisplay ? bepDisplay + 10 : 100), 120);
  const points = [];
  for (let n = 0; n <= maxX; n += 5) {
    points.push({ x: n, revenue: n * effectiveFee, totalCost: fixedCost + n * variableCostPerChild });
  }

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 260;
  const pad = { top: 16, right: 14, bottom: 42, left: 60 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxVal = Math.max(...points.map((p) => Math.max(p.revenue, p.totalCost)), 1);
  const toX = (v) => pad.left + (v / maxX) * plotW;
  const toY = (v) => pad.top + plotH - (v / maxVal) * plotH;
  const revenuePoints = points.map((p) => `${toX(p.x)},${toY(p.revenue)}`).join(' ');
  const costPoints = points.map((p) => `${toX(p.x)},${toY(p.totalCost)}`).join(' ');
  const fcY = toY(fixedCost);
  const beX = bepDisplay ? toX(bepDisplay) : null;
  const beY = bepDisplay ? toY(bepDisplay * effectiveFee) : null;
  const xTicks = [0, Math.round(maxX * 0.25), Math.round(maxX * 0.5), Math.round(maxX * 0.75), maxX];
  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((r) => Math.round(maxVal * r));

  const p30 = 30 * effectiveFee - (fixedCost + 30 * variableCostPerChild);
  const mktRows = mktAllocation.map((c) => [c.label, `Rs. ${c.allocation.toLocaleString()}`, c.reach]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Break-even" value={bepDisplay ? `${bepDisplay} children` : 'Not reachable'} accent={ACCENT} icon="target" />
        <MetricCard label="Fixed cost total" value={`Rs. ${fixedCost.toLocaleString()}`} accent={ACCENT} icon="home-outline" />
        <MetricCard label="Variable / child" value={`Rs. ${variableCostPerChild.toLocaleString()}`} accent={ACCENT} icon="silverware-fork-knife" />
        <MetricCard label="Contribution" value={`Rs. ${contribution.toLocaleString()}`} subtitle="fee − variable" accent={contribution > 0 ? ACCENT : COLORS.accentRed} icon="trending-up" trend={contribution > 0 ? 'up' : 'down'} />
        <MetricCard label="Effective fee" value={`Rs. ${effectiveFee.toLocaleString()}`} accent={ACCENT} icon="tag-outline" />
        <MetricCard label="P/L at 30" value={`Rs. ${p30.toLocaleString()}`} subtitle={p30 >= 0 ? 'profit before deprec.' : 'loss before deprec.'} accent={p30 >= 0 ? ACCENT : COLORS.accentRed} icon="chart-line" trend={p30 >= 0 ? 'up' : 'down'} />
      </View>

      <Section title="Fee per child" icon="tag-outline" accent={ACCENT}>
        <SliderRow
          plain
          label="Base monthly fee"
          unit="Rs."
          value={planner.fee}
          onChange={(v) => planner.update({ fee: v })}
          min={5000} max={30000} step={500}
          accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`}
        />
        <CheckRow
          plain
          label="Add-on fee (transport, meals, hours)"
          checked={planner.addFeeOn}
          onToggle={() => planner.update({ addFeeOn: !planner.addFeeOn })}
          accent={ACCENT}
        />
        {planner.addFeeOn ? (
          <SliderRow
            plain
            label="Add-on fee amount"
            unit="Rs."
            value={planner.addFee}
            onChange={(v) => planner.update({ addFee: v })}
            min={0} max={20000} step={500}
            accent={ACCENT}
            formatValue={(v) => `Rs. ${v.toLocaleString()}`}
          />
        ) : null}
      </Section>

      <Section title="Fixed monthly cost (Rs. / month)" icon="home-outline" accent={ACCENT}>
        <SliderRow plain label="Rent" unit="Rs." value={planner.rent}
          onChange={(v) => planner.update({ rent: v })}
          min={10000} max={300000} step={2500} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Utilities" unit="Rs." value={planner.utilities}
          onChange={(v) => planner.update({ utilities: v })}
          min={10000} max={80000} step={2500} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Total staff salaries" unit="Rs." value={planner.staffSalaries}
          onChange={(v) => planner.update({ staffSalaries: v })}
          min={50000} max={600000} step={5000} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Insurance and other" unit="Rs." value={planner.otherFixed}
          onChange={(v) => planner.update({ otherFixed: v })}
          min={5000} max={80000} step={2500} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Marketing" unit="Rs." value={planner.marketingFixed}
          onChange={(v) => planner.update({ marketingFixed: v })}
          min={2500} max={60000} step={500} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      </Section>

      <Section title="Marketing mix" icon="bullhorn-outline" accent={ACCENT} defaultOpen={false}>
        <Text style={styles.hint}>Allocated proportionally from your marketing total (Rs. {planner.marketingFixed.toLocaleString()}/mo).</Text>
        <DataTable columns={['Channel', 'Budget', 'Expected reach']} rows={mktRows} flexes={[1.5, 1, 1.5]} />
      </Section>

      <Section title="Annual activities" icon="party-popper" accent={ACCENT} defaultOpen={false}>
        <Text style={styles.hint}>Total annual activity spend gets amortised into fixed cost. Currently Rs. {activitiesMonthly.toLocaleString()}/mo.</Text>
        {activities.map((a) => (
          <CheckRow
            key={a.id}
            plain
            label={`${a.label} (Rs. ${a.annualCost.toLocaleString()}/yr)`}
            checked={a.on}
            onToggle={() => toggleActivity(a.id)}
            value={a.annualCost}
            onChangeValue={(v) => setActivityCost(a.id, v)}
            unit="Rs./yr"
            accent={ACCENT}
          />
        ))}
      </Section>

      <Section title="Variable cost per child" icon="silverware-fork-knife" accent={ACCENT} defaultOpen={false}>
        <SliderRow plain label="Food and supplies" unit="Rs./child" value={planner.variableFood}
          onChange={(v) => planner.update({ variableFood: v })}
          min={100} max={2500} step={25} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Educational supplies" unit="Rs./child" value={planner.variableEducation}
          onChange={(v) => planner.update({ variableEducation: v })}
          min={50} max={800} step={25} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Activity materials" unit="Rs./child" value={planner.variableActivity}
          onChange={(v) => planner.update({ variableActivity: v })}
          min={50} max={600} step={25} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
        <SliderRow plain label="Maintenance and contingency" unit="Rs./child" value={planner.variableMaintenance}
          onChange={(v) => planner.update({ variableMaintenance: v })}
          min={50} max={700} step={25} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      </Section>

      <Section title="Fixed cost composition" icon="chart-donut" accent={ACCENT} defaultOpen={false}>
        <DonutChart
          segments={[planner.rent, planner.utilities, planner.staffSalaries, planner.otherFixed, planner.marketingFixed, activitiesMonthly]}
          labels={['Rent', 'Utilities', 'Staff', 'Insurance/other', 'Marketing', 'Activities']}
          centerCaption="Fixed / month"
        />
      </Section>

      <Section title="Variable composition (per child)" icon="chart-donut-variant" accent={ACCENT} defaultOpen={false}>
        <DonutChart
          segments={[planner.variableFood, planner.variableEducation, planner.variableActivity, planner.variableMaintenance]}
          labels={['Food', 'Education', 'Activity mat.', 'Maintenance']}
          centerCaption="Per child / month"
        />
      </Section>

      {bepDisplay && bepDisplay <= 90 ? (
        <ResultBox type="ok">
          Break-even at {bepDisplay} children. Revenue and total operating cost intersect there before depreciation.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Break-even exceeds practical capacity. Lower fixed cost, lower variable cost per child, or raise fee.
        </ResultBox>
      )}

      <Section title="Break-even chart" icon="chart-line" accent={ACCENT}>
        <View style={styles.chartContainer}>
          <Svg width={chartW} height={chartH}>
            {yTicks.map((tick, i) => {
              const ratio = tick / maxVal;
              const y = pad.top + plotH * (1 - ratio);
              return (
                <G key={`y-${i}`}>
                  <Line x1={pad.left} y1={y} x2={chartW - pad.right} y2={y} stroke="#eef0f3" strokeWidth={1} />
                  <SvgText x={pad.left - 6} y={y + 3} fontSize={9} fill={COLORS.textMuted} textAnchor="end">{formatCurrencyShort(tick)}</SvgText>
                </G>
              );
            })}
            {xTicks.map((tick, i) => (
              <SvgText key={`x-${i}`} x={toX(tick)} y={pad.top + plotH + 16} fontSize={9} fill={COLORS.textMuted} textAnchor="middle">{tick}</SvgText>
            ))}
            <SvgText x={pad.left + plotW / 2} y={chartH - 4} fontSize={10} fill={COLORS.textSecondary} fontWeight="600" textAnchor="middle">Children (n)</SvgText>
            <SvgText x={12} y={pad.top + plotH / 2} fontSize={10} fill={COLORS.textSecondary} fontWeight="600" textAnchor="middle" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>Rs.</SvgText>

            <Line x1={pad.left} y1={fcY} x2={chartW - pad.right} y2={fcY} stroke="#8a4a86" strokeDasharray="5,3" strokeWidth={1.3} />
            <Polyline points={revenuePoints} fill="none" stroke={ACCENT} strokeWidth={2.5} />
            <Polyline points={costPoints} fill="none" stroke={COLORS.accentRed} strokeWidth={2.5} />
            {beX ? (
              <>
                <Line x1={beX} y1={pad.top + plotH} x2={beX} y2={beY} stroke={ACCENT} strokeDasharray="6,3" strokeWidth={1.5} />
                <Circle cx={beX} cy={beY} r={5} fill={ACCENT} stroke="#fff" strokeWidth={2} />
                <SvgText x={beX} y={beY - 10} fontSize={9} fill={ACCENT} fontWeight="700" textAnchor="middle">BE {bepDisplay}</SvgText>
              </>
            ) : null}
            <G x={chartW - 150} y={4}>
              <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
              <SvgText x={15} y={4} fontSize={9} fill={COLORS.textSecondary}>Revenue</SvgText>
              <Rect x={64} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
              <SvgText x={79} y={4} fontSize={9} fill={COLORS.textSecondary}>Total cost</SvgText>
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
  hint: { fontSize: 12, color: '#6b7178', lineHeight: 17, marginBottom: 6 },
  chartContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, alignItems: 'center' },
});
