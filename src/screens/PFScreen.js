import React, { useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Platform,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { DEP_ASSETS, NON_DEPRECIABLE_OUTLAY, ROADMAP } from '../constants/modelData';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import ResultBox from '../components/ResultBox';
import Section from '../components/Section';
import { StackedBar } from '../components/GaugeBar';
import PhaseRoadmap from '../components/PhaseRoadmap';

const { calculateProfit } = require('../utils/calculations');

const ACCENT = COLORS.accentPF;
const SCREEN_WIDTH = Dimensions.get('window').width;

function formatCurrencyShort(n) {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${Math.round(n / 1000)}k`;
  return String(Math.round(n));
}

export default function PFScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();
  const enrolment = Math.max(1, planner.totalChildren || 1);

  const assets = useMemo(
    () => DEP_ASSETS.map((meta) => {
      const saved = (planner.pfAssets || []).find((a) => a.id === meta.id);
      return { ...meta, cost: saved?.cost ?? meta.cost, life: saved?.life ?? meta.life };
    }),
    [planner.pfAssets],
  );

  const results = useMemo(() => calculateProfit({
    enrolment,
    tuition: planner.effectiveFee,
    fixedCost: planner.fixedCost,
    variableCostPerChild: planner.variableCost,
    assets,
    nonDepreciable: NON_DEPRECIABLE_OUTLAY,
  }), [enrolment, planner.effectiveFee, planner.fixedCost, planner.variableCost, assets]);

  const updateAsset = (id, field, value) => {
    const next = assets.map((a) => (a.id === id ? { ...a, [field]: Number(value) || 0 } : a))
      .map(({ id, cost, life }) => ({ id, cost, life }));
    planner.update({ pfAssets: next });
  };

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 260;
  const pad = { top: 16, right: 14, bottom: 42, left: 60 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxX = 100;
  const netPts = [];
  for (let n = 0; n <= maxX; n += 5) {
    const net = planner.effectiveFee * n - (planner.fixedCost + planner.variableCost * n) - results.totalDepreciation;
    netPts.push({ x: n, net });
  }
  const maxAbs = Math.max(1, ...netPts.map((p) => Math.abs(p.net)));
  const toX = (v) => pad.left + (v / maxX) * plotW;
  const toY = (v) => pad.top + plotH / 2 - (v / maxAbs) * (plotH / 2);
  const zeroY = toY(0);
  const netPointsStr = netPts.map((p) => `${toX(p.x)},${toY(p.net)}`).join(' ');
  const cashBep = Number.isFinite(planner.breakevenUnits) ? Math.ceil(planner.breakevenUnits) : null;
  const accBep = Number.isFinite(results.accountingBreakevenUnits) ? results.accountingBreakevenUnits : null;
  const xTicks = [0, 25, 50, 75, 100];
  const yTicksVals = [-maxAbs, -maxAbs / 2, 0, maxAbs / 2, maxAbs];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.linkBanner}>
        <Text style={styles.linkBannerText}>
          Enrolment linked to Staffing tab: <Text style={styles.linkBannerNum}>n = {enrolment}</Text>
        </Text>
      </View>

      <View style={styles.metrics}>
        <MetricCard label="Revenue" value={`Rs. ${results.revenue.toLocaleString()}`} accent={ACCENT} icon="cash-plus" />
        <MetricCard label="Operating cost" value={`Rs. ${Math.round(results.operatingCost).toLocaleString()}`} accent={ACCENT} icon="cash-minus" />
        <MetricCard label="EBITDA" value={`Rs. ${Math.round(results.ebitda).toLocaleString()}`} accent={results.ebitda >= 0 ? ACCENT : COLORS.accentRed} icon="chart-bar" trend={results.ebitda >= 0 ? 'up' : 'down'} />
        <MetricCard label="Monthly deprec." value={`Rs. ${Math.round(results.totalDepreciation).toLocaleString()}`} accent={ACCENT} icon="trending-down" />
        <MetricCard label="Net profit" value={`Rs. ${Math.round(results.netProfit).toLocaleString()}`} subtitle="after depreciation" accent={results.netProfit >= 0 ? ACCENT : COLORS.accentRed} icon="cash-100" trend={results.netProfit >= 0 ? 'up' : 'down'} />
        <MetricCard label="Total capex" value={`Rs. ${results.totalCapex.toLocaleString()}`} accent={ACCENT} icon="bank-outline" />
        <MetricCard label="Cash BE" value={cashBep ? `${cashBep} children` : '—'} accent={ACCENT} icon="chart-line-variant" />
        <MetricCard label="Accounting BE" value={accBep && Number.isFinite(accBep) ? `${accBep} children` : '—'} subtitle="incl. depreciation" accent={ACCENT} icon="chart-timeline-variant" />
        <MetricCard label="Payback" value={Number.isFinite(results.paybackMonths) ? `${results.paybackMonths.toFixed(1)} mo` : 'Not reached'} accent={ACCENT} icon="clock-outline" />
        <MetricCard label="Annual ROI" value={`${results.roi.toFixed(1)}%`} accent={results.roi >= 0 ? ACCENT : COLORS.accentRed} icon="percent-outline" trend={results.roi >= 0 ? 'up' : 'down'} />
      </View>

      <Section title="Capital assets and depreciation" icon="warehouse" accent={ACCENT}>
        <View style={styles.assetTable}>
          <View style={styles.assetHeader}>
            <Text style={[styles.assetHeaderCell, { flex: 2.1 }]}>Asset</Text>
            <Text style={styles.assetHeaderCell}>Cost</Text>
            <Text style={styles.assetHeaderCell}>Life (yr)</Text>
            <Text style={[styles.assetHeaderCell, { textAlign: 'right' }]}>Dep./mo</Text>
          </View>
          {assets.map((a) => {
            const monthlyDep = a.life > 0 ? a.cost / (a.life * 12) : a.cost;
            return (
              <View key={a.id} style={styles.assetRow}>
                <Text style={[styles.assetCell, { flex: 2.1 }]}>{a.label}</Text>
                <TextInput
                  style={styles.assetInput}
                  value={String(a.cost)}
                  onChangeText={(v) => updateAsset(a.id, 'cost', v)}
                  keyboardType="numeric"
                />
                <TextInput
                  style={[styles.assetInput, styles.lifeInput]}
                  value={String(a.life)}
                  onChangeText={(v) => updateAsset(a.id, 'life', v)}
                  keyboardType="numeric"
                />
                <Text style={styles.assetValue}>Rs. {Math.round(monthlyDep).toLocaleString()}</Text>
              </View>
            );
          })}
        </View>
      </Section>

      <Section title="One-off non-depreciable capital outlay" icon="file-document-outline" accent={ACCENT} defaultOpen={false}>
        {NON_DEPRECIABLE_OUTLAY.map((it) => (
          <View key={it.id} style={styles.nonDepRow}>
            <Text style={styles.nonDepLabel}>{it.label}</Text>
            <Text style={styles.nonDepValue}>Rs. {it.cost.toLocaleString()}</Text>
          </View>
        ))}
        <View style={[styles.nonDepRow, styles.totalRow]}>
          <Text style={[styles.nonDepLabel, styles.totalText]}>Total non-depreciable</Text>
          <Text style={[styles.nonDepValue, styles.totalText]}>Rs. {results.totalNonDepreciableOutlay.toLocaleString()}</Text>
        </View>
      </Section>

      {results.netProfit >= 0 ? (
        <ResultBox type="ok">
          Net profit after depreciation is Rs. {Math.round(results.netProfit).toLocaleString()}/mo.
          {Number.isFinite(results.paybackMonths) ? ` Payback ~ ${results.paybackMonths.toFixed(1)} months. Annual ROI ${results.roi.toFixed(1)}%.` : ''}
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Net profit negative after depreciation. Raise enrolment (Staffing tab), raise fee, or lower operating cost.
        </ResultBox>
      )}

      <Section title="Capital allocation" icon="chart-donut" accent={ACCENT} defaultOpen={false}>
        <StackedBar
          segments={assets.map((a) => a.cost)}
          colors={['#3d6ea5', '#2f8f83', '#c98a1f', '#8a4a86', '#c0574f', '#70ad47', '#ed7d31', '#6b7178']}
          labels={assets.map((a) => a.label)}
        />
      </Section>

      <Section title="Net profit vs enrolment" icon="chart-areaspline" accent={ACCENT}>
        <View style={styles.chartContainer}>
          <Svg width={chartW} height={chartH}>
            {yTicksVals.map((tick, i) => {
              const y = toY(tick);
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
            <SvgText x={12} y={pad.top + plotH / 2} fontSize={10} fill={COLORS.textSecondary} fontWeight="600" textAnchor="middle" transform={`rotate(-90, 12, ${pad.top + plotH / 2})`}>Net profit (Rs.)</SvgText>

            <Line x1={pad.left} y1={zeroY} x2={chartW - pad.right} y2={zeroY} stroke="#6b7280" strokeWidth={1} />
            {cashBep ? (
              <Line x1={toX(cashBep)} y1={pad.top} x2={toX(cashBep)} y2={pad.top + plotH} stroke={COLORS.accentBE} strokeDasharray="4,3" strokeWidth={1.3} />
            ) : null}
            {accBep && Number.isFinite(accBep) && accBep <= maxX ? (
              <Line x1={toX(accBep)} y1={pad.top} x2={toX(accBep)} y2={pad.top + plotH} stroke={ACCENT} strokeDasharray="4,3" strokeWidth={1.3} />
            ) : null}
            <Polyline points={netPointsStr} fill="none" stroke={ACCENT} strokeWidth={2.5} />
            <G x={chartW - 190} y={4}>
              <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
              <SvgText x={15} y={4} fontSize={9} fill={COLORS.textSecondary}>Net profit</SvgText>
              <Rect x={64} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentBE} />
              <SvgText x={79} y={4} fontSize={9} fill={COLORS.textSecondary}>Cash BE</SvgText>
              <Rect x={124} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
              <SvgText x={139} y={4} fontSize={9} fill={COLORS.textSecondary}>Acc. BE</SvgText>
            </G>
          </Svg>
        </View>
      </Section>

      <Section title="Phase roadmap" icon="road-variant" accent={ACCENT} defaultOpen={false}>
        <PhaseRoadmap phases={ROADMAP} accent={ACCENT} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chartContainer: { backgroundColor: '#fff', borderRadius: 20, padding: 10, alignItems: 'center' },
  assetTable: { borderRadius: 12, overflow: 'hidden', backgroundColor: '#fff' },
  assetHeader: { flexDirection: 'row', backgroundColor: '#f4f5f7', paddingHorizontal: 10, paddingVertical: 8 },
  assetHeaderCell: { flex: 1, fontSize: 10.5, fontWeight: '700', color: '#6b7178', textTransform: 'uppercase' },
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#eef0f3' },
  assetCell: { flex: 1, fontSize: 11.5, color: '#232a2e', lineHeight: 16 },
  assetInput: {
    width: 82, borderWidth: 1, borderColor: '#eef0f3', borderRadius: 8,
    paddingHorizontal: 6, paddingVertical: 6, backgroundColor: '#fff', textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11.5, color: '#232a2e', marginLeft: 6, minHeight: 36,
  },
  lifeInput: { width: 54 },
  assetValue: {
    flex: 1, fontSize: 11.5, color: '#6b7178', textAlign: 'right', marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  nonDepRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eef0f3' },
  nonDepLabel: { flex: 1, fontSize: 13, color: '#232a2e' },
  nonDepValue: { fontSize: 12.5, color: '#6b7178', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  totalRow: { borderBottomWidth: 0, borderTopWidth: 1.5, borderTopColor: '#d8d1bf', marginTop: 4 },
  totalText: { fontWeight: '700', color: '#232a2e' },
  linkBanner: {
    backgroundColor: `${ACCENT}12`,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 12,
  },
  linkBannerText: { fontSize: 12, color: COLORS.textSecondary },
  linkBannerNum: { fontWeight: '800', color: ACCENT },
});
