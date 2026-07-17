import React, { useMemo } from 'react';
import {
  ScrollView, View, Text, StyleSheet, Platform,
} from 'react-native';
import { COLORS } from '../constants/theme';

const NUMERIC_HINT = /^(rs\.?\s*)?[\-+]?[\d.,()%kmM\s\-]+$/i;

function looksNumeric(v) {
  if (v == null) return false;
  const s = String(v).trim();
  if (!s) return false;
  return NUMERIC_HINT.test(s);
}

// Per-column alignment inferred from the first non-empty body row.
// Numeric-looking cells right-align, everything else left-aligns.
// Caller can override with `aligns` array of 'left'|'right'|'center'.
function deriveAlignments(rows, columnCount, override) {
  if (Array.isArray(override) && override.length === columnCount) return override;
  const result = new Array(columnCount).fill('left');
  for (let c = 0; c < columnCount; c += 1) {
    for (let r = 0; r < rows.length; r += 1) {
      const cell = rows[r]?.[c];
      const s = cell == null ? '' : String(cell).trim();
      if (!s) continue;
      if (looksNumeric(s)) result[c] = 'left';
      break;
    }
  }
  return result;
}

export default function DataTable({ columns, rows, flexes, aligns }) {
  const columnCount = columns.length;
  const columnAligns = useMemo(
    () => deriveAlignments(rows, columnCount, aligns),
    [rows, columnCount, aligns],
  );

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.scroll}>
      <View style={styles.table}>
        <View style={styles.headerRow}>
          {columns.map((column, index) => (
            <Text
              key={column}
              style={[
                styles.headerCell,
                { flex: flexes?.[index] || 1, textAlign: columnAligns[index] },
              ]}
            >
              {column}
            </Text>
          ))}
        </View>
        {rows.map((row, rowIndex) => (
          <View
            key={`row-${rowIndex}`}
            style={[styles.bodyRow, rowIndex === rows.length - 1 && styles.lastRow]}
          >
            {row.map((cell, cellIndex) => {
              const align = columnAligns[cellIndex] || 'left';
              const isNumeric = align !== 'left';
              return (
                <Text
                  key={`${rowIndex}-${cellIndex}`}
                  style={[
                    styles.bodyCell,
                    isNumeric ? styles.bodyCellNumeric : null,
                    { flex: flexes?.[cellIndex] || 1, textAlign: align },
                  ]}
                  numberOfLines={2}
                >
                  {cell}
                </Text>
              );
            })}
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
    alignItems: 'center',
    minHeight: 44,
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
  bodyCellNumeric: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontVariant: ['tabular-nums'],
    fontSize: 12,
    letterSpacing: 0.1,
  },
});
