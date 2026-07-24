import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../constants/theme';

export default function InfoBox({ title, items, accent = COLORS.accentLP }) {
  return (
    <View style={[styles.box, { borderLeftColor: accent }]}>
      <Text style={styles.title}>{title}</Text>
      {items.map((item) => (
        <Text key={item.label} style={styles.item}>
          <Text style={styles.label}>{item.label}</Text>
          <Text style={styles.text}> {item.text}</Text>
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: COLORS.backgroundElevated,
    borderLeftWidth: 4,
    borderRadius: 12,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  item: {
    fontSize: 12.5,
    lineHeight: 20,
    color: COLORS.textSecondary,
    marginBottom: 6,
  },
  label: {
    color: COLORS.textPrimary,
    fontWeight: '700',
  },
  text: {
    color: COLORS.textSecondary,
  },
});
