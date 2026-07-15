import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import {
  CO_AGE_MIX,
  ENROLMENT_CAPACITY,
  FIXED_COST_RANGES,
  PER_CHILD_COST_RANGES,
  STAFF_ROLES,
} from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow, { DualSlider } from '../components/SliderRow';
import { SectionTitle } from '../components/ResultBox';
import ResultBox from '../components/ResultBox';
import DataTable from '../components/DataTable';
import GaugeBar from '../components/GaugeBar';

const ACCENT = COLORS.accentCO;

function scaleRanges(base, factor) {
  return base.map((item) => ({ ...item, min: Math.round(item.min * factor), max: Math.round(item.max * factor) }));
}

function staffFloorForEnrolment(n) {
  const infant = Math.round(n * CO_AGE_MIX.infant);
  const toddler = Math.round(n * CO_AGE_MIX.toddler);
  const preschool = Math.round(n * CO_AGE_MIX.preschool);
  const schoolage = Math.max(0, n - infant - toddler - preschool);
  const teachers = Math.ceil(preschool / 8) + Math.ceil(schoolage / 12);
  const caretakers = Math.ceil(infant / 3);
  const helpers = Math.ceil(toddler / 5);
  return STAFF_ROLES.reduce((sum, role) => {
    if (role.id === 'manager' || role.id === 'security') return sum + role.salary;
    if (role.id === 'teacher') return sum + teachers * role.salary;
    if (role.id === 'baby') return sum + caretakers * role.salary;
    if (role.id === 'helper') return sum + helpers * role.salary;
    return sum;
  }, 0);
}

