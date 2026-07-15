import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';

export default function PhaseRoadmap({ phases, accent = '#3d6ea5' }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.container}
    >
      {phases.map((phase, i) => (
        <View
          key={i}
          style={[styles.card, { borderTopColor: phase.color || accent }]}
        >
          <Text style={styles.phase}>{phase.phase}</Text>
          <Text style={styles.time}>{phase.time}</Text>
          <Text style={styles.actions}>{phase.actions}</Text>
          <Text style={[styles.cost, { color: phase.color || accent }]}>
            Rs. {phase.cost.toLocaleString()}
          </Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 10,
    marginBottom: 4,
  },
  container: {
    paddingRight: 20,
    gap: 10,
  },
  card: {
    width: 190,
    backgroundColor: '#ffffff',
    borderRadius: 20,
    padding: 14,
    borderTopWidth: 4,
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderTopColor: '#eef0f3',
  },
  phase: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontSize: 13,
    fontWeight: '600',
    color: '#232a2e',
    marginBottom: 2,
  },
  time: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 10.5,
    color: '#6b7178',
    marginBottom: 7,
  },
  actions: {
    fontSize: 11,
    color: '#6b7178',
    lineHeight: 16.5,
    marginBottom: 8,
    minHeight: 48,
  },
  cost: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontSize: 12.5,
    fontWeight: '700',
  },
});
