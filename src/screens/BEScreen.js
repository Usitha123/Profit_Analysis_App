import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Dimensions } from 'react-native';
import Svg, { Line, Circle, Text as SvgText, Polyline, G, Rect } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { ACTIVITIES, BE_MKT_CHANNELS } from '../constants/modelData';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import CheckRow from '../components/CheckRow';
import ResultBox, { SectionTitle } from '../components/ResultBox';
import { StackedBar } from '../components/GaugeBar';
import DataTable from '../components/DataTable';

const { allocateMarketing } = require('../utils/calculations');

const ACCENT = COLORS.accentBE;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function BEScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();

  const [activities, setActivities] = useState(() => ACTIVITIES.map((a) => ({
    ...a, on: a.defaultOn, annualCost: a.annual,
  })));

  const activitiesMonthly = useMemo(() => Math.round(
    activities.filter((a) => a.on).reduce((sum, a) => sum + a.annualCost, 0) / 12,
  ), [activities]);

  useEffect(() => {
    if (activitiesMonthly !== planner.activitiesMonthly) {
      planner.update({ activitiesMonthly });
    }
  }, [activitiesMonthly]); // eslint-disable-line react-hooks/exhaustive-deps

  const fixedCost = planner.fixedCost;
  const variableCostPerChild = planner.variableCost;
  const effectiveFee = planner.effectiveFee;
  const contribution = planner.contribution;
  const bep = planner.breakevenUnits;
  const bepDisplay = Number.isFinite(bep) ? Math.ceil(bep) : null;

  const mktAllocation = useMemo(
    () => allocateMarketing(planner.marketingFixed, BE_MKT_CHANNELS),
    [planner.marketingFixed],
  );

  const maxX = Math.min(Math.max(90, bepDisplay ? bepDisplay + 10 : 90), 120);
  const points = [];
  for (let n = 0; n <= maxX; n += 5) {
    points.push({ x: n, revenue: n * effectiveFee, totalCost: fixedCost + n * variableCostPerChild });
  }

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 240;
  const pad = { top: 20, right: 12, bottom: 32, left: 60 };
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

  const p30 = 30 * effectiveFee - (fixedCost + 30 * variableCostPerChild);

  const toggleActivity = (id) => setActivities((cur) => cur.map((a) => a.id === id ? { ...a, on: !a.on } : a));
  const setActivityCost = (id, val) => setActivities((cur) => cur.map((a) => a.id === id ? { ...a, annualCost: val } : a));

  const mktRows = mktAllocation.map((c) => [c.label, `Rs. ${c.allocation.toLocaleString()}`, c.reach]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Break-even" value={bepDisplay ? `${bepDisplay} children` : 'Not reachable'} accent={ACCENT} />
        <MetricCard label="Fixed cost total" value={`Rs. ${fixedCost.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Variable / child" value={`Rs. ${variableCostPerChild.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Contribution" value={`Rs. ${contribution.toLocaleString()}`} subtitle="fee - variable" accent={contribution > 0 ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Effective fee" value={`Rs. ${effectiveFee.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="P/L at 30" value={`Rs. ${p30.toLocaleString()}`} subtitle={p30 >= 0 ? 'profit before deprec.' : 'loss before deprec.'} accent={p30 >= 0 ? ACCENT : COLORS.accentRed} />
      </View>

      <SectionTitle accent={ACCENT}>Fee per child (Q9-Q10)</SectionTitle>
      <SliderRow
        label="Base monthly fee"
        unit="Rs."
        value={planner.fee}
        onChange={(v) => planner.update({ fee: v })}
        min={5000} max={30000} step={500}
        accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`}
      />
      <CheckRow
        label="Add-on fee (transport, meals, hours)"
        checked={planner.addFeeOn}
        onToggle={() => planner.update({ addFeeOn: !planner.addFeeOn })}
        accent={ACCENT}
      />
      {planner.addFeeOn ? (
        <SliderRow
          label="Add-on fee amount"
          unit="Rs."
          value={planner.addFee}
          onChange={(v) => planner.update({ addFee: v })}
          min={0} max={20000} step={500}
          accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`}
        />
      ) : null}

      <SectionTitle accent={ACCENT}>Fixed monthly cost (Rs. / month)</SectionTitle>
      <SliderRow label="Rent (Q11)" unit="Rs." value={planner.rent}
        onChange={(v) => planner.update({ rent: v })}
        min={10000} max={300000} step={2500} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Utilities (Q12)" unit="Rs." value={planner.utilities}
        onChange={(v) => planner.update({ utilities: v })}
        min={10000} max={80000} step={2500} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Total staff salaries (Q14)" unit="Rs." value={planner.staffSalaries}
        onChange={(v) => planner.update({ staffSalaries: v })}
        min={50000} max={600000} step={5000} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Insurance and other (Q15)" unit="Rs." value={planner.otherFixed}
        onChange={(v) => planner.update({ otherFixed: v })}
        min={5000} max={80000} step={2500} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Marketing (Q18)" unit="Rs." value={planner.marketingFixed}
        onChange={(v) => planner.update({ marketingFixed: v })}
        min={2500} max={60000} step={500} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />

      <SectionTitle accent={ACCENT}>Marketing mix (Q17)</SectionTitle>
      <Text style={styles.hint}>Allocated proportionally from your marketing total (Rs. {planner.marketingFixed.toLocaleString()}/mo).</Text>
      <DataTable columns={['Channel', 'Budget', 'Expected reach']} rows={mktRows} flexes={[1.6, 1, 1.6]} />

      <SectionTitle accent={ACCENT}>Annual activities (Q16)</SectionTitle>
      <Text style={styles.hint}>Total annual activity spend gets amortised into fixed cost. Currently Rs. {activitiesMonthly.toLocaleString()}/mo.</Text>
      {activities.map((a) => (
        <CheckRow
          key={a.id}
          label={`${a.label} (Rs. ${a.annualCost.toLocaleString()}/yr)`}
          checked={a.on}
          onToggle={() => toggleActivity(a.id)}
          value={a.annualCost}
          onChangeValue={(v) => setActivityCost(a.id, v)}
          unit="Rs./yr"
          accent={ACCENT}
        />
      ))}

      <SectionTitle accent={ACCENT}>Variable cost per child (Q13)</SectionTitle>
      <SliderRow label="Food and supplies" unit="Rs./child" value={planner.variableFood}
        onChange={(v) => planner.update({ variableFood: v })}
        min={100} max={2500} step={25} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Educational supplies" unit="Rs./child" value={planner.variableEducation}
        onChange={(v) => planner.update({ variableEducation: v })}
        min={50} max={800} step={25} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Activity materials" unit="Rs./child" value={planner.variableActivity}
        onChange={(v) => planner.update({ variableActivity: v })}
        min={50} max={600} step={25} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      <SliderRow label="Maintenance and contingency" unit="Rs./child" value={planner.variableMaintenance}
        onChange={(v) => planner.update({ variableMaintenance: v })}
        min={50} max={700} step={25} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />

      <SectionTitle accent={ACCENT}>Fixed cost composition</SectionTitle>
      <StackedBar
        segments={[planner.rent, planner.utilities, planner.staffSalaries, planner.otherFixed, planner.marketingFixed, activitiesMonthly]}
        colors={['#3d6ea5', '#2f8f83', '#c98a1f', '#8a4a86', '#c0574f', '#70ad47']}
        labels={['Rent', 'Utilities', 'Staff', 'Insurance/other', 'Marketing', 'Activities']}
      />

      <SectionTitle accent={ACCENT}>Variable composition (per child)</SectionTitle>
      <StackedBar
        segments={[planner.variableFood, planner.variableEducation, planner.variableActivity, planner.variableMaintenance]}
        colors={['#3d6ea5', '#c98a1f', '#8a4a86', '#c0574f']}
        labels={['Food', 'Education', 'Activity mat.', 'Maintenance']}
      />

      {bepDisplay && bepDisplay <= 90 ? (
        <ResultBox type="ok">
          Break-even at {bepDisplay} children. Revenue and total operating cost intersect there before depreciation.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Break-even exceeds practical capacity. Lower fixed cost, lower variable cost per child, or raise fee.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Break-even chart</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <Line key={r} x1={pad.left} y1={pad.top + plotH * (1 - r)} x2={chartW - pad.right} y2={pad.top + plotH * (1 - r)} stroke="#eee9dc" strokeWidth={1} strokeDasharray="4,4" />
          ))}
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
          <G x={chartW - 150} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Revenue</SvgText>
            <Rect x={64} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentRed} />
            <SvgText x={79} y={4} fontSize={9} fill="#6b7178">Total cost</SvgText>
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
  hint: { fontSize: 12, color: '#6b7178', lineHeight: 17, marginBottom: 6 },
  chartContainer: { backgroundColor: '#f6f2e8', borderRadius: 10, padding: 12, alignItems: 'center' },
});
