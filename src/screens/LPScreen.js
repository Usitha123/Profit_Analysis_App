import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import {
  AGE_GROUPS,
  MKT_CHANNELS,
  ROADMAP,
  STAFFING_REFERENCE,
  STAFF_ROLES,
  TUITION_RATE,
} from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import CheckRow from '../components/CheckRow';
import ResultBox, { SectionTitle } from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import PhaseRoadmap from '../components/PhaseRoadmap';
import { StackedBar } from '../components/GaugeBar';
import InfoBox from '../components/InfoBox';
import ConstraintList from '../components/ConstraintList';
import DataTable from '../components/DataTable';
import ReferenceStrip from '../components/ReferenceStrip';

const { calculateStaffing } = require('../utils/calculations');

const ACCENT = COLORS.accentLP;

export default function LPScreen() {
  const insets = useSafeAreaInsets();
  const [children, setChildren] = useState({
    infant: 5,
    toddler: 8,
    preschool: 10,
    schoolage: 7,
  });
  const [budgetCap, setBudgetCap] = useState(420000);
  const [roles, setRoles] = useState(STAFF_ROLES.map((role) => ({ ...role })));
  const [channels, setChannels] = useState(MKT_CHANNELS.map((channel) => ({ ...channel })));

  const updateSalary = useCallback((id, salary) => {
    setRoles((current) => current.map((role) => (role.id === id ? { ...role, salary } : role)));
  }, []);

  const toggleChannel = useCallback((id) => {
    setChannels((current) => current.map((channel) => (channel.id === id ? { ...channel, active: !channel.active } : channel)));
  }, []);

  const updateChannelCost = useCallback((id, cost) => {
    setChannels((current) => current.map((channel) => (channel.id === id ? { ...channel, cost } : channel)));
  }, []);

  const results = useMemo(() => {
    const staffingBase = calculateStaffing({
      children,
      ageGroups: AGE_GROUPS,
      staffRoles: [],
      marketingChannels: channels,
      budgetCap,
    });

    const infantGroup = staffingBase.staffByGroup.find((group) => group.id === 'infant');
    const toddlerGroup = staffingBase.staffByGroup.find((group) => group.id === 'toddler');
    const preschoolGroup = staffingBase.staffByGroup.find((group) => group.id === 'preschool');
    const schoolAgeGroup = staffingBase.staffByGroup.find((group) => group.id === 'schoolage');
    const teacherCount = (preschoolGroup?.staffNeeded || 0) + (schoolAgeGroup?.staffNeeded || 0);

    const roleAllocations = roles.map((role) => {
      let required = role.required;
      if (role.id === 'teacher') required = teacherCount;
      if (role.id === 'baby') required = infantGroup?.staffNeeded || 0;
      if (role.id === 'helper') required = toddlerGroup?.staffNeeded || 0;
      const monthlyCost = required * role.salary;
      return { ...role, required, monthlyCost };
    });

    const totalStaff = roleAllocations.reduce((sum, role) => sum + role.required, 0);
    const totalStaffCost = roleAllocations.reduce((sum, role) => sum + role.monthlyCost, 0);
    const marketingCost = channels.filter((channel) => channel.active).reduce((sum, channel) => sum + channel.cost, 0);
    const projectedRevenue = staffingBase.totalChildren * TUITION_RATE;
    const totalCost = totalStaffCost + marketingCost;

    return {
      ...staffingBase,
      roleAllocations,
      totalStaff,
      totalStaffCost,
      marketingCost,
      totalCost,
      projectedRevenue,
      budgetGap: budgetCap - totalCost,
      overBudget: totalCost > budgetCap,
    };
  }, [budgetCap, channels, children, roles]);

  const constraints = useMemo(() => ([
    {
      label: `Infant ratio 1:3 -> need at least ${Math.ceil((children.infant || 0) / 3)} caretaker(s)`,
      ok: (results.roleAllocations.find((role) => role.id === 'baby')?.required || 0) >= Math.ceil((children.infant || 0) / 3),
    },
    {
      label: `Toddler ratio 1:5 -> need at least ${Math.ceil((children.toddler || 0) / 5)} helper(s)`,
      ok: (results.roleAllocations.find((role) => role.id === 'helper')?.required || 0) >= Math.ceil((children.toddler || 0) / 5),
    },
    {
      label: `Pre-school ratio 1:8 and school-age ratio 1:12 are covered by shared teacher allocation`,
      ok: true,
    },
    {
      label: `Budget cap Rs. ${budgetCap.toLocaleString()} vs total staffing + marketing Rs. ${results.totalCost.toLocaleString()}`,
      ok: !results.overBudget,
    },
  ]), [budgetCap, children.infant, children.toddler, results.overBudget, results.roleAllocations, results.totalCost]);

  const roleRows = results.roleAllocations.map((role) => ([
    role.label,
    String(role.required),
    `Rs. ${role.salary.toLocaleString()}`,
    `Rs. ${role.monthlyCost.toLocaleString()}`,
  ]));

  roleRows.push([
    'Total',
    String(results.totalStaff),
    '',
    `Rs. ${results.totalStaffCost.toLocaleString()}`,
  ]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 26 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        This model finds the minimum practical staffing plan for your age mix, then checks whether the
        planned salaries and marketing mix still fit your monthly launch budget.
      </Text>

      <View style={styles.metrics}>
        <MetricCard label="Children" value={results.totalChildren} accent={ACCENT} />
        <MetricCard label="Total staff" value={results.totalStaff} subtitle="all roles combined" accent={ACCENT} />
        <MetricCard label="Staff cost" value={`Rs. ${results.totalStaffCost.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Projected revenue" value={`Rs. ${results.projectedRevenue.toLocaleString()}`} subtitle="tuition only" accent={ACCENT} />
      </View>

      <InfoBox
        title="Variables to determine"
        accent={ACCENT}
        items={[
          { label: 'Child mix:', text: 'Set expected infants, toddlers, pre-school, and school-age enrolment.' },
          { label: 'Role salaries:', text: 'Replace the salary defaults with your actual hiring estimates.' },
          { label: 'Marketing mix:', text: 'Enable only the channels you plan to run in the first months.' },
          { label: 'Budget cap:', text: 'Use the monthly operating ceiling you can sustain before scale-up.' },
        ]}
      />

      <SectionTitle accent={ACCENT}>How the staffing logic works</SectionTitle>
      <EquationBox accent={ACCENT}>
        Required staff = ceil(children / ratio)
        {'\n'}
        Total staffing cost = sum(role count x monthly salary)
      </EquationBox>

      {AGE_GROUPS.map((group) => (
        <SliderRow
          key={group.id}
          label={group.label}
          unit="children"
          value={children[group.id]}
          onChange={(value) => setChildren((current) => ({ ...current, [group.id]: value }))}
          min={0}
          max={40}
          step={1}
          accent={group.color}
          description={`Target ratio 1:${group.ratio}`}
        />
      ))}

      <SectionTitle accent={ACCENT}>Role salaries</SectionTitle>
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

      <SectionTitle accent={ACCENT}>Optimal staffing plan</SectionTitle>
      <DataTable
        columns={['Role', 'Qty', 'Salary', 'Monthly cost']}
        rows={roleRows}
        flexes={[2.4, 0.8, 1.2, 1.3]}
      />

      <SectionTitle accent={ACCENT}>Constraint check</SectionTitle>
      <ConstraintList items={constraints} />

      <SectionTitle accent={ACCENT}>Marketing channels</SectionTitle>
      {channels.map((channel) => (
        <CheckRow
          key={channel.id}
          label={`${channel.label} (${channel.enrollments} projected enrolments)`}
          checked={channel.active}
          onToggle={() => toggleChannel(channel.id)}
          value={channel.cost}
          onChangeValue={(value) => updateChannelCost(channel.id, value)}
          unit="Rs./mo"
          accent={ACCENT}
        />
      ))}

      <SliderRow
        label="Monthly operating budget cap"
        unit="Rs."
        value={budgetCap}
        onChange={setBudgetCap}
        min={150000}
        max={900000}
        step={10000}
        accent={ACCENT}
        formatValue={(value) => `Rs. ${value.toLocaleString()}`}
      />

      {results.overBudget ? (
        <ResultBox type="warn">
          Total staffing and marketing cost is Rs. {results.totalCost.toLocaleString()}, which exceeds the
          cap by Rs. {Math.abs(results.budgetGap).toLocaleString()}. Reduce salaries, trim channels, or
          lower the opening age mix.
        </ResultBox>
      ) : (
        <ResultBox type="ok">
          Total staffing and marketing cost is Rs. {results.totalCost.toLocaleString()}, leaving
          Rs. {results.budgetGap.toLocaleString()} of monthly slack before launch.
        </ResultBox>
      )}

      <SectionTitle accent={ACCENT}>Cost split</SectionTitle>
      <StackedBar
        segments={[results.totalStaffCost, results.marketingCost]}
        colors={[ACCENT, '#c0574f']}
        labels={[
          `Staffing: Rs. ${results.totalStaffCost.toLocaleString()}`,
          `Marketing: Rs. ${results.marketingCost.toLocaleString()}`,
        ]}
      />

      <ReferenceStrip
        title="Reference examples"
        items={STAFFING_REFERENCE}
        accent={ACCENT}
      />

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
});
