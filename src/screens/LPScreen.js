import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { AGE_GROUPS, STAFF_ROLES } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import ResultBox, { SectionTitle } from '../components/ResultBox';
import ConstraintList from '../components/ConstraintList';
import DataTable from '../components/DataTable';

const { calculateStaffing } = require('../utils/calculations');

const ACCENT = COLORS.accentLP;

export default function LPScreen() {
  const insets = useSafeAreaInsets();
  const [children, setChildren] = useState(() => AGE_GROUPS.reduce((acc, group) => {
    acc[group.id] = group.default;
    return acc;
  }, {}));
  const [budgetCap, setBudgetCap] = useState(350000);
  const [roles, setRoles] = useState(STAFF_ROLES.map((role) => ({ ...role })));

  const updateSalary = useCallback((id, salary) => {
    setRoles((current) => current.map((role) => (role.id === id ? { ...role, salary } : role)));
  }, []);

  const results = useMemo(() => calculateStaffing({
    children,
    ageGroups: AGE_GROUPS,
    staffRoles: roles,
    budgetCap,
  }), [children, roles, budgetCap]);

  const constraints = useMemo(() => {
    const groupCounts = results.staffByGroup.reduce((acc, g) => { acc[g.id] = g.staffNeeded; return acc; }, {});
    const roleCounts = results.roleAllocations.reduce((acc, r) => { acc[r.id] = r.required; return acc; }, {});
    return [
      { label: `Infants 1:3 -> need >= ${Math.ceil((children.infant || 0) / 3)} caretaker(s)`, ok: (roleCounts.baby || 0) >= (groupCounts.infant || 0) },
      { label: `Toddlers 1:5 -> need >= ${Math.ceil((children.toddler || 0) / 5)} helper(s)`, ok: (roleCounts.helper || 0) >= (groupCounts.toddler || 0) },
      { label: `Pre-school 1:8 and school-age 1:12 covered by shared teacher pool`, ok: (roleCounts.teacher || 0) >= ((groupCounts.preschool || 0) + (groupCounts.schoolage || 0)) },
      { label: `Budget cap Rs. ${budgetCap.toLocaleString()} vs staff cost Rs. ${results.totalStaffCost.toLocaleString()}`, ok: results.totalStaffCost <= budgetCap },
    ];
  }, [budgetCap, children.infant, children.toddler, results]);

  const roleRows = results.roleAllocations.map((role) => ([
    role.label,
    String(role.required),
    `Rs. ${role.salary.toLocaleString()}`,
    `Rs. ${role.monthlyCost.toLocaleString()}`,
  ]));

  const totalStaff = results.roleAllocations.reduce((sum, r) => sum + r.required, 0);
  roleRows.push(['Total', String(totalStaff), '', `Rs. ${results.totalStaffCost.toLocaleString()}`]);
  const costPerChild = results.totalChildren > 0 ? Math.round(results.totalStaffCost / results.totalChildren) : 0;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 110 }]}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.metrics}>
        <MetricCard label="Children" value={results.totalChildren} accent={ACCENT} />
        <MetricCard label="Total staff" value={totalStaff} subtitle="all roles combined" accent={ACCENT} />
        <MetricCard label="Min staff cost" value={`Rs. ${results.totalStaffCost.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Cost per child" value={`Rs. ${costPerChild.toLocaleString()}`} subtitle="staff only" accent={ACCENT} />
      </View>

      <SectionTitle accent={ACCENT}>Enrolment (Q4-Q6)</SectionTitle>
      {AGE_GROUPS.map((group) => (
        <SliderRow
          key={group.id}
          label={group.label}
          unit="children"
          value={children[group.id]}
          onChange={(value) => setChildren((current) => ({ ...current, [group.id]: value }))}
          min={group.min}
          max={group.max}
          step={1}
          accent={group.color}
          description={`Target ratio 1:${group.ratio}`}
        />
      ))}

      <SliderRow
        label="Monthly staffing budget cap"
        unit="Rs."
        value={budgetCap}
        onChange={setBudgetCap}
        min={200000}
        max={700000}
        step={5000}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      <SectionTitle accent={ACCENT}>Role salaries (Q8)</SectionTitle>
      {roles.map((role) => (
        <SliderRow
          key={role.id}
          label={role.label}
          unit="Rs./mo"
          value={role.salary}
          onChange={(value) => updateSalary(role.id, value)}
          min={15000}
          max={80000}
          step={1000}
          accent={ACCENT}
          description={role.note}
          formatValue={(value) => `Rs. ${value.toLocaleString()}`}
        />
      ))}

      <SectionTitle accent={ACCENT}>Optimal staff allocation</SectionTitle>
      <DataTable columns={['Role', 'Qty', 'Salary', 'Monthly cost']} rows={roleRows} flexes={[2.4, 0.8, 1.2, 1.3]} />

      <SectionTitle accent={ACCENT}>Constraints satisfied</SectionTitle>
      <ConstraintList items={constraints} />

      {results.totalStaffCost <= budgetCap ? (
        <ResultBox type="ok">
          Optimal staff cost is Rs. {results.totalStaffCost.toLocaleString()}, leaving Rs. {(budgetCap - results.totalStaffCost).toLocaleString()} of monthly slack under the cap.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Staff cost Rs. {results.totalStaffCost.toLocaleString()} exceeds budget cap by Rs. {(results.totalStaffCost - budgetCap).toLocaleString()}. Reduce salaries, lower opening age mix, or raise the cap.
        </ResultBox>
      )}

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.backgroundPage },
  content: { paddingHorizontal: 20, paddingTop: 4 },
  metrics: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
});
