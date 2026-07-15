import React, { useState, useCallback, useMemo } from 'react';
import {
  View, Text, ScrollView, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../constants/theme';
import { AGE_GROUPS, MKT_CHANNELS, ROADMAP, TUITION_RATE, OPERATING_WEEKS } from '../constants/modelData';
import MetricCard from '../components/MetricCard';
import SliderRow from '../components/SliderRow';
import CheckRow from '../components/CheckRow';
import { SectionTitle } from '../components/ResultBox';
import EquationBox from '../components/EquationBox';
import PhaseRoadmap from '../components/PhaseRoadmap';
import { StackedBar } from '../components/GaugeBar';

const ACCENT = COLORS.accentLP;

export default function LPScreen() {
  const insets = useSafeAreaInsets();
  const [children, setChildren] = useState({
    infant: 4,
    toddler: 8,
    preschool: 12,
    schoolage: 6,
  });

  const [channels, setChannels] = useState(
    MKT_CHANNELS.map((c) => ({ ...c }))
  );

  const [budget, setBudget] = useState(22000);

  const toggleChannel = useCallback((id) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
  }, []);

  const updateChannelCost = useCallback((id, val) => {
    setChannels((prev) =>
      prev.map((c) => (c.id === id ? { ...c, cost: val } : c))
    );
  }, []);

  const results = useMemo(() => {
    let totalChildren = 0;
    const staffByGroup = AGE_GROUPS.map((g) => {
      const count = children[g.id] || 0;
      totalChildren += count;
      const staffNeeded = Math.ceil(count / g.ratio);
      const staffCost = staffNeeded * g.rate * OPERATING_WEEKS;
      return { ...g, count, staffNeeded, staffCost };
    });

    const totalStaff = staffByGroup.reduce((s, g) => s + g.staffNeeded, 0);
    const totalStaffCost = staffByGroup.reduce((s, g) => s + g.staffCost, 0);

    const activeChannels = channels.filter((c) => c.active);
    const mktCost = activeChannels.reduce((s, c) => s + c.cost, 0);
    const mktEnroll = activeChannels.reduce((s, c) => s + c.enrollments, 0);

    const totalCost = totalStaffCost + mktCost;
    const projectedRevenue = totalChildren * TUITION_RATE;

    return {
      totalChildren,
      staffByGroup,
      totalStaff,
      totalStaffCost,
      mktCost,
      mktEnroll,
      totalCost,
      projectedRevenue,
      overBudget: totalCost > budget,
    };
  }, [children, channels, budget]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.intro}>
        Optimise staffing levels based on child-to-carer ratios, enrolment numbers,
        and marketing channels. Adjust the parameters below to see the optimal staffing plan.
      </Text>

      {/* Metrics Grid */}
      <View style={styles.grid3}>
        <MetricCard label="Total Children" value={results.totalChildren} accent={ACCENT} />
        <MetricCard label="Staff Needed" value={results.totalStaff} accent={ACCENT} />
        <MetricCard label="Staff Cost" value={`Rs. ${results.totalStaffCost.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Budget" value={`Rs. ${budget.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Marketing Cost" value={`Rs. ${results.mktCost.toLocaleString()}`} accent={ACCENT} />
        <MetricCard label="Revenue" value={`Rs. ${results.projectedRevenue.toLocaleString()}`} accent={ACCENT} />
      </View>

      {/* Age Group Sliders */}
      <SectionTitle accent={ACCENT}>Children by Age Group</SectionTitle>
      <EquationBox accent={ACCENT}>
        Staff needed = ceil(children / ratio)  |  Staff cost = staff × rate × 48 weeks
      </EquationBox>

      {AGE_GROUPS.map((g) => (
        <SliderRow
          key={g.id}
          label={g.label}
          unit="children"
          value={children[g.id]}
          onChange={(v) => setChildren((prev) => ({ ...prev, [g.id]: v }))}
          min={0}
          max={20}
          step={1}
          accent={ACCENT}
          suffix=""
        />
      ))}

      {/* Staffing Summary */}
      <View style={styles.grid2}>
        {results.staffByGroup.map((g) => (
          <MetricCard
            key={g.id}
            label={`${g.label.split('(')[0].trim()} Staff`}
            value={`${g.staffNeeded} staff`}
            subtitle={`Rs. ${g.staffCost.toLocaleString()}`}
            accent={g.color}
          />
        ))}
      </View>

      {/* Marketing Channels */}
      <SectionTitle accent={ACCENT}>Marketing Channels</SectionTitle>
      {channels.map((c) => (
        <CheckRow
          key={c.id}
          label={`${c.label} (${c.enrollments} enrollments)`}
          checked={c.active}
          onToggle={() => toggleChannel(c.id)}
          value={c.cost}
          onChangeValue={(val) => updateChannelCost(c.id, val)}
          unit="Rs./mo"
          accent={ACCENT}
        />
      ))}

      {/* Budget */}
      <SliderRow
        label="Monthly Staff Budget"
        unit="Rs."
        value={budget}
        onChange={setBudget}
        min={5000}
        max={50000}
        step={500}
        accent={ACCENT}
        formatValue={(v) => `Rs. ${v.toLocaleString()}`}
      />

      {/* Result */}
      {results.overBudget ? (
        <View style={styles.resultWarn}>
          <Text style={styles.warnText}>
            ⚠ Total cost (${results.totalCost.toLocaleString()}) exceeds budget (${budget.toLocaleString()}) 
            by ${(results.totalCost - budget).toLocaleString()}. Reduce staffing or marketing.
          </Text>
        </View>
      ) : (
        <View style={styles.resultOk}>
          <Text style={styles.okText}>
            ✓ Total cost (${results.totalCost.toLocaleString()}) is within budget (${budget.toLocaleString()}).
            Surplus: ${(budget - results.totalCost).toLocaleString()}
          </Text>
        </View>
      )}

      {/* Cost Breakdown */}
      <SectionTitle accent={ACCENT}>Cost Breakdown</SectionTitle>
      <StackedBar
        segments={[results.totalStaffCost, results.mktCost]}
        colors={[ACCENT, '#a8c4e0']}
        labels={[`Staff: Rs. ${results.totalStaffCost.toLocaleString()}`, `Marketing: Rs. ${results.mktCost.toLocaleString()}`]}
      />

      {/* Roadmap */}
      <SectionTitle accent={ACCENT}>Phase Roadmap</SectionTitle>
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
    padding: 26,
  },
  intro: {
    fontSize: 13.5,
    color: '#6b7178',
    lineHeight: 22,
    marginBottom: 16,
  },
  grid2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  grid3: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  resultOk: {
    backgroundColor: '#eaf6ee',
    borderRadius: 10,
    padding: 13,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#bfe2ca',
  },
  resultWarn: {
    backgroundColor: '#fdf3e2',
    borderRadius: 10,
    padding: 13,
    paddingHorizontal: 16,
    marginTop: 12,
    borderWidth: 1.5,
    borderColor: '#f0dcae',
  },
  okText: {
    color: '#2f7a4f',
    fontSize: 13,
    lineHeight: 20,
  },
  warnText: {
    color: '#a06a12',
    fontSize: 13,
    lineHeight: 20,
  },
});
