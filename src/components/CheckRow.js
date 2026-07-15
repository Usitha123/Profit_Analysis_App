import React from 'react';
import { View, Text, Switch, TextInput, StyleSheet, Platform } from 'react-native';

export default function CheckRow({
  label,
  checked,
  onToggle,
  value,
  onChangeValue,
  unit,
  accent = '#3d6ea5',
}) {
  return (
    <View style={styles.row}>
      <Switch
        value={checked}
        onValueChange={onToggle}
        trackColor={{ false: '#e6e0d0', true: `${accent}66` }}
        thumbColor={checked ? accent : '#f4f3f4'}
        style={{ transform: [{ scaleX: 0.8 }, { scaleY: 0.8 }] }}
      />
      <Text style={styles.label}>{label}</Text>
      {value !== undefined && (
        <>
          <TextInput
            style={styles.input}
            value={String(value)}
            onChangeText={(t) => {
              if (onChangeValue) {
                onChangeValue(Number(t) || 0);
              }
            }}
            keyboardType="numeric"
          />
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 9,
  },
  label: {
    fontSize: 13,
    color: '#232a2e',
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 4,
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#232a2e',
    backgroundColor: '#fff',
    width: 80,
    textAlign: 'right',
  },
  unit: {
    fontSize: 11.5,
    color: '#6b7178',
  },
});
