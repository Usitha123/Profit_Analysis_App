import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';

export default function EquationBox({ children, accent = '#3d6ea5' }) {
  return (
    <View style={[styles.box, { borderLeftColor: accent }]}>
      <Text style={styles.text}>{children}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: '#f6f2e8',
    borderLeftWidth: 3,
    borderRadius: 10,
    padding: 11,
    paddingHorizontal: 15,
    marginVertical: 14,
  },
  text: {
    fontSize: 12.5,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#232a2e',
    lineHeight: 21,
  },
});
