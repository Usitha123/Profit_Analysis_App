import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { COLORS } from '../constants/theme';
import {
  CO_AGE_MIX, FIXED_COST_RANGES, PER_CHILD_COST_RANGES, STAFF_ROLES,
} from '../constants/modelData';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow, { DualSlider } from '../components/SliderRow';
import ResultBox from '../components/ResultBox';
import Section from '../components/Section';
import DataTable from '../components/DataTable';
import GaugeBar from '../components/GaugeBar';

const ACCENT = COLORS.accentCO;

function staffFloorForEnrolment(n) {
  const infant = Math.round(n * CO_AGE_MIX.infant);
  const toddler = Math.round(n * CO_AGE_MIX.toddler);
  const preschool = Math.round(n * CO_AGE_MIX.preschool);
  const schoolage = Math.max(0, n - infant - toddler - preschool);
  const teachers = Math.ceil(preschool / 6) + Math.ceil(schoolage / 10);
  const caretakers = Math.ceil(infant / 3);
  const helpers = Math.ceil(toddler / 4);
  return STAFF_ROLES.reduce((sum, role) => {
    if (role.id === 'manager' || role.id === 'security') return sum + role.salary;
    if (role.id === 'teacher') return sum + teachers * role.salary;
    if (role.id === 'baby') return sum + caretakers * role.salary;
    if (role.id === 'helper') return sum + helpers * role.salary;
    return sum;
  }, 0);
}

function scaleRanges(base, factor) {
  return base.map((item) => ({ ...item, min: Math.round(item.min * factor), max: Math.round(item.max * factor) }));
}