export default function COScreen() {
  const insets = useSafeAreaInsets();
  const [enrolment, setEnrolment] = useState(28);
  const [budgetCap, setBudgetCap] = useState(450000);
  const [fixedRanges, setFixedRanges] = useState(FIXED_COST_RANGES);
  const [perChildRanges, setPerChildRanges] = useState(PER_CHILD_COST_RANGES);
  const [autoNote, setAutoNote] = useState(null);

  const staffFloor = useMemo(() => staffFloorForEnrolment(enrolment), [enrolment]);

  const results = useMemo(() => {
    const fixedMin = fixedRanges.reduce((s, i) => s + i.min, 0);
    const fixedMax = fixedRanges.reduce((s, i) => s + i.max, 0);
    const pcMin = perChildRanges.reduce((s, i) => s + i.min, 0);
    const pcMax = perChildRanges.reduce((s, i) => s + i.max, 0);
    const totalMin = fixedMin + staffFloor + pcMin * enrolment;
    const totalMax = fixedMax + staffFloor + pcMax * enrolment;
    return {
      totalMin, totalMax,
      perChildMin: pcMin, perChildMax: pcMax,
      feasible: totalMin <= budgetCap,
      budgetGap: budgetCap - totalMin,
    };
  }, [budgetCap, enrolment, fixedRanges, perChildRanges, staffFloor]);

  const updateFixed = (id, lo, hi) => setFixedRanges((cur) => cur.map((i) => i.id === id ? { ...i, min: lo, max: hi } : i));
  const updatePerChild = (id, lo, hi) => setPerChildRanges((cur) => cur.map((i) => i.id === id ? { ...i, min: lo, max: hi } : i));

  const autoSuggest = () => {
    const sizeFactor = Math.max(0.5, enrolment / 28);
    setFixedRanges(scaleRanges(FIXED_COST_RANGES, sizeFactor));
    setPerChildRanges(PER_CHILD_COST_RANGES);
    setAutoNote(`Scaled ranges for n=${enrolment} using survey baseline at n=28.`);
  };

  const tableRows = [
    ...fixedRanges.map((i) => [i.label, `Rs. ${i.min.toLocaleString()} - ${i.max.toLocaleString()}`, 'Fixed / month']),
    ['Staff floor', `Rs. ${staffFloor.toLocaleString()}`, `From LP at n=${enrolment}`],
    ...perChildRanges.map((i) => [
      i.label,
      `Rs. ${(i.min * enrolment).toLocaleString()} - ${(i.max * enrolment).toLocaleString()}`,
      `Rs. ${i.min}-${i.max}/child x ${enrolment}`,
    ]),
    ['Minimum feasible C*', `Rs. ${results.totalMin.toLocaleString()}`, `At n=${enrolment}`],
    ['Maximum plausible', `Rs. ${results.totalMax.toLocaleString()}`, 'Upper end of ranges'],
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Children (n)" value={enrolment} accent={ACCENT} />
        <MetricCard label="Per-child subtotal" value={`Rs. ${results.perChildMin.toLocaleString()}-${results.perChildMax.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Minimum feasible" value={`Rs. ${results.totalMin.toLocaleString()}`} subtitle={`Cap Rs. ${budgetCap.toLocaleString()}`} accent={results.feasible ? ACCENT : COLORS.accentRed} />
        <MetricCard label="Max plausible" value={`Rs. ${results.totalMax.toLocaleString()}`} accent={ACCENT} />
      </View>

      <SliderRow label="Target enrolment n" unit="children" value={enrolment} onChange={setEnrolment}
        min={10} max={ENROLMENT_CAPACITY} step={1} accent={ACCENT} />
      <SliderRow label="Monthly budget cap" unit="Rs." value={budgetCap} onChange={setBudgetCap}
        min={200000} max={1500000} step={10000} accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`} />

      <SectionTitle accent={ACCENT}>Fixed monthly ranges (Rs. / month)</SectionTitle>
      {fixedRanges.map((item) => (
        <DualSlider
          key={item.id}
          label={item.label}
          value1={item.min}
          value2={item.max}
          onChange1={(v) => updateFixed(item.id, v, item.max)}
          onChange2={(v) => updateFixed(item.id, item.min, v)}
          min={0} max={300000} step={2500}
          accent={ACCENT}
          description="Drag both ends of the range"
        />
      ))}

      <SectionTitle accent={ACCENT}>Per-child ranges (Rs. / child / month)</SectionTitle>
      {perChildRanges.map((item) => (
        <DualSlider
          key={item.id}
          label={item.label}
          value1={item.min}
          value2={item.max}
          onChange1={(v) => updatePerChild(item.id, v, item.max)}
          onChange2={(v) => updatePerChild(item.id, item.min, v)}
          min={0} max={2500} step={25}
          accent={ACCENT}
          description="Per child per month"
        />
      ))}

      <TouchableOpacity onPress={autoSuggest} style={[styles.button, { borderColor: ACCENT }]} activeOpacity={0.8}>
        <Text style={[styles.buttonText, { color: ACCENT }]}>Auto-suggest starter ranges</Text>
      </TouchableOpacity>
      {autoNote ? <Text style={styles.autoNote}>{autoNote}</Text> : null}

      <SectionTitle accent={ACCENT}>Budget utilisation</SectionTitle>
      <GaugeBar label="Minimum required" value={results.totalMin} max={Math.max(results.totalMax, budgetCap)}
        accent={results.feasible ? ACCENT : COLORS.accentRed}
        format={() => `Rs. ${results.totalMin.toLocaleString()}`} />
      <GaugeBar label="Your budget cap" value={budgetCap} max={Math.max(results.totalMax, budgetCap)}
        accent={COLORS.accentGR} format={() => `Rs. ${budgetCap.toLocaleString()}`} />
      <GaugeBar label="Maximum plausible" value={results.totalMax} max={Math.max(results.totalMax, budgetCap)}
        accent={COLORS.accentPF} format={() => `Rs. ${results.totalMax.toLocaleString()}`} />

      {results.feasible ? (
        <ResultBox type="ok">
          Feasible. Minimum allocation Rs. {results.totalMin.toLocaleString()}/mo leaves Rs. {results.budgetGap.toLocaleString()} slack under cap.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Infeasible. Even the minimum allocation Rs. {results.totalMin.toLocaleString()} exceeds cap by Rs. {Math.abs(results.budgetGap).toLocaleString()}.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Allocation summary</SectionTitle>
      <DataTable columns={['Category', 'Monthly range', 'Source']} rows={tableRows} flexes={[1.6, 1.4, 1.6]} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  hint: { fontSize: 12, color: '#6b7178', lineHeight: 17, marginTop: 4, marginBottom: 8 },
  button: {
    marginTop: 12, borderWidth: 1.5, borderRadius: 10, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff',
  },
  buttonText: { fontSize: 13.5, fontWeight: '700' },
  autoNote: { marginTop: 8, fontSize: 12, color: '#6b7178', fontStyle: 'italic' },
});
