import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Platform,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { DEP_ASSETS, NON_DEPRECIABLE_OUTLAY, ROADMAP } from '../constants/modelData';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import ResultBox from '../components/ResultBox';
import { StackedBar } from '../components/GaugeBar';
import PhaseRoadmap from '../components/PhaseRoadmap';

const { calculateProfit } = require('../utils/calculations');

const ACCENT = COLORS.accentPF;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PFScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();
  const [enrolment, setEnrolment] = useState(30);
  const [assets, setAssets] = useState(() => DEP_ASSETS.map((a) => ({ ...a, cost: String(a.cost), life: String(a.life) })));

  const updateAsset = (id, field, value) => setAssets((cur) => cur.map((a) => a.id === id ? { ...a, [field]: value } : a));

  const parsedAssets = useMemo(() => assets.map((a) => ({
    ...a, cost: Number(a.cost) || 0, life: Number(a.life) || 1,
  })), [assets]);

  const results = useMemo(() => calculateProfit({
    enrolment,
    tuition: planner.effectiveFee,
    fixedCost: planner.fixedCost,
    variableCostPerChild: planner.variableCost,
    assets: parsedAssets,
    nonDepreciable: NON_DEPRECIABLE_OUTLAY,
  }), [enrolment, planner.effectiveFee, planner.fixedCost, planner.variableCost, parsedAssets]);

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 240;
  const pad = { top: 20, right: 12, bottom: 32, left: 60 };
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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Revenue" value={`Rs. ${results.revenue.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Operating cost" value={`Rs. ${Math.round(results.operatingCost).toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="EBITDA" value={`Rs. ${Math.round(results.ebitda).toLocaleString()}`} accent={results.ebitda >= 0 ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Monthly deprec." value={`Rs. ${Math.round(results.totalDepreciation).toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Net profit" value={`Rs. ${Math.round(results.netProfit).toLocaleString()}`} subtitle="after depreciation" accent={results.netProfit >= 0 ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Total capex" value={`Rs. ${results.totalCapex.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Cash BE" value={cashBep ? `${cashBep} children` : '-'} accent={ACCENT} />
        <MetricCard label="Accounting BE" value={accBep && Number.isFinite(accBep) ? `${accBep} children` : '-'} subtitle="incl. depreciation" accent={ACCENT} />
        <MetricCard label="Payback" value={Number.isFinite(results.paybackMonths) ? `${results.paybackMonths.toFixed(1)} mo` : 'Not reached'} accent={ACCENT} />
        <MetricCard label="Annual ROI" value={`${results.roi.toFixed(1)}%`} accent={results.roi >= 0 ? ACCENT : COLORS.accentRed} />
      </View>

      <SliderRow label="Children enrolled" unit="children" value={enrolment}
        onChange={setEnrolment} min={10} max={100} step={1} accent={ACCENT} />

      <SectionTitle accent={ACCENT}>Capital assets and depreciation (straight-line)</SectionTitle>
      <View style={styles.assetTable}>
        <View style={styles.assetHeader}>
          <Text style={[styles.assetHeaderCell, { flex: 2.1 }]}>Asset</Text>
          <Text style={styles.assetHeaderCell}>Cost</Text>
          <Text style={styles.assetHeaderCell}>Life (yr)</Text>
          <Text style={[styles.assetHeaderCell, { textAlign: 'right' }]}>Dep./mo</Text>
        </View>
        {parsedAssets.map((a) => {
          const monthlyDep = a.life > 0 ? a.cost / (a.life * 12) : a.cost;
          return (
            <View key={a.id} style={styles.assetRow}>
              <Text style={[styles.assetCell, { flex: 2.1 }]}>{a.label}</Text>
              <TextInput
                style={styles.assetInput}
                value={String(assets.find((it) => it.id === a.id)?.cost ?? a.cost)}
                onChangeText={(v) => updateAsset(a.id, 'cost', v)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.assetInput, styles.lifeInput]}
                value={String(assets.find((it) => it.id === a.id)?.life ?? a.life)}
                onChangeText={(v) => updateAsset(a.id, 'life', v)}
                keyboardType="numeric"
              />
              <Text style={styles.assetValue}>Rs. {Math.round(monthlyDep).toLocaleString()}</Text>
            </View>
          );
        })}
      </View>

      <SectionTitle accent={ACCENT}>One-off, non-depreciable capital outlay</SectionTitle>
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

      {results.netProfit >= 0 ? (
        <ResultBox type="ok">
          Net profit after depreciation is Rs. {Math.round(results.netProfit).toLocaleString()}/mo.
          {Number.isFinite(results.paybackMonths) ? ` Payback ~ ${results.paybackMonths.toFixed(1)} months. Annual ROI ${results.roi.toFixed(1)}%.` : ''}
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Net profit negative after depreciation. Raise enrolment, raise fee, or lower operating cost before relying on this business case.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Capital allocation</SectionTitle>
      <StackedBar
        segments={parsedAssets.map((a) => a.cost)}
        colors={['#3d6ea5', '#2f8f83', '#c98a1f', '#8a4a86', '#c0574f', '#70ad47', '#ed7d31', '#6b7178']}
        labels={parsedAssets.map((a) => a.label)}
      />

      <SectionTitle accent={ACCENT}>Net profit vs enrolment</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          {[0, 0.25, 0.5, 0.75, 1].map((r) => (
            <Line key={r} x1={pad.left} y1={pad.top + plotH * (1 - r)} x2={chartW - pad.right} y2={pad.top + plotH * (1 - r)} stroke="#eee9dc" strokeWidth={1} strokeDasharray="4,4" />
          ))}
          <Line x1={pad.left} y1={zeroY} x2={chartW - pad.right} y2={zeroY} stroke="#6b7178" strokeWidth={1} />
          {cashBep ? (
            <Line x1={toX(cashBep)} y1={pad.top} x2={toX(cashBep)} y2={pad.top + plotH} stroke={COLORS.accentBE} strokeDasharray="4,3" strokeWidth={1.3} />
          ) : null}
          {accBep && Number.isFinite(accBep) && accBep <= maxX ? (
            <Line x1={toX(accBep)} y1={pad.top} x2={toX(accBep)} y2={pad.top + plotH} stroke={ACCENT} strokeDasharray="4,3" strokeWidth={1.3} />
          ) : null}
          <Polyline points={netPointsStr} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          <G x={chartW - 190} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Net profit</SvgText>
            <Rect x={64} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentBE} />
            <SvgText x={79} y={4} fontSize={9} fill="#6b7178">Cash BE</SvgText>
            <Rect x={124} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={139} y={4} fontSize={9} fill="#6b7178">Acc. BE</SvgText>
          </G>
        </Svg>
      </View>

      <SectionTitle accent={ACCENT}>Phase roadmap</SectionTitle>
      <PhaseRoadmap phases={ROADMAP} accent={ACCENT} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  chartContainer: { backgroundColor: '#f6f2e8', borderRadius: 10, padding: 12, alignItems: 'center' },
  assetTable: { borderWidth: 1.5, borderColor: '#d8d1bf', borderRadius: 10, overflow: 'hidden', backgroundColor: '#fff' },
  assetHeader: { flexDirection: 'row', backgroundColor: '#f6f2e8', paddingHorizontal: 10, paddingVertical: 8 },
  assetHeaderCell: { flex: 1, fontSize: 10.5, fontWeight: '700', color: '#6b7178', textTransform: 'uppercase' },
  assetRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 8, borderTopWidth: 1, borderTopColor: '#eee9dc' },
  assetCell: { flex: 1, fontSize: 11.5, color: '#232a2e', lineHeight: 16 },
  assetInput: {
    width: 82, borderWidth: 1.5, borderColor: '#d8d1bf', borderRadius: 6,
    paddingHorizontal: 6, paddingVertical: 6, backgroundColor: '#fff', textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11.5, color: '#232a2e', marginLeft: 6, minHeight: 36,
  },
  lifeInput: { width: 54 },
  assetValue: {
    flex: 1, fontSize: 11.5, color: '#6b7178', textAlign: 'right', marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  nonDepRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#eee9dc' },
  nonDepLabel: { flex: 1, fontSize: 13, color: '#232a2e' },
  nonDepValue: { fontSize: 12.5, color: '#6b7178', fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace' },
  totalRow: { borderBottomWidth: 0, borderTopWidth: 1.5, borderTopColor: '#d8d1bf', marginTop: 4 },
  totalText: { fontWeight: '700', color: '#232a2e' },
});
