import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function ResultBox({ type, children }) {
  const isOk = type === 'ok';
  return (
    <View
      style={[
        styles.box,
        isOk ? styles.ok : styles.warn,
      ]}
    >
      <Text style={[styles.text, isOk ? styles.okText : styles.warnText]}>
        {children}
      </Text>
    </View>
  );
}

export function SectionTitle({ children, accent = '#3d6ea5' }) {
  return (
    <View style={styles.sectionTitle}>
      <View style={[styles.dot, { backgroundColor: accent }]} />
      <Text style={styles.sectionText}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    borderRadius: 10,
    padding: 13,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  ok: {
    backgroundColor: '#eaf6ee',
    borderWidth: 1.5,
    borderColor: '#bfe2ca',
  },
  warn: {
    backgroundColor: '#fdf3e2',
    borderWidth: 1.5,
    borderColor: '#f0dcae',
  },
  text: {
    fontSize: 13,
    lineHeight: 20,
  },
  okText: {
    color: '#2f7a4f',
  },
  warnText: {
    color: '#a06a12',
  },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
    marginBottom: 10,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  sectionText: {
    fontFamily: Platform.OS === 'ios' ? 'System' : 'sans-serif-medium',
    fontSize: 15,
    fontWeight: '600',
    color: '#232a2e',
  },
});
