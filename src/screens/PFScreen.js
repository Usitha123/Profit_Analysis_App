import React, { useMemo, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Platform,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import {
  DEP_ASSETS,
  ENROLMENT_CAPACITY,
  NON_DEPRECIABLE_OUTLAY,
  ROADMAP,
  TUITION_RATE,
} from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import ResultBox from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import { StackedBar } from '../components/GaugeBar';
import InfoBox from '../components/InfoBox';
import PhaseRoadmap from '../components/PhaseRoadmap';

const { calculateProfit } = require('../utils/calculations');

const ACCENT = COLORS.accentPF;
const SCREEN_WIDTH = Dimensions.get('window').width;

export default function PFScreen() {
  const insets = useSafeAreaInsets();
  const [enrolment, setEnrolment] = useState(30);
  const [tuition, setTuition] = useState(TUITION_RATE);
  const [operatingCost, setOperatingCost] = useState(255000);
  const [assets, setAssets] = useState(DEP_ASSETS.map((asset) => ({ ...asset, cost: String(asset.cost), life: String(asset.life) })));

  const updateAsset = (id, field, value) => {
    setAssets((current) => current.map((asset) => (asset.id === id ? { ...asset, [field]: value } : asset)));
  };

  const parsedAssets = useMemo(() => assets.map((asset) => ({
    ...asset,
    cost: Number(asset.cost) || 0,
    life: Number(asset.life) || 1,
  })), [assets]);

  const results = useMemo(() => calculateProfit({
    enrolment,
    tuition,
    operatingCost,
    assets: parsedAssets,
    nonDepreciable: NON_DEPRECIABLE_OUTLAY,
  }), [enrolment, operatingCost, parsedAssets, tuition]);

  const paybackMonths = results.netProfit > 0 ? results.totalInvestment / results.netProfit : Infinity;
  const annualisedRoi = results.roi;

  const projection = [];
  for (let month = 1; month <= 12; month += 1) {
    const revenue = Math.round(results.revenue * (1 + (month - 1) * 0.02));
    const costs = Math.round(operatingCost * (1 + (month - 1) * 0.015));
    const net = Math.round(revenue - costs - results.totalDepreciation);
    projection.push({ month, revenue, costs, net });
  }

  const chartW = Math.min(SCREEN_WIDTH - 68, 420);
  const chartH = 240;
  const pad = { top: 20, right: 12, bottom: 32, left: 52 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;
  const maxVal = Math.max(...projection.map((row) => Math.max(row.revenue, row.costs)), 1);
  const toX = (value) => pad.left + ((value - 1) / 11) * plotW;
  const toY = (value) => pad.top + plotH - (value / maxVal) * plotH;
  const revenuePoints = projection.map((row) => `${toX(row.month)},${toY(row.revenue)}`).join(' ');
  const netPoints = projection.map((row) => `${toX(row.month)},${toY(Math.max(row.net, 0))}`).join(' ');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 26 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Profit is where the operating model meets the capital plan. This tab separates monthly operating
        profit from depreciation, then keeps non-depreciable launch outlays visible for payback planning.
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Monthly revenue" value={`Rs. ${results.revenue.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Net profit" value={`Rs. ${Math.round(results.netProfit).toLocaleString()}`} subtitle="after depreciation" accent={results.netProfit >= 0 ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Payback" value={Number.isFinite(paybackMonths) ? `${paybackMonths.toFixed(1)} mo` : 'Not reached'} accent={ACCENT} />
        <MetricCard label="Annual ROI" value={`${annualisedRoi.toFixed(1)}%`} accent={annualisedRoi >= 0 ? ACCENT : COLORS.accentRed} />
      </View>

      <InfoBox
        title="Variables to determine"
        accent={ACCENT}
        items={[
          { label: 'Capital items:', text: 'Replace every cost and useful life with your actual quotation or planning assumption.' },
          { label: 'Non-depreciable launch outlay:', text: 'Legal fees, launch marketing, and working capital are real cash out but should not sit inside depreciation.' },
          { label: 'Interpretation:', text: 'Positive net profit does not mean the business has recovered startup cash yet. That is why payback is shown separately.' },
        ]}
      />

      <SectionTitle accent={ACCENT}>Profit formula</SectionTitle>
      <EquationBox accent={ACCENT}>
        Net profit = revenue - operating cost - depreciation
        {'\n'}
        ROI = annual net profit / depreciable capital investment
      </EquationBox>

      <SliderRow
        label="Children enrolled"
        unit="children"
        value={enrolment}
        onChange={setEnrolment}
        min={10}
        max={ENROLMENT_CAPACITY}
        step={1}
        accent={ACCENT}
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

      <SliderRow
        label="Operating cost before depreciation"
        unit="Rs."
        value={operatingCost}
        onChange={setOperatingCost}
        min={100000}
        max={700000}
        step={5000}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      <SectionTitle accent={ACCENT}>Capital assets and depreciation</SectionTitle>
      <View style={styles.assetTable}>
        <View style={styles.assetHeader}>
          <Text style={[styles.assetHeaderCell, { flex: 2.1 }]}>Asset</Text>
          <Text style={styles.assetHeaderCell}>Cost</Text>
          <Text style={styles.assetHeaderCell}>Life</Text>
          <Text style={[styles.assetHeaderCell, { textAlign: 'right' }]}>Dep./mo</Text>
        </View>
        {parsedAssets.map((asset) => {
          const monthlyDep = asset.life > 0 ? asset.cost / (asset.life * 12) : asset.cost;
          return (
            <View key={asset.id} style={styles.assetRow}>
              <Text style={[styles.assetCell, { flex: 2.1 }]}>{asset.label}</Text>
              <TextInput
                style={styles.assetInput}
                value={String(assets.find((item) => item.id === asset.id)?.cost ?? asset.cost)}
                onChangeText={(value) => updateAsset(asset.id, 'cost', value)}
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.assetInput, styles.lifeInput]}
                value={String(assets.find((item) => item.id === asset.id)?.life ?? asset.life)}
                onChangeText={(value) => updateAsset(asset.id, 'life', value)}
                keyboardType="numeric"
              />
              <Text style={styles.assetValue}>Rs. {Math.round(monthlyDep).toLocaleString()}</Text>
            </View>
          );
        })}
      </View>

      <SectionTitle accent={ACCENT}>Non-depreciable launch outlay</SectionTitle>
      {NON_DEPRECIABLE_OUTLAY.map((item) => (
        <View key={item.id} style={styles.nonDepRow}>
          <Text style={styles.nonDepLabel}>{item.label}</Text>
          <Text style={styles.nonDepValue}>Rs. {item.cost.toLocaleString()}</Text>
        </View>
      ))}

      {results.netProfit >= 0 ? (
        <ResultBox type="ok">
          Net profit after depreciation is Rs. {Math.round(results.netProfit).toLocaleString()} per month.
          {Number.isFinite(paybackMonths) ? ` Estimated payback period is ${paybackMonths.toFixed(1)} months.` : ''}
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Net profit is negative after depreciation. Increase enrolment, raise the fee, or lower operating
          cost before relying on this business case.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Capital allocation</SectionTitle>
      <StackedBar
        segments={parsedAssets.map((asset) => asset.cost)}
        colors={['#3d6ea5', '#2f8f83', '#c98a1f', '#8a4a86', '#c0574f', '#70ad47', '#ed7d31', '#6b7178']}
        labels={parsedAssets.map((asset) => asset.label)}
      />

      <SectionTitle accent={ACCENT}>12-month projection</SectionTitle>
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
          <Polyline points={revenuePoints} fill="none" stroke={COLORS.accentLP} strokeWidth={2.5} />
          <Polyline points={netPoints} fill="none" stroke={ACCENT} strokeWidth={2.5} />
          <G x={chartW - 140} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentLP} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Revenue</SvgText>
            <Rect x={70} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={85} y={4} fontSize={9} fill="#6b7178">Net profit</SvgText>
          </G>
        </Svg>
      </View>

      <SectionTitle accent={ACCENT}>Phase roadmap</SectionTitle>
      <PhaseRoadmap phases={ROADMAP} accent={ACCENT} />
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
  assetTable: {
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#fff',
  },
  assetHeader: {
    flexDirection: 'row',
    backgroundColor: '#f6f2e8',
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  assetHeaderCell: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '700',
    color: '#6b7178',
    textTransform: 'uppercase',
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee9dc',
  },
  assetCell: {
    flex: 1,
    fontSize: 11.5,
    color: '#232a2e',
    lineHeight: 16,
  },
  assetInput: {
    width: 82,
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    backgroundColor: '#fff',
    textAlign: 'right',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 11.5,
    color: '#232a2e',
    marginLeft: 6,
  },
  lifeInput: {
    width: 54,
  },
  assetValue: {
    flex: 1,
    fontSize: 11.5,
    color: '#6b7178',
    textAlign: 'right',
    marginLeft: 6,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
  nonDepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eee9dc',
  },
  nonDepLabel: {
    flex: 1,
    fontSize: 13,
    color: '#232a2e',
  },
  nonDepValue: {
    fontSize: 12.5,
    color: '#6b7178',
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
  },
});
