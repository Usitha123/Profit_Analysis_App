import React, { useMemo } from 'react';
import {
  View, Text, StyleSheet, Platform,
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
      if (looksNumeric(s)) result[c] = 'right';
      break;
    }
  }
  return result;
}

/**
 * Fixed-width table: columns are flex fractions of the parent, so header and
 * body cells always share the same edges. Long text wraps rather than
 * scrolling sideways - horizontal scrolling pushed the first column off screen
 * on narrow phones and broke the header/body alignment.
 */
export default function DataTable({ columns, rows, flexes, aligns }) {
  const columnCount = columns.length;
  const columnAligns = useMemo(
    () => deriveAlignments(rows, columnCount, aligns),
    [rows, columnCount, aligns],
  );

  const columnFlex = (index) => ({ flex: flexes?.[index] || 1 });

  return (
    <View style={styles.table}>
      <View style={styles.headerRow}>
        {columns.map((column, index) => (
          <Text
            key={column}
            style={[
              styles.headerCell,
              columnFlex(index),
              { textAlign: columnAligns[index] },
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
            const isNumeric = align === 'right';
            return (
              <Text
                key={`${rowIndex}-${cellIndex}`}
                style={[
                  styles.bodyCell,
                  isNumeric ? styles.bodyCellNumeric : null,
                  columnFlex(cellIndex),
                  { textAlign: align },
                ]}
              >
                {cell}
              </Text>
            );
          })}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    width: '100%',
    marginVertical: 10,
    borderWidth: 1,
    borderColor: COLORS.borderSecondary,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.backgroundElevated,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  headerCell: {
    paddingHorizontal: 3,
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  bodyRow: {
    flexDirection: 'row',
    // Top-aligned so a wrapped label keeps its first line level with the
    // figures beside it.
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderTertiary,
    paddingHorizontal: 5,
    paddingVertical: 10,
  },
  lastRow: {
    borderBottomWidth: 0,
  },
  bodyCell: {
    paddingHorizontal: 3,
    fontSize: 11.5,
    lineHeight: 16,
    color: COLORS.textPrimary,
  },
  bodyCellNumeric: {
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    fontVariant: ['tabular-nums'],
    // Monospace runs wide; a smaller step keeps amounts on one line at 360dp.
    fontSize: 10.5,
  },
});