export default function COScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();
  const [autoNote, setAutoNote] = useState(null);

  const enrolment = Math.max(10, planner.totalChildren || 10);

  const fixedRanges = useMemo(
    () => FIXED_COST_RANGES.map((meta) => {
      const saved = (planner.coFixedRanges || []).find((r) => r.id === meta.id);
      return { ...meta, min: saved?.min ?? meta.min, max: saved?.max ?? meta.max };
    }),
    [planner.coFixedRanges],
  );
  const perChildRanges = useMemo(
    () => PER_CHILD_COST_RANGES.map((meta) => {
      const saved = (planner.coPerChildRanges || []).find((r) => r.id === meta.id);
      return { ...meta, min: saved?.min ?? meta.min, max: saved?.max ?? meta.max };
    }),
    [planner.coPerChildRanges],
  );

  const staffFloor = useMemo(() => staffFloorForEnrolment(enrolment), [enrolment]);

  const results = useMemo(() => {
    const fixedMin = fixedRanges.reduce((s, i) => s + i.min, 0);
    const fixedMax = fixedRanges.reduce((s, i) => s + i.max, 0);
    const pcMin = perChildRanges.reduce((s, i) => s + i.min, 0);
    const pcMax = perChildRanges.reduce((s, i) => s + i.max, 0);
    const totalMin = fixedMin + staffFloor + pcMin * enrolment;
    const totalMax = fixedMax + staffFloor + pcMax * enrolment;
    return {
      totalMin, totalMax, perChildMin: pcMin, perChildMax: pcMax,
      feasible: totalMin <= planner.coBudgetCap,
      budgetGap: planner.coBudgetCap - totalMin,
    };
  }, [planner.coBudgetCap, enrolment, fixedRanges, perChildRanges, staffFloor]);

  const updateFixed = (id, lo, hi) => {
    const next = fixedRanges.map((i) => (i.id === id ? { ...i, min: lo, max: hi } : i))
      .map(({ id, min, max }) => ({ id, min, max }));
    planner.update({ coFixedRanges: next });
  };
  const updatePerChild = (id, lo, hi) => {
    const next = perChildRanges.map((i) => (i.id === id ? { ...i, min: lo, max: hi } : i))
      .map(({ id, min, max }) => ({ id, min, max }));
    planner.update({ coPerChildRanges: next });
  };

  const autoSuggest = () => {
    try { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); } catch (_) {}
    const sizeFactor = Math.max(0.5, enrolment / 28);
    planner.update({
      coFixedRanges: scaleRanges(FIXED_COST_RANGES, sizeFactor).map(({ id, min, max }) => ({ id, min, max })),
      coPerChildRanges: PER_CHILD_COST_RANGES.map(({ id, min, max }) => ({ id, min, max })),
    });
    setAutoNote(`Scaled ranges for n=${enrolment} using survey baseline at n=28.`);
  };

  // Amounts drop the "Rs." prefix - the column header carries the unit, which
  // keeps each range on a single line at phone widths.
  const tableRows = [
    ...fixedRanges.map((i) => [i.label, `${i.min.toLocaleString()} - ${i.max.toLocaleString()}`, 'Fixed / month']),
    ['Staff floor', staffFloor.toLocaleString(), `From LP at n=${enrolment}`],
    ...perChildRanges.map((i) => [
      i.label,
      `${(i.min * enrolment).toLocaleString()} - ${(i.max * enrolment).toLocaleString()}`,
      `${i.min}-${i.max}/child × ${enrolment}`,
    ]),
    ['Minimum feasible C*', results.totalMin.toLocaleString(), `At n=${enrolment}`],
    ['Maximum plausible', results.totalMax.toLocaleString(), 'Upper end of ranges'],
  ];

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
        <MetricCard label="Children (n)" value={enrolment} accent={ACCENT} icon="account-multiple" subtitle="from Staffing tab" />
        <MetricCard label="Per-child subtotal" value={`Rs. ${results.perChildMin.toLocaleString()}-${results.perChildMax.toLocaleString()}`} accent={ACCENT} icon="cash-multiple" />
        <MetricCard label="Minimum feasible" value={`Rs. ${results.totalMin.toLocaleString()}`} subtitle={`Cap Rs. ${planner.coBudgetCap.toLocaleString()}`} accent={results.feasible ? ACCENT : COLORS.accentRed} icon="arrow-down-bold-outline" />
        <MetricCard label="Max plausible" value={`Rs. ${results.totalMax.toLocaleString()}`} accent={ACCENT} icon="arrow-up-bold-outline" />
      </View>

      <Section title="Budget cap" icon="cash-multiple" accent={ACCENT}>
        <SliderRow plain label="Monthly budget cap" unit="Rs." value={planner.coBudgetCap}
          onChange={(v) => planner.update({ coBudgetCap: v })}
          min={200000} max={1500000} step={10000} accent={ACCENT}
          formatValue={(v) => `Rs. ${v.toLocaleString()}`} />
      </Section>

      <Section title="Fixed monthly ranges" icon="home-outline" accent={ACCENT}>
        {fixedRanges.map((item) => (
          <DualSlider
            key={item.id}
            plain
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
      </Section>

      <Section title="Per-child ranges" icon="baby-face-outline" accent={ACCENT}>
        {perChildRanges.map((item) => (
          <DualSlider
            key={item.id}
            plain
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
      </Section>

      <Section title="Budget utilisation" icon="gauge" accent={ACCENT}>
        <View style={{ paddingVertical: 8 }}>
          <GaugeBar label="Minimum required" value={results.totalMin} max={Math.max(results.totalMax, planner.coBudgetCap)}
            accent={results.feasible ? ACCENT : COLORS.accentRed}
            format={() => `Rs. ${results.totalMin.toLocaleString()}`} />
          <GaugeBar label="Your budget cap" value={planner.coBudgetCap} max={Math.max(results.totalMax, planner.coBudgetCap)}
            accent={COLORS.accentGR} format={() => `Rs. ${planner.coBudgetCap.toLocaleString()}`} />
          <GaugeBar label="Maximum plausible" value={results.totalMax} max={Math.max(results.totalMax, planner.coBudgetCap)}
            accent={COLORS.accentPF} format={() => `Rs. ${results.totalMax.toLocaleString()}`} />
        </View>
      </Section>

      {results.feasible ? (
        <ResultBox type="ok">
          Feasible. Minimum allocation Rs. {results.totalMin.toLocaleString()}/mo leaves Rs. {results.budgetGap.toLocaleString()} slack under cap.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Infeasible. Even the minimum allocation Rs. {results.totalMin.toLocaleString()} exceeds cap by Rs. {Math.abs(results.budgetGap).toLocaleString()}.
        </ResultBox>
      )}

      <Section title="Allocation summary" icon="table" accent={ACCENT} defaultOpen={false}>
        <DataTable columns={['Category', 'Monthly range (Rs.)', 'Source']} rows={tableRows} flexes={[1.25, 1.5, 1.25]} />
      </Section>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  button: {
    marginTop: 12, borderWidth: 1.5, borderRadius: 12, paddingVertical: 12, alignItems: 'center', backgroundColor: '#fff',
  },
  buttonText: { fontSize: 13.5, fontWeight: '700' },
  autoNote: { marginTop: 8, fontSize: 12, color: '#6b7178', fontStyle: 'italic' },
  linkBanner: {
    backgroundColor: `${ACCENT}12`,
    borderRadius: 12, paddingHorizontal: 12, paddingVertical: 8,
    marginBottom: 12,
  },
  linkBannerText: { fontSize: 12, color: COLORS.textSecondary },
  linkBannerNum: { fontWeight: '800', color: ACCENT },
});
