import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, TextInput, StyleSheet, Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { FIXED_COSTS, TUITION_RATE, ENROLMENT_CAPACITY } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import GaugeBar from '../components/GaugeBar';
import EquationBox from '../components/EquationBox';

const ACCENT = COLORS.accentCO;

export default function COScreen() {
  const insets = useSafeAreaInsets();
  const [enrolment, setEnrolment] = useState(35);
  const [tuition, setTuition] = useState(TUITION_RATE);
  const [tenure, setTenure] = useState(60);

  const [fixedCosts, setFixedCosts] = useState(
    FIXED_COSTS.map((c) => ({ ...c }))
  );

  const [variableRange, setVariableRange] = useState({ min: 800, max: 2000 });
  const [minInput, setMinInput] = useState('800');
  const [maxInput, setMaxInput] = useState('2000');

  const updateFixedCost = useCallback((id, val) => {
    setFixedCosts((prev) =>
      prev.map((c) => (c.id === id ? { ...c, value: val } : c))
    );
  }, []);

  const handleMinChange = (text) => {
    setMinInput(text);
    const val = Number(text);
    if (!isNaN(val) && val >= 0) {
      setVariableRange((p) => ({ ...p, min: val }));
    }
  };

  const handleMaxChange = (text) => {
    setMaxInput(text);
    const val = Number(text);
    if (!isNaN(val) && val >= 0) {
      setVariableRange((p) => ({ ...p, max: val }));
    }
  };

  const handleMinBlur = () => {
    let val = Number(minInput);
    if (isNaN(val) || val < 0) {
      val = 0;
    }
    const maxVal = variableRange.max;
    if (val > maxVal - 50) {
      val = Math.max(0, maxVal - 50);
    }
    setVariableRange((p) => ({ ...p, min: val }));
    setMinInput(String(val));
  };

  const handleMaxBlur = () => {
    let val = Number(maxInput);
    if (isNaN(val) || val < 0) {
      val = 0;
    }
    const minVal = variableRange.min;
    if (val < minVal + 50) {
      val = minVal + 50;
    }
    setVariableRange((p) => ({ ...p, max: val }));
    setMaxInput(String(val));
  };

  const results = useMemo(() => {
    const totalFixed = fixedCosts.reduce((s, c) => s + c.value, 0);
    const avgVarCost = (variableRange.min + variableRange.max) / 2;
    const totalVariable = avgVarCost * enrolment;
    const totalCost = totalFixed + totalVariable;
    const revenue = enrolment * tuition;
    const surplus = revenue - totalCost;
    const costPerChild = enrolment > 0 ? totalCost / enrolment : 0;
    const varCostPerChild = avgVarCost;
    const totalBudget = totalFixed + 2000 * enrolment;

    return {
      totalFixed,
      avgVarCost,
      totalVariable,
      totalCost,
      revenue,
      surplus,
      costPerChild,
      varCostPerChild,
      totalBudget,
      costPct: totalBudget > 0 ? Math.round((totalCost / totalBudget) * 100) : 0,
    };
  }, [fixedCosts, variableRange, enrolment, tuition]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Balance fixed and variable costs to optimise your daycare's cost structure.
        Adjust enrolment, tuition fees, and expense items below.
      </Text>

      {/* Metrics */}
      <View style={styles.grid3}>
        <MetricCard label="Total Cost" value={`$${results.totalCost.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Revenue" value={`$${results.revenue.toLocaleString()}`} accent={ACCENT} />
        <MetricCard
          label="Surplus"
          value={`$${results.surplus.toLocaleString()}`}
          accent={results.surplus >= 0 ? ACCENT : COLORS.accentRed}
          subtitle={results.surplus >= 0 ? 'Profitable' : 'Loss'}
        />
        <MetricCard label="Cost / Child" value={`$${Math.round(results.costPerChild)}`} accent={ACCENT} />
        <MetricCard label="Fixed Costs" value={`$${results.totalFixed.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Variable Costs" value={`$${results.totalVariable.toLocaleString()}`} accent={ACCENT} />
      </View>

      {/* Gauge */}
      <SectionTitle accent={ACCENT}>Budget Utilisation</SectionTitle>
      <GaugeBar
        label="Cost vs Budget"
        value={results.totalCost}
        max={results.totalBudget}
        accent={ACCENT}
        format={(v) => `${Math.round((v / results.totalBudget) * 100)}%`}
      />

      {/* Key Drivers */}
      <SectionTitle accent={ACCENT}>Key Drivers</SectionTitle>
      <EquationBox accent={ACCENT}>
        Total Cost = Fixed Costs + (Avg Variable Cost × Enrolment)
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
        unit="$/mo"
        value={tuition}
        onChange={setTuition}
        min={500}
        max={2000}
        step={25}
        accent={ACCENT}
        formatValue={(v) => `$${v}`}
      />

      <SliderRow
        label="Avg Tenure"
        unit="months"
        value={tenure}
        onChange={setTenure}
        min={6}
        max={48}
        step={1}
        accent={ACCENT}
        formatValue={(v) => `${v} mo`}
      />

      {/* Variable Cost Range */}
      <SectionTitle accent={ACCENT}>Variable Cost per Child</SectionTitle>
      <Text style={styles.note}>
        Set the range of monthly variable costs per enrolled child (supplies, meals, activities).
      </Text>
      <View style={styles.dualRow}>
        <Text style={styles.dualLabel}>Range</Text>
        <View style={styles.dualInputs}>
          <TextInput
            style={[styles.dualInput, { color: ACCENT }]}
            value={minInput}
            onChangeText={handleMinChange}
            onBlur={handleMinBlur}
            keyboardType="numeric"
          />
          <Text style={styles.dualSep}>–</Text>
          <TextInput
            style={[styles.dualInput, { color: ACCENT }]}
            value={maxInput}
            onChangeText={handleMaxChange}
            onBlur={handleMaxBlur}
            keyboardType="numeric"
          />
        </View>
      </View>

      {/* Fixed Costs */}
      <SectionTitle accent={ACCENT}>Fixed Costs</SectionTitle>
      {fixedCosts.map((c) => (
        <SliderRow
          key={c.id}
          label={c.label}
          unit="$/mo"
          value={c.value}
          onChange={(v) => updateFixedCost(c.id, v)}
          min={0}
          max={10000}
          step={50}
          accent={ACCENT}
          formatValue={(v) => `$${v.toLocaleString()}`}
        />
      ))}
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
    marginBottom: 8,
    paddingLeft: 10,
    borderLeftWidth: 2,
    borderLeftColor: '#e6e0d0',
  },
  dualRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 16,
  },
  dualLabel: {
    fontSize: 13,
    color: '#6b7178',
    minWidth: 60,
  },
  dualInputs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    flex: 1,
  },
  dualInput: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12,
    fontWeight: '700',
    backgroundColor: 'rgba(47,143,131,0.08)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    textAlign: 'right',
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  dualSep: {
    color: '#6b7178',
    fontSize: 12,
  },
});
