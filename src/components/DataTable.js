import React from 'react';
import {
  ScrollView, View, Text, StyleSheet,
} from 'react-native';
import { COLORS } from '../constants/theme';

export default function DataTable({ columns, rows, flexes }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((column, index) => (
            <Text key={column} style={[styles.headerCell, { flex: flexes?.[index] || 1 }]}>
              {column}
            </Text>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.bodyRow, rowIndex === rows.length - 1 && styles.lastRow]}
          >
            {row.map((cell, cellIndex) => (
              <Text key={`${rowIndex}-${cellIndex}`} style={[styles.bodyCell, { flex: flexes?.[cellIndex] || 1 }]}>
                {cell}
              </Text>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scroll: {
    marginVertical: 10,
  },
  table: {
    minWidth: 320,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundElevated,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: COLORS.backgroundSecondary,
  },
  headerCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  bodyRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderTertiary,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  bodyCell: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 12.5,
    color: COLORS.textPrimary,
  },
});
