import React, { useMemo } from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { AGE_GROUPS, STAFF_ROLES } from '../constants/modelData';
import { usePlanner } from '../context/PlannerContext';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import ResultBox from '../components/ResultBox';
import Section from '../components/Section';
import ConstraintList from '../components/ConstraintList';
import DataTable from '../components/DataTable';

const { calculateStaffing } = require('../utils/calculations');

const ACCENT = COLORS.accentLP;

export default function LPScreen() {
  const insets = useSafeAreaInsets();
  const planner = usePlanner();

  const roles = useMemo(
    () => STAFF_ROLES.map((meta) => {
      const saved = (planner.roles || []).find((r) => r.id === meta.id);
      return { ...meta, salary: saved?.salary ?? meta.salary };
    }),
    [planner.roles],
  );

  const results = useMemo(() => calculateStaffing({
    children: planner.children,
    ageGroups: AGE_GROUPS,
    staffRoles: roles,
    budgetCap: planner.lpBudgetCap,
  }), [planner.children, roles, planner.lpBudgetCap]);

  const setChild = (id, value) => planner.update({ children: { ...planner.children, [id]: value } });
  const setSalary = (id, salary) => {
    const next = (planner.roles || []).map((r) => (r.id === id ? { ...r, salary } : r));
    planner.update({ roles: next });
  };

  const constraints = useMemo(() => {
    const groupCounts = results.staffByGroup.reduce((acc, g) => { acc[g.id] = g.staffNeeded; return acc; }, {});
    const roleCounts = results.roleAllocations.reduce((acc, r) => { acc[r.id] = r.required; return acc; }, {});
    const kids = planner.children;
    return [
      { label: `Infants 1:3 → need ≥ ${Math.ceil((kids.infant || 0) / 3)} caretaker(s)`, ok: (roleCounts.baby || 0) >= (groupCounts.infant || 0) },
      { label: `Toddlers 1:5 → need ≥ ${Math.ceil((kids.toddler || 0) / 5)} helper(s)`, ok: (roleCounts.helper || 0) >= (groupCounts.toddler || 0) },
      { label: `Pre-school 1:8 and school-age 1:12 covered by teacher pool`, ok: (roleCounts.teacher || 0) >= ((groupCounts.preschool || 0) + (groupCounts.schoolage || 0)) },
      { label: `Budget cap Rs. ${planner.lpBudgetCap.toLocaleString()} vs staff cost Rs. ${results.totalStaffCost.toLocaleString()}`, ok: results.totalStaffCost <= planner.lpBudgetCap },
    ];
  }, [planner.children, planner.lpBudgetCap, results]);

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
        <MetricCard label="Children" value={results.totalChildren} accent={ACCENT} icon="account-multiple-outline" />
        <MetricCard label="Total staff" value={totalStaff} subtitle="all roles combined" accent={ACCENT} icon="account-group-outline" />
        <MetricCard label="Min staff cost" value={`Rs. ${results.totalStaffCost.toLocaleString()}`} accent={ACCENT} icon="cash-multiple" />
        <MetricCard label="Cost per child" value={`Rs. ${costPerChild.toLocaleString()}`} subtitle="staff only" accent={ACCENT} icon="account-cash-outline" />
      </View>

      <Section title="Enrolment (Q4-Q6)" icon="baby-carriage" accent={ACCENT}>
        {AGE_GROUPS.map((group) => (
          <SliderRow
            key={group.id}
            plain
            label={group.label}
            unit="children"
            value={planner.children[group.id] ?? 0}
            onChange={(v) => setChild(group.id, v)}
            min={group.min}
            max={group.max}
            step={1}
            accent={group.color}
            description={`Target ratio 1:${group.ratio}`}
          />
        ))}
        <SliderRow
          plain
          label="Monthly staffing budget cap"
          unit="Rs."
          value={planner.lpBudgetCap}
          onChange={(v) => planner.update({ lpBudgetCap: v })}
          min={200000}
          max={700000}
          step={5000}
          accent={ACCENT}
          formatValue={(value) => `Rs. ${value.toLocaleString()}`}
        />
      </Section>

      <Section title="Role salaries (Q8)" icon="account-tie-outline" accent={ACCENT}>
        {roles.map((role) => (
          <SliderRow
            key={role.id}
            plain
            label={role.label}
            unit="Rs./mo"
            value={role.salary}
            onChange={(value) => setSalary(role.id, value)}
            min={15000}
            max={80000}
            step={1000}
            accent={ACCENT}
            description={role.note}
            formatValue={(value) => `Rs. ${value.toLocaleString()}`}
          />
        ))}
      </Section>

      <Section title="Optimal staff allocation" icon="table" accent={ACCENT}>
        <DataTable columns={['Role', 'Qty', 'Salary', 'Monthly cost']} rows={roleRows} flexes={[2.2, 0.7, 1.3, 1.4]} />
      </Section>

      <Section title="Constraints satisfied" icon="check-decagram-outline" accent={ACCENT}>
        <ConstraintList items={constraints} />
      </Section>

      {results.totalStaffCost <= planner.lpBudgetCap ? (
        <ResultBox type="ok">
          Optimal staff cost Rs. {results.totalStaffCost.toLocaleString()}, leaving Rs. {(planner.lpBudgetCap - results.totalStaffCost).toLocaleString()} slack under cap.
        </ResultBox>
      ) : (
        <ResultBox type="warn">
          Staff cost Rs. {results.totalStaffCost.toLocaleString()} exceeds cap by Rs. {(results.totalStaffCost - planner.lpBudgetCap).toLocaleString()}. Reduce salaries, lower age mix, or raise cap.
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
