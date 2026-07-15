import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import {
  COST_REFERENCE,
  ENROLMENT_CAPACITY,
  FIXED_COST_RANGES,
  PER_CHILD_COST_RANGES,
  STAFF_ROLES,
} from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import { DualSlider } from '../components/SliderRow';
import SliderRow from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import ResultBox from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import InfoBox from '../components/InfoBox';
import DataTable from '../components/DataTable';
import ReferenceStrip from '../components/ReferenceStrip';
import GaugeBar from '../components/GaugeBar';

const ACCENT = COLORS.accentCO;

function scaleRanges(baseRanges, factor) {
  return baseRanges.map((item) => ({
    ...item,
    min: Math.round(item.min * factor),
    max: Math.round(item.max * factor),
  }));
}

export default function COScreen() {
  const insets = useSafeAreaInsets();
  const [enrolment, setEnrolment] = useState(30);
  const [budgetCap, setBudgetCap] = useState(650000);
  const [fixedRanges, setFixedRanges] = useState(FIXED_COST_RANGES);
  const [perChildRanges, setPerChildRanges] = useState(PER_CHILD_COST_RANGES);

  const staffFloor = useMemo(() => {
    const infant = Math.round(enrolment * 0.18);
    const toddler = Math.round(enrolment * 0.27);
    const preschool = Math.round(enrolment * 0.33);
    const schoolage = enrolment - infant - toddler - preschool;

    const teacherCount = Math.ceil(preschool / 8) + Math.ceil(schoolage / 12);
    const caretakerCount = Math.ceil(infant / 3);
    const helperCount = Math.ceil(toddler / 5);

    return STAFF_ROLES.reduce((sum, role) => {
      if (role.id === 'manager' || role.id === 'security') return sum + role.salary;
      if (role.id === 'teacher') return sum + teacherCount * role.salary;
      if (role.id === 'baby') return sum + caretakerCount * role.salary;
      if (role.id === 'helper') return sum + helperCount * role.salary;
      return sum;
    }, 0);
  }, [enrolment]);

  const results = useMemo(() => {
    const fixedRows = fixedRanges.map((item) => ({
      ...item,
      source: 'Own range',
      totalMin: item.min,
      totalMax: item.max,
    }));

    const variableRows = perChildRanges.map((item) => ({
      ...item,
      source: `Rs. ${item.min.toLocaleString()}-${item.max.toLocaleString()} per child x ${enrolment}`,
      totalMin: item.min * enrolment,
      totalMax: item.max * enrolment,
    }));

    const totalMin = fixedRows.reduce((sum, item) => sum + item.totalMin, 0)
      + variableRows.reduce((sum, item) => sum + item.totalMin, 0)
      + staffFloor;

    const totalMax = fixedRows.reduce((sum, item) => sum + item.totalMax, 0)
      + variableRows.reduce((sum, item) => sum + item.totalMax, 0)
      + staffFloor;

    const perChildMin = perChildRanges.reduce((sum, item) => sum + item.min, 0);
    const perChildMax = perChildRanges.reduce((sum, item) => sum + item.max, 0);

    return {
      fixedRows,
      variableRows,
      totalMin,
      totalMax,
      perChildMin,
      perChildMax,
      feasible: totalMin <= budgetCap,
      budgetGap: budgetCap - totalMin,
    };
  }, [budgetCap, enrolment, fixedRanges, perChildRanges, staffFloor]);

  const updateFixedRange = (id, nextMin, nextMax) => {
    setFixedRanges((current) => current.map((item) => (
      item.id === id ? { ...item, min: nextMin, max: nextMax } : item
    )));
  };

  const updatePerChildRange = (id, nextMin, nextMax) => {
    setPerChildRanges((current) => current.map((item) => (
      item.id === id ? { ...item, min: nextMin, max: nextMax } : item
    )));
  };

  const autoSuggest = () => {
    const sizeFactor = enrolment / 30;
    setFixedRanges(scaleRanges(FIXED_COST_RANGES, sizeFactor));
    setPerChildRanges(PER_CHILD_COST_RANGES);
  };

  const tableRows = [
    ...results.fixedRows.map((item) => ([
      item.label,
      `Rs. ${item.totalMin.toLocaleString()} - ${item.totalMax.toLocaleString()}`,
      item.source,
    ])),
    [
      'Staff floor',
      `Rs. ${staffFloor.toLocaleString()}`,
      'Computed from staffing model',
    ],
    ...results.variableRows.map((item) => ([
      item.label,
      `Rs. ${item.totalMin.toLocaleString()} - ${item.totalMax.toLocaleString()}`,
      item.source,
    ])),
    [
      'Minimum feasible cost C*',
      `Rs. ${results.totalMin.toLocaleString()}`,
      `At n = ${enrolment}`,
    ],
    [
      'Maximum plausible cost',
      `Rs. ${results.totalMax.toLocaleString()}`,
      'Upper end of all ranges',
    ],
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 26 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        This model treats every category as a lower-bound spending range. The minimum feasible allocation
        always sits at the low end of each range, then the app checks whether that total still fits your
        launch budget.
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Children (n)" value={enrolment} accent={ACCENT} />
        <MetricCard label="Per-child subtotal" value={`Rs. ${results.perChildMin.toLocaleString()}-${results.perChildMax.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Minimum feasible cost" value={`Rs. ${results.totalMin.toLocaleString()}`} subtitle={`Budget cap Rs. ${budgetCap.toLocaleString()}`} accent={ACCENT} />
      </View>

      <InfoBox
        title="How this model is built"
        accent={ACCENT}
        items={[
          { label: 'Staff floor:', text: 'It is not guessed. It is recomputed from the staffing logic at the chosen enrolment.' },
          { label: 'Fixed costs:', text: 'These do not scale per child, but they still widen as you choose a larger centre.' },
          { label: 'Variable costs:', text: 'Food, supplies, materials, and maintenance scale directly with enrolment.' },
          { label: 'Objective:', text: 'Because all coefficients are positive, the minimum-cost solution binds every category at its floor.' },
        ]}
      />

      <SectionTitle accent={ACCENT}>Cost structure</SectionTitle>
      <EquationBox accent={ACCENT}>
        Total cost = fixed ranges + staffing floor + (per-child ranges x n)
      </EquationBox>

      <SliderRow
        label="Target enrolment"
        unit="children"
        value={enrolment}
        onChange={setEnrolment}
        min={10}
        max={ENROLMENT_CAPACITY}
        step={1}
        accent={ACCENT}
      />

      <SliderRow
        label="Monthly budget cap"
        unit="Rs."
        value={budgetCap}
        onChange={setBudgetCap}
        min={400000}
        max={1500000}
        step={10000}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      <SectionTitle accent={ACCENT}>Fixed monthly ranges</SectionTitle>
      {fixedRanges.map((item) => (
        <DualSlider
          key={item.id}
          label={item.label}
          value1={item.min}
          value2={item.max}
          onChange1={(value) => updateFixedRange(item.id, value, item.max)}
          onChange2={(value) => updateFixedRange(item.id, item.min, value)}
          min={0}
          max={120000}
          step={2500}
          accent={ACCENT}
          description="Drag both ends of the range"
        />
      ))}

      <SectionTitle accent={ACCENT}>Per-child ranges</SectionTitle>
      {perChildRanges.map((item) => (
        <DualSlider
          key={item.id}
          label={item.label}
          value1={item.min}
          value2={item.max}
          onChange1={(value) => updatePerChildRange(item.id, value, item.max)}
          onChange2={(value) => updatePerChildRange(item.id, item.min, value)}
          min={0}
          max={500}
          step={10}
          accent={ACCENT}
          description="Per child per month"
        />
      ))}

      <Text onPress={autoSuggest} style={styles.autoSuggest}>
        Auto-suggest starter ranges
      </Text>

      <SectionTitle accent={ACCENT}>Budget utilisation</SectionTitle>
      <GaugeBar
        label="Minimum feasible"
        value={results.totalMin}
        max={Math.max(results.totalMax, budgetCap)}
        accent={results.feasible ? ACCENT : COLORS.accentRed}
        format={() => `Rs. ${results.totalMin.toLocaleString()}`}
      />
      <GaugeBar
        label="Budget cap"
        value={budgetCap}
        max={Math.max(results.totalMax, budgetCap)}
        accent={COLORS.accentGR}
        format={() => `Rs. ${budgetCap.toLocaleString()}`}
      />

      {results.feasible ? (
        <ResultBox type="ok">
          Feasible. The minimum-cost allocation is Rs. {results.totalMin.toLocaleString()} per month, leaving
          Rs. {results.budgetGap.toLocaleString()} of slack before you hit the budget cap.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Infeasible. Even the minimum-cost allocation is Rs. {results.totalMin.toLocaleString()}, which exceeds
          your cap by Rs. {Math.abs(results.budgetGap).toLocaleString()}.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Allocation summary</SectionTitle>
      <DataTable
        columns={['Category', 'Monthly range', 'Source']}
        rows={tableRows}
        flexes={[1.5, 1.1, 1.6]}
      />

      <ReferenceStrip
        title="Reference examples"
        items={COST_REFERENCE}
        accent={ACCENT}
      />
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
  autoSuggest: {
    marginTop: 6,
    fontSize: 13,
    fontWeight: '700',
    color: ACCENT,
  },
});
