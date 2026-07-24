import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ReferenceStrip({ title, items, accent = COLORS.accentLP }) {
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={[styles.card, { borderLeftColor: accent }]}>
            <View style={[styles.iconWrap, { backgroundColor: `${accent}18` }]}>
              <MaterialCommunityIcons name={item.icon || 'lightbulb-outline'} size={16} color={accent} />
            </View>
            <View style={styles.cardText}>
              <Text style={styles.cardLabel}>{item.label}</Text>
              <Text style={styles.cardValue}>{item.value}</Text>
            </View>
          </View>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginVertical: 10,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: 8,
  },
  grid: {
    gap: 10,
  },
  card: {
    flexDirection: 'row',
    gap: 10,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 12,
    backgroundColor: COLORS.backgroundElevated,
    padding: 12,
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardText: {
    flex: 1,
  },
  cardLabel: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  cardValue: {
    marginTop: 2,
    fontSize: 11.5,
    lineHeight: 18,
    color: COLORS.textSecondary,
  },
});
