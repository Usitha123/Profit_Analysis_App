import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS, RADIUS } from '../constants/theme';

export default function ResultBox({ type, children }) {
  const isOk = type === 'ok';
  return (
    <View style={[styles.box, isOk ? styles.ok : styles.warn]}>
      <View style={[styles.iconWrap, { backgroundColor: isOk ? '#c5eed3' : '#f7dea6' }]}>
        <MaterialCommunityIcons
          name={isOk ? 'check' : 'alert-outline'}
          size={16}
          color={isOk ? COLORS.textSuccess : COLORS.textWarning}
        />
      </View>
      <Text style={[styles.text, isOk ? styles.okText : styles.warnText]}>
        {children}
      </Text>
    </View>
  );
}

export function SectionTitle({ children, accent = COLORS.accentLP, icon }) {
  return (
    <View style={styles.sectionTitle}>
      {icon ? (
        <View style={[styles.sectionIcon, { backgroundColor: `${accent}18` }]}>
          <MaterialCommunityIcons name={icon} size={14} color={accent} />
        </View>
      ) : (
        <View style={[styles.sectionDot, { backgroundColor: accent }]} />
      )}
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: RADIUS.lg,
    padding: 14,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  ok: { backgroundColor: COLORS.backgroundSuccess },
  warn: { backgroundColor: COLORS.backgroundWarning },
  iconWrap: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  text: { flex: 1, fontSize: 13, lineHeight: 20 },
  okText: { color: COLORS.textSuccess },
  warnText: { color: COLORS.textWarning },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 26,
    marginBottom: 12,
  },
  sectionDot: { width: 7, height: 7, borderRadius: 3.5 },
  sectionIcon: {
    width: 22, height: 22, borderRadius: 7,
    alignItems: 'center', justifyContent: 'center',
  },
  sectionText: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textPrimary,
    letterSpacing: -0.3,
  },
});
