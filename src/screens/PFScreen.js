import React, { useState, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, Dimensions, Platform,
} from 'react-native';
import Svg, { Line, Rect, Text as SvgText, G, Polyline } from 'react-native-svg';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { DEP_ASSETS, TUITION_RATE, ENROLMENT_CAPACITY } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import { StackedBar } from '../components/GaugeBar';

const ACCENT = COLORS.accentPF;
const SCREEN_WIDTH = Dimensions.get('window').width;

// Guard any computed number against NaN/Infinity before use in SVG or toLocaleString
const safeNum = (n, fallback = 0) =>
  typeof n === 'number' && isFinite(n) && !isNaN(n) ? n : fallback;

export default function PFScreen() {
  const insets = useSafeAreaInsets();
  const [enrolment, setEnrolment] = useState(40);
  const [tuition, setTuition] = useState(TUITION_RATE);
  const [operatingCosts, setOperatingCosts] = useState(18000);

  const [assets, setAssets] = useState(
    DEP_ASSETS.map((a) => ({ ...a, cost: String(a.cost), life: String(a.life) }))
  );

  const updateAsset = (id, field, val) => {
    setAssets((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: val } : a))
    );
  };

  const results = useMemo(() => {
    const revenue = enrolment * tuition;
    const totalDepreciation = assets.reduce((s, a) => {
      const cost = Number(a.cost) || 0;
      const life = Number(a.life) || 0;
      const annualDep = life > 0 ? cost / life : cost;
      return s + annualDep / 12;
    }, 0);
    const ebitda = revenue - operatingCosts;
    const netProfit = ebitda - totalDepreciation;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
    const totalInvestment = assets.reduce((s, a) => s + (Number(a.cost) || 0), 0);
    const roi = totalInvestment > 0 ? (netProfit * 12 / totalInvestment) * 100 : 0;

    // Projection data (12 months)
    const projection = [];
    for (let m = 1; m <= 12; m++) {
      const growthFactor = 1 + (m - 1) * 0.02;
      const mRevenue = revenue * growthFactor;
      const mCosts = operatingCosts * growthFactor;
      const mEbitda = mRevenue - mCosts;
      const mNet = mEbitda - totalDepreciation;
      projection.push({
        month: m,
        revenue: Math.round(mRevenue),
        costs: Math.round(mCosts),
        ebitda: Math.round(mEbitda),
        net: Math.round(mNet),
      });
    }

    const assetLabels = assets.map((a) => a.label.split('(')[0].trim());
    const assetValues = assets.map((a) => Number(a.cost) || 0);
    const assetColors = ['#5b9bd5', '#70ad47', '#ffc000', '#ed7d31', '#8a4a86', '#3d6ea5'];

    return {
      revenue,
      totalDepreciation,
      ebitda,
      netProfit,
      profitMargin,
      totalInvestment,
      roi,
      projection,
      assetLabels,
      assetValues,
      assetColors,
    };
  }, [enrolment, tuition, operatingCosts, assets]);

  // Chart
  const chartW = Math.min(SCREEN_WIDTH - 76, 400);
  const chartH = 240;
  const pad = { top: 20, right: 10, bottom: 30, left: 55 };
  const plotW = chartW - pad.left - pad.right;
  const plotH = chartH - pad.top - pad.bottom;

  const maxChartVal = Math.max(
    ...results.projection.map((d) => Math.max(safeNum(d.revenue), safeNum(d.net) + safeNum(d.costs))),
    1
  );

  const toX = (m) => {
    const x = pad.left + ((m - 1) / 11) * plotW;
    return safeNum(x, pad.left);
  };
  const toY = (v) => {
    const y = pad.top + plotH - (safeNum(v) / maxChartVal) * plotH;
    return safeNum(y, pad.top + plotH);
  };

  const revPts = results.projection.map((d) => `${toX(d.month)},${toY(d.revenue)}`).join(' ');
  const netPts = results.projection.map((d) => `${toX(d.month)},${toY(d.net)}`).join(' ');

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Analyse profitability, depreciation, and return on investment.
        Manage capital assets, operating costs, and revenue projections.
      </Text>

      {/* Key Metrics */}
      <View style={styles.grid3}>
        <MetricCard label="Monthly Revenue" value={`Rs. ${results.revenue.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="EBITDA" value={`Rs. ${Math.round(results.ebitda).toLocaleString()}`} accent={ACCENT} subtitle="Earnings before depreciation" />
        <MetricCard label="Net Profit" value={`Rs. ${Math.round(results.netProfit).toLocaleString()}`} accent={results.netProfit >= 0 ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Profit Margin" value={`${results.profitMargin.toFixed(1)}%`} accent={results.profitMargin >= 0 ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Total Investment" value={`Rs. ${results.totalInvestment.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Annual ROI" value={`${results.roi.toFixed(1)}%`} accent={results.roi >= 0 ? ACCENT : COLORS.accentRed} />
      </View>

      {/* Inputs */}
      <SectionTitle accent={ACCENT}>Key Drivers</SectionTitle>
      <EquationBox accent={ACCENT}>
        Net Profit = Revenue − Operating Costs − Depreciation{'\n'}
        ROI = (Annual Net Profit / Total Investment) × 100
      </EquationBox>

      <SliderRow
        label="Enrolment"
        unit="children"
        value={enrolment}
        onChange={setEnrolment}
        min={5}
        max={ENROLMENT_CAPACITY}
        step={1}
        accent={ACCENT}
      />

      <SliderRow
        label="Tuition Fee"
        unit="Rs./mo"
        value={tuition}
        onChange={setTuition}
        min={500}
        max={2000}
        step={25}
        accent={ACCENT}
        formatValue={(v) => `Rs. ${v}`}
      />

      <SliderRow
        label="Operating Costs"
        unit="Rs./mo"
        value={operatingCosts}
        onChange={setOperatingCosts}
        min={5000}
        max={50000}
        step={500}
        accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`}
      />

      {/* Capital Assets & Depreciation */}
      <SectionTitle accent={ACCENT}>Capital Assets & Depreciation</SectionTitle>
      <Text style={styles.note}>
        Each asset's monthly depreciation = (asset cost) / (useful life × 12 months).
        Changing the cost or life updates the depreciation schedule.
      </Text>

      <View style={styles.assetTable}>
        <View style={styles.assetHeader}>
          <Text style={[styles.assetHeaderCell, { flex: 2 }]}>Asset</Text>
          <Text style={styles.assetHeaderCell}>Cost</Text>
          <Text style={styles.assetHeaderCell}>Life (yr)</Text>
          <Text style={[styles.assetHeaderCell, { textAlign: 'right' }]}>Depr/mo</Text>
        </View>
        {assets.map((a) => {
          const cost = Number(a.cost) || 0;
          const life = Number(a.life) || 0;
          const monthlyDep = life > 0 ? (cost / (life * 12)) : cost;
          return (
            <View key={a.id} style={styles.assetRow}>
              <Text style={[styles.assetCell, { flex: 2 }]}>{a.label}</Text>
              <TextInput
                style={styles.assetInput}
                value={a.cost}
                onChangeText={(t) => updateAsset(a.id, 'cost', t)}
                keyboardType="numeric"
                placeholderTextColor="#6b7178"
              />
              <TextInput
                style={[styles.assetInput, { width: 44 }]}
                value={a.life}
                onChangeText={(t) => updateAsset(a.id, 'life', t)}
                keyboardType="numeric"
                placeholderTextColor="#6b7178"
              />
              <Text style={styles.assetVal}>
                Rs. {Math.round(monthlyDep).toLocaleString()}
              </Text>
            </View>
          );
        })}
        <View style={[styles.assetRow, styles.assetTotal]}>
          <Text style={[styles.assetCell, { flex: 2, fontWeight: '700' }]}>Total</Text>
          <Text style={styles.assetVal}>
            Rs. {assets.reduce((s, a) => s + (Number(a.cost) || 0), 0).toLocaleString()}
          </Text>
          <Text style={styles.assetVal}></Text>
          <Text style={[styles.assetVal, { fontWeight: '700' }]}>
            Rs. {Math.round(results.totalDepreciation).toLocaleString()}
          </Text>
        </View>
      </View>

      {/* Asset Allocation */}
      <SectionTitle accent={ACCENT}>Capital Allocation</SectionTitle>
      <StackedBar
        segments={results.assetValues}
        colors={results.assetColors}
        labels={results.assetLabels}
      />

      {/* 12-Month Projection Chart */}
      <SectionTitle accent={ACCENT}>12-Month Financial Projection</SectionTitle>
      <View style={styles.chartContainer}>
        <Svg width={chartW} height={chartH}>
          <SvgText x={8} y={12} fontSize={9} fill="#6b7178" textAnchor="start">
            Rs.
          </SvgText>

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

          <Polyline points={revPts} fill="none" stroke={COLORS.accentLP} strokeWidth={2.5} />
          <Polyline points={netPts} fill="none" stroke={ACCENT} strokeWidth={2.5} />

          {[1, 4, 7, 10, 12].map((m) => (
            <SvgText
              key={m}
              x={toX(m)}
              y={chartH - 4}
              fontSize={8}
              fill="#6b7178"
              textAnchor="middle"
            >
              M{m}
            </SvgText>
          ))}

          <G x={chartW - 140} y={8}>
            <Rect x={0} y={0} width={10} height={3} rx={1.5} fill={COLORS.accentLP} />
            <SvgText x={15} y={4} fontSize={9} fill="#6b7178">Revenue</SvgText>
            <Rect x={70} y={0} width={10} height={3} rx={1.5} fill={ACCENT} />
            <SvgText x={85} y={4} fontSize={9} fill="#6b7178">Net Profit</SvgText>
          </G>
        </Svg>
      </View>

      {/* Monthly projection table */}
      <SectionTitle accent={ACCENT}>Monthly Summary</SectionTitle>
      <View style={styles.table}>
        <View style={styles.tableHeader}>
          {['Month', 'Revenue', 'Costs', 'EBITDA', 'Net'].map((h) => (
            <Text key={h} style={styles.th}>{h}</Text>
          ))}
        </View>
        {results.projection.map((d) => (
          <View key={d.month} style={styles.tr}>
            <Text style={styles.td}>{d.month}</Text>
            <Text style={styles.td}>Rs. {d.revenue.toLocaleString()}</Text>
            <Text style={styles.td}>Rs. {d.costs.toLocaleString()}</Text>
            <Text style={[styles.td, { color: d.ebitda >= 0 ? COLORS.textSuccess : COLORS.accentRed }]}>
              Rs. {d.ebitda.toLocaleString()}
            </Text>
            <Text style={[styles.td, { color: d.net >= 0 ? COLORS.textSuccess : COLORS.accentRed }]}>
              Rs. {d.net.toLocaleString()}
            </Text>
          </View>
        ))}
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
  note: {
    fontSize: 12,
    color: '#6b7178',
    lineHeight: 20,
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#e6e0d0',
  },
  chartContainer: {
    backgroundColor: '#f6f2e8',
    borderRadius: 10,
    padding: 12,
    marginTop: 8,
    alignItems: 'center',
  },
  assetTable: {
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 10,
    overflow: 'hidden',
    marginBottom: 12,
  },
  assetHeader: {
    flexDirection: 'row',
    backgroundColor: '#f6f2e8',
    paddingVertical: 8,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#e6e0d0',
  },
  assetHeaderCell: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6b7178',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  assetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#eee9dc',
  },
  assetTotal: {
    backgroundColor: '#f6f2e8',
    borderBottomWidth: 0,
  },
  assetCell: {
    fontSize: 11,
    color: '#232a2e',
    flex: 1,
  },
  assetInput: {
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 3,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'System',
    color: '#232a2e',
    backgroundColor: '#fff',
    width: 72,
    textAlign: 'right',
    marginRight: 4,
  },
  assetVal: {
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#6b7178',
    flex: 1,
    textAlign: 'right',
  },
  table: {
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 10,
    overflow: 'hidden',
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#f6f2e8',
    paddingVertical: 8,
    paddingHorizontal: 9,
  },
  th: {
    flex: 1,
    fontSize: 10.5,
    fontWeight: '600',
    color: '#6b7178',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
    textAlign: 'right',
  },
  tr: {
    flexDirection: 'row',
    paddingVertical: 7,
    paddingHorizontal: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#eee9dc',
  },
  td: {
    flex: 1,
    fontSize: 11,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#232a2e',
    textAlign: 'right',
  },
});
