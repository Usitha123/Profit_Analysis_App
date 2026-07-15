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
      <View style={styles.head}>
        <Switch
          value={checked}
          onValueChange={onToggle}
          trackColor={{ false: '#e6e0d0', true: `${accent}66` }}
          thumbColor={checked ? accent : '#f4f3f4'}
          ios_backgroundColor="#e6e0d0"
        />
        <Text style={styles.label}>{label}</Text>
      </View>
      {value !== undefined ? (
        <View style={styles.tail}>
          <TextInput
            style={styles.input}
            value={String(value)}
            onChangeText={(t) => {
              if (onChangeValue) onChangeValue(Number(t) || 0);
            }}
            keyboardType="numeric"
          />
          {unit ? <Text style={styles.unit}>{unit}</Text> : null}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    gap: 10,
    marginBottom: 12,
    minHeight: 44,
    justifyContent: 'center',
  },
  head: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    minHeight: 44,
  },
  tail: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 48,
  },
  label: {
    fontSize: 13,
    lineHeight: 18,
    color: '#232a2e',
    flex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: '#d8d1bf',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
    fontSize: 13,
    fontFamily: Platform.OS === 'ios' ? 'Courier New' : 'monospace',
    color: '#232a2e',
    backgroundColor: '#fff',
    width: 100,
    minHeight: 40,
    textAlign: 'right',
  },
  unit: {
    fontSize: 11.5,
    color: '#6b7178',
  },
});
