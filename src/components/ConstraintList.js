import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';

export default function ConstraintList({ items }) {
  return (
    <View style={styles.wrap}>
      {items.map((item, index) => {
        const color = item.ok ? COLORS.textSuccess : COLORS.textDanger;
        return (
          <View key={item.label} style={[styles.row, index === items.length - 1 && styles.lastRow]}>
            <Text style={styles.label}>{item.label}</Text>
            <View style={styles.status}>
              <MaterialCommunityIcons
                name={item.ok ? 'check-circle' : 'alert-circle'}
                size={16}
                color={color}
              />
              <Text style={[styles.value, { color }]}>{item.ok ? 'Met' : 'Exceeded'}</Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: COLORS.backgroundElevated,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 20,
    overflow: 'hidden',
    marginVertical: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderTertiary,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  label: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: COLORS.textPrimary,
  },
  status: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 12,
    fontWeight: '700',
  },
});
